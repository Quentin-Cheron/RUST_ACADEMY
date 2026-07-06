import type { Chapter } from "../types";

export const ch12: Chapter = {
  number: 12,
  slug: "projet-io",
  title: "Projet : un outil en ligne de commande (minigrep)",
  subtitle: "Construire minigrep : arguments, fichiers, logique testable et gestion des erreurs.",
  description:
    "C'est le chapitre où tout s'assemble. On construit `minigrep`, un clone minimaliste de `grep` : il lit des arguments en ligne de commande, ouvre un fichier, et cherche une chaîne dans son contenu. L'objectif n'est pas seulement de faire fonctionner le programme, mais de le structurer proprement : séparer `main.rs` (l'orchestration, l'I/O) de `lib.rs` (la logique métier, pure et testable). C'est le patron que tu réutiliseras dans tous tes projets Rust.",
  minutes: 60,
  rustBookRef: "Chapitre 12 — An I/O Project: Building a Command Line Program",
  objectives: [
    "Lire les arguments de la ligne de commande avec `std::env::args`",
    "Séparer un projet en `main.rs` (I/O) et `lib.rs` (logique testable)",
    "Regrouper la configuration dans une struct `Config` construite via `build() -> Result<Config, &str>`",
    "Lire un fichier avec `std::fs::read_to_string` et gérer l'erreur possible",
    "Écrire des fonctions de recherche pures (`&str -> Vec<&str>`) faciles à tester",
    "Distinguer les messages normaux (stdout) des erreurs (stderr avec `eprintln!`)",
    "Lire une variable d'environnement avec `std::env::var` pour activer un comportement",
  ],
  sections: [
    {
      id: "arguments",
      number: "12.1",
      title: "Lire les arguments de la ligne de commande",
      blocks: [
        {
          type: "paragraph",
          text: "Quand on lance `minigrep chercher poeme.txt`, le système d'exploitation transmet au programme une liste de chaînes : le nom de l'exécutable, puis chaque argument. En Rust, on récupère cette liste avec `std::env::args()`, qui renvoie un itérateur. On le convertit en `Vec<String>` avec `.collect()`.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/main.rs",
          code: 'use std::env;\n\nfn main() {\n    let args: Vec<String> = env::args().collect();\n    // args[0] est le chemin de l\'exécutable, pas un argument utile.\n    println!("{:?}", args);\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "`args[0]` est toujours le nom du programme lui-même, jamais un argument fourni par l'utilisateur. La recherche commence donc à `args[1]`.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Unicode invalide",
          text: "`env::args()` panique si un argument n'est pas de l'UTF-8 valide. Pour accepter n'importe quel argument (y compris invalide), il existe `env::args_os()`, qui renvoie des `OsString`. Pour un outil pédagogique comme minigrep, `args()` suffit largement.",
        },
      ],
    },
    {
      id: "lire-un-fichier",
      number: "12.2",
      title: "Lire un fichier",
      blocks: [
        {
          type: "paragraph",
          text: "Deuxième étape de minigrep : lire le contenu du fichier passé en argument. `std::fs::read_to_string` ouvre un fichier et renvoie son contenu complet dans une `String`, enveloppé dans un `Result` car le fichier peut ne pas exister ou être illisible.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/main.rs",
          code: 'use std::env;\nuse std::fs;\n\nfn main() {\n    let args: Vec<String> = env::args().collect();\n    let chemin = &args[2];\n\n    let contenu = fs::read_to_string(chemin)\n        .expect("impossible de lire le fichier");\n\n    println!("Contenu du fichier :");\n    println!("{contenu}");\n}',
        },
        {
          type: "paragraph",
          text: "À ce stade, `expect` suffit pour avancer, mais un fichier manquant est une erreur **prévisible** venue de l'extérieur : la suite du chapitre remplace ce `expect` par un vrai `Result` propagé, comme vu au chapitre 9.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Et dans le bac à sable ?",
          text: "Le playground qui exécute les exercices n'a pas accès au système de fichiers. C'est pourquoi, dans ce chapitre, les fonctions reçoivent le texte directement en `&str` : la logique est identique, seule la source de la donnée change.",
        },
      ],
    },
    {
      id: "config",
      number: "12.3",
      title: "Regrouper la configuration dans une struct",
      blocks: [
        {
          type: "paragraph",
          text: "Manipuler `args[1]` et `args[2]` directement dans `main` est fragile : rien n'indique ce que représentent ces indices. On regroupe la configuration validée dans une struct `Config`, construite par une fonction associée `build` qui renvoie un `Result` plutôt que de paniquer.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "pub struct Config {\n    pub query: String,\n    pub file_path: String,\n    pub ignore_case: bool,\n}\n\nimpl Config {\n    /// Construit une `Config` à partir des arguments bruts.\n    /// `args[0]` est le nom du programme, on l'ignore.\n    pub fn build(args: &[String]) -> Result<Config, &'static str> {\n        if args.len() < 3 {\n            return Err(\"usage: minigrep <mot> <fichier>\");\n        }\n\n        let query = args[1].clone();\n        let file_path = args[2].clone();\n        // IGNORE_CASE=1 minigrep mot fichier.txt\n        let ignore_case = std::env::var(\"IGNORE_CASE\").is_ok();\n\n        Ok(Config { query, file_path, ignore_case })\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Pourquoi `Result` plutôt qu'un `panic!` dans `build` ? Parce qu'une entrée utilisateur invalide (oublier un argument) n'est pas un bug du programme : c'est un cas attendu, à gérer proprement. On réserve `panic!` aux bugs internes impossibles à récupérer.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`.clone()` sur `args[1]` et `args[2]` est volontairement simple : on duplique les chaînes pour que `Config` en soit propriétaire, sans se battre avec les durées de vie à ce stade. Ce n'est pas la solution la plus performante, mais c'est la plus lisible pour démarrer — on pourrait optimiser plus tard avec des itérateurs.",
        },
      ],
    },
    {
      id: "separer-logique-io",
      number: "12.3",
      title: "Séparer la logique testable de l'I/O",
      blocks: [
        {
          type: "paragraph",
          text: "**C'est l'idée centrale de ce chapitre.** `main.rs` doit rester minimal : il lit les arguments, appelle des fonctions définies dans `lib.rs`, et gère les erreurs. Toute la logique intéressante (lire un fichier, chercher un texte) vit dans `lib.rs`, sous forme de fonctions qu'on peut tester sans lancer le programme entier.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "use std::error::Error;\nuse std::fs;\n\npub fn run(config: Config) -> Result<(), Box<dyn Error>> {\n    let contents = fs::read_to_string(&config.file_path)?;\n\n    let resultats = if config.ignore_case {\n        search_case_insensitive(&config.query, &contents)\n    } else {\n        search(&config.query, &contents)\n    };\n\n    for ligne in resultats {\n        println!(\"{ligne}\");\n    }\n\n    Ok(())\n}",
        },
        {
          type: "paragraph",
          text: "`run` renvoie `Result<(), Box<dyn Error>>` : on ne se soucie pas du type exact de l'erreur (lecture de fichier échouée, etc.), seulement du fait qu'elle implémente `Error`. Le `?` propage automatiquement toute erreur de `read_to_string` vers l'appelant.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/main.rs",
          code: 'use std::env;\nuse std::process;\n\nuse minigrep::Config;\n\nfn main() {\n    let args: Vec<String> = env::args().collect();\n\n    let config = Config::build(&args).unwrap_or_else(|err| {\n        eprintln!(\"Erreur en analysant les arguments : {err}\");\n        process::exit(1);\n    });\n\n    if let Err(e) = minigrep::run(config) {\n        eprintln!(\"Erreur d\'application : {e}\");\n        process::exit(1);\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          title: "stdout vs stderr",
          text: "Les résultats de la recherche vont sur **stdout** (`println!`), car c'est la sortie normale attendue par l'utilisateur ou par un pipe (`minigrep mot fichier.txt > resultats.txt`). Les erreurs vont sur **stderr** (`eprintln!`), pour ne pas polluer une sortie redirigée. Essaie `cargo run -- mot fichier_inexistant.txt 2> erreurs.log` : le message d'erreur finit dans `erreurs.log`, pas à l'écran mélangé aux résultats.",
        },
      ],
    },
    {
      id: "recherche",
      number: "12.4",
      title: "Écrire une logique de recherche pure",
      blocks: [
        {
          type: "paragraph",
          text: "Le cœur de minigrep est une fonction `search` qui prend une requête et un contenu, et renvoie les lignes qui correspondent. Elle ne fait **aucune** I/O : pas de fichier, pas d'argument, juste des `&str` en entrée et un `Vec<&str>` en sortie. C'est ce qui la rend triviale à tester.",
        },
        {
          type: "code",
          language: "rust",
          filename: "src/lib.rs",
          code: "pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    contents\n        .lines()\n        .filter(|ligne| ligne.contains(query))\n        .collect()\n}\n\npub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    let query = query.to_lowercase();\n    contents\n        .lines()\n        .filter(|ligne| ligne.to_lowercase().contains(&query))\n        .collect()\n}",
        },
        {
          type: "paragraph",
          text: "La durée de vie `'a` indique que les lignes renvoyées empruntent `contents`, pas `query` : le résultat vit aussi longtemps que le texte source. C'est le compilateur qui nous force à être explicite sur cette relation — et c'est exactement ce qui évite de renvoyer des références pendantes.",
        },
        {
          type: "code",
          language: "rust",
          code: "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn une_correspondance_sensible_a_la_casse() {\n        let query = \"duct\";\n        let contents = \"Rust:\\nsafe, fast, productive.\\nPick three.\\nDuct tape.\";\n\n        assert_eq!(vec![\"safe, fast, productive.\"], search(query, contents));\n    }\n\n    #[test]\n    fn insensible_a_la_casse_trouve_plus_de_resultats() {\n        let query = \"rUsT\";\n        let contents = \"Rust:\\nsafe, fast, productive.\\nPick three.\\nTrust me.\";\n\n        assert_eq!(vec![\"Rust:\", \"Trust me.\"], search_case_insensitive(query, contents));\n    }\n}",
          caption: "Ces tests s'exécutent en une fraction de seconde, sans jamais toucher au disque.",
        },
        {
          type: "usecase",
          title: "Pourquoi cette séparation change tout pour construire des CLI",
          text: "Sur un vrai projet de ligne de commande (linter, outil de migration, générateur de rapport...), la tentation est de tout écrire dans `main`. Résultat : pour tester la moindre règle métier, il faut lancer le binaire entier avec de vrais fichiers sur disque — lent, fragile, difficile à automatiser en CI. En isolant la logique dans des fonctions pures comme `search`, on obtient une suite de tests instantanée, indépendante du système de fichiers, et on peut réutiliser cette logique dans un autre contexte (une bibliothèque, un serveur, un plugin) sans jamais toucher à `main.rs`.",
        },
      ],
    },
    {
      id: "variables-environnement",
      number: "12.5",
      title: "Configurer via une variable d'environnement",
      blocks: [
        {
          type: "paragraph",
          text: "Beaucoup d'outils en ligne de commande acceptent une configuration via des variables d'environnement, en plus des arguments. `std::env::var` lit une variable et renvoie un `Result<String, VarError>` : `Ok` si elle existe, `Err` sinon. On l'a déjà utilisée dans `Config::build` pour activer `ignore_case`.",
        },
        {
          type: "code",
          language: "bash",
          code: "# recherche sensible à la casse (comportement par défaut)\ncargo run -- toto poeme.txt\n\n# recherche insensible à la casse\nIGNORE_CASE=1 cargo run -- toto poeme.txt",
        },
        {
          type: "paragraph",
          text: "`.is_ok()` transforme le `Result` en booléen : peu importe la valeur de la variable, seule sa présence compte. Pour lire une vraie valeur (une clé d'API, un chemin), on utiliserait plutôt `.unwrap_or_else` ou un `match` explicite.",
        },
        {
          type: "list",
          items: [
            "`env::args()` — arguments positionnels, obligatoires ou optionnels selon la logique de `build`",
            "`env::var(\"NOM\")` — drapeaux ou réglages activables sans changer la ligne de commande",
            "Un fichier de configuration (`.toml`, `.json`) — pour des réglages persistants et complexes (hors-sujet ici)",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          text: "Ne stocke jamais de secret (mot de passe, token) dans le code source. Une variable d'environnement lue avec `env::var` est le minimum acceptable ; en production, préfère un gestionnaire de secrets dédié.",
        },
      ],
    },
    {
      id: "erreurs-sur-stderr",
      number: "12.6",
      title: "Écrire les erreurs sur stderr",
      blocks: [
        {
          type: "paragraph",
          text: "Un terminal offre deux flux de sortie : **stdout** pour le résultat du programme et **stderr** pour les messages d'erreur et de diagnostic. Si un programme écrit ses erreurs sur stdout, elles se retrouvent mélangées au résultat quand on redirige la sortie vers un fichier (`programme > resultat.txt`).",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::process;\n\nfn main() {\n    let resultat: Result<(), String> = Err("fichier introuvable".to_string());\n\n    if let Err(e) = resultat {\n        eprintln!("Erreur applicative : {e}"); // part sur stderr\n        process::exit(1); // code de sortie non nul = échec\n    }\n\n    println!("résultat normal, sur stdout");\n}',
        },
        {
          type: "code",
          language: "bash",
          code: "cargo run > sortie.txt      # stdout va dans le fichier, les erreurs restent visibles\ncargo run 2> erreurs.log    # stderr va dans le fichier, le résultat reste à l'écran",
        },
        {
          type: "usecase",
          title: "Des CLI utilisables dans des pipelines",
          text: "Les outils Unix s'enchaînent avec `|` et `>` : `mon_outil | grep motif > resultat.txt`. Si tes messages d'erreur partent sur stdout, ils polluent la chaîne de traitement. `eprintln!` + un code de sortie non nul (`process::exit(1)`) rendent ton programme composable et scriptable — les scripts peuvent tester `$?` pour savoir s'il a réussi.",
        },
      ],
    },
    {
      id: "recapitulatif",
      title: "Récapitulatif de l'architecture",
      blocks: [
        {
          type: "paragraph",
          text: "minigrep tient en quelques responsabilités bien séparées, chacune facile à faire évoluer indépendamment :",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "`main.rs` : lit `env::args()`, construit `Config`, appelle `run`, gère les erreurs avec `eprintln!` et `process::exit`.",
            "`Config::build` : valide les arguments bruts et renvoie une `Config` ou un message d'erreur, sans jamais paniquer.",
            "`run` : orchestre la lecture de fichier (I/O) et l'affichage des résultats (I/O), en s'appuyant sur `search`.",
            "`search` / `search_case_insensitive` : logique pure, sans I/O, entièrement testable en isolation.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "Cette architecture — orchestrateur mince en `main.rs`, logique pure et testée en `lib.rs` — est un patron que tu peux appliquer à n'importe quel projet Rust, pas seulement aux outils en ligne de commande.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch12-ex1",
      title: "Construire une Config à partir des arguments",
      difficulty: "facile",
      prompt:
        "Écris une fonction `parse_config(args: &[String]) -> Result<(String, String), String>` qui vérifie qu'il y a bien au moins 3 éléments dans `args` (le nom du programme, puis deux arguments) et renvoie `(query, file_path)`. Si un argument manque, renvoie une `Err` avec un message clair.",
      hints: [
        "`args.len() < 3` détecte les arguments manquants.",
        "Utilise `.to_string()` pour transformer un `&str` d'erreur en `String` possédée.",
      ],
      starter:
        "fn parse_config(args: &[String]) -> Result<(String, String), String> {\n    todo!()\n}",
      solution:
        'fn parse_config(args: &[String]) -> Result<(String, String), String> {\n    if args.len() < 3 {\n        return Err("il manque des arguments : attendu <mot> <fichier>".to_string());\n    }\n\n    let query = args[1].clone();\n    let file_path = args[2].clone();\n    Ok((query, file_path))\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn args_completes_sont_acceptees() {\n        let args = vec![\n            "minigrep".to_string(),\n            "chat".to_string(),\n            "poeme.txt".to_string(),\n        ];\n        let (query, file_path) = parse_config(&args).unwrap();\n        assert_eq!(query, "chat");\n        assert_eq!(file_path, "poeme.txt");\n    }\n\n    #[test]\n    fn argument_manquant_renvoie_une_erreur() {\n        let args = vec!["minigrep".to_string(), "chat".to_string()];\n        assert!(parse_config(&args).is_err());\n    }\n\n    #[test]\n    fn aucun_argument_renvoie_une_erreur() {\n        let args = vec!["minigrep".to_string()];\n        assert!(parse_config(&args).is_err());\n    }\n}',
    },
    {
      id: "ch12-ex2",
      title: "Fonction de recherche sensible à la casse",
      difficulty: "moyen",
      prompt:
        "Écris `search(query: &str, contents: &str) -> Vec<&str>` qui renvoie chaque ligne de `contents` contenant exactement `query` (recherche sensible à la casse). Ne fais aucune lecture de fichier ici : la fonction doit rester pure.",
      hints: [
        "`contents.lines()` renvoie un itérateur sur les lignes, sans les caractères de fin de ligne.",
        "`str::contains` teste si une sous-chaîne est présente.",
        "`.filter(...).collect()` construit le `Vec` final.",
      ],
      starter:
        "fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    todo!()\n}",
      solution:
        "fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    contents\n        .lines()\n        .filter(|ligne| ligne.contains(query))\n        .collect()\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn trouve_les_lignes_correspondantes() {\n        let contents = "chien\\nchat\\nchaton\\noiseau";\n        assert_eq!(search("chat", contents), vec!["chat", "chaton"]);\n    }\n\n    #[test]\n    fn respecte_la_casse() {\n        let contents = "Chat\\nchat";\n        assert_eq!(search("chat", contents), vec!["chat"]);\n    }\n\n    #[test]\n    fn aucune_correspondance_renvoie_vecteur_vide() {\n        let contents = "chien\\noiseau";\n        let resultat: Vec<&str> = search("chat", contents);\n        assert!(resultat.is_empty());\n    }\n}',
    },
    {
      id: "ch12-ex3",
      title: "Version insensible à la casse",
      difficulty: "moyen",
      prompt:
        "Écris `search_case_insensitive(query: &str, contents: &str) -> Vec<&str>`, une variante de l'exercice précédent qui ignore la casse : `\"RUST\"` doit trouver aussi bien `\"rust\"` que `\"Rust\"`.",
      hints: [
        "`.to_lowercase()` sur `query` une seule fois, avant la boucle, évite de le refaire à chaque ligne.",
        "Compare `ligne.to_lowercase()` avec le `query` déjà en minuscules.",
      ],
      starter:
        "fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    todo!()\n}",
      solution:
        "fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    let query = query.to_lowercase();\n    contents\n        .lines()\n        .filter(|ligne| ligne.to_lowercase().contains(&query))\n        .collect()\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn ignore_la_casse() {\n        let contents = "Rust\\nrust\\nRUST\\nautre chose";\n        assert_eq!(\n            search_case_insensitive("rust", contents),\n            vec!["Rust", "rust", "RUST"]\n        );\n    }\n\n    #[test]\n    fn fonctionne_avec_requete_en_majuscules() {\n        let contents = "bonjour le monde";\n        assert_eq!(search_case_insensitive("MONDE", contents), vec!["bonjour le monde"]);\n    }\n\n    #[test]\n    fn aucune_correspondance() {\n        let contents = "abc\\ndef";\n        let resultat: Vec<&str> = search_case_insensitive("xyz", contents);\n        assert!(resultat.is_empty());\n    }\n}',
    },
  ],
  project: {
    id: "ch12-projet",
    title: "minigrep complet : Config::build et recherche insensible à la casse",
    difficulty: "difficile",
    prompt:
      "Assemble la version complète de la logique de minigrep dans une seule unité testable : une struct `Config` avec un constructeur `Config::build(args: &[String]) -> Result<Config, String>` qui valide les arguments et lit la variable d'environnement `IGNORE_CASE`, plus les deux fonctions de recherche `search` et `search_case_insensitive`. Écris des tests qui couvrent : la recherche sensible à la casse, la recherche insensible à la casse, une construction de `Config` réussie, et un cas d'arguments manquants. (On simule ici `lib.rs` sans I/O réelle sur fichier, pour rester testable sans dépendre du disque ; `run` avec `fs::read_to_string` s'ajouterait ensuite tel que vu dans le cours.)",
    hints: [
      "`Config::build` ne doit jamais paniquer sur une entrée utilisateur invalide : renvoie un `Result`.",
      "Lis `IGNORE_CASE` avec `std::env::var(\"IGNORE_CASE\").is_ok()`.",
      "Garde `search` et `search_case_insensitive` totalement indépendantes de `Config` : elles ne prennent que des `&str`.",
      "Pense à un test où `Config::build` échoue proprement quand `args` ne contient que le nom du programme.",
    ],
    starter:
      "pub struct Config {\n    pub query: String,\n    pub file_path: String,\n    pub ignore_case: bool,\n}\n\nimpl Config {\n    pub fn build(args: &[String]) -> Result<Config, String> {\n        todo!()\n    }\n}\n\npub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    todo!()\n}\n\npub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    todo!()\n}",
    solution:
      'pub struct Config {\n    pub query: String,\n    pub file_path: String,\n    pub ignore_case: bool,\n}\n\nimpl Config {\n    /// Construit une `Config` à partir des arguments bruts de `env::args()`.\n    /// `args[0]` est le nom du programme et n\'est pas utilisé.\n    pub fn build(args: &[String]) -> Result<Config, String> {\n        if args.len() < 3 {\n            return Err(\n                "usage: minigrep <mot> <fichier> (arguments manquants)".to_string(),\n            );\n        }\n\n        let query = args[1].clone();\n        let file_path = args[2].clone();\n        let ignore_case = std::env::var("IGNORE_CASE").is_ok();\n\n        Ok(Config { query, file_path, ignore_case })\n    }\n}\n\npub fn search<\'a>(query: &str, contents: &\'a str) -> Vec<&\'a str> {\n    contents\n        .lines()\n        .filter(|ligne| ligne.contains(query))\n        .collect()\n}\n\npub fn search_case_insensitive<\'a>(query: &str, contents: &\'a str) -> Vec<&\'a str> {\n    let query = query.to_lowercase();\n    contents\n        .lines()\n        .filter(|ligne| ligne.to_lowercase().contains(&query))\n        .collect()\n}\n\n/// Choisit la bonne fonction de recherche selon la configuration.\n/// Séparée de `run` pour rester testable sans toucher au disque.\npub fn search_with_config<\'a>(config: &Config, contents: &\'a str) -> Vec<&\'a str> {\n    if config.ignore_case {\n        search_case_insensitive(&config.query, contents)\n    } else {\n        search(&config.query, contents)\n    }\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn recherche_sensible_a_la_casse() {\n        let contents = "Rust:\\nsafe, fast, productive.\\nPick three.\\nDuct tape.";\n        assert_eq!(search("duct", contents), vec!["safe, fast, productive."]);\n    }\n\n    #[test]\n    fn recherche_insensible_a_la_casse() {\n        let contents = "Rust:\\nsafe, fast, productive.\\nPick three.\\nTrust me.";\n        assert_eq!(\n            search_case_insensitive("rUsT", contents),\n            vec!["Rust:", "Trust me."]\n        );\n    }\n\n    #[test]\n    fn config_build_reussit_avec_arguments_complets() {\n        let args = vec![\n            "minigrep".to_string(),\n            "chat".to_string(),\n            "poeme.txt".to_string(),\n        ];\n        let config = Config::build(&args).unwrap();\n        assert_eq!(config.query, "chat");\n        assert_eq!(config.file_path, "poeme.txt");\n    }\n\n    #[test]\n    fn config_build_echoue_si_arguments_manquants() {\n        let args = vec!["minigrep".to_string(), "chat".to_string()];\n        let resultat = Config::build(&args);\n        assert!(resultat.is_err());\n    }\n\n    #[test]\n    fn config_build_echoue_sans_aucun_argument() {\n        let args = vec!["minigrep".to_string()];\n        assert!(Config::build(&args).is_err());\n    }\n\n    #[test]\n    fn search_with_config_respecte_ignore_case() {\n        let contents = "Rust\\nrust\\nautre";\n        let config = Config {\n            query: "RUST".to_string(),\n            file_path: "poeme.txt".to_string(),\n            ignore_case: true,\n        };\n        assert_eq!(search_with_config(&config, contents), vec!["Rust", "rust"]);\n    }\n}',
  },
  keyTakeaways: [
    "`std::env::args().collect()` récupère les arguments ; `args[0]` est le nom du programme, pas un argument utile.",
    "Regroupe la configuration validée dans une struct dédiée, construite par une fonction associée qui renvoie un `Result` plutôt que de paniquer.",
    "Sépare `main.rs` (orchestration, I/O, gestion des erreurs) de `lib.rs` (logique métier pure et testable).",
    "Les fonctions de recherche (`search`, `search_case_insensitive`) prennent des `&str` et renvoient un `Vec<&str>` : aucune I/O, donc trivialement testables.",
    "`println!` pour la sortie normale (stdout), `eprintln!` pour les erreurs (stderr) — important pour les pipes Unix.",
    "`std::env::var(\"NOM\").is_ok()` permet d'activer un comportement via une variable d'environnement, sans changer la ligne de commande.",
  ],
};
