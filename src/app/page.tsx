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
} from "lucide-react";
import { chapters, totalExercises } from "@/content";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BookOpen,
    title: "Tout le Rust Book",
    text: "Les 20 chapitres du livre officiel, réexpliqués en français, clairement et progressivement.",
  },
  {
    icon: Code2,
    title: "Des exemples concrets",
    text: "Chaque notion est illustrée par du code commenté et son cas d'usage : « dans quel cas c'est utile ».",
  },
  {
    icon: Target,
    title: "Des exercices ciblés",
    text: "Des petits exercices pour ancrer chaque concept, du plus facile au plus difficile.",
  },
  {
    icon: FlaskConical,
    title: "Des tests unitaires",
    text: "Chaque exercice a sa suite de tests à faire passer avec cargo test, comme en conditions réelles.",
  },
  {
    icon: Rocket,
    title: "Un gros projet par chapitre",
    text: "Un projet plus ambitieux à la fin de chaque chapitre pour mettre en pratique l'ensemble.",
  },
  {
    icon: ShieldCheck,
    title: "Suivi de progression",
    text: "Marque les chapitres terminés et suis ta progression, sauvegardée dans ton navigateur.",
  },
];

export default function Home() {
  const nbExos = totalExercises();

  return (
    <div className="min-h-screen">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
              R
            </span>
            <span className="font-black text-foreground">Rust Academy</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button render={<Link href={`/cours/${chapters[0].slug}`} />}>
              Commencer <ArrowRight />
            </Button>
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
            <Zap className="size-3" /> Formation gratuite &bull; basée sur le Rust Book officiel
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-foreground lg:text-6xl">
            Apprends <span className="text-primary">Rust</span>{" "}de zéro, jusqu&apos;à la maîtrise.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Un cours complet, chapitre par chapitre, avec des explications claires, des exemples concrets,
            des cas d&apos;usage, des exercices et des tests unitaires. Exactement comme en entreprise.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href={`/cours/${chapters[0].slug}`} />}>
              Démarrer le chapitre 1 <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#programme" />}>
              Voir le programme
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            <Stat value={`${chapters.length}`} label="Chapitres" />
            <Stat value={`${nbExos}+`} label="Exercices & projets" />
            <Stat value="100%" label="Avec tests" />
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground">
          Une pédagogie pensée pour progresser
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Chaque chapitre suit la même structure : on comprend, on voit un exemple, on découvre à quoi ça
          sert, puis on pratique.
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

      {/* Programme */}
      <section id="programme" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground">Le programme complet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          {chapters.length}{" "}chapitres pour aller des bases jusqu&apos;aux concepts avancés de Rust.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.slug}
              href={`/cours/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {c.number}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {c.minutes} min
                </span>
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.subtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Commencer <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 pb-24 lg:px-8">
        <div className="rounded-3xl border border-primary/30 bg-primary/[0.06] p-10 text-center">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Prêt à écrire du Rust ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Installe Rust, ouvre ton éditeur et commence dès maintenant. Chaque concept est expliqué pas à
            pas.
          </p>
          <Button size="lg" className="mt-6" render={<Link href={`/cours/${chapters[0].slug}`} />}>
            Commencer gratuitement <ArrowRight />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Rust Academy — Un cours communautaire inspiré du{" "}
        <a
          href="https://doc.rust-lang.org/book/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Rust Book
        </a>
        .
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-3xl font-black text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
