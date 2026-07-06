import type { Chapter } from "../types";

export const ch16: Chapter = {
  number: 16,
  slug: "concurrence",
  title: "La concurrence sans peur",
  subtitle: "Threads, canaux et état partagé — sans data race grâce au compilateur.",
  description:
    "La concurrence a mauvaise réputation : bugs impossibles à reproduire, données corrompues, comportements différents à chaque exécution. Rust attaque le problème à la racine en confiant au système de types la détection des data races, dès la compilation. Dans ce chapitre, tu apprends à lancer des threads, à faire communiquer des tâches par messages avec des canaux, puis à partager un état mutable en toute sécurité avec `Mutex<T>` et `Arc<T>`.",
  minutes: 55,
  rustBookRef: "Chapitre 16 — Fearless Concurrency",
  objectives: [
    "Créer des threads avec thread::spawn et récupérer leur résultat avec join",
    "Comprendre pourquoi move est nécessaire pour capturer des données dans un thread",
    "Faire communiquer des threads par messages avec un canal mpsc",
    "Envoyer depuis plusieurs producteurs en clonant l'émetteur du canal",
    "Partager un état mutable entre threads avec Mutex<T> et Arc<T>",
    "Distinguer les traits Send et Sync et leur rôle dans la sécurité concurrente",
    "Expliquer comment le compilateur empêche les data races à la compilation",
  ],
  sections: [
    {
      id: "threads",
      title: "Créer des threads",
      blocks: [
        {
          type: "paragraph",
          text: "Un **thread** est une unité d'exécution indépendante : le système d'exploitation peut faire progresser plusieurs threads « en même temps » (en parallèle sur plusieurs cœurs, ou en alternance sur un seul). `thread::spawn` lance une nouvelle fonction dans un thread séparé, en parallèle du thread principal.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    let handle = thread::spawn(|| {\n        for i in 1..=3 {\n            println!(\"thread secondaire : {i}\");\n            thread::sleep(Duration::from_millis(1));\n        }\n    });\n\n    for i in 1..=2 {\n        println!(\"thread principal : {i}\");\n    }\n\n    // On attend que le thread secondaire se termine.\n    handle.join().unwrap();\n}",
          caption: "L'ordre exact d'affichage entre les deux threads n'est pas garanti.",
        },
        {
          type: "paragraph",
          text: "`thread::spawn` renvoie un `JoinHandle`. Appeler `.join()` dessus **bloque** le thread appelant jusqu'à ce que le thread lancé se termine, et renvoie un `Result` contenant la valeur produite par la closure (ou une erreur si le thread a paniqué).",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::thread;\n\nfn main() {\n    let handle = thread::spawn(|| {\n        let mut total = 0;\n        for i in 1..=5 {\n            total += i;\n        }\n        total // valeur renvoyée par le thread\n    });\n\n    let resultat = handle.join().unwrap();\n    println!(\"somme calculée dans un thread : {resultat}\");\n}",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Sans join, rien n'est garanti",
          text: "Si le thread principal (celui de `main`) se termine avant les threads secondaires, ces derniers sont interrompus, terminés ou non. `join()` est ta garantie qu'un thread a fini son travail avant de continuer.",
        },
        {
          type: "paragraph",
          text: "Le mot-clé **`move`** force la closure à prendre possession des variables qu'elle utilise, plutôt que de les emprunter. C'est indispensable dès que le thread doit survivre plus longtemps que la fonction qui l'a lancé : sans `move`, le compilateur ne peut pas garantir que la référence capturée restera valide.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::thread;\n\nfn main() {\n    let donnees = vec![1, 2, 3];\n\n    // Sans `move`, le compilateur refuse : il ne peut pas prouver que\n    // `donnees` vivra assez longtemps pour le thread.\n    let handle = thread::spawn(move || {\n        println!(\"données capturées : {:?}\", donnees);\n    });\n\n    handle.join().unwrap();\n    // `donnees` a été déplacée dans la closure : elle n'est plus utilisable ici.\n}",
        },
        {
          type: "list",
          items: [
            "thread::spawn(closure) lance un nouveau thread et renvoie un JoinHandle.",
            "handle.join() attend la fin du thread et récupère sa valeur de retour.",
            "move transfère la propriété des variables capturées dans le thread.",
            "Le programme se termine quand main se termine, sauf si on a join les threads.",
          ],
        },
      ],
    },
    {
      id: "canaux",
      title: "Communiquer par messages avec mpsc",
      blocks: [
        {
          type: "paragraph",
          text: "Une devise populaire du monde Go, adoptée aussi par Rust : « Ne communiquez pas en partageant de la mémoire ; partagez de la mémoire en communiquant. » Un **canal** (channel) permet à un thread d'envoyer des valeurs qu'un autre thread reçoit, sans variable partagée directement. `mpsc` signifie *multiple producer, single consumer* : plusieurs émetteurs, un seul récepteur.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    thread::spawn(move || {\n        let message = String::from(\"salut depuis le thread\");\n        tx.send(message).unwrap();\n        // `message` a été déplacé dans le canal : impossible de le réutiliser ici.\n    });\n\n    let recu = rx.recv().unwrap();\n    println!(\"reçu : {recu}\");\n}",
          caption: "tx (transmitter) envoie, rx (receiver) reçoit.",
        },
        {
          type: "paragraph",
          text: "`recv()` bloque jusqu'à recevoir une valeur (ou renvoie une erreur si tous les émetteurs sont fermés). On peut aussi traiter le récepteur comme un **itérateur** : la boucle s'arrête automatiquement quand tous les émetteurs sont abandonnés (`drop`).",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    thread::spawn(move || {\n        for valeur in [1, 2, 3, 4, 5] {\n            tx.send(valeur).unwrap();\n        }\n        // `tx` est abandonné ici : le canal se ferme, rx s'arrêtera d'itérer.\n    });\n\n    for recu in rx {\n        println!(\"reçu : {recu}\");\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Pour avoir **plusieurs producteurs**, on clone l'émetteur avant de le déplacer dans chaque thread : tous les clones envoient vers le même récepteur.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    for id in 0..3 {\n        let tx_clone = tx.clone();\n        thread::spawn(move || {\n            tx_clone.send(format!(\"message du producteur {id}\")).unwrap();\n        });\n    }\n    // On abandonne l'émetteur original : sinon le canal ne se ferme jamais.\n    drop(tx);\n\n    let mut messages: Vec<String> = rx.iter().collect();\n    messages.sort();\n    for m in messages {\n        println!(\"{m}\");\n    }\n}",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`tx.clone()` est peu coûteux : c'est un compteur de référence interne, pas une copie du canal. Toujours `drop` (ou laisser sortir de portée) tous les émetteurs pour que la boucle `for ... in rx` se termine proprement.",
        },
      ],
    },
    {
      id: "etat-partage",
      title: "État partagé avec Mutex<T> et Arc<T>",
      blocks: [
        {
          type: "paragraph",
          text: "Les canaux conviennent bien pour transférer la **propriété** d'une valeur. Mais parfois, plusieurs threads doivent lire et modifier la **même** donnée. `Mutex<T>` (mutual exclusion) garantit qu'un seul thread à la fois accède à la valeur qu'il protège : `.lock()` bloque jusqu'à obtenir l'accès exclusif, et renvoie un `MutexGuard` qui déréférence vers `T` et libère automatiquement le verrou à sa destruction.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::Mutex;\n\nfn main() {\n    let compteur = Mutex::new(0);\n\n    {\n        let mut valeur = compteur.lock().unwrap();\n        *valeur += 1;\n    } // le verrou est relâché ici, à la fin du bloc\n\n    println!(\"compteur = {:?}\", compteur);\n}",
        },
        {
          type: "paragraph",
          text: "Pour partager un `Mutex<T>` **entre plusieurs threads**, il faut aussi partager sa propriété. `Rc<T>` (vu au chapitre 15) ne convient pas : son compteur de références n'est pas synchronisé, donc pas sûr entre threads. `Arc<T>` (*Atomic Reference Counted*) est son équivalent thread-safe, au prix d'un léger surcoût lié à la synchronisation atomique.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    let compteur = Arc::new(Mutex::new(0));\n    let mut handles = Vec::new();\n\n    for _ in 0..10 {\n        let compteur = Arc::clone(&compteur);\n        let handle = thread::spawn(move || {\n            let mut valeur = compteur.lock().unwrap();\n            *valeur += 1;\n        });\n        handles.push(handle);\n    }\n\n    for handle in handles {\n        handle.join().unwrap();\n    }\n\n    println!(\"résultat final : {}\", *compteur.lock().unwrap());\n}",
          caption: "Arc<Mutex<T>> est le duo classique pour un compteur ou un état partagé mutable.",
        },
        {
          type: "list",
          items: [
            "Mutex<T> protège une valeur : un seul thread peut la verrouiller à la fois.",
            "lock() renvoie un Result<MutexGuard<T>> : une erreur signale qu'un thread a paniqué en tenant le verrou (mutex empoisonné).",
            "Arc<T> permet de partager la propriété d'une valeur entre threads (Rc<T> ne le permet pas).",
            "Arc<Mutex<T>> combine partage (Arc) et exclusion mutuelle (Mutex).",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          title: "Attention aux interblocages",
          text: "Rust empêche les data races, pas les **interblocages** (deadlocks). Verrouiller deux mutex dans un ordre différent selon les threads peut bloquer un programme indéfiniment. La discipline (toujours verrouiller dans le même ordre, garder les sections critiques courtes) reste de ta responsabilité.",
        },
      ],
    },
    {
      id: "send-sync",
      title: "Les traits Send et Sync",
      blocks: [
        {
          type: "paragraph",
          text: "Deux traits marqueurs, presque toujours implémentés automatiquement par le compilateur, formalisent ce qui est « sûr en concurrence » :",
        },
        {
          type: "list",
          items: [
            "Send : un type Send peut être transféré (déplacé) vers un autre thread. Presque tous les types sont Send ; Rc<T> ne l'est pas.",
            "Sync : un type Sync peut être référencé (&T) depuis plusieurs threads simultanément. Mutex<T> est Sync ; RefCell<T> ne l'est pas.",
            "Un type composé de champs Send/Sync est automatiquement Send/Sync — pas besoin de l'implémenter à la main dans le code applicatif courant.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: "use std::rc::Rc;\nuse std::thread;\n\nfn main() {\n    let partage = Rc::new(5);\n\n    // Erreur de compilation : Rc<i32> n'implémente pas Send.\n    // Le compilateur refuse de déplacer `partage` dans le thread.\n    let _handle = thread::spawn(move || {\n        println!(\"{}\", partage);\n    });\n}",
          caption: "Ce code ne compile pas : c'est exactement le but recherché.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Le compilateur, pas un détecteur au runtime",
          text: "En C ou C++, une data race est un comportement indéfini détecté (parfois) à l'exécution, par un outil externe comme ThreadSanitizer. En Rust, `Send` et `Sync` font partie du système de types : le code qui violerait une invariant de concurrence ne compile tout simplement pas. C'est le sens de « fearless concurrency » — la peur du bug de concurrence est déplacée du runtime vers la compilation.",
        },
        {
          type: "paragraph",
          text: "Concrètement, remplacer `Rc<T>` par `Arc<T>`, ou `RefCell<T>` par `Mutex<T>`, suffit en général à rendre un type utilisable entre threads : le compilateur guide directement vers la bonne solution via ses messages d'erreur.",
        },
      ],
    },
    {
      id: "cas-usage",
      title: "Cas d'usage : paralléliser un calcul",
      blocks: [
        {
          type: "usecase",
          title: "Paralléliser un calcul coûteux",
          text: "Tu dois traiter une grande collection de données (agréger, transformer, filtrer) et l'opération est purement calculatoire, sans dépendance entre éléments. Découpe la collection en tranches, lance un thread par tranche avec `thread::spawn` et `Arc` pour partager les données en lecture seule, chaque thread renvoie un résultat partiel via sa valeur de retour, puis combine les résultats après avoir `join` tous les threads. C'est le patron utilisé par `somme_parallele` dans le projet de ce chapitre : diviser le travail, exécuter en parallèle, fusionner.",
        },
        {
          type: "usecase",
          title: "Pipeline producteur/consommateur",
          text: "Un thread « producteur » génère des tâches ou des données (lecture d'un flux, génération d'événements) et les envoie via un canal `mpsc`. Un ou plusieurs threads « consommateurs » itèrent sur le récepteur (`for item in rx`) et traitent chaque élément dès qu'il arrive, sans attendre que tout soit produit. Ce découpage désynchronise producteur et consommateur : le producteur ne bloque que si le canal a une capacité bornée et qu'elle est pleine, sinon il continue d'avancer pendant que le consommateur travaille en parallèle.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    // Producteur : génère des nombres.\n    let producteur = thread::spawn(move || {\n        for n in 1..=5 {\n            tx.send(n * n).unwrap();\n        }\n    });\n\n    // Consommateur : traite chaque résultat au fil de l'eau.\n    let consommateur = thread::spawn(move || {\n        let mut total = 0;\n        for carre in rx {\n            total += carre;\n        }\n        total\n    });\n\n    producteur.join().unwrap();\n    let total = consommateur.join().unwrap();\n    println!(\"somme des carrés : {total}\");\n}",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch16-ex1",
      title: "Trois threads qui renvoient une valeur",
      difficulty: "facile",
      prompt:
        "Écris une fonction `carres_en_threads` qui reçoit un `Vec<i64>` de 3 nombres, lance un thread par nombre pour calculer son carré, puis renvoie un `Vec<i64>` contenant les 3 carrés **dans le même ordre** que l'entrée.",
      hints: [
        "Lance les threads dans une boucle et stocke les `JoinHandle` dans un `Vec`.",
        "Utilise `move` pour capturer chaque nombre dans sa closure.",
        "Fais un premier passage pour lancer tous les threads, puis un second pour les `join` dans l'ordre.",
      ],
      starter:
        "use std::thread;\n\nfn carres_en_threads(nombres: Vec<i64>) -> Vec<i64> {\n    todo!()\n}",
      solution:
        "use std::thread;\n\nfn carres_en_threads(nombres: Vec<i64>) -> Vec<i64> {\n    let handles: Vec<_> = nombres\n        .into_iter()\n        .map(|n| thread::spawn(move || n * n))\n        .collect();\n\n    handles\n        .into_iter()\n        .map(|h| h.join().unwrap())\n        .collect()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn calcule_les_trois_carres() {\n        assert_eq!(carres_en_threads(vec![2, 3, 4]), vec![4, 9, 16]);\n    }\n\n    #[test]\n    fn conserve_l_ordre() {\n        assert_eq!(carres_en_threads(vec![5, 1, 10]), vec![25, 1, 100]);\n    }\n\n    #[test]\n    fn gere_les_negatifs() {\n        assert_eq!(carres_en_threads(vec![-3, 0, 2]), vec![9, 0, 4]);\n    }\n}",
    },
    {
      id: "ch16-ex2",
      title: "Additionner via un canal",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `somme_via_canal` qui reçoit un `Vec<i64>`, envoie chaque élément dans un canal `mpsc` depuis un thread séparé, puis calcule la somme en itérant sur le récepteur dans le thread appelant.",
      hints: [
        "Le thread producteur doit posséder le `Vec` (`move`).",
        "N'oublie pas que le canal se ferme automatiquement quand `tx` sort de portée à la fin du thread producteur.",
        "`rx.iter().sum()` fait le calcul en une ligne.",
      ],
      starter:
        "use std::sync::mpsc;\nuse std::thread;\n\nfn somme_via_canal(nombres: Vec<i64>) -> i64 {\n    todo!()\n}",
      solution:
        "use std::sync::mpsc;\nuse std::thread;\n\nfn somme_via_canal(nombres: Vec<i64>) -> i64 {\n    let (tx, rx) = mpsc::channel();\n\n    thread::spawn(move || {\n        for n in nombres {\n            tx.send(n).unwrap();\n        }\n        // `tx` est abandonné ici : le canal se ferme.\n    });\n\n    rx.iter().sum()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn somme_une_liste_normale() {\n        assert_eq!(somme_via_canal(vec![1, 2, 3, 4, 5]), 15);\n    }\n\n    #[test]\n    fn somme_liste_vide() {\n        assert_eq!(somme_via_canal(vec![]), 0);\n    }\n\n    #[test]\n    fn somme_avec_negatifs() {\n        assert_eq!(somme_via_canal(vec![-10, 5, 5]), 0);\n    }\n}",
    },
    {
      id: "ch16-ex3",
      title: "Compteur partagé",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `incrementer_n_fois` qui lance `n` threads, chacun incrémentant une seule fois un compteur partagé protégé par `Arc<Mutex<i64>>`, attend leur fin, puis renvoie la valeur finale du compteur.",
      hints: [
        "Clone l'`Arc` avant de le déplacer dans chaque thread : `Arc::clone(&compteur)`.",
        "`*compteur.lock().unwrap() += 1;` incrémente la valeur protégée.",
        "Stocke tous les `JoinHandle` et fais un `join` sur chacun avant de lire la valeur finale.",
      ],
      starter:
        "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn incrementer_n_fois(n: usize) -> i64 {\n    todo!()\n}",
      solution:
        "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn incrementer_n_fois(n: usize) -> i64 {\n    let compteur = Arc::new(Mutex::new(0i64));\n    let mut handles = Vec::with_capacity(n);\n\n    for _ in 0..n {\n        let compteur = Arc::clone(&compteur);\n        handles.push(thread::spawn(move || {\n            let mut valeur = compteur.lock().unwrap();\n            *valeur += 1;\n        }));\n    }\n\n    for handle in handles {\n        handle.join().unwrap();\n    }\n\n    let resultat = *compteur.lock().unwrap();\n    resultat\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn incremente_dix_fois() {\n        assert_eq!(incrementer_n_fois(10), 10);\n    }\n\n    #[test]\n    fn zero_thread_donne_zero() {\n        assert_eq!(incrementer_n_fois(0), 0);\n    }\n\n    #[test]\n    fn incremente_beaucoup_de_fois() {\n        assert_eq!(incrementer_n_fois(200), 200);\n    }\n}",
    },
  ],
  project: {
    id: "ch16-projet",
    title: "Somme parallèle",
    difficulty: "difficile",
    prompt:
      "Construis une fonction `somme_parallele(donnees: Vec<i64>, n_threads: usize) -> i64` qui découpe `donnees` en (au plus) `n_threads` tranches à peu près égales, calcule la somme de chaque tranche dans un thread séparé partageant les données via `Arc`, puis additionne les résultats partiels renvoyés par chaque thread pour obtenir la somme totale. Le résultat doit toujours être identique à une somme séquentielle simple, quel que soit `n_threads` (y compris 0 ou 1, ou un nombre de threads supérieur à la taille des données).",
    hints: [
      "Enveloppe les données dans un `Arc<Vec<i64>>` pour les partager en lecture seule entre threads, sans les copier.",
      "Calcule la taille de chaque tranche avec une division entière arrondie vers le haut : `(len + n_threads - 1) / n_threads`.",
      "Utilise les indices de début/fin de chaque tranche plutôt que de découper un `Vec` non partagé ; chaque thread peut lire l'`Arc` cloné et sommer seulement sa portion.",
      "Traite `n_threads == 0` ou `donnees.is_empty()` comme des cas particuliers qui renvoient directement la somme séquentielle (ou 0).",
    ],
    starter:
      "use std::sync::Arc;\nuse std::thread;\n\nfn somme_parallele(donnees: Vec<i64>, n_threads: usize) -> i64 {\n    todo!()\n}",
    solution:
      "use std::sync::Arc;\nuse std::thread;\n\nfn somme_parallele(donnees: Vec<i64>, n_threads: usize) -> i64 {\n    if donnees.is_empty() || n_threads == 0 {\n        return donnees.iter().sum();\n    }\n\n    let partage = Arc::new(donnees);\n    let len = partage.len();\n    // Taille de tranche arrondie vers le haut, pour couvrir tous les éléments\n    // même quand len n'est pas un multiple de n_threads.\n    let taille_tranche = (len + n_threads - 1) / n_threads;\n\n    let mut handles = Vec::new();\n    let mut debut = 0;\n\n    while debut < len {\n        let fin = usize::min(debut + taille_tranche, len);\n        let partage = Arc::clone(&partage);\n\n        handles.push(thread::spawn(move || -> i64 {\n            partage[debut..fin].iter().sum()\n        }));\n\n        debut = fin;\n    }\n\n    handles\n        .into_iter()\n        .map(|h| h.join().unwrap())\n        .sum()\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn somme_sequentielle(donnees: &[i64]) -> i64 {\n        donnees.iter().sum()\n    }\n\n    #[test]\n    fn egale_la_somme_sequentielle_avec_plusieurs_threads() {\n        let donnees: Vec<i64> = (1..=100).collect();\n        assert_eq!(somme_parallele(donnees.clone(), 4), somme_sequentielle(&donnees));\n    }\n\n    #[test]\n    fn fonctionne_avec_un_seul_thread() {\n        let donnees = vec![10, 20, 30, 40, 50];\n        assert_eq!(somme_parallele(donnees.clone(), 1), somme_sequentielle(&donnees));\n    }\n\n    #[test]\n    fn fonctionne_quand_il_y_a_plus_de_threads_que_d_elements() {\n        let donnees = vec![1, 2, 3];\n        assert_eq!(somme_parallele(donnees.clone(), 10), somme_sequentielle(&donnees));\n    }\n\n    #[test]\n    fn gere_les_donnees_vides() {\n        assert_eq!(somme_parallele(vec![], 4), 0);\n    }\n\n    #[test]\n    fn gere_zero_thread_comme_cas_particulier() {\n        let donnees = vec![5, 5, 5];\n        assert_eq!(somme_parallele(donnees.clone(), 0), somme_sequentielle(&donnees));\n    }\n\n    #[test]\n    fn gere_les_nombres_negatifs() {\n        let donnees = vec![-5, 10, -15, 20, -25, 30];\n        assert_eq!(somme_parallele(donnees.clone(), 3), somme_sequentielle(&donnees));\n    }\n}",
  },
  keyTakeaways: [
    "thread::spawn lance un thread ; handle.join() attend son résultat.",
    "move transfère la propriété des variables capturées dans une closure de thread.",
    "Un canal mpsc (channel, send, recv) fait communiquer des threads sans mémoire partagée directe ; clone(tx) permet plusieurs producteurs.",
    "Mutex<T> garantit un accès exclusif à une valeur ; Arc<T> permet de partager sa propriété entre threads (Rc<T> ne le permet pas).",
    "Arc<Mutex<T>> est le duo standard pour un état mutable partagé entre threads.",
    "Les traits Send (transférable entre threads) et Sync (référençable depuis plusieurs threads) sont vérifiés à la compilation : une donnée non thread-safe ne compile tout simplement pas.",
    "Rust élimine les data races par construction, mais pas les interblocages : l'ordre de verrouillage reste ta responsabilité.",
  ],
};
