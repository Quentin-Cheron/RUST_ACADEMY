# Architecture

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn/ui (Base UI). Base `create-next-app` enrichie de : auth, PostgreSQL/Prisma, progression serveur, tuteur IA, relecture IA, espaces Projets & Révisions, recherche globale.

## Vue d'ensemble des routes

| Route | Type | Rôle |
|---|---|---|
| `/` | statique | Landing (hero, features, programme) |
| `/cours/[chapter]` | SSG | Une page par chapitre (`generateStaticParams`) |
| `/projets` · `/projets/[slug]` | SSG | Liste + workbench de projet |
| `/reviser` | client | Exercices transversaux |
| `/connexion` | statique | Auth (email/mot de passe) |
| `/api/run` | dynamique | Compile code + tests via Rust Playground |
| `/api/chat` | dynamique | Tuteur IA (OpenRouter) |
| `/api/review` | dynamique | Relecture de code IA (OpenRouter) |
| `/api/progress` | dynamique | Progression persistée (session requise) |
| `/api/auth/[...all]` | dynamique | better-auth (catch-all) |

## 1. Exécution du code Rust — `/api/run`

Cœur de la promesse pédagogique. Le client (`ExerciseCard`, `ProjectWorkbench`) envoie `{ code }` où `code = codeUtilisateur + "\n\n" + tests`. La route proxy vers `https://play.rust-lang.org/execute` (`crateType: "lib"`, `tests: true`, `edition: "2021"`, timeout 30 s) et renvoie `{ success, stdout, stderr }`. Proxy **serveur** → pas de souci CORS. Aucune config requise (juste un accès internet).

## 2. Authentification — better-auth

- Lib : **better-auth** (pas NextAuth). Provider : **email + mot de passe** uniquement (mot de passe ≥ 8 caractères).
- `src/lib/auth.ts` : `betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true }, plugins: [nextCookies()] })`.
- `src/lib/auth-client.ts` : `createAuthClient()` → `signIn, signUp, signOut, useSession`.
- `src/app/api/auth/[...all]/route.ts` : `export const { GET, POST } = toNextJsHandler(auth.handler)`.
- UI : `src/app/connexion/page.tsx` + `src/components/AuthForm.tsx` (onglets, messages d'erreur traduits en français). La `Sidebar` affiche l'état de session (`useSession`) : lien connexion ou bouton déconnexion.
- **Pas de protection au niveau routing** (pas de `middleware.ts`). Seule `/api/progress` renvoie 401 sans session.
- Env : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## 3. Base de données — Prisma 7 + PostgreSQL

- `prisma/schema.prisma` : generator `prisma-client` avec `output = "../src/generated/prisma"` (client hors `node_modules`, ignoré par git via `/src/generated/`).
- `prisma.config.ts` : config Prisma 7 (`schema`, `migrations.path`, `datasource.url = env("DIRECT_URL")`, `import "dotenv/config"`).
- `src/lib/prisma.ts` : `PrismaClient` (depuis `@/generated/prisma/client`) + adaptateur `@prisma/adapter-pg` (`PrismaPg({ connectionString: DATABASE_URL })`), singleton via `globalForPrisma`.
- Modèles (`@@map` snake_case) : `User`, `Session`, `Account`, `Verification` (standard better-auth) + **`ChapterProgress`** (`userId`, `slug`, `completedAt`, `@@unique([userId, slug])`) = l'ajout métier.
- Deux URLs : `DATABASE_URL` (runtime, éventuel pooler) et `DIRECT_URL` (migrations). Flux de dev : `pnpm db:push`.

## 4. Progression — hybride invité/serveur

`src/lib/progress.ts` (hook `useProgress`, store maison via `useSyncExternalStore`, clé localStorage `rust-academy:progress`) + `src/app/api/progress/route.ts`.

- **Invité** : lecture/écriture localStorage, synchro inter-onglets (event `storage`).
- **À la connexion** : `PUT /api/progress` envoie les slugs locaux → fusion serveur (`createMany … skipDuplicates`) → renvoie la liste complète. (« ta progression locale est rattachée au compte ».)
- **Toggle connecté** : maj optimiste + `POST /api/progress { slug, done }` → `upsert` / `deleteMany`.
- **`GET`** : slugs du compte. Repli localStorage si réseau KO.

## 5. Tuteur IA par chapitre — `/api/chat` + `ChapterChat`

- Provider : **OpenRouter** en `fetch` brut (pas de SDK), **sans streaming** (JSON complet).
- Cascade de modèles gratuits (bascule au moindre 429/5xx/timeout, temp 0.3, timeout 22 s) : `meta-llama/llama-3.3-70b-instruct:free`, `google/gemma-…:free`, `qwen/…:free`.
- La route construit un contexte compact du chapitre (`buildContext(slug)` : titre, objectifs, sections+`number`, blocs sans code brut, takeaways ; tronqué à 6000 car.). Prompt système FR strict. Limites : message 2000 car., historique 8 derniers. **Rate-limit maison en mémoire** : 12 req / 5 min par IP.
- `ChapterChat.tsx` : panneau flottant, monté dans `cours/[chapter]/page.tsx`, rend le Markdown léger des réponses, garde l'historique côté client.
- Env : `OPENROUTER_API_KEY` (sinon `needsKey`), `NEXT_PUBLIC_CHAT_ENABLED="false"` désactive tout.

## 6. Projets — `/projets` + `ProjectWorkbench`

- `src/content/projects.ts` : `projects: Project[]` (`todo-cli`, `calculatrice`, `analyseur-logs`, `banque`). Type `Project` : slug, title, tagline, difficulty, minutes, `chapters` (gating), context, objectives, `steps`, starter, `tests?`, extensions.
- Pages : `projets/page.tsx` → `ProjectList` ; `projets/[slug]/page.tsx` → SSG + `getProject` sinon `notFound`.
- `ProjectWorkbench.tsx` : onglets **Cahier des charges / Éditeur / Pour aller plus loin**. « Tests d'acceptation » → `/api/run`. « Faire relire par l'IA » → `/api/review`.
- **Gating actif** : un projet est verrouillé tant que ses `chapters` prérequis ne sont pas tous terminés (`project.chapters.every(slug => done.has(slug))` dans `ProjectList.tsx` et `ProjectWorkbench.tsx`).

## 7. Relecture de code IA — `/api/review`

Malgré son nom, ce **n'est pas** l'API des révisions : c'est la relecture utilisée par les Projets. Même provider/modèles qu'OpenRouter mais **réponse JSON structurée** (`response_format: json_object`) : `{ score, resume, points_forts, problemes[], idiomatique, securite }`. Prompt système = « relecteur Rust senior ». `MAX_CODE_LENGTH = 12000`. Requiert `OPENROUTER_API_KEY`.

## 8. Révisions — `/reviser`

Exercices **transversaux** (mélangent plusieurs chapitres), pas de SRS/flashcards.

- `src/content/review.ts` : `reviewExercises: ReviewExercise[]` (`Exercise` + `chapters: string[]`).
- `ReviewList.tsx` : filtre par difficulté, gating via `useProgress()` (`chapters.every(slug => done.has(slug))`), `LockedCard` liste les chapitres à finir. Débloqués → rendus via `ExerciseCard` (donc exécutés via `/api/run`).

## 9. Recherche globale — `SearchDialog` + `lib/search.ts`

Index en mémoire construit à la volée depuis `chapters` + `reviewExercises` + `projects` (types : `chapitre`, `section`, `exercice`, `projet`, `projet-réel`, `révision`). Normalisation accents/casse maison, scoring titre > texte > code, extraits + surlignage. Zéro dépendance/env. Résultats → `/cours/[slug]#ancre`, `/projets/[slug]`, `/reviser`.

## 10. Contenu

22 chapitres (`ch01`→`ch22`), triés par `number` dans `index.ts`. `ch21` = serveur web multithreadé ; `ch22` = Annexes (A–E). Voir [`content-authoring.md`](content-authoring.md) pour le modèle de données détaillé.

## Dépendances clés

`better-auth`, `@prisma/client` + `@prisma/adapter-pg` (+ `prisma`, `dotenv`), `@base-ui/react`, `shadcn`, `lucide-react`, `react-simple-code-editor`, `highlight.js`, `next` 16 / `react` 19. **Aucun SDK IA** (OpenRouter en `fetch`). Géré avec **pnpm** (`pnpm-lock.yaml`, `pnpm.onlyBuiltDependencies`).
