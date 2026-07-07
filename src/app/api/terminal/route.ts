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

const SANDBOX_IMAGE = "docker:cli";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

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

async function startSession(): Promise<TerminalResponse> {
  const sessionId = crypto.randomUUID();

  try {
    // Vérifie que l'image existe, sinon la pull
    try {
      await docker.getImage(SANDBOX_IMAGE).inspect();
    } catch {
      await new Promise<void>((resolve, reject) => {
        docker.pull(SANDBOX_IMAGE, (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err2: Error | null) => {
            if (err2) reject(err2);
            else resolve();
          });
        });
      });
    }

    const container = await docker.createContainer({
      Image: SANDBOX_IMAGE,
      Cmd: ["sh"],
      Tty: true,
      OpenStdin: true,
      WorkingDir: "/workspace",
      HostConfig: {
        // Monte le socket Docker pour que les commandes Docker fonctionnent
        Binds: ["/var/run/docker.sock:/var/run/docker.sock"],
        // Limite les ressources du sandbox
        Memory: 256 * 1024 * 1024, // 256 Mo
        NanoCpus: 500_000_000, // 0.5 CPU
        AutoRemove: true,
      },
    });

    await container.start();
    sessions.set(sessionId, container.id);

    // Auto-cleanup après 30 min
    setTimeout(async () => {
      await stopSession(sessionId);
    }, SESSION_TIMEOUT);

    return { ok: true, sessionId, output: "Session Docker démarrée. Tape tes commandes.\n" };
  } catch (err) {
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
