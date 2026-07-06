import type { Chapter } from "../types";

export const ch13: Chapter = {
  number: 13,
  slug: "iterateurs-closures",
  title: "Fonctionnalités fonctionnelles : closures et itérateurs",
  subtitle: "Transformer des données de façon déclarative avec les closures et le trait Iterator.",
  description:
    "Rust emprunte à la programmation fonctionnelle deux outils redoutables : les **closures**, des fonctions anonymes capables de capturer leur environnement, et les **itérateurs**, qui décrivent une séquence d'opérations sans jamais écrire de boucle manuelle. Dans ce chapitre, tu vas apprendre à écrire des closures, comprendre comment elles capturent leurs variables (par référence, par référence mutable ou par valeur avec `move`), puis explorer le trait `Iterator` : ses adaptateurs paresseux (`map`, `filter`, `take`...) et ses consommateurs (`collect`, `sum`, `fold`...). Tu verras aussi pourquoi ce style, en apparence plus haut niveau, ne coûte rien à l'exécution : c'est une « zero-cost abstraction ».",
  minutes: 55,
  rustBookRef: "Chapitre 13 — Functional Language Features: Iterators and Closures",
  objectives: [
    "Écrire des closures et comprendre la capture d'environnement (référence, mutable, `move`)",
    "Distinguer les traits `Fn`, `FnMut` et `FnOnce`",
    "Comprendre le trait `Iterator` et sa seule méthode obligatoire, `next`",
    "Utiliser les adaptateurs paresseux : `map`, `filter`, `take`, `zip`, `enumerate`",
    "Consommer un itérateur avec `collect`, `sum`, `count`, `fold`, `any`, `all`, `find`",
    "Comparer boucles `for` et itérateurs, et comprendre le « zero-cost abstraction »",
  ],
  sections: [
    {
      id: "closures",
      title: "Les closures : des fonctions anonymes qui capturent leur environnement",
      blocks: [
        {
          type: "paragraph",
          text: "Une **closure** est une fonction anonyme que l'on peut stocker dans une variable ou passer en argument, comme une fonction classique. Sa particularité : elle peut **capturer** des variables de son environnement (le scope où elle est définie), ce qu'une fonction `fn` ordinaire ne peut pas faire. La syntaxe utilise des barres verticales pour les paramètres, sans avoir besoin d'annoter les types (le compilateur les infère au premier appel).",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let ajouter_un = |x: i32| -> i32 { x + 1 };\n    println!("{}", ajouter_un(5));\n\n    let liste = vec![1, 2, 3];\n    // Cette closure capture `liste` par référence immuable.\n    let affiche_liste = || println!("Liste : {liste:?}");\n    affiche_liste();\n    affiche_liste();\n}',
        },
        {
          type: "paragraph",
          text: "Par défaut, Rust choisit le mode de capture le moins contraignant possible : d'abord par référence immuable, puis par référence mutable si le corps de la closure modifie la variable, et enfin par valeur si c'est nécessaire (par exemple pour la déplacer ou la consommer).",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let mut compteur = 0;\n    // Cette closure capture `compteur` par référence mutable.\n    let mut incrementer = || {\n        compteur += 1;\n        println!("compteur = {compteur}");\n    };\n    incrementer();\n    incrementer();\n}',
        },
        {
          type: "callout",
          variant: "tip",
          title: "Annoter les types reste possible",
          text: "`|x: i32| -> i32 { x + 1 }` fonctionne toujours. C'est utile pour la documentation, ou quand le compilateur ne peut pas inférer le type tout seul (par exemple si la closure n'est jamais appelée dans le fichier).",
        },
        {
          type: "paragraph",
          text: "Le mot-clé `move` force une closure à **prendre possession** des variables qu'elle capture, même si un simple emprunt suffirait. C'est indispensable dès qu'une closure doit vivre plus longtemps que son scope d'origine, typiquement quand on la passe à un autre thread.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'use std::thread;\n\nfn main() {\n    let donnees = vec![1, 2, 3];\n    let handle = thread::spawn(move || {\n        println!("Depuis le thread : {donnees:?}");\n    });\n    handle.join().unwrap();\n}',
        },
        {
          type: "callout",
          variant: "info",
          text: "Sans `move`, le compilateur refuserait ce code : `donnees` pourrait être détruite dans `main` avant que le thread ne l'utilise. `move` transfère la propriété de `donnees` dans la closure, ce qui règle le problème de durée de vie.",
        },
      ],
    },
    {
      id: "traits-fn",
      title: "Fn, FnMut, FnOnce : les trois façons de capturer",
      blocks: [
        {
          type: "paragraph",
          text: "Chaque closure implémente automatiquement un ou plusieurs des trois traits `Fn`, `FnMut` et `FnOnce`, selon la façon dont elle utilise les variables capturées. Ces traits servent de contraintes génériques quand on veut accepter une closure en paramètre de fonction.",
        },
        {
          type: "list",
          items: [
            "`FnOnce` — la closure peut être appelée au moins une fois ; elle consomme (déplace) les valeurs qu'elle capture. Toute closure implémente au moins `FnOnce`.",
            "`FnMut` — la closure peut être appelée plusieurs fois et peut modifier son environnement capturé (elle ne déplace rien hors d'elle-même).",
            "`Fn` — la closure peut être appelée plusieurs fois sans jamais modifier ni consommer son environnement (capture en lecture seule, ou aucune capture).",
          ],
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn appliquer<F: Fn(i32) -> i32>(f: F, valeur: i32) -> i32 {\n    f(valeur)\n}\n\nfn main() {\n    let doubler = |x| x * 2;\n    println!("{}", appliquer(doubler, 21));\n}',
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn repeter_avec<F: FnMut()>(mut f: F, n: u32) {\n    for _ in 0..n {\n        f();\n    }\n}\n\nfn main() {\n    let mut total = 0;\n    repeter_avec(|| total += 1, 5);\n    println!("total = {total}");\n}',
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn consommer<F: FnOnce() -> String>(f: F) -> String {\n    f()\n}\n\nfn main() {\n    let message = String::from("bonjour");\n    // `move` transfère `message` dans la closure ; elle ne peut donc\n    // être appelée qu\'une seule fois, d\'où la contrainte FnOnce.\n    let salutation = move || message;\n    println!("{}", consommer(salutation));\n}',
        },
        {
          type: "callout",
          variant: "warning",
          title: "Une hiérarchie, pas trois catégories isolées",
          text: "Toute closure `Fn` est aussi `FnMut`, et toute closure `FnMut` est aussi `FnOnce`. Résultat : une fonction qui accepte `FnOnce` accepte n'importe quelle closure, alors qu'une fonction qui exige `Fn` est la plus restrictive. Choisis la contrainte la plus large possible dont ta fonction a réellement besoin.",
        },
      ],
    },
    {
      id: "iterateur-trait",
      title: "Le trait Iterator et la méthode next",
      blocks: [
        {
          type: "paragraph",
          text: "Un itérateur est une valeur qui sait produire une séquence d'éléments, un par un. En Rust, ce comportement est entièrement défini par le trait `Iterator`, qui n'exige qu'**une seule** méthode : `next`. Tout le reste — `map`, `filter`, `sum`, `collect`... — est fourni par des implémentations par défaut qui s'appuient uniquement sur `next`.",
        },
        {
          type: "code",
          language: "rust",
          code:
            "trait Iterator {\n    type Item;\n\n    fn next(&mut self) -> Option<Self::Item>;\n\n    // Des dizaines de méthodes par défaut (map, filter, sum, fold...)\n    // sont fournies gratuitement dès que `next` est implémentée.\n}",
        },
        {
          type: "paragraph",
          text: "Un `Vec<T>` n'est pas lui-même un itérateur, mais il propose trois façons d'en obtenir un : `.iter()` produit des références `&T`, `.iter_mut()` des références mutables `&mut T`, et `.into_iter()` prend possession du vecteur et produit des `T` par valeur.",
        },
        {
          type: "code",
          language: "rust",
          code:
            "fn main() {\n    let v = vec![1, 2, 3];\n    let mut iter = v.iter();\n\n    assert_eq!(iter.next(), Some(&1));\n    assert_eq!(iter.next(), Some(&2));\n    assert_eq!(iter.next(), Some(&3));\n    assert_eq!(iter.next(), None);\n}",
        },
        {
          type: "paragraph",
          text: "On peut implémenter `Iterator` pour ses propres types. Il suffit d'écrire `next`, et toutes les méthodes de la section suivante deviennent utilisables automatiquement.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'struct Compteur {\n    compte: u32,\n}\n\nimpl Compteur {\n    fn new() -> Compteur {\n        Compteur { compte: 0 }\n    }\n}\n\nimpl Iterator for Compteur {\n    type Item = u32;\n\n    fn next(&mut self) -> Option<u32> {\n        if self.compte < 5 {\n            self.compte += 1;\n            Some(self.compte)\n        } else {\n            None\n        }\n    }\n}\n\nfn main() {\n    // `.sum()` n\'a jamais été écrite pour `Compteur` : elle vient\n    // gratuitement du trait Iterator, grâce à `next`.\n    let somme: u32 = Compteur::new().sum();\n    println!("somme = {somme}"); // 15\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Implémenter `next()` une seule fois te donne accès à des dizaines de méthodes prêtes à l'emploi. C'est l'un des plus beaux exemples de composition par traits en Rust.",
        },
      ],
    },
    {
      id: "adaptateurs",
      title: "Adaptateurs paresseux : map, filter, take, zip, enumerate",
      blocks: [
        {
          type: "paragraph",
          text: "Les **adaptateurs** transforment un itérateur en un autre itérateur, sans jamais parcourir les éléments eux-mêmes : ils sont **paresseux**. Rien ne s'exécute tant qu'un **consommateur** (vu dans la section suivante) ne vient pas tirer les éléments un par un via `next`.",
        },
        {
          type: "list",
          items: [
            "`map(f)` — applique `f` à chaque élément et produit les résultats.",
            "`filter(p)` — ne garde que les éléments pour lesquels le prédicat `p` renvoie `true`.",
            "`take(n)` — s'arrête après `n` éléments, même si la source est infinie.",
            "`zip(autre)` — associe deux itérateurs élément par élément en tuples, s'arrête au plus court.",
            "`enumerate()` — associe à chaque élément son index de position, sous forme de tuple `(index, valeur)`.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let nombres = vec![1, 2, 3, 4, 5];\n\n    let doubles: Vec<i32> = nombres.iter().map(|n| n * 2).collect();\n    println!("{doubles:?}");\n\n    let pairs: Vec<&i32> = nombres.iter().filter(|&&n| n % 2 == 0).collect();\n    println!("{pairs:?}");\n\n    let trois_premiers: Vec<&i32> = nombres.iter().take(3).collect();\n    println!("{trois_premiers:?}");\n\n    let lettres = vec![\'a\', \'b\', \'c\'];\n    let paires: Vec<(i32, char)> = nombres.iter().copied().zip(lettres.iter().copied()).collect();\n    println!("{paires:?}");\n\n    for (index, valeur) in nombres.iter().enumerate() {\n        println!("{index}: {valeur}");\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "`nombres.iter().map(|n| n * 2);` seul, sans `collect`, `for` ou tout autre consommateur, ne fait strictement rien : le compilateur émet même un avertissement (« unused iterator that must be used »). Un adaptateur ne travaille que s'il est consommé.",
        },
        {
          type: "heading",
          level: 3,
          text: "Chaîner les adaptateurs",
        },
        {
          type: "paragraph",
          text: "Comme chaque adaptateur renvoie un nouvel itérateur, on peut les enchaîner à volonté pour construire un pipeline de traitement, lu de haut en bas.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let nombres = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n    let resultat: Vec<i32> = nombres\n        .iter()\n        .filter(|&&n| n % 2 == 0)\n        .map(|n| n * n)\n        .take(3)\n        .collect();\n\n    println!("{resultat:?}"); // [4, 16, 36]\n}',
        },
      ],
    },
    {
      id: "consommateurs",
      title: "Consommateurs : collect, sum, count, fold, any, all, find",
      blocks: [
        {
          type: "paragraph",
          text: "Un **consommateur** appelle `next` jusqu'à épuisement de l'itérateur pour produire un résultat concret : une collection, un nombre, un booléen, un élément unique... C'est le moment où le pipeline paresseux se met réellement en marche.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let notes = vec![12, 8, 15, 20, 6, 17];\n\n    let total: i32 = notes.iter().sum();\n    let nombre = notes.iter().count();\n    let moyenne = total as f64 / nombre as f64;\n    println!("moyenne = {moyenne:.2}");\n\n    // fold généralise sum : on fournit un accumulateur de départ\n    // et une fonction qui combine l\'accumulateur avec chaque élément.\n    let somme_des_carres: i32 = notes.iter().map(|n| n * n).fold(0, |acc, n| acc + n);\n    println!("somme des carrés = {somme_des_carres}");\n}',
        },
        {
          type: "paragraph",
          text: "`any` et `all` renvoient un booléen dès qu'ils peuvent trancher (ils s'arrêtent au premier élément décisif). `find` renvoie le premier élément qui satisfait un prédicat, sous forme d'`Option`.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn main() {\n    let notes = vec![12, 8, 15, 20, 6, 17];\n\n    let a_un_recale = notes.iter().any(|&n| n < 10);\n    let toutes_valides = notes.iter().all(|&n| n <= 20);\n    let premiere_bonne = notes.iter().find(|&&n| n >= 15);\n\n    println!("recalé : {a_un_recale}, toutes valides : {toutes_valides}, première >= 15 : {premiere_bonne:?}");\n}',
        },
        {
          type: "callout",
          variant: "info",
          title: "collect a besoin de connaître le type cible",
          text: "`collect()` peut produire un `Vec`, une `HashMap`, une `String`... Le compilateur a besoin d'une indication : soit via l'annotation de la variable (`let v: Vec<i32> = ...`), soit via la syntaxe turbofish (`.collect::<Vec<i32>>()`).",
        },
      ],
    },
    {
      id: "for-vs-iterateurs",
      title: "Boucle for vs itérateurs : lisibilité et zero-cost abstraction",
      blocks: [
        {
          type: "paragraph",
          text: "Le même calcul peut presque toujours s'écrire avec une boucle `for` explicite ou avec une chaîne d'itérateurs. Compare les deux versions ci-dessous : elles calculent la somme des carrés des nombres pairs.",
        },
        {
          type: "code",
          language: "rust",
          code:
            "// Version boucle for : on gère l'index et l'accumulateur à la main.\nfn somme_des_carres_paires_for(nombres: &[i32]) -> i32 {\n    let mut total = 0;\n    for i in 0..nombres.len() {\n        if nombres[i] % 2 == 0 {\n            total += nombres[i] * nombres[i];\n        }\n    }\n    total\n}\n\n// Version itérateurs : le pipeline décrit directement l'intention.\nfn somme_des_carres_paires_iter(nombres: &[i32]) -> i32 {\n    nombres\n        .iter()\n        .filter(|&&n| n % 2 == 0)\n        .map(|n| n * n)\n        .sum()\n}",
        },
        {
          type: "paragraph",
          text: "La version itérateurs élimine tout indexage manuel, donc tout risque de dépassement de tableau. Et contrairement à l'intuition, elle n'est pas plus lente : le compilateur déroule et optimise ces chaînes d'adaptateurs jusqu'à produire un code machine aussi rapide (parfois plus rapide, grâce à l'élimination des vérifications de bornes) que la boucle écrite à la main. C'est ce qu'on appelle une **zero-cost abstraction** : le confort d'écriture ne coûte rien à l'exécution.",
        },
        {
          type: "usecase",
          title: "Transformer et filtrer des données de façon déclarative",
          text: "Dès que tu dois nettoyer, transformer ou résumer une collection — extraire les emails valides d'une liste d'inscriptions, ne garder que les commandes livrées puis calculer leur chiffre d'affaires total, convertir des mesures et écarter les valeurs aberrantes — un pipeline d'itérateurs (`filter` puis `map` puis `sum`/`collect`) exprime directement le **quoi** (le résultat voulu) plutôt que le **comment** (boucles, index, accumulateurs manuels). Le code se lit alors comme une phrase : « parmi ces éléments, garde ceux qui..., transforme-les en..., puis résume-les en... ».",
        },
        {
          type: "callout",
          variant: "tip",
          text: "En Rust idiomatique, préfère les itérateurs par défaut. Reviens à une boucle `for` classique quand le corps a des effets de bord complexes (plusieurs sorties, gestion d'erreurs multiples, `break`/`continue` imbriqués) qu'un pipeline rendrait moins lisible.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch13-ex1",
      title: "Doubler tous les éléments",
      difficulty: "facile",
      prompt:
        "Écris une fonction `doubler_tout` qui reçoit une slice `&[i32]` et renvoie un `Vec<i32>` où chaque élément a été multiplié par deux. Utilise `.iter()`, `.map(...)` et `.collect()` — pas de boucle `for` explicite.",
      hints: [
        "`.iter()` te donne des références `&i32` ; `map` peut les déréférencer avec `|n| n * 2`.",
        "`collect()` a besoin de connaître le type cible : annote la variable de retour ou utilise le turbofish.",
      ],
      starter: "fn doubler_tout(nombres: &[i32]) -> Vec<i32> {\n    todo!()\n}",
      solution:
        "fn doubler_tout(nombres: &[i32]) -> Vec<i32> {\n    nombres.iter().map(|n| n * 2).collect()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn double_des_valeurs_normales() {\n        assert_eq!(doubler_tout(&[1, 2, 3]), vec![2, 4, 6]);\n    }\n\n    #[test]\n    fn gere_une_slice_vide() {\n        assert_eq!(doubler_tout(&[]), Vec::<i32>::new());\n    }\n\n    #[test]\n    fn gere_le_zero_et_le_negatif() {\n        assert_eq!(doubler_tout(&[-1, 0, 5]), vec![-2, 0, 10]);\n    }\n}",
    },
    {
      id: "ch13-ex2",
      title: "Filtrer les nombres pairs",
      difficulty: "facile",
      prompt:
        "Écris une fonction `filtrer_pairs` qui reçoit une slice `&[i32]` et renvoie un `Vec<i32>` (des valeurs, pas des références) contenant uniquement les nombres pairs, dans leur ordre d'origine.",
      hints: [
        "`.copied()` transforme un itérateur de `&i32` en itérateur de `i32`, pratique avant un `filter` puis un `collect` en `Vec<i32>`.",
        "Le prédicat de `filter` reçoit une référence à l'élément de l'itérateur.",
      ],
      starter: "fn filtrer_pairs(nombres: &[i32]) -> Vec<i32> {\n    todo!()\n}",
      solution:
        "fn filtrer_pairs(nombres: &[i32]) -> Vec<i32> {\n    nombres.iter().copied().filter(|n| n % 2 == 0).collect()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn garde_uniquement_les_pairs() {\n        assert_eq!(filtrer_pairs(&[1, 2, 3, 4, 5, 6]), vec![2, 4, 6]);\n    }\n\n    #[test]\n    fn renvoie_vide_si_aucun_pair() {\n        assert_eq!(filtrer_pairs(&[1, 3, 5]), Vec::<i32>::new());\n    }\n\n    #[test]\n    fn fonctionne_avec_des_negatifs() {\n        assert_eq!(filtrer_pairs(&[-4, -3, -2]), vec![-4, -2]);\n    }\n}",
    },
    {
      id: "ch13-ex3",
      title: "Somme des carrés",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `somme_des_carres` qui reçoit une slice `&[i32]` et renvoie la somme des carrés de ses éléments, en combinant `.map(...)` et `.sum()`.",
      hints: [
        "`map` transforme chaque élément en son carré avant que `sum` ne les additionne.",
        "`sum()` peut avoir besoin d'une annotation de type sur la variable qui reçoit le résultat.",
      ],
      starter: "fn somme_des_carres(nombres: &[i32]) -> i32 {\n    todo!()\n}",
      solution: "fn somme_des_carres(nombres: &[i32]) -> i32 {\n    nombres.iter().map(|n| n * n).sum()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn calcule_la_somme_des_carres() {\n        assert_eq!(somme_des_carres(&[1, 2, 3]), 14);\n    }\n\n    #[test]\n    fn renvoie_zero_pour_une_slice_vide() {\n        assert_eq!(somme_des_carres(&[]), 0);\n    }\n\n    #[test]\n    fn fonctionne_avec_des_negatifs() {\n        assert_eq!(somme_des_carres(&[-2, 2]), 8);\n    }\n}",
    },
    {
      id: "ch13-ex4",
      title: "Appliquer une closure deux fois",
      difficulty: "moyen",
      prompt:
        "Écris une fonction générique `appliquer_deux_fois` qui reçoit une closure `f` (contrainte `Fn(i32) -> i32`) et une valeur `i32`, puis renvoie le résultat de l'application de `f` sur sa propre sortie, c'est-à-dire `f(f(valeur))`.",
      hints: [
        "La signature ressemble à `fn appliquer_deux_fois<F: Fn(i32) -> i32>(f: F, valeur: i32) -> i32`.",
        "Comme `Fn` ne consomme rien, tu peux appeler `f` plusieurs fois sans souci.",
      ],
      starter:
        "fn appliquer_deux_fois<F: Fn(i32) -> i32>(f: F, valeur: i32) -> i32 {\n    todo!()\n}",
      solution:
        "fn appliquer_deux_fois<F: Fn(i32) -> i32>(f: F, valeur: i32) -> i32 {\n    f(f(valeur))\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn additionne_deux_fois() {\n        assert_eq!(appliquer_deux_fois(|x| x + 3, 10), 16);\n    }\n\n    #[test]\n    fn multiplie_deux_fois() {\n        assert_eq!(appliquer_deux_fois(|x| x * 2, 5), 20);\n    }\n\n    #[test]\n    fn soustrait_deux_fois() {\n        assert_eq!(appliquer_deux_fois(|x| x - 1, 0), -2);\n    }\n}",
    },
  ],
  project: {
    id: "ch13-projet",
    title: "Bulletin de notes en style fonctionnel",
    difficulty: "difficile",
    prompt:
      "Reprends la gestion d'un bulletin de notes, mais écris tout en style itérateurs — aucune boucle `for` explicite, aucun indexage manuel. Implémente deux fonctions : 1) `analyser(notes: &[u32]) -> (u32, u32, f64)` qui renvoie un triplet `(nombre_recus, meilleure_note, moyenne)` où `nombre_recus` compte les notes supérieures ou égales à 10 ; une slice vide doit renvoyer `(0, 0, 0.0)`. 2) `filtrer_notes<F: Fn(&u32) -> bool>(notes: &[u32], predicat: F) -> Vec<u32>`, une fonction générique qui filtre les notes selon une closure fournie par l'appelant, pour que le code appelant décide lui-même du critère.",
    hints: [
      "`.iter().filter(|&&n| n >= 10).count()` donne directement le nombre de notes reçues.",
      "`.iter().copied().max()` renvoie un `Option<u32>` ; utilise `.unwrap_or(0)` pour le cas d'une slice vide.",
      "Pour la moyenne, convertis en `f64` avant de diviser, sinon tu obtiens une division entière tronquée. Gère aussi le cas `notes.is_empty()` pour éviter une division par zéro.",
      "La contrainte générique de `filtrer_notes` peut s'écrire directement dans les chevrons ou via une clause `where F: Fn(&u32) -> bool`.",
    ],
    starter:
      "fn analyser(notes: &[u32]) -> (u32, u32, f64) {\n    todo!()\n}\n\nfn filtrer_notes<F>(notes: &[u32], predicat: F) -> Vec<u32>\nwhere\n    F: Fn(&u32) -> bool,\n{\n    todo!()\n}",
    solution:
      "fn analyser(notes: &[u32]) -> (u32, u32, f64) {\n    let nb_recus = notes.iter().filter(|&&n| n >= 10).count() as u32;\n    let meilleure = notes.iter().copied().max().unwrap_or(0);\n    let moyenne = if notes.is_empty() {\n        0.0\n    } else {\n        notes.iter().sum::<u32>() as f64 / notes.len() as f64\n    };\n    (nb_recus, meilleure, moyenne)\n}\n\nfn filtrer_notes<F>(notes: &[u32], predicat: F) -> Vec<u32>\nwhere\n    F: Fn(&u32) -> bool,\n{\n    notes.iter().copied().filter(|n| predicat(n)).collect()\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn analyser_calcule_le_triplet_attendu() {\n        assert_eq!(analyser(&[12, 8, 15, 20, 6, 17]), (4, 20, 13.0));\n    }\n\n    #[test]\n    fn analyser_gere_une_slice_vide() {\n        assert_eq!(analyser(&[]), (0, 0, 0.0));\n    }\n\n    #[test]\n    fn analyser_toutes_notes_recues() {\n        assert_eq!(analyser(&[10, 11, 12]), (3, 12, 11.0));\n    }\n\n    #[test]\n    fn filtrer_notes_avec_seuil() {\n        assert_eq!(filtrer_notes(&[12, 8, 15, 20, 6, 17], |&n| n >= 15), vec![15, 20, 17]);\n    }\n\n    #[test]\n    fn filtrer_notes_avec_un_autre_predicat() {\n        assert_eq!(filtrer_notes(&[1, 2, 3, 4], |&n| n % 2 == 0), vec![2, 4]);\n    }\n}",
  },
  keyTakeaways: [
    "Une closure est une fonction anonyme qui peut capturer son environnement par référence, référence mutable, ou par valeur avec `move`.",
    "`Fn`, `FnMut` et `FnOnce` décrivent comment une closure capture ; `FnOnce` est la contrainte la plus permissive côté appelant, `Fn` la plus restrictive côté closure.",
    "Le trait `Iterator` n'exige qu'une méthode, `next() -> Option<Self::Item>` ; tout le reste (map, filter, sum...) vient gratuitement.",
    "Les adaptateurs (`map`, `filter`, `take`, `zip`, `enumerate`...) sont paresseux : rien ne s'exécute avant un consommateur.",
    "Les consommateurs (`collect`, `sum`, `count`, `fold`, `any`, `all`, `find`) parcourent l'itérateur et produisent un résultat concret.",
    "Les itérateurs sont une « zero-cost abstraction » : aussi rapides qu'une boucle `for` écrite à la main, souvent plus lisibles et plus sûrs.",
  ],
};
