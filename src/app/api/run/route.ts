// Compile et exécute du code Rust avec tests.
// Si DOCKER_RUNNER=true et Docker est disponible → exécution locale dans un conteneur rust:slim.
// Sinon → fallback vers le Rust Playground officiel.

export const runtime = "nodejs";

import Docker from "dockerode";

interface PlaygroundResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

// ── Docker setup (réutilise la même logique que /api/terminal) ──

function createDocker(): Docker {
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
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }
  return new Docker({ socketPath: "/var/run/docker.sock" });
}

const RUST_IMAGE = "rust:slim";
const COMPILE_TIMEOUT = 30_000;

function useDocker(): boolean {
  return process.env.DOCKER_RUNNER === "true";
}

/** Vérifie que le daemon Docker répond. */
async function isDockerAvailable(docker: Docker): Promise<boolean> {
  try {
    await docker.ping();
    return true;
  } catch {
    return false;
  }
}

/** Pull l'image si elle n'existe pas encore. */
async function ensureImage(docker: Docker, image: string): Promise<void> {
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

/** Crée une archive tar contenant un seul fichier (pour putArchive). */
function makeTar(filename: string, content: string): Buffer {
  const data = Buffer.from(content, "utf-8");
  const nameBytes = Buffer.from(filename);

  // Tar header = 512 bytes
  const header = Buffer.alloc(512, 0);
  nameBytes.copy(header, 0);                                   // name
  Buffer.from("0000644\0").copy(header, 100);                   // mode
  Buffer.from("0001000\0").copy(header, 108);                   // uid
  Buffer.from("0001000\0").copy(header, 116);                   // gid
  Buffer.from(data.length.toString(8).padStart(11, "0") + "\0").copy(header, 124); // size
  Buffer.from("00000000000\0").copy(header, 136);               // mtime
  header[156] = 48; // '0' = normal file

  // Compute checksum
  Buffer.from("        ").copy(header, 148); // blank checksum field
  let checksum = 0;
  for (let i = 0; i < 512; i++) checksum += header[i];
  Buffer.from(checksum.toString(8).padStart(6, "0") + "\0 ").copy(header, 148);

  // Data padded to 512-byte blocks
  const padding = 512 - (data.length % 512 || 512);
  const dataPadded = padding > 0 && padding < 512
    ? Buffer.concat([data, Buffer.alloc(padding, 0)])
    : data;

  // End-of-archive: two 512-byte zero blocks
  const end = Buffer.alloc(1024, 0);
  return Buffer.concat([header, dataPadded, end]);
}

/** Exécute le code Rust dans un conteneur Docker éphémère. */
async function runInDocker(code: string): Promise<PlaygroundResponse> {
  const docker = createDocker();

  if (!(await isDockerAvailable(docker))) {
    throw new Error("Docker indisponible");
  }

  await ensureImage(docker, RUST_IMAGE);

  const container = await docker.createContainer({
    Image: RUST_IMAGE,
    Cmd: ["sh", "-c", "rustc --edition 2021 --test /tmp/test.rs -o /tmp/test 2>&1 && /tmp/test 2>&1"],
    WorkingDir: "/tmp",
    AttachStdout: true,
    AttachStderr: true,
    HostConfig: {
      Memory: 256 * 1024 * 1024,   // 256 Mo
      NanoCpus: 1_000_000_000,     // 1 CPU
      NetworkMode: "none",          // Pas de réseau
    },
  });

  try {
    // Injecte le fichier source via l'API putArchive (safe, pas d'échappement shell)
    const tar = makeTar("test.rs", code);
    await container.putArchive(tar, { path: "/tmp" });

    const stream = await container.attach({ stream: true, stdout: true, stderr: true });
    await container.start();

    const output = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timer = setTimeout(() => {
        container.stop({ t: 1 }).catch(() => {});
        reject(new Error("timeout"));
      }, COMPILE_TIMEOUT);

      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        clearTimeout(timer);
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw.replace(/[\x00-\x08\x0e-\x1f]/g, ""));
      });
      stream.on("error", (err: Error) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const info = await container.wait().catch(() => ({ StatusCode: 1 }));
    const success = info.StatusCode === 0;

    return {
      success,
      stdout: success ? output : "",
      stderr: success ? "" : output,
    };
  } finally {
    try { await container.remove({ force: true }); } catch { /* already removed */ }
  }
}

// ── Rust Playground (fallback) ──

async function runViaPlayground(code: string): Promise<PlaygroundResponse> {
  const res = await fetch("https://play.rust-lang.org/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: "stable",
      mode: "debug",
      edition: "2021",
      crateType: "lib",
      tests: true,
      code,
      backtrace: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    return {
      success: false,
      stdout: "",
      stderr: `Le service d'exécution a répondu ${res.status}. Réessaie dans un instant.`,
    };
  }

  return (await res.json()) as PlaygroundResponse;
}

// ── Route handler ──

export async function POST(req: Request): Promise<Response> {
  let code: string;
  try {
    const body = (await req.json()) as { code?: string };
    code = body.code ?? "";
  } catch {
    return Response.json(
      { success: false, stdout: "", stderr: "Requête invalide." } satisfies PlaygroundResponse,
      { status: 400 },
    );
  }

  if (!code.trim()) {
    return Response.json(
      { success: false, stdout: "", stderr: "Aucun code à exécuter." } satisfies PlaygroundResponse,
      { status: 400 },
    );
  }

  try {
    let data: PlaygroundResponse;

    if (useDocker()) {
      try {
        data = await runInDocker(code);
      } catch (err) {
        // Docker en panne → fallback automatique vers le Playground
        console.warn("[run] Docker indisponible, fallback Playground:", err instanceof Error ? err.message : err);
        data = await runViaPlayground(code);
      }
    } else {
      data = await runViaPlayground(code);
    }

    return Response.json(data);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "La compilation a pris trop de temps (timeout). Réessaie."
        : "Impossible de contacter le service d'exécution. Vérifie ta connexion.";
    return Response.json({
      success: false,
      stdout: "",
      stderr: message,
    } satisfies PlaygroundResponse);
  }
}
