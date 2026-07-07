# Conventions & pièges

## Next.js 16 (App Router)

- `params` et `searchParams` sont des **`Promise`** → `const { chapter } = await params;`.
- Type les pages avec le helper **global** `PageProps<"/cours/[chapter]">` (généré à `next dev`/`build`, pas d'import).
- Pages = Server Components par défaut. `"use client"` seulement quand il faut (état, effets, event handlers, hooks).
- Routes dynamiques : `generateStaticParams()` pour pré-générer (`/cours/[chapter]`, `/projets/[slug]`).
- Route handlers (`app/api/**/route.ts`) : exporter `GET`/`POST`… Ajouter `export const runtime = "nodejs"` si accès DB / réseau serveur.
- **Avant de coder du Next**, jette un œil aux guides embarqués : `node_modules/next/dist/docs/` (cf. `AGENTS.md`).

## TypeScript / structure

- Contenu = données typées, jamais de JSX pour le cours (cf. `content-authoring.md`).
- Imports via l'alias `@/*` (= `src/*`).
- `cn()` (`src/lib/utils.ts`) pour composer les classes conditionnelles.
- Le client Prisma s'importe depuis `@/generated/prisma/client` (généré par `pnpm db:generate`, hors `node_modules`).

## Base UI / shadcn

- Composition = prop **`render`** (pas `asChild`).
- Ne pas modifier `src/components/ui/*` à la main.

## Tailwind v4

- Pas de `tailwind.config`. Thème dans `globals.css`.
- Utilise les **tokens** (`bg-primary`, `text-muted-foreground`), pas `bg-[--var]` (invalide en v4) ni couleurs en dur.

## Windows / PowerShell (⚠️ encodage)

- Windows PowerShell 5.1 lit en ANSI/Windows-1252 : un round-trip `Get-Content -Raw` → `Set-Content -Encoding utf8` **corrompt** accents et emoji (`Ã©`, `âœ“`). Le contenu est plein d'accents français → **ne jamais** faire ça.
- Pour éditer/remplacer dans des fichiers non-ASCII : outils **Edit/Write** (UTF-8 fiable) ou le **Bash tool** (`sed`).
- Le shell Bash de l'environnement est disponible en parallèle de PowerShell ; `find`/`grep`/`sed` y fonctionnent normalement.

## Rust (contenu exécuté)

- Edition **2021**. Le code des exemples et surtout des `solution` doit **compiler et passer les `tests`**.
- Les exercices tournent en `crateType: "lib"` (`cargo test`) : pas besoin de `fn main` dans `tests`.
- Vérif locale possible : `rustc --edition 2021 --test fichier.rs`.

## Checklist avant de considérer une tâche terminée

1. `npx tsc --noEmit` → 0 erreur (typecheck des 22 chapitres + composants).
2. `pnpm build` → build OK, pages générées (filet de sécurité complet).
3. Si contenu Rust ajouté : la `solution` fait passer les `tests` (idéalement compilé).
4. Si UI modifiée : vérifier en clair **et** sombre, desktop **et** mobile (sidebar → Sheet).
5. Rien de codé en dur qui aurait dû être un token de couleur.

## Lancer / vérifier en local

```bash
pnpm dev                     # http://localhost:3000
# vérif de non-régression rapide :
npx tsc --noEmit
pnpm build
```

Le proxy `/api/run` nécessite un accès internet (Rust Playground). Auth + progression serveur + IA nécessitent `.env` (voir `.env.example`) ; sans, le reste fonctionne (mode invité / localStorage).
