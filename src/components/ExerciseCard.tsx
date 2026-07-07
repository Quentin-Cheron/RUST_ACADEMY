"use client";

import { useState } from "react";
import {
  Hammer,
  Pencil,
  ClipboardList,
  CheckCircle2,
  FlaskConical,
  Play,
  RotateCcw,
  Lightbulb,
  Loader2,
  XCircle,
  ListChecks,
} from "lucide-react";
import type { CodeLanguage, Check, Exercise } from "@/content/types";
import type { Runner } from "@/content/courses";
import { renderInline } from "@/lib/inline";
import CodeBlock from "./CodeBlock";
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

interface RunResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface CheckResult {
  label: string;
  passed: boolean;
}

/** Évalue les critères (regex) d'un exercice « checks » directement dans le navigateur. */
function evaluateChecks(code: string, checks: Check[]): CheckResult[] {
  return checks.map((c) => {
    let matched = false;
    try {
      matched = new RegExp(c.pattern, c.flags ?? "im").test(code);
    } catch {
      matched = false;
    }
    return { label: c.label, passed: c.negate ? !matched : matched };
  });
}

export default function ExerciseCard({
  exercise,
  big = false,
  runner = "rust",
  language,
}: {
  exercise: Exercise;
  big?: boolean;
  runner?: Runner;
  language?: CodeLanguage;
}) {
  const editorLang: CodeLanguage = exercise.language ?? language ?? "rust";
  const [revealed, setRevealed] = useState(false);
  const [code, setCode] = useState(exercise.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [checkResults, setCheckResults] = useState<CheckResult[] | null>(null);

  const resetOutput = () => {
    setResult(null);
    setCheckResults(null);
  };

  // Runner « rust » : compilation + tests réels via le Rust Playground.
  const runRustTests = async () => {
    setRunning(true);
    resetOutput();
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: `${code}\n\n${exercise.tests ?? ""}` }),
      });
      const data = (await res.json()) as RunResult;
      setResult(data);
    } catch {
      setResult({ success: false, stdout: "", stderr: "Erreur réseau. Réessaie." });
    } finally {
      setRunning(false);
    }
  };

  // Runner « go » : exécution via le Go Playground.
  // Si l'exercice a des tests, on les combine. Sinon on fallback sur checks.
  const runGoCode = async () => {
    // Pas de tests → fallback sur checks
    if (!exercise.tests && exercise.checks?.length) {
      runChecks();
      return;
    }
    setRunning(true);
    resetOutput();
    try {
      const res = await fetch("/api/run-go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, tests: exercise.tests }),
      });
      const data = (await res.json()) as RunResult;
      setResult(data);
    } catch {
      setResult({ success: false, stdout: "", stderr: "Erreur réseau. Réessaie." });
    } finally {
      setRunning(false);
    }
  };

  // Runner « checks » : validation par critères, dans le navigateur.
  const runChecks = () => {
    const results = evaluateChecks(code, exercise.checks ?? []);
    setResult(null);
    setCheckResults(results);
  };

  /** Le runner effectif pour cet exercice : « go » fallback sur checks si pas de tests. */
  const effectiveRunner =
    runner === "go" && !exercise.tests && exercise.checks?.length
      ? "checks"
      : runner;

  const handleRun = () => {
    if (effectiveRunner === "checks") runChecks();
    else if (effectiveRunner === "go") void runGoCode();
    else void runRustTests();
  };

  const testsPassed =
    effectiveRunner === "checks"
      ? checkResults !== null && checkResults.every((c) => c.passed)
      : result?.success === true;
  const hasOutput = effectiveRunner === "checks" ? checkResults !== null : result !== null;

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-2xl border",
        big ? "border-primary/40 bg-primary/[0.04]" : "border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            {big ? <Hammer className="size-5" /> : <Pencil className="size-5" />}
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {big ? "Gros projet" : "Exercice"}
            </div>
            <h4 className="font-bold text-foreground">{exercise.title}</h4>
          </div>
        </div>
        <Badge variant="outline" className={cn("capitalize", diffStyle[exercise.difficulty])}>
          {exercise.difficulty}
        </Badge>
      </div>

      <div className="p-5">
        <Tabs
          defaultValue="enonce"
          onValueChange={(v) => {
            if (v === "solution") setRevealed(true);
          }}
        >
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="enonce">
              <ClipboardList /> Énoncé & éditeur
            </TabsTrigger>
            <TabsTrigger value="solution">
              <CheckCircle2 /> Solution
            </TabsTrigger>
            <TabsTrigger value="tests">
              {effectiveRunner === "checks" ? <ListChecks /> : <FlaskConical />}{" "}
              {effectiveRunner === "checks" ? "Critères" : "Tests"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enonce">
            <p className="leading-7 text-foreground/90">{renderInline(exercise.prompt)}</p>

            {exercise.hints && exercise.hints.length > 0 && (
              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lightbulb className="size-4 text-amber-500" /> Indices
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                  {exercise.hints.map((h, i) => (
                    <li key={i}>{renderInline(h)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">Ton code</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCode(exercise.starter);
                      resetOutput();
                    }}
                  >
                    <RotateCcw /> Réinitialiser
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCode(exercise.solution);
                      resetOutput();
                    }}
                  >
                    <CheckCircle2 /> Charger la solution
                  </Button>
                  <Button size="sm" onClick={handleRun} disabled={running}>
                    {running ? <Loader2 className="animate-spin" /> : <Play />}
                    {running
                      ? "Compilation…"
                      : effectiveRunner === "checks"
                        ? "Vérifier"
                        : "Exécuter les tests"}
                  </Button>
                </div>
              </div>

              <CodeEditor value={code} onValueChange={setCode} language={editorLang} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {effectiveRunner === "checks"
                  ? "Écris ta réponse ci-dessus. On vérifie chaque critère attendu (commande, options, fichier…)."
                  : effectiveRunner === "go"
                    ? "Écris ta solution ci-dessus. Le code est compilé et exécuté sur le Go Playground officiel."
                    : "Écris ta solution ci-dessus. Les tests unitaires sont ajoutés automatiquement puis compilés avec le vrai compilateur Rust."}
              </p>

              {hasOutput && (
                <div
                  className={cn(
                    "mt-4 overflow-hidden rounded-xl border",
                    testsPassed
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold",
                      testsPassed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {testsPassed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                    {testsPassed
                      ? effectiveRunner === "checks"
                        ? "Parfait, tous les critères sont remplis !"
                        : "Bravo, tous les tests passent !"
                      : effectiveRunner === "checks"
                        ? "Il manque encore des critères — voir ci-dessous."
                        : "Les tests ne passent pas encore — regarde la sortie."}
                  </div>

                  {effectiveRunner === "checks" && checkResults && (
                    <ul className="space-y-1.5 border-t border-border p-4">
                      {checkResults.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {c.passed ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          ) : (
                            <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                          )}
                          <span className={c.passed ? "text-foreground/90" : "text-muted-foreground"}>
                            {c.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {effectiveRunner !== "checks" && result && (result.stdout || result.stderr) && (
                    <pre className="max-h-72 overflow-auto border-t border-border bg-code-bg p-4 font-mono text-xs leading-relaxed text-zinc-300">
                      {result.stdout}
                      {result.stderr}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="solution">
            {revealed ? (
              <CodeBlock
                code={exercise.solution}
                language={editorLang}
                caption="Solution proposée (une parmi d'autres)"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Essaie d&apos;abord par toi-même dans l&apos;éditeur avant de regarder.
                </p>
                <Button onClick={() => setRevealed(true)}>Afficher la solution</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests">
            {effectiveRunner === "checks" ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Ta réponse est validée dès que tous ces critères sont remplis :
                </p>
                <ul className="space-y-2">
                  {(exercise.checks ?? []).map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground/90"
                    >
                      <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
                      {c.label}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Voici les tests unitaires qui valident ta solution (ajoutés automatiquement quand tu
                  cliques sur « Exécuter les tests »).
                </p>
                <CodeBlock code={exercise.tests ?? ""} language={effectiveRunner === "go" ? "go" : "rust"} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
