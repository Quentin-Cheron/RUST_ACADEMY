import type { Chapter } from "../types";

export const ch04: Chapter = {
  number: 4,
  slug: "ownership",
  title: "La propriété (ownership)",
  subtitle: "Le système qui permet à Rust de gérer la mémoire sans garbage collector.",
  description:
    "La propriété (ownership) est la fonctionnalité la plus singulière de Rust, et celle qui a des conséquences sur tout le reste du langage. Elle permet au compilateur de garantir la sécurité mémoire à la compilation, sans ramasse-miettes et sans allocation/libération manuelle façon C. Ce chapitre pose les règles de l'ownership, explique le move, les emprunts (`&` et `&mut`) et les slices — les fondations sur lesquelles repose absolument tout le reste du langage.",
  minutes: 55,
  rustBookRef: "Chapitre 4 — Understanding Ownership",
  objectives: [
    "Énoncer et appliquer les trois règles de l'ownership",
    "Distinguer la pile (stack) et le tas (heap) et savoir où vivent les données",
    "Comprendre le move et identifier les types `Copy`",
    "Différencier `String` (possédée) et `&str` (empruntée)",
    "Emprunter des valeurs avec `&` et `&mut` sans violer les règles du borrow checker",
    "Utiliser les slices pour référencer une partie d'une collection",
  ],
  sections: [
    {
      id: "regles-ownership",
      number: "4.1",
      title: "Les trois règles de l'ownership",
      blocks: [
        {
          type: "paragraph",
          text: "Dans la plupart des langages, la mémoire est gérée soit par un **ramasse-miettes** (Java, Python, Go) qui surveille en permanence les données inutilisées, soit **manuellement** par le programmeur (C, C++) via `malloc`/`free`. Les deux approches ont un coût : la première paie en performance et en imprévisibilité, la seconde en bugs (fuites, doubles libérations, pointeurs pendants). Rust choisit une troisième voie : la mémoire est gérée par un système de règles vérifiées **à la compilation**, l'ownership.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Chaque valeur en Rust a une variable qu'on appelle son **propriétaire** (*owner*).",
            "Il ne peut y avoir **qu'un seul propriétaire** à la fois.",
            "Quand le propriétaire sort de la portée (*scope*), la valeur est **libérée** automatiquement.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    {\n        let s = String::from("bonjour"); // s devient propriétaire de la chaîne\n        println!("{s}");\n    } // la portée de s se termine ici : Rust appelle `drop` et libère la mémoire\n\n    // println!("{s}"); // erreur : s n\'existe plus, sa portée est finie\n}',
        },
        {
          type: "callout",
          variant: "info",
          title: "drop, l'équivalent Rust du destructeur",
          text: "Quand une valeur sort de sa portée, Rust appelle automatiquement une fonction spéciale nommée `drop` qui libère la mémoire associée. C'est le mécanisme RAII (Resource Acquisition Is Initialization), bien connu en C++, mais ici imposé et vérifié par le compilateur : impossible d'oublier de libérer une ressource.",
        },
      ],
    },
    {
      id: "stack-heap",
      number: "4.1",
      title: "Pile (stack) et tas (heap)",
      blocks: [
        {
          type: "paragraph",
          text: "Pour comprendre l'ownership, il faut savoir où vivent les données en mémoire. La **pile** stocke des valeurs de taille connue à la compilation, dans l'ordre où elles arrivent (LIFO — dernier arrivé, premier sorti) : c'est très rapide. Le **tas** stocke des données de taille variable ou inconnue à l'avance ; on y réserve de l'espace à l'exécution et on obtient un pointeur vers cet espace, stocké lui sur la pile.",
        },
        {
          type: "list",
          items: [
            "Types comme `i32`, `f64`, `bool`, `char`, ou les tuples de types simples : taille fixe connue -> vivent sur la **pile**.",
            "`String`, `Vec<T>`, `Box<T>` : taille variable ou inconnue à la compilation -> les données vivent sur le **tas**, seul un pointeur (+ longueur + capacité) vit sur la pile.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let x = 5; // entier : stocké entièrement sur la pile\n\n    let s = String::from("hello"); // "hello" est sur le tas\n    // s (sur la pile) contient : un pointeur vers le tas, une longueur (5), une capacité (5)\n\n    println!("{x} {s}");\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "C'est précisément parce que le tas nécessite une allocation et une libération explicites que l'ownership existe : il faut un mécanisme fiable pour savoir *quand* libérer cette mémoire. Les types purement empilés n'ont pas ce problème.",
        },
      ],
    },
    {
      id: "move-copy",
      number: "4.1",
      title: "Move et types Copy",
      blocks: [
        {
          type: "paragraph",
          text: "Quand on assigne une `String` à une autre variable, Rust ne duplique pas les données du tas : il copie seulement le pointeur, la longueur et la capacité, puis **invalide** la variable d'origine. C'est ce qu'on appelle un **move** (déplacement).",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1; // s1 est déplacée dans s2\n\n    // println!("{s1}"); // erreur de compilation : value borrowed after move\n    println!("{s2}"); // OK, s2 est désormais l\'unique propriétaire\n}',
        },
        {
          type: "callout",
          variant: "danger",
          title: "Erreur classique : \"value borrowed after move\"",
          text: "`error[E0382]: borrow of moved value: s1`. Rust invalide volontairement `s1` après le move pour éviter un **double free** : si les deux variables pointaient vers la même zone du tas, Rust essaierait de la libérer deux fois à la fin de leurs portées respectives, ce qui est un bug mémoire classique en C. Le compilateur préfère refuser le programme plutôt que risquer un crash à l'exécution.",
        },
        {
          type: "paragraph",
          text: "Ce comportement ne s'applique pas aux types entièrement stockés sur la pile, comme `i32`. Ces types implémentent le trait `Copy` : l'assignation duplique la valeur au lieu de la déplacer, donc l'original reste utilisable.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let x = 5;\n    let y = x; // copie, pas de move : x reste valide\n\n    println!("x = {x}, y = {y}"); // fonctionne sans problème\n}',
        },
        {
          type: "list",
          items: [
            "Types `Copy` typiques : tous les entiers (`i32`, `u64`...), les flottants (`f64`), `bool`, `char`.",
            "Les tuples sont `Copy` uniquement si tous leurs éléments le sont, ex : `(i32, bool)`.",
            "Un type ne peut pas implémenter à la fois `Copy` et `Drop` : les deux traits sont mutuellement exclusifs, car `Copy` suppose une copie triviale sans logique de nettoyage particulière.",
          ],
        },
      ],
    },
    {
      id: "string-vs-str",
      number: "4.1",
      title: "String vs &str",
      blocks: [
        {
          type: "paragraph",
          text: "Rust a deux types principaux pour représenter du texte : `String`, une chaîne **possédée**, modifiable et allouée sur le tas, et `&str`, une **référence** vers une séquence de caractères UTF-8 (une \"vue\" en lecture, empruntée). Un littéral comme `\"bonjour\"` est de type `&'static str` : il est directement intégré au binaire compilé.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let litteral: &str = "je suis un littéral"; // vit dans le binaire\n    let possedee: String = String::from("je suis sur le tas");\n    let empruntee: &str = &possedee; // référence vers la String\n\n    println!("{litteral} / {possedee} / {empruntee}");\n}',
        },
        {
          type: "usecase",
          title: "Pourquoi préférer &str en paramètre de fonction",
          text: "Une fonction qui prend un `&str` en paramètre accepte **aussi bien** une `&str` littérale qu'une référence vers une `String` (grâce à la déréférenciation automatique, ou *deref coercion*). Une fonction qui exige une `String` obligerait l'appelant à posséder ou cloner une chaîne, même s'il veut juste la lire. Règle générale : accepte le type le plus générique possible (`&str`), et ne renvoie une valeur possédée (`String`) que si la fonction crée réellement de nouvelles données.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn longueur(texte: &str) -> usize {\n    texte.chars().count()\n}\n\nfn main() {\n    let nom = String::from("Grace Hopper");\n    println!("{}", longueur(&nom));       // fonctionne avec une String empruntée\n    println!("{}", longueur("Ada"));      // fonctionne aussi avec un littéral\n}',
        },
      ],
    },
    {
      id: "fonctions-ownership",
      number: "4.1",
      title: "Fonctions et transfert de propriété",
      blocks: [
        {
          type: "paragraph",
          text: "Passer une valeur non-`Copy` à une fonction la **déplace** dans cette fonction, exactement comme une assignation. Une fois passée, la variable appelante n'est plus utilisable — sauf si la fonction rend la propriété en la renvoyant.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn prend_possession(texte: String) {\n    println!("j\'ai maintenant : {texte}");\n} // texte sort de la portée ici, drop est appelé\n\nfn main() {\n    let s = String::from("cadeau");\n    prend_possession(s);\n    // println!("{s}"); // erreur : s a été déplacée dans la fonction\n}',
        },
        {
          type: "paragraph",
          text: "Redonner la propriété à chaque appel via la valeur de retour fonctionne, mais devient vite lourd dès qu'on veut juste *lire* une donnée sans la consommer :",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn calcule_longueur(texte: String) -> (String, usize) {\n    let taille = texte.len();\n    (texte, taille) // on doit renvoyer texte pour que l\'appelant la récupère\n}\n\nfn main() {\n    let s1 = String::from("bonjour");\n    let (s1, taille) = calcule_longueur(s1);\n    println!("\'{s1}\' fait {taille} octets");\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "Ce style avec tuple fonctionne, mais c'est exactement le problème que les références (section suivante) résolvent élégamment : pourquoi rendre la propriété alors qu'on voulait juste emprunter la valeur le temps d'un calcul ?",
        },
      ],
    },
    {
      id: "references-emprunts",
      number: "4.2",
      title: "Références et emprunt (borrowing)",
      blocks: [
        {
          type: "paragraph",
          text: "Une **référence** (`&T`) permet d'accéder à une valeur sans en prendre la propriété : on dit qu'on **emprunte** la valeur. La fonction ne possède jamais la donnée, donc elle ne la libère pas à la fin de son exécution — la propriété reste chez l'appelant.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn calcule_longueur(texte: &String) -> usize {\n    texte.len()\n} // texte sort de la portée, mais comme il ne possède pas la donnée, rien n\'est libéré\n\nfn main() {\n    let s1 = String::from("bonjour");\n    let taille = calcule_longueur(&s1); // on passe une référence avec &\n    println!("\'{s1}\' fait {taille} octets"); // s1 reste utilisable !\n}',
        },
        {
          type: "paragraph",
          text: "Par défaut, une référence est **immuable** : on ne peut pas modifier la valeur empruntée à travers elle. Pour modifier une valeur empruntée, il faut une référence mutable, avec `&mut`, et la variable d'origine doit elle-même être déclarée `mut`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn ajoute_mot(texte: &mut String) {\n    texte.push_str(", monde");\n}\n\nfn main() {\n    let mut s = String::from("bonjour");\n    ajoute_mot(&mut s);\n    println!("{s}"); // "bonjour, monde"\n}',
        },
        {
          type: "heading",
          level: 3,
          text: "La règle d'or du borrow checker",
        },
        {
          type: "paragraph",
          text: "Le **borrow checker** est la partie du compilateur qui vérifie les emprunts. Sa règle centrale, pour une portée donnée : on peut avoir **soit** un nombre illimité de références immuables, **soit** une seule référence mutable — jamais les deux en même temps.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let mut s = String::from("valeur");\n\n    let r1 = &s; // OK : emprunt immuable\n    let r2 = &s; // OK : un deuxième emprunt immuable est autorisé\n    println!("{r1} et {r2}");\n    // r1 et r2 ne sont plus utilisés après cette ligne : leur portée se termine ici\n\n    let r3 = &mut s; // OK maintenant : plus aucun emprunt immuable actif\n    r3.push_str(" modifiée");\n    println!("{r3}");\n}',
        },
        {
          type: "callout",
          variant: "danger",
          title: "Erreur classique : emprunt mutable + immuable simultanés",
          text: "```\nerror[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable\n```\nCe genre d'erreur apparaît dès qu'une référence `&mut` coexiste avec une référence `&` encore utilisée plus loin dans le code. Cette règle empêche les **data races** à la compilation : impossible qu'un lecteur observe une donnée pendant qu'un autre la modifie, un bug redoutable dans le code concurrent en C/C++.",
        },
        {
          type: "code",
          language: "rust",
          code: '// Ne compile pas :\nfn main() {\n    let mut s = String::from("valeur");\n    let r1 = &s;\n    let r2 = &mut s; // erreur : r1 est encore utilisé après cette ligne\n    println!("{r1} {r2}");\n}',
        },
        {
          type: "callout",
          variant: "danger",
          title: "Erreur classique : référence pendante (dangling reference)",
          text: "Rust interdit aussi de renvoyer une référence vers une donnée locale qui va être détruite : ```error[E0106]: missing lifetime specifier``` ou ```cannot return reference to local variable```. Une fonction qui renvoie `&String` créée à l'intérieur d'elle-même pointerait vers de la mémoire déjà libérée. La solution est de renvoyer la valeur possédée (`String`) directement plutôt qu'une référence dessus.",
        },
        {
          type: "code",
          language: "rust",
          code: '// Ne compile pas :\nfn creer_pendante() -> &String {\n    let s = String::from("oups");\n    &s\n} // s est libérée ici, la référence pointerait dans le vide\n\n// La correction : renvoyer la valeur, pas une référence vers elle\nfn creer_ok() -> String {\n    String::from("ça marche")\n}',
        },
        {
          type: "usecase",
          title: "Quand emprunter plutôt que déplacer",
          text: "Emprunte (`&` ou `&mut`) dès que la fonction n'a besoin de lire ou modifier une valeur que le temps de son exécution, sans en devenir propriétaire — c'est le cas le plus fréquent (calculer une longueur, chercher un élément, modifier un `Vec` en place). Ne déplace (prends la valeur par valeur) que lorsque la fonction doit réellement **conserver** ou **consommer** la donnée, par exemple en la stockant dans une structure qui vivra après l'appel.",
        },
      ],
    },
    {
      id: "slices",
      number: "4.3",
      title: "Les slices",
      blocks: [
        {
          type: "paragraph",
          text: "Une **slice** est une référence vers une **portion contiguë** d'une collection, sans en prendre la propriété. Les deux formes les plus courantes sont `&str` (une slice de chaîne) et `&[T]` (une slice de tableau ou de `Vec<T>`).",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let phrase = String::from("le chat dort");\n\n    let mot1: &str = &phrase[0..2];    // "le"\n    let mot2: &str = &phrase[3..7];    // "chat"\n    let tout: &str = &phrase[..];      // toute la chaîne\n\n    println!("{mot1} / {mot2} / {tout}");\n\n    let nombres = vec![10, 20, 30, 40, 50];\n    let extrait: &[i32] = &nombres[1..3]; // [20, 30]\n    println!("{extrait:?}");\n}',
        },
        {
          type: "paragraph",
          text: "L'intérêt principal d'une fonction qui prend une slice en argument (`fn premier_mot(s: &str) -> &str`) est qu'elle fonctionne aussi bien avec une `String` complète qu'avec un `&str` littéral ou une sous-partie d'une chaîne, sans jamais copier les données.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn premier_mot(s: &str) -> &str {\n    match s.find(\' \') {\n        Some(index) => &s[..index],\n        None => s,\n    }\n}\n\nfn main() {\n    let phrase = String::from("bonjour tout le monde");\n    let mot = premier_mot(&phrase);\n    println!("{mot}"); // "bonjour"\n\n    println!("{}", premier_mot("juste un mot")); // fonctionne aussi sur un littéral\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Comme les indices d'une slice de `&str` se comptent en **octets**, tranche toujours sur des frontières de caractères valides en UTF-8 ; sinon le programme panique à l'exécution. Pour du texte non-ASCII, préfère des méthodes comme `.chars()`, `.find()` ou les itérateurs plutôt que des indices manuels.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch4-ex1",
      title: "Calculer une longueur sans prendre la propriété",
      difficulty: "facile",
      prompt:
        "Écris une fonction `longueur_mot` qui reçoit une **référence** vers une `String` (`&String`) et renvoie le nombre de caractères qu'elle contient (`usize`), sans jamais en devenir propriétaire. Vérifie que la variable d'origine reste utilisable après l'appel.",
      hints: [
        "Le paramètre doit être de type `&String` (ou plus idiomatique : `&str`).",
        "`.chars().count()` compte les caractères Unicode, `.len()` compte les octets.",
      ],
      starter: "fn longueur_mot(mot: &String) -> usize {\n    todo!()\n}",
      solution: "fn longueur_mot(mot: &String) -> usize {\n    // On ne fait qu'emprunter `mot` : aucune propriété n'est prise.\n    mot.chars().count()\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn compte_les_caracteres() {\n        let s = String::from("bonjour");\n        assert_eq!(longueur_mot(&s), 7);\n        // s doit toujours être utilisable ici, car la fonction n\'a fait qu\'emprunter\n        println!("{s}");\n    }\n\n    #[test]\n    fn chaine_vide() {\n        let s = String::from("");\n        assert_eq!(longueur_mot(&s), 0);\n    }\n\n    #[test]\n    fn caracteres_accentues() {\n        let s = String::from("café");\n        assert_eq!(longueur_mot(&s), 4);\n    }\n}',
    },
    {
      id: "ch4-ex2",
      title: "Le premier mot d'une phrase",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `premier_mot` qui reçoit une `&str` et renvoie une slice (`&str`) contenant uniquement le premier mot, sans espace. S'il n'y a pas d'espace dans la phrase, renvoie la phrase entière. Aucune allocation ne doit être faite : le résultat doit être une slice de l'entrée.",
      hints: [
        "`s.find(' ')` renvoie `Option<usize>` : l'index du premier espace.",
        "Utilise le slicing `&s[..index]` pour extraire une sous-chaîne sans copier.",
      ],
      starter: "fn premier_mot(s: &str) -> &str {\n    todo!()\n}",
      solution:
        "fn premier_mot(s: &str) -> &str {\n    match s.find(' ') {\n        Some(index) => &s[..index],\n        None => s,\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn extrait_le_premier_mot() {\n        assert_eq!(premier_mot("bonjour tout le monde"), "bonjour");\n    }\n\n    #[test]\n    fn phrase_sans_espace() {\n        assert_eq!(premier_mot("rustacean"), "rustacean");\n    }\n\n    #[test]\n    fn fonctionne_avec_une_string() {\n        let s = String::from("un seul mot ici");\n        assert_eq!(premier_mot(&s), "un");\n    }\n\n    #[test]\n    fn chaine_vide() {\n        assert_eq!(premier_mot(""), "");\n    }\n}',
    },
    {
      id: "ch4-ex3",
      title: "Échanger deux valeurs par référence mutable",
      difficulty: "moyen",
      prompt:
        "Écris une fonction générique `echanger` qui reçoit deux références mutables `&mut i32` et échange leurs valeurs, sans utiliser de variable de retour (donc sans passer les entiers par valeur). But : manipuler `&mut` sur des types simples et comprendre que les références mutables permettent de modifier l'appelant sans transférer la propriété.",
      hints: [
        "Utilise `std::mem::swap`, ou fais l'échange manuellement avec une variable temporaire.",
        "La fonction ne renvoie rien (`()`) : elle modifie directement ses arguments via les références.",
      ],
      starter: "fn echanger(a: &mut i32, b: &mut i32) {\n    todo!()\n}",
      solution:
        "fn echanger(a: &mut i32, b: &mut i32) {\n    // On passe par une variable temporaire pour ne perdre aucune valeur.\n    let temp = *a;\n    *a = *b;\n    *b = temp;\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn echange_deux_valeurs() {\n        let mut x = 1;\n        let mut y = 2;\n        echanger(&mut x, &mut y);\n        assert_eq!(x, 2);\n        assert_eq!(y, 1);\n    }\n\n    #[test]\n    fn echange_avec_valeurs_egales() {\n        let mut x = 5;\n        let mut y = 5;\n        echanger(&mut x, &mut y);\n        assert_eq!(x, 5);\n        assert_eq!(y, 5);\n    }\n\n    #[test]\n    fn echange_avec_negatifs() {\n        let mut x = -3;\n        let mut y = 7;\n        echanger(&mut x, &mut y);\n        assert_eq!(x, 7);\n        assert_eq!(y, -3);\n    }\n}',
    },
  ],
  project: {
    id: "ch4-projet",
    title: "Filtrer et modifier des nombres sans copier inutilement",
    difficulty: "difficile",
    prompt:
      "Ce projet combine emprunt immuable et emprunt mutable pour manipuler des `Vec<i32>` efficacement, sans jamais copier la collection entière inutilement.\n\n1. Écris une fonction `extraire_pairs` qui reçoit une **slice** `&[i32]` (donc sans prendre la propriété) et renvoie une **nouvelle** `Vec<i32>` contenant uniquement les nombres pairs, dans leur ordre d'origine.\n2. Écris une fonction `doubler_en_place` qui reçoit une référence mutable `&mut Vec<i32>` et **double chaque élément directement dans le vecteur**, sans en créer un nouveau ni le renvoyer.\n\nCe couple illustre les deux grands cas d'usage des emprunts : lire sans copier (`&[i32]` -> nouvelle `Vec`), et modifier en place sans transférer la propriété (`&mut Vec<i32>`).",
    hints: [
      "`extraire_pairs` prend `&[i32]` : cela accepte aussi bien un `&Vec<i32>` (grâce à la deref coercion) qu'un tableau ou une sous-slice.",
      "`nombre % 2 == 0` teste la parité.",
      "Pour modifier en place, itère avec `for n in vecteur.iter_mut() { ... }` et déréférence avec `*n`.",
      "`doubler_en_place` ne doit rien renvoyer (`()`) : l'effet se voit sur le vecteur passé en argument.",
    ],
    starter:
      "/// Renvoie une nouvelle Vec contenant uniquement les nombres pairs de `nombres`.\nfn extraire_pairs(nombres: &[i32]) -> Vec<i32> {\n    todo!()\n}\n\n/// Double chaque élément de `nombres`, directement dans le vecteur (aucune allocation nouvelle).\nfn doubler_en_place(nombres: &mut Vec<i32>) {\n    todo!()\n}\n\nfn main() {\n    let valeurs = vec![1, 2, 3, 4, 5, 6];\n    let pairs = extraire_pairs(&valeurs);\n    println!(\"pairs : {pairs:?}\");\n\n    let mut valeurs_mut = vec![1, 2, 3];\n    doubler_en_place(&mut valeurs_mut);\n    println!(\"doublées : {valeurs_mut:?}\");\n}",
    solution:
      "/// Renvoie une nouvelle Vec contenant uniquement les nombres pairs de `nombres`.\n/// `nombres` n'est qu'emprunté : l'appelant reste propriétaire de sa collection.\nfn extraire_pairs(nombres: &[i32]) -> Vec<i32> {\n    nombres.iter().filter(|&&n| n % 2 == 0).copied().collect()\n}\n\n/// Double chaque élément de `nombres`, directement dans le vecteur.\n/// La référence mutable permet de modifier l'appelant sans transférer la propriété\n/// et sans allouer un second vecteur.\nfn doubler_en_place(nombres: &mut Vec<i32>) {\n    for n in nombres.iter_mut() {\n        *n *= 2;\n    }\n}\n\nfn main() {\n    let valeurs = vec![1, 2, 3, 4, 5, 6];\n    let pairs = extraire_pairs(&valeurs);\n    println!(\"pairs : {pairs:?}\");\n    // `valeurs` reste utilisable : extraire_pairs n'a fait qu'emprunter\n    println!(\"originale intacte : {valeurs:?}\");\n\n    let mut valeurs_mut = vec![1, 2, 3];\n    doubler_en_place(&mut valeurs_mut);\n    println!(\"doublées : {valeurs_mut:?}\");\n}",
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn extrait_uniquement_les_pairs() {\n        let valeurs = vec![1, 2, 3, 4, 5, 6];\n        assert_eq!(extraire_pairs(&valeurs), vec![2, 4, 6]);\n    }\n\n    #[test]\n    fn extraire_pairs_ne_consomme_pas_la_collection() {\n        let valeurs = vec![10, 15, 20];\n        let pairs = extraire_pairs(&valeurs);\n        assert_eq!(pairs, vec![10, 20]);\n        // `valeurs` doit rester utilisable après l\'appel\n        assert_eq!(valeurs, vec![10, 15, 20]);\n    }\n\n    #[test]\n    fn extraire_pairs_sur_slice_vide() {\n        let valeurs: Vec<i32> = vec![];\n        assert_eq!(extraire_pairs(&valeurs), Vec::<i32>::new());\n    }\n\n    #[test]\n    fn extraire_pairs_sans_aucun_pair() {\n        let valeurs = vec![1, 3, 5, 7];\n        assert_eq!(extraire_pairs(&valeurs), Vec::<i32>::new());\n    }\n\n    #[test]\n    fn double_chaque_element_en_place() {\n        let mut valeurs = vec![1, 2, 3];\n        doubler_en_place(&mut valeurs);\n        assert_eq!(valeurs, vec![2, 4, 6]);\n    }\n\n    #[test]\n    fn doubler_en_place_sur_vecteur_vide() {\n        let mut valeurs: Vec<i32> = vec![];\n        doubler_en_place(&mut valeurs);\n        assert_eq!(valeurs, Vec::<i32>::new());\n    }\n\n    #[test]\n    fn doubler_en_place_avec_negatifs() {\n        let mut valeurs = vec![-2, 0, 3];\n        doubler_en_place(&mut valeurs);\n        assert_eq!(valeurs, vec![-4, 0, 6]);\n    }\n}',
  },
  keyTakeaways: [
    "Trois règles : chaque valeur a un propriétaire unique, un seul à la fois, et elle est libérée quand il sort de la portée.",
    "Les types simples (entiers, bool, char...) implémentent `Copy` et sont dupliqués ; les autres (`String`, `Vec`...) sont déplacés (move) à l'assignation ou au passage en paramètre.",
    "`&str` est une vue empruntée sur du texte, `String` en est la version possédée et modifiable — préfère `&str` en paramètre de fonction.",
    "Emprunter (`&`, `&mut`) évite de transférer la propriété juste pour lire ou modifier une valeur.",
    "Règle d'or du borrow checker : plusieurs références immuables OU une seule référence mutable, jamais les deux en même temps.",
    "Une slice (`&str`, `&[T]`) référence une portion d'une collection sans la copier ni en prendre la propriété.",
  ],
};
