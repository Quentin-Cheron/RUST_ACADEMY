"use client";

import Link from "next/link";
import { FolderGit2, Clock, ArrowRight, Lock, Check, Bot } from "lucide-react";
import { projects } from "@/content/projects";
import { getChapter } from "@/content";
import { useProgress } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const diffStyle: Record<string, string> = {
  facile: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
  moyen: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  difficile: "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400",
};

export default function ProjectList() {
  const { done } = useProgress();
  const unlockedTotal = projects.filter((p) => p.chapters.every((s) => done.has(s))).length;
  const pct = Math.round((unlockedTotal / projects.length) * 100);

  return (
    <div>
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            <FolderGit2 className="size-3.5" /> Projets
          </Badge>
          <span className="inline-flex items-center gap-1">
            <Bot className="size-3.5" /> Relecture de ton code par IA
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          De vrais projets
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Applique ce que tu as appris sur des cas concrets et complets, pas juste des exercices.
          Chaque projet se débloque quand tu as terminé les chapitres qu&apos;il mobilise, et une IA
          peut relire ton code pour suggérer des améliorations.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Projets débloqués</span>
            <span className="font-semibold text-foreground">
              {unlockedTotal} / {projects.length}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => {
          // TEMP: gating désactivé pour tester — remettre la ligne ci-dessous
          // const unlocked = p.chapters.every((s) => done.has(s));
          const unlocked = true;
          const card = (
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl border p-5 transition",
                unlocked
                  ? "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                  : "border-dashed border-border bg-muted/30",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "grid size-9 place-items-center rounded-lg",
                    unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {unlocked ? <FolderGit2 className="size-5" /> : <Lock className="size-4" />}
                </div>
                <Badge variant="outline" className={cn("capitalize", diffStyle[p.difficulty])}>
                  {p.difficulty}
                </Badge>
              </div>

              <h3 className={cn("font-bold", unlocked ? "text-foreground" : "text-foreground/70")}>
                {p.title}
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.tagline}</p>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {p.minutes} min
                </span>
                {unlocked ? (
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Ouvrir <ArrowRight className="size-3.5" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="size-3" /> {p.chapters.filter((s) => !done.has(s)).length}{" "}
                    chapitre(s) à finir
                  </span>
                )}
              </div>

              {!unlocked && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.chapters.map((slug) => {
                    const chapter = getChapter(slug);
                    const complete = done.has(slug);
                    return (
                      <span
                        key={slug}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                          complete
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {complete && <Check className="size-2.5" />}
                        {chapter ? chapter.number : slug}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );

          return unlocked ? (
            <Link key={p.id} href={`/projets/${p.slug}`} className="block">
              {card}
            </Link>
          ) : (
            <div key={p.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
