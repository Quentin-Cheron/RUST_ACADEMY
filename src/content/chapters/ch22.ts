import type { Chapter } from "../types";

export const ch22: Chapter = {
  number: 22,
  slug: "annexes",
  title: "Annexes",
  subtitle: "Les références du Rust Book : mots-clés, opérateurs, traits dérivables, outils et éditions.",
  description:
    "Ce dernier chapitre reprend les annexes A à E du Rust Book : tout ce qui ne se raconte pas comme une histoire mais qu'on consulte sans arrêt en pratique. Tu y trouveras la liste des mots-clés réservés (et comment les contourner avec les identifiants bruts), les opérateurs et ce que signifie les surcharger, les traits qu'on peut dériver automatiquement avec `#[derive]`, les outils qui rendent le développement Rust agréable (rustfmt, Clippy, rust-analyzer), et le système d'éditions qui permet au langage d'évoluer sans rien casser.",
  minutes: 35,
  rustBookRef: "Annexes A à E — Keywords, Operators, Derivable Traits, Tools, Editions",
  objectives: [
    "Reconnaître les mots-clés réservés et utiliser un identifiant brut `r#...` quand c'est nécessaire",
    "Relire n'importe quelle ligne de Rust en identifiant ses opérateurs et symboles",
    "Surcharger un opérateur en implémentant un trait de `std::ops` (Add, Sub, Mul…)",
    "Choisir les bons traits à dériver : Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default",
    "Utiliser rustfmt, Clippy et rust-analyzer au quotidien, et comprendre les éditions de Rust",
  ],
  sections: [
    {
      id: "annexe-a-mots-cles",
      number: "A",
      title: "Annexe A — Les mots-clés",
      blocks: [
        {
          type: "paragraph",
          text: "Rust réserve une liste de **mots-clés** qu'on ne peut pas utiliser comme noms de variables, de fonctions ou de champs. Tu les connais presque tous déjà : ils structurent le langage. En voici les grandes familles :",
        },
        {
          type: "list",
          items: [
            "Déclarations : `fn`, `let`, `const`, `static`, `struct`, `enum`, `union`, `trait`, `impl`, `mod`, `use`, `type`, `pub`",
            "Contrôle de flux : `if`, `else`, `match`, `loop`, `while`, `for`, `in`, `break`, `continue`, `return`",
            "Ownership et types : `mut`, `ref`, `move`, `dyn`, `as`, `where`, `Self`, `self`, `super`, `crate`",
            "Async et sûreté : `async`, `await`, `unsafe`, `extern`",
            "Réservés pour le futur (inutilisés aujourd'hui) : `abstract`, `become`, `box`, `do`, `final`, `macro`, `override`, `priv`, `try`, `typeof`, `virtual`, `yield`…",
          ],
        },
        {
          type: "paragraph",
          text: "Il arrive qu'un nom « naturel » soit un mot-clé : un champ `type` dans une API JSON, une fonction `match` imposée par une convention externe… Les **identifiants bruts** (*raw identifiers*) débloquent la situation : préfixe le nom avec `r#` et Rust le traite comme un identifiant ordinaire.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct Evenement {\n    // `type` est un mot-clé : impossible de l'utiliser tel quel…\n    // …sauf en identifiant brut :\n    r#type: String,\n    donnees: String,\n}\n\nfn r#match(motif: &str, texte: &str) -> bool {\n    texte.contains(motif)\n}\n\nfn main() {\n    let e = Evenement {\n        r#type: String::from(\"clic\"),\n        donnees: String::from(\"bouton-ok\"),\n    };\n    println!(\"{} / {}\", e.r#type, r#match(\"ok\", &e.donnees)); // clic / true\n}",
          caption: "r# transforme un mot-clé en identifiant utilisable.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quand croise-t-on r# en vrai ?",
          text: "Surtout en désérialisant du JSON (`r#type`, `r#ref`…) avec serde, et en interopérant avec du code d'une autre édition où un nom est devenu mot-clé (par exemple `try` depuis l'édition 2018).",
        },
      ],
    },
    {
      id: "annexe-b-operateurs",
      number: "B",
      title: "Annexe B — Opérateurs et symboles",
      blocks: [
        {
          type: "paragraph",
          text: "L'annexe B du Book est un tableau de tous les opérateurs et symboles. La bonne nouvelle : tu les as déjà tous rencontrés dans ce cours. Petit rappel des plus importants et de l'endroit où tu les as vus :",
        },
        {
          type: "list",
          items: [
            "`&` et `&mut` : emprunt partagé / exclusif (chapitre 4) — `*` déréférence (chapitre 15)",
            "`?` : propagation d'erreur sur `Result`/`Option` (chapitre 9)",
            "`..` et `..=` : plages exclusive / inclusive (chapitres 3 et 19), `..` aussi pour « le reste » en destructuration",
            "`|` : séparateur de motifs dans `match` et délimiteur de closures `|x| x + 1` (chapitres 13 et 19)",
            "`::` : chemin vers un item (`String::from`, chapitre 7) — `_` : joker « peu importe »",
            "`->` : type de retour — `=>` : bras de `match` — `@` : lier une valeur testée à un nom (chapitre 19)",
            "`'a` : annotation de durée de vie (chapitre 10) — `!` : macro (`println!`) ou type « jamais »",
          ],
        },
        {
          type: "paragraph",
          text: "La plupart des opérateurs sont **surchargeables** : `a + b` est en réalité un appel à `a.add(b)` du trait `std::ops::Add`. Implémenter ces traits donne à tes propres types une écriture naturelle — c'est exactement ce que fait `String` avec `+` ou `Duration` avec `+` et `*`.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::ops::Add;\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Add for Point {\n    type Output = Point;\n\n    fn add(self, autre: Point) -> Point {\n        Point {\n            x: self.x + autre.x,\n            y: self.y + autre.y,\n        }\n    }\n}\n\nfn main() {\n    let p = Point { x: 1, y: 2 } + Point { x: 3, y: 4 };\n    println!(\"{p:?}\"); // Point { x: 4, y: 6 }\n}",
          caption: "Surcharger + : on implémente le trait Add de std::ops.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Surcharge avec modération",
          text: "Ne surcharge un opérateur que si le sens est évident (addition de vecteurs, de montants, de durées). Un `+` qui envoie une requête réseau surprendra tout le monde — dans le doute, une méthode nommée est plus claire.",
        },
      ],
    },
    {
      id: "annexe-c-traits-derivables",
      number: "C",
      title: "Annexe C — Les traits dérivables",
      blocks: [
        {
          type: "paragraph",
          text: "`#[derive(...)]` demande au compilateur de **générer** l'implémentation d'un trait pour ton type. C'est l'annexe C du Book : la liste exacte de ce qu'on peut dériver et ce que ça implique.",
        },
        {
          type: "list",
          items: [
            "`Debug` : affichage avec `{:?}` — indispensable pour `assert_eq!` et le débogage",
            "`PartialEq` / `Eq` : comparaison avec `==` ; `Eq` promet en plus qu'une valeur est toujours égale à elle-même (pas de `NaN`)",
            "`PartialOrd` / `Ord` : comparaison avec `<`, `>` et tri avec `.sort()` — l'ordre dérivé compare les champs dans leur ordre de déclaration",
            "`Clone` : duplication explicite avec `.clone()` — `Copy` : duplication implicite pour les types simples entièrement sur la pile",
            "`Hash` : utilisable comme clé de `HashMap`/`HashSet` (exige aussi `Eq`)",
            "`Default` : une valeur « par défaut » via `Type::default()` (0, chaîne vide, `None`…)",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: "#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]\nstruct Version {\n    majeure: u32, // comparé en premier…\n    mineure: u32, // …puis celui-ci : l'ordre des champs fait l'ordre du tri\n}\n\nfn main() {\n    let mut versions = vec![\n        Version { majeure: 1, mineure: 2 },\n        Version { majeure: 0, mineure: 9 },\n        Version { majeure: 1, mineure: 0 },\n    ];\n    versions.sort(); // grâce à Ord dérivé\n    println!(\"{versions:?}\");\n    println!(\"{:?}\", Version::default()); // Version { majeure: 0, mineure: 0 }\n}",
          caption: "Une ligne de derive = six implémentations générées par le compilateur.",
        },
        {
          type: "usecase",
          title: "Quels derives mettre par réflexe ?",
          text: "Sur un type « données » (config, DTO, valeur métier) : commence par `Debug, Clone, PartialEq`. Ajoute `Eq, Hash` s'il sert de clé de HashMap, `PartialOrd, Ord` s'il doit se trier, `Copy` seulement s'il est petit et entièrement sur la pile, `Default` s'il a une valeur neutre évidente. Retirer un derive plus tard casse les utilisateurs : mieux vaut y penser dès le début pour les API publiques.",
        },
      ],
    },
    {
      id: "annexe-d-outils",
      number: "D",
      title: "Annexe D — Les outils de développement",
      blocks: [
        {
          type: "paragraph",
          text: "L'annexe D présente l'outillage officiel qui fait la réputation de l'écosystème Rust. Quatre outils à connaître absolument :",
        },
        {
          type: "list",
          items: [
            "**rustfmt** (`cargo fmt`) : formate tout le code selon le style standard — fini les débats d'indentation en revue de code",
            "**Clippy** (`cargo clippy`) : des centaines de lints qui détectent les pièges et suggèrent du code plus idiomatique",
            "**rust-analyzer** : le serveur de langage (LSP) pour VS Code et les autres éditeurs — complétion, erreurs en direct, renommage, aller-à-la-définition",
            "**rustfix** (`cargo fix`) : applique automatiquement les corrections que le compilateur sait proposer",
          ],
        },
        {
          type: "code",
          language: "bash",
          code: "# À lancer régulièrement (et en CI) :\ncargo fmt             # formate le projet entier\ncargo clippy -- -D warnings   # lints, promus en erreurs\ncargo fix            # applique les suggestions du compilateur\n\n# Composants gérés par rustup :\nrustup component add rustfmt clippy",
          caption: "Le trio fmt + clippy + fix garde une base de code saine sans effort.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Clippy est ton meilleur professeur",
          text: "Au début, lance `cargo clippy` après chaque exercice : ses messages expliquent *pourquoi* une tournure est préférable (`.iter().map()` au lieu d'une boucle avec push, `if let` au lieu d'un match à un bras…). C'est le moyen le plus rapide de progresser vers du Rust idiomatique.",
        },
      ],
    },
    {
      id: "annexe-e-editions",
      number: "E",
      title: "Annexe E — Les éditions",
      blocks: [
        {
          type: "paragraph",
          text: "Rust publie une nouvelle version du compilateur toutes les six semaines **sans jamais casser le code existant**. Les changements de syntaxe qui seraient incompatibles sont regroupés dans des **éditions** (2015, 2018, 2021, 2024), déclarées par chaque crate dans son `Cargo.toml`. Deux crates d'éditions différentes se compilent et se lient sans problème dans le même projet : c'est ce qui permet à l'écosystème d'évoluer sans fracture.",
        },
        {
          type: "list",
          items: [
            "Édition 2015 : le Rust d'origine (1.0)",
            "Édition 2018 : chemins de modules modernisés, `async`/`await` réservés, `dyn Trait`",
            "Édition 2021 : captures disjointes dans les closures, `IntoIterator` pour les tableaux, nouveau resolver Cargo — l'édition utilisée dans ce cours",
            "Édition 2024 : évolutions autour d'`unsafe`, des lifetimes capturés en retour `impl Trait`, et divers nettoyages",
          ],
        },
        {
          type: "code",
          language: "bash",
          code: "# Dans Cargo.toml :\n# [package]\n# edition = \"2021\"\n\n# Migrer une crate vers l'édition suivante, en deux temps :\ncargo fix --edition   # applique les changements nécessaires\n# puis mettre à jour edition = \"2024\" et recompiler\ncargo build",
          caption: "cargo fix --edition automatise l'essentiel d'une migration d'édition.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Stabilité sans stagnation",
          text: "C'est la devise du projet Rust : ton code d'aujourd'hui compilera encore dans dix ans, tout en laissant le langage progresser. Une garantie précieuse pour du code en production — et une bonne raison de ne pas avoir peur de mettre à jour sa toolchain.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch22-ex1",
      title: "Identifiants bruts : un champ nommé type",
      difficulty: "facile",
      prompt:
        "Une API externe impose un champ nommé `type`… qui est un mot-clé Rust. Définis une struct `Evenement` avec deux champs `String` : `r#type` et `cible`. Écris `Evenement::nouveau(r#type: &str, cible: &str) -> Evenement` puis une méthode `resume(&self) -> String` qui renvoie `\"<type> sur <cible>\"`.",
      hints: [
        "Préfixe simplement le nom avec `r#` partout : déclaration, construction, accès (`self.r#type`).",
        "`String::from(...)` ou `.to_string()` pour convertir les `&str` en `String`.",
        "Pour `resume`, `format!(\"{} sur {}\", self.r#type, self.cible)` suffit.",
      ],
      starter:
        "struct Evenement {\n    // le champ doit s'appeler `type` (mot-clé !) et `cible`\n}\n\nimpl Evenement {\n    fn nouveau(r#type: &str, cible: &str) -> Evenement {\n        todo!()\n    }\n\n    fn resume(&self) -> String {\n        todo!()\n    }\n}",
      solution:
        "struct Evenement {\n    r#type: String,\n    cible: String,\n}\n\nimpl Evenement {\n    fn nouveau(r#type: &str, cible: &str) -> Evenement {\n        Evenement {\n            r#type: String::from(r#type),\n            cible: String::from(cible),\n        }\n    }\n\n    fn resume(&self) -> String {\n        format!(\"{} sur {}\", self.r#type, self.cible)\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn construit_avec_un_champ_type() {\n        let e = Evenement::nouveau("clic", "bouton-ok");\n        assert_eq!(e.r#type, "clic");\n        assert_eq!(e.cible, "bouton-ok");\n    }\n\n    #[test]\n    fn resume_est_lisible() {\n        let e = Evenement::nouveau("survol", "menu");\n        assert_eq!(e.resume(), "survol sur menu");\n    }\n}',
    },
    {
      id: "ch22-ex2",
      title: "Surcharger + et * pour un Point",
      difficulty: "moyen",
      prompt:
        "Implémente `std::ops::Add` pour un `Point { x: i32, y: i32 }` (addition composante par composante), puis `std::ops::Mul<i32>` pour multiplier un point par un scalaire : `point * 3` multiplie `x` et `y` par 3.",
      hints: [
        "`impl Add for Point` demande un type associé `type Output = Point;` et une méthode `fn add(self, autre: Point) -> Point`.",
        "Pour le scalaire, le trait est générique sur l'opérande droite : `impl Mul<i32> for Point`.",
        "Dérive `Debug, Clone, Copy, PartialEq` sur Point pour que les tests puissent comparer et afficher.",
      ],
      starter:
        "use std::ops::{Add, Mul};\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\n// impl Add for Point { ... }\n\n// impl Mul<i32> for Point { ... }",
      solution:
        "use std::ops::{Add, Mul};\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Add for Point {\n    type Output = Point;\n\n    fn add(self, autre: Point) -> Point {\n        Point {\n            x: self.x + autre.x,\n            y: self.y + autre.y,\n        }\n    }\n}\n\nimpl Mul<i32> for Point {\n    type Output = Point;\n\n    fn mul(self, facteur: i32) -> Point {\n        Point {\n            x: self.x * facteur,\n            y: self.y * facteur,\n        }\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn addition_composante_par_composante() {\n        let p = Point { x: 1, y: 2 } + Point { x: 3, y: 4 };\n        assert_eq!(p, Point { x: 4, y: 6 });\n    }\n\n    #[test]\n    fn multiplication_par_un_scalaire() {\n        let p = Point { x: 2, y: -3 } * 3;\n        assert_eq!(p, Point { x: 6, y: -9 });\n    }\n\n    #[test]\n    fn combinaison_des_deux() {\n        let p = (Point { x: 1, y: 1 } + Point { x: 2, y: 2 }) * 2;\n        assert_eq!(p, Point { x: 6, y: 6 });\n    }\n}",
    },
    {
      id: "ch22-ex3",
      title: "Trier grâce aux traits dérivés",
      difficulty: "moyen",
      prompt:
        "Définis une struct `Version { majeure: u32, mineure: u32, patch: u32 }` en dérivant tout ce qu'il faut pour la comparer, la trier, l'afficher en debug et obtenir une valeur par défaut. Écris ensuite `plus_recente(versions: Vec<Version>) -> Version` qui renvoie la version la plus récente, ou `Version::default()` si la liste est vide.",
      hints: [
        "L'`Ord` dérivé compare les champs **dans l'ordre de déclaration** : majeure, puis mineure, puis patch — exactement la sémantique voulue.",
        "Dérive `Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default`.",
        "`versions.into_iter().max()` renvoie une `Option<Version>` : termine avec `.unwrap_or_default()`.",
      ],
      starter:
        "// Ajoute les derives nécessaires :\nstruct Version {\n    majeure: u32,\n    mineure: u32,\n    patch: u32,\n}\n\nfn plus_recente(versions: Vec<Version>) -> Version {\n    todo!()\n}",
      solution:
        "#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default)]\nstruct Version {\n    majeure: u32,\n    mineure: u32,\n    patch: u32,\n}\n\nfn plus_recente(versions: Vec<Version>) -> Version {\n    versions.into_iter().max().unwrap_or_default()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn v(majeure: u32, mineure: u32, patch: u32) -> Version {\n        Version { majeure, mineure, patch }\n    }\n\n    #[test]\n    fn compare_majeure_d_abord() {\n        assert_eq!(plus_recente(vec![v(1, 9, 9), v(2, 0, 0)]), v(2, 0, 0));\n    }\n\n    #[test]\n    fn compare_mineure_puis_patch() {\n        assert_eq!(plus_recente(vec![v(1, 2, 3), v(1, 3, 0), v(1, 2, 9)]), v(1, 3, 0));\n    }\n\n    #[test]\n    fn liste_vide_donne_default() {\n        assert_eq!(plus_recente(vec![]), v(0, 0, 0));\n    }\n\n    #[test]\n    fn l_ordre_marche_aussi_directement() {\n        assert!(v(0, 9, 9) < v(1, 0, 0));\n        assert!(v(1, 0, 1) > v(1, 0, 0));\n    }\n}",
    },
  ],
  project: {
    id: "ch22-projet",
    title: "Un type Montant complet : derives, opérateurs, Display et FromStr",
    difficulty: "difficile",
    prompt:
      "Construis un type monétaire robuste qui combine les annexes B et C. `Montant(i64)` stocke des **centimes**. 1) Dérive `Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default, Hash`. 2) Implémente `Add` et `Sub`. 3) Implémente `Display` au format français : `Montant(1250)` s'affiche `\"12,50 €\"` (centimes toujours sur deux chiffres). 4) Implémente `FromStr` pour parser `\"12,50\"`, `\"7\"` ou `\"-3,25\"` en renvoyant `Err(String)` pour toute saisie invalide (centimes > 99, texte non numérique…).",
    hints: [
      "Pour Display : `euros = self.0 / 100`, `cents = (self.0 % 100).abs()`, puis `write!(f, \"{euros},{cents:02} €\")`. Attention au cas `-0,50` : si le montant est négatif mais que la partie euros vaut 0, il faut ajouter le signe à la main.",
      "Pour FromStr : `s.split_once(',')` sépare euros et centimes ; sans virgule, les centimes valent 0.",
      "Un seul chiffre après la virgule (`\"0,5\"`) signifie des dixièmes : multiplie par 10. Plus de deux chiffres : erreur.",
      "Le signe s'applique au montant entier : `\"-3,25\"` → `-(3 * 100 + 25)`. Repère-le avec `s.starts_with('-')`.",
    ],
    starter:
      "use std::fmt;\nuse std::ops::{Add, Sub};\nuse std::str::FromStr;\n\n// 1) ajoute les derives\nstruct Montant(i64); // des centimes\n\n// 2) impl Add et Sub\n\n// 3) impl fmt::Display\n\n// 4) impl FromStr avec Err = String\n",
    solution:
      "use std::fmt;\nuse std::ops::{Add, Sub};\nuse std::str::FromStr;\n\n#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default, Hash)]\nstruct Montant(i64);\n\nimpl Add for Montant {\n    type Output = Montant;\n\n    fn add(self, autre: Montant) -> Montant {\n        Montant(self.0 + autre.0)\n    }\n}\n\nimpl Sub for Montant {\n    type Output = Montant;\n\n    fn sub(self, autre: Montant) -> Montant {\n        Montant(self.0 - autre.0)\n    }\n}\n\nimpl fmt::Display for Montant {\n    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {\n        let euros = self.0 / 100;\n        let cents = (self.0 % 100).abs();\n        // -0,50 : la partie euros vaut 0, le signe disparaîtrait sans ce rattrapage.\n        let signe = if self.0 < 0 && euros == 0 { \"-\" } else { \"\" };\n        write!(f, \"{signe}{euros},{cents:02} €\")\n    }\n}\n\nimpl FromStr for Montant {\n    type Err = String;\n\n    fn from_str(s: &str) -> Result<Montant, String> {\n        let s = s.trim();\n        let negatif = s.starts_with('-');\n        let sans_signe = s.strip_prefix('-').unwrap_or(s);\n\n        let (euros_txt, cents_txt) = match sans_signe.split_once(',') {\n            Some((e, c)) => (e, c),\n            None => (sans_signe, \"0\"),\n        };\n\n        let euros: i64 = euros_txt\n            .parse()\n            .map_err(|_| format!(\"euros invalides : {euros_txt:?}\"))?;\n        let cents: i64 = match cents_txt.len() {\n            1 => {\n                let d: i64 = cents_txt\n                    .parse()\n                    .map_err(|_| format!(\"centimes invalides : {cents_txt:?}\"))?;\n                d * 10\n            }\n            2 => cents_txt\n                .parse()\n                .map_err(|_| format!(\"centimes invalides : {cents_txt:?}\"))?,\n            _ => return Err(format!(\"centimes invalides : {cents_txt:?}\")),\n        };\n        if !(0..=99).contains(&cents) {\n            return Err(format!(\"centimes hors bornes : {cents}\"));\n        }\n\n        let total = euros * 100 + cents;\n        Ok(Montant(if negatif { -total } else { total }))\n    }\n}",
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn addition_et_soustraction() {\n        assert_eq!(Montant(1250) + Montant(250), Montant(1500));\n        assert_eq!(Montant(1000) - Montant(1250), Montant(-250));\n    }\n\n    #[test]\n    fn ordre_et_default() {\n        assert!(Montant(999) < Montant(1000));\n        assert_eq!(Montant::default(), Montant(0));\n    }\n\n    #[test]\n    fn affichage_francais() {\n        assert_eq!(Montant(1250).to_string(), "12,50 €");\n        assert_eq!(Montant(700).to_string(), "7,00 €");\n        assert_eq!(Montant(5).to_string(), "0,05 €");\n        assert_eq!(Montant(-325).to_string(), "-3,25 €");\n        assert_eq!(Montant(-50).to_string(), "-0,50 €");\n    }\n\n    #[test]\n    fn parse_valide() {\n        assert_eq!("12,50".parse::<Montant>(), Ok(Montant(1250)));\n        assert_eq!("7".parse::<Montant>(), Ok(Montant(700)));\n        assert_eq!("0,5".parse::<Montant>(), Ok(Montant(50)));\n        assert_eq!("-3,25".parse::<Montant>(), Ok(Montant(-325)));\n    }\n\n    #[test]\n    fn parse_invalide() {\n        assert!("abc".parse::<Montant>().is_err());\n        assert!("1,234".parse::<Montant>().is_err());\n        assert!("3,x".parse::<Montant>().is_err());\n    }\n\n    #[test]\n    fn aller_retour_display_fromstr() {\n        let m: Montant = "42,07".parse().unwrap();\n        assert_eq!(m.to_string(), "42,07 €");\n    }\n}',
  },
  keyTakeaways: [
    "Les mots-clés sont réservés, mais `r#nom` (identifiant brut) permet de les utiliser comme noms quand une API l'impose.",
    "Presque tous les opérateurs correspondent à un trait de `std::ops` (`Add`, `Sub`, `Mul`…) qu'on peut implémenter pour ses propres types — avec parcimonie.",
    "`#[derive]` génère les traits standards : `Debug, Clone, PartialEq` par réflexe ; `Ord` dérivé compare les champs dans leur ordre de déclaration.",
    "`cargo fmt`, `cargo clippy` et rust-analyzer forment l'outillage quotidien ; Clippy est un excellent professeur de Rust idiomatique.",
    "Les éditions (2015, 2018, 2021, 2024) font évoluer la syntaxe sans casser l'existant ; `cargo fix --edition` automatise les migrations.",
  ],
};
