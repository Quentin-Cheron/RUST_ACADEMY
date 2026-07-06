import type { Chapter } from "../types";

export const ch01: Chapter = {
  number: 1,
  slug: "prise-en-main",
  title: "Prise en main",
  subtitle: "Installer Rust, écrire son premier programme et découvrir Cargo.",
  description:
    "Avant d'écrire une seule ligne de Rust, il faut un environnement qui fonctionne. Dans ce chapitre, on installe la chaîne d'outils Rust, on compile un premier « Hello, world! » à la main, puis on découvre Cargo, l'outil qui gère la compilation, les dépendances et les tests de tous tes projets.",
  minutes: 25,
  rustBookRef: "Chapitre 1 — Getting Started",
  objectives: [
    "Installer Rust avec rustup et vérifier la version",
    "Compiler et exécuter un programme avec rustc",
    "Comprendre le rôle de Cargo (build, run, dépendances)",
    "Créer, compiler et lancer un projet Cargo",
  ],
  sections: [
    {
      id: "installation",
      number: "1.1",
      title: "Installer Rust",
      blocks: [
        {
          type: "paragraph",
          text: "Rust s'installe via **rustup**, un gestionnaire de versions qui télécharge le compilateur (`rustc`), le gestionnaire de projet (`cargo`) et la documentation. C'est la méthode officielle, recommandée sur tous les systèmes.",
        },
        {
          type: "code",
          language: "bash",
          code: "# macOS / Linux\ncurl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n\n# Windows : télécharge et lance rustup-init.exe depuis https://rustup.rs",
          caption: "Installation de la chaîne d'outils Rust.",
        },
        {
          type: "paragraph",
          text: "Une fois installé, ouvre un nouveau terminal et vérifie que tout répond :",
        },
        {
          type: "code",
          language: "bash",
          code: "rustc --version   # ex: rustc 1.83.0\ncargo --version   # ex: cargo 1.83.0",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`rustup update` met à jour Rust vers la dernière version stable. `rustup doc` ouvre toute la documentation hors-ligne dans ton navigateur.",
        },
      ],
    },
    {
      id: "hello-world",
      number: "1.2",
      title: "Ton premier programme",
      blocks: [
        {
          type: "paragraph",
          text: "Un programme Rust commence toujours par la fonction `main`, le point d'entrée. Crée un fichier `main.rs` :",
        },
        {
          type: "code",
          language: "rust",
          filename: "main.rs",
          code: 'fn main() {\n    println!("Hello, world!");\n}',
        },
        {
          type: "paragraph",
          text: "`println!` est une **macro** (le `!` la distingue d'une fonction) qui affiche du texte suivi d'un retour à la ligne. On compile puis on exécute :",
        },
        {
          type: "code",
          language: "bash",
          code: "rustc main.rs   # produit un exécutable\n./main          # ou main.exe sous Windows\n# -> Hello, world!",
        },
        {
          type: "callout",
          variant: "info",
          title: "Rust est compilé",
          text: "Contrairement à Python ou JavaScript, Rust transforme ton code en un exécutable natif **avant** l'exécution. Résultat : pas d'interpréteur à installer chez l'utilisateur, et des performances proches du C.",
        },
      ],
    },
    {
      id: "cargo",
      number: "1.3",
      title: "Cargo, le couteau suisse",
      blocks: [
        {
          type: "paragraph",
          text: "Compiler à la main avec `rustc` va vite devenir pénible dès qu'un projet a plusieurs fichiers ou dépendances. **Cargo** automatise tout : compilation, exécution, gestion des bibliothèques (les *crates*), tests et documentation.",
        },
        {
          type: "code",
          language: "bash",
          code: "cargo new hello_cargo   # crée un projet\ncd hello_cargo\ncargo run               # compile ET exécute\ncargo build             # compile seulement (dossier target/)\ncargo build --release   # compile optimisé pour la production\ncargo check             # vérifie sans produire d'exécutable (rapide)",
        },
        {
          type: "paragraph",
          text: "Un projet Cargo contient un fichier `Cargo.toml` (la configuration et les dépendances) et un dossier `src/` avec le code :",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[package]\nname = "hello_cargo"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\n# on ajoutera nos crates ici, ex: rand = "0.8"',
        },
        {
          type: "usecase",
          title: "Quand utiliser Cargo plutôt que rustc",
          text: "**Toujours**, dès que ce n'est pas un test d'une seule ligne. Cargo standardise la structure du projet, gère les dépendances externes de crates.io, et c'est ce que tout l'écosystème Rust attend. `rustc` seul ne sert qu'à comprendre ce que Cargo fait en coulisses.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "N'ajoute jamais le dossier `target/` à Git : il contient les artefacts de compilation, parfois très volumineux. `cargo new` crée automatiquement un `.gitignore` correct.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch1-ex1",
      title: "Vérifier son installation",
      difficulty: "facile",
      prompt:
        "Écris une fonction `version_ok` qui reçoit une chaîne de version comme `\"1.83.0\"` et renvoie `true` si la version majeure est au moins 1. C'est une façon de simuler une vérification d'environnement.",
      hints: [
        "Utilise `split('.')` pour séparer les nombres.",
        "`parse::<u32>()` convertit une chaîne en entier.",
      ],
      starter:
        "fn version_ok(version: &str) -> bool {\n    // À toi de jouer\n    todo!()\n}",
      solution:
        'fn version_ok(version: &str) -> bool {\n    // On prend le premier segment avant le point.\n    match version.split(\'.\').next() {\n        Some(major) => major.parse::<u32>().map(|n| n >= 1).unwrap_or(false),\n        None => false,\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn accepte_version_recente() {\n        assert!(version_ok("1.83.0"));\n        assert!(version_ok("2.0.0"));\n    }\n\n    #[test]\n    fn refuse_version_zero() {\n        assert!(!version_ok("0.9.5"));\n    }\n\n    #[test]\n    fn refuse_entree_invalide() {\n        assert!(!version_ok("abc"));\n    }\n}',
    },
    {
      id: "ch1-ex2",
      title: "Message de bienvenue",
      difficulty: "facile",
      prompt:
        "Écris une fonction `bienvenue` qui prend un prénom et renvoie une `String` du type `\"Bonjour, Alice ! Bienvenue chez Rust.\"`.",
      hints: ["La macro `format!` construit une `String` comme `println!` mais sans l'afficher."],
      starter: "fn bienvenue(prenom: &str) -> String {\n    todo!()\n}",
      solution:
        'fn bienvenue(prenom: &str) -> String {\n    format!("Bonjour, {prenom} ! Bienvenue chez Rust.")\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn salue_correctement() {\n        assert_eq!(bienvenue("Alice"), "Bonjour, Alice ! Bienvenue chez Rust.");\n        assert_eq!(bienvenue("Bob"), "Bonjour, Bob ! Bienvenue chez Rust.");\n    }\n}',
    },
    {
      id: "ch1-ex3",
      title: "Additionner deux entiers",
      difficulty: "facile",
      prompt:
        "Le grand classique. Écris une fonction `additionner` qui renvoie la somme de deux `i32`. Objectif : t'habituer à la syntaxe des fonctions et au retour implicite.",
      hints: ["En Rust, la dernière expression sans `;` est la valeur de retour."],
      starter: "fn additionner(a: i32, b: i32) -> i32 {\n    todo!()\n}",
      solution: "fn additionner(a: i32, b: i32) -> i32 {\n    a + b\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn somme_positive() {\n        assert_eq!(additionner(2, 3), 5);\n    }\n\n    #[test]\n    fn somme_avec_negatif() {\n        assert_eq!(additionner(-4, 10), 6);\n    }\n}',
    },
  ],
  project: {
    id: "ch1-projet",
    title: "Mini rapport d'environnement",
    difficulty: "moyen",
    prompt:
      "Construis une fonction `rapport_env` qui reçoit un nom d'outil et sa version (`\"cargo\"`, `\"1.83.0\"`) et renvoie une ligne de rapport lisible. Elle doit signaler par un préfixe si la version est jugée obsolète (majeure < 1). Le but : combiner formatage de chaînes, découpage et conditions — les briques de base que tu réutiliseras partout.",
    hints: [
      "Réutilise l'idée de `version_ok` du premier exercice.",
      "Retourne quelque chose comme `\"[OK] cargo 1.83.0\"` ou `\"[!!] vieux 0.2.0\"`.",
      "Pense à `format!` pour assembler la ligne.",
    ],
    starter:
      "/// Renvoie une ligne de rapport pour un outil donné.\n/// Préfixe `[OK]` si la version majeure >= 1, sinon `[!!]`.\nfn rapport_env(outil: &str, version: &str) -> String {\n    todo!()\n}\n\nfn main() {\n    println!(\"{}\", rapport_env(\"cargo\", \"1.83.0\"));\n    println!(\"{}\", rapport_env(\"vieux\", \"0.2.0\"));\n}",
    solution:
      'fn version_majeure(version: &str) -> u32 {\n    version\n        .split(\'.\')\n        .next()\n        .and_then(|s| s.parse::<u32>().ok())\n        .unwrap_or(0)\n}\n\nfn rapport_env(outil: &str, version: &str) -> String {\n    let prefixe = if version_majeure(version) >= 1 { "[OK]" } else { "[!!]" };\n    format!("{prefixe} {outil} {version}")\n}\n\nfn main() {\n    println!("{}", rapport_env("cargo", "1.83.0"));\n    println!("{}", rapport_env("vieux", "0.2.0"));\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn version_ok_est_prefixee_ok() {\n        assert_eq!(rapport_env("cargo", "1.83.0"), "[OK] cargo 1.83.0");\n    }\n\n    #[test]\n    fn version_obsolete_est_signalee() {\n        assert_eq!(rapport_env("vieux", "0.2.0"), "[!!] vieux 0.2.0");\n    }\n\n    #[test]\n    fn version_invalide_traitee_comme_obsolete() {\n        assert_eq!(rapport_env("mystere", "inconnue"), "[!!] mystere inconnue");\n    }\n}',
  },
  keyTakeaways: [
    "rustup installe et met à jour Rust ; rustc compile ; cargo orchestre tout.",
    "Tout programme démarre dans `fn main()`.",
    "`println!` est une macro, d'où le `!`.",
    "Utilise Cargo pour tout projet réel : `cargo new`, `cargo run`, `cargo build --release`.",
    "Ne versionne jamais le dossier `target/`.",
  ],
};
