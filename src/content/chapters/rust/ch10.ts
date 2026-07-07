import type { Chapter } from "../../types";

export const ch10: Chapter = {
  number: 10,
  slug: "generics-traits",
  title: "Généricité, traits et durées de vie",
  subtitle:
    "Écrire du code générique, définir des comportements partagés avec les traits, et garantir des références toujours valides avec les durées de vie.",
  description:
    "Ce chapitre réunit trois outils qui rendent le code Rust à la fois flexible et sûr sans sacrifier la performance. La **généricité** évite de dupliquer une fonction ou une structure pour chaque type concret. Les **traits** définissent un comportement partagé que plusieurs types peuvent implémenter, avec ou sans implémentation par défaut — c'est la façon dont Rust exprime le polymorphisme sans hériter de classes. Les **durées de vie** (lifetimes), enfin, permettent au compilateur de vérifier, dès la compilation, qu'aucune référence ne survit à la donnée qu'elle emprunte. Les trois notions se combinent en permanence dans du code Rust idiomatique.",
  minutes: 55,
  rustBookRef: "Chapitre 10 — Generic Types, Traits, and Lifetimes",
  objectives: [
    "Écrire des fonctions, des structs et des enums génériques sur un ou plusieurs types",
    "Contraindre un type générique avec une borne de trait, comme `T: PartialOrd`",
    "Définir un trait, l'implémenter pour plusieurs types, et fournir une implémentation par défaut",
    "Accepter un trait en paramètre avec `impl Trait`, un générique borné ou une clause `where`",
    "Comprendre le problème des références pendantes et annoter des durées de vie avec `'a`",
    "Ajouter des durées de vie à une struct et reconnaître les cas couverts par l'élision",
  ],
  sections: [
    {
      id: "fonctions-generiques",
      number: "10.1",
      title: "Fonctions génériques",
      blocks: [
        {
          type: "paragraph",
          text: "Beaucoup de fonctions partagent la même logique mais s'appliquent à des types différents : trouver le plus grand élément d'une liste de nombres, de caractères, ou de n'importe quel type comparable. Plutôt que de dupliquer le code pour chaque type, Rust permet d'écrire des **fonctions génériques**, paramétrées par un type abstrait, généralement noté `T`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn plus_grand_i32(liste: &[i32]) -> i32 {\n    let mut plus_grand = liste[0];\n    for &item in liste {\n        if item > plus_grand {\n            plus_grand = item;\n        }\n    }\n    plus_grand\n}\n\nfn plus_grand_char(liste: &[char]) -> char {\n    let mut plus_grand = liste[0];\n    for &item in liste {\n        if item > plus_grand {\n            plus_grand = item;\n        }\n    }\n    plus_grand\n}',
          caption: "Deux fonctions presque identiques, une par type : le signal qu'il faut généraliser.",
        },
        {
          type: "paragraph",
          text: "On factorise les deux avec un paramètre de type `T`, placé entre chevrons après le nom de la fonction. Mais le compilateur refuse `item > plus_grand` tant qu'il ne sait pas que `T` supporte la comparaison : il faut une **borne de trait** (`T: PartialOrd`) qui exige que `T` implémente le trait `PartialOrd`. On ajoute aussi `Copy`, pour pouvoir affecter `liste[0]` à une variable sans déplacer le slice.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn plus_grand<T: PartialOrd + Copy>(liste: &[T]) -> T {\n    let mut plus_grand = liste[0];\n    for &item in liste {\n        if item > plus_grand {\n            plus_grand = item;\n        }\n    }\n    plus_grand\n}\n\nfn main() {\n    let nombres = vec![34, 50, 25, 100, 65];\n    println!("Le plus grand est {}", plus_grand(&nombres));\n\n    let caracteres = vec![\'y\', \'m\', \'a\', \'q\'];\n    println!("Le plus grand est {}", plus_grand(&caracteres));\n}',
        },
        {
          type: "callout",
          variant: "info",
          title: "Pourquoi Copy en plus de PartialOrd ?",
          text: "`PartialOrd` autorise l'opérateur `>`, mais `let mut plus_grand = liste[0];` déplace (ou copie) la première valeur hors du slice. Sans `Copy`, ce serait un déplacement interdit tant que `liste` reste utilisée juste après. Pour des types non-`Copy` comme `String`, il faudrait travailler sur des références (`&T`) plutôt que sur des valeurs.",
        },
        {
          type: "usecase",
          title: "Du code réutilisable, écrit une seule fois",
          text: "C'est le cas d'usage numéro un des génériques : écrire une fonction utilitaire (trier, chercher un maximum, filtrer) **une seule fois**, et la laisser fonctionner sur `Vec<i32>`, `Vec<f64>`, `Vec<String>`... dès que le type respecte les bornes demandées. Le compilateur génère ensuite du code spécialisé pour chaque type réellement utilisé (une technique appelée *monomorphisation*) : aucune perte de performance par rapport à des fonctions écrites à la main pour chaque type.",
        },
      ],
    },
    {
      id: "structs-enums-generiques",
      number: "10.1",
      title: "Structs, enums et méthodes génériques",
      blocks: [
        {
          type: "paragraph",
          text: "Les structs, les enums et leurs méthodes peuvent eux aussi être génériques sur un ou plusieurs types. C'est exactement ainsi que sont définis `Option<T>` et `Result<T, E>` dans la bibliothèque standard :",
        },
        {
          type: "code",
          language: "rust",
          code: "enum Option<T> {\n    Some(T),\n    None,\n}\n\nenum Result<T, E> {\n    Ok(T),\n    Err(E),\n}",
          caption: "Les deux enums les plus utilisés de Rust sont déjà génériques.",
        },
        {
          type: "paragraph",
          text: "Une struct `Point<T>` reprend la même idée : les deux champs partagent le type `T`. Les méthodes se déclarent dans un bloc `impl<T> Point<T>`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'struct Point<T> {\n    x: T,\n    y: T,\n}\n\nimpl<T> Point<T> {\n    fn x(&self) -> &T {\n        &self.x\n    }\n}\n\nfn main() {\n    let entier = Point { x: 5, y: 10 };\n    let flottant = Point { x: 1.0, y: 4.0 };\n\n    println!("{}", entier.x());\n    println!("{}", flottant.x());\n}',
        },
        {
          type: "paragraph",
          text: "Si les deux champs doivent pouvoir avoir des types différents, il faut deux paramètres de type distincts, `T` et `U`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'struct Paire<T, U> {\n    premier: T,\n    second: U,\n}\n\nimpl<T, U> Paire<T, U> {\n    fn nouveau(premier: T, second: U) -> Paire<T, U> {\n        Paire { premier, second }\n    }\n}\n\nfn main() {\n    let mixte = Paire::nouveau(5, "cinq");\n    println!("{} / {}", mixte.premier, mixte.second);\n}',
        },
        {
          type: "paragraph",
          text: "On peut aussi restreindre un bloc `impl` à **une seule** spécialisation du type générique, avec `impl Point<f64>` plutôt que `impl<T> Point<T>` : la méthode n'existera alors que pour `Point<f64>`, pas pour `Point<i32>`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'impl Point<f64> {\n    fn distance_a_origine(&self) -> f64 {\n        (self.x.powi(2) + self.y.powi(2)).sqrt()\n    }\n}\n\nfn main() {\n    let p = Point { x: 3.0, y: 4.0 };\n    println!("{}", p.distance_a_origine()); // 5.0\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Utiliser des génériques n'a **aucun coût à l'exécution** : le compilateur monomorphise chaque struct générique en autant de versions concrètes que de types utilisés, exactement comme si elles avaient été écrites à la main.",
        },
      ],
    },
    {
      id: "definir-un-trait",
      number: "10.2",
      title: "Définir un trait",
      blocks: [
        {
          type: "paragraph",
          text: "Un trait décrit un comportement que plusieurs types peuvent partager : « ce type sait se résumer », « ce type sait s'afficher ». On le déclare avec `trait`, en listant les signatures de méthode. Une méthode peut fournir un **corps par défaut**, utilisable tel quel ou redéfinissable par chaque type.",
        },
        {
          type: "code",
          language: "rust",
          code: 'pub trait Resume {\n    fn resumer(&self) -> String {\n        String::from("(Lire la suite...)")\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Implémenter le trait pour un type se fait avec `impl NomDuTrait for NomDuType`. Un type peut garder l'implémentation par défaut (bloc `impl` vide) ou la redéfinir entièrement.",
        },
        {
          type: "code",
          language: "rust",
          code: 'pub struct ArticleDeBlog {\n    pub titre: String,\n    pub auteur: String,\n}\n\nimpl Resume for ArticleDeBlog {\n    fn resumer(&self) -> String {\n        format!("{}, par {}", self.titre, self.auteur)\n    }\n}\n\npub struct Gazouillis {\n    pub utilisateur: String,\n}\n\nimpl Resume for Gazouillis {} // utilise l\'implémentation par défaut\n\nfn main() {\n    let g = Gazouillis { utilisateur: String::from("rustlang") };\n    println!("{}", g.resumer());\n}',
        },
        {
          type: "list",
          items: [
            "Un trait définit une **signature partagée** : ce que plusieurs types savent faire, pas comment ils le font.",
            "Une méthode sans corps (`fn resumer(&self) -> String;`) est obligatoire pour tout type qui implémente le trait.",
            "Une méthode avec corps est une **implémentation par défaut** : les types peuvent la garder telle quelle ou la redéfinir.",
            "La *règle de cohérence* (orphan rule) interdit d'implémenter un trait externe pour un type externe : il faut posséder le trait ou le type dans son propre crate.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          text: "Une implémentation par défaut peut appeler d'autres méthodes du même trait, même celles qui n'ont pas de corps par défaut. Un type qui redéfinit seulement ces méthodes obligatoires profite quand même du comportement par défaut construit autour d'elles — c'est la base du projet de ce chapitre.",
        },
      ],
    },
    {
      id: "traits-en-parametre",
      number: "10.2",
      title: "Traits en paramètre et en retour",
      blocks: [
        {
          type: "paragraph",
          text: "Pour accepter n'importe quel type qui implémente un trait donné, la syntaxe la plus courte est `impl Trait` comme type de paramètre.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn notifier(item: &impl Resume) {\n    println!("Alerte actu ! {}", item.resumer());\n}',
        },
        {
          type: "paragraph",
          text: "C'est un raccourci pour la forme générique avec **borne de trait**, plus verbeuse mais plus explicite — et indispensable dès qu'on veut exprimer que deux paramètres partagent le même type concret, ou combiner plusieurs bornes avec une clause `where`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn notifier<T: Resume>(item: &T) {\n    println!("Alerte actu ! {}", item.resumer());\n}\n\nfn resumer_les_deux<T, U>(a: &T, b: &U) -> String\nwhere\n    T: Resume,\n    U: Resume,\n{\n    format!("{} -- {}", a.resumer(), b.resumer())\n}',
        },
        {
          type: "paragraph",
          text: "On combine plusieurs bornes avec `+` : `fn notifier<T: Resume + std::fmt::Display>(item: &T)` exige que `T` implémente **à la fois** `Resume` et `Display`. Dès que la signature accumule deux ou trois bornes sur plusieurs types, la clause `where` (utilisée ci-dessus) garde le nom de la fonction lisible.",
        },
        {
          type: "heading",
          level: 3,
          text: "Renvoyer impl Trait",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn creer_gazouillis() -> impl Resume {\n    Gazouillis {\n        utilisateur: String::from("rustlang"),\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: "`impl Trait` en position de retour n'autorise qu'un **seul** type concret par fonction : impossible de renvoyer tantôt un `ArticleDeBlog`, tantôt un `Gazouillis`, même si les deux implémentent `Resume`, selon une condition. Ce cas demande un objet trait (`Box<dyn Resume>`), une notion vue dans un chapitre ultérieur.",
        },
      ],
    },
    {
      id: "references-pendantes-lifetimes",
      number: "10.3",
      title: "Le problème des références pendantes",
      blocks: [
        {
          type: "paragraph",
          text: "Le rôle premier des durées de vie (*lifetimes*) est d'empêcher les **références pendantes** : une référence vers une donnée déjà détruite. Le borrow checker rejette ce genre de code à la compilation, avant même de produire un exécutable.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn main() {\n    let r;\n\n    {\n        let x = 5;\n        r = &x; // erreur : `x` ne vit pas assez longtemps\n    }\n\n    println!("r vaut : {r}");\n}',
          caption: "Ce code ne compile pas : `x` est détruit à la fin du bloc interne, `r` pointerait dans le vide.",
        },
        {
          type: "callout",
          variant: "danger",
          title: "error[E0597]: `x` does not live long enough",
          text: "Le borrow checker refuse ce programme avant même de le compiler : aucune référence pendante ne peut exister dans du Rust sûr, contrairement au C où ce genre de bug provoque un comportement indéfini détecté seulement à l'exécution, si jamais il l'est.",
        },
        {
          type: "paragraph",
          text: "Le compilateur a aussi besoin d'aide quand la relation entre les durées de vie des paramètres et du retour n'est pas évidente, par exemple une fonction qui renvoie l'une de deux références selon une condition.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn plus_longue(x: &str, y: &str) -> &str {\n    if x.len() > y.len() {\n        x\n    } else {\n        y\n    }\n}",
          caption: "Erreur de compilation : missing lifetime specifier — le compilateur ne sait pas si la référence renvoyée vient de x ou de y.",
        },
        {
          type: "paragraph",
          text: "L'annotation `'a` répond à cette question. Elle ne change **rien** à la durée de vie réelle des valeurs : elle décrit, pour le compilateur, la relation entre les durées de vie des références en entrée et en sortie.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn plus_longue<\'a>(x: &\'a str, y: &\'a str) -> &\'a str {\n    if x.len() > y.len() {\n        x\n    } else {\n        y\n    }\n}\n\nfn main() {\n    let chaine1 = String::from("longue chaine de caracteres");\n    let resultat;\n    {\n        let chaine2 = String::from("courte");\n        resultat = plus_longue(chaine1.as_str(), chaine2.as_str());\n        println!("La plus longue est {resultat}");\n    }\n}',
        },
        {
          type: "usecase",
          title: "Les lifetimes ne changent rien à l'exécution",
          text: "Comme les types génériques, les annotations de durée de vie sont une information pour le **compilateur uniquement** : elles disparaissent du binaire final. Elles servent à décrire comment les durées de vie des références en entrée et en sortie sont liées entre elles — ici, `'a` signifie que la référence renvoyée ne vit pas plus longtemps que le plus court des deux arguments `x` et `y`.",
        },
      ],
    },
    {
      id: "lifetimes-structs-elision",
      number: "10.3",
      title: "Lifetimes dans les structs et élision",
      blocks: [
        {
          type: "paragraph",
          text: "Une struct qui stocke une **référence** plutôt qu'une valeur possédée doit annoter la durée de vie de cette référence : le compilateur doit pouvoir garantir qu'aucune instance de la struct ne survit à la donnée qu'elle emprunte.",
        },
        {
          type: "code",
          language: "rust",
          code: 'struct Extrait<\'a> {\n    partie: &\'a str,\n}\n\nimpl<\'a> Extrait<\'a> {\n    fn annoncer(&self, annonce: &str) -> &str {\n        println!("Attention : {annonce}");\n        self.partie\n    }\n}\n\nfn main() {\n    let roman = String::from("Appelle-moi Ishmael. Il y a plusieurs annees.");\n    let premiere_phrase = roman.split(\'.\').next().expect("pas de point trouve");\n    let extrait = Extrait { partie: premiere_phrase };\n\n    println!("{}", extrait.annoncer("nouvelle citation"));\n}',
        },
        {
          type: "paragraph",
          text: "Remarque que `annoncer` renvoie `&str` **sans** annotation explicite, alors qu'elle a deux paramètres de type référence (`&self` et `annonce: &str`). Le compilateur applique trois règles d'élision avant de réclamer une annotation, et ce cas rentre exactement dans la troisième.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Chaque référence en paramètre reçoit sa propre durée de vie implicite (`fn f(x: &str, y: &str)` devient en interne `fn f<'a, 'b>(x: &'a str, y: &'b str)`).",
            "S'il n'y a qu'un seul paramètre de type référence, sa durée de vie est attribuée à toutes les références du retour.",
            "S'il y a plusieurs paramètres mais que l'un d'eux est `&self` ou `&mut self`, la durée de vie de `self` est attribuée à toutes les références du retour.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "'static : la durée de vie qui dure tout le programme",
          text: "Une référence `'static` vit aussi longtemps que le programme entier — c'est le cas de tous les littéraux de chaîne (`&'static str`), stockés directement dans le binaire. Le compilateur suggère parfois `'static` pour résoudre une erreur de durée de vie ; méfie-toi, ce n'est presque jamais la bonne solution, seulement un pansement qui peut cacher un vrai problème de conception.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch10-ex1",
      title: "Le plus grand élément",
      difficulty: "moyen",
      prompt:
        "Écris une fonction générique `plus_grand<T: PartialOrd + Copy>(liste: &[T]) -> T` qui renvoie le plus grand élément d'un slice **non vide**. Elle doit fonctionner aussi bien avec des `i32`, des `char` que des `f64`, sans dupliquer le code.",
      hints: [
        "La borne `PartialOrd` autorise l'opérateur `>` entre deux valeurs de type `T`.",
        "La borne `Copy` permet d'affecter `liste[0]` à une variable sans déplacer le slice.",
        "Le corps ressemble à une recherche de maximum classique avec une boucle `for`.",
      ],
      starter: "fn plus_grand<T: PartialOrd + Copy>(liste: &[T]) -> T {\n    todo!()\n}",
      solution:
        "fn plus_grand<T: PartialOrd + Copy>(liste: &[T]) -> T {\n    let mut plus_grand = liste[0];\n    for &item in liste {\n        if item > plus_grand {\n            plus_grand = item;\n        }\n    }\n    plus_grand\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn trouve_le_plus_grand_entier() {\n        let nombres = vec![34, 50, 25, 100, 65];\n        assert_eq!(plus_grand(&nombres), 100);\n    }\n\n    #[test]\n    fn trouve_le_plus_grand_caractere() {\n        let lettres = vec!['y', 'm', 'a', 'q'];\n        assert_eq!(plus_grand(&lettres), 'y');\n    }\n\n    #[test]\n    fn fonctionne_avec_un_seul_element() {\n        let seul = vec![42];\n        assert_eq!(plus_grand(&seul), 42);\n    }\n\n    #[test]\n    fn fonctionne_avec_des_flottants() {\n        let flottants = vec![1.5, 3.25, 0.1, 2.0];\n        assert_eq!(plus_grand(&flottants), 3.25);\n    }\n}",
    },
    {
      id: "ch10-ex2",
      title: "Aire des formes géométriques",
      difficulty: "moyen",
      prompt:
        "Définis un trait `Aire` avec une méthode `fn aire(&self) -> f64;`, puis implémente-le pour deux structs : `Cercle { rayon: f64 }` et `Rectangle { largeur: f64, hauteur: f64 }`.",
      hints: [
        "`std::f64::consts::PI` donne la valeur de π sans import supplémentaire.",
        "L'aire d'un cercle est π × rayon², celle d'un rectangle largeur × hauteur.",
      ],
      starter:
        "trait Aire {\n    fn aire(&self) -> f64;\n}\n\nstruct Cercle {\n    rayon: f64,\n}\n\nstruct Rectangle {\n    largeur: f64,\n    hauteur: f64,\n}\n\n// Implémente `Aire` pour `Cercle` et pour `Rectangle`.",
      solution:
        "trait Aire {\n    fn aire(&self) -> f64;\n}\n\nstruct Cercle {\n    rayon: f64,\n}\n\nstruct Rectangle {\n    largeur: f64,\n    hauteur: f64,\n}\n\nimpl Aire for Cercle {\n    fn aire(&self) -> f64 {\n        std::f64::consts::PI * self.rayon * self.rayon\n    }\n}\n\nimpl Aire for Rectangle {\n    fn aire(&self) -> f64 {\n        self.largeur * self.hauteur\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn approx_egal(a: f64, b: f64) -> bool {\n        (a - b).abs() < 0.001\n    }\n\n    #[test]\n    fn aire_du_rectangle() {\n        let rect = Rectangle { largeur: 4.0, hauteur: 5.0 };\n        assert!(approx_egal(rect.aire(), 20.0));\n    }\n\n    #[test]\n    fn aire_du_cercle() {\n        let cercle = Cercle { rayon: 2.0 };\n        assert!(approx_egal(cercle.aire(), 12.566));\n    }\n\n    fn description_aire(forme: &impl Aire) -> String {\n        format!("{:.2}", forme.aire())\n    }\n\n    #[test]\n    fn fonctionne_via_impl_trait() {\n        let rect = Rectangle { largeur: 3.0, hauteur: 3.0 };\n        assert_eq!(description_aire(&rect), "9.00");\n    }\n}',
    },
    {
      id: "ch10-ex3",
      title: "La chaîne la plus longue",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `plus_longue<'a>(x: &'a str, y: &'a str) -> &'a str` qui renvoie la plus longue des deux `&str`, ou la première en cas d'égalité de longueur.",
      hints: [
        "Le compilateur refuse une fonction qui renvoie une référence sans préciser sa durée de vie par rapport aux paramètres.",
        "`'a` signifie : « la valeur renvoyée ne vit pas plus longtemps que x et y ».",
      ],
      starter: "fn plus_longue<'a>(x: &'a str, y: &'a str) -> &'a str {\n    todo!()\n}",
      solution:
        "fn plus_longue<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() >= y.len() {\n        x\n    } else {\n        y\n    }\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn renvoie_la_premiere_si_plus_longue() {\n        assert_eq!(plus_longue("bonjour tout le monde", "salut"), "bonjour tout le monde");\n    }\n\n    #[test]\n    fn renvoie_la_seconde_si_plus_longue() {\n        assert_eq!(plus_longue("hi", "bonjour"), "bonjour");\n    }\n\n    #[test]\n    fn renvoie_la_premiere_en_cas_egalite() {\n        assert_eq!(plus_longue("abc", "xyz"), "abc");\n    }\n\n    #[test]\n    fn fonctionne_avec_des_string() {\n        let a = String::from("rust");\n        let b = String::from("cargo!");\n        assert_eq!(plus_longue(a.as_str(), b.as_str()), "cargo!");\n    }\n}',
    },
    {
      id: "ch10-ex4",
      title: "Comparer une paire générique",
      difficulty: "difficile",
      prompt:
        "Complète la struct générique `Paire<T>` avec une méthode `cmp_afficher` qui renvoie une `String` annonçant le plus grand des deux membres, du type « Le plus grand membre est 10 ». Cette méthode doit fonctionner pour tout `T` qui peut à la fois s'afficher (`Display`) et se comparer (`PartialOrd`).",
      hints: [
        "Ajoute un second bloc `impl` avec les bornes `T: Display + PartialOrd`, distinct du premier `impl<T> Paire<T>` sans borne.",
        "Utilise `format!` avec `{}`, qui fonctionne dès que le type implémente `Display`.",
      ],
      starter:
        "use std::fmt::Display;\n\nstruct Paire<T> {\n    premier: T,\n    second: T,\n}\n\nimpl<T> Paire<T> {\n    fn nouveau(premier: T, second: T) -> Paire<T> {\n        Paire { premier, second }\n    }\n}\n\n// Ajoute ici un bloc `impl` avec les bornes nécessaires\n// et une méthode `cmp_afficher` qui renvoie une `String`.",
      solution:
        'use std::fmt::Display;\n\nstruct Paire<T> {\n    premier: T,\n    second: T,\n}\n\nimpl<T> Paire<T> {\n    fn nouveau(premier: T, second: T) -> Paire<T> {\n        Paire { premier, second }\n    }\n}\n\nimpl<T: Display + PartialOrd> Paire<T> {\n    fn cmp_afficher(&self) -> String {\n        if self.premier >= self.second {\n            format!("Le plus grand membre est {}", self.premier)\n        } else {\n            format!("Le plus grand membre est {}", self.second)\n        }\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn detecte_le_premier_plus_grand() {\n        let paire = Paire::nouveau(10, 3);\n        assert_eq!(paire.cmp_afficher(), "Le plus grand membre est 10");\n    }\n\n    #[test]\n    fn detecte_le_second_plus_grand() {\n        let paire = Paire::nouveau(2, 9);\n        assert_eq!(paire.cmp_afficher(), "Le plus grand membre est 9");\n    }\n\n    #[test]\n    fn fonctionne_avec_des_chaines() {\n        let paire = Paire::nouveau(String::from("abc"), String::from("abd"));\n        assert_eq!(paire.cmp_afficher(), "Le plus grand membre est abd");\n    }\n}',
    },
  ],
  project: {
    id: "ch10-projet",
    title: "Fil d'actualité générique avec Resumable",
    difficulty: "difficile",
    prompt:
      "Construis un mini système de notifications. Définis un trait `Resumable` avec une méthode obligatoire `resumer_auteur(&self) -> String` et une méthode `resumer(&self) -> String` dotée d'une **implémentation par défaut** qui s'appuie sur `resumer_auteur`. Implémente ce trait pour deux structs : `Article { titre, auteur, contenu }`, qui redéfinit `resumer` pour afficher le titre et l'auteur, et `Tweet { utilisateur, contenu, retweet }`, qui garde l'implémentation par défaut. Écris enfin une fonction générique `notifier(item: &impl Resumable) -> String` qui fonctionne avec n'importe quel type implémentant `Resumable`.",
    hints: [
      "La méthode par défaut peut s'appuyer sur `self.resumer_auteur()`, même si cette méthode n'a pas encore de corps concret dans le trait lui-même.",
      "Pour `Tweet`, un bloc `impl Resumable for Tweet` qui ne définit que `resumer_auteur` suffit : `resumer` sera hérité tel quel.",
      "`notifier` prend `&impl Resumable` : elle accepte une référence vers n'importe quel type qui implémente le trait, sans générique explicite.",
    ],
    starter:
      'pub trait Resumable {\n    fn resumer_auteur(&self) -> String;\n\n    // Ajoute ici une implémentation par défaut de `resumer`\n    // qui s\'appuie sur `resumer_auteur`.\n}\n\npub struct Article {\n    pub titre: String,\n    pub auteur: String,\n    pub contenu: String,\n}\n\n// Implémente `Resumable` pour `Article` :\n// - `resumer_auteur` renvoie l\'auteur\n// - `resumer` est redéfini pour afficher "titre, par auteur"\n\npub struct Tweet {\n    pub utilisateur: String,\n    pub contenu: String,\n    pub retweet: bool,\n}\n\n// Implémente `Resumable` pour `Tweet` en ne redéfinissant\n// que `resumer_auteur` (le tweet doit garder le résumé par défaut).\n\npub fn notifier(item: &impl Resumable) -> String {\n    todo!()\n}',
    solution:
      'pub trait Resumable {\n    fn resumer_auteur(&self) -> String;\n\n    fn resumer(&self) -> String {\n        format!("(Lire la suite de {}...)", self.resumer_auteur())\n    }\n}\n\npub struct Article {\n    pub titre: String,\n    pub auteur: String,\n    pub contenu: String,\n}\n\nimpl Resumable for Article {\n    fn resumer_auteur(&self) -> String {\n        self.auteur.clone()\n    }\n\n    fn resumer(&self) -> String {\n        format!("{}, par {}", self.titre, self.auteur)\n    }\n}\n\npub struct Tweet {\n    pub utilisateur: String,\n    pub contenu: String,\n    pub retweet: bool,\n}\n\nimpl Resumable for Tweet {\n    fn resumer_auteur(&self) -> String {\n        format!("@{}", self.utilisateur)\n    }\n}\n\npub fn notifier(item: &impl Resumable) -> String {\n    format!("Alerte actu ! {}", item.resumer())\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn article_exemple() -> Article {\n        Article {\n            titre: String::from("Le Rust conquiert le monde"),\n            auteur: String::from("Alice Dupont"),\n            contenu: String::from("..."),\n        }\n    }\n\n    fn tweet_exemple() -> Tweet {\n        Tweet {\n            utilisateur: String::from("rustlang"),\n            contenu: String::from("Rust 1.83 est sorti !"),\n            retweet: false,\n        }\n    }\n\n    #[test]\n    fn article_a_un_resume_personnalise() {\n        let article = article_exemple();\n        assert_eq!(article.resumer(), "Le Rust conquiert le monde, par Alice Dupont");\n    }\n\n    #[test]\n    fn tweet_utilise_le_resume_par_defaut() {\n        let tweet = tweet_exemple();\n        assert_eq!(tweet.resumer(), "(Lire la suite de @rustlang...)");\n    }\n\n    #[test]\n    fn notifier_fonctionne_avec_un_article() {\n        let article = article_exemple();\n        assert_eq!(\n            notifier(&article),\n            "Alerte actu ! Le Rust conquiert le monde, par Alice Dupont"\n        );\n    }\n\n    #[test]\n    fn notifier_fonctionne_avec_un_tweet() {\n        let tweet = tweet_exemple();\n        assert_eq!(notifier(&tweet), "Alerte actu ! (Lire la suite de @rustlang...)");\n    }\n\n    #[test]\n    fn resumer_auteur_renvoie_la_bonne_valeur() {\n        assert_eq!(article_exemple().resumer_auteur(), "Alice Dupont");\n        assert_eq!(tweet_exemple().resumer_auteur(), "@rustlang");\n    }\n}',
  },
  keyTakeaways: [
    "Un paramètre de type `T` entre chevrons rend une fonction, une struct ou un enum génériques ; le compilateur monomorphise chaque usage concret sans coût à l'exécution.",
    "Une borne de trait (`T: PartialOrd`) restreint un type générique aux types qui offrent le comportement requis.",
    "Un trait déclare des méthodes partagées ; une méthode avec corps est une implémentation par défaut que chaque type peut garder ou redéfinir.",
    "`impl Trait`, `<T: Trait>` et `where` expriment la même contrainte — « ce paramètre doit implémenter ce trait » — avec une lisibilité croissante selon la complexité.",
    "`impl Trait` en position de retour n'autorise qu'un seul type concret par fonction.",
    "Le borrow checker refuse toute référence qui pourrait survivre à la donnée qu'elle emprunte ; les annotations `'a` décrivent, sans les changer, les relations entre durées de vie.",
    "Les règles d'élision dispensent d'annoter les cas les plus courants : une seule référence en entrée, ou un `&self` parmi les paramètres.",
  ],
};
