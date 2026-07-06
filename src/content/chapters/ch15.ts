import type { Chapter } from "../types";

export const ch15: Chapter = {
  number: 15,
  slug: "smart-pointers",
  title: "Les pointeurs intelligents",
  subtitle: "Box, Deref, Drop, Rc et RefCell : sortir du modèle simple de propriété unique.",
  description:
    "Le système de propriété que tu maîtrises depuis les premiers chapitres impose un propriétaire unique et des emprunts vérifiés à la compilation — un modèle strict, mais parfois trop strict. Ce chapitre explore les **pointeurs intelligents** de la bibliothèque standard, qui assouplissent ces règles sans jamais sacrifier la sécurité mémoire : `Box<T>` pour allouer sur le tas et écrire des types récursifs, `Deref` et `Drop` pour personnaliser le comportement d'un pointeur, `Rc<T>` pour la propriété partagée, et `RefCell<T>` pour la mutabilité intérieure vérifiée à l'exécution. Tu termineras en construisant un arbre binaire, puis tu comprendras pourquoi les cycles de références existent — et comment `Weak<T>` les évite.",
  minutes: 55,
  rustBookRef: "Chapitre 15 — Smart Pointers",
  objectives: [
    "Allouer une valeur sur le tas avec Box<T> et définir des types récursifs",
    "Comprendre le trait Deref et la déréférence / coercition automatique",
    "Utiliser Drop pour du nettoyage automatique, dans l'ordre inverse de création",
    "Partager la propriété d'une donnée en mono-thread avec Rc<T> et Rc::strong_count",
    "Appliquer la mutabilité intérieure avec RefCell<T>, seule ou combinée à Rc<T>",
    "Repérer les cycles de références et les éviter avec Weak<T>",
  ],
  sections: [
    {
      id: "box",
      number: "15.1",
      title: "Box<T> : allouer sur le tas",
      blocks: [
        {
          type: "paragraph",
          text: "Toutes les valeurs Rust que tu as manipulées jusqu'ici vivent sur la **pile** (stack) ou sont empruntées depuis une autre valeur. `Box<T>` est le plus simple des pointeurs intelligents : il alloue une valeur sur le **tas** (heap) et te donne un pointeur vers elle. Le `Box<T>` lui-même — un pointeur de taille fixe — reste sur la pile.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let b = Box::new(5);\n    println!("b = {}", b);\n}\n',
          caption: "`b` est un pointeur vers un `5` stocké sur le tas.",
        },
        {
          type: "paragraph",
          text: "Trois cas typiques justifient `Box<T>` : une valeur dont la taille n'est connue qu'à l'exécution, un transfert de propriété d'une grosse donnée sans la copier, ou un **type récursif** dont la taille serait sinon infinie.",
        },
        {
          type: "paragraph",
          text: "Un type récursif est un type qui se contient lui-même, comme une liste chaînée (« cons list », popularisée par Lisp) : chaque maillon contient soit une valeur suivie du reste de la liste, soit la fin.",
        },
        {
          type: "code",
          language: "rust",
          code: "// Ceci ne compile pas : la taille de `Liste` serait infinie.\nenum Liste {\n    Cons(i32, Liste),\n    Nil,\n}",
          caption: "error[E0072]: recursive type `Liste` has infinite size",
        },
        {
          type: "paragraph",
          text: "Le compilateur ne peut pas calculer la taille de `Liste` : chaque `Cons` contiendrait un `Liste` complet, qui contient un `Liste`, à l'infini. La solution : une indirection via `Box<T>`, un pointeur de taille fixe (un `usize`), quelle que soit la taille de ce qu'il pointe.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Liste {\n    Cons(i32, Box<Liste>),\n    Nil,\n}\n\nuse Liste::{Cons, Nil};\n\nfn main() {\n    let liste = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));\n}\n",
          caption: "Chaque Cons possède maintenant un pointeur de taille connue vers le reste de la liste.",
        },
        {
          type: "list",
          items: [
            "Type dont la taille exacte n'est connue qu'à l'exécution (types récursifs, trait objects `dyn Trait`)",
            "Transférer la propriété d'une grosse donnée sans la copier intégralement",
            "Posséder une valeur en ne se souciant que de son type, pas de sa taille (ex. `Box<dyn Error>`)",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Box<T> n'a (presque) aucun coût",
          text: "En dehors de l'allocation sur le tas elle-même, `Box<T>` n'ajoute aucune surcharge de performance : pas de comptage de référence, pas de vérification à l'exécution. C'est le pointeur intelligent le plus « fin » de la bibliothèque standard.",
        },
      ],
    },
    {
      id: "deref",
      number: "15.2",
      title: "Le trait Deref",
      blocks: [
        {
          type: "paragraph",
          text: "`Box<T>` se comporte comme une référence : on peut le déréférencer avec `*`. Ce comportement n'est pas magique, il vient de l'implémentation du trait `Deref` de la bibliothèque standard.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn main() {\n    let x = 5;\n    let y = Box::new(x);\n\n    assert_eq!(5, x);\n    assert_eq!(5, *y);\n}\n",
        },
        { type: "heading", level: 3, text: "Implémenter son propre pointeur intelligent" },
        {
          type: "paragraph",
          text: "Pour comprendre `Deref`, écrivons `MonBox<T>`, une version simplifiée (et sans allocation sur le tas) de `Box<T>` : un simple tuple struct qui enveloppe une valeur.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::ops::Deref;\n\nstruct MonBox<T>(T);\n\nimpl<T> MonBox<T> {\n    fn new(x: T) -> MonBox<T> {\n        MonBox(x)\n    }\n}\n\nimpl<T> Deref for MonBox<T> {\n    type Target = T;\n\n    fn deref(&self) -> &T {\n        &self.0\n    }\n}\n\nfn main() {\n    let x = 5;\n    let y = MonBox::new(x);\n\n    assert_eq!(5, x);\n    assert_eq!(5, *y);\n}\n",
        },
        {
          type: "paragraph",
          text: "`deref` renvoie une référence vers la valeur enveloppée. Quand tu écris `*y`, Rust traduit en coulisses l'expression en `*(y.deref())` — sans `Deref`, l'opérateur `*` ne compilerait pas sur `MonBox<T>`.",
        },
        {
          type: "paragraph",
          text: "Rust applique aussi la **coercition de déréférence** (*deref coercion*) : une `&MonBox<String>` est automatiquement convertie en `&String` puis en `&str` si une fonction attend un `&str`, sans le moindre appel explicite.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn saluer(nom: &str) {\n    println!("Bonjour, {nom} !");\n}\n\nfn main() {\n    let m = MonBox::new(String::from("Rust"));\n    saluer(&m); // &MonBox<String> -> &String -> &str, automatique\n}\n',
        },
        {
          type: "callout",
          variant: "tip",
          text: "La coercition de déréférence évite d'écrire `&(*m)[..]` à la main. Elle fonctionne en chaîne, sur autant de niveaux de `Deref` que nécessaire, et existe aussi en version mutable via `DerefMut`.",
        },
      ],
    },
    {
      id: "drop",
      number: "15.3",
      title: "Le trait Drop",
      blocks: [
        {
          type: "paragraph",
          text: "`Drop` permet de personnaliser ce qu'il se passe quand une valeur sort de portée : fermer un fichier, libérer une ressource, journaliser... C'est l'équivalent Rust d'un destructeur, appelé automatiquement, sans `free` ni ramasse-miettes.",
        },
        {
          type: "code",
          language: "rust",
          code: 'struct Ressource {\n    nom: String,\n}\n\nimpl Drop for Ressource {\n    fn drop(&mut self) {\n        println!("Libération de {}", self.nom);\n    }\n}\n\nfn main() {\n    let _a = Ressource { nom: String::from("a") };\n    let _b = Ressource { nom: String::from("b") };\n    println!("a et b sont créées");\n}\n// affiche :\n// a et b sont créées\n// Libération de b\n// Libération de a\n',
          caption: "Les valeurs sont libérées dans l'ordre inverse de leur création.",
        },
        {
          type: "paragraph",
          text: "Rust appelle `drop` automatiquement à la fin de la portée, dans l'ordre **inverse** de la déclaration — comme une pile qu'on dépile.",
        },
        {
          type: "paragraph",
          text: "Impossible d'appeler `ressource.drop()` directement : ce serait un « double drop » à la fin de la portée. Pour forcer un nettoyage anticipé, on utilise la fonction libre `std::mem::drop`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let c = Ressource { nom: String::from("c") };\n    println!("c créée");\n    drop(c); // libération forcée ici\n    println!("c a déjà été libérée");\n}\n',
        },
        {
          type: "callout",
          variant: "warning",
          title: "Pas de .drop() manuel",
          text: "`ressource.drop()` ne compile pas (`error[E0040]`) : Rust interdit d'appeler `Drop::drop` toi-même, pour empêcher un double nettoyage. Passe par `std::mem::drop(valeur)`, qui prend possession de la valeur et la laisse sortir de portée immédiatement.",
        },
      ],
    },
    {
      id: "rc",
      number: "15.4",
      title: "Rc<T> : propriété partagée",
      blocks: [
        {
          type: "paragraph",
          text: "Le système d'emprunt impose un seul propriétaire par valeur. Mais certaines structures — un graphe où plusieurs nœuds pointent vers un même nœud, plusieurs parties d'un programme qui doivent lire la même donnée — ont besoin de **plusieurs propriétaires**. `Rc<T>` (*Reference Counted*) résout ce problème en environnement mono-thread.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::rc::Rc;\n\nenum Liste {\n    Cons(i32, Rc<Liste>),\n    Nil,\n}\n\nuse Liste::{Cons, Nil};\n\nfn main() {\n    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));\n    println!("count après a = {}", Rc::strong_count(&a));\n\n    let _b = Cons(3, Rc::clone(&a));\n    println!("count après b = {}", Rc::strong_count(&a));\n\n    {\n        let _c = Cons(4, Rc::clone(&a));\n        println!("count après c = {}", Rc::strong_count(&a));\n    }\n\n    println!("count après la portée de c = {}", Rc::strong_count(&a));\n}\n',
          caption: "count après a = 1, après b = 2, après c = 3, puis retombe à 2 quand c sort de portée.",
        },
        { type: "heading", level: 3, text: "Rc::clone plutôt que .clone()" },
        {
          type: "paragraph",
          text: "`Rc::clone(&a)` n'effectue pas de copie profonde : il incrémente simplement le compteur de références et renvoie un nouveau pointeur vers la même donnée. On écrit volontairement `Rc::clone(&a)` plutôt que `a.clone()`, pour signaler visuellement « ceci est bon marché », contrairement au `.clone()` d'un type qui copierait vraiment ses données.",
        },
        {
          type: "list",
          items: [
            "`Rc::strong_count(&valeur)` renvoie le nombre de propriétaires actifs",
            "Le compteur est décrémenté automatiquement quand un `Rc<T>` sort de portée (via `Drop`)",
            "La donnée est libérée quand le compteur atteint zéro",
            "`Rc<T>` ne permet que des références immuables : pour muter, il faut le combiner à `RefCell<T>`",
          ],
        },
        {
          type: "callout",
          variant: "info",
          text: "Rc<T> ne fonctionne qu'en mono-thread : le compteur n'est pas mis à jour de façon atomique. Pour partager une valeur entre threads, le chapitre sur la concurrence introduira `Arc<T>` (Atomic Rc), à l'API identique mais thread-safe.",
        },
      ],
    },
    {
      id: "refcell",
      number: "15.5",
      title: "RefCell<T> et la mutabilité intérieure",
      blocks: [
        {
          type: "paragraph",
          text: "La mutabilité intérieure est un design pattern qui permet de muter une donnée même à travers une référence immuable, en déplaçant la vérification des règles d'emprunt de la **compilation** vers l'**exécution**. `RefCell<T>` en est la version mono-thread la plus simple.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::cell::RefCell;\n\nfn main() {\n    let valeur = RefCell::new(5);\n\n    *valeur.borrow_mut() += 10;\n\n    println!("valeur = {}", valeur.borrow());\n}\n',
        },
        {
          type: "paragraph",
          text: "`borrow()` renvoie un `Ref<T>` (comme un `&T`), `borrow_mut()` un `RefMut<T>` (comme un `&mut T`). Rust vérifie **à l'exécution** qu'il n'existe jamais plusieurs emprunts mutables, ou un emprunt mutable en même temps qu'un emprunt immuable : une violation ne bloque pas la compilation, elle fait **paniquer** le programme.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::cell::RefCell;\n\nfn main() {\n    let valeur = RefCell::new(5);\n\n    let _r1 = valeur.borrow_mut();\n    let _r2 = valeur.borrow_mut(); // panique à l'exécution : déjà emprunté\n}\n",
          caption: "thread 'main' panicked at 'already borrowed: BorrowMutError'",
        },
        {
          type: "paragraph",
          text: "Combiné à `Rc<T>`, `RefCell<T>` permet d'avoir **plusieurs propriétaires d'une donnée mutable** — l'assemblage `Rc<RefCell<T>>` est l'un des motifs les plus utilisés en Rust idiomatique.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::cell::RefCell;\nuse std::rc::Rc;\n\nfn main() {\n    let compteur = Rc::new(RefCell::new(0));\n\n    let c1 = Rc::clone(&compteur);\n    let c2 = Rc::clone(&compteur);\n\n    *c1.borrow_mut() += 1;\n    *c2.borrow_mut() += 10;\n\n    println!("compteur = {}", compteur.borrow());\n    println!("propriétaires = {}", Rc::strong_count(&compteur));\n}\n',
          caption: "compteur = 11, propriétaires = 3",
        },
        {
          type: "usecase",
          title: "Graphes, arbres et état partagé mutable",
          text: "Dès qu'une structure de données a besoin de plusieurs propriétaires **et** de mutabilité — un graphe où un nœud peut être modifié depuis plusieurs chemins, un arbre où un enfant doit remonter vers son parent, un état d'interface partagé entre plusieurs composants — `Rc<RefCell<T>>` est le motif standard en Rust mono-thread. Chaque composant détient un `Rc` vers l'état partagé, et le mute via `borrow_mut()` sans jamais en posséder l'exclusivité.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "RefCell n'est pas gratuit",
          text: "`RefCell<T>` ajoute un compteur d'emprunts vérifié à chaque `borrow()` / `borrow_mut()` : un (petit) coût à l'exécution, absent des références classiques `&`/`&mut`. Pire, une erreur qui aurait été détectée à la compilation devient un `panic!` à l'exécution, potentiellement seulement en production. N'utilise `RefCell<T>` que quand le compilateur est réellement trop conservateur pour ton besoin (ex. propriété partagée), pas par facilité.",
        },
      ],
    },
    {
      id: "cycles",
      number: "15.6",
      title: "Cycles de références et Weak<T>",
      blocks: [
        {
          type: "paragraph",
          text: "`Rc<T>` garantit qu'une donnée est libérée quand plus personne ne la possède — sauf si deux `Rc` se pointent mutuellement. Le compteur de chacun ne retombe alors jamais à zéro : c'est une **fuite mémoire**, le seul type de bug de mémoire que le compilateur ne peut pas empêcher.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::cell::RefCell;\nuse std::rc::Rc;\n\nstruct Noeud {\n    valeur: i32,\n    voisin: RefCell<Option<Rc<Noeud>>>,\n}\n\nfn main() {\n    let a = Rc::new(Noeud { valeur: 1, voisin: RefCell::new(None) });\n    let b = Rc::new(Noeud { valeur: 2, voisin: RefCell::new(Some(Rc::clone(&a))) });\n\n    *a.voisin.borrow_mut() = Some(Rc::clone(&b));\n\n    // À partir d'ici, a et b se référencent mutuellement.\n    // Leurs compteurs (2 chacun) ne retomberont jamais à 0 :\n    // la mémoire qu'ils occupent ne sera jamais libérée.\n}\n",
        },
        { type: "heading", level: 3, text: "Weak<T> : le pointeur qui ne compte pas" },
        {
          type: "paragraph",
          text: "`Weak<T>`, obtenu via `Rc::downgrade(&valeur)`, pointe vers une donnée sans en revendiquer la propriété : il incrémente un compteur *faible* séparé (`weak_count`) qui n'empêche jamais la libération de la donnée. Pour l'utiliser, il faut appeler `.upgrade()`, qui renvoie `Option<Rc<T>>` — `None` si la donnée a déjà été libérée.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::cell::RefCell;\nuse std::rc::{Rc, Weak};\n\nstruct Noeud {\n    valeur: i32,\n    parent: RefCell<Weak<Noeud>>,\n    enfants: RefCell<Vec<Rc<Noeud>>>,\n}\n\nfn main() {\n    let feuille = Rc::new(Noeud {\n        valeur: 3,\n        parent: RefCell::new(Weak::new()),\n        enfants: RefCell::new(vec![]),\n    });\n\n    let branche = Rc::new(Noeud {\n        valeur: 5,\n        parent: RefCell::new(Weak::new()),\n        enfants: RefCell::new(vec![Rc::clone(&feuille)]),\n    });\n\n    *feuille.parent.borrow_mut() = Rc::downgrade(&branche);\n\n    match feuille.parent.borrow().upgrade() {\n        Some(p) => println!("parent de la feuille = {}", p.valeur),\n        None => println!("pas de parent"),\n    }\n}\n',
        },
        {
          type: "list",
          items: [
            "Un enfant possède fortement son parent ? -> risque de cycle : préfère un `Weak<T>` pour la relation « remontante »",
            "Un parent possède fortement ses enfants via `Rc<T>` (ou `Box<T>` si un seul propriétaire suffit)",
            "`Rc::strong_count` doit revenir à 0 pour libérer la donnée ; `Weak` n'y contribue jamais",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          title: "Le compilateur ne détecte pas les cycles",
          text: "Contrairement aux erreurs d'emprunt, un cycle de `Rc<RefCell<T>>` compile et s'exécute sans avertissement — c'est une fuite mémoire logique, à repérer par la conception (utiliser `Weak` pour les liens ascendants) ou des outils externes, pas par le compilateur.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch15-ex1",
      title: "Liste chaînée récursive avec Box",
      difficulty: "facile",
      prompt:
        "Définis un enum récursif `Liste` à deux variantes : `Cons(i32, Box<Liste>)` et `Nil`. Écris ensuite une fonction `longueur(liste: &Liste) -> usize` qui compte le nombre d'éléments de la liste, récursivement.",
      hints: [
        "Une `Liste` a besoin de `Box` pour avoir une taille connue à la compilation.",
        "Le cas `Nil` est la condition d'arrêt de la récursion.",
        "`match` te permet de distinguer `Cons` et `Nil`.",
      ],
      starter:
        "enum Liste {\n    Cons(i32, Box<Liste>),\n    Nil,\n}\n\nfn longueur(liste: &Liste) -> usize {\n    todo!()\n}",
      solution:
        "enum Liste {\n    Cons(i32, Box<Liste>),\n    Nil,\n}\n\nfn longueur(liste: &Liste) -> usize {\n    match liste {\n        Liste::Cons(_, suite) => 1 + longueur(suite),\n        Liste::Nil => 0,\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn liste_vide_a_une_longueur_nulle() {\n        assert_eq!(longueur(&Liste::Nil), 0);\n    }\n\n    #[test]\n    fn liste_de_trois_elements() {\n        let liste = Liste::Cons(1, Box::new(Liste::Cons(2, Box::new(Liste::Cons(3, Box::new(Liste::Nil))))));\n        assert_eq!(longueur(&liste), 3);\n    }\n\n    #[test]\n    fn liste_dun_seul_element() {\n        let liste = Liste::Cons(42, Box::new(Liste::Nil));\n        assert_eq!(longueur(&liste), 1);\n    }\n}",
    },
    {
      id: "ch15-ex2",
      title: "Implémenter Deref sur MonBox<T>",
      difficulty: "moyen",
      prompt:
        "Implémente une structure `MonBox<T>` (un tuple struct enveloppant une seule valeur de type `T`), avec un constructeur `MonBox::new`, puis implémente le trait `Deref` pour qu'on puisse écrire `*b` afin de récupérer une référence vers la valeur enveloppée.",
      hints: [
        "`Deref` a une seule méthode : `fn deref(&self) -> &Self::Target`.",
        "`type Target = T;` déclare le type vers lequel on déréférence.",
        "Pense à importer `std::ops::Deref`.",
      ],
      starter:
        "use std::ops::Deref;\n\nstruct MonBox<T>(T);\n\nimpl<T> MonBox<T> {\n    fn new(x: T) -> MonBox<T> {\n        todo!()\n    }\n}\n\n// implémente Deref ici\n",
      solution:
        "use std::ops::Deref;\n\nstruct MonBox<T>(T);\n\nimpl<T> MonBox<T> {\n    fn new(x: T) -> MonBox<T> {\n        MonBox(x)\n    }\n}\n\nimpl<T> Deref for MonBox<T> {\n    type Target = T;\n\n    fn deref(&self) -> &T {\n        &self.0\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn deref_donne_acces_a_la_valeur() {\n        let b = MonBox::new(5);\n        assert_eq!(*b, 5);\n    }\n\n    #[test]\n    fn deref_fonctionne_avec_une_string() {\n        let b = MonBox::new(String::from("rust"));\n        assert_eq!(&*b, "rust");\n        assert_eq!(b.len(), 4); // coercition automatique vers &str\n    }\n}',
    },
    {
      id: "ch15-ex3",
      title: "Compter les Rc partagés",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `compter_partages(valeur: i32) -> Vec<usize>` qui crée un `Rc::new(valeur)`, le clone deux fois (en gardant les clones vivants dans des variables), puis relâche explicitement l'un des deux clones. Enregistre `Rc::strong_count` à quatre moments : juste après la création, après le premier clone, après le second clone, et après avoir supprimé un clone (`drop`). Renvoie ces quatre comptes dans l'ordre.",
      hints: [
        "Utilise `Rc::strong_count(&rc)` pour lire le compteur à chaque étape.",
        "`drop(valeur)` (de `std::mem`, importé par défaut dans le prelude) libère une valeur avant la fin de la portée.",
        "Garde bien les `Rc` clonés dans des variables : sinon ils seraient libérés immédiatement et le compteur ne monterait jamais.",
      ],
      starter: "use std::rc::Rc;\n\nfn compter_partages(valeur: i32) -> Vec<usize> {\n    todo!()\n}",
      solution:
        "use std::rc::Rc;\n\nfn compter_partages(valeur: i32) -> Vec<usize> {\n    let mut comptes = Vec::new();\n\n    let original = Rc::new(valeur);\n    comptes.push(Rc::strong_count(&original));\n\n    let clone1 = Rc::clone(&original);\n    comptes.push(Rc::strong_count(&original));\n\n    let clone2 = Rc::clone(&original);\n    comptes.push(Rc::strong_count(&original));\n\n    drop(clone1);\n    comptes.push(Rc::strong_count(&original));\n\n    drop(clone2);\n    comptes\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn suit_le_compteur_pas_a_pas() {\n        assert_eq!(compter_partages(42), vec![1, 2, 3, 2]);\n    }\n\n    #[test]\n    fn fonctionne_avec_une_autre_valeur() {\n        assert_eq!(compter_partages(0), vec![1, 2, 3, 2]);\n    }\n}",
    },
    {
      id: "ch15-ex4",
      title: "Compteur mutable via RefCell",
      difficulty: "moyen",
      prompt:
        "Définis une structure `Compteur` contenant un `RefCell<i32>`, avec une méthode `incrementer(&self)` (note : `&self`, pas `&mut self` !) qui augmente la valeur interne de 1, et une méthode `valeur(&self) -> i32` qui la renvoie. Le but : muter une donnée à travers une référence **immuable**, grâce à la mutabilité intérieure.",
      hints: [
        "`RefCell::new(0)` initialise le compteur interne.",
        "`self.valeur.borrow_mut()` donne un accès mutable même si `self` n'est pas `&mut self`.",
        "`*self.valeur.borrow()` déréférence le `Ref<T>` pour lire l'entier.",
      ],
      starter:
        "use std::cell::RefCell;\n\nstruct Compteur {\n    valeur: RefCell<i32>,\n}\n\nimpl Compteur {\n    fn new() -> Compteur {\n        todo!()\n    }\n\n    fn incrementer(&self) {\n        todo!()\n    }\n\n    fn valeur(&self) -> i32 {\n        todo!()\n    }\n}",
      solution:
        "use std::cell::RefCell;\n\nstruct Compteur {\n    valeur: RefCell<i32>,\n}\n\nimpl Compteur {\n    fn new() -> Compteur {\n        Compteur { valeur: RefCell::new(0) }\n    }\n\n    fn incrementer(&self) {\n        *self.valeur.borrow_mut() += 1;\n    }\n\n    fn valeur(&self) -> i32 {\n        *self.valeur.borrow()\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn demarre_a_zero() {\n        let c = Compteur::new();\n        assert_eq!(c.valeur(), 0);\n    }\n\n    #[test]\n    fn incrementer_via_reference_immuable() {\n        let c = Compteur::new(); // pas `mut` !\n        c.incrementer();\n        c.incrementer();\n        c.incrementer();\n        assert_eq!(c.valeur(), 3);\n    }\n}",
    },
  ],
  project: {
    id: "ch15-projet",
    title: "Un arbre binaire de recherche",
    difficulty: "difficile",
    prompt:
      "Construis un arbre binaire de recherche minimal. Définis une structure `Noeud` avec un champ `valeur: i32` et deux enfants optionnels `gauche: Option<Box<Noeud>>` et `droite: Option<Box<Noeud>>`. Implémente : `Noeud::nouveau(valeur)` pour créer une feuille, `inserer(&mut self, valeur)` qui insère une valeur en respectant l'ordre (plus petit à gauche, plus grand à droite, les doublons sont ignorés), `contient(&self, valeur) -> bool` qui recherche une valeur, et `somme(&self) -> i32` qui additionne toutes les valeurs de l'arbre. `Box<Noeud>` est indispensable ici : sans indirection, `Noeud` contiendrait directement un `Noeud`, une taille infinie que le compilateur refuserait.",
    hints: [
      "`match &mut self.gauche { Some(n) => ..., None => ... }` te permet de descendre récursivement ou de créer une nouvelle feuille.",
      "`Option::as_ref()` transforme un `&Option<Box<Noeud>>` en `Option<&Box<Noeud>>`, pratique pour `contient` et `somme`.",
      "`n.contient(valeur)` fonctionne directement sur un `&Box<Noeud>` grâce à la déréférence automatique de méthode : pas besoin d'écrire `(*n).contient(valeur)`.",
      "`Option::map_or(defaut, fonction)` évite un `match` explicite quand l'`Option` est vide.",
    ],
    starter:
      "struct Noeud {\n    valeur: i32,\n    gauche: Option<Box<Noeud>>,\n    droite: Option<Box<Noeud>>,\n}\n\nimpl Noeud {\n    fn nouveau(valeur: i32) -> Self {\n        todo!()\n    }\n\n    fn inserer(&mut self, valeur: i32) {\n        todo!()\n    }\n\n    fn contient(&self, valeur: i32) -> bool {\n        todo!()\n    }\n\n    fn somme(&self) -> i32 {\n        todo!()\n    }\n}",
    solution:
      "struct Noeud {\n    valeur: i32,\n    gauche: Option<Box<Noeud>>,\n    droite: Option<Box<Noeud>>,\n}\n\nimpl Noeud {\n    fn nouveau(valeur: i32) -> Self {\n        Noeud { valeur, gauche: None, droite: None }\n    }\n\n    fn inserer(&mut self, valeur: i32) {\n        if valeur < self.valeur {\n            match &mut self.gauche {\n                Some(n) => n.inserer(valeur),\n                None => self.gauche = Some(Box::new(Noeud::nouveau(valeur))),\n            }\n        } else if valeur > self.valeur {\n            match &mut self.droite {\n                Some(n) => n.inserer(valeur),\n                None => self.droite = Some(Box::new(Noeud::nouveau(valeur))),\n            }\n        }\n        // valeur == self.valeur : doublon, on ne fait rien\n    }\n\n    fn contient(&self, valeur: i32) -> bool {\n        if valeur == self.valeur {\n            true\n        } else if valeur < self.valeur {\n            self.gauche.as_ref().map_or(false, |n| n.contient(valeur))\n        } else {\n            self.droite.as_ref().map_or(false, |n| n.contient(valeur))\n        }\n    }\n\n    fn somme(&self) -> i32 {\n        let mut total = self.valeur;\n        if let Some(n) = &self.gauche {\n            total += n.somme();\n        }\n        if let Some(n) = &self.droite {\n            total += n.somme();\n        }\n        total\n    }\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn arbre_exemple() -> Noeud {\n        let mut racine = Noeud::nouveau(5);\n        for v in [3, 8, 1, 4, 7, 9] {\n            racine.inserer(v);\n        }\n        racine\n    }\n\n    #[test]\n    fn contient_les_valeurs_inserees() {\n        let racine = arbre_exemple();\n        assert!(racine.contient(5));\n        assert!(racine.contient(1));\n        assert!(racine.contient(9));\n    }\n\n    #[test]\n    fn ne_contient_pas_les_valeurs_absentes() {\n        let racine = arbre_exemple();\n        assert!(!racine.contient(6));\n        assert!(!racine.contient(100));\n    }\n\n    #[test]\n    fn somme_tous_les_noeuds() {\n        let racine = arbre_exemple();\n        assert_eq!(racine.somme(), 5 + 3 + 8 + 1 + 4 + 7 + 9);\n    }\n\n    #[test]\n    fn insertion_de_doublon_est_ignoree() {\n        let mut racine = arbre_exemple();\n        let somme_avant = racine.somme();\n        racine.inserer(5);\n        assert_eq!(racine.somme(), somme_avant);\n    }\n\n    #[test]\n    fn arbre_dun_seul_noeud() {\n        let racine = Noeud::nouveau(10);\n        assert!(racine.contient(10));\n        assert!(!racine.contient(20));\n        assert_eq!(racine.somme(), 10);\n    }\n}",
  },
  keyTakeaways: [
    "Box<T> alloue sur le tas et permet des types récursifs grâce à l'indirection.",
    "Deref permet à * et à la coercition automatique de fonctionner sur un pointeur intelligent.",
    "Drop nettoie automatiquement, en ordre inverse de création ; std::mem::drop force un nettoyage anticipé.",
    "Rc<T> permet plusieurs propriétaires en lecture seule (mono-thread) ; Rc::clone est bon marché.",
    "RefCell<T> déplace la vérification des emprunts à l'exécution ; Rc<RefCell<T>> combine propriété partagée et mutation.",
    "Weak<T>, via Rc::downgrade, casse les cycles de références sans empêcher la libération mémoire.",
  ],
};
