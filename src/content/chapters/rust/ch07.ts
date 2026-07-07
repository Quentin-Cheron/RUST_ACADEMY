import type { Chapter } from "../../types";

export const ch07: Chapter = {
  number: 7,
  slug: "modules",
  title: "Gérer des projets qui grandissent : modules",
  subtitle: "Organiser son code avec des packages, des crates et des modules.",
  description:
    "Un programme de dix lignes tient dans un seul fichier. Un vrai projet, non : il faut découper le code en unités logiques, décider ce qui est visible de l'extérieur et ce qui reste un détail d'implémentation. Ce chapitre couvre le système de modules de Rust : packages, crates, `mod`, chemins, visibilité `pub` et `use` — les outils qui permettent à un projet de grandir sans devenir un plat de spaghetti.",
  minutes: 40,
  rustBookRef: "Chapitre 7 — Managing Growing Projects with Packages, Crates, and Modules",
  objectives: [
    "Distinguer un package d'un crate (binaire ou bibliothèque)",
    "Organiser du code avec `mod` et visualiser l'arborescence de modules",
    "Choisir entre chemin absolu (`crate::`), chemin relatif et `super::`",
    "Contrôler la visibilité avec `pub`, y compris sur les champs de struct et les enums",
    "Importer des chemins avec `use`, les renommer avec `as`, et les ré-exporter avec `pub use`",
    "Séparer les modules dans des fichiers distincts sans casser leur arborescence",
  ],
  sections: [
    {
      id: "packages-et-crates",
      number: "7.1",
      title: "Packages et crates",
      blocks: [
        {
          type: "paragraph",
          text: "Un **package** est ce que décrit un `Cargo.toml` : un nom, une version, des dépendances. Un package contient un ou plusieurs **crates** — l'unité que le compilateur traite d'un coup. Un crate est soit un **crate binaire** (produit un exécutable, doit avoir une fonction `main`), soit un **crate bibliothèque** (pas de `main`, du code destiné à être réutilisé par d'autres programmes).",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[package]\nname = "restaurant"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]',
        },
        {
          type: "paragraph",
          text: "Cargo suit une convention de nommage stricte pour trouver les racines des crates :",
        },
        {
          type: "code",
          language: "text",
          code: "restaurant/\n├── Cargo.toml\n└── src/\n    ├── main.rs      <- racine du crate binaire (si présent)\n    ├── lib.rs       <- racine du crate bibliothèque (si présent)\n    └── bin/\n        └── outil.rs <- un crate binaire supplémentaire",
        },
        {
          type: "list",
          items: [
            "`src/main.rs` est automatiquement la racine d'un crate **binaire** portant le nom du package.",
            "`src/lib.rs` est automatiquement la racine d'un crate **bibliothèque** portant le nom du package.",
            "Chaque fichier de `src/bin/` devient un crate binaire additionnel.",
            "Un package peut avoir plusieurs crates binaires, mais **au plus une** bibliothèque.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          text: "`cargo new nom` crée un crate binaire (`src/main.rs`). `cargo new nom --lib` crée un crate bibliothèque (`src/lib.rs`). Un même package peut très bien avoir les deux : un `lib.rs` avec la logique, et un `main.rs` qui l'utilise comme n'importe quel autre crate.",
        },
      ],
    },
    {
      id: "definir-des-modules",
      number: "7.2",
      title: "Définir des modules avec mod",
      blocks: [
        {
          type: "paragraph",
          text: "À l'intérieur d'un crate, le mot-clé `mod` regroupe du code en unités nommées : l'**arborescence de modules**. Elle fonctionne comme un système de fichiers : `crate` est la racine, et chaque `mod` peut contenir des fonctions, des structs, des enums, des constantes… et d'autres modules imbriqués.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "mod front_of_house {\n    mod hosting {\n        fn add_to_waitlist() {}\n        fn seat_at_table() {}\n    }\n\n    mod serving {\n        fn take_order() {}\n        fn serve_order() {}\n        fn take_payment() {}\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Ce code décrit l'arborescence suivante, avec `crate` comme module implicite tout en haut :",
        },
        {
          type: "code",
          language: "text",
          code: "crate\n└── front_of_house\n    ├── hosting\n    │   ├── add_to_waitlist\n    │   └── seat_at_table\n    └── serving\n        ├── take_order\n        ├── serve_order\n        └── take_payment",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`mod` n'est pas un `#include` : il ne copie pas le contenu d'un fichier, il déclare qu'un module existe et où le compilateur doit chercher son contenu (inline entre accolades, ou dans un fichier séparé — voir la dernière section).",
        },
      ],
    },
    {
      id: "chemins",
      number: "7.3",
      title: "Chemins : absolu, relatif, super",
      blocks: [
        {
          type: "paragraph",
          text: "Pour appeler une fonction rangée dans un module, il faut son **chemin**. Un chemin **absolu** part de la racine du crate avec `crate::`. Un chemin **relatif** part du module courant. Les deux sont valides ; le choix est une question de style, mais un chemin absolu bouge moins si le code est déplacé ailleurs dans l'arborescence.",
        },
        {
          type: "code",
          language: "rust",
          code: "mod front_of_house {\n    pub mod hosting {\n        pub fn add_to_waitlist() {}\n    }\n}\n\npub fn eat_at_restaurant() {\n    // Chemin absolu : depuis la racine du crate.\n    crate::front_of_house::hosting::add_to_waitlist();\n\n    // Chemin relatif : depuis le module courant (ici, la racine).\n    front_of_house::hosting::add_to_waitlist();\n}",
        },
        {
          type: "paragraph",
          text: "Pour remonter d'un niveau depuis un module enfant vers son parent, on utilise `super::` — l'équivalent de `..` dans un chemin de fichiers.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn deliver_order() {}\n\nmod back_of_house {\n    fn fix_incorrect_order() {\n        cook_order();\n        // Remonte au module parent pour trouver `deliver_order`.\n        super::deliver_order();\n    }\n\n    fn cook_order() {}\n}",
        },
        {
          type: "callout",
          variant: "info",
          title: "La règle de confidentialité",
          text: "Tout est privé par défaut. Un module **enfant** peut voir tous les éléments privés de ses **ancêtres**. L'inverse est faux : un parent ne voit pas ce qu'un enfant garde privé, sauf si l'enfant marque l'élément `pub`.",
        },
      ],
    },
    {
      id: "visibilite-pub",
      number: "7.3",
      title: "Visibilité : le mot-clé pub",
      blocks: [
        {
          type: "paragraph",
          text: "Sans `pub`, modules, fonctions, structs, enums et champs sont privés : visibles seulement dans leur module et les descendants de celui-ci. `pub` expose l'élément à son module parent (et, en cascade, à qui peut voir ce parent). Dans l'exemple précédent, il fallait rendre `hosting` **et** `add_to_waitlist` publics : rendre un module public n'expose pas automatiquement son contenu.",
        },
        {
          type: "paragraph",
          text: "Sur une **struct**, `pub` sur la struct elle-même ne suffit pas non plus : chaque champ doit être marqué `pub` individuellement.",
        },
        {
          type: "code",
          language: "rust",
          code: 'mod back_of_house {\n    pub struct Repas {\n        pub toast: String,\n        saison: String, // privé : pas de `pub`\n    }\n\n    impl Repas {\n        pub fn ete(toast: &str) -> Repas {\n            Repas {\n                toast: String::from(toast),\n                saison: String::from("été"),\n            }\n        }\n    }\n}\n\npub fn commander_repas() {\n    let mut repas = back_of_house::Repas::ete("pain complet");\n    repas.toast = String::from("pain de seigle"); // OK : `toast` est pub\n    // repas.saison = String::from("hiver"); // erreur : `saison` est privé\n}',
        },
        {
          type: "paragraph",
          text: "Sur un **enum** public, c'est l'inverse : dès que l'enum est `pub`, **toutes** ses variantes le sont automatiquement — ça n'aurait pas de sens de cacher certaines valeurs possibles d'un type que l'on expose.",
        },
        {
          type: "code",
          language: "rust",
          code: 'mod back_of_house {\n    pub enum Repas {\n        Entree(String),\n        Plat(String),\n    }\n}\n\npub fn commander(repas: back_of_house::Repas) {\n    match repas {\n        back_of_house::Repas::Entree(nom) => println!("Entrée : {nom}"),\n        back_of_house::Repas::Plat(nom) => println!("Plat : {nom}"),\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "Struct et enum ne se comportent pas pareil face à `pub`. Struct : la visibilité se règle champ par champ. Enum : `pub` sur l'enum rend toutes les variantes publiques d'un coup.",
        },
      ],
    },
    {
      id: "use-et-pub-use",
      number: "7.4",
      title: "Le mot-clé use",
      blocks: [
        {
          type: "paragraph",
          text: "Écrire `crate::front_of_house::hosting::add_to_waitlist()` à chaque appel est lourd. `use` importe un chemin dans la portée courante, une fois pour toutes, un peu comme un raccourci.",
        },
        {
          type: "code",
          language: "rust",
          code: "mod front_of_house {\n    pub mod hosting {\n        pub fn add_to_waitlist() {}\n    }\n}\n\nuse crate::front_of_house::hosting;\n\npub fn eat_at_restaurant() {\n    hosting::add_to_waitlist();\n    hosting::add_to_waitlist();\n}",
        },
        {
          type: "paragraph",
          text: "Convention idiomatique : pour une **fonction**, on importe son module parent (`hosting`) et on écrit `hosting::add_to_waitlist()` — cela rappelle que la fonction n'est pas définie localement. Pour une **struct**, un **enum** ou un **trait**, on importe le chemin complet jusqu'au type lui-même (par exemple `use std::collections::HashMap;`, puis `HashMap::new()`).",
        },
        {
          type: "paragraph",
          text: "Deux chemins importés peuvent porter le même nom final. `as` renomme l'import pour lever l'ambiguïté :",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::fmt::Result as FmtResult;\nuse std::io::Result as IoResult;\n\nfn function1() -> FmtResult {\n    Ok(())\n}\n\nfn function2() -> IoResult<()> {\n    Ok(())\n}",
        },
        {
          type: "paragraph",
          text: "`pub use` fait deux choses en une : importer un chemin **et** le ré-exporter, comme s'il était défini ici. Le code externe peut alors utiliser le chemin court, sans connaître la structure interne du module.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "mod front_of_house {\n    pub mod hosting {\n        pub fn add_to_waitlist() {}\n    }\n}\n\npub use crate::front_of_house::hosting;\n\n// Du code externe peut désormais écrire `restaurant::hosting::add_to_waitlist()`\n// sans jamais avoir entendu parler de `front_of_house`.",
        },
        {
          type: "usecase",
          title: "Concevoir une API publique propre",
          text: "Dans un vrai projet, l'arborescence interne des modules sert à organiser le code pour les développeurs qui le maintiennent ; elle n'a pas à refléter ce que voient les utilisateurs de la bibliothèque. On range librement le code en modules internes (souvent privés), puis on utilise `pub use` à la racine pour offrir une façade simple et stable : `ma_lib::TypePrincipal` plutôt que `ma_lib::interne::detail::TypePrincipal`. C'est exactement ce que font des crates comme `serde` ou `rand` : la structure interne peut changer entre deux versions sans casser le code de personne, tant que la façade publique reste la même. C'est la même logique d'encapsulation que `pub` sur les champs d'une struct, appliquée à l'échelle d'un module entier.",
        },
      ],
    },
    {
      id: "modules-dans-des-fichiers",
      number: "7.5",
      title: "Séparer les modules dans des fichiers",
      blocks: [
        {
          type: "paragraph",
          text: "Un module défini inline entre accolades devient vite illisible. On peut extraire son contenu dans un fichier séparé : `mod nom_du_module;` (avec un point-virgule, sans accolades) dit au compilateur « le contenu de ce module est ailleurs, va le chercher ».",
        },
        {
          type: "code",
          language: "text",
          code: "restaurant/\n├── Cargo.toml\n└── src/\n    ├── lib.rs\n    ├── front_of_house.rs\n    └── front_of_house/\n        └── hosting.rs",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "mod front_of_house;\n\npub use crate::front_of_house::hosting;\n\npub fn eat_at_restaurant() {\n    hosting::add_to_waitlist();\n}",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/front_of_house.rs",
          code: "pub mod hosting;",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/front_of_house/hosting.rs",
          code: "pub fn add_to_waitlist() {}",
        },
        {
          type: "paragraph",
          text: "Remarque : les chemins (`crate::front_of_house::hosting::add_to_waitlist`) ne changent pas du tout entre la version inline et la version multi-fichiers. Déplacer un module dans son propre fichier est une réorganisation purement mécanique, elle ne modifie jamais la façon dont on l'appelle.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`mod front_of_house;` ne se déclare qu'**une seule fois** dans tout le crate (ici, dans `lib.rs`). Le fichier `front_of_house.rs` n'a pas besoin de le redéclarer : il utilise directement `pub mod hosting;`. Copier `mod front_of_house;` dans un autre fichier par réflexe est une erreur fréquente chez les débutants — le compilateur refuse avec « module declared multiple times ».",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch7-ex1",
      title: "Organiser des fonctions dans un module",
      difficulty: "facile",
      prompt:
        "Le module `operations` ci-dessous contient deux fonctions publiques, `addition` et `soustraction`. Complète `calculer`, définie **en dehors** du module, pour qu'elle renvoie `operations::addition(a, b) + operations::soustraction(a, b)`.",
      hints: [
        "`calculer` et `operations` sont tous deux définis à la racine du fichier : un chemin relatif `operations::addition(...)` suffit, pas besoin de `crate::`.",
        "Il n'y a rien à rendre `pub` ici : `operations` et ses deux fonctions le sont déjà.",
      ],
      starter:
        "mod operations {\n    pub fn addition(a: i32, b: i32) -> i32 {\n        a + b\n    }\n\n    pub fn soustraction(a: i32, b: i32) -> i32 {\n        a - b\n    }\n}\n\n/// Doit renvoyer `operations::addition(a, b)` additionné à `operations::soustraction(a, b)`.\nfn calculer(a: i32, b: i32) -> i32 {\n    todo!()\n}",
      solution:
        "mod operations {\n    pub fn addition(a: i32, b: i32) -> i32 {\n        a + b\n    }\n\n    pub fn soustraction(a: i32, b: i32) -> i32 {\n        a - b\n    }\n}\n\nfn calculer(a: i32, b: i32) -> i32 {\n    operations::addition(a, b) + operations::soustraction(a, b)\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn combine_addition_et_soustraction() {\n        // addition(10, 3) + soustraction(10, 3) = 13 + 7 = 20\n        assert_eq!(calculer(10, 3), 20);\n    }\n\n    #[test]\n    fn fonctionne_avec_des_negatifs() {\n        // addition(-4, 6) + soustraction(-4, 6) = 2 + (-10) = -8\n        assert_eq!(calculer(-4, 6), -8);\n    }\n\n    #[test]\n    fn cas_neutre() {\n        assert_eq!(calculer(0, 5), 0);\n    }\n}",
    },
    {
      id: "ch7-ex2",
      title: "Rendre pub la bonne chose",
      difficulty: "moyen",
      prompt:
        "Le code ci-dessous ne compile pas : `Livre`, ses champs et `nouveau` sont privés, alors que `resumer_livre` (en dehors du module) essaie de les utiliser. Ajoute uniquement les `pub` nécessaires — pas plus — puis complète `resumer_livre` pour qu'elle renvoie une chaîne du type `\"1984 (1949)\"`.",
      hints: [
        "Le module `bibliotheque` lui-même n'a pas besoin d'être `pub` : `resumer_livre` est définie dans le même module (la racine du fichier), qui voit déjà ses enfants directs.",
        "`Livre` doit être `pub`, ainsi que les deux champs que `resumer_livre` va lire.",
        "La fonction associée `nouveau` doit aussi devenir `pub` pour être appelable depuis l'extérieur du module.",
      ],
      starter:
        "mod bibliotheque {\n    struct Livre {\n        titre: String,\n        annee: u32,\n    }\n\n    impl Livre {\n        fn nouveau(titre: &str, annee: u32) -> Livre {\n            Livre {\n                titre: titre.to_string(),\n                annee,\n            }\n        }\n    }\n}\n\n/// Doit renvoyer une chaîne du type \"1984 (1949)\",\n/// en construisant le livre via `bibliotheque::Livre::nouveau`.\nfn resumer_livre(titre: &str, annee: u32) -> String {\n    todo!()\n}",
      solution:
        "mod bibliotheque {\n    pub struct Livre {\n        pub titre: String,\n        pub annee: u32,\n    }\n\n    impl Livre {\n        pub fn nouveau(titre: &str, annee: u32) -> Livre {\n            Livre {\n                titre: titre.to_string(),\n                annee,\n            }\n        }\n    }\n}\n\nfn resumer_livre(titre: &str, annee: u32) -> String {\n    let livre = bibliotheque::Livre::nouveau(titre, annee);\n    format!(\"{} ({})\", livre.titre, livre.annee)\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn resume_un_classique() {\n        assert_eq!(resumer_livre("1984", 1949), "1984 (1949)");\n    }\n\n    #[test]\n    fn resume_un_autre_livre() {\n        assert_eq!(resumer_livre("Fondation", 1951), "Fondation (1951)");\n    }\n}',
    },
    {
      id: "ch7-ex3",
      title: "Importer avec use et as",
      difficulty: "moyen",
      prompt:
        "Le module `conversions` propose `celsius_vers_fahrenheit` et `fahrenheit_vers_celsius`. Amène les deux fonctions dans la portée de `convertir_temperatures` avec `use`, en renommant la seconde en `f_vers_c` grâce à `as`. La fonction doit renvoyer `(celsius_vers_fahrenheit(c), f_vers_c(f))`.",
      hints: [
        "`use conversions::celsius_vers_fahrenheit;` suffit pour la première (chemin relatif, pas besoin de `crate::` puisqu'on est déjà à la racine).",
        "`use conversions::fahrenheit_vers_celsius as f_vers_c;` importe la seconde sous un nom différent.",
        "Une fois importées, appelle-les directement par leur nom, sans répéter `conversions::`.",
      ],
      starter:
        "mod conversions {\n    pub fn celsius_vers_fahrenheit(c: f64) -> f64 {\n        c * 9.0 / 5.0 + 32.0\n    }\n\n    pub fn fahrenheit_vers_celsius(f: f64) -> f64 {\n        (f - 32.0) * 5.0 / 9.0\n    }\n}\n\n// TODO : importe les deux fonctions de `conversions` avec `use`,\n// en renommant `fahrenheit_vers_celsius` en `f_vers_c` avec `as`.\n\nfn convertir_temperatures(c: f64, f: f64) -> (f64, f64) {\n    todo!()\n}",
      solution:
        "mod conversions {\n    pub fn celsius_vers_fahrenheit(c: f64) -> f64 {\n        c * 9.0 / 5.0 + 32.0\n    }\n\n    pub fn fahrenheit_vers_celsius(f: f64) -> f64 {\n        (f - 32.0) * 5.0 / 9.0\n    }\n}\n\nuse conversions::celsius_vers_fahrenheit;\nuse conversions::fahrenheit_vers_celsius as f_vers_c;\n\nfn convertir_temperatures(c: f64, f: f64) -> (f64, f64) {\n    (celsius_vers_fahrenheit(c), f_vers_c(f))\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn convertit_le_point_de_congelation() {\n        let (f, c) = convertir_temperatures(0.0, 32.0);\n        assert_eq!(f, 32.0);\n        assert_eq!(c, 0.0);\n    }\n\n    #[test]\n    fn convertit_le_point_d_ebullition() {\n        let (f, c) = convertir_temperatures(100.0, 212.0);\n        assert_eq!(f, 212.0);\n        assert_eq!(c, 100.0);\n    }\n}",
    },
  ],
  project: {
    id: "ch7-projet",
    title: "Un module banque avec une API publique propre",
    difficulty: "difficile",
    prompt:
      "Construis un module `banque` contenant deux sous-modules : `compte` (la struct `Compte` et ses méthodes de base) et `operations` (les opérations bancaires qui manipulent un `Compte`). Les mouvements d'argent bruts (`crediter`, `debiter`) doivent rester internes au module `banque` — invisibles depuis l'extérieur du crate — et ne passer que par les fonctions publiques d'`operations`. Ajoute enfin les `pub use` nécessaires pour qu'on puisse écrire `banque::Compte`, `banque::deposer`, `banque::retirer` et `banque::virer` sans connaître le détail des sous-modules.",
    hints: [
      "`pub(super)` sur `crediter` et `debiter` les rend visibles dans tout le module `banque` (donc depuis `operations`, un module frère de `compte`), mais pas depuis l'extérieur du crate.",
      "`debiter` doit refuser un montant supérieur au solde en renvoyant `Err(...)`, plutôt que de laisser le solde devenir négatif.",
      "`virer` s'appuie sur `debiter` puis `crediter` : utilise `?` pour propager l'erreur de `debiter` et annuler le virement si la source n'a pas assez de fonds.",
      "Les `pub use` se placent directement dans `mod banque`, au même niveau que `pub mod compte;` et `pub mod operations;`.",
    ],
    starter:
      'mod banque {\n    pub mod compte {\n        /// Un compte bancaire : titulaire et solde, en centimes (pour éviter les flottants).\n        pub struct Compte {\n            titulaire: String,\n            solde: i64,\n        }\n\n        impl Compte {\n            pub fn nouveau(titulaire: &str) -> Compte {\n                Compte {\n                    titulaire: titulaire.to_string(),\n                    solde: 0,\n                }\n            }\n\n            pub fn titulaire(&self) -> &str {\n                &self.titulaire\n            }\n\n            pub fn solde(&self) -> i64 {\n                self.solde\n            }\n\n            // Visible dans tout `banque` (et ses sous-modules), pas depuis l\'extérieur du crate.\n            pub(super) fn crediter(&mut self, montant: i64) {\n                todo!()\n            }\n\n            pub(super) fn debiter(&mut self, montant: i64) -> Result<(), String> {\n                todo!()\n            }\n        }\n    }\n\n    pub mod operations {\n        use super::compte::Compte;\n\n        pub fn deposer(compte: &mut Compte, montant: i64) {\n            todo!()\n        }\n\n        pub fn retirer(compte: &mut Compte, montant: i64) -> Result<(), String> {\n            todo!()\n        }\n\n        pub fn virer(source: &mut Compte, destination: &mut Compte, montant: i64) -> Result<(), String> {\n            todo!()\n        }\n    }\n\n    // TODO : ré-exporte `Compte`, `deposer`, `retirer` et `virer`\n    // pour pouvoir écrire `banque::Compte`, `banque::deposer`, etc.\n}',
    solution:
      'mod banque {\n    pub mod compte {\n        /// Un compte bancaire : titulaire et solde, en centimes (pour éviter les flottants).\n        pub struct Compte {\n            titulaire: String,\n            solde: i64,\n        }\n\n        impl Compte {\n            pub fn nouveau(titulaire: &str) -> Compte {\n                Compte {\n                    titulaire: titulaire.to_string(),\n                    solde: 0,\n                }\n            }\n\n            pub fn titulaire(&self) -> &str {\n                &self.titulaire\n            }\n\n            pub fn solde(&self) -> i64 {\n                self.solde\n            }\n\n            // Visible dans tout `banque` (et ses sous-modules), pas depuis l\'extérieur du crate.\n            pub(super) fn crediter(&mut self, montant: i64) {\n                self.solde += montant;\n            }\n\n            pub(super) fn debiter(&mut self, montant: i64) -> Result<(), String> {\n                if montant > self.solde {\n                    Err(format!("solde insuffisant : {} < {}", self.solde, montant))\n                } else {\n                    self.solde -= montant;\n                    Ok(())\n                }\n            }\n        }\n    }\n\n    pub mod operations {\n        use super::compte::Compte;\n\n        pub fn deposer(compte: &mut Compte, montant: i64) {\n            compte.crediter(montant);\n        }\n\n        pub fn retirer(compte: &mut Compte, montant: i64) -> Result<(), String> {\n            compte.debiter(montant)\n        }\n\n        pub fn virer(\n            source: &mut Compte,\n            destination: &mut Compte,\n            montant: i64,\n        ) -> Result<(), String> {\n            source.debiter(montant)?;\n            destination.crediter(montant);\n            Ok(())\n        }\n    }\n\n    pub use compte::Compte;\n    pub use operations::{deposer, retirer, virer};\n}\n\nfn main() {\n    let mut alice = banque::Compte::nouveau("Alice");\n    banque::deposer(&mut alice, 10_000);\n    println!("{} a {} centimes", alice.titulaire(), alice.solde());\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::banque;\n\n    #[test]\n    fn ouverture_de_compte_a_solde_nul() {\n        let compte = banque::compte::Compte::nouveau("Alice");\n        assert_eq!(compte.titulaire(), "Alice");\n        assert_eq!(compte.solde(), 0);\n    }\n\n    #[test]\n    fn depot_augmente_le_solde() {\n        let mut compte = banque::Compte::nouveau("Bob");\n        banque::deposer(&mut compte, 1_500);\n        assert_eq!(compte.solde(), 1_500);\n    }\n\n    #[test]\n    fn retrait_refuse_si_solde_insuffisant() {\n        let mut compte = banque::Compte::nouveau("Chloé");\n        banque::operations::deposer(&mut compte, 500);\n        let resultat = banque::operations::retirer(&mut compte, 1_000);\n        assert!(resultat.is_err());\n        assert_eq!(compte.solde(), 500);\n    }\n\n    #[test]\n    fn retrait_reussi_diminue_le_solde() {\n        let mut compte = banque::Compte::nouveau("Chloé");\n        banque::deposer(&mut compte, 1_000);\n        assert!(banque::retirer(&mut compte, 400).is_ok());\n        assert_eq!(compte.solde(), 600);\n    }\n\n    #[test]\n    fn virement_transfere_les_fonds() {\n        let mut source = banque::compte::Compte::nouveau("Source");\n        let mut destination = banque::compte::Compte::nouveau("Destination");\n        banque::deposer(&mut source, 2_000);\n\n        assert!(banque::virer(&mut source, &mut destination, 700).is_ok());\n        assert_eq!(source.solde(), 1_300);\n        assert_eq!(destination.solde(), 700);\n    }\n\n    #[test]\n    fn virement_echoue_si_source_insuffisante() {\n        let mut source = banque::Compte::nouveau("Source");\n        let mut destination = banque::Compte::nouveau("Destination");\n        banque::deposer(&mut source, 100);\n\n        assert!(banque::virer(&mut source, &mut destination, 500).is_err());\n        assert_eq!(source.solde(), 100);\n        assert_eq!(destination.solde(), 0);\n    }\n}',
  },
  keyTakeaways: [
    "Un package peut contenir plusieurs crates binaires, mais une seule bibliothèque.",
    "`mod` construit l'arborescence de modules ; ce n'est pas un `#include`, il ne copie aucun fichier.",
    "Tout est privé par défaut : `pub` expose vers le module parent, un enfant voit toujours le privé de ses ancêtres.",
    "Sur une struct, chaque champ se rend `pub` individuellement ; sur un enum public, toutes les variantes le deviennent automatiquement.",
    "`use` importe un chemin dans la portée, `as` le renomme, `pub use` le ré-exporte pour construire une API publique propre.",
    "Extraire un module dans son propre fichier ne change pas ses chemins d'appel ; `mod nom;` ne se déclare qu'une seule fois dans tout le crate.",
  ],
};
