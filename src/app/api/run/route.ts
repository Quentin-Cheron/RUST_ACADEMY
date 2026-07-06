// Proxy vers le Rust Playground officiel pour compiler et exécuter les tests
// de l'utilisateur côté serveur (évite les restrictions CORS du navigateur).

export const runtime = "nodejs";

interface PlaygroundResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

export async function POST(req: Request): Promise<Response> {
  let code: string;
  try {
    const body = (await req.json()) as { code?: string };
    code = body.code ?? "";
  } catch {
    return Response.json(
      {
        success: false,
        stdout: "",
        stderr: "Requête invalide.",
      } satisfies PlaygroundResponse,
      { status: 400 },
    );
  }

  if (!code.trim()) {
    return Response.json(
      {
        success: false,
        stdout: "",
        stderr: "Aucun code à exécuter.",
      } satisfies PlaygroundResponse,
      { status: 400 },
    );
  }

  try {
    const res = await fetch("https://play.rust-lang.org/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "stable",
        mode: "debug",
        edition: "2021",
        crateType: "lib", // crate lib => `cargo test`, pas besoin de fn main
        tests: true,
        code,
        backtrace: false,
      }),
      // Le playground peut être lent à froid (compilation).
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return Response.json({
        success: false,
        stdout: "",
        stderr: `Le service d'exécution a répondu ${res.status}. Réessaie dans un instant.`,
      } satisfies PlaygroundResponse);
    }

    const data = (await res.json()) as PlaygroundResponse;
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
