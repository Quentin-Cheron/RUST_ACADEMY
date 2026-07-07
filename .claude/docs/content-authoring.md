# Écrire du contenu (chapitres, exercices, projets)

Tout le cours est de la **donnée typée** dans `src/content/`. On n'écrit jamais de JSX pour du contenu : on remplit des objets validés par `src/content/types.ts` et rendus par `ContentRenderer` / `ExerciseCard`.

## Le modèle de données (`src/content/types.ts`)

```ts
Chapter {
  number: number;          // ordre (1..N), sert au tri
  slug: string;            // URL: /cours/<slug>
  title: string;           // titre court (sidebar)
  subtitle: string;        // accroche
  description: string;     // paragraphe d'intro
  minutes: number;         // durée estimée
  rustBookRef: string;     // ex "Chapitre 4 — Understanding Ownership"
  objectives: string[];    // puces "à la fin tu sauras…"
  sections: Section[];
  exercises: Exercise[];   // petits exercices
  project: Exercise;       // UN gros exercice de fin de chapitre
  keyTakeaways: string[];  // "à retenir"
}

Section {
  id: string;              // ancre (#id), kebab-case, unique dans le chapitre
  number?: string;         // sous-numéro Rust Book, ex "3.1" (affiché dans la TOC)
  title: string;
  blocks: ContentBlock[];
}

Exercise {
  id: string;              // unique, ex "ch4-ex2"
  title: string;
  difficulty: "facile" | "moyen" | "difficile";
  prompt: string;          // énoncé (markdown léger)
  hints?: string[];
  starter: string;         // squelette avec todo!() — chargé dans l'éditeur
  solution: string;        // solution complète et commentée
  tests: string;           // module #[cfg(test)] qui valide la solution
}
```

### Les blocs de contenu (`ContentBlock`, union sur `type`)

| `type` | Champs | Usage |
|---|---|---|
| `heading` | `level: 2\|3`, `text` | Sous-titre dans une section |
| `paragraph` | `text` | Texte (markdown léger) |
| `code` | `language: "rust"\|"bash"\|"toml"\|"text"`, `code`, `filename?`, `caption?` | Bloc de code coloré |
| `callout` | `variant: "info"\|"tip"\|"warning"\|"danger"`, `title?`, `text` | Encadré |
| `list` | `ordered?`, `items: string[]` | Liste à puces / numérotée |
| `usecase` | `title`, `text` | **« Dans quel cas c'est utile »** — signature pédagogique du site |

**Markdown léger** (dans `text`, `prompt`, `hints`, `items`) : seuls sont rendus `` `code inline` ``, `**gras**`, `[lien](url)`. Rien d'autre (pas de titres `#`, pas de tableaux).

## Ajouter un chapitre — pas à pas

1. Créer `src/content/chapters/chNN.ts` en copiant la structure de `ch01.ts`.
2. `export const chNN: Chapter = { … }` avec `import type { Chapter } from "../types";`.
3. L'enregistrer dans `src/content/index.ts` (import + ajout au tableau `chapters`). Le tri se fait par `number`.
4. `npx tsc --noEmit` puis `pnpm build` pour valider (typecheck + génération de la page).

## Règles d'or du contenu

- **Français** partout, ton pédagogique et tutoiement (« tu »), cohérent avec l'existant.
- **Chaque section** doit contenir au moins un exemple `code` et, quand c'est pertinent, un bloc `usecase`. C'est ce qui distingue le site.
- **Le code Rust doit compiler** (edition 2021). Les extraits volontairement invalides (pédagogie borrow-checker) sont commentés comme tels.
- **Difficulté croissante** : 3–4 exercices allant de `facile` à `difficile`, puis un `project` plus consistant qui combine les notions.

## Écrire les tests (crucial)

Les exercices sont **exécutés pour de vrai** : `/api/run` envoie `starter/solution` de l'utilisateur **+ le champ `tests`** au Rust Playground en `crateType: "lib"`, `tests: true` (donc `cargo test`).

Conséquences à respecter dans le champ `tests` :

- Toujours un module `#[cfg(test)] mod tests { use super::*; … }`.
- Les tests réfèrent les fonctions/types de la **solution** (portée `super`). Ne pas redéfinir la fonction dans les tests.
- **Ne pas mettre de `fn main`** dans `tests` (crate lib). Si le `starter`/`solution` en contient un, ce n'est pas bloquant (juste du code mort), mais préfère des fonctions pures testables.
- Si un test doit paniquer, utilise `#[should_panic]` (option `expected = "…"`).
- Les types comparés avec `assert_eq!` doivent dériver `PartialEq` (+ `Debug`).
- **La `solution` DOIT faire passer tous les `tests`.** Vérifie mentalement, et idéalement compile en local :
  ```bash
  # concatène solution + tests dans un fichier lib.rs puis :
  rustc --edition 2021 --test lib.rs && ./lib
  ```

## Ajouter un exercice de révision

`src/content/review.ts` → un `ReviewExercise` = un `Exercise` **plus** `chapters: string[]` (slugs prérequis). Il ne se débloque que si tous ces chapitres sont marqués terminés. Mêmes règles de tests que ci-dessus.

## Ajouter un projet

`src/content/projects.ts` → un `Project` (voir le type). Le champ `tests?` alimente les « tests d'acceptation » (même moteur `/api/run`). Renseigner `chapters` pour le gating (le projet reste verrouillé tant que ces chapitres ne sont pas terminés).
