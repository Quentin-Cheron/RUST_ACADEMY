import type { Chapter } from "../types";

export const ch05: Chapter = {
  number: 5,
  slug: "structures",
  title: "Les structures (structs)",
  subtitle: "Regrouper des données liées et leur donner un comportement.",
  description:
    "Les tuples permettent de regrouper des valeurs, mais on perd vite le fil de ce que représente chaque champ. Les structs (structures) résolvent ce problème : elles nomment chaque donnée et permettent d'y attacher des méthodes. Dans ce chapitre, on définit des structs, on les instancie, on leur ajoute des comportements via des blocs `impl`, et on apprend à les afficher facilement pour le débogage.",
  minutes: 45,
  rustBookRef: "Chapitre 5 — Using Structs",
  objectives: [
    "Définir une struct classique et l'instancier",
    "Utiliser le raccourci d'initialisation et la syntaxe de mise à jour `..autre`",
    "Distinguer tuple structs et unit structs",
    "Écrire des méthodes avec `&self`, `&mut self` et `self`",
    "Créer des fonctions associées comme `Rectangle::square`",
    "Dériver `Debug` pour afficher une struct avec `{:?}` et `{:#?}`",
  ],
  sections: [
    {
      id: "definir-une-struct",
      title: "Définir et instancier une struct",
      blocks: [
        {
          type: "paragraph",
          text: "Une **struct** regroupe plusieurs valeurs liées, chacune nommée par un champ. Contrairement à un tuple, l'ordre n'a plus d'importance : on accède aux données par leur nom, ce qui rend le code beaucoup plus lisible.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nfn main() {\n    let rect = Rectangle {\n        largeur: 30,\n        hauteur: 50,\n    };\n\n    println!(\"La largeur est {}\", rect.largeur);\n    println!(\"La hauteur est {}\", rect.hauteur);\n}",
        },
        {
          type: "paragraph",
          text: "On accède à un champ avec la notation `.` (`rect.largeur`). Une instance de struct est, par défaut, **immuable** : impossible de modifier un champ sans que toute la variable soit déclarée `mut`.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct Utilisateur {\n    nom: String,\n    email: String,\n    actif: bool,\n    connexions: u64,\n}\n\nfn main() {\n    let mut utilisateur1 = Utilisateur {\n        nom: String::from(\"Alice\"),\n        email: String::from(\"alice@example.com\"),\n        actif: true,\n        connexions: 0,\n    };\n\n    // Comme utilisateur1 est `mut`, on peut modifier n'importe quel champ.\n    utilisateur1.connexions += 1;\n    utilisateur1.email = String::from(\"alice@rust-academy.fr\");\n}",
          caption: "Il est impossible de rendre un seul champ mutable : c'est toute l'instance qui l'est, ou aucun champ.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Rust ne permet pas de marquer un champ `mut` individuellement. Si tu as besoin qu'une partie seulement de la struct soit modifiable, c'est souvent le signe qu'elle devrait être scindée en deux structs.",
        },
      ],
    },
    {
      id: "raccourcis-syntaxiques",
      title: "Raccourci d'initialisation et syntaxe de mise à jour",
      blocks: [
        {
          type: "paragraph",
          text: "Quand un paramètre de fonction porte le même nom qu'un champ, on peut utiliser le **raccourci d'initialisation** (field init shorthand) pour éviter la répétition `champ: champ`.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct Utilisateur {\n    nom: String,\n    email: String,\n    actif: bool,\n    connexions: u64,\n}\n\nfn construire_utilisateur(nom: String, email: String) -> Utilisateur {\n    Utilisateur {\n        nom,       // équivalent à nom: nom,\n        email,     // équivalent à email: email,\n        actif: true,\n        connexions: 0,\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Pour créer une nouvelle instance qui reprend la plupart des champs d'une autre, la **syntaxe de mise à jour** `..autre` copie ou déplace tous les champs restants depuis `autre`.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn main() {\n    let utilisateur1 = Utilisateur {\n        nom: String::from(\"Alice\"),\n        email: String::from(\"alice@example.com\"),\n        actif: true,\n        connexions: 0,\n    };\n\n    let utilisateur2 = Utilisateur {\n        email: String::from(\"bob@example.com\"),\n        ..utilisateur1\n    };\n\n    // Attention : `nom` (un String, non-Copy) a été déplacé dans utilisateur2.\n    // utilisateur1.nom n'est donc plus utilisable ici.\n    println!(\"{}\", utilisateur2.nom);\n}",
        },
        {
          type: "callout",
          variant: "info",
          text: "`..autre` doit toujours venir en dernier dans les accolades. Les champs qu'il complète sont déplacés (move) s'ils ne sont pas `Copy`, ou copiés dans le cas contraire — les mêmes règles de possession que partout ailleurs en Rust s'appliquent.",
        },
      ],
    },
    {
      id: "tuple-structs-unit-structs",
      title: "Tuple structs et unit structs",
      blocks: [
        {
          type: "paragraph",
          text: "Une **tuple struct** a un nom mais ses champs ne sont pas nommés, seulement typés et positionnés — utile quand on veut donner un type distinct à un tuple sans définir de noms de champs.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct Couleur(i32, i32, i32);\nstruct Point(i32, i32, i32);\n\nfn main() {\n    let noir = Couleur(0, 0, 0);\n    let origine = Point(0, 0, 0);\n\n    println!(\"Rouge = {}\", noir.0);\n    println!(\"X = {}\", origine.0);\n}",
        },
        {
          type: "list",
          items: [
            "`Couleur` et `Point` ont la même forme `(i32, i32, i32)` mais sont des types distincts : impossible de passer un `Couleur` là où on attend un `Point`.",
            "On accède aux champs par index avec `.0`, `.1`, `.2`, comme pour un tuple classique.",
          ],
        },
        {
          type: "paragraph",
          text: "Une **unit struct** (struct unité) n'a aucun champ. Elle occupe zéro octet et sert surtout à implémenter un trait sur un type qui n'a pas besoin de stocker de donnée.",
        },
        {
          type: "code",
          language: "rust",
          code: "struct SujetDeMarqueur;\n\nfn main() {\n    let _marqueur = SujetDeMarqueur;\n}",
        },
      ],
    },
    {
      id: "methodes",
      title: "Des méthodes avec les blocs impl",
      blocks: [
        {
          type: "paragraph",
          text: "Les **méthodes** ressemblent aux fonctions, mais sont définies dans le contexte d'une struct (ou d'une enum, d'un trait) via un bloc `impl`. Leur premier paramètre est toujours une forme de `self`, qui représente l'instance sur laquelle la méthode est appelée.",
        },
        {
          type: "code",
          language: "rust",
          code: "#[derive(Debug)]\nstruct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    // &self : emprunt immutable, la méthode lit seulement l'instance.\n    fn aire(&self) -> u32 {\n        self.largeur * self.hauteur\n    }\n\n    // &mut self : emprunt mutable, la méthode modifie l'instance.\n    fn agrandir(&mut self, facteur: u32) {\n        self.largeur *= facteur;\n        self.hauteur *= facteur;\n    }\n}\n\nfn main() {\n    let mut rect = Rectangle { largeur: 30, hauteur: 50 };\n    println!(\"Aire = {}\", rect.aire());\n\n    rect.agrandir(2);\n    println!(\"{:?}\", rect);\n}",
        },
        {
          type: "list",
          items: [
            "`&self` : emprunte l'instance en lecture seule — le cas le plus fréquent.",
            "`&mut self` : emprunte l'instance en écriture, pour la modifier.",
            "`self` (sans `&`) : prend possession de l'instance, souvent utilisé pour transformer une valeur en une autre et empêcher toute réutilisation de l'originale.",
          ],
        },
        {
          type: "paragraph",
          text: "Une méthode peut recevoir d'autres paramètres après `self`, y compris une référence vers une autre instance du même type :",
        },
        {
          type: "code",
          language: "rust",
          code: "impl Rectangle {\n    fn peut_contenir(&self, autre: &Rectangle) -> bool {\n        self.largeur > autre.largeur && self.hauteur > autre.hauteur\n    }\n}\n\nfn main() {\n    let grand = Rectangle { largeur: 30, hauteur: 50 };\n    let petit = Rectangle { largeur: 10, hauteur: 40 };\n\n    println!(\"{}\", grand.peut_contenir(&petit)); // true\n    println!(\"{}\", petit.peut_contenir(&grand)); // false\n}",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Rust gère l'emprunt automatiquement à l'appel : `rect.aire()` est sucre syntaxique pour `Rectangle::aire(&rect)`. Pas besoin d'écrire `(&rect).aire()` toi-même.",
        },
      ],
    },
    {
      id: "fonctions-associees",
      title: "Fonctions associées",
      blocks: [
        {
          type: "paragraph",
          text: "Toutes les fonctions définies dans un bloc `impl` ne prennent pas forcément `self` en premier paramètre. Celles qui n'en prennent pas sont des **fonctions associées** : elles sont liées au type, pas à une instance. On les appelle avec la syntaxe `Type::fonction(...)`. Le cas le plus courant est un constructeur, souvent appelé `new`.",
        },
        {
          type: "code",
          language: "rust",
          code: "impl Rectangle {\n    fn new(largeur: u32, hauteur: u32) -> Rectangle {\n        Rectangle { largeur, hauteur }\n    }\n\n    fn square(taille: u32) -> Rectangle {\n        Rectangle {\n            largeur: taille,\n            hauteur: taille,\n        }\n    }\n}\n\nfn main() {\n    let rect = Rectangle::new(30, 50);\n    let carre = Rectangle::square(20);\n\n    println!(\"{}\", rect.aire());\n    println!(\"{}\", carre.aire());\n}",
        },
        {
          type: "paragraph",
          text: "Un même type peut avoir plusieurs blocs `impl` séparés — utile pour organiser le code, par exemple un bloc pour les méthodes de base et un autre pour une implémentation de trait.",
        },
        {
          type: "code",
          language: "rust",
          code: "impl Rectangle {\n    fn perimetre(&self) -> u32 {\n        2 * (self.largeur + self.hauteur)\n    }\n}\n\nimpl Rectangle {\n    fn est_carre(&self) -> bool {\n        self.largeur == self.hauteur\n    }\n}",
        },
      ],
    },
    {
      id: "debug-et-choix",
      title: "Déboguer avec Debug et bien choisir sa struct",
      blocks: [
        {
          type: "paragraph",
          text: "Par défaut, `println!(\"{}\")` ne sait pas afficher une struct : il faut lui dire comment. `#[derive(Debug)]` génère automatiquement une implémentation qui permet d'utiliser le format de débogage `{:?}` (compact) ou `{:#?}` (indenté, plus lisible pour les structs imbriquées).",
        },
        {
          type: "code",
          language: "rust",
          code: "#[derive(Debug)]\nstruct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nfn main() {\n    let rect = Rectangle { largeur: 30, hauteur: 50 };\n\n    println!(\"{:?}\", rect);\n    // Rectangle { largeur: 30, hauteur: 50 }\n\n    println!(\"{:#?}\", rect);\n    // Rectangle {\n    //     largeur: 30,\n    //     hauteur: 50,\n    // }\n\n    dbg!(&rect); // affiche aussi le fichier et la ligne, pratique en développement\n}",
        },
        {
          type: "callout",
          variant: "info",
          title: "dbg! vs println!",
          text: "`dbg!` écrit sur la sortie d'erreur (stderr), affiche le fichier et la ligne d'où il est appelé, et renvoie la valeur qu'on lui passe — on peut donc l'insérer temporairement au milieu d'une expression sans casser le code.",
        },
        {
          type: "usecase",
          title: "Struct ou tuple : comment choisir ?",
          text: "Un tuple `(u32, u32)` suffit pour deux nombres liés de façon évidente et locale, par exemple une paire `(min, max)` utilisée sur trois lignes. Dès que la signification de chaque valeur n'est pas immédiatement claire, que la donnée sort du scope local (paramètre de fonction, champ d'une autre struct, valeur de retour), ou que tu veux y attacher des méthodes (`aire`, `peut_contenir`...), préfère une struct nommée comme `Rectangle { largeur, hauteur }`. Le compilateur ne fait pas la différence en performance ; la différence est humaine : les noms de champs documentent le code et évitent des bugs du type « j'ai inversé largeur et hauteur ».",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch5-ex1",
      title: "L'aire d'un rectangle",
      difficulty: "facile",
      prompt:
        "Définis une struct `Rectangle` avec des champs `largeur: u32` et `hauteur: u32`, puis implémente une méthode `aire(&self) -> u32` qui renvoie l'aire du rectangle.",
      hints: [
        "Le bloc `impl Rectangle { ... }` accueille les méthodes.",
        "`&self` te donne un accès en lecture aux champs via `self.largeur` et `self.hauteur`.",
      ],
      starter:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn aire(&self) -> u32 {\n        todo!()\n    }\n}",
      solution:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn aire(&self) -> u32 {\n        self.largeur * self.hauteur\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn aire_rectangle_classique() {\n        let rect = Rectangle { largeur: 30, hauteur: 50 };\n        assert_eq!(rect.aire(), 1500);\n    }\n\n    #[test]\n    fn aire_rectangle_plat() {\n        let rect = Rectangle { largeur: 10, hauteur: 0 };\n        assert_eq!(rect.aire(), 0);\n    }\n}",
    },
    {
      id: "ch5-ex2",
      title: "Un rectangle peut-il en contenir un autre ?",
      difficulty: "moyen",
      prompt:
        "Toujours avec `Rectangle { largeur: u32, hauteur: u32 }`, ajoute une méthode `peut_contenir(&self, autre: &Rectangle) -> bool` qui renvoie `true` si `self` peut entièrement contenir `autre` (c'est-à-dire si `self` est strictement plus grand que `autre` sur les deux dimensions).",
      hints: [
        "« Strictement plus grand » se traduit par `>`, pas `>=`.",
        "Combine les deux comparaisons avec `&&`.",
      ],
      starter:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn peut_contenir(&self, autre: &Rectangle) -> bool {\n        todo!()\n    }\n}",
      solution:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn peut_contenir(&self, autre: &Rectangle) -> bool {\n        self.largeur > autre.largeur && self.hauteur > autre.hauteur\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn grand_contient_petit() {\n        let grand = Rectangle { largeur: 30, hauteur: 50 };\n        let petit = Rectangle { largeur: 10, hauteur: 40 };\n        assert!(grand.peut_contenir(&petit));\n    }\n\n    #[test]\n    fn petit_ne_contient_pas_grand() {\n        let grand = Rectangle { largeur: 30, hauteur: 50 };\n        let petit = Rectangle { largeur: 10, hauteur: 40 };\n        assert!(!petit.peut_contenir(&grand));\n    }\n\n    #[test]\n    fn rectangles_egaux_ne_se_contiennent_pas() {\n        let a = Rectangle { largeur: 20, hauteur: 20 };\n        let b = Rectangle { largeur: 20, hauteur: 20 };\n        assert!(!a.peut_contenir(&b));\n    }\n}",
    },
    {
      id: "ch5-ex3",
      title: "Un carré via une fonction associée",
      difficulty: "facile",
      prompt:
        "Ajoute à `Rectangle` une fonction associée `square(taille: u32) -> Rectangle` qui construit un rectangle dont la largeur et la hauteur valent toutes les deux `taille`. Souviens-toi : une fonction associée ne prend pas `self`, elle s'appelle avec `Rectangle::square(...)`.",
      hints: [
        "Une fonction associée est simplement une fonction définie dans le bloc `impl`, sans paramètre `self`.",
        "Le raccourci d'initialisation évite d'écrire `largeur: taille, hauteur: taille`.",
      ],
      starter:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn square(taille: u32) -> Rectangle {\n        todo!()\n    }\n}",
      solution:
        "struct Rectangle {\n    largeur: u32,\n    hauteur: u32,\n}\n\nimpl Rectangle {\n    fn square(taille: u32) -> Rectangle {\n        Rectangle {\n            largeur: taille,\n            hauteur: taille,\n        }\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn carre_a_dimensions_egales() {\n        let c = Rectangle::square(20);\n        assert_eq!(c.largeur, 20);\n        assert_eq!(c.hauteur, 20);\n    }\n\n    #[test]\n    fn carre_de_taille_zero() {\n        let c = Rectangle::square(0);\n        assert_eq!(c.largeur, 0);\n        assert_eq!(c.hauteur, 0);\n    }\n}",
    },
    {
      id: "ch5-ex4",
      title: "Construire et désactiver un utilisateur",
      difficulty: "moyen",
      prompt:
        "On te donne une struct `Utilisateur` avec les champs `nom: String`, `email: String` et `actif: bool`. Écris `construire_utilisateur(nom: String, email: String) -> Utilisateur` qui crée un utilisateur actif en utilisant le raccourci d'initialisation, puis `desactiver(utilisateur: Utilisateur) -> Utilisateur` qui renvoie un nouvel utilisateur identique mais avec `actif: false`, en utilisant la syntaxe de mise à jour `..`.",
      hints: [
        "Le raccourci d'initialisation : `Utilisateur { nom, email, actif: true }`.",
        "La syntaxe de mise à jour : `Utilisateur { actif: false, ..utilisateur }`.",
      ],
      starter:
        "#[derive(Debug, PartialEq, Clone)]\nstruct Utilisateur {\n    nom: String,\n    email: String,\n    actif: bool,\n}\n\nfn construire_utilisateur(nom: String, email: String) -> Utilisateur {\n    todo!()\n}\n\nfn desactiver(utilisateur: Utilisateur) -> Utilisateur {\n    todo!()\n}",
      solution:
        "#[derive(Debug, PartialEq, Clone)]\nstruct Utilisateur {\n    nom: String,\n    email: String,\n    actif: bool,\n}\n\nfn construire_utilisateur(nom: String, email: String) -> Utilisateur {\n    Utilisateur {\n        nom,\n        email,\n        actif: true,\n    }\n}\n\nfn desactiver(utilisateur: Utilisateur) -> Utilisateur {\n    Utilisateur {\n        actif: false,\n        ..utilisateur\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn construction_par_defaut_active() {\n        let u = construire_utilisateur(String::from(\"Alice\"), String::from(\"alice@example.com\"));\n        assert_eq!(u.nom, \"Alice\");\n        assert_eq!(u.email, \"alice@example.com\");\n        assert!(u.actif);\n    }\n\n    #[test]\n    fn desactivation_conserve_les_autres_champs() {\n        let u = construire_utilisateur(String::from(\"Bob\"), String::from(\"bob@example.com\"));\n        let u2 = desactiver(u.clone());\n        assert_eq!(u2.nom, u.nom);\n        assert_eq!(u2.email, u.email);\n        assert!(!u2.actif);\n    }\n}",
    },
  ],
  project: {
    id: "ch5-projet",
    title: "Un mini compte bancaire",
    difficulty: "difficile",
    prompt:
      "Construis une struct `CompteBancaire` avec les champs `titulaire: String`, `solde: f64` et `historique: Vec<String>`. Implémente : `nouveau(titulaire: &str) -> CompteBancaire` (fonction associée, solde à 0.0 et historique vide) ; `deposer(&mut self, montant: f64) -> Result<(), String>` qui ajoute au solde et enregistre une ligne dans l'historique, ou renvoie une erreur si `montant` n'est pas strictement positif ; `retirer(&mut self, montant: f64) -> Result<(), String>` qui retire du solde et enregistre une ligne, ou renvoie une erreur si le montant n'est pas strictement positif ou dépasse le solde disponible ; `solde(&self) -> f64` et `historique(&self) -> &Vec<String>` pour consulter l'état du compte sans le modifier. Ce projet combine tout le chapitre : struct, fonction associée, méthodes `&self`/`&mut self`, et `Result` du chapitre précédent pour signaler les échecs.",
    hints: [
      "`nouveau` est une fonction associée : elle ne prend pas `self`, elle construit l'instance.",
      "`deposer` et `retirer` ont besoin de `&mut self` puisqu'ils modifient `solde` et `historique`.",
      "`solde` et `historique` ne modifient rien : `&self` suffit.",
      "`format!(\"Dépôt de {:.2}\", montant)` permet de construire une ligne d'historique lisible.",
    ],
    starter:
      "pub struct CompteBancaire {\n    titulaire: String,\n    solde: f64,\n    historique: Vec<String>,\n}\n\nimpl CompteBancaire {\n    pub fn nouveau(titulaire: &str) -> CompteBancaire {\n        todo!()\n    }\n\n    pub fn deposer(&mut self, montant: f64) -> Result<(), String> {\n        todo!()\n    }\n\n    pub fn retirer(&mut self, montant: f64) -> Result<(), String> {\n        todo!()\n    }\n\n    pub fn solde(&self) -> f64 {\n        todo!()\n    }\n\n    pub fn historique(&self) -> &Vec<String> {\n        todo!()\n    }\n}",
    solution:
      "pub struct CompteBancaire {\n    titulaire: String,\n    solde: f64,\n    historique: Vec<String>,\n}\n\nimpl CompteBancaire {\n    pub fn nouveau(titulaire: &str) -> CompteBancaire {\n        CompteBancaire {\n            titulaire: titulaire.to_string(),\n            solde: 0.0,\n            historique: Vec::new(),\n        }\n    }\n\n    pub fn deposer(&mut self, montant: f64) -> Result<(), String> {\n        if montant <= 0.0 {\n            return Err(String::from(\"le montant doit être strictement positif\"));\n        }\n\n        self.solde += montant;\n        self.historique.push(format!(\"Dépôt de {:.2}\", montant));\n        Ok(())\n    }\n\n    pub fn retirer(&mut self, montant: f64) -> Result<(), String> {\n        if montant <= 0.0 {\n            return Err(String::from(\"le montant doit être strictement positif\"));\n        }\n        if montant > self.solde {\n            return Err(String::from(\"solde insuffisant\"));\n        }\n\n        self.solde -= montant;\n        self.historique.push(format!(\"Retrait de {:.2}\", montant));\n        Ok(())\n    }\n\n    pub fn solde(&self) -> f64 {\n        self.solde\n    }\n\n    pub fn historique(&self) -> &Vec<String> {\n        &self.historique\n    }\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn nouveau_compte_a_solde_nul() {\n        let compte = CompteBancaire::nouveau(\"Alice\");\n        assert_eq!(compte.solde(), 0.0);\n        assert!(compte.historique().is_empty());\n    }\n\n    #[test]\n    fn depot_augmente_le_solde_et_l_historique() {\n        let mut compte = CompteBancaire::nouveau(\"Alice\");\n        assert!(compte.deposer(100.0).is_ok());\n        assert_eq!(compte.solde(), 100.0);\n        assert_eq!(compte.historique().len(), 1);\n    }\n\n    #[test]\n    fn depot_negatif_est_refuse() {\n        let mut compte = CompteBancaire::nouveau(\"Alice\");\n        assert!(compte.deposer(-10.0).is_err());\n        assert_eq!(compte.solde(), 0.0);\n    }\n\n    #[test]\n    fn retrait_valide_diminue_le_solde() {\n        let mut compte = CompteBancaire::nouveau(\"Bob\");\n        compte.deposer(200.0).unwrap();\n        assert!(compte.retirer(50.0).is_ok());\n        assert_eq!(compte.solde(), 150.0);\n        assert_eq!(compte.historique().len(), 2);\n    }\n\n    #[test]\n    fn retrait_superieur_au_solde_est_refuse() {\n        let mut compte = CompteBancaire::nouveau(\"Bob\");\n        compte.deposer(50.0).unwrap();\n        let resultat = compte.retirer(100.0);\n        assert!(resultat.is_err());\n        assert_eq!(compte.solde(), 50.0);\n    }\n\n    #[test]\n    fn retrait_negatif_est_refuse() {\n        let mut compte = CompteBancaire::nouveau(\"Bob\");\n        assert!(compte.retirer(-5.0).is_err());\n    }\n}",
  },
  keyTakeaways: [
    "Une struct nomme ses champs, contrairement à un tuple : `rect.largeur` plutôt que `rect.0`.",
    "Une instance est mutable en bloc, jamais champ par champ.",
    "Le raccourci d'initialisation (`nom` au lieu de `nom: nom`) et la syntaxe `..autre` évitent la répétition.",
    "Les tuple structs (`Point(i32, i32, i32)`) et unit structs (`struct Marqueur;`) couvrent des besoins plus spécifiques.",
    "Les méthodes vivent dans un bloc `impl` et prennent `&self`, `&mut self` ou `self` selon le besoin d'accès.",
    "Les fonctions associées (`Rectangle::square`) n'ont pas de `self` et s'appellent via `Type::fonction(...)`.",
    "`#[derive(Debug)]` + `{:?}` / `{:#?}` (ou `dbg!`) sont les outils de base pour inspecter une struct.",
  ],
};
