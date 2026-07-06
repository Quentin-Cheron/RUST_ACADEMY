import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Target, Sparkles, ListTree } from "lucide-react";
import { chapters, getChapter, getSiblings } from "@/content";
import ContentRenderer from "@/components/ContentRenderer";
import ExerciseCard from "@/components/ExerciseCard";
import CompleteButton from "@/components/CompleteButton";
import ChapterChat from "@/components/ChapterChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cours/[chapter]">) {
  const { chapter } = await params;
  const c = getChapter(chapter);
  if (!c) return {};
  return { title: `${c.number}. ${c.title}`, description: c.subtitle };
}

export default async function ChapterPage({ params }: PageProps<"/cours/[chapter]">) {
  const { chapter } = await params;
  const c = getChapter(chapter);
  if (!c) notFound();

  const { prev, next } = getSiblings(c.slug);

  return (
    <article>
      {/* En-tete */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">Chapitre {c.number}</Badge>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {c.minutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" /> Rust Book : {c.rustBookRef}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">{c.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{c.subtitle}</p>
        <p className="mt-4 leading-7 text-foreground/90">{c.description}</p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="size-4 text-primary" /> Objectifs du chapitre
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {c.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      </header>

      {/* Table des matières */}
      <nav className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ListTree className="size-4 text-primary" /> Dans ce chapitre
        </div>
        <ol className="space-y-1 text-sm">
          {c.sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex items-baseline gap-2 text-foreground/80 transition hover:text-primary"
              >
                {s.number && (
                  <span className="font-mono text-xs font-semibold text-primary">{s.number}</span>
                )}
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#exercices"
              className="inline-flex items-baseline gap-2 font-medium text-foreground/80 transition hover:text-primary"
            >
              <Sparkles className="size-3.5 self-center text-primary" /> Exercices & projet
            </a>
          </li>
        </ol>
      </nav>

      <Separator className="my-8" />

      {/* Sections de cours */}
      {c.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-20">
          <h2 className="mt-10 mb-2 text-2xl font-bold tracking-tight text-foreground">
            {s.number && <span className="mr-2 font-mono text-primary">{s.number}</span>}
            {s.title}
          </h2>
          <ContentRenderer blocks={s.blocks} />
        </section>
      ))}

      <Separator className="my-10" />

      {/* Exercices */}
      <section id="exercices">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sparkles className="size-6 text-primary" /> Exercices pour pratiquer
        </h2>
        <p className="text-muted-foreground">
          Entraine-toi sur ces exercices. Chacun est accompagne de sa solution et de tests unitaires.
        </p>
        {c.exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </section>

      {/* Gros projet */}
      <section id="projet" className="mt-10">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-foreground">
          Projet du chapitre
        </h2>
        <p className="text-muted-foreground">
          Un exercice plus consequent qui combine tout ce que tu viens d&apos;apprendre, avec sa suite de
          tests a faire passer.
        </p>
        <ExerciseCard exercise={c.project} big />
      </section>

      <Separator className="my-10" />

      {/* A retenir */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.05] p-6">
        <h2 className="mb-3 text-xl font-bold text-foreground">A retenir</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-foreground/90">
          {c.keyTakeaways.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
        <div className="mt-6">
          <CompleteButton slug={c.slug} />
        </div>
      </section>

      {/* Navigation */}
      <nav className="mt-10 flex items-center justify-between gap-4">
        {prev ? (
          <Button variant="outline" render={<Link href={`/cours/${prev.slug}`} />}>
            <ArrowLeft /> {prev.title}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button render={<Link href={`/cours/${next.slug}`} />}>
            {next.title} <ArrowRight />
          </Button>
        ) : (
          <span />
        )}
      </nav>

      <ChapterChat chapterSlug={c.slug} chapterTitle={c.title} />
    </article>
  );
}
