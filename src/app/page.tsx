import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Target,
  FlaskConical,
  Rocket,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
} from "lucide-react";
import { courses, totalExercisesIn, type Course } from "@/content/courses";
import ThemeToggle from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Des cours complets",
    text: "Chaque notion est réexpliquée en français, clairement et progressivement, du débutant à l'avancé.",
  },
  {
    icon: Code2,
    title: "Des exemples concrets",
    text: "Du code et des commandes commentés, avec leur cas d'usage : « dans quel cas c'est utile ».",
  },
  {
    icon: Target,
    title: "Des exercices ciblés",
    text: "De petits exercices pour ancrer chaque concept, du plus facile au plus difficile.",
  },
  {
    icon: FlaskConical,
    title: "Une validation immédiate",
    text: "Tests unitaires compilés pour Rust, critères vérifiés pour Docker : tu sais tout de suite si c'est bon.",
  },
  {
    icon: Rocket,
    title: "Un projet par chapitre",
    text: "Un exercice plus ambitieux à la fin de chaque chapitre pour mettre en pratique l'ensemble.",
  },
  {
    icon: ShieldCheck,
    title: "Suivi de progression",
    text: "Marque les chapitres terminés et suis ta progression, sauvegardée dans ton navigateur.",
  },
];

function CourseCard({ course }: { course: Course }) {
  const nbExos = totalExercisesIn(course);
  const first = course.chapters[0];
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 transition hover:border-primary/50 hover:shadow-lg",
        course.theme,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(400px circle at 85% 0%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 60%)",
        }}
      />
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">
          {course.emblem}
        </span>
        <div>
          <div className="text-lg font-black text-foreground">{course.name}</div>
          <div className="text-sm text-muted-foreground">{course.tagline}</div>
        </div>
      </div>

      <p className="flex-1 leading-relaxed text-foreground/90">{course.blurb}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat icon={Layers} value={`${course.chapters.length}`} label="Chapitres" />
        <MiniStat icon={Target} value={`${nbExos}+`} label="Exercices" />
        <MiniStat
          icon={FlaskConical}
          value={course.runner === "rust" ? "Tests" : "Critères"}
          label="Validation"
        />
      </div>

      <Link href={`/cours/${course.id}/${first.slug}`} className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>
        Commencer {course.short} <ArrowRight />
      </Link>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
      <Icon className="mx-auto mb-1 size-4 text-primary" />
      <div className="text-base font-black text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Home() {
  const rust = courses[0];

  return (
    <div className="min-h-screen">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
              <Code2 className="size-5" />
            </span>
            <span className="font-black text-foreground">Dev Academy</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="#parcours" className={buttonVariants()}>
              Choisir un parcours <ArrowRight />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(600px circle at 20% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center lg:px-8 lg:py-28">
          <Badge variant="outline" className="mb-5 border-primary/40 text-primary">
            <Zap className="size-3" /> Formations gratuites &bull; Rust &amp; Docker
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-foreground lg:text-6xl">
            Apprends en <span className="text-primary">pratiquant</span>, pas juste en lisant.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Deux parcours complets, chapitre par chapitre : des explications claires, des exemples
            concrets, des cas d&apos;usage, des exercices et une validation immédiate. Choisis ta voie
            et bascule de l&apos;une à l&apos;autre quand tu veux.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#parcours" className={buttonVariants({ size: "lg" })}>
              Voir les parcours <ArrowRight />
            </a>
            <Link
              href={`/cours/${rust.id}/${rust.chapters[0].slug}`}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Démarrer avec Rust
            </Link>
          </div>
        </div>
      </section>

      {/* Choix du parcours */}
      <section id="parcours" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
          Choisis ton parcours
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Chaque parcours a son propre univers, ses chapitres et ses exercices. Tu peux passer de
          l&apos;un à l&apos;autre à tout moment depuis le sélecteur dans la barre latérale.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
          Une pédagogie pensée pour progresser
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Chaque chapitre suit la même structure : on comprend, on voit un exemple, on découvre à quoi
          ça sert, puis on pratique.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aperçu des programmes */}
      <section className="mx-auto max-w-6xl px-4 py-8 pb-16 lg:px-8">
        {courses.map((course) => (
          <div key={course.id} className={cn("mb-12 last:mb-0", course.theme)}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-base font-black text-primary-foreground">
                {course.emblem}
              </span>
              <div>
                <h3 className="text-xl font-black text-foreground">
                  Programme {course.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {course.chapters.length} chapitres · {course.tagline}
                </p>
              </div>
              <Link
                href={`/cours/${course.id}/${course.chapters[0].slug}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "ml-auto" })}
              >
                Ouvrir <ArrowRight />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {course.chapters.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cours/${course.id}/${c.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {c.number}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {c.minutes} min
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary">
                    {c.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.subtitle}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Dev Academy — Des cours communautaires pour apprendre{" "}
        <span className="font-medium text-foreground">Rust</span> et{" "}
        <span className="font-medium text-foreground">Docker</span> en pratiquant.
      </footer>
    </div>
  );
}
