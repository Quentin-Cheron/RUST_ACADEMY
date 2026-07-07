import type { Chapter } from "../../types";

export const ch09: Chapter = {
  number: 9,
  slug: "gestion-erreurs",
  title: "La gestion des erreurs",
  subtitle: "panic!, Result<T, E>, l'opérateur ? et les erreurs personnalisées.",
  description:
    "Rust n'a pas d'exceptions. Il distingue deux familles d'erreurs : les erreurs irrécupérables, qui arrêtent le programme avec `panic!`, et les erreurs récupérables, représentées par le type `Result<T, E>` que l'appelant doit explicitement traiter. Ce chapitre montre comment choisir entre les deux, comment propager une erreur avec `?` sans écrire de pyramide de `match`, et comment concevoir ses propres types d'erreur pour construire des API robustes.",
  minutes: 45,
  rustBookRef: "Chapitre 9 — Error Handling",
  objectives: [
    "Distinguer erreur irrécupérable (`panic!`) et erreur récupérable (`Result<T, E>`)",
    "Gérer un `Result` avec `match`, `unwrap`, `expect`, `unwrap_or`, `unwrap_or_else`",
    "Propager une erreur avec l'opérateur `?` sans imbriquer les `match`",
    "Définir un type d'erreur personnalisé avec un enum",
    "Écrire un `main` qui renvoie `Result<(), Box<dyn Error>>`",
  ],
  sections: [
    {
      id: "erreurs-irrecuperables",
      number: "9.1",
      title: "Erreurs irrécupérables : panic!",
      blocks: [
        {
          type: "paragraph",
          text: "Certaines erreurs ne peuvent pas être réparées : un bug qui viole une invariant du programme, un tableau accédé hors de ses bornes, une configuration critique absente. Dans ces cas, Rust arrête immédiatement l'exécution avec la macro `panic!` : elle affiche un message, déroule la pile (ou l'abandonne selon la configuration) et termine le programme.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    panic!("configuration critique manquante, arrêt du programme");\n}',
        },
        {
          type: "paragraph",
          text: "Un `panic!` peut aussi survenir implicitement, par exemple en accédant à un index hors bornes d'un `Vec` :",
        },
        {
          type: "code",
          language: "rust",
          code: "fn main() {\n    let v = vec![1, 2, 3];\n    println!(\"{}\", v[99]); // panique : index out of bounds\n}",
        },
        {
          type: "list",
          items: [
            "Un bug interne qui ne devrait jamais se produire (un invariant garanti par le code est violé).",
            "Un prototype ou un exemple où la gestion d'erreur détaillée alourdirait la démonstration.",
            "Les tests unitaires : un `panic!` fait échouer le test de manière claire.",
            "Une situation où continuer serait dangereux (état mémoire ou logique incohérent).",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "Lance `RUST_BACKTRACE=1 cargo run` pour afficher la pile d'appels au moment du panic : très utile pour localiser l'origine réelle du bug.",
        },
      ],
    },
    {
      id: "erreurs-recuperables",
      number: "9.2",
      title: "Erreurs récupérables : Result<T, E>",
      blocks: [
        {
          type: "paragraph",
          text: "La majorité des erreurs sont prévisibles et doivent être gérées sans arrêter tout le programme : un fichier absent, une entrée utilisateur invalide, une connexion réseau qui échoue. Rust les représente avec l'enum générique `Result<T, E>`, définie dans la bibliothèque standard :",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Result<T, E> {\n    Ok(T),\n    Err(E),\n}",
        },
        {
          type: "paragraph",
          text: "`T` est le type de la valeur en cas de succès, `E` le type de l'erreur. Contrairement à une exception, un `Result` est une valeur ordinaire : le compilateur t'oblige à en tenir compte, il n'y a pas de risque d'oublier de « catcher » une erreur.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn diviser(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        Err(String::from("division par zéro"))\n    } else {\n        Ok(a / b)\n    }\n}\n\nfn main() {\n    match diviser(10.0, 2.0) {\n        Ok(resultat) => println!("Résultat : {resultat}"),\n        Err(message) => println!("Erreur : {message}"),\n    }\n}',
        },
      ],
    },
    {
      id: "gerer-un-result",
      number: "9.2",
      title: "Gérer un Result : match et raccourcis",
      blocks: [
        {
          type: "paragraph",
          text: "`match` est la façon la plus explicite de traiter un `Result`, mais la bibliothèque standard fournit des méthodes plus courtes pour les cas fréquents :",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let ok: Result<i32, String> = Ok(42);\n    let erreur: Result<i32, String> = Err(String::from("oups"));\n\n    // unwrap() : renvoie la valeur, ou panique avec un message générique\n    println!("{}", ok.unwrap());\n\n    // expect() : comme unwrap, avec un message d\'erreur personnalisé\n    println!("{}", ok.expect("la valeur devrait être présente"));\n\n    // unwrap_or() : renvoie une valeur par défaut si Err\n    println!("{}", erreur.clone().unwrap_or(0));\n\n    // unwrap_or_else() : calcule la valeur de repli à partir de l\'erreur\n    let valeur = erreur.unwrap_or_else(|e| {\n        println!("valeur de secours suite à : {e}");\n        -1\n    });\n    println!("{valeur}");\n}',
        },
        {
          type: "list",
          items: [
            "`unwrap()` : rapide à écrire, mais panique sans contexte en cas d'`Err`.",
            "`expect(\"message\")` : comme `unwrap`, avec un message qui explique *pourquoi* l'erreur ne devrait pas arriver.",
            "`unwrap_or(valeur)` : remplace l'erreur par une valeur par défaut fixe.",
            "`unwrap_or_else(|e| ...)` : calcule la valeur de repli, éventuellement en utilisant l'erreur `e`.",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          title: "unwrap() en production",
          text: "`unwrap()` et `expect()` font planter **tout le programme** dès qu'ils rencontrent un `Err`. Dans un serveur, un `unwrap()` sur une entrée utilisateur ou une requête réseau peut faire tomber le service entier pour une seule requête malformée. Réserve-les aux cas où l'erreur est réellement impossible (invariant garanti par le code) ou aux prototypes et tests — jamais à une donnée qui vient de l'extérieur.",
        },
      ],
    },
    {
      id: "operateur-interrogation",
      number: "9.2",
      title: "Propager les erreurs avec ?",
      blocks: [
        {
          type: "paragraph",
          text: "Écrire un `match` à chaque appel faillible devient vite verbeux dès qu'on enchaîne plusieurs opérations. L'opérateur `?`, placé après une expression de type `Result`, renvoie immédiatement l'`Err` (en la convertissant si besoin) ou déballe la valeur si c'est un `Ok`. Il ne peut être utilisé que dans une fonction qui renvoie elle-même un `Result` (ou un `Option`).",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::num::ParseIntError;\n\nfn parser_et_doubler(s: &str) -> Result<i32, ParseIntError> {\n    let nombre = s.parse::<i32>()?; // si erreur, on la renvoie immédiatement\n    Ok(nombre * 2)\n}\n\nfn main() {\n    match parser_et_doubler("21") {\n        Ok(n) => println!("Résultat : {n}"),\n        Err(e) => println!("Erreur de parsing : {e}"),\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Le vrai gain apparaît quand on chaîne plusieurs opérations faillibles : chaque `?` remplace un `match` complet.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::num::ParseIntError;\n\nfn calculer(a: &str, b: &str) -> Result<i32, ParseIntError> {\n    let x = a.parse::<i32>()?;\n    let y = b.parse::<i32>()?;\n    Ok(x + y)\n}',
        },
        {
          type: "callout",
          variant: "info",
          text: "`?` fonctionne aussi avec `Option<T>` (il renvoie `None` immédiatement). Il appelle en coulisses `From::from` sur l'erreur, ce qui permet de convertir automatiquement un type d'erreur en un autre plus général.",
        },
      ],
    },
    {
      id: "types-erreurs-personnalises",
      number: "9.2",
      title: "Définir ses propres erreurs",
      blocks: [
        {
          type: "paragraph",
          text: "Quand une fonction peut échouer de plusieurs façons distinctes, un simple `String` d'erreur perd de l'information. Un enum d'erreurs personnalisé donne un type précis, que l'appelant peut inspecter avec un `match` pour réagir différemment selon le cas.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::fmt;\n\n#[derive(Debug)]\nenum ConfigErreur {\n    ChampManquant(String),\n    ValeurInvalide { champ: String, valeur: String },\n}\n\nimpl fmt::Display for ConfigErreur {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        match self {\n            ConfigErreur::ChampManquant(champ) => write!(f, "champ manquant : {champ}"),\n            ConfigErreur::ValeurInvalide { champ, valeur } => {\n                write!(f, "valeur invalide pour {champ} : {valeur}")\n            }\n        }\n    }\n}\n\nimpl std::error::Error for ConfigErreur {}\n\nfn lire_port(valeur: Option<&str>) -> Result<u16, ConfigErreur> {\n    let brut = valeur.ok_or_else(|| ConfigErreur::ChampManquant("port".to_string()))?;\n    brut.parse::<u16>().map_err(|_| ConfigErreur::ValeurInvalide {\n        champ: "port".to_string(),\n        valeur: brut.to_string(),\n    })\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Implémenter `Display` et `std::error::Error` rend ton type interopérable avec `?`, `Box<dyn Error>`, et les crates de l'écosystème comme `anyhow` ou `thiserror`.",
        },
      ],
    },
    {
      id: "result-dans-main-et-api-robustes",
      number: "9.2",
      title: "Result dans main et API robustes",
      blocks: [
        {
          type: "paragraph",
          text: "La fonction `main` peut elle-même renvoyer un `Result`. Cela permet d'utiliser `?` directement au niveau le plus haut du programme, pratique pour les petits binaires et les exemples : `Box<dyn Error>` accepte n'importe quel type d'erreur qui implémente `std::error::Error`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::error::Error;\n\nfn main() -> Result<(), Box<dyn Error>> {\n    let port = lire_port(Some("8080"))?;\n    println!("Serveur démarré sur le port {port}");\n    Ok(())\n}',
        },
        {
          type: "usecase",
          title: "Des API qui ne plantent jamais leurs appelants",
          text: "Dans une bibliothèque ou un serveur, une fonction ne sait pas comment l'appelant veut réagir à une erreur : logguer et continuer, réessayer, renvoyer un code HTTP 400, afficher un message à l'utilisateur. En renvoyant un `Result` plutôt qu'en paniquant, on laisse ce choix à l'appelant. Un seul `unwrap()` mal placé dans une librairie peut faire tomber **tous** ses utilisateurs ; un `Result` propagé, lui, se transforme en une réponse d'erreur propre au niveau approprié — c'est la base d'une API robuste.",
        },
        {
          type: "list",
          items: [
            "`panic!` : pour les bugs et les invariants violés, jamais pour une donnée externe.",
            "`Result<T, E>` : pour tout ce qui peut raisonnablement échouer (fichier, réseau, entrée utilisateur, parsing).",
            "Un enum d'erreur personnalisé : dès que l'appelant doit distinguer plusieurs causes d'échec.",
            "`Box<dyn Error>` : pratique dans `main` ou aux frontières d'un programme, pour agréger des erreurs de types différents.",
          ],
        },
      ],
    },
    {
      id: "panic-ou-pas",
      number: "9.3",
      title: "panic! ou pas ?",
      blocks: [
        {
          type: "paragraph",
          text: "Comment choisir entre `panic!` et `Result` ? La règle générale : renvoyer un `Result` est le bon choix par défaut pour toute fonction qui peut échouer, car il laisse la décision à l'appelant. `panic!` se justifie quand continuer serait incohérent ou dangereux — autrement dit quand le programme se trouve dans un état qui ne devrait jamais arriver.",
        },
        {
          type: "list",
          items: [
            "**Exemples, prototypes et tests** : `unwrap()`/`expect()` sont acceptables, la robustesse n'est pas l'objectif.",
            "**Tu as plus d'informations que le compilateur** : si une valeur est garantie valide (ex. une adresse IP codée en dur), `expect(\"...\")` documente pourquoi l'échec est impossible.",
            "**Contrat de fonction violé** : des arguments hors contrat (index hors bornes, précondition non respectée) sont un bug de l'appelant → `panic!`.",
            "**Donnée externe (saisie, fichier, réseau)** : toujours `Result`, jamais `panic!`.",
          ],
        },
        {
          type: "paragraph",
          text: "Plutôt que de re-valider la même règle partout, on peut **encoder la validation dans un type** : le constructeur vérifie l'invariant une seule fois, et toutes les fonctions qui reçoivent ce type peuvent lui faire confiance.",
        },
        {
          type: "code",
          language: "rust",
          code: 'pub struct Pourcentage {\n    valeur: u8,\n}\n\nimpl Pourcentage {\n    /// Panique si `valeur` > 100 : un appel hors contrat est un bug.\n    pub fn new(valeur: u8) -> Pourcentage {\n        if valeur > 100 {\n            panic!("pourcentage invalide : {valeur} (attendu 0..=100)");\n        }\n        Pourcentage { valeur }\n    }\n\n    pub fn valeur(&self) -> u8 {\n        self.valeur\n    }\n}',
        },
        {
          type: "usecase",
          title: "Le pattern « type validé » du Rust Book",
          text: "C'est le pattern `Guess` du jeu du plus ou moins : au lieu de vérifier `1 <= n && n <= 100` dans chaque fonction, on crée un type dont le constructeur panique sur une valeur hors bornes. Après la frontière de validation (où l'on gère la donnée externe avec un `Result`), tout le reste du code manipule des valeurs garanties valides — plus aucun `if` défensif nécessaire.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch9-ex1",
      title: "Parser une chaîne en nombre",
      difficulty: "facile",
      prompt:
        "Écris une fonction `parser_nombre` qui prend une `&str` et renvoie un `Result<i32, String>` : `Ok(n)` si la chaîne représente un entier valide, sinon `Err` avec un message explicite mentionnant la chaîne d'origine.",
      hints: [
        "`str::parse::<i32>()` renvoie déjà un `Result`, mais avec un type d'erreur peu lisible (`ParseIntError`).",
        "Utilise `.map_err(...)` pour transformer cette erreur en `String`.",
        "Pense à `.trim()` pour tolérer des espaces autour du nombre.",
      ],
      starter: "fn parser_nombre(s: &str) -> Result<i32, String> {\n    todo!()\n}",
      solution:
        'fn parser_nombre(s: &str) -> Result<i32, String> {\n    s.trim()\n        .parse::<i32>()\n        .map_err(|_| format!("\'{s}\' n\'est pas un entier valide"))\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn parse_un_entier_positif() {\n        assert_eq!(parser_nombre("42"), Ok(42));\n    }\n\n    #[test]\n    fn parse_un_entier_negatif_avec_espaces() {\n        assert_eq!(parser_nombre("  -7 "), Ok(-7));\n    }\n\n    #[test]\n    fn refuse_une_entree_non_numerique() {\n        assert!(parser_nombre("abc").is_err());\n    }\n}',
    },
    {
      id: "ch9-ex2",
      title: "Diviser sans planter",
      difficulty: "facile",
      prompt:
        "Écris une fonction `diviser` qui prend deux `f64` et renvoie `Result<f64, String>` : le quotient si le diviseur n'est pas nul, ou `Err(\"division par zéro\".to_string())` sinon.",
      hints: ["Compare le diviseur à `0.0` avant de calculer.", "Pas besoin de `?` ici : un simple `if`/`else` suffit."],
      starter: "fn diviser(a: f64, b: f64) -> Result<f64, String> {\n    todo!()\n}",
      solution:
        'fn diviser(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        Err("division par zéro".to_string())\n    } else {\n        Ok(a / b)\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn divise_normalement() {\n        assert_eq!(diviser(10.0, 2.0), Ok(5.0));\n    }\n\n    #[test]\n    fn refuse_la_division_par_zero() {\n        assert_eq!(diviser(5.0, 0.0), Err("division par zéro".to_string()));\n    }\n}',
    },
    {
      id: "ch9-ex3",
      title: "Chaîner deux opérations avec ?",
      difficulty: "moyen",
      prompt:
        "En réutilisant `parser_f64` (fourni) et `diviser` (fournie), écris `parser_et_diviser` qui prend deux `&str`, les convertit en `f64` puis les divise, en utilisant l'opérateur `?` pour propager la première erreur rencontrée — sans écrire le moindre `match`.",
      hints: [
        "Chaque appel faillible se termine par `?` : `let x = parser_f64(a)?;`.",
        "La dernière ligne, sans `?` ni `;`, est la valeur de retour de la fonction si tout s'est bien passé.",
      ],
      starter:
        'fn parser_f64(s: &str) -> Result<f64, String> {\n    s.trim()\n        .parse::<f64>()\n        .map_err(|_| format!("\'{s}\' n\'est pas un nombre valide"))\n}\n\nfn diviser(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        Err("division par zéro".to_string())\n    } else {\n        Ok(a / b)\n    }\n}\n\nfn parser_et_diviser(a: &str, b: &str) -> Result<f64, String> {\n    todo!()\n}',
      solution:
        'fn parser_f64(s: &str) -> Result<f64, String> {\n    s.trim()\n        .parse::<f64>()\n        .map_err(|_| format!("\'{s}\' n\'est pas un nombre valide"))\n}\n\nfn diviser(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        Err("division par zéro".to_string())\n    } else {\n        Ok(a / b)\n    }\n}\n\nfn parser_et_diviser(a: &str, b: &str) -> Result<f64, String> {\n    let x = parser_f64(a)?;\n    let y = parser_f64(b)?;\n    diviser(x, y)\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn chaine_le_succes() {\n        assert_eq!(parser_et_diviser("10", "2"), Ok(5.0));\n    }\n\n    #[test]\n    fn propage_l_erreur_de_division() {\n        assert_eq!(\n            parser_et_diviser("10", "0"),\n            Err("division par zéro".to_string())\n        );\n    }\n\n    #[test]\n    fn propage_l_erreur_de_parsing() {\n        assert!(parser_et_diviser("abc", "2").is_err());\n    }\n}',
    },
    {
      id: "ch9-ex4",
      title: "panic! ou Result ? Une note sur 20",
      difficulty: "moyen",
      prompt:
        "Implémente le type `Note` (une note sur 20). `Note::new(valeur)` est réservée au code interne : elle **panique** si `valeur > 20` (contrat violé = bug de l'appelant). `Note::parse(s)` traite une **donnée externe** (saisie utilisateur) : elle renvoie `Result<Note, String>` avec un message explicite, sans jamais paniquer.",
      hints: [
        "Dans `new`, utilise `panic!(\"note invalide : ...\")` ou `assert!(valeur <= 20, \"...\")`.",
        "Dans `parse`, enchaîne `s.trim().parse::<u8>()` avec `.map_err(...)`, puis vérifie la borne avant de construire la `Note`.",
        "`parse` ne doit pas appeler `new` (qui paniquerait) : refais le `if` et renvoie `Err`.",
      ],
      starter:
        "pub struct Note {\n    valeur: u8,\n}\n\nimpl Note {\n    /// Contrat : valeur <= 20, sinon panique (bug de l'appelant).\n    pub fn new(valeur: u8) -> Note {\n        todo!()\n    }\n\n    /// Donnée externe : renvoie une erreur au lieu de paniquer.\n    pub fn parse(s: &str) -> Result<Note, String> {\n        todo!()\n    }\n\n    pub fn valeur(&self) -> u8 {\n        self.valeur\n    }\n}",
      solution:
        'pub struct Note {\n    valeur: u8,\n}\n\nimpl Note {\n    /// Contrat : valeur <= 20, sinon panique (bug de l\'appelant).\n    pub fn new(valeur: u8) -> Note {\n        if valeur > 20 {\n            panic!("note invalide : {valeur} (attendu 0..=20)");\n        }\n        Note { valeur }\n    }\n\n    /// Donnée externe : renvoie une erreur au lieu de paniquer.\n    pub fn parse(s: &str) -> Result<Note, String> {\n        let valeur: u8 = s\n            .trim()\n            .parse()\n            .map_err(|_| format!("\'{s}\' n\'est pas un nombre"))?;\n        if valeur > 20 {\n            return Err(format!("note hors limites : {valeur} (attendu 0..=20)"));\n        }\n        Ok(Note { valeur })\n    }\n\n    pub fn valeur(&self) -> u8 {\n        self.valeur\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn new_accepte_une_note_valide() {\n        assert_eq!(Note::new(15).valeur(), 15);\n    }\n\n    #[test]\n    #[should_panic(expected = "note invalide")]\n    fn new_panique_hors_contrat() {\n        Note::new(21);\n    }\n\n    #[test]\n    fn parse_accepte_une_saisie_valide() {\n        assert_eq!(Note::parse(" 12 ").unwrap().valeur(), 12);\n    }\n\n    #[test]\n    fn parse_refuse_sans_paniquer() {\n        assert!(Note::parse("25").is_err());\n        assert!(Note::parse("abc").is_err());\n    }\n}',
    },
  ],
  project: {
    id: "ch9-projet",
    title: "Parseur de ligne clé=valeur",
    difficulty: "difficile",
    prompt:
      "Écris un parseur de configuration minimal. La fonction `parser_ligne` reçoit une ligne comme `\"age=30\"` et renvoie `Result<(String, i32), MonErreur>`. `MonErreur` est un enum avec trois variantes : `FormatInvalide` (pas de `=` dans la ligne), `CleVide` (la partie avant le `=` est vide une fois les espaces retirés), et `ValeurInvalide(String)` (la partie après le `=` n'est pas un entier, la `String` contient la valeur brute fautive). Implémente aussi `Display` pour `MonErreur` afin d'obtenir des messages lisibles.",
    hints: [
      "Utilise `ligne.splitn(2, '=')` pour séparer la clé de la valeur en un seul appel, sans casser une valeur qui contiendrait elle-même un `=`.",
      "`Option::ok_or(...)` transforme un `None` en `Err(...)`, ce qui permet d'enchaîner avec `?`.",
      "N'oublie pas `.trim()` sur la clé et la valeur avant de les valider.",
      "`#[derive(Debug, PartialEq)]` sur `MonErreur` est nécessaire pour comparer des `Result` dans les tests avec `assert_eq!`.",
    ],
    starter:
      "use std::fmt;\n\n#[derive(Debug, PartialEq)]\nenum MonErreur {\n    FormatInvalide,\n    CleVide,\n    ValeurInvalide(String),\n}\n\nimpl fmt::Display for MonErreur {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        todo!()\n    }\n}\n\nfn parser_ligne(ligne: &str) -> Result<(String, i32), MonErreur> {\n    todo!()\n}",
    solution:
      'use std::fmt;\n\n#[derive(Debug, PartialEq)]\nenum MonErreur {\n    FormatInvalide,\n    CleVide,\n    ValeurInvalide(String),\n}\n\nimpl fmt::Display for MonErreur {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        match self {\n            MonErreur::FormatInvalide => write!(f, "format invalide, attendu clé=valeur"),\n            MonErreur::CleVide => write!(f, "la clé est vide"),\n            MonErreur::ValeurInvalide(v) => write!(f, "valeur invalide : \'{v}\'"),\n        }\n    }\n}\n\nfn parser_ligne(ligne: &str) -> Result<(String, i32), MonErreur> {\n    // On coupe au premier \'=\' seulement, pour tolérer un \'=\' dans la valeur.\n    let mut parties = ligne.splitn(2, \'=\');\n    let cle = parties.next().ok_or(MonErreur::FormatInvalide)?;\n    let valeur = parties.next().ok_or(MonErreur::FormatInvalide)?;\n\n    let cle = cle.trim();\n    if cle.is_empty() {\n        return Err(MonErreur::CleVide);\n    }\n\n    let valeur_brute = valeur.trim();\n    let valeur = valeur_brute\n        .parse::<i32>()\n        .map_err(|_| MonErreur::ValeurInvalide(valeur_brute.to_string()))?;\n\n    Ok((cle.to_string(), valeur))\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn ligne_valide() {\n        assert_eq!(parser_ligne("age=30"), Ok(("age".to_string(), 30)));\n    }\n\n    #[test]\n    fn tolere_les_espaces() {\n        assert_eq!(parser_ligne("  score = 42 "), Ok(("score".to_string(), 42)));\n    }\n\n    #[test]\n    fn format_invalide_sans_signe_egal() {\n        assert_eq!(parser_ligne("abc"), Err(MonErreur::FormatInvalide));\n    }\n\n    #[test]\n    fn cle_vide() {\n        assert_eq!(parser_ligne("=42"), Err(MonErreur::CleVide));\n    }\n\n    #[test]\n    fn valeur_invalide() {\n        assert_eq!(\n            parser_ligne("age=trente"),\n            Err(MonErreur::ValeurInvalide("trente".to_string()))\n        );\n    }\n\n    #[test]\n    fn message_affichage_est_lisible() {\n        assert_eq!(format!("{}", MonErreur::CleVide), "la clé est vide");\n    }\n}',
  },
  keyTakeaways: [
    "`panic!` arrête tout le programme : réserve-le aux bugs internes, jamais aux données externes.",
    "`Result<T, E>` (`Ok`/`Err`) force à traiter explicitement les erreurs prévisibles, sans exceptions cachées.",
    "`unwrap()`/`expect()` sont pratiques en prototype ou en test, mais dangereux en production : ils paniquent sur `Err`.",
    "`unwrap_or` et `unwrap_or_else` fournissent une valeur de repli sans paniquer.",
    "L'opérateur `?` propage une erreur en une ligne, dans une fonction qui renvoie `Result` ou `Option`.",
    "Un enum d'erreur personnalisé (avec `Display` et `std::error::Error`) rend les échecs explicites et exploitables par l'appelant.",
    "`fn main() -> Result<(), Box<dyn Error>>` permet d'utiliser `?` jusqu'au sommet du programme.",
  ],
};
