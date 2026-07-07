// Modèle de données du cours Rust Academy.
// Tout le contenu pédagogique est typé pour garantir la cohérence entre chapitres.

/** Langages pris en charge par la coloration et l'éditeur. */
export type CodeLanguage = "rust" | "bash" | "toml" | "text" | "dockerfile" | "yaml" | "go";

/** Un bloc de contenu affiché dans une leçon. Union discriminée sur `type`. */
export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; language: CodeLanguage; code: string; filename?: string; caption?: string }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "danger"; title?: string; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "usecase"; title: string; text: string };

/** Niveau de difficulté d'un exercice. */
export type Difficulty = "facile" | "moyen" | "difficile";

/**
 * Un critère de validation évalué dans le navigateur (utilisé par les cours
 * dont le code ne s'exécute pas sur un service distant, ex. Docker).
 * Le `pattern` est une expression régulière testée sur le code de l'apprenant.
 */
export interface Check {
  /** Description lisible du critère (« Utilise une image de base officielle »). */
  label: string;
  /** Expression régulière (source) à tester sur le code saisi. */
  pattern: string;
  /** Drapeaux de la regex (par défaut « im »). */
  flags?: string;
  /** Si vrai, le critère passe quand le motif est ABSENT. */
  negate?: boolean;
}

/** Un exercice pratique avec énoncé, code de départ, solution et validation. */
export interface Exercise {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** Énoncé au format markdown léger (supporte `code`, **gras**). */
  prompt: string;
  /** Points/indices pour guider l'apprenant. */
  hints?: string[];
  /** Code de départ (squelette) fourni à l'apprenant. */
  starter: string;
  /** Solution complète et commentée. */
  solution: string;
  /** Tests unitaires Rust (module #[cfg(test)]) qui valident la solution — runner « rust ». */
  tests?: string;
  /** Critères de validation évalués côté navigateur — runner « checks » (ex. Docker). */
  checks?: Check[];
  /** Langage de l'éditeur/solution si différent de celui du cours. */
  language?: CodeLanguage;
}

/** Un exercice de révision transversal : mélange les notions de plusieurs chapitres. */
export interface ReviewExercise extends Exercise {
  /** Slugs des chapitres dont les notions sont mélangées. Tous doivent être terminés pour débloquer l'exercice. */
  chapters: string[];
}

/** Une section de chapitre : un titre et une suite de blocs de contenu. */
export interface Section {
  id: string;
  /** Numéro de sous-chapitre du Rust Book, ex: "3.1". */
  number?: string;
  title: string;
  blocks: ContentBlock[];
}

/** Un chapitre complet du cours. */
export interface Chapter {
  /** Numéro d'ordre (1..N). */
  number: number;
  /** Slug d'URL, ex: "ownership". */
  slug: string;
  /** Titre court affiché dans la sidebar. */
  title: string;
  /** Sous-titre / accroche. */
  subtitle: string;
  /** Description longue affichée en tête de chapitre. */
  description: string;
  /** Durée estimée en minutes. */
  minutes: number;
  /** Correspondance avec le chapitre du Rust Book officiel. */
  rustBookRef: string;
  /** Points clés à retenir (résumé). */
  objectives: string[];
  /** Sections pédagogiques (cours + exemples + cas d'usage). */
  sections: Section[];
  /** Exercices d'entraînement (courts). */
  exercises: Exercise[];
  /** Gros projet de fin de chapitre avec tests unitaires. */
  project: Exercise;
  /** Résumé final « à retenir ». */
  keyTakeaways: string[];
}
