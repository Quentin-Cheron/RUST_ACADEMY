import type { Chapter } from "./types";

import { ch01 } from "./chapters/ch01";
import { ch02 } from "./chapters/ch02";
import { ch03 } from "./chapters/ch03";
import { ch04 } from "./chapters/ch04";
import { ch05 } from "./chapters/ch05";
import { ch06 } from "./chapters/ch06";
import { ch07 } from "./chapters/ch07";
import { ch08 } from "./chapters/ch08";
import { ch09 } from "./chapters/ch09";
import { ch10 } from "./chapters/ch10";
import { ch11 } from "./chapters/ch11";
import { ch12 } from "./chapters/ch12";
import { ch13 } from "./chapters/ch13";
import { ch14 } from "./chapters/ch14";
import { ch15 } from "./chapters/ch15";
import { ch16 } from "./chapters/ch16";
import { ch17 } from "./chapters/ch17";
import { ch18 } from "./chapters/ch18";
import { ch19 } from "./chapters/ch19";
import { ch20 } from "./chapters/ch20";

/** Tous les chapitres, dans l'ordre. */
export const chapters: Chapter[] = [
  ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10,
  ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20,
].sort((a, b) => a.number - b.number);

/** Retrouve un chapitre par son slug. */
export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

/** Renvoie le chapitre précédent et suivant pour la navigation. */
export function getSiblings(slug: string): { prev?: Chapter; next?: Chapter } {
  const i = chapters.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  };
}

/** Nombre total d'exercices (petits + gros projets) dans le cours. */
export function totalExercises(): number {
  return chapters.reduce((sum, c) => sum + c.exercises.length + 1, 0);
}
