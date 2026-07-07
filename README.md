# 🦀 Rust Academy

Une plateforme d'apprentissage de **Rust** en français, dans l'esprit de Dyma : cours structuré chapitre par chapitre, exemples commentés, cas d'usage concrets (« dans quel cas c'est utile »), exercices et **gros projets avec tests unitaires exécutables dans le navigateur**.

Le contenu suit le [Rust Book officiel](https://doc.rust-lang.org/book/), du « Hello, world! » jusqu'au serveur web multithreadé.

---

## ✨ Fonctionnalités

- **22 chapitres** couvrant tout le Rust Book (ch. 1 à 21 + Annexes), en français.
- Chaque chapitre : explications, exemples de code colorés, blocs **cas d'usage**, **exercices** (facile → difficile) et **un gros projet** de fin de chapitre.
- **Éditeur de code intégré** : l'apprenant écrit sa solution et clique sur *Exécuter les tests* — le code + les tests `#[cfg(test)]` sont **réellement compilés** par le compilateur Rust officiel (via le [Rust Playground](https://play.rust-lang.org)).
- **Tuteur IA par chapitre** : un chat ancré sur le contenu du chapitre courant (via OpenRouter, modèles gratuits).
- **Relecture de code par IA** : sur les projets, un « senior » relit ton code (score, points forts, problèmes, idiomatique, sûreté).
- **Espace Projets** : projets applicatifs réalistes avec cahier des charges, éditeur, tests d'acceptation.
- **Espace Révisions** : exercices transversaux qui mélangent plusieurs chapitres (débloqués quand les chapitres requis sont terminés).
- **Recherche globale** instantanée (chapitres, sections, exercices, projets), sans dépendance externe.
- **Authentification** (email/mot de passe) + **progression synchronisée** sur le compte (ou en localStorage en mode invité).
- **Thème clair/sombre**, accent orange Rust, UI [shadcn/ui](https://ui.shadcn.com).

---

## 🧱 Stack technique

| Domaine | Techno |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19** |
| Styles | **Tailwind CSS v4**, **shadcn/ui** (style `base-nova`, primitives **Base UI**) |
| Contenu | Modules **TypeScript** typés (`src/content`) |
| Éditeur / coloration | `react-simple-code-editor` + `highlight.js` |
| Exécution Rust | Proxy serveur vers le **Rust Playground** (`/api/run`) |
| IA (chat + review) | **OpenRouter** (appel `fetch`, modèles `:free`) |
| Auth | **better-auth** (email + mot de passe) |
| Base de données | **PostgreSQL** via **Prisma 7** (`@prisma/adapter-pg`) |

---

## 🚀 Démarrage

> Le projet est géré avec **pnpm** (présence de `pnpm-lock.yaml`), mais `npm` fonctionne aussi.

### 1. Installer les dépendances

```bash
pnpm install      # ou : npm install
```

### 2. Configurer l'environnement

Crée un fichier `.env` à la racine (voir [`.env.example`](.env.example)) :

```bash
# Base de données PostgreSQL (Neon, Supabase, local…)
DATABASE_URL="postgresql://user:pass@host:5432/rust_academy"
DIRECT_URL="postgresql://user:pass@host:5432/rust_academy"   # connexion directe (migrations)

# Authentification (better-auth)
BETTER_AUTH_SECRET="une-chaine-aleatoire-longue"
BETTER_AUTH_URL="http://localhost:3000"

# IA (facultatif — sans clé, chat & relecture affichent une invite)
OPENROUTER_API_KEY="sk-or-..."
# NEXT_PUBLIC_CHAT_ENABLED="false"   # pour désactiver complètement le tuteur IA
```

### 3. Préparer la base de données

```bash
pnpm db:generate   # génère le client Prisma (src/generated/prisma)
pnpm db:push       # crée les tables dans la base
```

### 4. Lancer

```bash
pnpm dev           # http://localhost:3000
```

> **Sans base de données ni clé IA**, le cœur pédagogique fonctionne quand même : lecture des chapitres, éditeur de code et **exécution des tests** (Rust Playground), recherche, progression en localStorage. L'auth, la progression serveur et l'IA nécessitent la config ci-dessus.

---

## 📜 Scripts

| Script | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | `prisma generate` + build de production |
| `pnpm start` | Serveur de production |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:push` | Applique le schéma à la base (sans migration) |
| `pnpm db:migrate` | Crée/applique une migration de dev |
| `pnpm db:studio` | Interface Prisma Studio |

---

## 🗂️ Structure du projet

```
src/
├─ app/
│  ├─ page.tsx                 # Landing
│  ├─ cours/[chapter]/page.tsx # Une page par chapitre (SSG)
│  ├─ projets/                 # Espace projets + workbench
│  ├─ reviser/                 # Exercices transversaux
│  ├─ connexion/               # Auth
│  └─ api/
│     ├─ run/       # Compile le code + tests (Rust Playground)
│     ├─ chat/      # Tuteur IA (OpenRouter)
│     ├─ review/    # Relecture de code IA (OpenRouter)
│     ├─ progress/  # Progression persistée (session requise)
│     └─ auth/      # better-auth (catch-all)
├─ components/                 # Composants (dont ui/ = shadcn)
├─ content/
│  ├─ types.ts                 # Modèle de données (Chapter, Exercise…)
│  ├─ index.ts                 # Registre + helpers
│  ├─ chapters/ch01…ch22.ts    # 1 fichier par chapitre
│  ├─ projects.ts              # Projets applicatifs
│  └─ review.ts                # Exercices de révision
└─ lib/                        # auth, prisma, progress, search, utils
```

---

## 📚 Documentation pour contributeurs & agents

L'architecture détaillée, le design system et les conventions d'écriture de contenu vivent dans **[`CLAUDE.md`](CLAUDE.md)** et **[`.claude/docs/`](.claude/docs/)**. À lire avant d'ajouter un chapitre ou un composant.

---

## 📝 Licence & crédits

Projet pédagogique communautaire, inspiré du **Rust Book** (© The Rust Project Developers, licences MIT/Apache-2.0). Le contenu original de Rust Academy est fourni à des fins d'apprentissage.
