// Tuteur IA de chapitre (gratuit) via OpenRouter.
// Répond aux questions sur le chapitre en cours, en s'appuyant uniquement sur son contenu.
// Désactivable via NEXT_PUBLIC_CHAT_ENABLED=false. Nécessite OPENROUTER_API_KEY.

import { getChapter } from "@/content";
import type { ContentBlock } from "@/content/types";

export const runtime = "nodejs";

// Mêmes modèles gratuits en cascade que la relecture : bascule au moindre 429/5xx/timeout.
const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
] as const;

const MAX_CONTEXT = 6_000;
const MAX_MESSAGE = 2_000;
const MAX_HISTORY = 8;

// Rate-limit maison en mémoire (par IP) pour ne pas cramer le quota gratuit.
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const hits = new Map<string, number[]>();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  ok: boolean;
  reply?: string;
  message?: string;
  needsKey?: boolean;
  disabled?: boolean;
}

function chatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false";
}

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function blockText(b: ContentBlock): string {
  switch (b.type) {
    case "heading":
      return `## ${b.text}`;
    case "paragraph":
      return b.text;
    case "callout":
      return [b.title, b.text].filter(Boolean).join(" : ");
    case "list":
      return b.items.map((i) => `- ${i}`).join("\n");
    case "usecase":
      return `${b.title} : ${b.text}`;
    case "code":
      return b.caption ? `(exemple de code : ${b.caption})` : "(exemple de code)";
  }
}

/** Construit un contexte compact du chapitre (sans le code brut, pour limiter les tokens). */
function buildContext(slug: string): string | null {
  const c = getChapter(slug);
  if (!c) return null;

  const parts: string[] = [
    `# Chapitre ${c.number} : ${c.title}`,
    c.subtitle,
    c.description,
    `Objectifs : ${c.objectives.join(" ; ")}`,
  ];

  for (const s of c.sections) {
    parts.push(`\n### ${s.number ? `${s.number} ` : ""}${s.title}`);
    for (const b of s.blocks) {
      const t = blockText(b);
      if (t) parts.push(t);
    }
  }

  parts.push(`\nÀ retenir : ${c.keyTakeaways.join(" ; ")}`);

  return parts.join("\n").slice(0, MAX_CONTEXT);
}

export async function POST(req: Request): Promise<Response> {
  if (!chatEnabled()) {
    return Response.json({
      ok: false,
      disabled: true,
      message: "L'assistant est désactivé.",
    } satisfies ChatResponse);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({
      ok: false,
      needsKey: true,
      message:
        "L'assistant n'est pas configuré. Ajoute une clé gratuite OPENROUTER_API_KEY dans .env (openrouter.ai) puis redémarre le serveur.",
    } satisfies ChatResponse);
  }

  if (rateLimited(clientKey(req))) {
    return Response.json(
      {
        ok: false,
        message: "Tu as posé beaucoup de questions d'affilée. Réessaie dans quelques minutes.",
      } satisfies ChatResponse,
      { status: 429 },
    );
  }

  let chapterSlug: string;
  let history: ChatMessage[];
  try {
    const body = (await req.json()) as { chapterSlug?: string; messages?: ChatMessage[] };
    chapterSlug = String(body.chapterSlug ?? "");
    history = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return Response.json(
      { ok: false, message: "Requête invalide." } satisfies ChatResponse,
      { status: 400 },
    );
  }

  const context = buildContext(chapterSlug);
  if (!context) {
    return Response.json(
      { ok: false, message: "Chapitre introuvable." } satisfies ChatResponse,
      { status: 404 },
    );
  }

  const cleaned: ChatMessage[] = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE) }));

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return Response.json(
      { ok: false, message: "Aucune question à traiter." } satisfies ChatResponse,
      { status: 400 },
    );
  }

  const systeme = `Tu es un tuteur de programmation Rust bienveillant et clair, intégré à un cours en ligne. Tu réponds EXCLUSIVEMENT en français.

Tu aides l'apprenant à comprendre le chapitre qu'il est en train de lire. Appuie-toi en priorité sur le contenu du chapitre ci-dessous. Si la question sort du sujet du chapitre mais reste sur Rust, tu peux répondre brièvement. Si la question n'a aucun rapport avec Rust ou la programmation, recentre poliment.

Sois concis et pédagogique : explications courtes, exemples de code Rust en blocs \`\`\`rust quand c'est utile. N'invente pas d'API. Utilise du Markdown léger.

--- CONTENU DU CHAPITRE ---
${context}
--- FIN DU CONTENU ---`;

  const messages = [
    { role: "system" as const, content: systeme },
    ...cleaned,
  ];

  let lastStatus = 0;
  let timedOut = false;

  for (const model of MODELS) {
    let reply: string;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, temperature: 0.3, messages }),
        signal: AbortSignal.timeout(22_000),
      });

      if (!res.ok) {
        lastStatus = res.status;
        if (res.status === 429 || res.status >= 500) continue;
        return Response.json({
          ok: false,
          message: `L'assistant a répondu ${res.status}.`,
        } satisfies ChatResponse);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      reply = payload.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") timedOut = true;
      continue;
    }

    if (reply.trim()) {
      return Response.json({ ok: true, reply } satisfies ChatResponse);
    }
  }

  const message =
    lastStatus === 429
      ? "Tous les modèles gratuits ont atteint leur limite. Réessaie dans une minute."
      : timedOut
        ? "Les modèles gratuits sont surchargés (trop lents). Réessaie dans un instant."
        : "L'assistant n'a pas pu répondre. Réessaie dans un instant.";
  return Response.json({ ok: false, message } satisfies ChatResponse);
}
