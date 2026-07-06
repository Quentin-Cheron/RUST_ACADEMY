import type { Chapter } from "../types";

export const ch06: Chapter = {
  number: 6,
  slug: "enums",
  title: "Les énumérations et le pattern matching",
  subtitle: "Modéliser des alternatives avec enum, Option<T> et match.",
  description:
    "Beaucoup de données réelles se présentent comme un choix parmi plusieurs possibilités : une commande est en attente, expédiée ou livrée ; une valeur existe ou n'existe pas. Les énumérations (enum) permettent de modéliser ces alternatives directement dans le système de types, et le pattern matching avec match garantit qu'aucun cas n'est oublié. On verra aussi Option<T>, l'enum qui remplace le null des autres langages sans ses dangers.",
  minutes: 45,
  rustBookRef: "Chapitre 6 — Enums and Pattern Matching",
  objectives: [
    "Définir un enum avec des variantes simples ou porteuses de données",
    "Comprendre Option<T> et pourquoi Rust n'a pas de null",
    "Écrire un match exhaustif, lier des valeurs et utiliser le catch-all _",
    "Utiliser if let / else pour les cas où un seul motif t'intéresse",
    "Remplacer des combinaisons de booléens par un enum d'état",
  ],
  sections: [
    {
      id: "definir-un-enum",
      title: "Définir une énumération",
      blocks: [
        {
          type: "paragraph",
          text: "Un `enum` (énumération) définit un type dont la valeur est **une** de plusieurs variantes possibles. C'est idéal quand tu peux énumérer à l'avance tous les cas envisageables.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum AdresseIP {\n    V4,\n    V6,\n}\n\nfn afficher_version(adresse: &AdresseIP) {\n    match adresse {\n        AdresseIP::V4 => println!(\"Version 4\"),\n        AdresseIP::V6 => println!(\"Version 6\"),\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Une variante peut aussi **transporter des données**, et chaque variante peut avoir une forme différente : un tuple, une structure nommée, ou rien du tout. C'est bien plus flexible qu'une simple liste de constantes.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Message {\n    Quit,\n    Deplacer { x: i32, y: i32 },\n    Ecrire(String),\n    ChangerCouleur(i32, i32, i32),\n}\n\nimpl Message {\n    fn traiter(&self) {\n        match self {\n            Message::Quit => println!(\"Arret demande\"),\n            Message::Deplacer { x, y } => println!(\"Deplacement vers ({x}, {y})\"),\n            Message::Ecrire(texte) => println!(\"Message : {texte}\"),\n            Message::ChangerCouleur(r, g, b) => println!(\"Nouvelle couleur : ({r}, {g}, {b})\"),\n        }\n    }\n}\n\nfn main() {\n    let msg = Message::Ecrire(String::from(\"salut\"));\n    msg.traiter();\n}",
        },
        {
          type: "callout",
          variant: "info",
          title: "Un enum, plusieurs formes",
          text: "Ici, `Message::Deplacer` ressemble à une struct nommée, `Message::Ecrire` à un tuple, et `Message::Quit` n'a aucune donnée. On aurait pu écrire quatre structs séparées, mais un seul type `Message` permet d'écrire des fonctions comme `traiter` qui acceptent n'importe laquelle des variantes.",
        },
        {
          type: "list",
          items: [
            "On accède à une variante avec `NomEnum::Variante`.",
            "Un `impl` sur un enum fonctionne comme sur une struct : on peut y définir des méthodes.",
            "Les données associées à une variante ne sont accessibles qu'après un pattern matching (`match`, `if let`).",
          ],
        },
      ],
    },
    {
      id: "option",
      title: "Option<T> : dire adieu à null",
      blocks: [
        {
          type: "paragraph",
          text: "Beaucoup de langages ont une valeur `null` qui peut se glisser n'importe où, causant des plantages quand on l'oublie. Rust n'a **pas** de null. À la place, la bibliothèque standard fournit un enum générique, `Option<T>`, qui exprime explicitement « une valeur peut être absente » :",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Option<T> {\n    Some(T),\n    None,\n}",
        },
        {
          type: "paragraph",
          text: "`Option<T>` est tellement courant qu'il est importé automatiquement (le *prelude*) : pas besoin d'écrire `Option::Some`, `Some` et `None` suffisent.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn diviser(a: f64, b: f64) -> Option<f64> {\n    if b == 0.0 {\n        None\n    } else {\n        Some(a / b)\n    }\n}\n\nfn main() {\n    match diviser(10.0, 2.0) {\n        Some(resultat) => println!(\"Resultat : {resultat}\"),\n        None => println!(\"Division impossible\"),\n    }\n}",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Le compilateur t'y oblige",
          text: "Un `Option<i32>` et un `i32` sont deux types différents. Impossible d'additionner un `Option<i32>` avec un `i32` sans d'abord extraire la valeur (via `match`, `if let`, ou des méthodes comme `unwrap_or`). C'est précisément ce qui empêche la fameuse « erreur à un milliard de dollars » du null : le compilateur refuse de compiler tant que tu n'as pas géré le cas d'absence.",
        },
        {
          type: "list",
          items: [
            "`unwrap()` renvoie la valeur ou **panique** si c'est `None` — à réserver aux prototypes.",
            "`unwrap_or(valeur)` renvoie la valeur contenue, ou une valeur par défaut si `None`.",
            "`is_some()` / `is_none()` testent la présence sans extraire la valeur.",
          ],
        },
      ],
    },
    {
      id: "match",
      title: "match : le pattern matching exhaustif",
      blocks: [
        {
          type: "paragraph",
          text: "`match` compare une valeur à une série de motifs (*patterns*) et exécute le code du premier motif qui correspond. Sa particularité : le compilateur vérifie que **tous les cas possibles** sont couverts. Oublier une variante d'enum est une erreur de compilation, pas un bug découvert en production.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Forme {\n    Cercle { rayon: f64 },\n    Rectangle { largeur: f64, hauteur: f64 },\n}\n\nfn aire(forme: &Forme) -> f64 {\n    match forme {\n        Forme::Cercle { rayon } => std::f64::consts::PI * rayon * rayon,\n        Forme::Rectangle { largeur, hauteur } => largeur * hauteur,\n    }\n}\n\nfn main() {\n    let c = Forme::Cercle { rayon: 2.0 };\n    let r = Forme::Rectangle { largeur: 3.0, hauteur: 4.0 };\n    println!(\"Aire du cercle : {:.2}\", aire(&c));\n    println!(\"Aire du rectangle : {:.2}\", aire(&r));\n}",
        },
        {
          type: "paragraph",
          text: "Chaque branche de `match` **lie** les données de la variante à des noms (`rayon`, `largeur`, `hauteur`) directement utilisables dans le bloc. On peut aussi filtrer sur des valeurs précises, des plages, ou tout ignorer avec `_` :",
        },
        {
          type: "code",
          language: "rust",
          code: "fn decrire_note(note: u32) -> &'static str {\n    match note {\n        0 => \"nul\",\n        1..=9 => \"insuffisant\",\n        10..=13 => \"passable\",\n        14..=17 => \"bien\",\n        18..=20 => \"excellent\",\n        _ => \"note invalide\",\n    }\n}",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le motif `_` (underscore) capture « tout le reste » sans lier de valeur. Il est souvent utilisé en dernière branche pour couvrir les cas qui ne nous intéressent pas individuellement, un peu comme `default` dans un `switch` d'autres langages, mais requis uniquement si le match n'est pas déjà exhaustif.",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Erreur de compilation volontaire",
          text: "Si tu ajoutes une variante `Forme::Triangle { .. }` sans mettre à jour la fonction `aire`, le compilateur refusera de compiler avec un message `non-exhaustive patterns`. C'est une garantie précieuse : le jour où le code du chapitre évolue, aucun cas ne peut être oublié silencieusement.",
        },
      ],
    },
    {
      id: "if-let",
      title: "if let, else et while let",
      blocks: [
        {
          type: "paragraph",
          text: "Parfois, un seul motif t'intéresse et écrire un `match` complet avec un `_ => {}` vide est verbeux. `if let` compare une valeur à **un** motif et n'exécute le bloc que si ça correspond :",
        },
        {
          type: "code",
          language: "rust",
          code: "fn afficher_si_present(valeur: Option<i32>) {\n    if let Some(n) = valeur {\n        println!(\"Valeur presente : {n}\");\n    } else {\n        println!(\"Aucune valeur\");\n    }\n}",
        },
        {
          type: "paragraph",
          text: "`if let ... else` est strictement équivalent à un `match` à deux branches, mais plus concis quand une seule branche fait vraiment quelque chose. Le compromis : `if let` ne vérifie pas l'exhaustivité, donc il convient bien quand tu ignores volontairement les autres cas.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn main() {\n    let mut pile = vec![1, 2, 3];\n\n    // while let continue tant que le motif correspond.\n    while let Some(dernier) = pile.pop() {\n        println!(\"Depile : {dernier}\");\n    }\n    // pile est maintenant vide, la boucle s'arrete sur le premier None.\n}",
        },
        {
          type: "list",
          items: [
            "`if let` : exécute un bloc si **un** motif correspond, ignore sinon (ou exécute `else`).",
            "`while let` : répète un bloc **tant que** le motif correspond ; s'arrête dès qu'il échoue.",
            "Les deux sont du sucre syntaxique au-dessus de `match`, à utiliser quand l'exhaustivité n'est pas nécessaire.",
          ],
        },
      ],
    },
    {
      id: "enums-etats",
      title: "Modéliser des états avec un enum",
      blocks: [
        {
          type: "paragraph",
          text: "Un piège fréquent chez les débutants : représenter un état avec plusieurs booléens indépendants. Le problème, c'est que rien n'empêche des combinaisons absurdes, comme une commande à la fois `en_attente` et `livree`.",
        },
        {
          type: "code",
          language: "rust",
          code: "// A eviter : des etats qui devraient etre exclusifs, mais ne le sont pas.\nstruct CommandeBool {\n    en_attente: bool,\n    expediee: bool,\n    livree: bool,\n    annulee: bool,\n}\n// Rien n'empeche livree=true ET annulee=true en meme temps !",
        },
        {
          type: "usecase",
          title: "Remplacer des booléens multiples par un enum d'état",
          text: "Un enum rend les états mutuellement exclusifs **par construction** : une valeur de `StatutCommande` est forcément l'une des variantes, jamais deux à la fois. Le `match` t'oblige ensuite à gérer chaque état lors de l'affichage, du calcul d'une facture ou de l'envoi d'une notification, sans risque d'oublier un cas ni de créer une combinaison invalide.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum StatutCommande {\n    EnAttente,\n    Expediee { transporteur: String },\n    Livree,\n    Annulee { motif: String },\n}\n\nfn message_client(statut: &StatutCommande) -> String {\n    match statut {\n        StatutCommande::EnAttente => String::from(\"Votre commande est en preparation.\"),\n        StatutCommande::Expediee { transporteur } => {\n            format!(\"Votre commande a ete expediee via {transporteur}.\")\n        }\n        StatutCommande::Livree => String::from(\"Votre commande a ete livree.\"),\n        StatutCommande::Annulee { motif } => format!(\"Commande annulee : {motif}.\"),\n    }\n}",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Règle pratique : dès que tu te surprends à ajouter un deuxième ou troisième booléen pour décrire « où en est » une donnée, demande-toi si un enum ne modéliserait pas mieux les états réellement possibles.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch6-ex1",
      title: "Valeur par défaut",
      difficulty: "facile",
      prompt:
        "Écris une fonction `valeur_ou_defaut` qui prend un `Option<i32>` et un `i32` par défaut, et renvoie la valeur contenue dans l'`Option` si elle existe, sinon le défaut.",
      hints: [
        "Un simple `match` à deux branches suffit.",
        "La méthode `unwrap_or` de la bibliothèque standard fait exactement ça — tu peux t'en inspirer pour vérifier ton résultat.",
      ],
      starter:
        "fn valeur_ou_defaut(valeur: Option<i32>, defaut: i32) -> i32 {\n    todo!()\n}",
      solution:
        "fn valeur_ou_defaut(valeur: Option<i32>, defaut: i32) -> i32 {\n    match valeur {\n        Some(n) => n,\n        None => defaut,\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn renvoie_la_valeur_si_present() {\n        assert_eq!(valeur_ou_defaut(Some(42), 0), 42);\n    }\n\n    #[test]\n    fn renvoie_le_defaut_si_absent() {\n        assert_eq!(valeur_ou_defaut(None, 7), 7);\n    }\n\n    #[test]\n    fn gere_les_valeurs_negatives() {\n        assert_eq!(valeur_ou_defaut(Some(-3), 10), -3);\n        assert_eq!(valeur_ou_defaut(None, -10), -10);\n    }\n}',
    },
    {
      id: "ch6-ex2",
      title: "Direction opposée",
      difficulty: "facile",
      prompt:
        "Définis un enum `Direction` avec les variantes `Nord`, `Sud`, `Est`, `Ouest`. Ajoute une méthode `oppose(&self) -> Direction` qui renvoie la direction opposée (Nord <-> Sud, Est <-> Ouest) via un `match`.",
      hints: [
        "`#[derive(Debug, PartialEq)]` sur l'enum te permet d'utiliser `assert_eq!` dans les tests.",
        "Chaque branche du match doit renvoyer une nouvelle valeur de `Direction`.",
      ],
      starter:
        "#[derive(Debug, PartialEq)]\nenum Direction {\n    Nord,\n    Sud,\n    Est,\n    Ouest,\n}\n\nimpl Direction {\n    fn oppose(&self) -> Direction {\n        todo!()\n    }\n}",
      solution:
        "#[derive(Debug, PartialEq)]\nenum Direction {\n    Nord,\n    Sud,\n    Est,\n    Ouest,\n}\n\nimpl Direction {\n    fn oppose(&self) -> Direction {\n        match self {\n            Direction::Nord => Direction::Sud,\n            Direction::Sud => Direction::Nord,\n            Direction::Est => Direction::Ouest,\n            Direction::Ouest => Direction::Est,\n        }\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn nord_et_sud_sont_opposes() {\n        assert_eq!(Direction::Nord.oppose(), Direction::Sud);\n        assert_eq!(Direction::Sud.oppose(), Direction::Nord);\n    }\n\n    #[test]\n    fn est_et_ouest_sont_opposes() {\n        assert_eq!(Direction::Est.oppose(), Direction::Ouest);\n        assert_eq!(Direction::Ouest.oppose(), Direction::Est);\n    }\n\n    #[test]\n    fn double_opposition_revient_au_point_de_depart() {\n        assert_eq!(Direction::Nord.oppose().oppose(), Direction::Nord);\n    }\n}",
    },
    {
      id: "ch6-ex3",
      title: "Parser une couleur",
      difficulty: "moyen",
      prompt:
        "Définis un enum `Couleur` avec les variantes `Rouge`, `Vert`, `Bleu`. Écris une fonction `parser_couleur(texte: &str) -> Option<Couleur>` qui reconnaît `\"rouge\"`, `\"vert\"` et `\"bleu\"` (peu importe la casse) et renvoie `None` pour toute autre entrée.",
      hints: [
        "`str::to_lowercase()` normalise la casse avant de comparer.",
        "Termine ton `match` sur la chaîne par une branche `_ => None`.",
      ],
      starter:
        "#[derive(Debug, PartialEq)]\nenum Couleur {\n    Rouge,\n    Vert,\n    Bleu,\n}\n\nfn parser_couleur(texte: &str) -> Option<Couleur> {\n    todo!()\n}",
      solution:
        '#[derive(Debug, PartialEq)]\nenum Couleur {\n    Rouge,\n    Vert,\n    Bleu,\n}\n\nfn parser_couleur(texte: &str) -> Option<Couleur> {\n    match texte.to_lowercase().as_str() {\n        "rouge" => Some(Couleur::Rouge),\n        "vert" => Some(Couleur::Vert),\n        "bleu" => Some(Couleur::Bleu),\n        _ => None,\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn reconnait_les_couleurs_valides() {\n        assert_eq!(parser_couleur("rouge"), Some(Couleur::Rouge));\n        assert_eq!(parser_couleur("vert"), Some(Couleur::Vert));\n        assert_eq!(parser_couleur("bleu"), Some(Couleur::Bleu));\n    }\n\n    #[test]\n    fn ignore_la_casse() {\n        assert_eq!(parser_couleur("ROUGE"), Some(Couleur::Rouge));\n        assert_eq!(parser_couleur("Vert"), Some(Couleur::Vert));\n    }\n\n    #[test]\n    fn renvoie_none_pour_une_entree_inconnue() {\n        assert_eq!(parser_couleur("violet"), None);\n        assert_eq!(parser_couleur(""), None);\n    }\n}',
    },
  ],
  project: {
    id: "ch6-projet",
    title: "Une calculatrice avec enum Operation",
    difficulty: "moyen",
    prompt:
      "Construis une petite calculatrice sûre. Définis un enum `Operation` avec les variantes `Addition`, `Soustraction`, `Multiplication` et `Division`. Écris une fonction `calculer(op: Operation, a: f64, b: f64) -> Option<f64>` qui applique l'opération demandée et renvoie `None` si l'opération est une `Division` avec `b == 0.0` (au lieu de produire une valeur infinie ou de paniquer). C'est l'occasion de combiner enum, match et Option dans un seul mini-programme réaliste.",
    hints: [
      "Toutes les variantes de `Operation` sont sans données associées : le `match` porte donc uniquement sur la variante.",
      "Seule la branche `Division` a besoin d'une condition supplémentaire sur `b`.",
      "Chaque branche doit renvoyer un `Option<f64>` : encapsule les résultats normaux dans `Some(...)`.",
    ],
    starter:
      "#[derive(Debug, PartialEq)]\nenum Operation {\n    Addition,\n    Soustraction,\n    Multiplication,\n    Division,\n}\n\nfn calculer(op: Operation, a: f64, b: f64) -> Option<f64> {\n    todo!()\n}\n\nfn main() {\n    println!(\"{:?}\", calculer(Operation::Addition, 4.0, 2.0));\n    println!(\"{:?}\", calculer(Operation::Division, 4.0, 0.0));\n}",
    solution:
      "#[derive(Debug, PartialEq)]\nenum Operation {\n    Addition,\n    Soustraction,\n    Multiplication,\n    Division,\n}\n\nfn calculer(op: Operation, a: f64, b: f64) -> Option<f64> {\n    match op {\n        Operation::Addition => Some(a + b),\n        Operation::Soustraction => Some(a - b),\n        Operation::Multiplication => Some(a * b),\n        Operation::Division => {\n            if b == 0.0 {\n                None\n            } else {\n                Some(a / b)\n            }\n        }\n    }\n}\n\nfn main() {\n    println!(\"{:?}\", calculer(Operation::Addition, 4.0, 2.0));\n    println!(\"{:?}\", calculer(Operation::Division, 4.0, 0.0));\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn addition_fonctionne() {\n        assert_eq!(calculer(Operation::Addition, 4.0, 2.0), Some(6.0));\n    }\n\n    #[test]\n    fn soustraction_fonctionne() {\n        assert_eq!(calculer(Operation::Soustraction, 4.0, 2.0), Some(2.0));\n    }\n\n    #[test]\n    fn multiplication_fonctionne() {\n        assert_eq!(calculer(Operation::Multiplication, 4.0, 2.0), Some(8.0));\n    }\n\n    #[test]\n    fn division_normale_fonctionne() {\n        assert_eq!(calculer(Operation::Division, 9.0, 3.0), Some(3.0));\n    }\n\n    #[test]\n    fn division_par_zero_renvoie_none() {\n        assert_eq!(calculer(Operation::Division, 4.0, 0.0), None);\n    }\n\n    #[test]\n    fn division_avec_negatifs() {\n        assert_eq!(calculer(Operation::Division, -6.0, 2.0), Some(-3.0));\n    }\n}",
  },
  keyTakeaways: [
    "Un enum modélise une valeur qui est exactement une variante parmi plusieurs possibles, chacune pouvant porter ses propres données.",
    "Option<T> (Some/None) remplace null : le compilateur t'oblige à gérer l'absence de valeur.",
    "match est exhaustif : oublier une variante est une erreur de compilation, pas un bug en production.",
    "if let / else traite un seul motif sans la lourdeur d'un match complet ; while let répète tant qu'un motif correspond.",
    "Remplacer plusieurs booléens indépendants par un enum d'état élimine les combinaisons invalides par construction.",
  ],
};
