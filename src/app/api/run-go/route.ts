// Proxy vers le Go Playground officiel pour compiler et exécuter du code Go
// (évite les restrictions CORS du navigateur).

export const runtime = "nodejs";

interface GoPlaygroundEvent {
  Message: string;
  Kind: "stdout" | "stderr";
  Delay: number;
}

interface GoPlaygroundResponse {
  Errors: string;
  Events: GoPlaygroundEvent[] | null;
}

interface RunResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

export async function POST(req: Request): Promise<Response> {
  let code: string;
  let tests: string | undefined;
  try {
    const body = (await req.json()) as { code?: string; tests?: string };
    code = body.code ?? "";
    tests = body.tests;
  } catch {
    return Response.json(
      { success: false, stdout: "", stderr: "Requête invalide." } satisfies RunResponse,
      { status: 400 },
    );
  }

  if (!code.trim()) {
    return Response.json(
      { success: false, stdout: "", stderr: "Aucun code à exécuter." } satisfies RunResponse,
      { status: 400 },
    );
  }

  // Si des tests sont fournis, combiner le code utilisateur + tests.
  const finalCode = tests ? combineGoCode(code, tests) : code;

  try {
    const res = await fetch("https://go.dev/_/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: finalCode, withVet: true }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return Response.json({
        success: false,
        stdout: "",
        stderr: `Le service Go Playground a répondu ${res.status}. Réessaie dans un instant.`,
      } satisfies RunResponse);
    }

    const data = (await res.json()) as GoPlaygroundResponse;

    // Si erreur de compilation
    if (data.Errors) {
      return Response.json({
        success: false,
        stdout: "",
        stderr: data.Errors,
      } satisfies RunResponse);
    }

    // Agréger les events en stdout / stderr
    let stdout = "";
    let stderr = "";
    if (data.Events) {
      for (const e of data.Events) {
        if (e.Kind === "stderr") stderr += e.Message;
        else stdout += e.Message;
      }
    }

    // Succès = pas d'erreur de compilation ET pas de sortie stderr contenant FAIL/panic
    const hasFailure = stderr.includes("FAIL") || stderr.includes("panic") || stderr.includes("ÉCHOUÉ");
    return Response.json({
      success: !hasFailure,
      stdout,
      stderr,
    } satisfies RunResponse);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "L'exécution a pris trop de temps (timeout). Réessaie."
        : "Impossible de contacter le Go Playground. Vérifie ta connexion.";
    return Response.json({
      success: false,
      stdout: "",
      stderr: message,
    } satisfies RunResponse);
  }
}

/**
 * Combine le code utilisateur et le code de test en un seul programme Go.
 *
 * Le champ `tests` doit contenir un programme Go complet avec un marqueur
 * `// __USER_CODE__` à l'endroit où insérer les fonctions de l'utilisateur.
 *
 * Le code utilisateur est nettoyé : on retire `package`, les imports et `func main`.
 */
function combineGoCode(userCode: string, testCode: string): string {
  // Extraire uniquement les définitions (fonctions, types, variables) du code utilisateur
  let cleaned = userCode;

  // Retirer la déclaration de package
  cleaned = cleaned.replace(/^\s*package\s+\w+\s*\n/m, "");

  // Retirer les imports (simple ou groupés)
  cleaned = cleaned.replace(/^\s*import\s+"[^"]+"\s*\n/gm, "");
  cleaned = cleaned.replace(/^\s*import\s+\([\s\S]*?\)\s*\n/gm, "");

  // Retirer func main (avec son corps — gestion basique des accolades imbriquées)
  cleaned = cleaned.replace(/^\s*func\s+main\s*\(\s*\)\s*\{[^]*?\n\}\s*$/m, "");

  // Si le test code contient le marqueur, l'utiliser
  if (testCode.includes("// __USER_CODE__")) {
    return testCode.replace("// __USER_CODE__", cleaned.trim());
  }

  // Sinon, concaténer : le test code fournit package + imports + main,
  // on insère le code utilisateur juste avant func main.
  return testCode.replace(
    /^(\s*func\s+main\s*\(\s*\)\s*\{)/m,
    `${cleaned.trim()}\n\n$1`,
  );
}
