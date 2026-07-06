import type { ReviewExercise } from "./types";

// Exercices de révision transversaux : chacun mélange les notions de plusieurs chapitres.
// Un exercice n'est débloqué que lorsque TOUS les chapitres listés dans `chapters` sont terminés.

export const reviewExercises: ReviewExercise[] = [
  {
    id: "rev-01",
    title: "Premier mot",
    difficulty: "facile",
    chapters: ["concepts-de-base", "ownership"],
    prompt:
      "Écris une fonction `premier_mot(s: &str) -> &str` qui renvoie le premier mot d'une chaîne (tout ce qui précède le premier espace), ou la chaîne entière s'il n'y a pas d'espace. Tu combines ici les **slices** du chapitre Ownership avec le contrôle de flux des Concepts de base.",
    hints: [
      "`s.find(' ')` renvoie un `Option<usize>` avec la position du premier espace.",
      "Une slice se construit avec `&s[..i]`.",
      "Un `match` sur l'`Option` gère les deux cas proprement.",
    ],
    starter: `/// Renvoie le premier mot de \`s\`, ou \`s\` en entier s'il n'y a pas d'espace.
pub fn premier_mot(s: &str) -> &str {
    // TODO : trouve le premier espace, puis renvoie la slice correspondante.
    todo!()
}`,
    solution: `pub fn premier_mot(s: &str) -> &str {
    // \`find\` renvoie la position du premier espace, s'il existe.
    match s.find(' ') {
        Some(i) => &s[..i], // slice du début jusqu'à l'espace (exclu)
        None => s,          // pas d'espace : toute la chaîne est le premier mot
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mot_simple() {
        assert_eq!(premier_mot("bonjour tout le monde"), "bonjour");
    }

    #[test]
    fn sans_espace() {
        assert_eq!(premier_mot("rust"), "rust");
    }

    #[test]
    fn chaine_vide() {
        assert_eq!(premier_mot(""), "");
    }
}`,
  },
  {
    id: "rev-02",
    title: "Inverser les mots",
    difficulty: "facile",
    chapters: ["ownership", "collections"],
    prompt:
      "Écris `inverser_mots(s: &str) -> String` qui renvoie une **nouvelle** `String` où l'ordre des mots est inversé (« le chat dort » → « dort chat le »). Attention à l'ownership : tu reçois un emprunt et tu dois produire une chaîne possédée.",
    hints: [
      "`s.split_whitespace()` découpe la chaîne en mots.",
      "`rev()` inverse l'ordre, `collect::<Vec<_>>()` rassemble dans un vecteur.",
      "`join(\" \")` recolle les mots avec des espaces.",
    ],
    starter: `/// Renvoie une nouvelle chaîne avec les mots en ordre inverse.
pub fn inverser_mots(s: &str) -> String {
    // TODO : découpe, inverse, puis recolle avec des espaces.
    todo!()
}`,
    solution: `pub fn inverser_mots(s: &str) -> String {
    // On découpe en mots, on inverse l'ordre, puis on recolle.
    s.split_whitespace()
        .rev()
        .collect::<Vec<_>>()
        .join(" ")
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trois_mots() {
        assert_eq!(inverser_mots("le chat dort"), "dort chat le");
    }

    #[test]
    fn un_seul_mot() {
        assert_eq!(inverser_mots("rust"), "rust");
    }

    #[test]
    fn chaine_vide() {
        assert_eq!(inverser_mots(""), "");
    }
}`,
  },
  {
    id: "rev-03",
    title: "Rectangles emboîtés",
    difficulty: "facile",
    chapters: ["structures", "concepts-de-base"],
    prompt:
      "Complète la struct `Rectangle` avec trois éléments : une méthode `aire`, une méthode `peut_contenir(&self, autre: &Rectangle) -> bool` (vrai si `autre` tient **strictement** dedans) et une fonction associée `carre(cote: u32) -> Rectangle`.",
    hints: [
      "Une fonction associée n'a pas de paramètre `self` et s'appelle avec `Rectangle::carre(3)`.",
      "« Strictement » signifie `>` et non `>=`.",
    ],
    starter: `pub struct Rectangle {
    pub largeur: u32,
    pub hauteur: u32,
}

impl Rectangle {
    pub fn aire(&self) -> u32 {
        todo!()
    }

    pub fn peut_contenir(&self, autre: &Rectangle) -> bool {
        todo!()
    }

    pub fn carre(cote: u32) -> Rectangle {
        todo!()
    }
}`,
    solution: `pub struct Rectangle {
    pub largeur: u32,
    pub hauteur: u32,
}

impl Rectangle {
    pub fn aire(&self) -> u32 {
        self.largeur * self.hauteur
    }

    // \`autre\` tient dedans si ses deux dimensions sont strictement plus petites.
    pub fn peut_contenir(&self, autre: &Rectangle) -> bool {
        self.largeur > autre.largeur && self.hauteur > autre.hauteur
    }

    // Fonction associée (pas de \`self\`) : un constructeur pratique.
    pub fn carre(cote: u32) -> Rectangle {
        Rectangle { largeur: cote, hauteur: cote }
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aire_simple() {
        let r = Rectangle { largeur: 4, hauteur: 5 };
        assert_eq!(r.aire(), 20);
    }

    #[test]
    fn contient_plus_petit() {
        let grand = Rectangle { largeur: 10, hauteur: 8 };
        let petit = Rectangle { largeur: 3, hauteur: 2 };
        assert!(grand.peut_contenir(&petit));
        assert!(!petit.peut_contenir(&grand));
    }

    #[test]
    fn meme_taille_ne_contient_pas() {
        let a = Rectangle { largeur: 5, hauteur: 5 };
        let b = Rectangle { largeur: 5, hauteur: 5 };
        assert!(!a.peut_contenir(&b));
    }

    #[test]
    fn carre_associe() {
        let c = Rectangle::carre(6);
        assert_eq!(c.largeur, 6);
        assert_eq!(c.hauteur, 6);
        assert_eq!(c.aire(), 36);
    }
}`,
  },
  {
    id: "rev-04",
    title: "Feu tricolore",
    difficulty: "facile",
    chapters: ["enums", "structures"],
    prompt:
      "Modélise un feu tricolore avec un `enum Feu { Rouge, Orange, Vert }` et deux méthodes : `suivant(self) -> Feu` donne l'état suivant (Rouge → Vert → Orange → Rouge) et `duree_secondes(self) -> u32` renvoie 30, 5 et 25 secondes respectivement.",
    hints: [
      "Un `match` sur `self` couvre les trois variantes — le compilateur vérifie l'exhaustivité.",
      "On peut aussi implémenter des méthodes sur un enum, exactement comme sur une struct.",
    ],
    starter: `#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Feu {
    Rouge,
    Orange,
    Vert,
}

impl Feu {
    /// Rouge -> Vert -> Orange -> Rouge
    pub fn suivant(self) -> Feu {
        todo!()
    }

    /// Rouge = 30 s, Orange = 5 s, Vert = 25 s
    pub fn duree_secondes(self) -> u32 {
        todo!()
    }
}`,
    solution: `#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Feu {
    Rouge,
    Orange,
    Vert,
}

impl Feu {
    pub fn suivant(self) -> Feu {
        match self {
            Feu::Rouge => Feu::Vert,
            Feu::Vert => Feu::Orange,
            Feu::Orange => Feu::Rouge,
        }
    }

    pub fn duree_secondes(self) -> u32 {
        match self {
            Feu::Rouge => 30,
            Feu::Orange => 5,
            Feu::Vert => 25,
        }
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cycle_complet() {
        assert_eq!(Feu::Rouge.suivant(), Feu::Vert);
        assert_eq!(Feu::Vert.suivant(), Feu::Orange);
        assert_eq!(Feu::Orange.suivant(), Feu::Rouge);
    }

    #[test]
    fn durees() {
        assert_eq!(Feu::Rouge.duree_secondes(), 30);
        assert_eq!(Feu::Orange.duree_secondes(), 5);
        assert_eq!(Feu::Vert.duree_secondes(), 25);
    }

    #[test]
    fn trois_suivants_reviennent_au_depart() {
        let f = Feu::Vert;
        assert_eq!(f.suivant().suivant().suivant(), Feu::Vert);
    }
}`,
  },
  {
    id: "rev-05",
    title: "Verdict du juste prix",
    difficulty: "facile",
    chapters: ["jeu-du-plus-ou-moins", "enums"],
    prompt:
      "Comme dans le jeu du plus ou du moins : écris `verdict(proposition: u32, secret: u32) -> Verdict` où `Verdict` est un enum avec `TropPetit`, `TropGrand` et `Trouve`. Utilise `Ordering` et `cmp` comme au chapitre 2, mais renvoie ton propre enum au lieu d'afficher du texte.",
    hints: [
      "`proposition.cmp(&secret)` renvoie un `std::cmp::Ordering`.",
      "Fais correspondre `Less`, `Greater` et `Equal` à tes trois variantes.",
    ],
    starter: `use std::cmp::Ordering;

#[derive(Debug, PartialEq)]
pub enum Verdict {
    TropPetit,
    TropGrand,
    Trouve,
}

pub fn verdict(proposition: u32, secret: u32) -> Verdict {
    // TODO : compare avec \`cmp\` puis traduis l'Ordering en Verdict.
    todo!()
}`,
    solution: `use std::cmp::Ordering;

#[derive(Debug, PartialEq)]
pub enum Verdict {
    TropPetit,
    TropGrand,
    Trouve,
}

pub fn verdict(proposition: u32, secret: u32) -> Verdict {
    // \`cmp\` compare et renvoie un Ordering, qu'on traduit en Verdict.
    match proposition.cmp(&secret) {
        Ordering::Less => Verdict::TropPetit,
        Ordering::Greater => Verdict::TropGrand,
        Ordering::Equal => Verdict::Trouve,
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trop_petit() {
        assert_eq!(verdict(10, 50), Verdict::TropPetit);
    }

    #[test]
    fn trop_grand() {
        assert_eq!(verdict(90, 50), Verdict::TropGrand);
    }

    #[test]
    fn trouve() {
        assert_eq!(verdict(50, 50), Verdict::Trouve);
    }
}`,
  },
  {
    id: "rev-06",
    title: "Compteur de voyelles",
    difficulty: "facile",
    chapters: ["concepts-de-base", "enums"],
    prompt:
      "Écris `compte_voyelles(s: &str) -> usize` qui compte les voyelles (a, e, i, o, u, y) sans tenir compte de la casse. Boucle sur les caractères et utilise un `match` (ou la macro `matches!`).",
    hints: [
      "`s.chars()` itère sur les caractères.",
      "`c.to_ascii_lowercase()` neutralise la casse.",
      "`matches!(c, 'a' | 'e' | ...)` renvoie un booléen à partir d'un motif.",
    ],
    starter: `/// Compte les voyelles (a, e, i, o, u, y), majuscules comprises.
pub fn compte_voyelles(s: &str) -> usize {
    // TODO : parcours les caractères et compte ceux qui sont des voyelles.
    todo!()
}`,
    solution: `pub fn compte_voyelles(s: &str) -> usize {
    s.chars()
        // \`matches!\` teste un motif et renvoie un bool : parfait pour \`filter\`.
        .filter(|c| matches!(c.to_ascii_lowercase(), 'a' | 'e' | 'i' | 'o' | 'u' | 'y'))
        .count()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn phrase_simple() {
        assert_eq!(compte_voyelles("bonjour"), 3);
    }

    #[test]
    fn avec_majuscules() {
        assert_eq!(compte_voyelles("AEIOUY"), 6);
    }

    #[test]
    fn aucune_voyelle() {
        assert_eq!(compte_voyelles("brrr"), 0);
    }
}`,
  },
  {
    id: "rev-07",
    title: "Mini-bibliothèque en modules",
    difficulty: "moyen",
    chapters: ["modules", "enums", "structures"],
    prompt:
      "Organise une mini-bibliothèque : un module `formes` avec un `enum Forme` (`Cercle { rayon }`, `Rectangle { largeur, hauteur }`) et sa méthode `aire`, un module `outils` avec `plus_grande(formes: &[Forme]) -> Option<&Forme>`, puis ré-exporte `Forme` et `plus_grande` avec `pub use` à la racine.",
    hints: [
      "Dans `outils`, importe le type avec `use crate::formes::Forme;`.",
      "Pour comparer des aires `f64`, garde en mémoire la meilleure forme vue dans une boucle.",
      "Les `pub use` à la racine permettent d'écrire `use super::*` dans les tests.",
    ],
    starter: `pub mod formes {
    #[derive(Debug, PartialEq)]
    pub enum Forme {
        Cercle { rayon: f64 },
        Rectangle { largeur: f64, hauteur: f64 },
    }

    impl Forme {
        pub fn aire(&self) -> f64 {
            todo!()
        }
    }
}

pub mod outils {
    use crate::formes::Forme;

    /// Renvoie la forme avec la plus grande aire, ou None si la slice est vide.
    pub fn plus_grande(formes: &[Forme]) -> Option<&Forme> {
        todo!()
    }
}

// TODO : ré-exporte Forme et plus_grande ici avec \`pub use\`.`,
    solution: `pub mod formes {
    #[derive(Debug, PartialEq)]
    pub enum Forme {
        Cercle { rayon: f64 },
        Rectangle { largeur: f64, hauteur: f64 },
    }

    impl Forme {
        pub fn aire(&self) -> f64 {
            match self {
                Forme::Cercle { rayon } => std::f64::consts::PI * rayon * rayon,
                Forme::Rectangle { largeur, hauteur } => largeur * hauteur,
            }
        }
    }
}

pub mod outils {
    use crate::formes::Forme;

    pub fn plus_grande(formes: &[Forme]) -> Option<&Forme> {
        let mut meilleure: Option<&Forme> = None;
        for forme in formes {
            match meilleure {
                None => meilleure = Some(forme),
                Some(m) if forme.aire() > m.aire() => meilleure = Some(forme),
                _ => {}
            }
        }
        meilleure
    }
}

// Les ré-exports raccourcissent les chemins pour les utilisateurs de la bibliothèque.
pub use formes::Forme;
pub use outils::plus_grande;`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aire_rectangle() {
        let r = Forme::Rectangle { largeur: 3.0, hauteur: 4.0 };
        assert_eq!(r.aire(), 12.0);
    }

    #[test]
    fn aire_cercle() {
        let c = Forme::Cercle { rayon: 1.0 };
        assert!((c.aire() - std::f64::consts::PI).abs() < 1e-9);
    }

    #[test]
    fn plus_grande_forme() {
        let toutes = vec![
            Forme::Cercle { rayon: 1.0 },
            Forme::Rectangle { largeur: 10.0, hauteur: 10.0 },
            Forme::Rectangle { largeur: 2.0, hauteur: 2.0 },
        ];
        let gagnante = plus_grande(&toutes).unwrap();
        assert_eq!(gagnante, &Forme::Rectangle { largeur: 10.0, hauteur: 10.0 });
    }

    #[test]
    fn slice_vide() {
        assert_eq!(plus_grande(&[]), None);
    }
}`,
  },
  {
    id: "rev-08",
    title: "Moyenne optionnelle",
    difficulty: "facile",
    chapters: ["collections", "enums"],
    prompt:
      "Écris `moyenne(valeurs: &[f64]) -> Option<f64>` : `None` si le tableau est vide, sinon la moyenne. Combiner les collections et `Option` évite les valeurs magiques comme `-1.0` pour signaler l'absence de résultat.",
    hints: [
      "`valeurs.is_empty()` détecte le cas vide.",
      "`valeurs.iter().sum::<f64>()` fait la somme ; pense à convertir la longueur avec `as f64`.",
    ],
    starter: `/// Renvoie la moyenne des valeurs, ou None si la slice est vide.
pub fn moyenne(valeurs: &[f64]) -> Option<f64> {
    todo!()
}`,
    solution: `pub fn moyenne(valeurs: &[f64]) -> Option<f64> {
    if valeurs.is_empty() {
        // Pas de valeur magique : l'absence de moyenne est explicite.
        None
    } else {
        Some(valeurs.iter().sum::<f64>() / valeurs.len() as f64)
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn moyenne_simple() {
        assert_eq!(moyenne(&[1.0, 2.0, 3.0]), Some(2.0));
    }

    #[test]
    fn une_valeur() {
        assert_eq!(moyenne(&[42.0]), Some(42.0));
    }

    #[test]
    fn tableau_vide() {
        assert_eq!(moyenne(&[]), None);
    }
}`,
  },
  {
    id: "rev-09",
    title: "Caractère le plus fréquent",
    difficulty: "moyen",
    chapters: ["collections", "iterateurs-closures"],
    prompt:
      "Écris `plus_frequent(s: &str) -> Option<char>` qui renvoie le caractère apparaissant le plus souvent (ou `None` si la chaîne est vide). Compte avec un `HashMap`, puis trouve le maximum avec un adaptateur d'itérateur.",
    hints: [
      "`*compte.entry(c).or_insert(0) += 1;` est l'idiome de comptage.",
      "`max_by_key` sur `into_iter()` trouve l'entrée avec le plus grand compte.",
      "`.map(|(c, _)| c)` extrait le caractère du tuple.",
    ],
    starter: `use std::collections::HashMap;

/// Renvoie le caractère le plus fréquent de \`s\`, ou None si vide.
pub fn plus_frequent(s: &str) -> Option<char> {
    // TODO : compte les occurrences, puis cherche le maximum.
    todo!()
}`,
    solution: `use std::collections::HashMap;

pub fn plus_frequent(s: &str) -> Option<char> {
    let mut compte = HashMap::new();
    for c in s.chars() {
        // \`entry\` insère 0 si absent, puis on incrémente dans tous les cas.
        *compte.entry(c).or_insert(0) += 1;
    }
    compte
        .into_iter()
        .max_by_key(|&(_, n)| n)
        .map(|(c, _)| c)
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gagnant_clair() {
        assert_eq!(plus_frequent("aabbbcc"), Some('b'));
    }

    #[test]
    fn un_seul_caractere() {
        assert_eq!(plus_frequent("zzz"), Some('z'));
    }

    #[test]
    fn chaine_vide() {
        assert_eq!(plus_frequent(""), None);
    }
}`,
  },
  {
    id: "rev-10",
    title: "Division sécurisée",
    difficulty: "facile",
    chapters: ["gestion-erreurs", "enums"],
    prompt:
      "Écris `diviser(a: i64, b: i64) -> Result<i64, ErreurCalcul>` avec un enum d'erreur `ErreurCalcul::DivisionParZero`. C'est le duo classique enums + gestion d'erreurs : l'appelant est **forcé** de traiter le cas d'échec.",
    hints: [
      "Teste `b == 0` avant de diviser.",
      "Renvoie `Err(ErreurCalcul::DivisionParZero)` ou `Ok(a / b)`.",
    ],
    starter: `#[derive(Debug, PartialEq)]
pub enum ErreurCalcul {
    DivisionParZero,
}

pub fn diviser(a: i64, b: i64) -> Result<i64, ErreurCalcul> {
    todo!()
}`,
    solution: `#[derive(Debug, PartialEq)]
pub enum ErreurCalcul {
    DivisionParZero,
}

pub fn diviser(a: i64, b: i64) -> Result<i64, ErreurCalcul> {
    if b == 0 {
        Err(ErreurCalcul::DivisionParZero)
    } else {
        Ok(a / b)
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn division_normale() {
        assert_eq!(diviser(10, 2), Ok(5));
    }

    #[test]
    fn division_negative() {
        assert_eq!(diviser(-9, 3), Ok(-3));
    }

    #[test]
    fn division_par_zero() {
        assert_eq!(diviser(1, 0), Err(ErreurCalcul::DivisionParZero));
    }
}`,
  },
  {
    id: "rev-11",
    title: "Parser un point",
    difficulty: "moyen",
    chapters: ["gestion-erreurs", "structures", "enums"],
    prompt:
      "Écris `parse_point(s: &str) -> Result<Point, ErreurParse>` qui transforme `\"3, 4\"` en `Point { x: 3, y: 4 }`. Erreurs possibles : `FormatInvalide` (pas de virgule) et `NombreInvalide` (un des deux morceaux ne se parse pas).",
    hints: [
      "`s.split_once(',')` renvoie `Option<(&str, &str)>` — parfait avec `ok_or`.",
      "`map_err` convertit l'erreur de `parse` en ta propre erreur.",
      "L'opérateur `?` enchaîne les étapes sans imbrication.",
    ],
    starter: `#[derive(Debug, PartialEq)]
pub struct Point {
    pub x: i64,
    pub y: i64,
}

#[derive(Debug, PartialEq)]
pub enum ErreurParse {
    FormatInvalide,
    NombreInvalide,
}

pub fn parse_point(s: &str) -> Result<Point, ErreurParse> {
    // TODO : coupe sur la virgule, parse chaque moitié, construis le Point.
    todo!()
}`,
    solution: `#[derive(Debug, PartialEq)]
pub struct Point {
    pub x: i64,
    pub y: i64,
}

#[derive(Debug, PartialEq)]
pub enum ErreurParse {
    FormatInvalide,
    NombreInvalide,
}

pub fn parse_point(s: &str) -> Result<Point, ErreurParse> {
    // Pas de virgule ? On convertit le None en erreur avec \`ok_or\`.
    let (x, y) = s.split_once(',').ok_or(ErreurParse::FormatInvalide)?;
    // \`map_err\` traduit ParseIntError vers notre enum, puis \`?\` propage.
    let x = x.trim().parse().map_err(|_| ErreurParse::NombreInvalide)?;
    let y = y.trim().parse().map_err(|_| ErreurParse::NombreInvalide)?;
    Ok(Point { x, y })
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn point_valide() {
        assert_eq!(parse_point("3, 4"), Ok(Point { x: 3, y: 4 }));
    }

    #[test]
    fn point_negatif() {
        assert_eq!(parse_point("-1,-2"), Ok(Point { x: -1, y: -2 }));
    }

    #[test]
    fn sans_virgule() {
        assert_eq!(parse_point("3;4"), Err(ErreurParse::FormatInvalide));
    }

    #[test]
    fn nombre_invalide() {
        assert_eq!(parse_point("a, 4"), Err(ErreurParse::NombreInvalide));
    }
}`,
  },
  {
    id: "rev-12",
    title: "Le plus grand, en générique",
    difficulty: "moyen",
    chapters: ["generics-traits", "enums"],
    prompt:
      "Écris `plus_grand<T: PartialOrd>(valeurs: &[T]) -> Option<&T>` qui renvoie une référence vers le plus grand élément, ou `None` si la slice est vide. La même fonction doit marcher pour des entiers, des flottants et des chaînes.",
    hints: [
      "Le trait bound `PartialOrd` autorise la comparaison avec `>`.",
      "`iter.next()?` récupère le premier élément et court-circuite si vide.",
    ],
    starter: `/// Renvoie une référence vers le plus grand élément, ou None si vide.
pub fn plus_grand<T: PartialOrd>(valeurs: &[T]) -> Option<&T> {
    todo!()
}`,
    solution: `pub fn plus_grand<T: PartialOrd>(valeurs: &[T]) -> Option<&T> {
    let mut iter = valeurs.iter();
    // \`?\` sur l'Option : slice vide => on renvoie None immédiatement.
    let mut max = iter.next()?;
    for v in iter {
        if v > max {
            max = v;
        }
    }
    Some(max)
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entiers() {
        assert_eq!(plus_grand(&[3, 9, 1, 7]), Some(&9));
    }

    #[test]
    fn flottants() {
        assert_eq!(plus_grand(&[1.5, 0.2, 1.4]), Some(&1.5));
    }

    #[test]
    fn chaines() {
        assert_eq!(plus_grand(&["pomme", "zebre", "kiwi"]), Some(&"zebre"));
    }

    #[test]
    fn vide() {
        let v: &[i32] = &[];
        assert_eq!(plus_grand(v), None);
    }
}`,
  },
  {
    id: "rev-13",
    title: "Recherche générique",
    difficulty: "moyen",
    chapters: ["generics-traits", "gestion-erreurs", "enums"],
    prompt:
      "Écris `cherche<T: PartialEq>(elements: &[T], cible: &T) -> Result<Option<usize>, ErreurRecherche>` : erreur `TableauVide` si la slice est vide, sinon `Ok(Some(index))` de la **première** occurrence ou `Ok(None)` si absent. Trois notions en une : génériques, `Result` et `Option`.",
    hints: [
      "Le `Result` répond à « la recherche a-t-elle pu avoir lieu ? », l'`Option` à « a-t-on trouvé ? ».",
      "`iter().position(|e| e == cible)` renvoie directement un `Option<usize>`.",
    ],
    starter: `#[derive(Debug, PartialEq)]
pub enum ErreurRecherche {
    TableauVide,
}

pub fn cherche<T: PartialEq>(elements: &[T], cible: &T) -> Result<Option<usize>, ErreurRecherche> {
    todo!()
}`,
    solution: `#[derive(Debug, PartialEq)]
pub enum ErreurRecherche {
    TableauVide,
}

pub fn cherche<T: PartialEq>(elements: &[T], cible: &T) -> Result<Option<usize>, ErreurRecherche> {
    if elements.is_empty() {
        // Chercher dans du vide est une erreur d'utilisation, pas un « non trouvé ».
        return Err(ErreurRecherche::TableauVide);
    }
    // \`position\` renvoie l'index de la première occurrence, ou None.
    Ok(elements.iter().position(|e| e == cible))
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trouve_un_entier() {
        assert_eq!(cherche(&[10, 20, 30], &20), Ok(Some(1)));
    }

    #[test]
    fn premiere_occurrence() {
        assert_eq!(cherche(&[5, 7, 7, 7], &7), Ok(Some(1)));
    }

    #[test]
    fn absent() {
        assert_eq!(cherche(&["a", "b"], &"z"), Ok(None));
    }

    #[test]
    fn tableau_vide() {
        let v: &[i32] = &[];
        assert_eq!(cherche(v, &1), Err(ErreurRecherche::TableauVide));
    }
}`,
  },
  {
    id: "rev-14",
    title: "Trait avec méthode par défaut",
    difficulty: "moyen",
    chapters: ["generics-traits", "structures"],
    prompt:
      "Définis un trait `Resumable` avec `auteur(&self) -> String` et une méthode `resume` **par défaut** qui renvoie `\"(par <auteur>)\"`. Implémente-le pour `Article` (qui redéfinit `resume` en `\"<titre> (par <auteur>)\"`) et pour `Tweet` (qui garde la version par défaut, avec `auteur` = `\"@pseudo\"`).",
    hints: [
      "Une méthode par défaut a un corps directement dans le bloc `trait`.",
      "Dans la méthode par défaut, appelle `self.auteur()`.",
    ],
    starter: `pub trait Resumable {
    fn auteur(&self) -> String;

    // TODO : méthode \`resume\` par défaut qui renvoie "(par <auteur>)".
}

pub struct Article {
    pub titre: String,
    pub auteur: String,
}

pub struct Tweet {
    pub pseudo: String,
    pub contenu: String,
}

// TODO : implémente Resumable pour Article (resume personnalisé)
// et pour Tweet (resume par défaut, auteur = "@pseudo").`,
    solution: `pub trait Resumable {
    fn auteur(&self) -> String;

    // Méthode par défaut : les types peuvent la garder ou la redéfinir.
    fn resume(&self) -> String {
        format!("(par {})", self.auteur())
    }
}

pub struct Article {
    pub titre: String,
    pub auteur: String,
}

pub struct Tweet {
    pub pseudo: String,
    pub contenu: String,
}

impl Resumable for Article {
    fn auteur(&self) -> String {
        self.auteur.clone()
    }

    // Redéfinition : l'article a un résumé plus riche.
    fn resume(&self) -> String {
        format!("{} (par {})", self.titre, self.auteur)
    }
}

impl Resumable for Tweet {
    fn auteur(&self) -> String {
        format!("@{}", self.pseudo)
    }
    // Pas de \`resume\` : on hérite de la version par défaut.
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn article_redefinit_resume() {
        let a = Article {
            titre: String::from("Rust 1.0"),
            auteur: String::from("Steve"),
        };
        assert_eq!(a.resume(), "Rust 1.0 (par Steve)");
    }

    #[test]
    fn tweet_garde_le_defaut() {
        let t = Tweet {
            pseudo: String::from("ferris"),
            contenu: String::from("j'adore Rust"),
        };
        assert_eq!(t.resume(), "(par @ferris)");
    }

    #[test]
    fn auteur_du_tweet() {
        let t = Tweet {
            pseudo: String::from("ferris"),
            contenu: String::new(),
        };
        assert_eq!(t.auteur(), "@ferris");
    }
}`,
  },
  {
    id: "rev-15",
    title: "Pile générique",
    difficulty: "moyen",
    chapters: ["generics-traits", "collections", "structures"],
    prompt:
      "Implémente une pile générique `Pile<T>` construite au-dessus d'un `Vec<T>` : `new`, `empiler`, `depiler -> Option<T>`, `sommet -> Option<&T>`, `len` et `is_empty`. Le dernier élément empilé est le premier dépilé (LIFO).",
    hints: [
      "`Vec::push` et `Vec::pop` font déjà presque tout le travail.",
      "`self.elements.last()` renvoie un `Option<&T>` pour `sommet`.",
    ],
    starter: `pub struct Pile<T> {
    elements: Vec<T>,
}

impl<T> Pile<T> {
    pub fn new() -> Self {
        todo!()
    }

    pub fn empiler(&mut self, valeur: T) {
        todo!()
    }

    pub fn depiler(&mut self) -> Option<T> {
        todo!()
    }

    pub fn sommet(&self) -> Option<&T> {
        todo!()
    }

    pub fn len(&self) -> usize {
        todo!()
    }

    pub fn is_empty(&self) -> bool {
        todo!()
    }
}`,
    solution: `pub struct Pile<T> {
    elements: Vec<T>,
}

impl<T> Pile<T> {
    pub fn new() -> Self {
        Pile { elements: Vec::new() }
    }

    pub fn empiler(&mut self, valeur: T) {
        self.elements.push(valeur);
    }

    // \`pop\` renvoie déjà Option<T> : la pile vide donne None.
    pub fn depiler(&mut self) -> Option<T> {
        self.elements.pop()
    }

    pub fn sommet(&self) -> Option<&T> {
        self.elements.last()
    }

    pub fn len(&self) -> usize {
        self.elements.len()
    }

    pub fn is_empty(&self) -> bool {
        self.elements.is_empty()
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ordre_lifo() {
        let mut p = Pile::new();
        p.empiler(1);
        p.empiler(2);
        p.empiler(3);
        assert_eq!(p.depiler(), Some(3));
        assert_eq!(p.depiler(), Some(2));
        assert_eq!(p.depiler(), Some(1));
        assert_eq!(p.depiler(), None);
    }

    #[test]
    fn sommet_sans_retirer() {
        let mut p = Pile::new();
        p.empiler(String::from("a"));
        p.empiler(String::from("b"));
        assert_eq!(p.sommet(), Some(&String::from("b")));
        assert_eq!(p.len(), 2);
    }

    #[test]
    fn pile_vide() {
        let p: Pile<i32> = Pile::new();
        assert!(p.is_empty());
        assert_eq!(p.sommet(), None);
    }
}`,
  },
  {
    id: "rev-16",
    title: "Dédoublonner en gardant l'ordre",
    difficulty: "moyen",
    chapters: ["collections", "ownership"],
    prompt:
      "Écris `dedoublonner(valeurs: &[String]) -> Vec<String>` qui supprime les doublons **en gardant l'ordre d'apparition**. Un `HashSet` sert de mémoire des valeurs déjà vues ; attention aux clones nécessaires puisque tu reçois un emprunt.",
    hints: [
      "`HashSet::insert` renvoie `true` si la valeur n'était pas encore présente.",
      "Il faut cloner les `String` pour remplir le `Vec` de sortie.",
    ],
    starter: `use std::collections::HashSet;

/// Supprime les doublons en conservant l'ordre d'apparition.
pub fn dedoublonner(valeurs: &[String]) -> Vec<String> {
    todo!()
}`,
    solution: `use std::collections::HashSet;

pub fn dedoublonner(valeurs: &[String]) -> Vec<String> {
    let mut vus = HashSet::new();
    let mut resultat = Vec::new();
    for v in valeurs {
        // \`insert\` renvoie true seulement à la première apparition.
        if vus.insert(v.clone()) {
            resultat.push(v.clone());
        }
    }
    resultat
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    fn s(v: &[&str]) -> Vec<String> {
        v.iter().map(|x| x.to_string()).collect()
    }

    #[test]
    fn doublons_supprimes() {
        assert_eq!(dedoublonner(&s(&["a", "b", "a", "c", "b"])), s(&["a", "b", "c"]));
    }

    #[test]
    fn deja_uniques() {
        assert_eq!(dedoublonner(&s(&["x", "y"])), s(&["x", "y"]));
    }

    #[test]
    fn vide() {
        assert_eq!(dedoublonner(&[]), Vec::<String>::new());
    }
}`,
  },
  {
    id: "rev-17",
    title: "Validateur de mot de passe",
    difficulty: "moyen",
    chapters: ["tests", "gestion-erreurs", "collections"],
    prompt:
      "Écris `valider_mot_de_passe(mdp: &str) -> Result<(), Vec<String>>` qui accumule **toutes** les erreurs au lieu de s'arrêter à la première : « au moins 8 caractères », « au moins un chiffre », « au moins une majuscule ». Lis l'onglet Tests pour les messages exacts attendus.",
    hints: [
      "Pousse chaque message d'erreur dans un `Vec<String>`.",
      "`mdp.chars().any(|c| c.is_ascii_digit())` teste la présence d'un chiffre.",
      "À la fin : `Ok(())` si le vecteur est vide, sinon `Err(erreurs)`.",
    ],
    starter: `/// Valide un mot de passe et renvoie TOUTES les erreurs trouvées.
pub fn valider_mot_de_passe(mdp: &str) -> Result<(), Vec<String>> {
    todo!()
}`,
    solution: `pub fn valider_mot_de_passe(mdp: &str) -> Result<(), Vec<String>> {
    let mut erreurs = Vec::new();

    if mdp.chars().count() < 8 {
        erreurs.push(String::from("au moins 8 caractères"));
    }
    if !mdp.chars().any(|c| c.is_ascii_digit()) {
        erreurs.push(String::from("au moins un chiffre"));
    }
    if !mdp.chars().any(|c| c.is_ascii_uppercase()) {
        erreurs.push(String::from("au moins une majuscule"));
    }

    // Result<(), Vec<String>> : le succès ne porte aucune donnée,
    // l'échec porte la liste complète des problèmes.
    if erreurs.is_empty() {
        Ok(())
    } else {
        Err(erreurs)
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mot_de_passe_valide() {
        assert_eq!(valider_mot_de_passe("Abcdef12"), Ok(()));
    }

    #[test]
    fn toutes_les_erreurs() {
        let e = valider_mot_de_passe("abc").unwrap_err();
        assert_eq!(e.len(), 3);
        assert!(e.contains(&String::from("au moins 8 caractères")));
        assert!(e.contains(&String::from("au moins un chiffre")));
        assert!(e.contains(&String::from("au moins une majuscule")));
    }

    #[test]
    fn manque_seulement_une_majuscule() {
        let e = valider_mot_de_passe("abcdef123").unwrap_err();
        assert_eq!(e, vec![String::from("au moins une majuscule")]);
    }
}`,
  },
  {
    id: "rev-18",
    title: "Tout parser ou échouer",
    difficulty: "moyen",
    chapters: ["iterateurs-closures", "gestion-erreurs"],
    prompt:
      "Écris `parse_tous(entrees: &[&str]) -> Result<Vec<i64>, ParseIntError>` qui convertit toutes les chaînes en nombres, ou renvoie la **première** erreur rencontrée. Astuce puissante : on peut `collect` un itérateur de `Result` directement en `Result<Vec<_>, _>`.",
    hints: [
      "`entrees.iter().map(|s| s.trim().parse())` produit des `Result<i64, _>`.",
      "`collect::<Result<Vec<i64>, ParseIntError>>()` s'arrête à la première erreur.",
    ],
    starter: `use std::num::ParseIntError;

/// Parse toutes les entrées, ou renvoie la première erreur.
pub fn parse_tous(entrees: &[&str]) -> Result<Vec<i64>, ParseIntError> {
    todo!()
}`,
    solution: `use std::num::ParseIntError;

pub fn parse_tous(entrees: &[&str]) -> Result<Vec<i64>, ParseIntError> {
    // collect() sur des Result : Ok(vec) si tout passe, sinon la 1re erreur.
    entrees.iter().map(|s| s.trim().parse()).collect()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tout_est_valide() {
        assert_eq!(parse_tous(&["1", " 2 ", "3"]), Ok(vec![1, 2, 3]));
    }

    #[test]
    fn une_erreur_suffit() {
        assert!(parse_tous(&["1", "abc", "3"]).is_err());
    }

    #[test]
    fn liste_vide() {
        assert_eq!(parse_tous(&[]), Ok(vec![]));
    }
}`,
  },
  {
    id: "rev-19",
    title: "Top N des scores",
    difficulty: "moyen",
    chapters: ["iterateurs-closures", "collections"],
    prompt:
      "Écris `top_n(scores: Vec<(String, u32)>, n: usize) -> Vec<(String, u32)>` qui renvoie les `n` meilleurs scores triés du plus grand au plus petit. Tri avec une closure de comparaison, puis troncature.",
    hints: [
      "`scores.sort_by(|a, b| b.1.cmp(&a.1))` trie par score décroissant.",
      "`truncate(n)` coupe le vecteur (sans paniquer si n est trop grand).",
    ],
    starter: `/// Renvoie les n meilleurs scores, du plus grand au plus petit.
pub fn top_n(scores: Vec<(String, u32)>, n: usize) -> Vec<(String, u32)> {
    todo!()
}`,
    solution: `pub fn top_n(mut scores: Vec<(String, u32)>, n: usize) -> Vec<(String, u32)> {
    // Comparaison inversée (b vs a) => ordre décroissant.
    scores.sort_by(|a, b| b.1.cmp(&a.1));
    scores.truncate(n);
    scores
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    fn jeu() -> Vec<(String, u32)> {
        vec![
            (String::from("alice"), 40),
            (String::from("bob"), 95),
            (String::from("carol"), 70),
        ]
    }

    #[test]
    fn deux_meilleurs() {
        let top = top_n(jeu(), 2);
        assert_eq!(top, vec![(String::from("bob"), 95), (String::from("carol"), 70)]);
    }

    #[test]
    fn n_plus_grand_que_la_liste() {
        assert_eq!(top_n(jeu(), 10).len(), 3);
    }

    #[test]
    fn zero() {
        assert_eq!(top_n(jeu(), 0), vec![]);
    }
}`,
  },
  {
    id: "rev-20",
    title: "Itérateur de Fibonacci",
    difficulty: "moyen",
    chapters: ["iterateurs-closures", "structures"],
    prompt:
      "Implémente le trait `Iterator` pour une struct `Fibonacci` qui produit la suite 0, 1, 1, 2, 3, 5… à l'infini. En retour, tu gagnes `take`, `filter`, `map`… gratuitement sur ta propre struct.",
    hints: [
      "Garde deux champs : `courant` et `suivant`.",
      "Dans `next`, renvoie `courant` puis fais avancer les deux champs.",
      "La suite est infinie : `next` renvoie toujours `Some(...)`.",
    ],
    starter: `pub struct Fibonacci {
    courant: u64,
    suivant: u64,
}

impl Fibonacci {
    pub fn new() -> Self {
        Fibonacci { courant: 0, suivant: 1 }
    }
}

impl Iterator for Fibonacci {
    type Item = u64;

    fn next(&mut self) -> Option<u64> {
        // TODO : renvoie la valeur courante et avance la suite.
        todo!()
    }
}`,
    solution: `pub struct Fibonacci {
    courant: u64,
    suivant: u64,
}

impl Fibonacci {
    pub fn new() -> Self {
        Fibonacci { courant: 0, suivant: 1 }
    }
}

impl Iterator for Fibonacci {
    type Item = u64;

    fn next(&mut self) -> Option<u64> {
        let valeur = self.courant;
        // On fait avancer la fenêtre (courant, suivant).
        self.courant = self.suivant;
        self.suivant = valeur + self.suivant;
        Some(valeur) // suite infinie : jamais None
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sept_premiers() {
        let v: Vec<u64> = Fibonacci::new().take(7).collect();
        assert_eq!(v, vec![0, 1, 1, 2, 3, 5, 8]);
    }

    #[test]
    fn combinable_avec_filter() {
        let pairs: Vec<u64> = Fibonacci::new().filter(|n| n % 2 == 0).take(3).collect();
        assert_eq!(pairs, vec![0, 2, 8]);
    }

    #[test]
    fn somme_des_dix_premiers() {
        let somme: u64 = Fibonacci::new().take(10).sum();
        assert_eq!(somme, 88);
    }
}`,
  },
  {
    id: "rev-21",
    title: "Recherche insensible à la casse",
    difficulty: "moyen",
    chapters: ["projet-io", "ownership", "iterateurs-closures"],
    prompt:
      "Comme dans le projet minigrep : écris `chercher<'a>(motif: &str, contenu: &'a str) -> Vec<&'a str>` qui renvoie les lignes contenant `motif` **sans tenir compte de la casse**. L'annotation de durée de vie dit au compilateur que les résultats empruntent à `contenu`, pas à `motif`.",
    hints: [
      "`motif.to_lowercase()` une seule fois avant la boucle.",
      "`contenu.lines()` + `filter` + `collect` suffisent.",
      "Dans le filtre, compare `ligne.to_lowercase().contains(&motif)`.",
    ],
    starter: `/// Renvoie les lignes de \`contenu\` contenant \`motif\`, casse ignorée.
pub fn chercher<'a>(motif: &str, contenu: &'a str) -> Vec<&'a str> {
    todo!()
}`,
    solution: `pub fn chercher<'a>(motif: &str, contenu: &'a str) -> Vec<&'a str> {
    // On normalise le motif une seule fois.
    let motif = motif.to_lowercase();
    contenu
        .lines()
        .filter(|ligne| ligne.to_lowercase().contains(&motif))
        .collect()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    const CONTENU: &str = "Rust est rapide.
La sécurité avant tout.
le rustacé code.";

    #[test]
    fn insensible_a_la_casse() {
        assert_eq!(chercher("rust", CONTENU), vec!["Rust est rapide.", "le rustacé code."]);
    }

    #[test]
    fn un_seul_resultat() {
        assert_eq!(chercher("SÉCURITÉ", CONTENU), vec!["La sécurité avant tout."]);
    }

    #[test]
    fn aucun_resultat() {
        assert!(chercher("python", CONTENU).is_empty());
    }
}`,
  },
  {
    id: "rev-22",
    title: "Arbre binaire de recherche",
    difficulty: "difficile",
    chapters: ["smart-pointers", "enums", "patterns"],
    prompt:
      "Implémente un arbre binaire de recherche avec `enum Arbre { Vide, Noeud { valeur, gauche: Box<Arbre>, droite: Box<Arbre> } }` et trois méthodes : `inserer` (les doublons sont ignorés), `contient` et `somme`. Le `Box` est indispensable : sans lui, le type serait de taille infinie.",
    hints: [
      "Dans `inserer`, sur la variante `Vide`, remplace `*self` par un nouveau `Noeud`.",
      "La déstructuration `Arbre::Noeud { valeur, gauche, droite }` donne accès aux trois champs.",
      "Les trois méthodes sont naturellement récursives.",
    ],
    starter: `#[derive(Debug)]
pub enum Arbre {
    Vide,
    Noeud {
        valeur: i64,
        gauche: Box<Arbre>,
        droite: Box<Arbre>,
    },
}

impl Arbre {
    pub fn new() -> Self {
        Arbre::Vide
    }

    /// Insère \`v\` à sa place (plus petit à gauche, plus grand à droite).
    pub fn inserer(&mut self, v: i64) {
        todo!()
    }

    pub fn contient(&self, v: i64) -> bool {
        todo!()
    }

    pub fn somme(&self) -> i64 {
        todo!()
    }
}`,
    solution: `#[derive(Debug)]
pub enum Arbre {
    Vide,
    Noeud {
        valeur: i64,
        gauche: Box<Arbre>,
        droite: Box<Arbre>,
    },
}

impl Arbre {
    pub fn new() -> Self {
        Arbre::Vide
    }

    pub fn inserer(&mut self, v: i64) {
        match self {
            // Feuille vide : on la remplace par un nouveau noeud.
            Arbre::Vide => {
                *self = Arbre::Noeud {
                    valeur: v,
                    gauche: Box::new(Arbre::Vide),
                    droite: Box::new(Arbre::Vide),
                };
            }
            Arbre::Noeud { valeur, gauche, droite } => {
                if v < *valeur {
                    gauche.inserer(v);
                } else if v > *valeur {
                    droite.inserer(v);
                }
                // v == valeur : doublon ignoré.
            }
        }
    }

    pub fn contient(&self, v: i64) -> bool {
        match self {
            Arbre::Vide => false,
            Arbre::Noeud { valeur, gauche, droite } => {
                if v == *valeur {
                    true
                } else if v < *valeur {
                    gauche.contient(v)
                } else {
                    droite.contient(v)
                }
            }
        }
    }

    pub fn somme(&self) -> i64 {
        match self {
            Arbre::Vide => 0,
            Arbre::Noeud { valeur, gauche, droite } => valeur + gauche.somme() + droite.somme(),
        }
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    fn arbre_test() -> Arbre {
        let mut a = Arbre::new();
        for v in [5, 3, 8, 1, 4] {
            a.inserer(v);
        }
        a
    }

    #[test]
    fn contient_les_valeurs_inserees() {
        let a = arbre_test();
        assert!(a.contient(5));
        assert!(a.contient(1));
        assert!(a.contient(8));
        assert!(!a.contient(7));
    }

    #[test]
    fn somme_totale() {
        assert_eq!(arbre_test().somme(), 21);
    }

    #[test]
    fn doublon_ignore() {
        let mut a = arbre_test();
        a.inserer(5);
        assert_eq!(a.somme(), 21);
    }

    #[test]
    fn arbre_vide() {
        let a = Arbre::new();
        assert!(!a.contient(1));
        assert_eq!(a.somme(), 0);
    }
}`,
  },
  {
    id: "rev-23",
    title: "Journal partagé",
    difficulty: "moyen",
    chapters: ["smart-pointers", "structures", "collections"],
    prompt:
      "Plusieurs capteurs doivent écrire dans un même journal sans référence mutable partagée : utilise `Rc<RefCell<Vec<String>>>`. Implémente `Capteur::new(nom, journal)` et `signaler(&self, message)` qui pousse `\"[nom] message\"` dans le journal partagé.",
    hints: [
      "`Rc::clone(&journal)` crée un nouveau propriétaire, pas une copie des données.",
      "`self.journal.borrow_mut()` donne l'accès mutable au Vec au moment de l'écriture.",
    ],
    starter: `use std::cell::RefCell;
use std::rc::Rc;

pub type Journal = Rc<RefCell<Vec<String>>>;

pub struct Capteur {
    pub nom: String,
    journal: Journal,
}

impl Capteur {
    pub fn new(nom: &str, journal: Journal) -> Self {
        todo!()
    }

    /// Ajoute "[nom] message" au journal partagé.
    pub fn signaler(&self, message: &str) {
        todo!()
    }
}`,
    solution: `use std::cell::RefCell;
use std::rc::Rc;

pub type Journal = Rc<RefCell<Vec<String>>>;

pub struct Capteur {
    pub nom: String,
    journal: Journal,
}

impl Capteur {
    pub fn new(nom: &str, journal: Journal) -> Self {
        Capteur { nom: nom.to_string(), journal }
    }

    pub fn signaler(&self, message: &str) {
        // borrow_mut : mutabilité intérieure vérifiée à l'exécution.
        self.journal.borrow_mut().push(format!("[{}] {}", self.nom, message));
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deux_capteurs_meme_journal() {
        let journal: Journal = Rc::new(RefCell::new(Vec::new()));
        let porte = Capteur::new("porte", Rc::clone(&journal));
        let fenetre = Capteur::new("fenetre", Rc::clone(&journal));

        porte.signaler("ouverte");
        fenetre.signaler("fermée");
        porte.signaler("fermée");

        let contenu = journal.borrow();
        assert_eq!(contenu.len(), 3);
        assert_eq!(contenu[0], "[porte] ouverte");
        assert_eq!(contenu[1], "[fenetre] fermée");
        assert_eq!(contenu[2], "[porte] fermée");
    }

    #[test]
    fn compte_des_proprietaires() {
        let journal: Journal = Rc::new(RefCell::new(Vec::new()));
        let _c = Capteur::new("test", Rc::clone(&journal));
        assert_eq!(Rc::strong_count(&journal), 2);
    }
}`,
  },
  {
    id: "rev-24",
    title: "Somme en parallèle",
    difficulty: "moyen",
    chapters: ["concurrence", "collections", "iterateurs-closures"],
    prompt:
      "Écris `somme_parallele(valeurs: Vec<i64>) -> i64` qui coupe le vecteur en deux avec `split_off`, somme chaque moitié dans un thread séparé (`thread::spawn` + closures `move`), puis additionne les deux résultats après `join`.",
    hints: [
      "`let droite = gauche.split_off(valeurs.len() / 2);` coupe en deux moitiés possédées.",
      "Chaque closure doit être `move` pour prendre possession de sa moitié.",
      "`handle.join().unwrap()` récupère la valeur renvoyée par le thread.",
    ],
    starter: `use std::thread;

/// Somme les valeurs en répartissant le travail sur deux threads.
pub fn somme_parallele(valeurs: Vec<i64>) -> i64 {
    todo!()
}`,
    solution: `use std::thread;

pub fn somme_parallele(valeurs: Vec<i64>) -> i64 {
    let milieu = valeurs.len() / 2;
    let mut gauche = valeurs;
    // split_off découpe le Vec en deux Vec indépendants (ownership séparé).
    let droite = gauche.split_off(milieu);

    // Chaque thread possède sa moitié grâce à \`move\`.
    let h1 = thread::spawn(move || gauche.iter().sum::<i64>());
    let h2 = thread::spawn(move || droite.iter().sum::<i64>());

    h1.join().unwrap() + h2.join().unwrap()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn somme_simple() {
        assert_eq!(somme_parallele(vec![1, 2, 3, 4, 5]), 15);
    }

    #[test]
    fn grande_somme() {
        let v: Vec<i64> = (1..=1000).collect();
        assert_eq!(somme_parallele(v), 500500);
    }

    #[test]
    fn vecteur_vide() {
        assert_eq!(somme_parallele(vec![]), 0);
    }
}`,
  },
  {
    id: "rev-25",
    title: "Compteur de mots concurrent",
    difficulty: "difficile",
    chapters: ["concurrence", "smart-pointers", "collections"],
    prompt:
      "Écris `compter_mots(textes: Vec<String>) -> HashMap<String, usize>` : un thread par texte, tous partagent le compteur via `Arc<Mutex<HashMap<String, usize>>>`. À la fin, récupère la map avec `Arc::try_unwrap` + `into_inner`.",
    hints: [
      "`Arc::clone(&compte)` avant chaque `thread::spawn`.",
      "Verrouille avec `compte.lock().unwrap()` puis utilise l'idiome `entry / or_insert`.",
      "N'oublie pas de `join` tous les handles avant de dépaqueter l'Arc.",
    ],
    starter: `use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;

/// Compte les occurrences de chaque mot, un thread par texte.
pub fn compter_mots(textes: Vec<String>) -> HashMap<String, usize> {
    todo!()
}`,
    solution: `use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;

pub fn compter_mots(textes: Vec<String>) -> HashMap<String, usize> {
    let compte = Arc::new(Mutex::new(HashMap::new()));
    let mut handles = Vec::new();

    for texte in textes {
        // Chaque thread reçoit son propre pointeur Arc vers le compteur.
        let compte = Arc::clone(&compte);
        handles.push(thread::spawn(move || {
            for mot in texte.split_whitespace() {
                let mut carte = compte.lock().unwrap();
                *carte.entry(mot.to_string()).or_insert(0) += 1;
            } // le verrou est relâché à chaque fin d'itération
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    // Tous les threads sont finis : on est le dernier propriétaire.
    Arc::try_unwrap(compte).unwrap().into_inner().unwrap()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compte_sur_plusieurs_textes() {
        let textes = vec![
            String::from("rust est rapide"),
            String::from("rust est sûr"),
            String::from("le crabe aime rust"),
        ];
        let compte = compter_mots(textes);
        assert_eq!(compte.get("rust"), Some(&3));
        assert_eq!(compte.get("est"), Some(&2));
        assert_eq!(compte.get("crabe"), Some(&1));
        assert_eq!(compte.get("python"), None);
    }

    #[test]
    fn aucun_texte() {
        assert!(compter_mots(vec![]).is_empty());
    }
}`,
  },
  {
    id: "rev-26",
    title: "La course async",
    difficulty: "moyen",
    chapters: ["async-await", "enums"],
    prompt:
      "Écris `course(duree_lievre_ms: u64, duree_tortue_ms: u64) -> Gagnant` (fonction async) : deux `sleep` concurrents dans un `tokio::select!`, le premier terminé gagne. `Gagnant` est un enum avec `Lievre` et `Tortue`.",
    hints: [
      "`tokio::select!` attend plusieurs futures et exécute la branche du premier fini.",
      "Chaque branche : `_ = sleep(...) => Gagnant::...`.",
    ],
    starter: `use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, PartialEq)]
pub enum Gagnant {
    Lievre,
    Tortue,
}

pub async fn course(duree_lievre_ms: u64, duree_tortue_ms: u64) -> Gagnant {
    // TODO : deux sleep en course dans un tokio::select!
    todo!()
}`,
    solution: `use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, PartialEq)]
pub enum Gagnant {
    Lievre,
    Tortue,
}

pub async fn course(duree_lievre_ms: u64, duree_tortue_ms: u64) -> Gagnant {
    // select! exécute la branche du premier future terminé
    // et annule l'autre.
    tokio::select! {
        _ = sleep(Duration::from_millis(duree_lievre_ms)) => Gagnant::Lievre,
        _ = sleep(Duration::from_millis(duree_tortue_ms)) => Gagnant::Tortue,
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn le_lievre_gagne() {
        assert_eq!(course(10, 80).await, Gagnant::Lievre);
    }

    #[tokio::test]
    async fn la_tortue_gagne() {
        assert_eq!(course(80, 10).await, Gagnant::Tortue);
    }
}`,
  },
  {
    id: "rev-27",
    title: "Carrés en parallèle (async)",
    difficulty: "moyen",
    chapters: ["async-await", "concurrence", "collections"],
    prompt:
      "Écris une fonction async `carres(valeurs: Vec<i64>) -> Vec<i64>` qui calcule le carré de chaque valeur dans une tâche `tokio::spawn` séparée, puis rassemble les résultats **dans le même ordre** que l'entrée.",
    hints: [
      "Lance d'abord toutes les tâches avec `tokio::spawn(async move { v * v })` et stocke les handles dans un `Vec`.",
      "Attends ensuite chaque handle avec `.await` : l'ordre des handles garantit l'ordre des résultats.",
      "`handle.await` renvoie un `Result` (la tâche peut paniquer) : utilise `.unwrap()` ici.",
    ],
    starter: `pub async fn carres(valeurs: Vec<i64>) -> Vec<i64> {
    // TODO : une tâche tokio::spawn par valeur, puis await de chaque handle
    todo!()
}`,
    solution: `pub async fn carres(valeurs: Vec<i64>) -> Vec<i64> {
    // Phase 1 : on lance toutes les tâches sans attendre.
    let handles: Vec<_> = valeurs
        .into_iter()
        .map(|v| tokio::spawn(async move { v * v }))
        .collect();

    // Phase 2 : on récolte les résultats dans l'ordre de lancement.
    let mut resultats = Vec::with_capacity(handles.len());
    for handle in handles {
        resultats.push(handle.await.unwrap());
    }
    resultats
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn calcule_les_carres_dans_l_ordre() {
        assert_eq!(carres(vec![1, 2, 3, 4]).await, vec![1, 4, 9, 16]);
    }

    #[tokio::test]
    async fn gere_le_vide_et_les_negatifs() {
        assert_eq!(carres(vec![]).await, Vec::<i64>::new());
        assert_eq!(carres(vec![-3, 0]).await, vec![9, 0]);
    }
}`,
  },
  {
    id: "rev-28",
    title: "Requête avec timeout",
    difficulty: "difficile",
    chapters: ["async-await", "gestion-erreurs", "enums"],
    prompt:
      "Une fonction `requete_simulee` (fournie) met `latence_ms` millisecondes à répondre. Implémente `chercher_utilisateur(id, latence_ms, limite_ms)` qui l'appelle avec `tokio::time::timeout` : si la limite est dépassée renvoie `Err(ErreurFetch::Timeout)`, si l'utilisateur n'existe pas `Err(ErreurFetch::Introuvable)`, sinon `Ok(nom)`.",
    hints: [
      "`tokio::time::timeout(duree, future).await` renvoie `Err(Elapsed)` si le future n'a pas fini à temps.",
      "Le résultat est donc un `Result` imbriqué : d'abord le timeout, puis l'`Option` de la requête.",
      "`map_err` convertit l'erreur de timeout, `ok_or` convertit le `None` en `Introuvable`.",
    ],
    starter: `use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, PartialEq)]
pub enum ErreurFetch {
    Timeout,
    Introuvable,
}

// Simule un appel réseau : ne modifie pas cette fonction.
pub async fn requete_simulee(id: u32, latence_ms: u64) -> Option<String> {
    sleep(Duration::from_millis(latence_ms)).await;
    if id == 42 { Some("Ferris".to_string()) } else { None }
}

pub async fn chercher_utilisateur(
    id: u32,
    latence_ms: u64,
    limite_ms: u64,
) -> Result<String, ErreurFetch> {
    // TODO : tokio::time::timeout autour de requete_simulee
    todo!()
}`,
    solution: `use std::time::Duration;
use tokio::time::{sleep, timeout};

#[derive(Debug, PartialEq)]
pub enum ErreurFetch {
    Timeout,
    Introuvable,
}

// Simule un appel réseau : ne modifie pas cette fonction.
pub async fn requete_simulee(id: u32, latence_ms: u64) -> Option<String> {
    sleep(Duration::from_millis(latence_ms)).await;
    if id == 42 { Some("Ferris".to_string()) } else { None }
}

pub async fn chercher_utilisateur(
    id: u32,
    latence_ms: u64,
    limite_ms: u64,
) -> Result<String, ErreurFetch> {
    // timeout renvoie Err(Elapsed) si la limite est dépassée.
    let reponse = timeout(
        Duration::from_millis(limite_ms),
        requete_simulee(id, latence_ms),
    )
    .await
    .map_err(|_| ErreurFetch::Timeout)?;

    // La requête a répondu : None => utilisateur inconnu.
    reponse.ok_or(ErreurFetch::Introuvable)
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn trouve_ferris_a_temps() {
        assert_eq!(
            chercher_utilisateur(42, 10, 100).await,
            Ok("Ferris".to_string())
        );
    }

    #[tokio::test]
    async fn utilisateur_inconnu() {
        assert_eq!(
            chercher_utilisateur(7, 10, 100).await,
            Err(ErreurFetch::Introuvable)
        );
    }

    #[tokio::test]
    async fn trop_lent_donc_timeout() {
        assert_eq!(
            chercher_utilisateur(42, 200, 20).await,
            Err(ErreurFetch::Timeout)
        );
    }
}`,
  },
  {
    id: "rev-29",
    title: "Machine à états de commande",
    difficulty: "moyen",
    chapters: ["enums", "patterns", "gestion-erreurs"],
    prompt:
      "Modélise le cycle de vie d'une commande avec `enum Etat` (EnAttente, Payee, Expediee, Livree, Annulee). Implémente `avancer` (passe à l'étape suivante, erreur `CommandeTerminee` si livrée ou annulée) et `annuler` (possible seulement avant expédition, sinon `AnnulationImpossible` ; `CommandeTerminee` si déjà annulée).",
    hints: [
      "Un `match` exhaustif sur `self` rend chaque transition explicite.",
      "Tu peux grouper des variantes dans une même branche : `Etat::Livree | Etat::Annulee => ...`.",
      "Les méthodes prennent `self` par valeur et renvoient `Result<Etat, ErreurTransition>`.",
    ],
    starter: `#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Etat {
    EnAttente,
    Payee,
    Expediee,
    Livree,
    Annulee,
}

#[derive(Debug, PartialEq)]
pub enum ErreurTransition {
    CommandeTerminee,
    AnnulationImpossible,
}

impl Etat {
    pub fn avancer(self) -> Result<Etat, ErreurTransition> {
        // TODO : EnAttente -> Payee -> Expediee -> Livree
        todo!()
    }

    pub fn annuler(self) -> Result<Etat, ErreurTransition> {
        // TODO : possible seulement avant expédition
        todo!()
    }
}`,
    solution: `#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Etat {
    EnAttente,
    Payee,
    Expediee,
    Livree,
    Annulee,
}

#[derive(Debug, PartialEq)]
pub enum ErreurTransition {
    CommandeTerminee,
    AnnulationImpossible,
}

impl Etat {
    pub fn avancer(self) -> Result<Etat, ErreurTransition> {
        match self {
            Etat::EnAttente => Ok(Etat::Payee),
            Etat::Payee => Ok(Etat::Expediee),
            Etat::Expediee => Ok(Etat::Livree),
            // Une commande livrée ou annulée ne bouge plus.
            Etat::Livree | Etat::Annulee => Err(ErreurTransition::CommandeTerminee),
        }
    }

    pub fn annuler(self) -> Result<Etat, ErreurTransition> {
        match self {
            Etat::EnAttente | Etat::Payee => Ok(Etat::Annulee),
            Etat::Expediee | Etat::Livree => Err(ErreurTransition::AnnulationImpossible),
            Etat::Annulee => Err(ErreurTransition::CommandeTerminee),
        }
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cycle_complet() {
        let etat = Etat::EnAttente;
        let etat = etat.avancer().unwrap();
        assert_eq!(etat, Etat::Payee);
        let etat = etat.avancer().unwrap();
        assert_eq!(etat, Etat::Expediee);
        let etat = etat.avancer().unwrap();
        assert_eq!(etat, Etat::Livree);
        assert_eq!(etat.avancer(), Err(ErreurTransition::CommandeTerminee));
    }

    #[test]
    fn annulation_avant_expedition() {
        assert_eq!(Etat::EnAttente.annuler(), Ok(Etat::Annulee));
        assert_eq!(Etat::Payee.annuler(), Ok(Etat::Annulee));
    }

    #[test]
    fn annulation_impossible_apres_expedition() {
        assert_eq!(
            Etat::Expediee.annuler(),
            Err(ErreurTransition::AnnulationImpossible)
        );
        assert_eq!(
            Etat::Livree.annuler(),
            Err(ErreurTransition::AnnulationImpossible)
        );
        assert_eq!(
            Etat::Annulee.annuler(),
            Err(ErreurTransition::CommandeTerminee)
        );
        assert_eq!(
            Etat::Annulee.avancer(),
            Err(ErreurTransition::CommandeTerminee)
        );
    }
}`,
  },
  {
    id: "rev-30",
    title: "Notifications polymorphes",
    difficulty: "moyen",
    chapters: ["poo", "generics-traits", "collections"],
    prompt:
      "Définis un trait `Notifieur` avec `envoyer(&self, message: &str) -> String`. Implémente-le pour `Email { adresse }` (renvoie `\"email à {adresse} : {message}\"`) et `Sms { numero }` (renvoie `\"SMS au {numero} : {message}\"`). Puis écris `diffuser(notifieurs: &[Box<dyn Notifieur>], message: &str) -> Vec<String>` qui envoie le message via chaque notifieur.",
    hints: [
      "`Box<dyn Notifieur>` permet de stocker des types différents dans le même slice (objet trait).",
      "Dans `diffuser`, itère et appelle `n.envoyer(message)` : le dispatch est dynamique.",
      "`format!` construit les chaînes de retour.",
    ],
    starter: `pub trait Notifieur {
    fn envoyer(&self, message: &str) -> String;
}

pub struct Email {
    pub adresse: String,
}

pub struct Sms {
    pub numero: String,
}

// TODO : impl Notifieur for Email et for Sms

pub fn diffuser(notifieurs: &[Box<dyn Notifieur>], message: &str) -> Vec<String> {
    // TODO : envoyer le message via chaque notifieur
    todo!()
}`,
    solution: `pub trait Notifieur {
    fn envoyer(&self, message: &str) -> String;
}

pub struct Email {
    pub adresse: String,
}

pub struct Sms {
    pub numero: String,
}

impl Notifieur for Email {
    fn envoyer(&self, message: &str) -> String {
        format!("email à {} : {}", self.adresse, message)
    }
}

impl Notifieur for Sms {
    fn envoyer(&self, message: &str) -> String {
        format!("SMS au {} : {}", self.numero, message)
    }
}

pub fn diffuser(notifieurs: &[Box<dyn Notifieur>], message: &str) -> Vec<String> {
    // Dispatch dynamique : chaque Box appelle SA version d'envoyer.
    notifieurs.iter().map(|n| n.envoyer(message)).collect()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn chaque_canal_formate_son_message() {
        let email = Email { adresse: "ferris@rust.fr".to_string() };
        let sms = Sms { numero: "0601020304".to_string() };
        assert_eq!(email.envoyer("salut"), "email à ferris@rust.fr : salut");
        assert_eq!(sms.envoyer("salut"), "SMS au 0601020304 : salut");
    }

    #[test]
    fn diffuse_a_tous() {
        let notifieurs: Vec<Box<dyn Notifieur>> = vec![
            Box::new(Email { adresse: "a@b.fr".to_string() }),
            Box::new(Sms { numero: "0611223344".to_string() }),
        ];
        assert_eq!(
            diffuser(&notifieurs, "promo"),
            vec![
                "email à a@b.fr : promo".to_string(),
                "SMS au 0611223344 : promo".to_string(),
            ]
        );
    }

    #[test]
    fn liste_vide() {
        let notifieurs: Vec<Box<dyn Notifieur>> = vec![];
        assert!(diffuser(&notifieurs, "rien").is_empty());
    }
}`,
  },
  {
    id: "rev-31",
    title: "Décrire un point",
    difficulty: "moyen",
    chapters: ["patterns", "structures"],
    prompt:
      "Écris `decrire(p: &Point) -> String` avec **un seul `match`** qui déstructure le point : `(0, 0)` → `\"origine\"`, `(x, 0)` → `\"sur l'axe X en {x}\"`, `(0, y)` → `\"sur l'axe Y en {y}\"`, `x == y` → `\"sur la diagonale en {x}\"`, sinon `\"en ({x}, {y})\"`.",
    hints: [
      "Déstructure directement : `Point { x: 0, y: 0 } => ...`.",
      "Pour la diagonale, utilise une garde : `Point { x, y } if x == y => ...`.",
      "L'ordre des branches compte : du cas le plus précis au plus général.",
    ],
    starter: `pub struct Point {
    pub x: i32,
    pub y: i32,
}

pub fn decrire(p: &Point) -> String {
    // TODO : un seul match avec déstructuration et garde
    todo!()
}`,
    solution: `pub struct Point {
    pub x: i32,
    pub y: i32,
}

pub fn decrire(p: &Point) -> String {
    match p {
        // Du plus spécifique au plus général.
        Point { x: 0, y: 0 } => "origine".to_string(),
        Point { x, y: 0 } => format!("sur l'axe X en {x}"),
        Point { x: 0, y } => format!("sur l'axe Y en {y}"),
        Point { x, y } if x == y => format!("sur la diagonale en {x}"),
        Point { x, y } => format!("en ({x}, {y})"),
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cas_speciaux() {
        assert_eq!(decrire(&Point { x: 0, y: 0 }), "origine");
        assert_eq!(decrire(&Point { x: 5, y: 0 }), "sur l'axe X en 5");
        assert_eq!(decrire(&Point { x: 0, y: -3 }), "sur l'axe Y en -3");
    }

    #[test]
    fn diagonale_et_cas_general() {
        assert_eq!(decrire(&Point { x: 4, y: 4 }), "sur la diagonale en 4");
        assert_eq!(decrire(&Point { x: 2, y: 7 }), "en (2, 7)");
    }
}`,
  },
  {
    id: "rev-32",
    title: "Surcharge de l'addition",
    difficulty: "moyen",
    chapters: ["fonctionnalites-avancees", "structures", "generics-traits"],
    prompt:
      "Implémente le trait `std::ops::Add` pour `Point` afin de pouvoir écrire `p1 + p2`. L'addition se fait composante par composante.",
    hints: [
      "Importe le trait : `use std::ops::Add;`.",
      "Il faut définir le type associé `type Output = Point;`.",
      "Dérive `Clone, Copy` pour pouvoir additionner en chaîne sans problème d'ownership.",
    ],
    starter: `use std::ops::Add;

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

// TODO : impl Add for Point (type Output = Point)
`,
    solution: `use std::ops::Add;

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

impl Add for Point {
    // Le type associé indique ce que renvoie l'opérateur +.
    type Output = Point;

    fn add(self, autre: Point) -> Point {
        Point {
            x: self.x + autre.x,
            y: self.y + autre.y,
        }
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn addition_simple() {
        let p1 = Point { x: 1, y: 2 };
        let p2 = Point { x: 3, y: 4 };
        assert_eq!(p1 + p2, Point { x: 4, y: 6 });
    }

    #[test]
    fn addition_en_chaine() {
        let p1 = Point { x: 1, y: 1 };
        let p2 = Point { x: 2, y: -5 };
        let p3 = Point { x: -3, y: 4 };
        assert_eq!(p1 + p2 + p3, Point { x: 0, y: 0 });
    }
}`,
  },
  {
    id: "rev-33",
    title: "Conversions d'unités avec From",
    difficulty: "moyen",
    chapters: ["fonctionnalites-avancees", "structures", "generics-traits"],
    prompt:
      "Définis deux newtypes `Metres(pub f64)` et `Kilometres(pub f64)`, puis implémente `From<Kilometres> for Metres` (× 1000) et `From<Metres> for Kilometres` (÷ 1000) pour pouvoir convertir avec `.into()`.",
    hints: [
      "Le motif *newtype* : une struct tuple à un seul champ qui donne un sens à un `f64`.",
      "`impl From<Kilometres> for Metres { fn from(km: Kilometres) -> Metres { ... } }`.",
      "Implémenter `From` offre gratuitement `.into()` dans l'autre sens d'appel.",
    ],
    starter: `#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Metres(pub f64);

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Kilometres(pub f64);

// TODO : impl From<Kilometres> for Metres
// TODO : impl From<Metres> for Kilometres
`,
    solution: `#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Metres(pub f64);

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct Kilometres(pub f64);

impl From<Kilometres> for Metres {
    fn from(km: Kilometres) -> Metres {
        Metres(km.0 * 1000.0)
    }
}

impl From<Metres> for Kilometres {
    fn from(m: Metres) -> Kilometres {
        Kilometres(m.0 / 1000.0)
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn km_vers_metres() {
        let m: Metres = Kilometres(2.5).into();
        assert_eq!(m, Metres(2500.0));
        assert_eq!(Metres::from(Kilometres(0.0)), Metres(0.0));
    }

    #[test]
    fn metres_vers_km() {
        let km: Kilometres = Metres(500.0).into();
        assert_eq!(km, Kilometres(0.5));
        assert_eq!(Kilometres::from(Metres(1000.0)), Kilometres(1.0));
    }
}`,
  },
  {
    id: "rev-34",
    title: "Fabrique de closures",
    difficulty: "difficile",
    chapters: ["fonctionnalites-avancees", "iterateurs-closures"],
    prompt:
      "Écris `fabrique(operation: &str, n: i64) -> Box<dyn Fn(i64) -> i64>` qui renvoie une closure : `\"ajouter\"` → `x + n`, `\"multiplier\"` → `x * n`, sinon l'identité. Puis `composer(f, g)` qui renvoie une closure appliquant `f` puis `g`.",
    hints: [
      "Une closure retournée doit capturer `n` par valeur : `Box::new(move |x| x + n)`.",
      "Chaque branche du `match` renvoie sa propre closure boxée.",
      "`composer` : `Box::new(move |x| g(f(x)))`.",
    ],
    starter: `pub fn fabrique(operation: &str, n: i64) -> Box<dyn Fn(i64) -> i64> {
    // TODO : "ajouter" => x + n, "multiplier" => x * n, sinon identité
    todo!()
}

pub fn composer(
    f: Box<dyn Fn(i64) -> i64>,
    g: Box<dyn Fn(i64) -> i64>,
) -> Box<dyn Fn(i64) -> i64> {
    // TODO : applique f puis g
    todo!()
}`,
    solution: `pub fn fabrique(operation: &str, n: i64) -> Box<dyn Fn(i64) -> i64> {
    // move force la closure à capturer n par valeur :
    // elle peut ainsi survivre à la fin de la fonction.
    match operation {
        "ajouter" => Box::new(move |x| x + n),
        "multiplier" => Box::new(move |x| x * n),
        _ => Box::new(|x| x),
    }
}

pub fn composer(
    f: Box<dyn Fn(i64) -> i64>,
    g: Box<dyn Fn(i64) -> i64>,
) -> Box<dyn Fn(i64) -> i64> {
    // La closure capture f et g par valeur et les enchaîne.
    Box::new(move |x| g(f(x)))
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fabrique_les_bonnes_operations() {
        let ajoute_5 = fabrique("ajouter", 5);
        let fois_3 = fabrique("multiplier", 3);
        let inconnue = fabrique("racine", 9);
        assert_eq!(ajoute_5(10), 15);
        assert_eq!(fois_3(10), 30);
        assert_eq!(inconnue(10), 10);
    }

    #[test]
    fn compose_deux_closures() {
        let ajoute_1 = fabrique("ajouter", 1);
        let fois_10 = fabrique("multiplier", 10);
        // (x + 1) * 10
        let combo = composer(ajoute_1, fois_10);
        assert_eq!(combo(4), 50);
    }
}`,
  },
  {
    id: "rev-35",
    title: "Premier valide, générique",
    difficulty: "difficile",
    chapters: ["generics-traits", "gestion-erreurs", "iterateurs-closures"],
    prompt:
      "Écris `premier_valide<T: FromStr>(entrees: &[&str]) -> Option<T>` qui renvoie la première chaîne du slice qui se parse avec succès en `T` (en ignorant les espaces autour). La même fonction doit marcher pour `i32`, `f64`, `bool`…",
    hints: [
      "Le trait à importer est `std::str::FromStr` : c'est lui qui fournit `.parse()`.",
      "`find_map` combine `find` et `map` : il renvoie le premier `Some`.",
      "`s.trim().parse().ok()` transforme le `Result` du parsing en `Option`.",
    ],
    starter: `use std::str::FromStr;

pub fn premier_valide<T: FromStr>(entrees: &[&str]) -> Option<T> {
    // TODO : première entrée qui se parse en T
    todo!()
}`,
    solution: `use std::str::FromStr;

pub fn premier_valide<T: FromStr>(entrees: &[&str]) -> Option<T> {
    // find_map s'arrête à la première closure qui renvoie Some.
    entrees.iter().find_map(|s| s.trim().parse().ok())
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trouve_le_premier_entier() {
        let entrees = ["abc", "  12 ", "34"];
        assert_eq!(premier_valide::<i32>(&entrees), Some(12));
    }

    #[test]
    fn marche_avec_d_autres_types() {
        let entrees = ["pas un nombre", "3.14", "2.71"];
        assert_eq!(premier_valide::<f64>(&entrees), Some(3.14));
        let entrees = ["oui", "true", "false"];
        assert_eq!(premier_valide::<bool>(&entrees), Some(true));
    }

    #[test]
    fn aucun_valide() {
        let entrees = ["a", "b"];
        assert_eq!(premier_valide::<i32>(&entrees), None);
        assert_eq!(premier_valide::<i32>(&[]), None);
    }
}`,
  },
  {
    id: "rev-36",
    title: "Parser une requête HTTP",
    difficulty: "difficile",
    chapters: ["serveur-web", "gestion-erreurs", "patterns"],
    prompt:
      "Écris `parse_ligne_requete(ligne: &str) -> Result<(String, String), ErreurHttp>` qui analyse une ligne de requête HTTP comme `\"GET /index.html HTTP/1.1\"` et renvoie `(methode, chemin)`. Erreurs : `LigneVide` (ligne vide ou espaces), `MethodeInconnue` (autre que GET/POST), `FormatInvalide` (pas exactement 3 morceaux ou version différente de HTTP/1.1).",
    hints: [
      "Vérifie d'abord `ligne.trim().is_empty()` pour le cas `LigneVide`.",
      "`split_whitespace()` + un `match` sur `(iter.next(), iter.next(), iter.next(), iter.next())` : le 4e doit être `None`.",
      "Le pattern `methode @ (\"GET\" | \"POST\")` capture la méthode tout en la restreignant.",
    ],
    starter: `#[derive(Debug, PartialEq)]
pub enum ErreurHttp {
    LigneVide,
    MethodeInconnue,
    FormatInvalide,
}

pub fn parse_ligne_requete(ligne: &str) -> Result<(String, String), ErreurHttp> {
    // TODO : découpe la ligne et valide méthode + version
    todo!()
}`,
    solution: `#[derive(Debug, PartialEq)]
pub enum ErreurHttp {
    LigneVide,
    MethodeInconnue,
    FormatInvalide,
}

pub fn parse_ligne_requete(ligne: &str) -> Result<(String, String), ErreurHttp> {
    if ligne.trim().is_empty() {
        return Err(ErreurHttp::LigneVide);
    }

    let mut morceaux = ligne.split_whitespace();
    // Un tuple de 4 next() : le dernier doit être None
    // (exactement 3 morceaux attendus).
    match (morceaux.next(), morceaux.next(), morceaux.next(), morceaux.next()) {
        (Some(methode @ ("GET" | "POST")), Some(chemin), Some("HTTP/1.1"), None) => {
            Ok((methode.to_string(), chemin.to_string()))
        }
        (Some(_), Some(_), Some("HTTP/1.1"), None) => Err(ErreurHttp::MethodeInconnue),
        _ => Err(ErreurHttp::FormatInvalide),
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn requetes_valides() {
        assert_eq!(
            parse_ligne_requete("GET /index.html HTTP/1.1"),
            Ok(("GET".to_string(), "/index.html".to_string()))
        );
        assert_eq!(
            parse_ligne_requete("POST /api/users HTTP/1.1"),
            Ok(("POST".to_string(), "/api/users".to_string()))
        );
    }

    #[test]
    fn ligne_vide() {
        assert_eq!(parse_ligne_requete(""), Err(ErreurHttp::LigneVide));
        assert_eq!(parse_ligne_requete("   "), Err(ErreurHttp::LigneVide));
    }

    #[test]
    fn methode_inconnue() {
        assert_eq!(
            parse_ligne_requete("DELETE /users/1 HTTP/1.1"),
            Err(ErreurHttp::MethodeInconnue)
        );
    }

    #[test]
    fn format_invalide() {
        assert_eq!(
            parse_ligne_requete("GET /index.html"),
            Err(ErreurHttp::FormatInvalide)
        );
        assert_eq!(
            parse_ligne_requete("GET /index.html HTTP/2"),
            Err(ErreurHttp::FormatInvalide)
        );
        assert_eq!(
            parse_ligne_requete("GET /a HTTP/1.1 extra"),
            Err(ErreurHttp::FormatInvalide)
        );
    }
}`,
  },
  {
    id: "rev-37",
    title: "Inventaire de magasin",
    difficulty: "moyen",
    chapters: ["collections", "structures", "gestion-erreurs"],
    prompt:
      "Implémente `Inventaire` autour d'un `HashMap<String, u32>` : `ajouter(article, quantite)` cumule le stock, `retirer(article, quantite)` renvoie `Err(ArticleInconnu)` si l'article n'existe pas, `Err(StockInsuffisant)` si le stock est trop bas, et `quantite(article)` renvoie le stock (0 si inconnu).",
    hints: [
      "`self.stock.entry(article.to_string()).or_insert(0)` puis `+= quantite` pour ajouter.",
      "Pour retirer : `match self.stock.get_mut(article)` avec une garde `Some(q) if *q < quantite`.",
      "`self.stock.get(article).copied().unwrap_or(0)` pour lire sans paniquer.",
    ],
    starter: `use std::collections::HashMap;

#[derive(Debug, PartialEq)]
pub enum ErreurStock {
    ArticleInconnu,
    StockInsuffisant,
}

pub struct Inventaire {
    stock: HashMap<String, u32>,
}

impl Inventaire {
    pub fn new() -> Self {
        // TODO
        todo!()
    }

    pub fn ajouter(&mut self, article: &str, quantite: u32) {
        // TODO : cumule le stock existant
        todo!()
    }

    pub fn retirer(&mut self, article: &str, quantite: u32) -> Result<(), ErreurStock> {
        // TODO : ArticleInconnu / StockInsuffisant
        todo!()
    }

    pub fn quantite(&self, article: &str) -> u32 {
        // TODO : 0 si l'article est inconnu
        todo!()
    }
}`,
    solution: `use std::collections::HashMap;

#[derive(Debug, PartialEq)]
pub enum ErreurStock {
    ArticleInconnu,
    StockInsuffisant,
}

pub struct Inventaire {
    stock: HashMap<String, u32>,
}

impl Inventaire {
    pub fn new() -> Self {
        Inventaire { stock: HashMap::new() }
    }

    pub fn ajouter(&mut self, article: &str, quantite: u32) {
        // entry/or_insert : crée la clé à 0 si absente, puis cumule.
        *self.stock.entry(article.to_string()).or_insert(0) += quantite;
    }

    pub fn retirer(&mut self, article: &str, quantite: u32) -> Result<(), ErreurStock> {
        match self.stock.get_mut(article) {
            None => Err(ErreurStock::ArticleInconnu),
            Some(q) if *q < quantite => Err(ErreurStock::StockInsuffisant),
            Some(q) => {
                *q -= quantite;
                Ok(())
            }
        }
    }

    pub fn quantite(&self, article: &str) -> u32 {
        self.stock.get(article).copied().unwrap_or(0)
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ajouter_cumule() {
        let mut inv = Inventaire::new();
        inv.ajouter("pomme", 3);
        inv.ajouter("pomme", 2);
        assert_eq!(inv.quantite("pomme"), 5);
        assert_eq!(inv.quantite("poire"), 0);
    }

    #[test]
    fn retirer_avec_succes() {
        let mut inv = Inventaire::new();
        inv.ajouter("clou", 10);
        assert_eq!(inv.retirer("clou", 4), Ok(()));
        assert_eq!(inv.quantite("clou"), 6);
    }

    #[test]
    fn erreurs_de_retrait() {
        let mut inv = Inventaire::new();
        inv.ajouter("vis", 2);
        assert_eq!(inv.retirer("boulon", 1), Err(ErreurStock::ArticleInconnu));
        assert_eq!(inv.retirer("vis", 5), Err(ErreurStock::StockInsuffisant));
        assert_eq!(inv.quantite("vis"), 2);
    }
}`,
  },
];
