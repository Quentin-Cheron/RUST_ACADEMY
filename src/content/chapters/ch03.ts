import type { Chapter } from "../types";

export const ch03: Chapter = {
  number: 3,
  slug: "concepts-de-base",
  title: "Les concepts de base",
  subtitle: "Variables, types, fonctions et contrôle de flux : les briques de tout programme Rust.",
  description:
    "Rust ressemble à beaucoup de langages impératifs, mais applique dès le départ des règles strictes : immutabilité par défaut, typage statique explicite, distinction nette entre expressions et instructions. Ce chapitre pose le vocabulaire et les réflexes de base — variables, types scalaires et composés, fonctions, commentaires, boucles — que tu utiliseras dans chaque ligne de code à venir.",
  minutes: 40,
  rustBookRef: "Chapitre 3 — Common Programming Concepts",
  objectives: [
    "Distinguer `let`, `let mut` et `const`, et comprendre le shadowing",
    "Connaître les types scalaires (entiers, flottants, booléens, caractères)",
    "Manipuler les tuples et les tableaux, deux types composés de taille fixe",
    "Écrire des fonctions en distinguant expressions et instructions",
    "Commenter son code avec `//` et les commentaires de documentation `///`",
    "Contrôler le flux d'exécution avec `if`/`else`, `loop`, `while` et `for`",
  ],
  sections: [
    {
      id: "variables-mutabilite",
      number: "3.1",
      title: "Variables et mutabilité",
      blocks: [
        {
          type: "paragraph",
          text: "En Rust, une variable déclarée avec `let` est **immuable par défaut** : une fois qu'une valeur lui est liée, on ne peut plus la réassigner. C'est un choix délibéré qui élimine toute une classe de bugs liés aux modifications inattendues d'état.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let x = 5;\n    println!("La valeur de x est {x}");\n    x = 6; // erreur de compilation : x est immuable\n}',
          caption: "Le compilateur refuse la réassignation d'une variable immuable.",
        },
        {
          type: "paragraph",
          text: "Pour autoriser la modification, il faut le dire explicitement avec `let mut`. Le mot-clé rend l'intention visible dans le code : quiconque relit la fonction sait immédiatement que cette variable va changer.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let mut x = 5;\n    println!("La valeur de x est {x}");\n    x = 6;\n    println!("La valeur de x est maintenant {x}");\n}',
        },
        {
          type: "usecase",
          title: "Quand utiliser `mut`",
          text: "Utilise `mut` uniquement quand une variable doit réellement changer de valeur au fil du temps : un compteur dans une boucle, un accumulateur, un état qui évolue. Pour tout le reste (résultats de calculs, valeurs de configuration, données lues une fois), garde l'immutabilité par défaut : c'est plus sûr et cela documente ton intention.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "L'immutabilité par défaut facilite le raisonnement sur le code et la concurrence : une donnée qui ne change jamais ne peut pas être source de « data race ».",
        },
      ],
    },
    {
      id: "constantes-shadowing",
      number: "3.1",
      title: "Constantes et shadowing",
      blocks: [
        {
          type: "paragraph",
          text: "Les **constantes**, déclarées avec `const`, sont toujours immuables (même `mut` est interdit), doivent avoir un type annoté explicitement, et peuvent être déclarées dans n'importe quelle portée, y compris globale. Par convention, leur nom est en `SCREAMING_SNAKE_CASE`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'const MAX_POINTS: u32 = 100_000;\n\nfn main() {\n    println!("Score maximum : {MAX_POINTS}");\n}',
        },
        {
          type: "paragraph",
          text: "Le **shadowing** permet de redéclarer une variable avec le même nom en utilisant à nouveau `let`. La nouvelle variable « masque » l'ancienne. Contrairement à `mut`, le shadowing peut même changer le type de la valeur.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let entree = "   42   ";\n    let entree = entree.trim();   // toujours une &str, mais sans espaces\n    let entree: i32 = entree.parse().unwrap(); // devient un i32\n\n    println!("Valeur nettoyée : {entree}");\n}',
          caption: "Le shadowing permet de transformer une valeur étape par étape sans inventer de nouveaux noms.",
        },
        {
          type: "usecase",
          title: "Shadowing pour transformer une donnée",
          text: "Le shadowing est idéal quand tu appliques une série de transformations sur la même donnée logique (parser une entrée utilisateur, nettoyer une chaîne, convertir un type) : tu réutilises un nom clair à chaque étape au lieu d'inventer `entree_str`, `entree_trim`, `entree_int`.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Shadowing ≠ mutation",
          text: "Avec `mut`, la variable garde le même type et sa valeur change en place. Avec le shadowing, chaque `let` crée une **nouvelle** variable (potentiellement d'un type différent) ; l'ancienne devient simplement inaccessible.",
        },
      ],
    },
    {
      id: "types-scalaires",
      number: "3.2",
      title: "Types scalaires",
      blocks: [
        {
          type: "paragraph",
          text: "Rust est **statiquement typé** : chaque valeur a un type connu à la compilation. Les types scalaires représentent une valeur unique : entiers, flottants, booléens et caractères.",
        },
        {
          type: "list",
          items: [
            "Entiers signés : `i8`, `i16`, `i32` (défaut), `i64`, `i128`, `isize`",
            "Entiers non signés : `u8`, `u16`, `u32`, `u64`, `u128`, `usize`",
            "Flottants : `f32`, `f64` (défaut, double précision)",
            "Booléen : `bool` (`true` ou `false`)",
            "Caractère : `char`, 4 octets, représente un scalaire Unicode (pas juste ASCII)",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let age: u32 = 30;          // ne peut jamais être négatif\n    let solde: i64 = -1_250;    // peut être négatif, grande plage\n    let pi: f64 = 3.14159;\n    let actif: bool = true;\n    let lettre: char = \'z\';\n    let emoji: char = \'🦀\';\n\n    println!("{age} {solde} {pi} {actif} {lettre} {emoji}");\n}',
        },
        {
          type: "usecase",
          title: "Choisir le bon type entier",
          text: "Utilise `u32`/`u64` pour des quantités qui ne peuvent pas être négatives (âges, tailles, compteurs). Utilise `usize` pour indexer des collections ou représenter une taille en mémoire — c'est le type que Rust attend pour l'indexation des tableaux et `Vec`. Réserve les types signés (`i32`, `i64`) aux valeurs qui peuvent être négatives (soldes, écarts, coordonnées).",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Dépassement de capacité (overflow)",
          text: "En mode debug, une opération qui dépasse la capacité d'un entier (ex : `255u8 + 1`) fait **paniquer** le programme. En mode release, elle « boucle » silencieusement (wrapping). Pour un comportement explicite, utilise `checked_add`, `wrapping_add` ou `saturating_add`.",
        },
      ],
    },
    {
      id: "types-composes",
      number: "3.2",
      title: "Types composés : tuples et tableaux",
      blocks: [
        {
          type: "paragraph",
          text: "Un **tuple** regroupe plusieurs valeurs de types potentiellement différents dans une seule variable, avec une taille fixe. On peut le déstructurer ou accéder à ses éléments par position avec la notation `.0`, `.1`, etc.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let personne: (&str, u32, f64) = ("Alice", 28, 1.68);\n\n    let (nom, age, taille) = personne; // déstructuration\n    println!("{nom} a {age} ans et mesure {taille} m");\n\n    println!("Accès direct : {}", personne.0);\n}',
        },
        {
          type: "paragraph",
          text: "Un **tableau** (`[T; N]`) regroupe plusieurs valeurs du **même type**, avec une taille fixe connue à la compilation. Contrairement à `Vec<T>` (vu plus tard), un tableau est alloué sur la pile et ne peut ni grandir ni rétrécir.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let mois: [&str; 3] = ["Janvier", "Février", "Mars"];\n    let zeros = [0; 5]; // [0, 0, 0, 0, 0]\n\n    println!("Premier mois : {}", mois[0]);\n    println!("Taille du tableau zeros : {}", zeros.len());\n}',
        },
        {
          type: "usecase",
          title: "Tuple vs tableau vs fonction à plusieurs retours",
          text: "Utilise un **tuple** pour regrouper quelques valeurs hétérogènes liées, notamment pour faire renvoyer plusieurs résultats à une fonction (par exemple `(min, max, moyenne)`). Utilise un **tableau** pour une collection homogène de taille fixe et connue à l'avance, comme les 7 jours de la semaine ou les 12 mois de l'année.",
        },
        {
          type: "callout",
          variant: "danger",
          text: "Accéder à un index hors limites d'un tableau (`mois[10]`) fait paniquer le programme à l'exécution : Rust vérifie toujours les bornes, contrairement au C.",
        },
      ],
    },
    {
      id: "fonctions",
      number: "3.3",
      title: "Fonctions",
      blocks: [
        {
          type: "paragraph",
          text: "Une fonction se déclare avec `fn`, en `snake_case`. Chaque paramètre doit avoir un type annoté explicitement — Rust ne devine jamais le type d'un paramètre de fonction.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn saluer(nom: &str, age: u32) {\n    println!("{nom} a {age} ans.");\n}\n\nfn main() {\n    saluer("Alice", 28);\n}',
        },
        {
          type: "paragraph",
          text: "En Rust, une **instruction** effectue une action sans renvoyer de valeur (elle se termine par `;`), tandis qu'une **expression** s'évalue en une valeur. Un bloc `{ ... }` est lui-même une expression : sa valeur est celle de sa dernière ligne, à condition qu'elle ne se termine pas par `;`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let y = {\n        let x = 3;\n        x + 1 // pas de point-virgule : c\'est la valeur du bloc\n    };\n\n    println!("y vaut {y}"); // y vaut 4\n}',
        },
        {
          type: "paragraph",
          text: "La valeur de retour d'une fonction est l'expression finale de son corps (sans `;`), et le type de retour s'annonce après `->`. Le mot-clé `return` permet une sortie anticipée.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn valeur_absolue(n: i32) -> i32 {\n    if n < 0 {\n        return -n; // sortie anticipée\n    }\n    n // dernière expression : valeur de retour implicite\n}",
        },
      ],
    },
    {
      id: "commentaires",
      number: "3.4",
      title: "Commentaires",
      blocks: [
        {
          type: "paragraph",
          text: "Les commentaires avec `//` sont ignorés par le compilateur et servent à expliquer le « pourquoi ». Les commentaires `///` (avec trois barres) sont des **commentaires de documentation** : `cargo doc` les transforme automatiquement en documentation HTML.",
        },
        {
          type: "code",
          language: "rust",
          code: '// Calcule la surface d\'un rectangle.\n/// Renvoie la surface d\'un rectangle de largeur `l` et hauteur `h`.\n///\n/// # Exemples\n///\n/// ```\n/// let s = surface(3, 4);\n/// assert_eq!(s, 12);\n/// ```\nfn surface(l: u32, h: u32) -> u32 {\n    l * h // pas de point-virgule : valeur renvoyée\n}',
        },
        {
          type: "usecase",
          title: "Documenter une fonction publique avec `///`",
          text: "Dès qu'une fonction fait partie de l'interface publique d'une bibliothèque (ou simplement mérite d'être comprise sans lire son code), utilise `///` plutôt que `//`. Les exemples de code dans un commentaire `///` sont même exécutés comme des tests par `cargo test` : c'est une documentation qui ne peut pas mentir.",
        },
      ],
    },
    {
      id: "controle-de-flux",
      number: "3.5",
      title: "Contrôle de flux",
      blocks: [
        {
          type: "paragraph",
          text: "`if` est une **expression** en Rust : elle peut être utilisée directement dans un `let`. La condition doit impérativement être un `bool` — pas de conversion implicite depuis un entier comme en C.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let nombre = 7;\n\n    let parite = if nombre % 2 == 0 { "pair" } else { "impair" };\n    println!("{nombre} est {parite}");\n}',
        },
        {
          type: "paragraph",
          text: "`loop` répète un bloc indéfiniment jusqu'à un `break`. Particularité utile : `break` peut renvoyer une valeur, qui devient celle de l'expression `loop`.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn main() {\n    let mut compteur = 0;\n\n    let resultat = loop {\n        compteur += 1;\n        if compteur == 10 {\n            break compteur * 2; // valeur renvoyée par loop\n        }\n    };\n\n    println!(\"resultat = {resultat}\"); // 20\n}",
        },
        {
          type: "paragraph",
          text: "`while` répète un bloc tant qu'une condition booléenne est vraie. `for ... in` itère sur une collection ou un intervalle (`Range`) : c'est le choix le plus idiomatique et le plus sûr, car il élimine les erreurs d'index.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let mut n = 3;\n    while n != 0 {\n        println!("{n}...");\n        n -= 1;\n    }\n    println!("Décollage !");\n\n    let notes = [85, 92, 78];\n    for note in notes {\n        println!("Note : {note}");\n    }\n\n    for i in 0..5 {         // 0, 1, 2, 3, 4 (borne haute exclue)\n        print!("{i} ");\n    }\n    println!();\n\n    for i in 0..=5 {        // 0, 1, 2, 3, 4, 5 (borne haute incluse)\n        print!("{i} ");\n    }\n}',
        },
        {
          type: "usecase",
          title: "Préférer `for` à `while` pour parcourir une collection",
          text: "Un `while` couplé à un index manuel (`while i < tableau.len()`) est une source classique d'erreurs « off-by-one » ou d'oubli d'incrément. `for element in tableau` (ou `for i in 0..tableau.len()` si l'index est vraiment nécessaire) est plus court, plus lisible, et garanti sans dépassement.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Pour sortir d'une boucle imbriquée précise, on peut nommer les boucles avec une étiquette (`'externe: loop { ... break 'externe; }`) au lieu d'utiliser un booléen de contrôle.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch3-ex1",
      title: "Conversion Celsius vers Fahrenheit",
      difficulty: "facile",
      prompt:
        "Écris une fonction `celsius_vers_fahrenheit` qui convertit une température en degrés Celsius (`f64`) vers son équivalent en Fahrenheit, avec la formule `F = C * 9/5 + 32`.",
      hints: [
        "Utilise `9.0 / 5.0` et non `9 / 5` pour éviter une division entière.",
        "0°C doit donner 32°F, et 100°C doit donner 212°F.",
      ],
      starter: "fn celsius_vers_fahrenheit(celsius: f64) -> f64 {\n    todo!()\n}",
      solution:
        "fn celsius_vers_fahrenheit(celsius: f64) -> f64 {\n    celsius * 9.0 / 5.0 + 32.0\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn zero_degre_celsius() {\n        assert_eq!(celsius_vers_fahrenheit(0.0), 32.0);\n    }\n\n    #[test]\n    fn cent_degres_celsius() {\n        assert_eq!(celsius_vers_fahrenheit(100.0), 212.0);\n    }\n\n    #[test]\n    fn point_egal() {\n        assert_eq!(celsius_vers_fahrenheit(-40.0), -40.0);\n    }\n}',
    },
    {
      id: "ch3-ex2",
      title: "N-ième nombre de Fibonacci",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `fibonacci` qui renvoie le `n`-ième terme de la suite de Fibonacci (`fibonacci(0) = 0`, `fibonacci(1) = 1`, chaque terme suivant est la somme des deux précédents). Utilise une **boucle**, pas de récursion.",
      hints: [
        "Garde deux variables `a` et `b` représentant les deux derniers termes, et fais-les avancer à chaque tour de `loop` ou de `for`.",
        "Un `for _ in 0..n` combiné à un `mut` fonctionne très bien ici.",
      ],
      starter: "fn fibonacci(n: u32) -> u64 {\n    todo!()\n}",
      solution:
        "fn fibonacci(n: u32) -> u64 {\n    let mut a: u64 = 0;\n    let mut b: u64 = 1;\n\n    for _ in 0..n {\n        let suivant = a + b;\n        a = b;\n        b = suivant;\n    }\n\n    a\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn premiers_termes() {\n        assert_eq!(fibonacci(0), 0);\n        assert_eq!(fibonacci(1), 1);\n        assert_eq!(fibonacci(2), 1);\n        assert_eq!(fibonacci(3), 2);\n    }\n\n    #[test]\n    fn terme_plus_loin() {\n        assert_eq!(fibonacci(10), 55);\n    }\n}",
    },
    {
      id: "ch3-ex3",
      title: "FizzBuzz",
      difficulty: "facile",
      prompt:
        "Écris une fonction `fizzbuzz` qui reçoit un entier `n` (`u32`) et renvoie une `String` : `\"Fizz\"` si `n` est multiple de 3, `\"Buzz\"` si multiple de 5, `\"FizzBuzz\"` si multiple des deux, sinon le nombre lui-même sous forme de texte.",
      hints: [
        "Teste d'abord le cas « multiple de 3 ET de 5 » avant les cas séparés.",
        "`n.to_string()` convertit un entier en `String`.",
      ],
      starter: "fn fizzbuzz(n: u32) -> String {\n    todo!()\n}",
      solution:
        'fn fizzbuzz(n: u32) -> String {\n    if n % 15 == 0 {\n        "FizzBuzz".to_string()\n    } else if n % 3 == 0 {\n        "Fizz".to_string()\n    } else if n % 5 == 0 {\n        "Buzz".to_string()\n    } else {\n        n.to_string()\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn multiple_de_trois() {\n        assert_eq!(fizzbuzz(9), "Fizz");\n    }\n\n    #[test]\n    fn multiple_de_cinq() {\n        assert_eq!(fizzbuzz(10), "Buzz");\n    }\n\n    #[test]\n    fn multiple_de_quinze() {\n        assert_eq!(fizzbuzz(15), "FizzBuzz");\n    }\n\n    #[test]\n    fn nombre_normal() {\n        assert_eq!(fizzbuzz(7), "7");\n    }\n}',
    },
    {
      id: "ch3-ex4",
      title: "Factorielle",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `factorielle` qui calcule `n!` (le produit de tous les entiers de 1 à `n`) à l'aide d'une boucle. Par convention, `factorielle(0) = 1`.",
      hints: [
        "Initialise un accumulateur `mut resultat: u64 = 1`.",
        "`for i in 1..=n` parcourt les entiers de 1 à `n` inclus.",
      ],
      starter: "fn factorielle(n: u64) -> u64 {\n    todo!()\n}",
      solution:
        "fn factorielle(n: u64) -> u64 {\n    let mut resultat: u64 = 1;\n\n    for i in 1..=n {\n        resultat *= i;\n    }\n\n    resultat\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn factorielle_de_zero() {\n        assert_eq!(factorielle(0), 1);\n    }\n\n    #[test]\n    fn factorielle_de_un() {\n        assert_eq!(factorielle(1), 1);\n    }\n\n    #[test]\n    fn factorielle_de_cinq() {\n        assert_eq!(factorielle(5), 120);\n    }\n\n    #[test]\n    fn factorielle_de_dix() {\n        assert_eq!(factorielle(10), 3_628_800);\n    }\n}",
    },
  ],
  project: {
    id: "ch3-projet",
    title: "Statistiques simples sur un tableau",
    difficulty: "moyen",
    prompt:
      "Écris une fonction `statistiques` qui reçoit une tranche de nombres `&[i32]` (au moins un élément) et renvoie un **tuple** `(i32, i32, f64)` contenant respectivement le minimum, le maximum et la moyenne des valeurs. Si la tranche est vide, la fonction doit paniquer avec un message clair : c'est un cas invalide qu'on choisit d'exclure plutôt que de gérer silencieusement. Ce projet combine tableaux, tuples, boucles `for` et calcul avec conversions de types (`i32` vers `f64`).",
    hints: [
      "Initialise `min` et `max` avec le premier élément de la tranche avant de boucler sur le reste.",
      "Fais la somme des éléments dans une boucle `for`, puis convertis en `f64` avec `as f64` pour calculer la moyenne.",
      "`nombres.len()` te donne le nombre d'éléments ; pense à le convertir aussi en `f64`.",
      "Utilise `assert!(!nombres.is_empty(), \"...\")` pour paniquer proprement sur une entrée vide.",
    ],
    starter:
      "/// Renvoie (min, max, moyenne) des éléments de `nombres`.\n/// Panique si `nombres` est vide.\nfn statistiques(nombres: &[i32]) -> (i32, i32, f64) {\n    todo!()\n}",
    solution:
      '/// Renvoie (min, max, moyenne) des éléments de `nombres`.\n/// Panique si `nombres` est vide.\nfn statistiques(nombres: &[i32]) -> (i32, i32, f64) {\n    assert!(!nombres.is_empty(), "statistiques: le tableau ne doit pas être vide");\n\n    let mut min = nombres[0];\n    let mut max = nombres[0];\n    let mut somme: i64 = 0;\n\n    for &n in nombres {\n        if n < min {\n            min = n;\n        }\n        if n > max {\n            max = n;\n        }\n        somme += n as i64;\n    }\n\n    let moyenne = somme as f64 / nombres.len() as f64;\n\n    (min, max, moyenne)\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn cas_general() {\n        let notes = [10, 20, 30, 40];\n        assert_eq!(statistiques(&notes), (10, 40, 25.0));\n    }\n\n    #[test]\n    fn un_seul_element() {\n        let valeurs = [42];\n        assert_eq!(statistiques(&valeurs), (42, 42, 42.0));\n    }\n\n    #[test]\n    fn valeurs_negatives() {\n        let temperatures = [-5, 0, 10, -12, 7];\n        let (min, max, moyenne) = statistiques(&temperatures);\n        assert_eq!(min, -12);\n        assert_eq!(max, 10);\n        assert!((moyenne - 0.0).abs() < 0.001);\n    }\n\n    #[test]\n    #[should_panic(expected = "vide")]\n    fn panique_sur_tableau_vide() {\n        let vide: [i32; 0] = [];\n        statistiques(&vide);\n    }\n}',
  },
  keyTakeaways: [
    "`let` est immuable par défaut ; `let mut` autorise la réassignation ; `const` est toujours immuable et typée explicitement.",
    "Le shadowing (`let` répété) crée une nouvelle variable, potentiellement d'un type différent, sans passer par `mut`.",
    "Les types scalaires (`i32`, `u32`, `f64`, `bool`, `char`) et composés (tuples, tableaux `[T; N]`) sont tous de taille fixe et vérifiés à la compilation.",
    "Une expression produit une valeur (pas de `;` final) ; une instruction agit sans renvoyer de valeur. La dernière expression d'une fonction est sa valeur de retour.",
    "`if`/`else` est une expression, `loop` peut renvoyer une valeur via `break`, et `for ... in` est le moyen le plus sûr d'itérer sur une collection ou un intervalle.",
  ],
};
