// Terminal Docker interactif — API route.
// Gère le cycle de vie d'un conteneur sandbox et l'exécution de commandes.
// Activé par la variable d'environnement DOCKER_TERMINAL=true.

export const runtime = "nodejs";

import Docker from "dockerode";

/** Crée une connexion Docker adaptée à la plateforme. */
function createDocker(): Docker {
  // 1. Variable d'env explicite (prioritaire)
  //    Exemples :
  //    DOCKER_HOST=tcp://127.0.0.1:2375          (Docker Desktop TCP)
  //    DOCKER_HOST=unix:///var/run/docker.sock    (Linux / WSL)
  //    DOCKER_HOST=npipe:////./pipe/docker_engine (Docker Desktop named pipe)
  if (process.env.DOCKER_HOST) {
    const host = process.env.DOCKER_HOST;
    if (host.startsWith("tcp://")) {
      const url = new URL(host);
      return new Docker({ host: url.hostname, port: Number(url.port) || 2375 });
    }
    if (host.startsWith("unix://")) {
      return new Docker({ socketPath: host.replace("unix://", "") });
    }
    return new Docker({ socketPath: host.replace("npipe://", "") });
  }

  // 2. Windows : named pipe Docker Desktop
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }

  // 3. Linux/macOS : socket Unix par défaut
  return new Docker({ socketPath: "/var/run/docker.sock" });
}

const docker = createDocker();

// Sessions actives : sessionId → containerId
const sessions = new Map<string, string>();

// Image Docker-in-Docker : chaque session embarque SON PROPRE démon Docker.
// Tout ce que l'apprenant crée (conteneurs, volumes, réseaux, images) vit À
// L'INTÉRIEUR du sandbox et disparaît quand la session est supprimée. Rien ne
// fuit vers le Docker Desktop de l'hôte → plus de prolifération.
const SANDBOX_IMAGE = "docker:dind";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min
const DAEMON_WAIT_TIMEOUT = 60_000; // attente max du démon interne

interface TerminalRequest {
  action: "start" | "exec" | "stop" | "build";
  sessionId?: string;
  command?: string;
  dockerfile?: string;
}

interface TerminalResponse {
  ok: boolean;
  sessionId?: string;
  output?: string;
  error?: string;
}

function isEnabled(): boolean {
  return process.env.DOCKER_TERMINAL === "true";
}

/** Pull l'image du sandbox si elle n'est pas déjà présente localement. */
async function ensureImage(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
  } catch {
    await new Promise<void>((resolve, reject) => {
      docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err2: Error | null) => {
          if (err2) reject(err2);
          else resolve();
        });
      });
    });
  }
}

/** Exécute une commande shell dans un conteneur et renvoie sa sortie nettoyée. */
async function runInContainer(containerId: string, command: string): Promise<string> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ["sh", "-c", command],
    AttachStdout: true,
    AttachStderr: true,
    WorkingDir: "/workspace",
  });
  const stream = await exec.start({ Detach: false, Tty: false });
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      resolve(raw.replace(/[\x00-\x08\x0e-\x1f]/g, ""));
    });
    stream.on("error", reject);
  });
}

/** Attend que le démon Docker interne (dind) réponde. */
async function waitForInnerDaemon(containerId: string): Promise<void> {
  const deadline = Date.now() + DAEMON_WAIT_TIMEOUT;
  while (Date.now() < deadline) {
    const out = await runInContainer(containerId, "docker info >/dev/null 2>&1 && echo READY || echo WAIT");
    if (out.includes("READY")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Le démon Docker interne n'a pas démarré à temps.");
}

// Images légères référencées par les exercices : on les pré-tire dans le dind
// pour que `docker run --rm node:22 ...`, `docker run -d nginx`, etc.
// fonctionnent immédiatement sans dépendre d'un exercice précédent.
// (Les grosses images comme postgres:16 sont tirées à la volée au besoin,
// le dind ayant accès au réseau.)
const SEED_IMAGES = [
  "alpine",
  "busybox",
  "hello-world",
  "nginx",
  "nginx:alpine",
  "node:22",
  "node:22-alpine",
  "ubuntu:24.04",
  "redis:7",
];

/**
 * Pré-tire les images légères DANS le sandbox, en tâche de fond.
 * On ne bloque pas le démarrage de la session : chaque pull est indépendant
 * et les échecs (réseau) sont ignorés (`|| true`).
 */
async function seedImages(containerId: string): Promise<void> {
  const pulls = SEED_IMAGES.map(
    (img) => `docker pull ${img} >/dev/null 2>&1 || true`,
  ).join(" & ");
  // Lancés en parallèle (&) puis on rend la main sans attendre la fin.
  await runInContainer(containerId, `(${pulls}) >/dev/null 2>&1 &`);
}

async function startSession(): Promise<TerminalResponse> {
  const sessionId = crypto.randomUUID();

  try {
    await ensureImage(SANDBOX_IMAGE);

    const container = await docker.createContainer({
      Image: SANDBOX_IMAGE,
      // dind lance automatiquement son propre dockerd via l'entrypoint.
      Tty: true,
      OpenStdin: true,
      WorkingDir: "/workspace",
      Env: [
        // Pas de TLS : usage strictement local, démon accessible en local socket.
        "DOCKER_TLS_CERTDIR=",
      ],
      HostConfig: {
        // dind exige le mode privilégié pour gérer son propre démon.
        Privileged: true,
        // AUCUN bind du socket hôte : isolation totale, rien ne fuit sur l'hôte.
        Memory: 1024 * 1024 * 1024, // 1 Go (un démon + quelques conteneurs légers)
        NanoCpus: 1_000_000_000, // 1 CPU
        AutoRemove: true,
      },
    });

    await container.start();
    sessions.set(sessionId, container.id);

    // Auto-cleanup après 30 min
    setTimeout(() => {
      void stopSession(sessionId);
    }, SESSION_TIMEOUT);

    // Attendre le démon interne puis pré-tirer les images de référence
    // en tâche de fond (n'empêche pas d'utiliser le terminal immédiatement).
    await waitForInnerDaemon(container.id);
    void seedImages(container.id).catch(() => {});

    return {
      ok: true,
      sessionId,
      output:
        "Session Docker isolée démarrée (bac à sable). Les images courantes (nginx, node, alpine...) se pré-téléchargent en arrière-plan.\n",
    };
  } catch (err) {
    // En cas d'échec après création, on nettoie le conteneur pour ne rien laisser.
    await stopSession(sessionId).catch(() => {});
    return {
      ok: false,
      error: `Impossible de démarrer le conteneur : ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function execCommand(sessionId: string, command: string): Promise<TerminalResponse> {
  const containerId = sessions.get(sessionId);
  if (!containerId) {
    return { ok: false, error: "Session introuvable. Redémarre le terminal." };
  }

  try {
    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ["sh", "-c", command],
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: "/workspace",
    });

    const stream = await exec.start({ Detach: false, Tty: false });

    // Collecte la sortie
    const output = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        // Docker multiplex : les 8 premiers octets de chaque frame sont le header
        // Pour simplifier, on nettoie les caractères de contrôle
        const clean = raw.replace(/[\x00-\x08\x0e-\x1f]/g, "");
        resolve(clean);
      });
      stream.on("error", reject);
    });

    return { ok: true, sessionId, output };
  } catch (err) {
    return {
      ok: false,
      error: `Erreur d'exécution : ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function buildDockerfile(sessionId: string, dockerfile: string): Promise<TerminalResponse> {
  const containerId = sessions.get(sessionId);
  if (!containerId) {
    return { ok: false, error: "Session introuvable. Redémarre le terminal." };
  }

  try {
    const container = docker.getContainer(containerId);

    // Write the Dockerfile and run docker build
    const cmd = `mkdir -p /workspace/build && cat > /workspace/build/Dockerfile << 'DOCKERFILE_EOF'\n${dockerfile}\nDOCKERFILE_EOF\ncd /workspace/build && docker build -t student-build .`;

    const exec = await container.exec({
      Cmd: ["sh", "-c", cmd],
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: "/workspace",
    });

    const stream = await exec.start({ Detach: false, Tty: false });

    const output = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        const clean = raw.replace(/[\x00-\x08\x0e-\x1f]/g, "");
        resolve(clean);
      });
      stream.on("error", reject);
    });

    return { ok: true, sessionId, output };
  } catch (err) {
    return {
      ok: false,
      error: `Erreur de build : ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function stopSession(sessionId: string): Promise<TerminalResponse> {
  const containerId = sessions.get(sessionId);
  if (!containerId) {
    return { ok: true, output: "Session déjà terminée." };
  }

  try {
    const container = docker.getContainer(containerId);
    try {
      await container.stop({ t: 2 });
    } catch {
      // Déjà arrêté ou supprimé
    }
    // Force la suppression : avec dind, tout l'univers imbriqué (conteneurs,
    // volumes, réseaux, images de l'apprenant) disparaît avec ce conteneur.
    try {
      await container.remove({ force: true, v: true });
    } catch {
      // AutoRemove l'a peut-être déjà supprimé
    }
    sessions.delete(sessionId);
    return { ok: true, output: "Session terminée." };
  } catch {
    sessions.delete(sessionId);
    return { ok: true, output: "Session terminée." };
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!isEnabled()) {
    return Response.json(
      { ok: false, error: "Terminal Docker désactivé. Ajoute DOCKER_TERMINAL=true dans .env." } satisfies TerminalResponse,
      { status: 403 },
    );
  }

  let body: TerminalRequest;
  try {
    body = (await req.json()) as TerminalRequest;
  } catch {
    return Response.json({ ok: false, error: "Requête invalide." } satisfies TerminalResponse, {
      status: 400,
    });
  }

  let result: TerminalResponse;

  switch (body.action) {
    case "start":
      result = await startSession();
      break;
    case "exec":
      if (!body.sessionId || !body.command) {
        return Response.json(
          { ok: false, error: "sessionId et command requis." } satisfies TerminalResponse,
          { status: 400 },
        );
      }
      result = await execCommand(body.sessionId, body.command);
      break;
    case "build":
      if (!body.sessionId || !body.dockerfile) {
        return Response.json(
          { ok: false, error: "sessionId et dockerfile requis." } satisfies TerminalResponse,
          { status: 400 },
        );
      }
      result = await buildDockerfile(body.sessionId, body.dockerfile);
      break;
    case "stop":
      if (!body.sessionId) {
        return Response.json(
          { ok: false, error: "sessionId requis." } satisfies TerminalResponse,
          { status: 400 },
        );
      }
      result = await stopSession(body.sessionId);
      break;
    default:
      return Response.json(
        { ok: false, error: "Action inconnue. Utilise start, exec ou stop." } satisfies TerminalResponse,
        { status: 400 },
      );
  }

  return Response.json(result);
}
