import type { Chapter } from "../../types";

export const ch19: Chapter = {
  number: 19,
  slug: "patterns",
  title: "Les patrons (patterns) et le filtrage",
  subtitle: "Le langage secret pour décomposer et filtrer des valeurs, du simple `match` aux gardes et liaisons `@`.",
  description:
    "Les patterns sont partout en Rust : dans un `match`, un `if let`, une boucle `for`, ou même un simple `let`. Ce chapitre fait le tour complet de leur syntaxe — littéraux, plages, déstructuration de structs et d'enums, `_` et `..` pour ignorer, gardes `if` et liaisons `@` — pour que tu puisses extraire exactement les données dont tu as besoin, de façon lisible et vérifiée par le compilateur.",
  minutes: 45,
  rustBookRef: "Chapitre 19 — Patterns and Matching",
  objectives: [
    "Lister tous les endroits où Rust attend un pattern : match, if let, while let, for, let, paramètres de fonction",
    "Distinguer un pattern irréfutable (toujours valide dans un let) d'un pattern réfutable",
    "Écrire des patterns avec littéraux, `|`, plages `..=` et variables liées",
    "Déstructurer tuples, structs et enums pour extraire précisément les champs utiles",
    "Ignorer des valeurs avec `_` et `..`, affiner un match avec une garde `if`, et capturer une valeur tout en la testant avec `@`",
  ],
  sections: [
    {
      id: "ou-utiliser-patterns",
      number: "19.1",
      title: "Où utiliser les patterns",
      blocks: [
        {
          type: "paragraph",
          text: "Un *pattern* (patron) est une syntaxe qui décrit la forme d'une valeur : un littéral, une variable qui capture tout, une structure imbriquée dont on ne garde que certains champs... Rust compare une valeur à un pattern et, si ça correspond, en extrait les parties intéressantes. On a déjà croisé les patterns avec `match` et `if let` ; ce chapitre fait le tour complet de tous les endroits où ils apparaissent et de toute leur syntaxe.",
        },
        {
          type: "list",
          items: [
            "`match valeur { pattern => expr, ... }` — l'usage le plus complet, exhaustif : tous les cas doivent être couverts.",
            "`if let pattern = valeur { ... }` — un seul cas à tester, sans exigence d'exhaustivité.",
            "`while let pattern = valeur { ... }` — la boucle continue tant que le pattern correspond.",
            "`for pattern in iterable { ... }` — le pattern extrait chaque élément produit par l'itérateur.",
            "`let pattern = valeur;` — toute affectation est en réalité un pattern.",
            "`fn f(pattern: Type) { ... }` — les paramètres de fonction sont eux aussi des patterns.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: 'fn afficher_coordonnee(&(x, y): &(i32, i32)) {\n    println!("x = {x}, y = {y}");\n}\n\nfn main() {\n    // `for` déstructure chaque tuple produit par l\'itérateur.\n    let points = vec![(1, 2), (3, 4)];\n    for (x, y) in &points {\n        println!("point : ({x}, {y})");\n    }\n\n    // `while let` : on continue tant que `pop` renvoie `Some`.\n    let mut pile = vec![1, 2, 3];\n    while let Some(valeur) = pile.pop() {\n        println!("dépilé : {valeur}");\n    }\n\n    afficher_coordonnee(&(5, 9));\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Même `let x = 5;` est un pattern : `x` capture toujours la valeur, quelle qu'elle soit. C'est pour ça qu'on peut écrire directement `let (a, b) = (1, 2);` : `(a, b)` est un pattern qui déstructure le tuple à l'affectation.",
        },
      ],
    },
    {
      id: "refutable-irrefutable",
      number: "19.2",
      title: "Patterns réfutables et irréfutables",
      blocks: [
        {
          type: "paragraph",
          text: "Un pattern **irréfutable** correspond à n'importe quelle valeur possible : `x`, `(a, b)`, `Point { x, y }`. C'est le seul type de pattern accepté par un `let` ou un paramètre de fonction, car ces positions ne savent pas quoi faire si le pattern échoue. Un pattern **réfutable** peut au contraire échouer à correspondre, comme `Some(x)` face à une valeur qui pourrait être `None` : c'est le pattern qu'on utilise dans `if let`, `while let`, ou un bras de `match`.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn demo(valeur: Option<i32>) {\n    // Ceci ne compile PAS : `Some(x)` est réfutable, le cas `None` n'est pas couvert.\n    // let Some(x) = valeur;\n    //\n    // error[E0005]: refutable pattern in local binding\n    //     pattern `None` not covered\n}",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn decrire(valeur: Option<i32>) {\n    // Solution 1 : `match`, qui exige l\'exhaustivité.\n    match valeur {\n        Some(x) => println!("x = {x}"),\n        None => println!("rien"),\n    }\n}\n\n// Solution 2 : `let ... else`, pratique pour sortir tôt d\'une fonction.\nfn double_ou_zero(valeur: Option<i32>) -> i32 {\n    let Some(x) = valeur else {\n        return 0;\n    };\n    x * 2\n}',
        },
        {
          type: "callout",
          variant: "info",
          title: "Pourquoi cette distinction",
          text: "`let`, `for` et les paramètres de fonction exigent un pattern irréfutable : le programme ne pourrait rien faire d'autre si l'affectation échouait. `if let` et `while let` acceptent volontairement un pattern réfutable, car ils savent quoi faire en cas d'échec (sauter le bloc, ou arrêter la boucle).",
        },
      ],
    },
    {
      id: "syntaxe-patterns",
      number: "19.3",
      title: "Littéraux, variables, alternatives et plages",
      blocks: [
        {
          type: "paragraph",
          text: "La syntaxe des patterns est riche : on peut matcher des valeurs exactes, capturer dans une variable, combiner plusieurs possibilités avec `|`, ou tester une plage entière avec `..=`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn nom_du_jour(n: u32) -> &\'static str {\n    match n {\n        1 => "lundi",\n        2 => "mardi",\n        3 => "mercredi",\n        4 => "jeudi",\n        5 => "vendredi",\n        6 => "samedi",\n        7 => "dimanche",\n        _ => "jour invalide",\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Un bras de `match` peut aussi capturer la valeur dans une nouvelle variable, qui **masque** (shadow) toute variable de même nom déjà en portée :",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn demo_shadowing() {\n    let x = Some(5);\n    let y = 10;\n\n    match x {\n        Some(50) => println!("cinquante"),\n        Some(y) => println!("correspond, y = {y}"), // ce `y` masque la variable externe\n        _ => println!("valeur par défaut, x = {x:?}"),\n    }\n\n    println!("à l\'extérieur, y vaut toujours {y}");\n}',
        },
        {
          type: "code",
          language: "rust",
          code: "fn est_voyelle_ou_y(c: char) -> bool {\n    match c {\n        'a' | 'e' | 'i' | 'o' | 'u' | 'y' => true,\n        _ => false,\n    }\n}",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn categorie_age(n: u32) -> &\'static str {\n    match n {\n        0..=12 => "enfant",\n        13..=17 => "adolescent",\n        18..=64 => "adulte",\n        _ => "senior",\n    }\n}\n\nfn est_minuscule(c: char) -> bool {\n    matches!(c, \'a\'..=\'z\')\n}',
        },
        {
          type: "callout",
          variant: "info",
          text: "Les plages `..=` ne fonctionnent qu'avec des types numériques et `char`, car il faut pouvoir énumérer les valeurs intermédiaires. La macro `matches!(valeur, pattern)` est un raccourci pratique quand tu veux juste un `bool`.",
        },
      ],
    },
    {
      id: "destructuration",
      number: "19.3",
      title: "Déstructurer structs, enums et tuples",
      blocks: [
        {
          type: "paragraph",
          text: "Déstructurer, c'est décomposer une valeur composée en ses parties, en une seule ligne. Ça marche pour les tuples, les structs et les enums, aussi bien dans un `let` (pattern irréfutable) que dans un `match` (pattern réfutable, utile pour les enums à plusieurs variantes).",
        },
        {
          type: "code",
          language: "rust",
          code: 'struct Point {\n    x: i32,\n    y: i32,\n}\n\nfn demo_struct() {\n    let p = Point { x: 3, y: 7 };\n\n    // On peut nommer les champs directement...\n    let Point { x, y } = p;\n    println!("x = {x}, y = {y}");\n\n    // ...ou les renommer au passage.\n    let p2 = Point { x: 1, y: 2 };\n    let Point { x: a, y: b } = p2;\n    println!("a = {a}, b = {b}");\n}',
        },
        {
          type: "code",
          language: "rust",
          code: "enum Forme {\n    Cercle { rayon: f64 },\n    Rectangle { largeur: f64, hauteur: f64 },\n    Triangle { base: f64, hauteur: f64 },\n}\n\nfn aire(forme: &Forme) -> f64 {\n    match forme {\n        Forme::Cercle { rayon } => std::f64::consts::PI * rayon * rayon,\n        Forme::Rectangle { largeur, hauteur } => largeur * hauteur,\n        Forme::Triangle { base, hauteur } => base * hauteur / 2.0,\n    }\n}",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn demo_tuple() {\n    let ((debut_x, debut_y), (fin_x, fin_y)) = ((0, 0), (3, 4));\n    println!("segment de ({debut_x}, {debut_y}) à ({fin_x}, {fin_y})");\n}',
        },
        {
          type: "usecase",
          title: "Extraire proprement des données de structures complexes",
          text: "Dès qu'une réponse d'API ou une configuration s'imbrique (`Reponse { utilisateur: Utilisateur { profil: Profil { ville, .. }, .. }, .. }`), déstructurer directement dans le `match` ou le `let` évite une cascade fragile de `.champ.sous_champ.encore`. Combiné à `..` pour ignorer le reste, tu ne nommes que ce qui t'intéresse : le code documente lui-même les données qu'il utilise réellement.",
        },
      ],
    },
    {
      id: "ignorer-gardes-liaisons",
      number: "19.3",
      title: "Ignorer des valeurs, gardes de match et liaisons @",
      blocks: [
        {
          type: "paragraph",
          text: "Trois outils permettent d'affiner un pattern : `_` et `..` pour ignorer ce qui ne t'intéresse pas, une garde `if` pour ajouter une condition arbitraire à un bras, et `@` pour capturer une valeur tout en la testant contre un pattern.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn ignorer_premier(_: i32, second: i32) -> i32 {\n    second\n}\n\nstruct Configuration {\n    nom: String,\n    version: u32,\n    debug: bool,\n    port: u16,\n}\n\nfn resume_config(config: &Configuration) -> String {\n    // `..` ignore tous les champs non nommés explicitement.\n    let Configuration { nom, version, .. } = config;\n    format!("{nom} v{version}")\n}\n\nfn extremes(valeurs: &[i32]) -> Option<(i32, i32)> {\n    match valeurs {\n        [premier, .., dernier] => Some((*premier, *dernier)),\n        _ => None,\n    }\n}',
        },
        {
          type: "code",
          language: "rust",
          code: 'fn compare_avec_limite(n: i32, limite: i32) -> &\'static str {\n    match n {\n        x if x > limite => "au-dessus de la limite",\n        x if x == limite => "exactement à la limite",\n        _ => "en dessous de la limite",\n    }\n}',
        },
        {
          type: "code",
          language: "rust",
          code: 'enum Message {\n    Ping,\n    Id(u32),\n}\n\nfn traiter(message: Message) -> String {\n    match message {\n        Message::Id(id_valeur @ 3..=7) => format!("identifiant dans la plage réservée : {id_valeur}"),\n        Message::Id(id_valeur) => format!("identifiant : {id_valeur}"),\n        Message::Ping => "ping".to_string(),\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "Le compilateur ne peut pas vérifier qu'une garde `if` couvre tous les cas restants : un bras gardé n'entre jamais dans le calcul d'exhaustivité. Garde donc toujours un bras `_` (ou équivalent) après des bras gardés, même si tu es certain d'avoir tout couvert logiquement.",
        },
        {
          type: "usecase",
          title: "Des machines à états lisibles",
          text: "Un enum riche associé à un `match` exhaustif remplace avantageusement de longues chaînes de `if`/`else if` pour représenter un état ou un protocole. Chaque variante ne porte que les données dont elle a besoin, le compilateur t'oblige à traiter tous les cas (ou à l'assumer explicitement avec `_`), et une garde `if` permet de subdiviser un cas sans multiplier les variantes. Résultat : le code qui pilote la machine à états se lit presque comme sa spécification.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch19-ex1",
      title: "Déstructurer dans un let",
      difficulty: "facile",
      prompt:
        "Écris une fonction `distance_a_origine` qui reçoit un point représenté par un tuple `(f64, f64)` et renvoie sa distance à l'origine (racine carrée de x² + y²). À l'intérieur de la fonction, déstructure le tuple dans un `let` plutôt que d'utiliser `point.0` et `point.1`.",
      hints: [
        "`let (x, y) = point;` fonctionne car le pattern `(x, y)` est irréfutable.",
        "La méthode `.sqrt()` calcule la racine carrée d'un `f64`.",
      ],
      starter: "fn distance_a_origine(point: (f64, f64)) -> f64 {\n    todo!()\n}",
      solution:
        "fn distance_a_origine(point: (f64, f64)) -> f64 {\n    let (x, y) = point;\n    (x * x + y * y).sqrt()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn origine_donne_zero() {\n        assert_eq!(distance_a_origine((0.0, 0.0)), 0.0);\n    }\n\n    #[test]\n    fn point_3_4_donne_5() {\n        let d = distance_a_origine((3.0, 4.0));\n        assert!((d - 5.0).abs() < 1e-9);\n    }\n\n    #[test]\n    fn point_negatif() {\n        let d = distance_a_origine((-6.0, 8.0));\n        assert!((d - 10.0).abs() < 1e-9);\n    }\n}",
    },
    {
      id: "ch19-ex2",
      title: "Catégoriser une plage de nombres",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `tranche_age(age: u32) -> &'static str` qui renvoie `\"bébé\"` pour 0 à 2 ans, `\"enfant\"` pour 3 à 12 ans, `\"adolescent\"` pour 13 à 17 ans, `\"adulte\"` pour 18 à 64 ans, et `\"senior\"` au-delà. Utilise un `match` avec des plages `..=`.",
      hints: [
        "Les bras d'un `match` sont examinés dans l'ordre : découpe les plages sans qu'elles se chevauchent.",
        "Le dernier bras `_` capture tout le reste, ici les seniors.",
      ],
      starter: "fn tranche_age(age: u32) -> &'static str {\n    todo!()\n}",
      solution:
        'fn tranche_age(age: u32) -> &\'static str {\n    match age {\n        0..=2 => "bébé",\n        3..=12 => "enfant",\n        13..=17 => "adolescent",\n        18..=64 => "adulte",\n        _ => "senior",\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn bebe_et_enfant() {\n        assert_eq!(tranche_age(0), "bébé");\n        assert_eq!(tranche_age(2), "bébé");\n        assert_eq!(tranche_age(3), "enfant");\n        assert_eq!(tranche_age(12), "enfant");\n    }\n\n    #[test]\n    fn adolescent_et_adulte() {\n        assert_eq!(tranche_age(13), "adolescent");\n        assert_eq!(tranche_age(17), "adolescent");\n        assert_eq!(tranche_age(18), "adulte");\n        assert_eq!(tranche_age(64), "adulte");\n    }\n\n    #[test]\n    fn senior() {\n        assert_eq!(tranche_age(65), "senior");\n        assert_eq!(tranche_age(120), "senior");\n    }\n}',
    },
    {
      id: "ch19-ex3",
      title: "Une garde if dans un match",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `parite_du_signe(n: i32) -> &'static str` qui renvoie `\"zéro\"` si `n` vaut 0, sinon combine parité et signe : `\"positif pair\"`, `\"positif impair\"`, `\"négatif pair\"` ou `\"négatif impair\"`. Utilise un bras `n` capturant la valeur, affiné par plusieurs gardes `if`.",
      hints: [
        "Un bras `n if n > 0 && n % 2 == 0 => ...` combine capture et condition.",
        "Termine par un bras `_` (ou un dernier `n if ...`) pour rester exhaustif aux yeux du compilateur.",
      ],
      starter: "fn parite_du_signe(n: i32) -> &'static str {\n    todo!()\n}",
      solution:
        'fn parite_du_signe(n: i32) -> &\'static str {\n    match n {\n        0 => "zéro",\n        n if n > 0 && n % 2 == 0 => "positif pair",\n        n if n > 0 => "positif impair",\n        n if n % 2 == 0 => "négatif pair",\n        _ => "négatif impair",\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn cas_zero() {\n        assert_eq!(parite_du_signe(0), "zéro");\n    }\n\n    #[test]\n    fn cas_positifs() {\n        assert_eq!(parite_du_signe(4), "positif pair");\n        assert_eq!(parite_du_signe(3), "positif impair");\n    }\n\n    #[test]\n    fn cas_negatifs() {\n        assert_eq!(parite_du_signe(-4), "négatif pair");\n        assert_eq!(parite_du_signe(-3), "négatif impair");\n    }\n}',
    },
  ],
  project: {
    id: "ch19-projet",
    title: "Classer un point et décrire un événement",
    difficulty: "difficile",
    prompt:
      "Ce projet combine tout ce que tu as vu sur les patterns. Écris deux éléments.\n\n1. Une fonction `classer(point: (i32, i32)) -> &'static str` qui classe un point du plan par déstructuration et gardes : `\"origine\"` si `(0, 0)`, `\"sur l'axe X\"` si y = 0 (et x != 0), `\"sur l'axe Y\"` si x = 0 (et y != 0), sinon `\"quadrant 1\"` à `\"quadrant 4\"` selon les signes de x et y (1 : x>0,y>0 ; 2 : x<0,y>0 ; 3 : x<0,y<0 ; 4 : x>0,y<0).\n\n2. Un enum `Evenement` avec quatre variantes riches (`Connexion { utilisateur: String }`, `Deconnexion { utilisateur: String }`, `Message { de: String, contenu: String }`, `Erreur { code: u16, message: String }`) et une fonction `decrire_evenement(e: &Evenement) -> String` qui produit une phrase différente selon la variante, avec au moins une garde `if` (pour distinguer les erreurs serveur `>= 500` des erreurs client `4xx`) et une déstructuration complète des champs.",
    hints: [
      "Traite le cas `(0, 0)` en premier : sinon les patterns `(_, 0)` ou `(0, _)` l'intercepteraient dans le mauvais ordre.",
      "En matchant `e: &Evenement`, les patterns comme `Evenement::Erreur { code, message }` fonctionnent directement grâce aux ergonomies de match : `code` et `message` sont alors des références.",
      "Une garde comme `if *code >= 500` te permet de sous-diviser un même variant selon la valeur d'un champ.",
    ],
    starter:
      "#[derive(Debug)]\nenum Evenement {\n    Connexion { utilisateur: String },\n    Deconnexion { utilisateur: String },\n    Message { de: String, contenu: String },\n    Erreur { code: u16, message: String },\n}\n\nfn classer(point: (i32, i32)) -> &'static str {\n    todo!()\n}\n\nfn decrire_evenement(e: &Evenement) -> String {\n    todo!()\n}",
    solution:
      '#[derive(Debug)]\nenum Evenement {\n    Connexion { utilisateur: String },\n    Deconnexion { utilisateur: String },\n    Message { de: String, contenu: String },\n    Erreur { code: u16, message: String },\n}\n\nfn classer(point: (i32, i32)) -> &\'static str {\n    match point {\n        (0, 0) => "origine",\n        (_, 0) => "sur l\'axe X",\n        (0, _) => "sur l\'axe Y",\n        (x, y) if x > 0 && y > 0 => "quadrant 1",\n        (x, y) if x < 0 && y > 0 => "quadrant 2",\n        (x, y) if x < 0 && y < 0 => "quadrant 3",\n        _ => "quadrant 4",\n    }\n}\n\nfn decrire_evenement(e: &Evenement) -> String {\n    match e {\n        Evenement::Connexion { utilisateur } => format!("{utilisateur} s\'est connecté"),\n        Evenement::Deconnexion { utilisateur } => format!("{utilisateur} s\'est déconnecté"),\n        Evenement::Message { de, contenu } if contenu.is_empty() => {\n            format!("{de} a envoyé un message vide")\n        }\n        Evenement::Message { de, contenu } => format!("{de} dit : {contenu}"),\n        Evenement::Erreur { code, message } if *code >= 500 => {\n            format!("erreur serveur {code} : {message}")\n        }\n        Evenement::Erreur { code, message } if *code >= 400 && *code < 500 => {\n            format!("erreur client {code} : {message}")\n        }\n        Evenement::Erreur { code, message } => format!("erreur {code} : {message}"),\n    }\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn origine_est_reconnue() {\n        assert_eq!(classer((0, 0)), "origine");\n    }\n\n    #[test]\n    fn axe_x_et_axe_y() {\n        assert_eq!(classer((5, 0)), "sur l\'axe X");\n        assert_eq!(classer((-3, 0)), "sur l\'axe X");\n        assert_eq!(classer((0, 7)), "sur l\'axe Y");\n        assert_eq!(classer((0, -2)), "sur l\'axe Y");\n    }\n\n    #[test]\n    fn les_quatre_quadrants() {\n        assert_eq!(classer((2, 3)), "quadrant 1");\n        assert_eq!(classer((-2, 3)), "quadrant 2");\n        assert_eq!(classer((-2, -3)), "quadrant 3");\n        assert_eq!(classer((2, -3)), "quadrant 4");\n    }\n\n    #[test]\n    fn connexion_et_deconnexion() {\n        let c = Evenement::Connexion { utilisateur: "Alice".to_string() };\n        assert_eq!(decrire_evenement(&c), "Alice s\'est connecté");\n\n        let d = Evenement::Deconnexion { utilisateur: "Bob".to_string() };\n        assert_eq!(decrire_evenement(&d), "Bob s\'est déconnecté");\n    }\n\n    #[test]\n    fn message_vide_et_normal() {\n        let vide = Evenement::Message { de: "Alice".to_string(), contenu: String::new() };\n        assert_eq!(decrire_evenement(&vide), "Alice a envoyé un message vide");\n\n        let normal = Evenement::Message { de: "Alice".to_string(), contenu: "salut".to_string() };\n        assert_eq!(decrire_evenement(&normal), "Alice dit : salut");\n    }\n\n    #[test]\n    fn erreurs_serveur_client_et_autres() {\n        let serveur = Evenement::Erreur { code: 503, message: "indisponible".to_string() };\n        assert_eq!(decrire_evenement(&serveur), "erreur serveur 503 : indisponible");\n\n        let client = Evenement::Erreur { code: 404, message: "introuvable".to_string() };\n        assert_eq!(decrire_evenement(&client), "erreur client 404 : introuvable");\n\n        let autre = Evenement::Erreur { code: 100, message: "info".to_string() };\n        assert_eq!(decrire_evenement(&autre), "erreur 100 : info");\n    }\n}',
  },
  keyTakeaways: [
    "Un pattern décrit la forme d'une valeur ; on le retrouve dans match, if let, while let, for, let et les paramètres de fonction.",
    "Un pattern irréfutable correspond toujours (utilisable dans un let) ; un pattern réfutable peut échouer (if let, match, let-else).",
    "`|` combine plusieurs patterns, `..=` décrit une plage inclusive de nombres ou de caractères.",
    "La déstructuration de structs et d'enums dans un match extrait directement les champs qui t'intéressent.",
    "`_` ignore une valeur, `..` ignore le reste d'une struct, d'un tuple ou d'une slice.",
    "Une garde `if` ajoute une condition arbitraire à un bras de match ; `@` capture une valeur tout en la testant contre un pattern.",
  ],
};
