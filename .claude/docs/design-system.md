# Design system

UI = **shadcn/ui** (style `base-nova`, primitives **Base UI**) + **Tailwind v4**. Identité : moderne, épurée, accent **orange Rust**, esprit Dyma (landing, sidebar de chapitres, cartes, thème clair/sombre).

## Tokens de couleur

Définis dans `src/app/globals.css` :
- `@theme inline { --color-* : var(--*) }` mappe chaque token vers une variable CSS.
- `:root { --* }` = mode clair ; `.dark { --* }` = mode sombre. La variante sombre est déclarée via `@custom-variant dark (&:where(.dark, .dark *))`.
- Le thème est appliqué avant le premier rendu par un petit script inline dans `layout.tsx` (anti-flash), et basculé par `ThemeToggle` (classe `dark` sur `<html>`, mémorisé en localStorage `rust-academy:theme`).

Tokens sémantiques disponibles comme utilitaires Tailwind (ex `bg-background`, `text-foreground`) :

| Token | Utilitaires | Rôle |
|---|---|---|
| `background` / `foreground` | `bg-background`, `text-foreground` | Fond / texte de base |
| `card` / `card-foreground` | `bg-card` | Surfaces (cartes, encadrés) |
| `primary` / `primary-foreground` | `bg-primary`, `text-primary` | **Accent orange Rust** (`oklch(0.63 0.21 33)`) |
| `secondary`, `muted`, `accent` | `bg-muted`, `text-muted-foreground` | Fonds discrets, texte secondaire |
| `border`, `input`, `ring` | `border-border`, `ring-ring` | Bordures / focus |
| `destructive` | `text-destructive` | Erreurs |
| `sidebar*` | `bg-sidebar`, … | Palette dédiée à la sidebar |
| `code-bg`, `code-header` | `bg-code-bg` | Fond des blocs de code (toujours sombre) |

**Règle** : n'utilise que ces tokens (jamais des couleurs codées en dur comme `bg-slate-800`), sauf cas spéciaux voulus (points de couleur, badges de difficulté emerald/amber/red).

## Pièges Tailwind v4 (⚠️ importants)

- **Pas de `tailwind.config.js`** — tout est en CSS (`@theme`, `@custom-variant`).
- La syntaxe `bg-[--ma-var]` de Tailwind v3 **ne fonctionne plus**. Utilise :
  - de préférence un **token** (`bg-primary`),
  - sinon `bg-(--ma-var)` ou `bg-[var(--ma-var)]`.
- Les modificateurs d'opacité marchent sur les tokens : `bg-primary/10`, `border-primary/30`, `bg-primary/[0.06]`.

## Composants shadcn / Base UI

- Générés dans `src/components/ui/` (`button`, `card`, `tabs`, `badge`, `progress`, `sheet`, `scroll-area`, `separator`, `input`, `label`). **Ne pas les éditer à la main** ; si besoin, régénérer via `npx shadcn@latest add <nom>`.
- **Composition via `render`** (Base UI), pas `asChild` (Radix) :
  ```tsx
  <Button render={<Link href="/cours/x" />}>Commencer <ArrowRight /></Button>
  <SheetTrigger render={<Button size="icon"><Menu /></Button>} />
  ```
- **Tabs** : contrôlé par `value`/`defaultValue` + `onValueChange` ; `TabsTrigger value="…"`.
- **Progress** : `<Progress value={pct} />` (0–100), rend son track/indicator tout seul.
- **ScrollArea dans un flex** : ajouter `min-h-0` sur l'élément `flex-1`, sinon il déborde au lieu de scroller (cf. `Sidebar`).
- Icônes : **lucide-react** (`<Icon className="size-4" />`).

## Composants maison de rendu

- `ContentRenderer` : mappe `ContentBlock[]` → éléments (titres, paragraphes, `CodeBlock`, `Callout`, listes, `usecase`).
- `CodeBlock` : bloc **lecture seule** coloré (highlight.js), header façon terminal + bouton copier.
- `CodeEditor` : éditeur **éditable** (`react-simple-code-editor` + highlight.js), utilisé dans `ExerciseCard` et `ProjectWorkbench`.
- `Callout` : 4 variantes (`info`/`tip`/`warning`/`danger`) avec icône lucide.
- `renderInline` (`src/lib/inline.tsx`) : rend le markdown léger (`code`, **gras**, liens).

## Rythme visuel

- Coins arrondis généreux (`rounded-xl` / `rounded-2xl`), bordures `border-border`, ombres légères.
- Cartes sur `bg-card`, encadrés d'accent sur `bg-primary/[0.05]` + `border-primary/30`.
- Typo : Geist Sans (texte) / Geist Mono (code), titres `font-black tracking-tight`.
