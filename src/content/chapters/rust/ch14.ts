import type { Chapter } from "../../types";

export const ch14: Chapter = {
  number: 14,
  slug: "cargo-avance",
  title: "Cargo et crates.io en profondeur",
  subtitle: "Profils de compilation, publication de crates, doctests et workspaces.",
  description:
    "Cargo ne sert pas qu'à lancer `cargo run`. Dans ce chapitre, on explore les réglages fins de compilation (profils dev/release), la documentation qui se teste elle-même (doctests), la publication d'une bibliothèque sur crates.io, l'organisation d'un monorepo avec les workspaces, et l'installation d'outils en ligne de commande écrits en Rust.",
  minutes: 40,
  rustBookRef: "Chapitre 14 — More about Cargo and Crates.io",
  objectives: [
    "Personnaliser les profils de compilation avec `[profile.dev]` et `[profile.release]`",
    "Documenter une bibliothèque avec `///` et `//!`, et générer le HTML avec `cargo doc`",
    "Écrire des exemples de documentation qui sont aussi des tests (doctests)",
    "Publier une crate sur crates.io avec des métadonnées correctes",
    "Structurer un workspace Cargo regroupant plusieurs crates liées",
    "Installer un binaire Rust avec `cargo install` et connaître les commandes personnalisées",
  ],
  sections: [
    {
      id: "profils-compilation",
      number: "14.1",
      title: "Les profils de compilation",
      blocks: [
        {
          type: "paragraph",
          text: "Cargo compile toujours selon un **profil**. `cargo build` utilise le profil `dev` (rapide à compiler, peu optimisé, avec les vérifications de débordement d'entier activées) ; `cargo build --release` utilise le profil `release` (plus lent à compiler, fortement optimisé). Ces réglages ont des valeurs par défaut, mais on peut les personnaliser dans `Cargo.toml`.",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[package]\nname = "mon_outil"\nversion = "0.1.0"\nedition = "2021"\n\n[profile.dev]\nopt-level = 0   # aucune optimisation : compilation la plus rapide possible\n\n[profile.release]\nopt-level = 3   # optimisation maximale : exécution la plus rapide possible',
          caption: "`opt-level` va de 0 (aucune optimisation) à 3 (optimisation maximale).",
        },
        {
          type: "paragraph",
          text: "`opt-level` n'est qu'un réglage parmi d'autres : `debug` (inclure les symboles de débogage), `lto` (Link Time Optimization, pour un binaire plus rapide mais plus long à lier) ou `panic` (choisir entre dérouler la pile ou arrêter immédiatement en cas de panique) sont d'autres leviers courants.",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[profile.release]\nopt-level = 3\nlto = true        # optimisation à l\'édition de liens : binaire plus rapide, build plus long\npanic = "abort"   # pas de dépilage en cas de panique : binaire plus petit',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Tu peux ajouter des profils personnalisés (au-delà de `dev` et `release`) avec `[profile.nom-du-profil]` et les activer via `cargo build --profile nom-du-profil`, par exemple pour un profil intermédiaire optimisé mais avec symboles de débogage.",
        },
      ],
    },
    {
      id: "documentation",
      number: "14.2",
      title: "Documenter avec /// et //!",
      blocks: [
        {
          type: "paragraph",
          text: "Rust distingue les commentaires normaux (`//`) des **commentaires de documentation**. `///` documente l'élément qui suit (une fonction, une struct...) et accepte du Markdown ; `//!` documente l'élément qui **contient** le commentaire, typiquement le module ou le crate entier, en tête de `lib.rs`.",
        },
        {
          type: "code",
          language: "rust",
          filename: "lib.rs",
          code: "//! # ma_lib\n//!\n//! Une petite bibliothèque d'utilitaires mathématiques.\n//! Ce commentaire documente le crate entier : il apparaît en page d'accueil\n//! de la documentation générée par `cargo doc`.\n\n/// Calcule le carré d'un nombre.\n///\n/// # Exemples\n///\n/// ```\n/// assert_eq!(ma_lib::carre(3), 9);\n/// ```\npub fn carre(x: i32) -> i32 {\n    x * x\n}",
        },
        {
          type: "paragraph",
          text: "La section `# Exemples` est une convention (pas une obligation), tout comme `# Panics` (quand la fonction peut paniquer) ou `# Errors` (quand elle renvoie un `Result`). `cargo doc --open` génère la documentation HTML de tout le projet et de ses dépendances, puis l'ouvre dans le navigateur.",
        },
        {
          type: "code",
          language: "bash",
          code: "cargo doc            # génère la doc HTML dans target/doc\ncargo doc --open      # génère et ouvre directement dans le navigateur\ncargo doc --no-deps   # ignore la doc des dépendances (plus rapide)",
        },
        {
          type: "callout",
          variant: "info",
          title: "Où va la documentation publiée ?",
          text: "Quand une crate est publiée sur crates.io, sa documentation est automatiquement construite et hébergée sur docs.rs, gratuitement et pour toujours — c'est l'une des raisons pour lesquelles bien documenter une crate publique est important.",
        },
      ],
    },
    {
      id: "doctests",
      number: "14.2",
      title: "Les doctests : une documentation qui ne ment jamais",
      blocks: [
        {
          type: "paragraph",
          text: "Le bloc de code dans un commentaire `///` n'est pas juste un exemple statique : `cargo test` le **compile et l'exécute** comme un vrai test. On appelle ça un **doctest**. Si l'exemple utilise `assert_eq!` et que le résultat est faux, ou si le code ne compile plus après un changement d'API, `cargo test` échoue.",
        },
        {
          type: "code",
          language: "rust",
          filename: "lib.rs",
          code: "/// Convertit une température de Celsius en Fahrenheit.\n///\n/// # Exemples\n///\n/// ```\n/// use ma_lib::celsius_vers_fahrenheit;\n///\n/// let f = celsius_vers_fahrenheit(0.0);\n/// assert_eq!(f, 32.0);\n/// ```\npub fn celsius_vers_fahrenheit(celsius: f64) -> f64 {\n    celsius * 9.0 / 5.0 + 32.0\n}",
        },
        {
          type: "code",
          language: "bash",
          code: "cargo test\n# ...\n#    Doc-tests ma_lib\n# test src/lib.rs - celsius_vers_fahrenheit (line 5) ... ok",
        },
        {
          type: "list",
          items: [
            "Un bloc sans code de test explicite (juste `///     code_exemple`) est aussi exécuté, mais sans assertion il ne vérifie que la compilation.",
            "Préfixer une ligne avec `# ` (dièse-espace) la cache dans la doc HTML tout en la gardant dans le test — utile pour du code de préparation non pertinent pour le lecteur.",
            "`cargo test --doc` exécute uniquement les doctests, sans les tests unitaires ou d'intégration.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "Les doctests sont la meilleure protection contre une documentation obsolète : si l'API change et que l'exemple ne suit pas, la CI casse. C'est un contrat vivant entre le code et sa doc.",
        },
      ],
    },
    {
      id: "publier-crates-io",
      number: "14.2",
      title: "Publier une crate sur crates.io",
      blocks: [
        {
          type: "paragraph",
          text: "crates.io est le registre public de packages Rust. Publier une crate rend ton code installable par n'importe qui via `cargo add`. Avant de publier, `Cargo.toml` doit contenir des métadonnées minimales : une description, une licence et éventuellement un lien vers le dépôt.",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[package]\nname = "conversion-distances"\nversion = "0.1.0"\nedition = "2021"\ndescription = "Conversions simples entre kilomètres et miles."\nlicense = "MIT OR Apache-2.0"\nrepository = "https://github.com/utilisateur/conversion-distances"\nreadme = "README.md"\nkeywords = ["conversion", "distance", "unites"]\ncategories = ["mathematics"]\n\n[dependencies]',
          caption: "Métadonnées attendues par crates.io avant `cargo publish`.",
        },
        {
          type: "code",
          language: "bash",
          code: "cargo login <ta_cle_api>   # une seule fois, récupère la clé sur crates.io\ncargo package              # simule l'empaquetage, vérifie ce qui serait publié\ncargo publish              # publie la version courante — irréversible !",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Une version publiée est permanente",
          text: "On ne peut jamais republier la même version d'une crate, ni la supprimer complètement (seul `cargo yank` la marque comme déconseillée sans casser les projets qui la fixaient déjà). Vérifie toujours ton `Cargo.toml` et fais tourner `cargo publish --dry-run` avant de publier pour de vrai.",
        },
        {
          type: "usecase",
          title: "Partager du code entre équipes ou avec la communauté",
          text: "Une entreprise qui a trois services internes en Rust partageant un module de validation d'e-mails a intérêt à en faire une crate séparée, versionnée et testée indépendamment, plutôt que de copier-coller le code trois fois. Elle peut la publier en interne (registre privé) ou publiquement sur crates.io si elle est utile à d'autres. C'est la même logique que pour une bibliothèque npm ou un package PyPI : isoler, documenter, versionner, réutiliser.",
        },
      ],
    },
    {
      id: "workspaces",
      number: "14.3",
      title: "Les workspaces Cargo",
      blocks: [
        {
          type: "paragraph",
          text: "Un **workspace** regroupe plusieurs crates qui partagent un seul `Cargo.lock` et un seul dossier `target/`, ce qui évite de recompiler les dépendances communes pour chaque crate. C'est l'organisation typique d'un monorepo : par exemple une bibliothèque de logique métier, une crate de binaire CLI qui l'utilise, et une crate de tests d'intégration partagés.",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml (racine du workspace)",
          code: '[workspace]\nmembers = [\n    "conversion",\n    "cli",\n]\nresolver = "2"',
        },
        {
          type: "code",
          language: "toml",
          filename: "cli/Cargo.toml",
          code: '[package]\nname = "cli"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nconversion = { path = "../conversion" }   # dépendance interne au workspace',
          caption: "Une crate du workspace en dépend d'une autre via un chemin relatif.",
        },
        {
          type: "paragraph",
          text: "Dans un workspace, `cargo build` à la racine compile toutes les crates membres ; `cargo build -p conversion` ne compile qu'une crate précise. `cargo test` à la racine lance les tests de toutes les crates du workspace en une seule commande.",
        },
      ],
    },
    {
      id: "cargo-install",
      number: "14.4",
      title: "Installer des binaires avec cargo install",
      blocks: [
        {
          type: "paragraph",
          text: "`cargo install` télécharge, compile et installe un **binaire** Rust publié sur crates.io directement dans `~/.cargo/bin`, ce qui le rend disponible comme n'importe quelle commande du système — c'est ainsi que sont distribués des outils comme `ripgrep` ou `cargo-edit`.",
        },
        {
          type: "code",
          language: "bash",
          code: "cargo install ripgrep       # installe le binaire `rg`\ncargo install --path .      # installe le binaire du projet courant\ncargo install --list        # liste les binaires déjà installés",
        },
      ],
    },
    {
      id: "etendre-cargo",
      number: "14.5",
      title: "Étendre Cargo avec des commandes personnalisées",
      blocks: [
        {
          type: "paragraph",
          text: "Cargo lui-même est extensible : tout exécutable nommé `cargo-quelquechose` et présent dans le `PATH` devient accessible via `cargo quelquechose`. C'est ainsi que `cargo-edit` ajoute `cargo add`/`cargo rm`, ou que `cargo-watch` ajoute `cargo watch` — sans jamais modifier le cœur de Cargo.",
        },
        {
          type: "callout",
          variant: "info",
          text: "`cargo install cargo-watch` puis `cargo watch -x run` recompile et relance ton programme à chaque sauvegarde de fichier — un gain de temps précieux en développement.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch14-ex1",
      title: "Un doctest pour carre",
      difficulty: "facile",
      prompt:
        "Documente la fonction `carre` avec un commentaire `///` incluant une section `# Exemples` et un bloc de code testable qui vérifie que `carre(4)` vaut `16` avec `assert_eq!`. La fonction elle-même est déjà écrite : ajoute uniquement la documentation.",
      hints: [
        "Le bloc de doctest s'ouvre et se ferme avec trois backticks, comme un bloc de code Markdown.",
        "À l'intérieur du bloc, écris du vrai code Rust : `assert_eq!(carre(4), 16);`.",
      ],
      starter:
        "// À toi d'ajouter un commentaire de documentation /// juste au-dessus,\n// avec une section # Exemples contenant un doctest.\npub fn carre(x: i32) -> i32 {\n    x * x\n}",
      solution:
        "/// Calcule le carré d'un nombre entier.\n///\n/// # Exemples\n///\n/// ```\n/// assert_eq!(carre(4), 16);\n/// assert_eq!(carre(-3), 9);\n/// ```\npub fn carre(x: i32) -> i32 {\n    x * x\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn carre_positif() {\n        assert_eq!(carre(4), 16);\n    }\n\n    #[test]\n    fn carre_negatif() {\n        assert_eq!(carre(-3), 9);\n    }\n\n    #[test]\n    fn carre_zero() {\n        assert_eq!(carre(0), 0);\n    }\n}",
    },
    {
      id: "ch14-ex2",
      title: "Documenter un petit module",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `est_pair` qui indique si un `i32` est pair. Documente-la avec `///` (description, section `# Exemples` avec un doctest), et ajoute un commentaire de module `//!` en première ligne du fichier décrivant brièvement ce module de parité.",
      hints: [
        "`//!` se place tout en haut du fichier, avant toute déclaration.",
        "Le reste (`% 2 == 0`) est un simple test de divisibilité, attention aux nombres négatifs : `-4 % 2` vaut `0` en Rust, donc `%` fonctionne aussi pour les négatifs.",
      ],
      starter:
        "// Ajoute ici un commentaire de module //! décrivant ce fichier.\n\n// Documente cette fonction avec /// et un doctest.\npub fn est_pair(n: i32) -> bool {\n    todo!()\n}",
      solution:
        "//! Utilitaires de vérification de parité pour les entiers.\n\n/// Indique si un entier est pair.\n///\n/// # Exemples\n///\n/// ```\n/// assert!(est_pair(4));\n/// assert!(!est_pair(7));\n/// ```\npub fn est_pair(n: i32) -> bool {\n    n % 2 == 0\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn detecte_les_pairs() {\n        assert!(est_pair(0));\n        assert!(est_pair(4));\n        assert!(est_pair(-4));\n    }\n\n    #[test]\n    fn detecte_les_impairs() {\n        assert!(!est_pair(3));\n        assert!(!est_pair(-7));\n    }\n}",
    },
    {
      id: "ch14-ex3",
      title: "Un Cargo.toml de release",
      difficulty: "moyen",
      prompt:
        "Cette fois pas de Rust : complète un `Cargo.toml` pour une crate `outil-rapide` en ajoutant un profil `[profile.release]` qui maximise les performances (`opt-level = 3`), active `lto` et configure `panic = \"abort\"`. Le starter contient uniquement la section `[package]` ; le format de solution attendu est le fichier TOML complet, tel qu'il apparaîtrait dans le code (donc pas de tests Rust exécutables ici — les tests valident la présence des lignes attendues sous forme de chaîne).",
      hints: [
        "`opt-level = 3` correspond à l'optimisation maximale.",
        "`lto = true` active la Link Time Optimization.",
        'panic = "abort" évite le dépilage de la pile lors d\'une panique.',
      ],
      starter:
        "// Complète cette chaîne représentant le contenu du Cargo.toml.\nfn cargo_toml_release() -> String {\n    todo!()\n}",
      solution:
        "fn cargo_toml_release() -> String {\n    String::from(\n        \"[package]\\nname = \\\"outil-rapide\\\"\\nversion = \\\"0.1.0\\\"\\nedition = \\\"2021\\\"\\n\\n[profile.release]\\nopt-level = 3\\nlto = true\\npanic = \\\"abort\\\"\\n\",\n    )\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn contient_opt_level_max() {\n        assert!(cargo_toml_release().contains(\"opt-level = 3\"));\n    }\n\n    #[test]\n    fn contient_lto() {\n        assert!(cargo_toml_release().contains(\"lto = true\"));\n    }\n\n    #[test]\n    fn contient_panic_abort() {\n        assert!(cargo_toml_release().contains(\"panic = \\\"abort\\\"\"));\n    }\n\n    #[test]\n    fn contient_section_profile_release() {\n        assert!(cargo_toml_release().contains(\"[profile.release]\"));\n    }\n}",
    },
  ],
  project: {
    id: "ch14-projet",
    title: "La bibliothèque conversion",
    difficulty: "difficile",
    prompt:
      "Construis une petite bibliothèque `conversion` prête à être publiée sur crates.io. Elle doit exposer deux fonctions publiques, **documentées avec `///` et des doctests qui se vérifient elles-mêmes** : `km_vers_miles(km: f64) -> f64` et `miles_vers_km(miles: f64) -> f64`. Le facteur de conversion est `1 km = 0.621371 miles`. Ajoute aussi un commentaire de module `//!` en tête de fichier décrivant le crate. Pour éviter les problèmes d'égalité stricte entre flottants, arrondis les résultats à 3 décimales dans les fonctions elles-mêmes.",
    hints: [
      "Arrondir à 3 décimales : `(x * 1000.0).round() / 1000.0`.",
      "km_vers_miles et miles_vers_km sont des opérations inverses : vérifie qu'aller-retour redonne (à peu près) la valeur de départ.",
      "Un doctest par fonction publique est un bon minimum pour une bibliothèque destinée à être publiée.",
    ],
    starter:
      "// Ajoute un commentaire de module //! décrivant ce crate de conversion.\n\n/// Convertit des kilomètres en miles.\npub fn km_vers_miles(km: f64) -> f64 {\n    todo!()\n}\n\n/// Convertit des miles en kilomètres.\npub fn miles_vers_km(miles: f64) -> f64 {\n    todo!()\n}",
    solution:
      "//! # conversion\n//!\n//! Conversions simples et arrondies entre kilomètres et miles.\n//! Facteur de référence : 1 km = 0.621371 miles.\n\nconst KM_VERS_MILES: f64 = 0.621371;\n\n/// Arrondit un flottant à 3 décimales.\nfn arrondir(x: f64) -> f64 {\n    (x * 1000.0).round() / 1000.0\n}\n\n/// Convertit des kilomètres en miles.\n///\n/// # Exemples\n///\n/// ```\n/// use conversion::km_vers_miles;\n///\n/// assert_eq!(km_vers_miles(10.0), 6.214);\n/// assert_eq!(km_vers_miles(0.0), 0.0);\n/// ```\npub fn km_vers_miles(km: f64) -> f64 {\n    arrondir(km * KM_VERS_MILES)\n}\n\n/// Convertit des miles en kilomètres.\n///\n/// # Exemples\n///\n/// ```\n/// use conversion::miles_vers_km;\n///\n/// assert_eq!(miles_vers_km(6.214), 10.0);\n/// assert_eq!(miles_vers_km(0.0), 0.0);\n/// ```\npub fn miles_vers_km(miles: f64) -> f64 {\n    arrondir(miles / KM_VERS_MILES)\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn dix_km_en_miles() {\n        assert_eq!(km_vers_miles(10.0), 6.214);\n    }\n\n    #[test]\n    fn zero_km_en_miles() {\n        assert_eq!(km_vers_miles(0.0), 0.0);\n    }\n\n    #[test]\n    fn six_miles_en_km() {\n        assert_eq!(miles_vers_km(6.214), 10.0);\n    }\n\n    #[test]\n    fn zero_miles_en_km() {\n        assert_eq!(miles_vers_km(0.0), 0.0);\n    }\n\n    #[test]\n    fn aller_retour_km_miles_km() {\n        let depart = 42.0;\n        let miles = km_vers_miles(depart);\n        let retour = miles_vers_km(miles);\n        // L'arrondi à 3 décimales à chaque étape peut introduire un tout petit écart.\n        assert!((retour - depart).abs() < 0.01);\n    }\n\n    #[test]\n    fn resultats_bien_arrondis_a_trois_decimales() {\n        let valeur = km_vers_miles(3.14159);\n        let arrondi_attendu = (valeur * 1000.0).round() / 1000.0;\n        assert_eq!(valeur, arrondi_attendu);\n    }\n}",
  },
  keyTakeaways: [
    "Les profils `[profile.dev]` et `[profile.release]` contrôlent l'optimisation (`opt-level`), la LTO et le comportement des panics.",
    "`///` documente l'élément suivant, `//!` documente l'élément englobant (module ou crate) ; `cargo doc --open` génère et affiche le HTML.",
    "Les blocs de code dans `///` sont des doctests : `cargo test` les compile et les exécute, garantissant une documentation toujours à jour.",
    "Publier sur crates.io demande des métadonnées (`description`, `license`, ...) et se fait avec `cargo publish` — une version publiée est permanente.",
    "Un workspace (`[workspace]`) regroupe plusieurs crates avec un seul `Cargo.lock`, idéal pour un monorepo avec des dépendances internes en `path = \"...\"`.",
    "`cargo install` installe des binaires Rust globalement ; tout exécutable `cargo-xxx` dans le `PATH` devient une sous-commande `cargo xxx`.",
  ],
};
