"use client";

import { Sparkles } from "lucide-react";
import type { Exercise, CodeLanguage } from "@/content/types";
import type { Runner } from "@/content/courses";
import { DockerSessionProvider } from "@/lib/useDockerSession";
import ExerciseCard from "./ExerciseCard";
import DockerTerminal from "./DockerTerminal";

export default function DockerExercisesWrapper({
  exercises,
  project,
  runner,
  language,
}: {
  exercises: Exercise[];
  project: Exercise;
  runner: Runner;
  language: CodeLanguage;
}) {
  return (
    <DockerSessionProvider>
      <section id="exercices">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sparkles className="size-6 text-primary" /> Exercices pour pratiquer
        </h2>
        <p className="text-muted-foreground">
          Entraine-toi sur ces exercices. Chacun est accompagne de sa solution et de sa validation.
        </p>
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} runner={runner} language={language} />
        ))}
      </section>

      <section id="projet" className="mt-10">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-foreground">
          Projet du chapitre
        </h2>
        <p className="text-muted-foreground">
          Un exercice plus consequent qui combine tout ce que tu viens d&apos;apprendre, avec sa
          validation a faire passer.
        </p>
        <ExerciseCard exercise={project} big runner={runner} language={language} />
      </section>

      {/* Terminal libre (collapse) pour exploration */}
      <section id="terminal" className="mt-10">
        <DockerTerminal useSharedSession />
      </section>
    </DockerSessionProvider>
  );
}
