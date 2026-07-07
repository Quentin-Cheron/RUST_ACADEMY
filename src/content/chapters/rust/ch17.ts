import type { Chapter } from "../../types";

export const ch17: Chapter = {
  number: 17,
  slug: "async-await",
  title: "La programmation asynchrone",
  subtitle: "Futures, async/await et runtimes — la concurrence sans threads.",
  description:
    "Les threads sont parfaits pour le calcul parallèle, mais coûteux quand on attend surtout des entrées/sorties : réseau, fichiers, timers. La programmation asynchrone permet de gérer des milliers d'opérations « en attente » sur un petit nombre de threads. Dans ce chapitre, tu découvres les futures, la syntaxe `async`/`.await`, le rôle d'un runtime comme tokio, et les outils pour exécuter plusieurs tâches en concurrence : `join`, `select`, tâches détachées et canaux asynchrones.",
  minutes: 60,
  rustBookRef: "Chapitre 17 — Fundamentals of Asynchronous Programming: Async, Await, Futures, and Streams",
  objectives: [
    "Comprendre ce qu'est une future et pourquoi elle est paresseuse",
    "Écrire des fonctions async et enchaîner des opérations avec .await",
    "Expliquer le rôle d'un runtime (tokio) et pourquoi il est indispensable",
    "Exécuter plusieurs futures en concurrence avec join!",
    "Réagir à la première future terminée avec select! et gérer les timeouts",
    "Lancer des tâches détachées avec spawn et communiquer par canaux async",
    "Choisir entre threads et async selon la nature du travail (CPU vs I/O)",
  ],
  sections: [
    {
      id: "futures",
      number: "17.1",
      title: "Futures : des calculs en attente",
      blocks: [
        {
          type: "paragraph",
          text: "Une **future** est une valeur qui représente un calcul *pas encore terminé*. Elle implémente le trait `Future`, dont la méthode `poll` répond soit `Ready(valeur)` (c'est fini), soit `Pending` (repasse plus tard). Contrairement à un thread qui s'exécute dès son lancement, une future est **paresseuse** : elle ne fait rien tant que personne ne la « poll ».",
        },
        {
          type: "code",
          language: "rust",
          code: "async fn dire_bonjour() -> String {\n    String::from(\"bonjour\")\n}\n\nfn main() {\n    // Ceci NE lance PAS la fonction : on obtient juste une future.\n    let future = dire_bonjour();\n\n    // Sans runtime pour la piloter, la future ne s'exécute jamais.\n    // `future` est simplement abandonnée ici.\n    let _ = future;\n}",
          caption: "Appeler une fonction async ne l'exécute pas : elle renvoie une future inerte.",
        },
        {
          type: "callout",
          variant: "info",
          title: "async = sucre syntaxique",
          text: "Écrire `async fn f() -> T` équivaut à écrire `fn f() -> impl Future<Output = T>`. Le compilateur transforme le corps de la fonction en une machine à états : chaque `.await` est un point où l'exécution peut se mettre en pause puis reprendre.",
        },
        {
          type: "paragraph",
          text: "C'est la grande différence avec les threads : un thread est planifié par le système d'exploitation, alors qu'une future est un simple objet en mémoire. On peut en créer des millions sans coût notable — c'est ce qui rend l'async si adapté aux serveurs qui gèrent beaucoup de connexions simultanées.",
        },
      ],
    },
    {
      id: "await-runtime",
      number: "17.1",
      title: ".await et le runtime",
      blocks: [
        {
          type: "paragraph",
          text: "À l'intérieur d'une fonction `async`, l'opérateur `.await` attend le résultat d'une autre future **sans bloquer le thread** : pendant l'attente, le runtime peut faire avancer d'autres tâches. Mais qui pilote tout ça ? Le **runtime** (ou exécuteur). Rust n'en fournit pas dans la bibliothèque standard : on utilise une crate comme **tokio**, la plus répandue.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::time::Duration;\n\nasync fn preparer_cafe() -> &'static str {\n    tokio::time::sleep(Duration::from_millis(10)).await;\n    \"café prêt\"\n}\n\n#[tokio::main]\nasync fn main() {\n    // #[tokio::main] démarre le runtime et exécute cette future racine.\n    let resultat = preparer_cafe().await;\n    println!(\"{resultat}\");\n}",
          caption: "L'attribut #[tokio::main] transforme main en point d'entrée async.",
        },
        {
          type: "list",
          items: [
            ".await ne peut s'utiliser QUE dans un contexte async (fn async ou bloc async).",
            "tokio::time::sleep est la version async de thread::sleep : elle rend la main au runtime au lieu de bloquer le thread.",
            "Le runtime fait tourner un petit pool de threads et y multiplexe toutes les tâches en attente.",
            "Ne jamais appeler une fonction bloquante (thread::sleep, I/O synchrone lourde) dans du code async : cela gèle toutes les tâches du même thread.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Bloquer un runtime est un piège classique",
          text: "Si une tâche async appelle `std::thread::sleep(1s)`, le thread du runtime est gelé une seconde entière : aucune autre tâche ne progresse. Pour du travail vraiment bloquant (calcul lourd, API synchrone), tokio fournit `spawn_blocking` qui délègue à un pool de threads dédié.",
        },
      ],
    },
    {
      id: "join",
      number: "17.2",
      title: "Concurrence avec join!",
      blocks: [
        {
          type: "paragraph",
          text: "Attendre deux futures l'une après l'autre (`a.await` puis `b.await`) les exécute **séquentiellement**. Pour les faire progresser **en même temps**, on utilise `tokio::join!` (ou `futures::join!`) : la macro poll toutes les futures en alternance et rend la main quand *toutes* sont terminées.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::time::Duration;\nuse tokio::time::sleep;\n\nasync fn tache(nom: &str, ms: u64) -> String {\n    sleep(Duration::from_millis(ms)).await;\n    format!(\"{nom} terminé\")\n}\n\n#[tokio::main]\nasync fn main() {\n    // Séquentiel : ~30 ms au total.\n    let a = tache(\"A\", 10).await;\n    let b = tache(\"B\", 20).await;\n\n    // Concurrent : ~20 ms au total (la plus lente des deux).\n    let (c, d) = tokio::join!(tache(\"C\", 10), tache(\"D\", 20));\n\n    println!(\"{a}, {b}, {c}, {d}\");\n}",
          caption: "join! exécute les futures en concurrence et renvoie un tuple de résultats.",
        },
        {
          type: "paragraph",
          text: "`join!` est de la **concurrence coopérative** sur un même flux d'exécution : les futures se relaient à chaque point d'attente. Ce n'est pas forcément du parallélisme (plusieurs cœurs), mais pour de l'attente d'I/O c'est exactement ce qu'il faut : pendant que l'une attend le réseau, l'autre avance.",
        },
        {
          type: "usecase",
          title: "Agréger plusieurs sources de données",
          text: "Une page d'accueil doit afficher le profil utilisateur, ses notifications et ses messages — trois appels d'API indépendants de ~100 ms chacun. En séquentiel : 300 ms. Avec `join!` : ~100 ms, la durée du plus lent. C'est le réflexe n°1 pour accélérer un service qui dépend de plusieurs appels réseau.",
        },
      ],
    },
    {
      id: "spawn-canaux",
      number: "17.2",
      title: "Tâches détachées et canaux async",
      blocks: [
        {
          type: "paragraph",
          text: "`tokio::spawn` est l'équivalent async de `thread::spawn` : il confie une future au runtime, qui l'exécute en arrière-plan, et renvoie un `JoinHandle` qu'on peut `.await` pour récupérer le résultat. Comme pour les threads, la future doit posséder ses données (`move`) et être `Send` si le runtime est multi-threadé — les règles d'ownership du chapitre 4 et les traits du chapitre 16 s'appliquent à l'identique.",
        },
        {
          type: "code",
          language: "rust",
          code: "#[tokio::main]\nasync fn main() {\n    let handle = tokio::spawn(async {\n        // Cette tâche vit sa vie en arrière-plan.\n        let somme: i64 = (1..=100).sum();\n        somme\n    });\n\n    // .await sur le handle : Result car la tâche peut paniquer.\n    let somme = handle.await.unwrap();\n    println!(\"somme = {somme}\");\n}",
          caption: "spawn lance une tâche concurrente ; handle.await récupère sa valeur.",
        },
        {
          type: "paragraph",
          text: "Pour faire communiquer des tâches, tokio fournit des canaux async : `tokio::sync::mpsc` (multi-producteurs, comme au chapitre 16, mais `recv` est une future) et `oneshot` (une seule valeur, une seule fois). Recevoir avec `.await` ne bloque pas le thread : la tâche s'endort et le runtime la réveille à l'arrivée d'un message.",
        },
        {
          type: "code",
          language: "rust",
          code: "use tokio::sync::mpsc;\n\n#[tokio::main]\nasync fn main() {\n    let (tx, mut rx) = mpsc::channel(16);\n\n    tokio::spawn(async move {\n        for n in 1..=5 {\n            tx.send(n * n).await.unwrap();\n        }\n        // tx est abandonné : le canal se ferme.\n    });\n\n    let mut total = 0;\n    while let Some(carre) = rx.recv().await {\n        total += carre;\n    }\n    println!(\"total : {total}\");\n}",
          caption: "Producteur/consommateur async : même patron qu'au chapitre 16, sans bloquer.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Streams : des itérateurs asynchrones",
          text: "Le pendant async d'`Iterator` s'appelle `Stream` : une séquence de valeurs qui arrivent au fil du temps (messages d'un canal, lignes d'une connexion réseau). La boucle `while let Some(x) = rx.recv().await` ci-dessus consomme déjà un flux ; la crate `futures` fournit `StreamExt` avec les adaptateurs familiers du chapitre 13 (map, filter, take…).",
        },
      ],
    },
    {
      id: "select-timeout",
      number: "17.3",
      title: "select! : la première qui répond gagne",
      blocks: [
        {
          type: "paragraph",
          text: "Parfois on ne veut pas attendre *toutes* les futures, mais seulement **la première** qui se termine : course entre deux serveurs miroirs, attente d'un message *ou* d'un signal d'arrêt, timeout. C'est le rôle de `tokio::select!` : les autres branches sont annulées (leurs futures sont simplement abandonnées).",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::time::Duration;\nuse tokio::time::sleep;\n\n#[tokio::main]\nasync fn main() {\n    let rapide = async {\n        sleep(Duration::from_millis(10)).await;\n        \"rapide\"\n    };\n    let lent = async {\n        sleep(Duration::from_millis(100)).await;\n        \"lent\"\n    };\n\n    tokio::select! {\n        gagnant = rapide => println!(\"vainqueur : {gagnant}\"),\n        gagnant = lent => println!(\"vainqueur : {gagnant}\"),\n    }\n}",
          caption: "select! attend la première branche prête et abandonne les autres.",
        },
        {
          type: "paragraph",
          text: "Le cas d'usage le plus courant est le **timeout** : courir une opération contre un timer. tokio le fournit directement avec `tokio::time::timeout`, qui renvoie `Result<T, Elapsed>` — `Ok` si l'opération finit à temps, `Err` sinon. On retrouve la gestion d'erreurs du chapitre 9 appliquée au temps.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::time::Duration;\nuse tokio::time::{sleep, timeout};\n\n#[tokio::main]\nasync fn main() {\n    let operation_lente = async {\n        sleep(Duration::from_millis(200)).await;\n        42\n    };\n\n    match timeout(Duration::from_millis(50), operation_lente).await {\n        Ok(valeur) => println!(\"reçu : {valeur}\"),\n        Err(_) => println!(\"trop lent, on abandonne\"),\n    }\n}",
          caption: "timeout combine une future et une échéance en un Result.",
        },
      ],
    },
    {
      id: "streams",
      number: "17.4",
      title: "Les streams : des itérateurs asynchrones",
      blocks: [
        {
          type: "paragraph",
          text: "Un `Stream` est le pendant asynchrone d'un `Iterator` : une séquence de valeurs qui arrivent **au fil du temps** (messages d'un canal, lignes lues sur le réseau, ticks d'un timer). Là où `Iterator::next` renvoie tout de suite, `StreamExt::next` renvoie une future qu'on `.await`. La crate `futures` fournit le trait et tous les adaptateurs familiers du chapitre 13.",
        },
        {
          type: "code",
          language: "rust",
          code: "use futures::stream::{self, StreamExt};\n\n#[tokio::main]\nasync fn main() {\n    // Un stream à partir d'un itérateur, pour s'entraîner.\n    let flux = stream::iter(1..=5);\n\n    // map / collect comme au chapitre 13, mais en async.\n    let carres: Vec<i32> = flux.map(|n| n * n).collect().await;\n    println!(\"{carres:?}\"); // [1, 4, 9, 16, 25]\n}",
          caption: "stream::iter + StreamExt : les adaptateurs d'itérateurs, version async.",
        },
        {
          type: "paragraph",
          text: "Pour consommer un stream élément par élément, on écrit `while let Some(valeur) = flux.next().await { ... }` — exactement la boucle qu'on utilisait déjà avec `rx.recv().await` : un récepteur de canal *est* un flux de messages. Chaque `.await` rend la main au runtime, qui peut faire avancer d'autres tâches entre deux éléments.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Pas de boucle for asynchrone",
          text: "La boucle `for` de Rust ne sait parcourir que des `Iterator`. Pour un `Stream`, la forme idiomatique reste `while let Some(x) = flux.next().await`. Pense aussi à `futures::pin_mut!` ou `Box::pin` si le compilateur te demande d'épingler le stream avant de le consommer.",
        },
      ],
    },
    {
      id: "futures-sous-le-capot",
      number: "17.5",
      title: "Sous le capot : Future, Pin et Unpin",
      blocks: [
        {
          type: "paragraph",
          text: "Une `async fn` n'est que du sucre syntaxique : le compilateur la transforme en **machine à états** qui implémente le trait `Future`. Le runtime fait avancer cette machine en appelant `poll` : soit le travail est fini (`Poll::Ready(valeur)`), soit il faut attendre (`Poll::Pending`) et la tâche s'endort jusqu'à ce que le `Waker` la réveille.",
        },
        {
          type: "code",
          language: "rust",
          code: "// Le trait au cœur de tout l'async Rust (simplifié) :\npub trait Future {\n    type Output;\n\n    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;\n}\n\npub enum Poll<T> {\n    Ready(T),   // la valeur est prête\n    Pending,    // pas encore : le Waker préviendra le runtime\n}",
          caption: "Chaque .await compile vers des appels à poll orchestrés par le runtime.",
        },
        {
          type: "paragraph",
          text: "Et ce `Pin` ? La machine à états générée peut contenir des références vers ses propres champs (une variable locale empruntée de part et d'autre d'un `.await`). La déplacer en mémoire invaliderait ces références : `Pin` **épingle** la future à son emplacement pour l'interdire. La plupart des types ordinaires implémentent `Unpin` (les épingler ne change rien) ; on croise surtout `Pin<Box<dyn Future<Output = T>>>` pour stocker des futures hétérogènes.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Ce qu'il faut retenir en pratique",
          text: "Tu n'implémenteras presque jamais `Future` à la main : `async`/`.await` s'en chargent. Retiens simplement que `poll`/`Waker` expliquent pourquoi une future ne fait **rien** tant qu'on ne l'`.await` pas, et que `Pin` apparaît dans les signatures dès qu'on manipule des futures en tant que valeurs.",
        },
      ],
    },
    {
      id: "threads-vs-async",
      number: "17.6",
      title: "Threads ou async : comment choisir ?",
      blocks: [
        {
          type: "list",
          items: [
            "Travail dominé par le CPU (calculs, compression, image) : threads — le parallélisme réel sur plusieurs cœurs est ce qui compte.",
            "Travail dominé par l'attente (réseau, base de données, timers, des milliers de connexions) : async — des tâches quasi gratuites multiplexées sur peu de threads.",
            "Les deux se combinent : un serveur async peut déléguer ses calculs lourds à spawn_blocking ou à un pool de threads.",
            "L'async « contamine » : une fn async ne peut être attendue que depuis de l'async. Beaucoup d'écosystèmes (serveurs web, clients HTTP) sont async de bout en bout.",
          ],
        },
        {
          type: "usecase",
          title: "Un serveur qui tient 10 000 connexions",
          text: "Un chat en ligne garde 10 000 connexions ouvertes, presque toutes silencieuses à un instant donné. Avec un thread par connexion : 10 000 piles mémoire et un ordonnanceur OS saturé. Avec async : 10 000 tâches légères en attente sur `recv().await`, réveillées uniquement quand un message arrive, le tout sur une poignée de threads. C'est le modèle de tokio, utilisé par Discord, AWS ou Cloudflare.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Et le chapitre suivant ?",
          text: "Le projet final du cours (chapitre 21) construit volontairement un serveur web **avec des threads**, pour comprendre la mécanique de base. Les serveurs de production en Rust (axum, actix-web) reposent, eux, sur tokio et tout ce que tu viens d'apprendre.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch17-ex1",
      title: "Premières fonctions async",
      difficulty: "facile",
      prompt:
        "Écris une fonction async `doubler` qui reçoit un `i64` et le renvoie multiplié par 2, puis une fonction async `doubler_deux_fois` qui applique `doubler` deux fois de suite en utilisant `.await`.",
      hints: [
        "Une fonction async se déclare avec `async fn` et se consomme avec `.await`.",
        "Dans `doubler_deux_fois`, appelle `doubler(n).await` puis réutilise le résultat.",
        "Les tests utilisent `#[tokio::test]` pour fournir un runtime.",
      ],
      starter:
        "async fn doubler(n: i64) -> i64 {\n    todo!()\n}\n\nasync fn doubler_deux_fois(n: i64) -> i64 {\n    todo!()\n}",
      solution:
        "async fn doubler(n: i64) -> i64 {\n    n * 2\n}\n\nasync fn doubler_deux_fois(n: i64) -> i64 {\n    let une_fois = doubler(n).await;\n    doubler(une_fois).await\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[tokio::test]\n    async fn doubler_fonctionne() {\n        assert_eq!(doubler(21).await, 42);\n        assert_eq!(doubler(-5).await, -10);\n    }\n\n    #[tokio::test]\n    async fn doubler_deux_fois_fonctionne() {\n        assert_eq!(doubler_deux_fois(3).await, 12);\n        assert_eq!(doubler_deux_fois(0).await, 0);\n    }\n}",
    },
    {
      id: "ch17-ex2",
      title: "Deux tâches en concurrence avec join!",
      difficulty: "moyen",
      prompt:
        "Écris une fonction async `somme_et_produit` qui reçoit un `Vec<i64>` et calcule **en concurrence** la somme et le produit de ses éléments (deux blocs async combinés avec `tokio::join!`), puis renvoie le tuple `(somme, produit)`.",
      hints: [
        "Crée deux blocs `async { ... }` : l'un calcule la somme, l'autre le produit.",
        "`tokio::join!(a, b)` renvoie un tuple avec les deux résultats.",
        "Attention à l'ownership : itère sur des références (`nombres.iter()`) pour que les deux blocs puissent lire le même Vec.",
      ],
      starter:
        "async fn somme_et_produit(nombres: Vec<i64>) -> (i64, i64) {\n    todo!()\n}",
      solution:
        "async fn somme_et_produit(nombres: Vec<i64>) -> (i64, i64) {\n    let somme = async {\n        nombres.iter().sum::<i64>()\n    };\n    let produit = async {\n        nombres.iter().product::<i64>()\n    };\n\n    tokio::join!(somme, produit)\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[tokio::test]\n    async fn calcule_somme_et_produit() {\n        assert_eq!(somme_et_produit(vec![1, 2, 3, 4]).await, (10, 24));\n    }\n\n    #[tokio::test]\n    async fn liste_vide() {\n        assert_eq!(somme_et_produit(vec![]).await, (0, 1));\n    }\n\n    #[tokio::test]\n    async fn avec_negatifs() {\n        assert_eq!(somme_et_produit(vec![-2, 3]).await, (1, -6));\n    }\n}",
    },
    {
      id: "ch17-ex3",
      title: "Timeout sur une opération lente",
      difficulty: "moyen",
      prompt:
        "Écris une fonction async `avec_limite` qui reçoit une durée de travail `travail_ms` et une limite `limite_ms`. Elle simule le travail avec `tokio::time::sleep`, l'enveloppe dans `tokio::time::timeout`, et renvoie `Ok(\"terminé\")` si le travail finit à temps, ou `Err(\"trop lent\")` sinon.",
      hints: [
        "`timeout(duree, future).await` renvoie `Result<T, Elapsed>`.",
        "Construis les `Duration` avec `Duration::from_millis`.",
        "Transforme le `Result` de tokio en ton propre `Result<&str, &str>` avec un match ou `map`/`map_err`.",
      ],
      starter:
        "use std::time::Duration;\nuse tokio::time::{sleep, timeout};\n\nasync fn avec_limite(travail_ms: u64, limite_ms: u64) -> Result<&'static str, &'static str> {\n    todo!()\n}",
      solution:
        "use std::time::Duration;\nuse tokio::time::{sleep, timeout};\n\nasync fn avec_limite(travail_ms: u64, limite_ms: u64) -> Result<&'static str, &'static str> {\n    let travail = async {\n        sleep(Duration::from_millis(travail_ms)).await;\n        \"terminé\"\n    };\n\n    match timeout(Duration::from_millis(limite_ms), travail).await {\n        Ok(message) => Ok(message),\n        Err(_) => Err(\"trop lent\"),\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[tokio::test]\n    async fn finit_a_temps() {\n        assert_eq!(avec_limite(5, 100).await, Ok(\"terminé\"));\n    }\n\n    #[tokio::test]\n    async fn depasse_la_limite() {\n        assert_eq!(avec_limite(100, 5).await, Err(\"trop lent\"));\n    }\n}",
    },
    {
      id: "ch17-ex4",
      title: "Pipeline sur un stream",
      difficulty: "moyen",
      prompt:
        "Écris une fonction async `carres_des_pairs` qui reçoit un `Vec<i64>`, le transforme en stream avec `futures::stream::iter`, garde les nombres **pairs**, les met **au carré**, et collecte le résultat dans un `Vec<i64>`.",
      hints: [
        "Importe `futures::stream::{self, StreamExt}` pour avoir accès aux adaptateurs.",
        "La closure de `StreamExt::filter` doit renvoyer une *future* : enveloppe ton booléen avec `futures::future::ready(...)`.",
        "Termine par `.collect::<Vec<i64>>().await` — comme au chapitre 13, collect est le consommateur.",
      ],
      starter:
        "use futures::stream::{self, StreamExt};\n\nasync fn carres_des_pairs(nombres: Vec<i64>) -> Vec<i64> {\n    todo!()\n}",
      solution:
        "use futures::stream::{self, StreamExt};\n\nasync fn carres_des_pairs(nombres: Vec<i64>) -> Vec<i64> {\n    stream::iter(nombres)\n        .filter(|n| futures::future::ready(n % 2 == 0))\n        .map(|n| n * n)\n        .collect()\n        .await\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[tokio::test]\n    async fn filtre_et_met_au_carre() {\n        assert_eq!(carres_des_pairs(vec![1, 2, 3, 4, 5]).await, vec![4, 16]);\n    }\n\n    #[tokio::test]\n    async fn liste_vide() {\n        assert_eq!(carres_des_pairs(vec![]).await, Vec::<i64>::new());\n    }\n\n    #[tokio::test]\n    async fn negatifs_pairs_inclus() {\n        assert_eq!(carres_des_pairs(vec![-2, -1, 0]).await, vec![4, 0]);\n    }\n}",
    },
  ],
  project: {
    id: "ch17-projet",
    title: "Mini pipeline de téléchargements simulés",
    difficulty: "difficile",
    prompt:
      "Construis un pipeline async qui « télécharge » des fichiers en concurrence. Écris : 1) une fonction async `telecharger` qui reçoit un nom (`String`) et une taille `ko` (`u64`), attend `ko` millisecondes avec `sleep` (simulation), puis renvoie `format!(\"{nom}:{ko}ko\")` ; 2) une fonction async `tout_telecharger` qui reçoit un `Vec<(String, u64)>`, lance chaque téléchargement dans une tâche `tokio::spawn`, attend tous les handles, et renvoie le `Vec<String>` des résultats **dans le même ordre** que l'entrée ; 3) une fonction async `total_ko` qui reçoit le même `Vec<(String, u64)>` et calcule la somme des tailles via un canal `mpsc` : une tâche productrice envoie chaque taille, la fonction consomme le canal avec `recv().await`.",
    hints: [
      "Dans `tout_telecharger`, fais un premier passage pour lancer tous les `spawn`, stocke les handles dans un Vec, puis `.await` chaque handle dans l'ordre.",
      "`handle.await` renvoie un `Result` : utilise `.unwrap()` pour ce projet.",
      "Pour `total_ko`, crée le canal avec `mpsc::channel(16)`, déplace l'émetteur dans la tâche productrice avec `async move`, et boucle avec `while let Some(taille) = rx.recv().await`.",
      "Le canal se ferme quand l'émetteur est abandonné à la fin de la tâche productrice — la boucle `while let` se termine alors toute seule.",
    ],
    starter:
      "use std::time::Duration;\nuse tokio::sync::mpsc;\nuse tokio::time::sleep;\n\nasync fn telecharger(nom: String, ko: u64) -> String {\n    todo!()\n}\n\nasync fn tout_telecharger(fichiers: Vec<(String, u64)>) -> Vec<String> {\n    todo!()\n}\n\nasync fn total_ko(fichiers: Vec<(String, u64)>) -> u64 {\n    todo!()\n}",
    solution:
      "use std::time::Duration;\nuse tokio::sync::mpsc;\nuse tokio::time::sleep;\n\nasync fn telecharger(nom: String, ko: u64) -> String {\n    // Simule la durée du transfert : 1 ms par ko.\n    sleep(Duration::from_millis(ko)).await;\n    format!(\"{nom}:{ko}ko\")\n}\n\nasync fn tout_telecharger(fichiers: Vec<(String, u64)>) -> Vec<String> {\n    // 1er passage : tout lancer en concurrence.\n    let handles: Vec<_> = fichiers\n        .into_iter()\n        .map(|(nom, ko)| tokio::spawn(telecharger(nom, ko)))\n        .collect();\n\n    // 2e passage : récolter dans l'ordre de lancement.\n    let mut resultats = Vec::with_capacity(handles.len());\n    for handle in handles {\n        resultats.push(handle.await.unwrap());\n    }\n    resultats\n}\n\nasync fn total_ko(fichiers: Vec<(String, u64)>) -> u64 {\n    let (tx, mut rx) = mpsc::channel(16);\n\n    tokio::spawn(async move {\n        for (_nom, ko) in fichiers {\n            tx.send(ko).await.unwrap();\n        }\n        // tx abandonné ici : le canal se ferme.\n    });\n\n    let mut total = 0;\n    while let Some(ko) = rx.recv().await {\n        total += ko;\n    }\n    total\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn fichiers_exemple() -> Vec<(String, u64)> {\n        vec![\n            (String::from(\"a.txt\"), 30),\n            (String::from(\"b.txt\"), 10),\n            (String::from(\"c.txt\"), 20),\n        ]\n    }\n\n    #[tokio::test]\n    async fn telecharger_formate_le_resultat() {\n        assert_eq!(telecharger(String::from(\"x.bin\"), 5).await, \"x.bin:5ko\");\n    }\n\n    #[tokio::test]\n    async fn tout_telecharger_conserve_l_ordre() {\n        let resultats = tout_telecharger(fichiers_exemple()).await;\n        assert_eq!(resultats, vec![\"a.txt:30ko\", \"b.txt:10ko\", \"c.txt:20ko\"]);\n    }\n\n    #[tokio::test]\n    async fn tout_telecharger_liste_vide() {\n        let resultats = tout_telecharger(vec![]).await;\n        assert!(resultats.is_empty());\n    }\n\n    #[tokio::test]\n    async fn total_ko_via_canal() {\n        assert_eq!(total_ko(fichiers_exemple()).await, 60);\n    }\n\n    #[tokio::test]\n    async fn total_ko_liste_vide() {\n        assert_eq!(total_ko(vec![]).await, 0);\n    }\n}",
  },
  keyTakeaways: [
    "Une future est paresseuse : sans runtime pour la poller, elle ne s'exécute jamais.",
    "async fn renvoie une future ; .await attend son résultat sans bloquer le thread.",
    "Le runtime (tokio) multiplexe des milliers de tâches légères sur quelques threads.",
    "join! exécute plusieurs futures en concurrence et attend qu'elles finissent toutes.",
    "select! et timeout réagissent à la première future prête — les autres sont annulées.",
    "tokio::spawn lance une tâche détachée ; les canaux async (mpsc, oneshot) les font communiquer.",
    "CPU intensif → threads ; attente d'I/O massive → async. Les deux se combinent.",
  ],
};
