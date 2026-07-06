import type { Chapter } from "../types";

export const ch02: Chapter = {
  number: 2,
  slug: "jeu-du-plus-ou-moins",
  title: "Le jeu du plus ou moins",
  subtitle: "Ton premier vrai programme : lire une saisie, générer un nombre aléatoire, comparer, boucler.",
  description:
    "Ce chapitre est un projet guidé de bout en bout : le fameux jeu du plus ou moins. En le construisant, tu vas manipuler la plupart des briques de base de Rust d'un coup : lire ce que tape l'utilisateur au clavier, ajouter une dépendance externe (la crate `rand`), convertir du texte en nombre en gérant les erreurs, comparer deux valeurs avec `match`, et répéter une action avec `loop` jusqu'à ce qu'une condition soit remplie. À la fin, tu auras un programme complet et surtout tu comprendras chaque ligne que tu as écrite.",
  minutes: 40,
  rustBookRef: "Chapitre 2 — Programming a Guessing Game",
  objectives: [
    "Lire une ligne tapée au clavier avec `std::io::stdin().read_line`",
    "Ajouter et utiliser une dépendance externe via Cargo.toml (crate `rand`)",
    "Convertir une `String` en nombre avec `parse` et gérer l'erreur possible",
    "Comparer deux valeurs avec `std::cmp::Ordering` et `match`",
    "Répéter une action avec `loop` et en sortir avec `break`",
  ],
  sections: [
    {
      id: "lire-entree",
      title: "Lire une saisie clavier",
      blocks: [
        {
          type: "paragraph",
          text: "Pour que l'utilisateur puisse deviner un nombre, il faut d'abord savoir lire ce qu'il tape. En Rust, l'entrée standard (le clavier) est accessible via le module `std::io`. On commence par créer une chaîne **vide et modifiable** qui va recevoir le texte saisi.",
        },
        {
          type: "code",
          language: "rust",
          filename: "main.rs",
          code: 'use std::io;\n\nfn main() {\n    println!("Devine le nombre !");\n\n    let mut saisie = String::new();\n\n    io::stdin()\n        .read_line(&mut saisie)\n        .expect("Échec de la lecture de la ligne");\n\n    println!("Tu as tapé : {saisie}");\n}',
        },
        {
          type: "list",
          items: [
            "`String::new()` crée une chaîne vide, extensible : c'est la version « propriétaire » d'une chaîne de caractères.",
            "`let mut` est indispensable ici : par défaut une variable Rust est immuable, mais `read_line` doit pouvoir **modifier** `saisie` pour y écrire le texte lu.",
            "`&mut saisie` passe une référence mutable : `read_line` emprunte la chaîne, la remplit, puis la rend — sans jamais en devenir propriétaire.",
            "`read_line` renvoie un `Result`. `.expect(...)` affiche le message et arrête le programme si la lecture échoue (rare, mais possible).",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Pourquoi `&mut` et pas juste `saisie` ?",
          text: "Si on passait `saisie` directement, la fonction en deviendrait propriétaire et on ne pourrait plus l'utiliser après l'appel. En passant une référence mutable, on prête temporairement l'accès en écriture, puis on récupère la main.",
        },
      ],
    },
    {
      id: "dependance-rand",
      title: "Ajouter une dépendance : la crate rand",
      blocks: [
        {
          type: "paragraph",
          text: "La bibliothèque standard de Rust ne fournit **pas** de générateur de nombres aléatoires — c'est un choix de conception pour garder le cœur du langage minimal. On utilise donc une **crate** externe, publiée sur crates.io, l'équivalent de npm pour Rust : `rand`.",
        },
        {
          type: "code",
          language: "toml",
          filename: "Cargo.toml",
          code: '[package]\nname = "jeu_plus_ou_moins"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nrand = "0.8"',
          caption: "Cargo télécharge et compile la crate au prochain `cargo build`.",
        },
        {
          type: "paragraph",
          text: "Une fois la dépendance déclarée, on peut générer un nombre secret entre 1 et 100 (bornes incluses) :",
        },
        {
          type: "code",
          language: "rust",
          code: 'use rand::Rng;\n\nfn main() {\n    let nombre_secret = rand::thread_rng().gen_range(1..=100);\n    println!("Le nombre secret est {nombre_secret}");\n}',
        },
        {
          type: "list",
          items: [
            "`use rand::Rng;` importe le **trait** qui définit la méthode `gen_range` — sans cet import, la méthode n'est pas visible.",
            "`rand::thread_rng()` renvoie un générateur local au thread courant, prêt à l'emploi.",
            "`1..=100` est un intervalle **inclusif** : il peut produire 1, 100, ou n'importe quel entier entre les deux.",
          ],
        },
        {
          type: "usecase",
          title: "Quand a-t-on besoin d'une crate comme rand",
          text: "Dès qu'un besoin est courant mais pas assez universel pour justifier sa place dans la bibliothèque standard : nombres aléatoires, dates, sérialisation JSON, HTTP... L'écosystème Rust préfère de petites crates spécialisées, versionnées indépendamment, plutôt qu'une stdlib énorme. Réflexe à avoir : chercher sur crates.io avant de réinventer la roue.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Le numéro de version compte : `rand = \"0.8\"` fixe une plage compatible avec 0.8.x. Une montée vers `0.9` peut changer l'API (c'est déjà arrivé pour `gen_range`). Vérifie toujours la documentation de la version installée.",
        },
      ],
    },
    {
      id: "parser-nombre",
      title: "Convertir le texte en nombre",
      blocks: [
        {
          type: "paragraph",
          text: "`read_line` remplit `saisie` avec du **texte**, pas un nombre — et ce texte contient même le retour à la ligne tapé avec Entrée. Pour comparer avec le nombre secret, il faut d'abord nettoyer puis convertir avec `parse`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let saisie = saisie.trim();\n\nlet essai: u32 = match saisie.parse() {\n    Ok(nombre) => nombre,\n    Err(_) => {\n        println!("Merci d\'entrer un nombre valide !");\n        continue; // retourne au début de la boucle (voir plus bas)\n    }\n};',
        },
        {
          type: "list",
          items: [
            "`.trim()` supprime les espaces et le `\\n` de fin de ligne — sans lui, `\"42\\n\".parse::<u32>()` échoue.",
            "`.parse()` renvoie un `Result<u32, _>` : `Ok(nombre)` si la conversion réussit, `Err(_)` sinon (texte non numérique, nombre négatif pour un `u32`, etc.).",
            "Le `match` gère les deux cas explicitement : impossible d'oublier l'erreur, contrairement à un `unwrap()` qui ferait planter le programme.",
            "Réutiliser le nom `saisie` pour la version nettoyée (*shadowing*) est un idiome courant en Rust : pas besoin d'inventer `saisie_nettoyee`.",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          title: "unwrap() vs match",
          text: "`saisie.trim().parse().unwrap()` fonctionnerait tant que l'utilisateur tape un nombre correct, mais ferait **planter** le programme (panic) à la moindre faute de frappe. Dans un vrai jeu interactif, on préfère `match` pour redemander poliment une saisie valide.",
        },
      ],
    },
    {
      id: "comparer-ordering",
      title: "Comparer avec Ordering",
      blocks: [
        {
          type: "paragraph",
          text: "Pour comparer l'essai du joueur au nombre secret, Rust fournit `std::cmp::Ordering`, une énumération à trois variantes : `Less`, `Greater`, `Equal`. La méthode `.cmp()`, disponible sur tous les types ordonnés, renvoie exactement ça.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::cmp::Ordering;\n\nfn main() {\n    let nombre_secret = 42;\n    let essai = 30;\n\n    match essai.cmp(&nombre_secret) {\n        Ordering::Less => println!("Trop petit !"),\n        Ordering::Greater => println!("Trop grand !"),\n        Ordering::Equal => println!("Gagné !"),\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Le `match` doit couvrir **toutes** les variantes possibles d'`Ordering` — le compilateur refuse de compiler s'il en manque une. C'est une garantie précieuse : impossible d'oublier un cas par étourderie.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`a.cmp(&b)` compare `a` par rapport à `b`. `essai.cmp(&nombre_secret)` renvoie `Less` si `essai < nombre_secret`, exactement comme on le lirait en français : « l'essai est plus petit ».",
        },
      ],
    },
    {
      id: "boucle-loop",
      title: "Boucler jusqu'à la victoire",
      blocks: [
        {
          type: "paragraph",
          text: "Il ne manque plus qu'une chose : répéter la demande de saisie jusqu'à ce que le joueur trouve le nombre. `loop` crée une boucle infinie, et `break` en sort dès que la condition de victoire est atteinte.",
        },
        {
          type: "code",
          language: "rust",
          filename: "main.rs",
          code: 'use rand::Rng;\nuse std::cmp::Ordering;\nuse std::io;\n\nfn main() {\n    println!("Devine le nombre !");\n\n    let nombre_secret = rand::thread_rng().gen_range(1..=100);\n\n    loop {\n        println!("Entre ton essai :");\n\n        let mut saisie = String::new();\n        io::stdin()\n            .read_line(&mut saisie)\n            .expect("Échec de la lecture de la ligne");\n\n        let essai: u32 = match saisie.trim().parse() {\n            Ok(nombre) => nombre,\n            Err(_) => {\n                println!("Merci d\'entrer un nombre valide !");\n                continue;\n            }\n        };\n\n        println!("Tu as tapé : {essai}");\n\n        match essai.cmp(&nombre_secret) {\n            Ordering::Less => println!("Trop petit !"),\n            Ordering::Greater => println!("Trop grand !"),\n            Ordering::Equal => {\n                println!("Gagné !");\n                break;\n            }\n        }\n    }\n}',
          caption: "Le programme complet : lecture, parsing, comparaison, boucle.",
        },
        {
          type: "list",
          items: [
            "`loop` répète son bloc indéfiniment, jusqu'à un `break` explicite.",
            "`continue` saute directement au prochain tour de boucle : pratique pour ignorer une saisie invalide sans quitter le jeu.",
            "`break` (sans valeur ici) sort de la boucle dès que `Ordering::Equal` est atteint.",
            "Chaque tour de boucle recrée une `saisie` neuve : impossible de réutiliser l'ancienne, qui contiendrait encore l'essai précédent.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Séparer la logique de l'entrée/sortie",
          text: "Dans les exercices qui suivent, on va extraire la logique de comparaison dans des fonctions pures (sans `println!` ni `stdin`). C'est ce qui les rend testables automatiquement : un test ne peut pas « taper au clavier », mais il peut appeler une fonction avec des valeurs connues et vérifier son résultat.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch2-ex1",
      title: "Parser une saisie utilisateur",
      difficulty: "facile",
      prompt:
        "Écris une fonction `parser_essai(saisie: &str) -> Option<u32>` qui nettoie la chaîne (espaces, retours à la ligne) puis tente de la convertir en `u32`. Renvoie `None` si la conversion échoue (texte vide, non numérique, négatif...).",
      hints: [
        "`.trim()` avant `.parse()`.",
        "`Result::ok()` transforme un `Result<T, E>` en `Option<T>`, en jetant l'erreur.",
      ],
      starter: "fn parser_essai(saisie: &str) -> Option<u32> {\n    todo!()\n}",
      solution:
        "fn parser_essai(saisie: &str) -> Option<u32> {\n    saisie.trim().parse::<u32>().ok()\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn accepte_un_nombre_valide() {\n        assert_eq!(parser_essai("42"), Some(42));\n    }\n\n    #[test]\n    fn ignore_les_espaces_et_le_retour_a_la_ligne() {\n        assert_eq!(parser_essai("  17\\n"), Some(17));\n    }\n\n    #[test]\n    fn refuse_un_texte_non_numerique() {\n        assert_eq!(parser_essai("abc"), None);\n    }\n\n    #[test]\n    fn refuse_un_nombre_negatif() {\n        assert_eq!(parser_essai("-5"), None);\n    }\n\n    #[test]\n    fn refuse_une_chaine_vide() {\n        assert_eq!(parser_essai(""), None);\n    }\n}',
    },
    {
      id: "ch2-ex2",
      title: "Comparer deux nombres",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `comparer(secret: u32, essai: u32) -> std::cmp::Ordering` qui indique la position de `essai` par rapport à `secret` (comme le ferait `essai.cmp(&secret)`, mais écrite explicitement avec un `match` sur `essai < secret` / `essai > secret`).",
      hints: [
        "`std::cmp::Ordering` a trois variantes : `Less`, `Greater`, `Equal`.",
        "Tu peux écrire un `if`/`else if`/`else`, ou directement `essai.cmp(&secret)` — les deux sont valides, mais essaie d'abord sans `.cmp()` pour bien comprendre la logique.",
      ],
      starter:
        "use std::cmp::Ordering;\n\nfn comparer(secret: u32, essai: u32) -> Ordering {\n    todo!()\n}",
      solution:
        "use std::cmp::Ordering;\n\nfn comparer(secret: u32, essai: u32) -> Ordering {\n    if essai < secret {\n        Ordering::Less\n    } else if essai > secret {\n        Ordering::Greater\n    } else {\n        Ordering::Equal\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn essai_trop_petit() {\n        assert_eq!(comparer(50, 20), Ordering::Less);\n    }\n\n    #[test]\n    fn essai_trop_grand() {\n        assert_eq!(comparer(50, 80), Ordering::Greater);\n    }\n\n    #[test]\n    fn essai_correct() {\n        assert_eq!(comparer(50, 50), Ordering::Equal);\n    }\n}',
    },
    {
      id: "ch2-ex3",
      title: "Générer un nombre dans un intervalle",
      difficulty: "difficile",
      prompt:
        "Écris une fonction `nombre_aleatoire(min: u32, max: u32) -> u32` (bornes incluses) qui utilise `rand::thread_rng().gen_range(...)`. Comme le résultat est imprévisible, les tests ne vérifient pas une valeur précise mais que le résultat reste **toujours** dans l'intervalle demandé, même en répétant l'appel de nombreuses fois.",
      hints: [
        "Ajoute `rand = \"0.8\"` dans `[dependencies]` du `Cargo.toml`.",
        "`min..=max` est un intervalle inclusif, exactement ce qu'il faut ici.",
        "Dans les tests, appelle la fonction en boucle (par exemple 1000 fois) pour couvrir large.",
      ],
      starter:
        "use rand::Rng;\n\nfn nombre_aleatoire(min: u32, max: u32) -> u32 {\n    todo!()\n}",
      solution:
        "use rand::Rng;\n\nfn nombre_aleatoire(min: u32, max: u32) -> u32 {\n    rand::thread_rng().gen_range(min..=max)\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn reste_dans_intervalle_etroit() {\n        for _ in 0..1000 {\n            let n = nombre_aleatoire(1, 6);\n            assert!(n >= 1 && n <= 6);\n        }\n    }\n\n    #[test]\n    fn reste_dans_intervalle_large() {\n        for _ in 0..1000 {\n            let n = nombre_aleatoire(1, 100);\n            assert!(n >= 1 && n <= 100);\n        }\n    }\n\n    #[test]\n    fn intervalle_reduit_a_une_seule_valeur() {\n        assert_eq!(nombre_aleatoire(7, 7), 7);\n    }\n}',
    },
  ],
  project: {
    id: "ch2-projet",
    title: "Le jeu du plus ou moins, testable de bout en bout",
    difficulty: "difficile",
    prompt:
      "Construis la logique complète du jeu, **sans aucune entrée/sortie**, pour qu'elle soit entièrement testable. Écris `evaluer_essai(secret: u32, essai: u32) -> &'static str` qui renvoie `\"trop petit\"`, `\"trop grand\"` ou `\"gagné\"`. Puis écris `jouer_partie(secret: u32, essais: &[u32]) -> Option<usize>` qui simule une partie à partir d'une liste d'essais déjà connus (comme si un joueur les avait tapés dans cet ordre) et renvoie le **numéro** (à partir de 1) de l'essai gagnant, ou `None` si aucun essai de la liste ne trouve le nombre secret. Termine par un `main()` qui utilise ces fonctions dans une vraie boucle interactive avec `stdin`.",
    hints: [
      "`evaluer_essai` peut réutiliser `essai.cmp(&secret)` et un `match` comme dans le cours.",
      "`jouer_partie` peut itérer avec `.iter().enumerate()` pour connaître à la fois l'index et la valeur.",
      "L'index de `enumerate()` commence à 0 : ajoute 1 pour obtenir le \"numéro\" de l'essai.",
      "Le `main()` n'est pas testé automatiquement (il attend une vraie saisie clavier) : c'est `evaluer_essai` et `jouer_partie` qui portent toute la logique testable.",
    ],
    starter:
      "use rand::Rng;\nuse std::cmp::Ordering;\nuse std::io;\n\n/// Renvoie \"trop petit\", \"trop grand\" ou \"gagné\" selon l'essai.\nfn evaluer_essai(secret: u32, essai: u32) -> &'static str {\n    todo!()\n}\n\n/// Simule une partie à partir d'une liste d'essais.\n/// Renvoie le numéro (à partir de 1) de l'essai gagnant, ou None.\nfn jouer_partie(secret: u32, essais: &[u32]) -> Option<usize> {\n    todo!()\n}\n\nfn main() {\n    println!(\"Devine le nombre entre 1 et 100 !\");\n    let secret = rand::thread_rng().gen_range(1..=100);\n\n    loop {\n        let mut saisie = String::new();\n        io::stdin()\n            .read_line(&mut saisie)\n            .expect(\"Échec de la lecture de la ligne\");\n\n        let essai: u32 = match saisie.trim().parse() {\n            Ok(n) => n,\n            Err(_) => {\n                println!(\"Merci d'entrer un nombre valide !\");\n                continue;\n            }\n        };\n\n        match evaluer_essai(secret, essai) {\n            \"gagné\" => {\n                println!(\"Gagné !\");\n                break;\n            }\n            message => println!(\"{message}\"),\n        }\n    }\n}",
    solution:
      "use rand::Rng;\nuse std::cmp::Ordering;\nuse std::io;\n\n/// Renvoie \"trop petit\", \"trop grand\" ou \"gagné\" selon l'essai.\nfn evaluer_essai(secret: u32, essai: u32) -> &'static str {\n    match essai.cmp(&secret) {\n        Ordering::Less => \"trop petit\",\n        Ordering::Greater => \"trop grand\",\n        Ordering::Equal => \"gagné\",\n    }\n}\n\n/// Simule une partie à partir d'une liste d'essais déjà connus.\n/// Renvoie le numéro (à partir de 1) de l'essai gagnant, ou None si aucun ne gagne.\nfn jouer_partie(secret: u32, essais: &[u32]) -> Option<usize> {\n    for (index, &essai) in essais.iter().enumerate() {\n        if evaluer_essai(secret, essai) == \"gagné\" {\n            return Some(index + 1);\n        }\n    }\n    None\n}\n\nfn main() {\n    println!(\"Devine le nombre entre 1 et 100 !\");\n    let secret = rand::thread_rng().gen_range(1..=100);\n\n    loop {\n        let mut saisie = String::new();\n        io::stdin()\n            .read_line(&mut saisie)\n            .expect(\"Échec de la lecture de la ligne\");\n\n        let essai: u32 = match saisie.trim().parse() {\n            Ok(n) => n,\n            Err(_) => {\n                println!(\"Merci d'entrer un nombre valide !\");\n                continue;\n            }\n        };\n\n        match evaluer_essai(secret, essai) {\n            \"gagné\" => {\n                println!(\"Gagné !\");\n                break;\n            }\n            message => println!(\"{message}\"),\n        }\n    }\n}",
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn evaluer_essai_trop_petit() {\n        assert_eq!(evaluer_essai(50, 10), "trop petit");\n    }\n\n    #[test]\n    fn evaluer_essai_trop_grand() {\n        assert_eq!(evaluer_essai(50, 90), "trop grand");\n    }\n\n    #[test]\n    fn evaluer_essai_gagne() {\n        assert_eq!(evaluer_essai(50, 50), "gagné");\n    }\n\n    #[test]\n    fn jouer_partie_trouve_le_bon_essai() {\n        assert_eq!(jouer_partie(50, &[10, 90, 50, 20]), Some(3));\n    }\n\n    #[test]\n    fn jouer_partie_gagne_du_premier_coup() {\n        assert_eq!(jouer_partie(7, &[7]), Some(1));\n    }\n\n    #[test]\n    fn jouer_partie_ne_trouve_jamais() {\n        assert_eq!(jouer_partie(50, &[10, 90, 20]), None);\n    }\n\n    #[test]\n    fn jouer_partie_avec_liste_vide() {\n        assert_eq!(jouer_partie(50, &[]), None);\n    }\n}',
  },
  keyTakeaways: [
    "`std::io::stdin().read_line(&mut s)` lit une ligne clavier dans une `String` mutable.",
    "Les dépendances externes se déclarent dans `Cargo.toml` ; `rand::thread_rng().gen_range(1..=100)` génère un entier aléatoire inclusif.",
    "`.trim().parse::<T>()` convertit du texte en nombre et renvoie un `Result` à gérer (avec `match`, pas `unwrap` en contexte interactif).",
    "`std::cmp::Ordering` (`Less`/`Greater`/`Equal`) combiné à `match` structure proprement une comparaison.",
    "`loop` répète une action jusqu'à un `break` ; `continue` passe directement au tour suivant.",
    "Séparer la logique pure (testable) de l'entrée/sortie (non testable) rend le code fiable et vérifiable automatiquement.",
  ],
};
