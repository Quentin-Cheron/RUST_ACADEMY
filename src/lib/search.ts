// Recherche globale en mémoire sur tout le contenu du cours.
// Zéro dépendance : normalisation (accents/casse), scoring et extraits maison.

import { chapters } from "@/content";
import { reviewExercises } from "@/content/review";
import { projects } from "@/content/projects";
import type { ContentBlock, Exercise } from "@/content/types";

export type SearchKind =
  | "chapitre"
  | "section"
  | "exercice"
  | "projet"
  | "projet-réel"
  | "révision";

export interface SearchDoc {
  title: string;
  crumb: string;
  kind: SearchKind;
  href: string;
  text: string;
  code: string;
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  /** Extrait de texte autour de la première correspondance (déjà tronqué). */
  excerpt: string;
  /** Vrai si l'extrait provient d'un bloc de code. */
  inCode: boolean;
}

/**
 * Normalise un caractère UTF-16 à la fois pour garder une correspondance
 * d'index 1:1 entre la chaîne d'origine et la chaîne normalisée.
 */
export function normalize(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const d = s[i].normalize("NFD");
    const base = d.length > 0 ? d[0] : s[i];
    const lower = base.toLowerCase();
    out += lower.length === 1 ? lower : base;
  }
  return out;
}

function blockToText(b: ContentBlock): { text: string; code: string } {
  switch (b.type) {
    case "heading":
      return { text: b.text, code: "" };
    case "paragraph":
      return { text: b.text, code: "" };
    case "callout":
      return { text: [b.title, b.text].filter(Boolean).join(" — "), code: "" };
    case "list":
      return { text: b.items.join(" • "), code: "" };
    case "usecase":
      return { text: `${b.title} — ${b.text}`, code: "" };
    case "code":
      return { text: [b.filename, b.caption].filter(Boolean).join(" — "), code: b.code };
  }
}

function exerciseText(ex: Exercise): { text: string; code: string } {
  return {
    text: [ex.prompt, ...(ex.hints ?? [])].join("\n"),
    code: [ex.starter, ex.solution, ex.tests].join("\n"),
  };
}

interface IndexedDoc {
  doc: SearchDoc;
  titleN: string;
  textN: string;
  codeN: string;
}

let INDEX: IndexedDoc[] | null = null;

function buildIndex(): IndexedDoc[] {
  const docs: SearchDoc[] = [];

  for (const c of chapters) {
    const crumb = `Ch. ${c.number} — ${c.title}`;
    docs.push({
      kind: "chapitre",
      title: `${c.number}. ${c.title}`,
      crumb: "Chapitres",
      href: `/cours/${c.slug}`,
      text: [c.subtitle, c.description, ...c.objectives, ...c.keyTakeaways].join("\n"),
      code: "",
    });

    for (const s of c.sections) {
      const parts = s.blocks.map(blockToText);
      docs.push({
        kind: "section",
        title: s.number ? `${s.number} ${s.title}` : s.title,
        crumb,
        href: `/cours/${c.slug}#${s.id}`,
        text: parts.map((p) => p.text).filter(Boolean).join("\n"),
        code: parts.map((p) => p.code).filter(Boolean).join("\n"),
      });
    }

    for (const ex of c.exercises) {
      const t = exerciseText(ex);
      docs.push({
        kind: "exercice",
        title: ex.title,
        crumb,
        href: `/cours/${c.slug}#exercices`,
        text: t.text,
        code: t.code,
      });
    }

    const p = exerciseText(c.project);
    docs.push({
      kind: "projet",
      title: c.project.title,
      crumb,
      href: `/cours/${c.slug}#projet`,
      text: p.text,
      code: p.code,
    });
  }

  for (const p of projects) {
    docs.push({
      kind: "projet-réel",
      title: p.title,
      crumb: "Projets",
      href: `/projets/${p.slug}`,
      text: [
        p.tagline,
        p.context,
        ...p.objectives,
        ...p.steps.map((s) => `${s.title} — ${s.detail}`),
        ...p.extensions,
      ].join("\n"),
      code: [p.starter, p.tests ?? ""].join("\n"),
    });
  }

  for (const ex of reviewExercises) {
    const t = exerciseText(ex);
    docs.push({
      kind: "révision",
      title: ex.title,
      crumb: "Réviser — exercices mixés",
      href: "/reviser",
      text: t.text,
      code: t.code,
    });
  }

  return docs.map((doc) => ({
    doc,
    titleN: normalize(doc.title),
    textN: normalize(doc.text),
    codeN: normalize(doc.code),
  }));
}

function getIndex(): IndexedDoc[] {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

/** Découpe la requête en termes normalisés. */
export function queryTerms(query: string): string[] {
  return normalize(query)
    .split(/[\s,;:!?()[\]{}"']+/)
    .filter((t) => t.length > 0);
}

function makeExcerpt(original: string, index: number, termLen: number): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(original.length, index + termLen + 90);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < original.length ? "…" : "";
  return prefix + original.slice(start, end).replace(/\s+/g, " ").trim() + suffix;
}

/** Recherche accent-insensible avec scoring titre > texte > code. */
export function search(query: string, limit = 24): SearchResult[] {
  const terms = queryTerms(query);
  if (terms.length === 0 || normalize(query).trim().length < 2) return [];

  const results: SearchResult[] = [];

  for (const { doc, titleN, textN, codeN } of getIndex()) {
    let score = 0;
    let excerptAt = -1;
    let excerptLen = 0;
    let inCode = false;
    let ok = true;

    for (const term of terms) {
      const inTitle = titleN.indexOf(term);
      const inText = textN.indexOf(term);
      const inCodeAt = codeN.indexOf(term);

      if (inTitle === -1 && inText === -1 && inCodeAt === -1) {
        ok = false;
        break;
      }
      if (inTitle !== -1) score += inTitle === 0 ? 14 : 9;
      if (inText !== -1) {
        score += 3;
        if (excerptAt === -1 || inCode) {
          excerptAt = inText;
          excerptLen = term.length;
          inCode = false;
        }
      }
      if (inCodeAt !== -1) {
        score += 1;
        if (excerptAt === -1) {
          excerptAt = inCodeAt;
          excerptLen = term.length;
          inCode = true;
        }
      }
    }
    if (!ok) continue;

    if (doc.kind === "chapitre") score += 2;
    else if (doc.kind === "section") score += 1;

    const source = inCode ? doc.code : doc.text;
    const excerpt = excerptAt !== -1 ? makeExcerpt(source, excerptAt, excerptLen) : "";
    results.push({ doc, score, excerpt, inCode });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export interface HighlightSegment {
  text: string;
  hit: boolean;
}

/** Découpe `text` en segments, en marquant ceux qui correspondent à un terme. */
export function splitHighlight(text: string, terms: string[]): HighlightSegment[] {
  if (terms.length === 0 || text.length === 0) return [{ text, hit: false }];

  const n = normalize(text);
  const hits = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    if (term.length === 0) continue;
    let from = 0;
    while (true) {
      const i = n.indexOf(term, from);
      if (i === -1) break;
      for (let j = i; j < i + term.length && j < hits.length; j++) hits[j] = true;
      from = i + term.length;
    }
  }

  const segments: HighlightSegment[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || hits[i] !== hits[start]) {
      segments.push({ text: text.slice(start, i), hit: hits[start] });
      start = i;
    }
  }
  return segments;
}
