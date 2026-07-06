// Revue de code par IA (gratuite) via OpenRouter.
// Nécessite OPENROUTER_API_KEY dans .env. Sans clé, la route renvoie un message
// d'invite propre — le reste de l'application (projets + tests) reste fonctionnel.

export const runtime = "nodejs";

// Plusieurs modèles gratuits en cascade : si l'un renvoie 429 (quota atteint),
// on bascule sur le suivant. Ça absorbe les limites très basses des modèles `:free`.
const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
] as const;
const MAX_CODE_LENGTH = 12_000;

/** Un problème identifié par l'IA dans le code. */
interface Probleme {
  severite: "info" | "mineur" | "majeur" | "critique";
  titre: string;
  explication: string;
  suggestion: string;
}

/** Retour structuré renvoyé au client. */
interface Revue {
  score: number;
  resume: string;
  points_forts: string[];
  problemes: Probleme[];
  idiomatique: string[];
  securite: string[];
}

interface ReviewResponse {
  ok: boolean;
  /** Présent si ok=true. */
  revue?: Revue;
  /** Présent si ok=false. */
  message?: string;
  /** true si la clé API manque (invite de configuration). */
  needsKey?: boolean;
}

const SYSTEME = `Tu es un relecteur de code Rust senior, bienveillant et exigeant. Tu réponds EXCLUSIVEMENT en français et EXCLUSIVEMENT avec un objet JSON valide (aucun texte avant ou après, pas de balises Markdown).

Le JSON doit respecter exactement ce schéma :
{
  "score": nombre entre 0 et 100 (qualité globale),
  "resume": "une ou deux phrases de synthèse",
  "points_forts": ["ce qui est bien fait", ...],
  "problemes": [
    {
      "severite": "info" | "mineur" | "majeur" | "critique",
      "titre": "titre court du problème",
      "explication": "pourquoi c'est un problème",
      "suggestion": "comment le corriger (peut inclure du code Rust)"
    }
  ],
  "idiomatique": ["conseils pour un code plus idiomatique (Rust idioms, clippy)", ...],
  "securite": ["risques de panique, unwrap dangereux, débordements, etc.", ...]
}

Sois concret et pédagogique. Si le code est incomplet (todo!()), signale-le. N'invente pas de problèmes s'il n'y en a pas : les tableaux peuvent être vides.`;

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return candidate.trim();
  return candidate.slice(start, end + 1).trim();
}

function normalizeRevue(data: unknown): Revue {
  const d = (data ?? {}) as Record<string, unknown>;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const problemes: Probleme[] = Array.isArray(d.problemes)
    ? (d.problemes as unknown[]).map((p) => {
        const o = (p ?? {}) as Record<string, unknown>;
        const sev = o.severite;
        return {
          severite:
            sev === "critique" || sev === "majeur" || sev === "mineur" || sev === "info"
              ? sev
              : "mineur",
          titre: typeof o.titre === "string" ? o.titre : "Problème",
          explication: typeof o.explication === "string" ? o.explication : "",
          suggestion: typeof o.suggestion === "string" ? o.suggestion : "",
        };
      })
    : [];
  const score = typeof d.score === "number" ? Math.max(0, Math.min(100, Math.round(d.score))) : 0;
  return {
    score,
    resume: typeof d.resume === "string" ? d.resume : "",
    points_forts: arr(d.points_forts),
    problemes,
    idiomatique: arr(d.idiomatique),
    securite: arr(d.securite),
  };
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({
      ok: false,
      needsKey: true,
      message:
        "La relecture par IA n'est pas configurée. Ajoute une clé gratuite OPENROUTER_API_KEY dans ton fichier .env (openrouter.ai) puis redémarre le serveur.",
    } satisfies ReviewResponse);
  }

  let code: string;
  let contexte: string;
  try {
    const body = (await req.json()) as { code?: string; contexte?: string };
    code = (body.code ?? "").slice(0, MAX_CODE_LENGTH);
    contexte = (body.contexte ?? "").slice(0, 2_000);
  } catch {
    return Response.json(
      { ok: false, message: "Requête invalide." } satisfies ReviewResponse,
      { status: 400 },
    );
  }

  if (!code.trim()) {
    return Response.json(
      { ok: false, message: "Aucun code à relire." } satisfies ReviewResponse,
      { status: 400 },
    );
  }

  const userPrompt = `${contexte ? `Contexte du projet : ${contexte}\n\n` : ""}Voici le code Rust à relire :\n\n\`\`\`rust\n${code}\n\`\`\``;

  let lastStatus = 0;
  let timedOut = false;

  for (const model of MODELS) {
    let content: string;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEME },
            { role: "user", content: userPrompt },
          ],
        }),
        // Délai serré par modèle : s'il traîne, on bascule sur le suivant.
        signal: AbortSignal.timeout(22_000),
      });

      if (!res.ok) {
        lastStatus = res.status;
        // 429 (quota) ou 5xx (modèle indispo) : on tente le modèle suivant.
        if (res.status === 429 || res.status >= 500) continue;
        return Response.json({
          ok: false,
          message: `Le service de relecture a répondu ${res.status}.`,
        } satisfies ReviewResponse);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      content = payload.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      // Timeout ou erreur réseau : on ne renonce pas, on essaie le modèle suivant.
      if (err instanceof Error && err.name === "TimeoutError") timedOut = true;
      continue;
    }

    if (!content) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      continue;
    }

    return Response.json({
      ok: true,
      revue: normalizeRevue(parsed),
    } satisfies ReviewResponse);
  }

  const message =
    lastStatus === 429
      ? "Tous les modèles gratuits ont atteint leur limite de requêtes. Réessaie dans une minute."
      : timedOut
        ? "Les modèles gratuits sont surchargés (trop lents). Réessaie dans un instant."
        : "La relecture n'a pas abouti. Réessaie dans un instant.";
  return Response.json({ ok: false, message } satisfies ReviewResponse);
}
