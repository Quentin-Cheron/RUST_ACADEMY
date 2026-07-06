"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Target,
  ClipboardList,
  Rocket,
  Play,
  RotateCcw,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Check,
  Bot,
  Lightbulb,
  ShieldAlert,
  ThumbsUp,
  Settings,
  Code2,
} from "lucide-react";
import type { Project } from "@/content/projects";
import { getChapter } from "@/content";
import { useProgress } from "@/lib/progress";
import { renderInline } from "@/lib/inline";
import CodeEditor from "./CodeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const diffStyle: Record<string, string> = {
  facile: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
  moyen: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  difficile: "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400",
};

const sevStyle: Record<string, string> = {
  info: "border-sky-400/40 bg-sky-400/10 text-sky-600 dark:text-sky-400",
  mineur: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400",
  majeur: "border-orange-400/40 bg-orange-400/10 text-orange-600 dark:text-orange-400",
  critique: "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400",
};

interface RunResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface Probleme {
  severite: "info" | "mineur" | "majeur" | "critique";
  titre: string;
  explication: string;
  suggestion: string;
}

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
  revue?: Revue;
  message?: string;
  needsKey?: boolean;
}

function Gate({ project, done }: { project: Project; done: Set<string> }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6">
      <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
        <Lock className="size-4" /> Projet verrouillé
      </div>
      <p className="text-sm text-muted-foreground">
        Ce projet applique les notions de plusieurs chapitres. Termine-les d&apos;abord pour le
        débloquer :
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.chapters.map((slug) => {
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

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400"
        : "border-red-400/40 bg-red-400/10 text-red-600 dark:text-red-400";
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-sm font-bold", tone)}>
      {score}/100
    </span>
  );
}

export default function ProjectWorkbench({ project }: { project: Project }) {
  const { done } = useProgress();
  // TEMP: gating désactivé pour tester — remettre la ligne ci-dessous
  // const unlocked = project.chapters.every((slug) => done.has(slug));
  const unlocked = true;

  const [code, setCode] = useState(project.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResponse | null>(null);

  const runTests = async () => {
    if (!project.tests) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: `${code}\n\n${project.tests}` }),
      });
      setResult((await res.json()) as RunResult);
    } catch {
      setResult({ success: false, stdout: "", stderr: "Erreur réseau. Réessaie." });
    } finally {
      setRunning(false);
    }
  };

  const askReview = async () => {
    setReviewing(true);
    setReview(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, contexte: `${project.title} — ${project.tagline}` }),
      });
      setReview((await res.json()) as ReviewResponse);
    } catch {
      setReview({ ok: false, message: "Erreur réseau. Réessaie." });
    } finally {
      setReviewing(false);
    }
  };

  const testsPassed = result?.success === true;

  return (
    <article>
      <Button variant="ghost" size="sm" className="mb-4" render={<Link href="/projets" />}>
        <ArrowLeft /> Tous les projets
      </Button>

      <header className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className={cn("capitalize", diffStyle[project.difficulty])}>
            {project.difficulty}
          </Badge>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {project.minutes} min
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
          {project.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{project.tagline}</p>
        <p className="mt-4 leading-7 text-foreground/90">{project.context}</p>
      </header>

      {!unlocked ? (
        <Gate project={project} done={done} />
      ) : (
        <Tabs defaultValue="cahier">
          <TabsList variant="line" className="mb-5">
            <TabsTrigger value="cahier">
              <ClipboardList /> Cahier des charges
            </TabsTrigger>
            <TabsTrigger value="editeur">
              <Code2 /> Éditeur
            </TabsTrigger>
            <TabsTrigger value="extensions">
              <Rocket /> Pour aller plus loin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cahier">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="size-4 text-primary" /> Objectifs
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                {project.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            <ol className="mt-5 space-y-3">
              {project.steps.map((s, i) => (
                <li key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="font-semibold text-foreground">{s.title}</div>
                  <p className="mt-1 text-sm leading-6 text-foreground/85">
                    {renderInline(s.detail)}
                  </p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="editeur">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Ton implémentation</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCode(project.starter);
                    setResult(null);
                    setReview(null);
                  }}
                >
                  <RotateCcw /> Réinitialiser
                </Button>
                {project.tests && (
                  <Button size="sm" variant="outline" onClick={runTests} disabled={running}>
                    {running ? <Loader2 className="animate-spin" /> : <Play />}
                    {running ? "Compilation…" : "Tests d'acceptation"}
                  </Button>
                )}
                <Button size="sm" onClick={askReview} disabled={reviewing}>
                  {reviewing ? <Loader2 className="animate-spin" /> : <Bot />}
                  {reviewing ? "Analyse…" : "Faire relire par l'IA"}
                </Button>
              </div>
            </div>

            <CodeEditor value={code} onValueChange={setCode} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Implémente le projet ci-dessus. Les tests utilisent le vrai compilateur Rust ; la
              relecture IA propose des améliorations idiomatiques.
            </p>

            {result && (
              <div
                className={cn(
                  "mt-4 overflow-hidden rounded-xl border",
                  testsPassed ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold",
                    testsPassed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {testsPassed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {testsPassed
                    ? "Bravo, tous les tests d'acceptation passent !"
                    : "Les tests ne passent pas encore — regarde la sortie."}
                </div>
                {(result.stdout || result.stderr) && (
                  <pre className="max-h-72 overflow-auto border-t border-border bg-code-bg p-4 font-mono text-xs leading-relaxed text-zinc-300">
                    {result.stdout}
                    {result.stderr}
                  </pre>
                )}
              </div>
            )}

            {review && <ReviewPanel review={review} />}
          </TabsContent>

          <TabsContent value="extensions">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Rocket className="size-4 text-primary" /> Défis bonus
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
                {project.extensions.map((e, i) => (
                  <li key={i}>{renderInline(e)}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </article>
  );
}

function ReviewPanel({ review }: { review: ReviewResponse }) {
  if (!review.ok || !review.revue) {
    return (
      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
          {review.needsKey ? <Settings className="size-4" /> : <XCircle className="size-4" />}
          {review.needsKey ? "Relecture IA à configurer" : "Relecture indisponible"}
        </div>
        <p className="text-sm text-foreground/85">{review.message}</p>
      </div>
    );
  }

  const r = review.revue;
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-primary/30 bg-primary/4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Bot className="size-5 text-primary" /> Relecture de l&apos;IA
        </div>
        <ScoreBadge score={r.score} />
      </div>
      {r.resume && <p className="text-sm leading-6 text-foreground/90">{r.resume}</p>}

      {r.points_forts.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <ThumbsUp className="size-4" /> Points forts
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {r.points_forts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {r.problemes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">Améliorations possibles</div>
          {r.problemes.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("capitalize", sevStyle[p.severite])}>
                  {p.severite}
                </Badge>
                <span className="font-semibold text-foreground">{p.titre}</span>
              </div>
              {p.explication && (
                <p className="mt-1.5 text-sm leading-6 text-foreground/85">{p.explication}</p>
              )}
              {p.suggestion && (
                <pre className="mt-2 overflow-auto rounded-lg border border-border bg-code-bg p-3 font-mono text-xs leading-relaxed text-zinc-300">
                  {p.suggestion}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {r.idiomatique.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary">
            <Lightbulb className="size-4" /> Plus idiomatique
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {r.idiomatique.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {r.securite.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            <ShieldAlert className="size-4" /> Sûreté & robustesse
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {r.securite.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3" /> Généré par IA — à prendre comme une piste, pas une vérité
        absolue.
      </p>
    </div>
  );
}
