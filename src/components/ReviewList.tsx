"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Lock, Check, Shuffle } from "lucide-react";
import { reviewExercises } from "@/content/review";
import { getChapter } from "@/content";
import type { Difficulty, ReviewExercise } from "@/content/types";
import { useProgress } from "@/lib/progress";
import ExerciseCard from "./ExerciseCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const difficulties: Array<Difficulty | "toutes"> = ["toutes", "facile", "moyen", "difficile"];

const diffStyle: Record<string, string> = {
  facile: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
  moyen: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  difficile: "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400",
};

function isUnlocked(ex: ReviewExercise, done: Set<string>): boolean {
  return ex.chapters.every((slug) => done.has(slug));
}

function LockedCard({ exercise, done }: { exercise: ReviewExercise; done: Set<string> }) {
  return (
    <div className="my-4 rounded-2xl border border-dashed border-border bg-muted/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Lock className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Verrouillé
            </div>
            <h4 className="font-bold text-foreground/70">{exercise.title}</h4>
          </div>
        </div>
        <Badge variant="outline" className={cn("capitalize", diffStyle[exercise.difficulty])}>
          {exercise.difficulty}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Termine ces chapitres pour débloquer cet exercice :
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {exercise.chapters.map((slug) => {
          const chapter = getChapter(slug);
          const complete = done.has(slug);
          return (
            <Link
              key={slug}
              href={`/cours/${slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                complete
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary",
              )}
            >
              {complete && <Check className="size-3" />}
              {chapter ? `${chapter.number}. ${chapter.title}` : slug}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function ReviewList() {
  const { done } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | "toutes">("toutes");
  const [showLocked, setShowLocked] = useState(true);

  const filtered = useMemo(
    () =>
      reviewExercises.filter(
        (ex) => difficulty === "toutes" || ex.difficulty === difficulty,
      ),
    [difficulty],
  );

  const unlocked = filtered.filter((ex) => isUnlocked(ex, done));
  const locked = filtered.filter((ex) => !isUnlocked(ex, done));
  const unlockedTotal = reviewExercises.filter((ex) => isUnlocked(ex, done)).length;
  const pct = Math.round((unlockedTotal / reviewExercises.length) * 100);

  return (
    <div>
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            <Dumbbell className="size-3.5" /> Révision
          </Badge>
          <span className="inline-flex items-center gap-1">
            <Shuffle className="size-3.5" /> Chaque exercice mélange plusieurs chapitres
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">Réviser</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Des exercices transversaux pour consolider ce que tu as appris. Un exercice se débloque
          quand tous les chapitres qu&apos;il mélange sont terminés.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Exercices débloqués</span>
            <span className="font-semibold text-foreground">
              {unlockedTotal} / {reviewExercises.length}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={difficulty === d ? "default" : "outline"}
              className="capitalize"
              onClick={() => setDifficulty(d)}
            >
              {d}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setShowLocked((v) => !v)}>
          <Lock /> {showLocked ? "Masquer les verrouillés" : "Afficher les verrouillés"}
        </Button>
      </div>

      {unlocked.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="font-semibold text-foreground">Aucun exercice débloqué pour ce filtre.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Termine des chapitres (bouton « Chapitre terminé » en bas de chaque leçon) pour
            débloquer les exercices de révision correspondants.
          </p>
        </div>
      )}

      {unlocked.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}

      {showLocked && locked.length > 0 && (
        <>
          <h2 className="mt-10 mb-2 text-xl font-bold text-foreground">
            Encore verrouillés ({locked.length})
          </h2>
          {locked.map((ex) => (
            <LockedCard key={ex.id} exercise={ex} done={done} />
          ))}
        </>
      )}
    </div>
  );
}
