@AGENTS.md

# Rust Academy — guide pour agents

Plateforme d'apprentissage de **Rust** en français (esprit Dyma), basée sur le Rust Book. Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui (Base UI). Contenu de cours = modules TypeScript typés.

Lis d'abord ce fichier, puis le doc pertinent dans **`.claude/docs/`** avant de coder ou d'écrire du contenu.

## 📖 Documentation détaillée

| Doc | Quand la lire |
|---|---|
| [`.claude/docs/architecture.md`](.claude/docs/architecture.md) | Comprendre les features (auth, DB, IA, run, révisions, projets, recherche) et le flux de données |
| [`.claude/docs/content-authoring.md`](.claude/docs/content-authoring.md) | **Écrire ou modifier un chapitre / exercice / projet** — modèle de données, blocs, règles sur les tests |
| [`.claude/docs/design-system.md`](.claude/docs/design-system.md) | Couleurs, tokens, thème clair/sombre, patterns shadcn/Base UI |
| [`.claude/docs/conventions.md`](.claude/docs/conventions.md) | Pièges Next 16 / Tailwind v4 / Base UI / Windows PowerShell, checklist de vérif |

## 🧭 Règles d'or

1. **Cette version de Next.js diffère de tes souvenirs** (cf. `AGENTS.md`). `params`/`searchParams` sont des `Promise` à `await`. Type les pages avec le helper global `PageProps<"/route/[slug]">`.
2. **Tailwind v4** : pas de fichier `tailwind.config`. Le thème vit dans `src/app/globals.css` (`@theme`, `@custom-variant dark`). N'utilise **pas** la syntaxe `class-[--var]` : utilise les utilitaires de tokens (`bg-primary`, `text-muted-foreground`, `border-border`…) ou `bg-(--var)` / `bg-[var(--var)]`.
3. **shadcn = style `base-nova` (Base UI, pas Radix)**. Composition via la prop **`render`** (ex. `<Button render={<Link href="…" />}>`), et non `asChild`. Composants dans `src/components/ui/` — ne pas les modifier à la main, les régénérer si besoin.
4. **Contenu ≠ code** : tout le cours est de la **donnée** typée dans `src/content/`. Pour ajouter/éditer un chapitre, on touche `src/content/chapters/chNN.ts`, jamais les composants de rendu.
5. **Le code Rust doit compiler.** Les exercices sont exécutés pour de vrai (Rust Playground). Chaque `solution` doit faire passer ses `tests`. Vérifie mentalement, et si possible avec `rustc --edition 2021 --test`.
6. **Windows / encodage** : ne jamais faire de round-trip `Get-Content`/`Set-Content` (PowerShell 5.1) sur des fichiers contenant accents/emoji → ça les corrompt. Utilise les outils Edit/Write ou `sed`.

## ⚙️ Commandes

```bash
pnpm dev            # dev (http://localhost:3000)
pnpm build          # prisma generate + next build (valide TS + génère les pages)
pnpm lint
pnpm db:generate    # client Prisma → src/generated/prisma
pnpm db:push        # applique le schéma à la base
```

Après une modif de contenu, `pnpm build` (ou `npx tsc --noEmit`) est le filet de sécurité : il typecheck les 22 chapitres et pré-génère les pages.

## 🗺️ Où se trouve quoi

- Pages : `src/app/**` — `cours/[chapter]`, `projets/*`, `reviser/*`, `connexion`, `api/*`.
- Rendu du cours : `src/components/ContentRenderer.tsx` (blocs), `ExerciseCard.tsx` (éditeur + run + review), `CodeBlock.tsx`, `CodeEditor.tsx`.
- Données : `src/content/types.ts` (schéma), `index.ts` (registre), `chapters/`, `projects.ts`, `review.ts`.
- Libs : `src/lib/` — `auth.ts`, `prisma.ts`, `progress.ts`, `search.ts`, `utils.ts` (`cn`).
- Env : voir `.env.example`. Le cœur pédagogique (lecture, éditeur, run des tests, recherche) marche **sans** DB ni clé IA.

## ⚠️ À savoir

- Le **gating des projets est actif** : un projet reste verrouillé tant que ses `chapters` prérequis ne sont pas tous terminés (`project.chapters.every(slug => done.has(slug))` dans `ProjectList.tsx` et `ProjectWorkbench.tsx`).
- Pas de `middleware.ts` : les pages sont accessibles en invité, seule `/api/progress` exige une session.
- Après les ajouts auth/DB, l'env doit être installé pour typechecker/builder : `pnpm install` puis `pnpm db:generate` (génère `src/generated/prisma`), et les types de routes (`PageProps<…>`) se créent au premier `pnpm dev`/`build`.
