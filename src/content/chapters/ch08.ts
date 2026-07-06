import type { Chapter } from "../types";

export const ch08: Chapter = {
  number: 8,
  slug: "collections",
  title: "Les collections courantes",
  subtitle: "Vec, String et HashMap : stocker, parcourir et transformer des données.",
  description:
    "Les tableaux et tuples que tu as vus jusqu'ici ont une taille fixe, connue à la compilation. La plupart des programmes réels ont besoin de structures qui grandissent : une liste de commandes qui s'allonge, du texte saisi par un utilisateur, un dictionnaire de scores par joueur. Ce chapitre couvre les trois collections que tu utiliseras le plus souvent en Rust : `Vec<T>` pour des listes ordonnées, `String` pour du texte encodé en UTF-8, et `HashMap<K, V>` pour des associations clé/valeur. Toutes les trois vivent sur le tas, ce qui explique pourquoi elles peuvent changer de taille à l'exécution.",
  minutes: 50,
  rustBookRef: "Chapitre 8 — Common Collections",
  objectives: [
    "Créer, remplir et parcourir un Vec<T>, en lecture comme en écriture",
    "Choisir entre l'indexation [] et .get() selon que l'accès est garanti valide ou non",
    "Construire et manipuler des String : concaténation, itération par chars ou par bytes",
    "Expliquer pourquoi une String ne s'indexe pas directement par position",
    "Utiliser HashMap<K, V> et l'API entry pour insérer, mettre à jour et compter des valeurs",
    "Choisir la collection adaptée (Vec, String ou HashMap) selon le problème posé",
  ],
  sections: [
    {
      id: "pourquoi-des-collections",
      title: "Pourquoi plusieurs collections ?",
      blocks: [
        {
          type: "paragraph",
          text: "Un tableau `[i32; 3]` a une taille gravée dans le type : impossible d'y ajouter un élément. Les collections de la bibliothèque standard résolvent ce problème en stockant leurs données sur le **tas**, ce qui leur permet de grandir ou de rétrécir pendant l'exécution du programme.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn tailles_variables() {\n    // Un tableau a une taille fixe, connue à la compilation.\n    let fixe: [i32; 3] = [1, 2, 3];\n\n    // Un Vec peut grandir ou rétrécir à l\'exécution.\n    let mut variable: Vec<i32> = Vec::new();\n    variable.push(1);\n    variable.push(2);\n\n    println!("{:?} vs {:?}", fixe, variable);\n}',
        },
        {
          type: "paragraph",
          text: "Trois collections couvrent l'immense majorité des besoins :",
        },
        {
          type: "list",
          items: [
            "Vec<T> : une liste ordonnée d'éléments de même type, de taille variable.",
            "String : du texte encodé en UTF-8 — en réalité un Vec<u8> avec des garanties supplémentaires.",
            "HashMap<K, V> : des paires clé/valeur, pour retrouver une donnée par un identifiant plutôt que par position.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Toutes trois vivent sur le tas",
          text: "C'est ce qui leur permet de grandir librement. Cela signifie aussi qu'elles suivent les règles d'ownership que tu connais déjà : déplacer un Vec ou une String déplace la donnée, pas seulement une référence.",
        },
      ],
    },
    {
      id: "vecteurs",
      title: "Vec<T> : des listes dynamiques",
      blocks: [
        {
          type: "paragraph",
          text: "`Vec::new()` crée un vecteur vide ; le macro `vec!` en crée un déjà rempli. `.push()` ajoute un élément à la fin.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let mut nombres: Vec<i32> = Vec::new();\nnombres.push(10);\nnombres.push(20);\nnombres.push(30);\n\n// Le macro vec! crée et remplit un Vec en une ligne.\nlet couleurs = vec!["rouge", "vert", "bleu"];\n\nprintln!("{:?}", nombres);\nprintln!("{:?}", couleurs);',
        },
        {
          type: "paragraph",
          text: "Pour lire un élément, deux options : l'indexation `[]`, qui **panique** si l'indice est hors limites, et `.get()`, qui renvoie un `Option<&T>` et laisse le code décider quoi faire en cas d'absence.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let nombres = vec![10, 20, 30];\n\n// L\'indexation panique si l\'indice est hors limites.\nlet troisieme = nombres[2]; // 30\n\n// .get() renvoie un Option<&T>, jamais de panique.\nmatch nombres.get(10) {\n    Some(valeur) => println!("Trouvé : {valeur}"),\n    None => println!("Aucun élément à cet indice."),\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "`nombres[10]` sur un vecteur de 3 éléments fait planter le programme (panic). Préfère `.get(i)` dès que l'indice n'est pas garanti valide, par exemple s'il provient d'une entrée utilisateur.",
        },
        {
          type: "paragraph",
          text: "On parcourt un vecteur avec `for element in &v` (lecture seule). Pour modifier chaque élément en place, on itère sur `&mut v` et on déréférence avec `*` pour écrire une nouvelle valeur.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let nombres = vec![1, 2, 3];\n\n// Itération en lecture seule : `element` est une référence &i32.\nfor element in &nombres {\n    println!("{element}");\n}\n\nlet mut nombres = vec![1, 2, 3];\n\n// Itération mutable : on déréférence avec * pour modifier en place.\nfor element in &mut nombres {\n    *element *= 2;\n}\nassert_eq!(nombres, vec![2, 4, 6]);',
        },
        {
          type: "paragraph",
          text: "Un `Vec<T>` ne stocke qu'un seul type `T`. Pour représenter des valeurs de types différents dans une même liste (par exemple une ligne de tableur mêlant nombres et texte), on les enveloppe dans un `enum` : chaque variante devient une « case » du type unique `T`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'enum CelluleTableur {\n    Entier(i32),\n    Flottant(f64),\n    Texte(String),\n}\n\nlet ligne = vec![\n    CelluleTableur::Entier(42),\n    CelluleTableur::Flottant(3.14),\n    CelluleTableur::Texte(String::from("total")),\n];\n\nfor cellule in &ligne {\n    match cellule {\n        CelluleTableur::Entier(n) => println!("entier: {n}"),\n        CelluleTableur::Flottant(f) => println!("flottant: {f}"),\n        CelluleTableur::Texte(s) => println!("texte: {s}"),\n    }\n}',
        },
        {
          type: "usecase",
          title: "Quand choisir un Vec<T>",
          text: "Dès que tu as une collection ordonnée d'éléments de même type, et que l'accès se fait surtout par position ou par parcours séquentiel : une pile d'actions à annuler, une liste de scores dans l'ordre d'arrivée, les lignes lues d'un fichier. Si l'ordre importe peu et que tu cherches une valeur par un identifiant, une HashMap sera plus adaptée.",
        },
      ],
    },
    {
      id: "chaines-de-caracteres",
      title: "String : du texte encodé en UTF-8",
      blocks: [
        {
          type: "paragraph",
          text: "`&str` est une vue empruntée sur du texte (souvent une chaîne littérale) ; `String` en est la version possédée et modifiable, stockée sur le tas. On construit une `String` avec `String::new()`, `String::from()`, ou `.to_string()` sur une `&str`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let vide = String::new();\nlet salut = String::from("salut");\nlet salut2 = "salut".to_string();\n\nlet mut phrase = String::from("Bonjour");\nphrase.push_str(", le monde"); // ajoute une &str\nphrase.push(\'!\');              // ajoute un seul caractère\n\nassert_eq!(phrase, "Bonjour, le monde!");',
        },
        {
          type: "paragraph",
          text: "Pour combiner des morceaux de texte, l'opérateur `+` fonctionne mais **consomme** son opérande gauche (il est déplacé) ; dès qu'il y a plus de deux morceaux, `format!` est plus lisible et ne prend possession de rien.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let prenom = String::from("Ada");\nlet nom = String::from("Lovelace");\n\n// `+` consomme le premier String (il est déplacé) et emprunte le second.\nlet nom_complet = prenom + " " + &nom;\n\n// format! ne prend possession de rien : plus lisible pour plusieurs morceaux.\nlet salutation = format!("Bonjour, {nom_complet} !");\n\nprintln!("{salutation}");',
        },
        {
          type: "paragraph",
          text: "Une `String` est en réalité un `Vec<u8>` encodé en UTF-8. Un caractère comme `é` peut occuper **plusieurs octets**, donc `mot[0]` n'aurait aucun sens fiable : Rust refuse tout simplement d'indexer une `String` par position. Il faut choisir explicitement entre parcourir par caractères (`.chars()`) ou par octets bruts (`.bytes()`).",
        },
        {
          type: "code",
          language: "rust",
          code: 'let mot = String::from("café");\n\n// mot[0] ne compile pas : String n\'implémente pas Index<usize>.\n// \'é\' occupe 2 octets en UTF-8, donc un indice numérique serait ambigu.\n\nprintln!("{} caractères, {} octets", mot.chars().count(), mot.len());\n\nfor c in mot.chars() {\n    print!("[{c}]");\n}\nprintln!();\n\nfor b in mot.bytes() {\n    print!("{b} ");\n}\nprintln!();',
        },
        {
          type: "callout",
          variant: "danger",
          title: "Attention au découpage par octets",
          text: "Une tranche comme &mot[0..4] découpe par indices d'octets, pas de caractères. Sur \"café\", cela couperait le caractère 'é' au milieu de ses 2 octets et ferait paniquer le programme. Préfère .chars() dès que le texte peut contenir des caractères non-ASCII.",
        },
        {
          type: "usecase",
          title: "Quand manipuler des String",
          text: "Chaque fois que tu construis, découpes ou affiches du texte destiné à un humain : messages formatés, entrées utilisateur, contenu de fichiers texte. Pour de simples identifiants fixes connus à la compilation, une &'static str suffit souvent et évite une allocation sur le tas.",
        },
      ],
    },
    {
      id: "hashmaps",
      title: "HashMap<K, V> : associer des clés à des valeurs",
      blocks: [
        {
          type: "paragraph",
          text: "`HashMap<K, V>` n'est pas importée par défaut : il faut écrire `use std::collections::HashMap;`. `.insert()` ajoute ou remplace une paire, `.get()` renvoie un `Option<&V>`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::collections::HashMap;\n\nlet mut scores = HashMap::new();\nscores.insert(String::from("Bleu"), 10);\nscores.insert(String::from("Rouge"), 25);\n\nlet equipe = String::from("Bleu");\nmatch scores.get(&equipe) {\n    Some(score) => println!("Score : {score}"),\n    None => println!("Équipe inconnue"),\n}',
        },
        {
          type: "paragraph",
          text: "Comme partout en Rust, insérer une valeur possédée (une `String`, par exemple) dans une `HashMap` la **déplace** : elle n'appartient plus à la variable d'origine.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let cle = String::from("langage");\nlet valeur = String::from("Rust");\n\nlet mut config = HashMap::new();\nconfig.insert(cle, valeur);\n// cle et valeur ont été déplacées : elles ne sont plus utilisables ici.',
        },
        {
          type: "paragraph",
          text: "`.insert()` avec une clé déjà présente **écrase** l'ancienne valeur. `.entry(cle).or_insert(valeur)` n'insère que si la clé est absente, et renvoie une référence mutable qu'on peut utiliser pour mettre à jour la valeur en place — la base d'un compteur.",
        },
        {
          type: "code",
          language: "rust",
          code: 'let mut scores = HashMap::new();\n\nscores.insert("Bleu", 10);\nscores.insert("Bleu", 25); // écrase l\'ancienne valeur\n\nscores.entry("Rouge").or_insert(50); // insère seulement si absente\nscores.entry("Bleu").or_insert(50);  // n\'a aucun effet, la clé existe déjà\n\nassert_eq!(scores["Bleu"], 25);\nassert_eq!(scores["Rouge"], 50);',
        },
        {
          type: "code",
          language: "rust",
          code: 'let texte = "le chat et le chien et le chat";\nlet mut compteur: HashMap<&str, i32> = HashMap::new();\n\nfor mot in texte.split_whitespace() {\n    // or_insert(0) renvoie &mut i32 : on l\'incrémente directement.\n    let compte = compteur.entry(mot).or_insert(0);\n    *compte += 1;\n}\n\nfor (mot, compte) in &compteur {\n    println!("{mot}: {compte}");\n}',
        },
        {
          type: "callout",
          variant: "info",
          text: "L'ordre d'itération d'une HashMap n'est **pas garanti** et peut changer d'une exécution à l'autre. Si tu as besoin d'un ordre stable, trie les paires explicitement ou utilise une BTreeMap.",
        },
        {
          type: "usecase",
          title: "Quand choisir une HashMap",
          text: "Dès que la question posée aux données est « quelle est la valeur associée à cette clé ? » plutôt que « quel est le nième élément ? » : compter des occurrences, indexer des utilisateurs par identifiant, mémoriser un résultat déjà calculé (cache). Le prix à payer est l'absence d'ordre garanti.",
        },
      ],
    },
    {
      id: "choisir-sa-collection",
      title: "Vec, String ou HashMap ?",
      blocks: [
        {
          type: "paragraph",
          text: "Les trois collections répondent à des questions différentes. Un bon réflexe est de se demander comment on va **interroger** la donnée avant de choisir la structure qui la contient.",
        },
        {
          type: "list",
          items: [
            "Un ordre précis et un accès surtout par position → Vec<T>.",
            "Du texte à construire, découper ou afficher pour un humain → String.",
            "Une recherche rapide par identifiant, un comptage, un regroupement → HashMap<K, V>.",
          ],
        },
        {
          type: "usecase",
          title: "Combiner les collections",
          text: "Rien n'empêche de les imbriquer : une HashMap<String, Vec<i32>> regroupe des notes par élève, un Vec<HashMap<String, i32>> représente une liste d'enregistrements. Choisis la structure externe selon « dans quel ordre ? » et la structure interne selon « pour quelle clé ? ».",
        },
        {
          type: "callout",
          variant: "tip",
          text: "En cas de doute, commence par un Vec<T> : c'est la collection la plus simple et la plus rapide à parcourir. Passe à une HashMap seulement quand tu te surprends à chercher un élément par une valeur plutôt que par sa position.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch8-ex1",
      title: "Somme et moyenne",
      difficulty: "facile",
      prompt:
        "Écris une fonction `somme_et_moyenne` qui reçoit une tranche `&[i32]` et renvoie un tuple `(i32, f64)` : la somme totale et la moyenne. Tu peux supposer que la tranche n'est jamais vide.",
      hints: [
        "`.iter().sum()` calcule la somme d'un itérateur.",
        "Convertis avec `as f64` avant de diviser pour obtenir un résultat décimal.",
      ],
      starter: "fn somme_et_moyenne(donnees: &[i32]) -> (i32, f64) {\n    todo!()\n}",
      solution:
        "fn somme_et_moyenne(donnees: &[i32]) -> (i32, f64) {\n    let somme: i32 = donnees.iter().sum();\n    let moyenne = somme as f64 / donnees.len() as f64;\n    (somme, moyenne)\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn calcule_sur_plusieurs_valeurs() {\n        assert_eq!(somme_et_moyenne(&[1, 2, 3, 4]), (10, 2.5));\n    }\n\n    #[test]\n    fn calcule_sur_valeurs_rondes() {\n        assert_eq!(somme_et_moyenne(&[10, 20, 30]), (60, 20.0));\n    }\n\n    #[test]\n    fn fonctionne_avec_un_seul_element() {\n        assert_eq!(somme_et_moyenne(&[4]), (4, 4.0));\n    }\n}',
    },
    {
      id: "ch8-ex2",
      title: "Compter les mots",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `compter_mots` qui reçoit un texte et renvoie une `HashMap<String, u32>` associant chaque mot (en minuscules) à son nombre d'occurrences. Les mots sont séparés par des espaces.",
      hints: [
        "`.split_whitespace()` découpe une chaîne sur les espaces.",
        "`.entry(cle).or_insert(0)` renvoie une référence mutable à incrémenter, en une seule étape.",
        "`.to_lowercase()` normalise la casse avant de compter.",
      ],
      starter:
        "use std::collections::HashMap;\n\nfn compter_mots(texte: &str) -> HashMap<String, u32> {\n    todo!()\n}",
      solution:
        'use std::collections::HashMap;\n\nfn compter_mots(texte: &str) -> HashMap<String, u32> {\n    let mut compteur = HashMap::new();\n\n    for mot in texte.split_whitespace() {\n        let mot = mot.to_lowercase();\n        *compteur.entry(mot).or_insert(0) += 1;\n    }\n\n    compteur\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn compte_les_repetitions() {\n        let resultat = compter_mots("le chat et le chien et le chat");\n        assert_eq!(resultat.get("le"), Some(&3));\n        assert_eq!(resultat.get("chat"), Some(&2));\n        assert_eq!(resultat.get("et"), Some(&2));\n        assert_eq!(resultat.get("chien"), Some(&1));\n    }\n\n    #[test]\n    fn ignore_la_casse() {\n        let resultat = compter_mots("Rust rust RUST");\n        assert_eq!(resultat.get("rust"), Some(&3));\n        assert_eq!(resultat.len(), 1);\n    }\n\n    #[test]\n    fn chaine_vide_ne_compte_rien() {\n        let resultat = compter_mots("");\n        assert!(resultat.is_empty());\n    }\n}',
    },
    {
      id: "ch8-ex3",
      title: "Inverser une chaîne",
      difficulty: "facile",
      prompt:
        "Écris une fonction `inverser_chaine` qui renvoie l'inverse d'une chaîne, caractère par caractère (et non octet par octet, pour bien gérer les caractères accentués).",
      hints: [
        "`.chars()` découpe correctement les caractères UTF-8, contrairement à un parcours par octets.",
        "`.rev()` inverse un itérateur ; `.collect()` reconstruit une String à partir d'un itérateur de char.",
      ],
      starter: "fn inverser_chaine(s: &str) -> String {\n    todo!()\n}",
      solution: "fn inverser_chaine(s: &str) -> String {\n    s.chars().rev().collect()\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn inverse_un_mot_simple() {\n        assert_eq!(inverser_chaine("Rust"), "tsuR");\n    }\n\n    #[test]\n    fn gere_les_caracteres_accentues() {\n        assert_eq!(inverser_chaine("café"), "éfac");\n    }\n\n    #[test]\n    fn chaine_vide() {\n        assert_eq!(inverser_chaine(""), "");\n    }\n}',
    },
    {
      id: "ch8-ex4",
      title: "Regrouper par première lettre",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `grouper_par_premiere_lettre` qui reçoit une tranche de `&str` et renvoie une `HashMap<char, Vec<String>>` regroupant les mots selon leur première lettre, convertie en minuscule.",
      hints: [
        "`.entry(cle).or_insert_with(Vec::new)` crée un Vec vide seulement si la clé n'existe pas encore, puis renvoie une référence mutable dessus.",
        "`.chars().next()` récupère le premier caractère d'une &str sous forme d'Option<char>.",
      ],
      starter:
        "use std::collections::HashMap;\n\nfn grouper_par_premiere_lettre(mots: &[&str]) -> HashMap<char, Vec<String>> {\n    todo!()\n}",
      solution:
        'use std::collections::HashMap;\n\nfn grouper_par_premiere_lettre(mots: &[&str]) -> HashMap<char, Vec<String>> {\n    let mut groupes: HashMap<char, Vec<String>> = HashMap::new();\n\n    for mot in mots {\n        if let Some(premiere) = mot.chars().next() {\n            let cle = premiere.to_ascii_lowercase();\n            groupes.entry(cle).or_insert_with(Vec::new).push(mot.to_string());\n        }\n    }\n\n    groupes\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn regroupe_par_premiere_lettre() {\n        let mots = ["chat", "chien", "banane", "Chameau"];\n        let groupes = grouper_par_premiere_lettre(&mots);\n\n        assert_eq!(\n            groupes.get(&\'c\'),\n            Some(&vec!["chat".to_string(), "chien".to_string(), "Chameau".to_string()])\n        );\n        assert_eq!(groupes.get(&\'b\'), Some(&vec!["banane".to_string()]));\n    }\n\n    #[test]\n    fn ignore_la_casse_de_la_cle() {\n        let mots = ["Alpha", "avion"];\n        let groupes = grouper_par_premiere_lettre(&mots);\n        assert_eq!(groupes.len(), 1);\n        assert!(groupes.contains_key(&\'a\'));\n    }\n\n    #[test]\n    fn tableau_vide_renvoie_une_map_vide() {\n        let groupes = grouper_par_premiere_lettre(&[]);\n        assert!(groupes.is_empty());\n    }\n}',
    },
  ],
  project: {
    id: "ch8-projet",
    title: "Statistiques descriptives",
    difficulty: "difficile",
    prompt:
      "Écris une fonction `statistiques(donnees: &[i32]) -> (f64, f64, i32)` qui renvoie, dans l'ordre, la **moyenne**, la **médiane** et le **mode** d'un ensemble de nombres. La moyenne est la somme divisée par le nombre d'éléments. La médiane est la valeur du milieu une fois les nombres triés (la moyenne des deux valeurs centrales si le nombre d'éléments est pair). Le mode est la valeur la plus fréquente. Tu peux supposer que `donnees` n'est jamais vide (documente ce choix, et fais paniquer la fonction si ce n'est pas respecté).",
    hints: [
      "Ne trie pas le tableau original : clone-le avec `.to_vec()` avant de trier, pour ne pas surprendre l'appelant.",
      "Pour la médiane, distingue le cas d'une longueur paire (moyenne des deux valeurs du milieu) et impaire (valeur centrale).",
      "Une HashMap<i32, u32> compte les occurrences ; `.max_by_key(|&(_, compte)| compte)` trouve ensuite la clé la plus fréquente.",
      "`assert!(!donnees.is_empty())` documente et fait respecter la précondition dès le début de la fonction.",
    ],
    starter:
      "use std::collections::HashMap;\n\n/// Renvoie (moyenne, médiane, mode) d'une tranche de nombres.\n/// Suppose que `donnees` n'est jamais vide (panique sinon).\nfn statistiques(donnees: &[i32]) -> (f64, f64, i32) {\n    todo!()\n}",
    solution:
      'use std::collections::HashMap;\n\n/// Renvoie (moyenne, médiane, mode) d\'une tranche de nombres.\n/// Suppose que `donnees` n\'est jamais vide (panique sinon).\nfn statistiques(donnees: &[i32]) -> (f64, f64, i32) {\n    assert!(!donnees.is_empty(), "le jeu de données ne doit pas être vide");\n\n    // Moyenne : somme divisée par le nombre d\'éléments.\n    let somme: i32 = donnees.iter().sum();\n    let moyenne = somme as f64 / donnees.len() as f64;\n\n    // Médiane : on trie une copie pour ne pas modifier la tranche d\'origine.\n    let mut triees = donnees.to_vec();\n    triees.sort();\n    let milieu = triees.len() / 2;\n    let mediane = if triees.len() % 2 == 0 {\n        (triees[milieu - 1] + triees[milieu]) as f64 / 2.0\n    } else {\n        triees[milieu] as f64\n    };\n\n    // Mode : la valeur la plus fréquente, via une HashMap de comptage.\n    let mut occurrences: HashMap<i32, u32> = HashMap::new();\n    for &valeur in donnees {\n        *occurrences.entry(valeur).or_insert(0) += 1;\n    }\n    let mode = occurrences\n        .into_iter()\n        .max_by_key(|&(_, compte)| compte)\n        .map(|(valeur, _)| valeur)\n        .unwrap();\n\n    (moyenne, mediane, mode)\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn approx_egal(a: f64, b: f64) -> bool {\n        (a - b).abs() < 1e-9\n    }\n\n    #[test]\n    fn moyenne_mediane_mode_longueur_impaire() {\n        let (moyenne, mediane, mode) = statistiques(&[1, 2, 2, 3, 4]);\n        assert!(approx_egal(moyenne, 2.4));\n        assert!(approx_egal(mediane, 2.0));\n        assert_eq!(mode, 2);\n    }\n\n    #[test]\n    fn mode_avec_frequence_dominante() {\n        let (moyenne, mediane, mode) = statistiques(&[4, 4, 4, 2, 2, 7, 9]);\n        assert!(approx_egal(moyenne, 32.0 / 7.0));\n        assert!(approx_egal(mediane, 4.0));\n        assert_eq!(mode, 4);\n    }\n\n    #[test]\n    fn mediane_longueur_paire() {\n        let (moyenne, mediane, _mode) = statistiques(&[1, 2, 3, 4]);\n        assert!(approx_egal(moyenne, 2.5));\n        assert!(approx_egal(mediane, 2.5));\n    }\n\n    #[test]\n    fn gere_les_nombres_negatifs() {\n        let (moyenne, mediane, mode) = statistiques(&[-5, -1, -1, 3]);\n        assert!(approx_egal(moyenne, -1.0));\n        assert!(approx_egal(mediane, -1.0));\n        assert_eq!(mode, -1);\n    }\n\n    #[test]\n    fn un_seul_element() {\n        let (moyenne, mediane, mode) = statistiques(&[7]);\n        assert!(approx_egal(moyenne, 7.0));\n        assert!(approx_egal(mediane, 7.0));\n        assert_eq!(mode, 7);\n    }\n\n    #[test]\n    #[should_panic]\n    fn panique_si_vide() {\n        statistiques(&[]);\n    }\n}',
  },
  keyTakeaways: [
    "Vec<T>, String et HashMap<K, V> vivent sur le tas et peuvent grandir à l'exécution.",
    "L'indexation [] panique hors limites ; .get() renvoie un Option pour un accès sûr.",
    "Une String est du texte encodé en UTF-8 : indexe-la par .chars(), jamais par position numérique.",
    "`+` déplace son opérande gauche ; format! ne prend possession de rien et gère mieux plusieurs morceaux.",
    ".entry(cle).or_insert(...) insère seulement si la clé est absente et permet de mettre à jour une valeur en une étape.",
    "Choisis Vec pour un ordre et une position, HashMap pour une recherche par clé — et n'hésite pas à les combiner.",
  ],
};
