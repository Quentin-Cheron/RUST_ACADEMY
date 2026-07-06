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
} from "lucide-react";
import type { Exercise } from "@/content/types";
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

export default function ExerciseCard({ exercise, big = false }: { exercise: Exercise; big?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [code, setCode] = useState(exercise.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const runTests = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // On concatène le code de l'apprenant avec la suite de tests du chapitre.
        body: JSON.stringify({ code: `${code}\n\n${exercise.tests}` }),
      });
      const data = (await res.json()) as RunResult;
      setResult(data);
    } catch {
      setResult({ success: false, stdout: "", stderr: "Erreur réseau. Réessaie." });
    } finally {
      setRunning(false);
    }
  };

  const testsPassed = result?.success === true;

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
              <FlaskConical /> Tests
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
                      setResult(null);
                    }}
                  >
                    <RotateCcw /> Réinitialiser
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCode(exercise.solution);
                      setResult(null);
                    }}
                  >
                    <CheckCircle2 /> Charger la solution
                  </Button>
                  <Button size="sm" onClick={runTests} disabled={running}>
                    {running ? <Loader2 className="animate-spin" /> : <Play />}
                    {running ? "Compilation…" : "Exécuter les tests"}
                  </Button>
                </div>
              </div>

              <CodeEditor value={code} onValueChange={setCode} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Écris ta solution ci-dessus. Les tests unitaires sont ajoutés automatiquement puis
                compilés avec le vrai compilateur Rust.
              </p>

              {result && (
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
                      ? "Bravo, tous les tests passent !"
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
            </div>
          </TabsContent>

          <TabsContent value="solution">
            {revealed ? (
              <CodeBlock
                code={exercise.solution}
                language="rust"
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
            <p className="mb-3 text-sm text-muted-foreground">
              Voici les tests unitaires qui valident ta solution (ajoutés automatiquement quand tu cliques
              sur « Exécuter les tests »).
            </p>
            <CodeBlock code={exercise.tests} language="rust" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
