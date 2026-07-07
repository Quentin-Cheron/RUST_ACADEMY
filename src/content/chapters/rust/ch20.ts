import type { Chapter } from "../../types";

export const ch20: Chapter = {
  number: 20,
  slug: "fonctionnalites-avancees",
  title: "Fonctionnalités avancées",
  subtitle: "unsafe, traits avancés, types avancés, closures et un survol des macros.",
  description:
    "Ce chapitre rassemble les coins les moins fréquentés de Rust : le bloc `unsafe` qui désactive certaines vérifications du compilateur, les traits avancés (types associés, surcharge d'opérateurs, syntaxe complètement qualifiée, supertraits, pattern newtype), les alias de type et le type « never » `!`, les pointeurs de fonction et les closures renvoyées depuis une fonction, et enfin un survol des macros. Tu ne t'en serviras pas tous les jours, mais savoir que ça existe — et pourquoi c'est dangereux ou puissant — te permettra de lire n'importe quel code Rust du monde réel.",
  minutes: 55,
  rustBookRef: "Chapitre 20 — Advanced Features",
  objectives: [
    "Identifier les 5 super-pouvoirs d'un bloc `unsafe` et savoir quand les utiliser avec parcimonie",
    "Déréférencer un pointeur brut et appeler une fonction `unsafe`",
    "Utiliser les types associés d'un trait et comprendre les paramètres génériques par défaut",
    "Surcharger un opérateur (`+`, `*`) via les traits `std::ops`",
    "Lever une ambiguïté de méthode avec la syntaxe complètement qualifiée",
    "Définir un supertrait et appliquer le pattern newtype",
    "Créer un alias de type avec `type` et reconnaître le type `!` (never)",
    "Renvoyer une closure depuis une fonction avec `Box<dyn Fn>`",
    "Distinguer une macro déclarative (`macro_rules!`) d'une macro procédurale",
  ],
  sections: [
    {
      id: "unsafe-rust",
      number: "20.1",
      title: "unsafe Rust",
      blocks: [
        {
          type: "paragraph",
          text: "Rust garantit la sécurité mémoire à la compilation, mais certaines opérations ne peuvent pas être vérifiées statiquement (interagir avec le système d'exploitation, du code C, ou écrire une structure de données de bas niveau). Le mot-clé `unsafe` ouvre un bloc où **5 super-pouvoirs** deviennent disponibles, normalement interdits :",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Déréférencer un pointeur brut (`*const T` / `*mut T`)",
            "Appeler une fonction ou méthode `unsafe`",
            "Accéder à ou modifier une variable statique mutable",
            "Implémenter un trait `unsafe`",
            "Accéder aux champs d'une `union`",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "unsafe ne désactive pas le borrow checker",
          text: "`unsafe` ne désactive **que** ces 5 opérations précises. Les emprunts, le typage et les autres règles restent vérifiés normalement. `unsafe` déplace simplement la responsabilité de certaines garanties du compilateur vers toi.",
        },
        {
          type: "code",
          language: "rust",
          filename: "raw_pointers.rs",
          code: "fn main() {\n    let mut num = 5;\n\n    let r1 = &num as *const i32;\n    let r2 = &mut num as *mut i32;\n\n    // Créer des pointeurs bruts est sûr, seul le déréférencement exige unsafe.\n    unsafe {\n        println!(\"r1 pointe vers : {}\", *r1);\n        println!(\"r2 pointe vers : {}\", *r2);\n    }\n}",
          caption: "Créer des pointeurs bruts est sans danger ; les déréférencer exige un bloc unsafe.",
        },
        {
          type: "code",
          language: "rust",
          filename: "unsafe_fn.rs",
          code: "unsafe fn dangereuse() {\n    println!(\"Cette fonction promet des invariants que le compilateur ne peut pas vérifier.\");\n}\n\nfn main() {\n    unsafe {\n        dangereuse();\n    }\n}",
        },
        {
          type: "usecase",
          title: "FFI et performance : les vraies raisons d'écrire unsafe",
          text: "En pratique, `unsafe` sert surtout à deux choses : appeler du code C via la FFI (`extern \"C\"`) — indispensable pour utiliser des bibliothèques systèmes ou embarquées — et implémenter des structures de données ou des optimisations où le compilateur ne peut pas prouver la sécurité mais toi si (buffers circulaires, structures internes de `Vec` ou `Rc`, etc.). Dans les deux cas, la règle d'or est de **garder le bloc `unsafe` minimal** et de l'encapsuler derrière une API sûre : le code appelant ne devrait jamais avoir besoin d'écrire `unsafe` lui-même.",
        },
        {
          type: "code",
          language: "rust",
          filename: "ffi.rs",
          code: "extern \"C\" {\n    fn abs(input: i32) -> i32;\n}\n\nfn main() {\n    unsafe {\n        println!(\"Valeur absolue de -3 selon la libc : {}\", abs(-3));\n    }\n}",
          caption: "FFI : appeler une fonction C nécessite un bloc unsafe car Rust ne peut pas vérifier son comportement.",
        },
      ],
    },
    {
      id: "traits-avances-associes",
      number: "20.2",
      title: "Traits avancés : types associés et surcharge d'opérateurs",
      blocks: [
        {
          type: "paragraph",
          text: "Un **type associé** lie un type à une implémentation de trait, sans paramètre générique. `Iterator` en est l'exemple canonique : chaque implémentation choisit son `Item`, mais un type ne peut implémenter `Iterator` qu'une seule fois (contrairement à un trait générique `Iterateur<T>`, implémentable plusieurs fois avec des `T` différents).",
        },
        {
          type: "code",
          language: "rust",
          filename: "type_associe.rs",
          code: "trait Iterateur {\n    type Item;\n\n    fn suivant(&mut self) -> Option<Self::Item>;\n}\n\nstruct Compteur {\n    valeur: u32,\n}\n\nimpl Iterateur for Compteur {\n    type Item = u32;\n\n    fn suivant(&mut self) -> Option<u32> {\n        if self.valeur < 5 {\n            self.valeur += 1;\n            Some(self.valeur)\n        } else {\n            None\n        }\n    }\n}\n\nfn main() {\n    let mut c = Compteur { valeur: 0 };\n    while let Some(n) = c.suivant() {\n        println!(\"{n}\");\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Les traits comme `Add` acceptent un **paramètre générique par défaut**, écrit `trait Add<Rhs = Self>`. Cela permet d'additionner un type avec lui-même sans rien préciser, tout en gardant la possibilité d'additionner avec un autre type si besoin. C'est ce mécanisme qui permet de **surcharger les opérateurs** en implémentant les traits de `std::ops`.",
        },
        {
          type: "code",
          language: "rust",
          filename: "operator_overload.rs",
          code: "use std::ops::Add;\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Add for Point {\n    type Output = Point;\n\n    fn add(self, autre: Point) -> Point {\n        Point {\n            x: self.x + autre.x,\n            y: self.y + autre.y,\n        }\n    }\n}\n\nfn main() {\n    let somme = Point { x: 1, y: 0 } + Point { x: 2, y: 3 };\n    println!(\"{somme:?}\"); // Point { x: 3, y: 3 }\n}",
          caption: "`impl Add for Point` donne un sens à l'opérateur `+` entre deux `Point`.",
        },
        {
          type: "usecase",
          title: "Surcharger les opérateurs pour l'ergonomie",
          text: "Surcharger `+`, `*` ou `==` transforme du code verbeux (`point_ajouter(p1, p2)`) en code qui se lit comme des mathématiques (`p1 + p2`). C'est très utile pour les types représentant des nombres, vecteurs, matrices, durées ou monnaies — tant que le sens de l'opérateur reste intuitif. Surcharger `+` pour qu'il fasse une soustraction serait un piège pour quiconque lit le code.",
        },
      ],
    },
    {
      id: "traits-avances-syntaxe",
      number: "20.2",
      title: "Traits avancés : syntaxe qualifiée, supertraits et newtype",
      blocks: [
        {
          type: "paragraph",
          text: "Quand deux traits (ou un trait et une méthode inhérente) définissent une méthode du même nom sur un même type, Rust ne sait pas laquelle appeler avec `valeur.methode()`. La **syntaxe complètement qualifiée** `<Type as Trait>::methode(valeur)` lève l'ambiguïté.",
        },
        {
          type: "code",
          language: "rust",
          filename: "syntaxe_qualifiee.rs",
          code: "trait Pilote {\n    fn voler(&self);\n}\n\ntrait Magicien {\n    fn voler(&self);\n}\n\nstruct Humain;\n\nimpl Pilote for Humain {\n    fn voler(&self) {\n        println!(\"Levage du gouvernail\");\n    }\n}\n\nimpl Magicien for Humain {\n    fn voler(&self) {\n        println!(\"Envolée !\");\n    }\n}\n\nfn main() {\n    let personne = Humain;\n    Pilote::voler(&personne);\n    Magicien::voler(&personne);\n    <Humain as Magicien>::voler(&personne);\n}",
        },
        {
          type: "paragraph",
          text: "Un **supertrait** exige qu'un type implémente déjà un autre trait avant de pouvoir implémenter le tien. `trait AfficheJolie: Display` signifie « tout type qui implémente `AfficheJolie` doit aussi implémenter `Display` », ce qui permet d'utiliser `{}` à l'intérieur des méthodes par défaut du trait.",
        },
        {
          type: "code",
          language: "rust",
          filename: "supertrait.rs",
          code: "use std::fmt;\n\ntrait AfficheJolie: fmt::Display {\n    fn affiche_jolie(&self) {\n        println!(\"*** {} ***\", self);\n    }\n}\n\nstruct Titre(String);\n\nimpl fmt::Display for Titre {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, \"{}\", self.0)\n    }\n}\n\nimpl AfficheJolie for Titre {}\n\nfn main() {\n    Titre(String::from(\"Rust Academy\")).affiche_jolie();\n}",
        },
        {
          type: "paragraph",
          text: "Enfin, le **pattern newtype** enveloppe un type existant dans une tuple struct à un seul champ. Comme ni le trait ni le type ne sont définis dans notre crate d'ordinaire (règle de cohérence orpheline), le newtype permet de contourner cette règle en créant un nouveau type local sur lequel on peut implémenter n'importe quel trait externe.",
        },
        {
          type: "code",
          language: "rust",
          filename: "newtype.rs",
          code: "use std::fmt;\n\nstruct Enveloppe(Vec<String>);\n\nimpl fmt::Display for Enveloppe {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, \"[{}]\", self.0.join(\", \"))\n    }\n}\n\nfn main() {\n    let e = Enveloppe(vec![String::from(\"un\"), String::from(\"deux\")]);\n    println!(\"{e}\"); // [un, deux]\n}",
          caption: "`Enveloppe` est locale à notre crate : on peut donc lui implémenter `Display`, même si `Vec<String>` ne l'implémente pas directement.",
        },
      ],
    },
    {
      id: "types-avances",
      number: "20.3",
      title: "Types avancés : alias, never type et DST",
      blocks: [
        {
          type: "paragraph",
          text: "Un **alias de type**, créé avec `type`, donne un second nom à un type existant. Il ne crée pas de nouveau type (contrairement au newtype) : c'est purement pour la lisibilité et pour raccourcir des signatures répétitives.",
        },
        {
          type: "code",
          language: "rust",
          filename: "alias.rs",
          code: "type Kilometres = i32;\n\ntype ResultatIO<T> = std::result::Result<T, std::io::Error>;\n\nfn distance_paris_lyon() -> Kilometres {\n    465\n}\n\nfn main() {\n    let d: Kilometres = distance_paris_lyon();\n    println!(\"{d} km\");\n}",
        },
        {
          type: "paragraph",
          text: "Le type `!`, appelé **never type**, représente l'absence totale de valeur : c'est le type de retour des fonctions qui ne reviennent jamais, comme celles qui appellent `panic!` en boucle. Il est aussi ce que renvoie `continue` dans un `match`, ce qui permet à Rust d'unifier les branches d'un `match` même quand une branche ne produit aucune valeur.",
        },
        {
          type: "code",
          language: "rust",
          filename: "never_type.rs",
          code: "fn boucle_infinie() -> ! {\n    loop {\n        println!(\"je ne reviens jamais\");\n    }\n}\n\nfn lire_nombre(entree: &str) -> i32 {\n    match entree.parse::<i32>() {\n        Ok(n) => n,\n        Err(_) => panic!(\"entrée invalide\"), // panic! a le type !, compatible avec i32\n    }\n}\n\nfn main() {\n    println!(\"{}\", lire_nombre(\"42\"));\n}",
        },
        {
          type: "callout",
          variant: "info",
          title: "Types de taille dynamique et Sized",
          text: "Des types comme `str` ou `dyn Trait` ont une taille inconnue à la compilation : ce sont des types de taille dynamique (DST). On ne peut les manipuler que derrière un pointeur (`&str`, `Box<dyn Trait>`). Par défaut, Rust ajoute une contrainte implicite `T: Sized` à tout paramètre générique ; l'écrire explicitement `T: ?Sized` autorise les DST, à condition de passer le type derrière une référence.",
        },
      ],
    },
    {
      id: "fonctions-closures-avancees",
      number: "20.4",
      title: "Fonctions et closures avancées",
      blocks: [
        {
          type: "paragraph",
          text: "Une fonction ordinaire peut être passée en argument grâce au type **pointeur de fonction** `fn` (à ne pas confondre avec les traits `Fn`, `FnMut`, `FnOnce` des closures). `fn` implémente les trois traits de closures, donc une fonction ordinaire peut toujours être passée là où une closure est attendue.",
        },
        {
          type: "code",
          language: "rust",
          filename: "fn_pointer.rs",
          code: "fn ajouter_un(x: i32) -> i32 {\n    x + 1\n}\n\nfn appliquer_deux_fois(f: fn(i32) -> i32, arg: i32) -> i32 {\n    f(arg) + f(arg)\n}\n\nfn main() {\n    let reponse = appliquer_deux_fois(ajouter_un, 5);\n    println!(\"{reponse}\"); // 12\n}",
        },
        {
          type: "paragraph",
          text: "Renvoyer une closure depuis une fonction pose un problème : les closures n'ont pas de taille connue à la compilation, on ne peut donc pas écrire `-> impl Fn(i32) -> i32` si le corps peut renvoyer des closures différentes selon un chemin de code. La solution la plus flexible est de renvoyer une **closure « boxée »**, `Box<dyn Fn(i32) -> i32>`, qui place la closure sur le tas derrière un pointeur de taille connue.",
        },
        {
          type: "code",
          language: "rust",
          filename: "closure_boxee.rs",
          code: "fn creer_addition(x: i32) -> Box<dyn Fn(i32) -> i32> {\n    Box::new(move |y| x + y)\n}\n\nfn main() {\n    let ajoute_cinq = creer_addition(5);\n    println!(\"{}\", ajoute_cinq(10)); // 15\n}",
          caption: "`move` transfère la propriété de `x` dans la closure, qui peut ensuite vivre plus longtemps que la fonction qui l'a créée.",
        },
      ],
    },
    {
      id: "macros",
      number: "20.5",
      title: "Survol des macros",
      blocks: [
        {
          type: "paragraph",
          text: "Une macro génère du code Rust à partir d'autre code Rust, avant la compilation proprement dite (métaprogrammation). Contrairement à une fonction, une macro peut accepter un nombre variable d'arguments (`println!(\"{} et {}\", a, b)`) et s'exécute à la compilation, pas à l'exécution. Il existe deux grandes familles.",
        },
        {
          type: "list",
          items: [
            "**Macros déclaratives** (`macro_rules!`) : elles fonctionnent par filtrage de motifs sur le code source, un peu comme un `match` sur des tokens. C'est ce qui définit `vec!` dans la bibliothèque standard.",
            "**Macros procédurales** : elles prennent du code Rust en entrée (un `TokenStream`), le manipulent avec du code Rust normal, et produisent un autre `TokenStream` en sortie. Elles se déclarent dans un crate séparé de type `proc-macro` et se déclinent en trois formes : macros `derive` (`#[derive(MonTrait)]`), macros attributs (`#[mon_attribut]`) et macros de type fonction (`ma_macro!(...)`, mais avec du code Rust arbitraire au lieu du filtrage par motif).",
          ],
        },
        {
          type: "code",
          language: "rust",
          filename: "macro_declarative.rs",
          code: "macro_rules! carre {\n    ($x:expr) => {\n        $x * $x\n    };\n}\n\nfn main() {\n    println!(\"{}\", carre!(4)); // 16\n}",
          caption: "Une macro déclarative minimale : `$x:expr` capture n'importe quelle expression Rust.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "En pratique, tu écriras rarement une macro procédurale toi-même en début de parcours : retiens surtout la distinction, car tu croiseras `#[derive(Debug)]`, `#[derive(Serialize)]` (serde) ou `#[tokio::main]` dans presque tout code Rust réel — ce sont toutes des macros procédurales.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch20-ex1",
      title: "Surcharger + pour Point",
      difficulty: "facile",
      prompt:
        "Implémente le trait `Add` de `std::ops` pour la struct `Point { x: i32, y: i32 }` afin que `p1 + p2` additionne les coordonnées composante par composante.",
      hints: [
        "`use std::ops::Add;` puis `impl Add for Point { type Output = Point; fn add(self, autre: Point) -> Point { ... } }`.",
        "Pense à dériver `PartialEq` et `Debug` sur `Point` pour pouvoir utiliser `assert_eq!` dans les tests.",
      ],
      starter:
        "use std::ops::Add;\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\n// Implémente le trait Add pour Point ici\n\nfn main() {}",
      solution:
        "use std::ops::Add;\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl Add for Point {\n    type Output = Point;\n\n    fn add(self, autre: Point) -> Point {\n        Point {\n            x: self.x + autre.x,\n            y: self.y + autre.y,\n        }\n    }\n}\n\nfn main() {}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn addition_de_deux_points() {\n        let p1 = Point { x: 1, y: 2 };\n        let p2 = Point { x: 3, y: 4 };\n        assert_eq!(p1 + p2, Point { x: 4, y: 6 });\n    }\n\n    #[test]\n    fn addition_avec_zero() {\n        let p = Point { x: 5, y: -3 };\n        let zero = Point { x: 0, y: 0 };\n        assert_eq!(p + zero, p);\n    }\n}",
    },
    {
      id: "ch20-ex2",
      title: "Un alias pour valider un âge",
      difficulty: "facile",
      prompt:
        "Crée un alias de type `ResultatValidation<T>` équivalent à `Result<T, String>`, puis écris `valider_age(age: i32) -> ResultatValidation<i32>` qui renvoie `Ok(age)` si `age` est compris entre 0 et 120 inclus, sinon `Err` avec un message décrivant l'erreur.",
      hints: [
        "`type ResultatValidation<T> = Result<T, String>;`",
        "`(0..=120).contains(&age)` teste l'intervalle inclusif.",
        "`format!(\"âge invalide : {age}\")` construit le message d'erreur.",
      ],
      starter:
        "type ResultatValidation<T> = Result<T, String>;\n\nfn valider_age(age: i32) -> ResultatValidation<i32> {\n    todo!()\n}",
      solution:
        "type ResultatValidation<T> = Result<T, String>;\n\nfn valider_age(age: i32) -> ResultatValidation<i32> {\n    if (0..=120).contains(&age) {\n        Ok(age)\n    } else {\n        Err(format!(\"âge invalide : {age}\"))\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn accepte_age_valide() {\n        assert_eq!(valider_age(30), Ok(30));\n    }\n\n    #[test]\n    fn refuse_age_negatif() {\n        assert!(valider_age(-1).is_err());\n    }\n\n    #[test]\n    fn refuse_age_trop_grand() {\n        assert!(valider_age(200).is_err());\n    }\n}",
    },
    {
      id: "ch20-ex3",
      title: "Une fabrique de multiplicateurs",
      difficulty: "moyen",
      prompt:
        "Écris `creer_multiplicateur(facteur: i32) -> Box<dyn Fn(i32) -> i32>`, une fonction qui renvoie une closure multipliant son argument par `facteur`.",
      hints: [
        "La closure doit capturer `facteur` par valeur : utilise `move`.",
        "`Box::new(move |x| x * facteur)` renvoie bien un `Box<dyn Fn(i32) -> i32>`.",
      ],
      starter:
        "fn creer_multiplicateur(facteur: i32) -> Box<dyn Fn(i32) -> i32> {\n    todo!()\n}",
      solution:
        "fn creer_multiplicateur(facteur: i32) -> Box<dyn Fn(i32) -> i32> {\n    Box::new(move |x| x * facteur)\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn multiplie_par_trois() {\n        let fois_trois = creer_multiplicateur(3);\n        assert_eq!(fois_trois(4), 12);\n    }\n\n    #[test]\n    fn multiplie_par_zero() {\n        let fois_zero = creer_multiplicateur(0);\n        assert_eq!(fois_zero(100), 0);\n    }\n\n    #[test]\n    fn facteur_negatif() {\n        let fois_moins_deux = creer_multiplicateur(-2);\n        assert_eq!(fois_moins_deux(5), -10);\n    }\n}",
    },
  ],
  project: {
    id: "ch20-projet",
    title: "Vecteur2D avec opérateurs surchargés",
    difficulty: "difficile",
    prompt:
      "Construis une struct `Vecteur2D { x: f64, y: f64 }` représentant un vecteur du plan. Fournis un constructeur `nouveau(x: f64, y: f64) -> Self`, une méthode `norme(&self) -> f64` calculant la norme euclidienne (`(x² + y²).sqrt()`), puis surcharge `Add` (addition de deux vecteurs) et `Mul<f64>` (multiplication par un scalaire, vecteur à gauche). C'est l'exercice qui combine toutes les briques du chapitre : traits `std::ops`, types associés `Output`, et méthodes classiques.",
    hints: [
      "`use std::ops::{Add, Mul};` puis deux blocs `impl` séparés, un par opérateur.",
      "Pour `Mul<f64>`, le type implémenté est `impl Mul<f64> for Vecteur2D`, car le scalaire (`f64`) n'est pas du même type que `Vecteur2D`.",
      "`f64` ne dérive pas `Eq`, seulement `PartialEq` : compare les résultats avec `assert_eq!` normalement, ça fonctionne grâce à `PartialEq`.",
    ],
    starter:
      "use std::ops::{Add, Mul};\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Vecteur2D {\n    x: f64,\n    y: f64,\n}\n\nimpl Vecteur2D {\n    fn nouveau(x: f64, y: f64) -> Self {\n        Vecteur2D { x, y }\n    }\n\n    fn norme(&self) -> f64 {\n        todo!()\n    }\n}\n\n// Implémente Add pour additionner deux Vecteur2D\n\n// Implémente Mul<f64> pour multiplier un Vecteur2D par un scalaire\n\nfn main() {}",
    solution:
      "use std::ops::{Add, Mul};\n\n#[derive(Debug, Clone, Copy, PartialEq)]\nstruct Vecteur2D {\n    x: f64,\n    y: f64,\n}\n\nimpl Vecteur2D {\n    fn nouveau(x: f64, y: f64) -> Self {\n        Vecteur2D { x, y }\n    }\n\n    fn norme(&self) -> f64 {\n        (self.x * self.x + self.y * self.y).sqrt()\n    }\n}\n\nimpl Add for Vecteur2D {\n    type Output = Vecteur2D;\n\n    fn add(self, autre: Vecteur2D) -> Vecteur2D {\n        Vecteur2D {\n            x: self.x + autre.x,\n            y: self.y + autre.y,\n        }\n    }\n}\n\nimpl Mul<f64> for Vecteur2D {\n    type Output = Vecteur2D;\n\n    fn mul(self, scalaire: f64) -> Vecteur2D {\n        Vecteur2D {\n            x: self.x * scalaire,\n            y: self.y * scalaire,\n        }\n    }\n}\n\nfn main() {\n    let a = Vecteur2D::nouveau(1.0, 2.0);\n    let b = Vecteur2D::nouveau(3.0, 4.0);\n    println!(\"{:?}\", a + b);\n    println!(\"{:?}\", a * 2.0);\n    println!(\"{}\", b.norme());\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn addition_de_vecteurs() {\n        let a = Vecteur2D::nouveau(1.0, 2.0);\n        let b = Vecteur2D::nouveau(3.0, 4.0);\n        assert_eq!(a + b, Vecteur2D::nouveau(4.0, 6.0));\n    }\n\n    #[test]\n    fn multiplication_par_scalaire() {\n        let a = Vecteur2D::nouveau(1.0, 2.0);\n        assert_eq!(a * 2.0, Vecteur2D::nouveau(2.0, 4.0));\n    }\n\n    #[test]\n    fn multiplication_par_zero() {\n        let a = Vecteur2D::nouveau(5.0, -3.0);\n        assert_eq!(a * 0.0, Vecteur2D::nouveau(0.0, 0.0));\n    }\n\n    #[test]\n    fn norme_vecteur_3_4() {\n        let v = Vecteur2D::nouveau(3.0, 4.0);\n        assert_eq!(v.norme(), 5.0);\n    }\n\n    #[test]\n    fn norme_vecteur_nul() {\n        let v = Vecteur2D::nouveau(0.0, 0.0);\n        assert_eq!(v.norme(), 0.0);\n    }\n}",
  },
  keyTakeaways: [
    "`unsafe` active 5 super-pouvoirs précis (dont déréférencer un pointeur brut et appeler une fonction unsafe) ; il ne désactive ni le typage ni les emprunts, et doit rester minimal et encapsulé.",
    "Les types associés (`type Item;`) lient un type à une implémentation de trait sans paramètre générique explicite.",
    "Surcharger un opérateur revient à implémenter un trait de `std::ops` (`Add`, `Mul`, ...) qui définit un `type Output`.",
    "La syntaxe complètement qualifiée `<Type as Trait>::methode(...)` lève les ambiguïtés entre méthodes de même nom.",
    "Un supertrait (`trait A: B`) exige que tout type implémentant `A` implémente aussi `B` ; le pattern newtype contourne la règle de cohérence orpheline en enveloppant un type externe.",
    "`type` crée un alias (même type, juste un autre nom) ; `!` est le type des fonctions qui ne reviennent jamais.",
    "Une closure renvoyée par une fonction doit généralement être boxée : `Box<dyn Fn(...) -> ...>`.",
    "Les macros déclaratives (`macro_rules!`) filtrent des motifs de code ; les macros procédurales manipulent un `TokenStream` avec du Rust normal.",
  ],
};
