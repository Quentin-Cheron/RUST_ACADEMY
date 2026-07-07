import type { Chapter, CodeLanguage } from "./types";
import { chapters as rustChapters } from "./index";

import { d01 } from "./chapters/docker/d01";
import { d02 } from "./chapters/docker/d02";
import { d03 } from "./chapters/docker/d03";
import { d04 } from "./chapters/docker/d04";
import { d05 } from "./chapters/docker/d05";
import { d06 } from "./chapters/docker/d06";
import { d07 } from "./chapters/docker/d07";
import { d08 } from "./chapters/docker/d08";
import { d09 } from "./chapters/docker/d09";
import { d10 } from "./chapters/docker/d10";
import { d11 } from "./chapters/docker/d11";
import { d12 } from "./chapters/docker/d12";

import { g01 } from "./chapters/go/g01";
import { g02 } from "./chapters/go/g02";
import { g03 } from "./chapters/go/g03";
import { g04 } from "./chapters/go/g04";
import { g05 } from "./chapters/go/g05";
import { g06 } from "./chapters/go/g06";
import { g07 } from "./chapters/go/g07";
import { g08 } from "./chapters/go/g08";
import { g09 } from "./chapters/go/g09";
import { g10 } from "./chapters/go/g10";
import { g11 } from "./chapters/go/g11";
import { g12 } from "./chapters/go/g12";

/** Comment les exercices d'un cours sont validés. */
export type Runner =
  // Compilation + tests réels via un service distant (Rust Playground).
  | "rust"
  // Compilation + exécution via le Go Playground. Fallback sur checks si pas de tests.
  | "go"
  // Critères (regex) évalués dans le navigateur (Docker : pas d'exécution).
  | "checks";

/** Un parcours de formation complet (Rust, Docker…). */
export interface Course {
  /** Identifiant d'URL, ex: "rust", "docker". */
  id: string;
  /** Nom complet affiché, ex: "Rust Academy". */
  name: string;
  /** Nom court, ex: "Rust". */
  short: string;
  /** Lettre/emblème du logo, ex: "R", "🐳". */
  emblem: string;
  /** Accroche courte (sidebar). */
  tagline: string;
  /** Description longue (page de garde). */
  blurb: string;
  /** Classe de thème appliquée au sous-arbre, "" = thème par défaut (Rust). */
  theme: string;
  /** Mode de validation des exercices. */
  runner: Runner;
  /** Langage par défaut de l'éditeur/coloration des exercices. */
  editorLanguage: CodeLanguage;
  /** Libellé de la référence documentaire (ex: "Rust Book", "Docs Docker"). */
  bookLabel: string;
  /** Les chapitres du cours, dans l'ordre. */
  chapters: Chapter[];
}

const dockerChapters: Chapter[] = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12].sort(
  (a, b) => a.number - b.number,
);

const goChapters: Chapter[] = [g01, g02, g03, g04, g05, g06, g07, g08, g09, g10, g11, g12].sort(
  (a, b) => a.number - b.number,
);

export const courses: Course[] = [
  {
    id: "rust",
    name: "Rust Academy",
    short: "Rust",
    emblem: "R",
    tagline: "Apprends Rust de A à Z",
    blurb:
      "Les 20+ chapitres du Rust Book officiel, réexpliqués en français : exemples concrets, cas d'usage, exercices et vrais tests unitaires compilés.",
    theme: "",
    runner: "rust",
    editorLanguage: "rust",
    bookLabel: "Rust Book",
    chapters: rustChapters,
  },
  {
    id: "docker",
    name: "Docker Academy",
    short: "Docker",
    emblem: "D",
    tagline: "Conteneurise tes applis",
    blurb:
      "Des conteneurs au déploiement en production : Dockerfile, Compose, Nginx, HTTPS, stacks multi-services, CI/CD et sécurité. 12 chapitres avec exercices validés à chaque étape.",
    theme: "theme-docker",
    runner: "checks",
    editorLanguage: "bash",
    bookLabel: "Docs Docker",
    chapters: dockerChapters,
  },
  {
    id: "go",
    name: "Go Academy",
    short: "Go",
    emblem: "G",
    tagline: "Apprends Go de zero a pro",
    blurb:
      "Des bases du langage a la concurrence avec goroutines et channels : 12 chapitres pour maitriser Go, le langage de Docker et Kubernetes. Exercices pratiques valides a chaque etape.",
    theme: "theme-go",
    runner: "go",
    editorLanguage: "go",
    bookLabel: "Go Tour",
    chapters: goChapters,
  },
];

/** Le cours par défaut (Rust). */
export const defaultCourse = courses[0];

/** Retrouve un cours par son id. */
export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

/** Retrouve un chapitre par slug à l'intérieur d'un cours. */
export function getChapterIn(course: Course, slug: string): Chapter | undefined {
  return course.chapters.find((c) => c.slug === slug);
}

/** Chapitres précédent/suivant à l'intérieur d'un cours. */
export function getSiblingsIn(
  course: Course,
  slug: string,
): { prev?: Chapter; next?: Chapter } {
  const i = course.chapters.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? course.chapters[i - 1] : undefined,
    next: i < course.chapters.length - 1 ? course.chapters[i + 1] : undefined,
  };
}

/** Nombre total d'exercices (petits + gros projets) d'un cours. */
export function totalExercisesIn(course: Course): number {
  return course.chapters.reduce((sum, c) => sum + c.exercises.length + 1, 0);
}

/** Retrouve un chapitre par slug à travers tous les cours. */
export function findChapterGlobally(
  slug: string,
): { course: Course; chapter: Chapter } | undefined {
  for (const course of courses) {
    const chapter = getChapterIn(course, slug);
    if (chapter) return { course, chapter };
  }
  return undefined;
}

/** Toutes les paires (course, chapter) pour la génération statique. */
export function allCourseChapterParams(): { course: string; chapter: string }[] {
  return courses.flatMap((co) =>
    co.chapters.map((ch) => ({ course: co.id, chapter: ch.slug })),
  );
}
