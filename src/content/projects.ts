// Vrais projets d'application : mettre en pratique les leçons sur des cas concrets,
// pas seulement des exercices isolés. Chaque projet mélange plusieurs chapitres et
// se débloque quand tous ses chapitres sont terminés (comme la page Réviser).

import type { Difficulty } from "./types";

/** Une étape du cahier des charges d'un projet. */
export interface ProjectStep {
  title: string;
  detail: string;
}

/** Un projet réaliste et complet à réaliser dans l'éditeur intégré. */
export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Accroche courte affichée sur la carte. */
  tagline: string;
  difficulty: Difficulty;
  minutes: number;
  /** Chapitres dont les notions sont appliquées (gating). */
  chapters: string[];
  /** Mise en situation réaliste. */
  context: string;
  /** Ce que l'apprenant saura faire à la fin. */
  objectives: string[];
  /** Cahier des charges découpé en étapes. */
  steps: ProjectStep[];
  /** Squelette de départ. */
  starter: string;
  /** Tests d'acceptation (optionnels), exécutés via /api/run. */
  tests?: string;
  /** Pistes pour aller plus loin. */
  extensions: string[];
}

export const projects: Project[] = [
  {
    id: "proj-todo-cli",
    slug: "todo-cli",
    title: "Gestionnaire de tâches en ligne de commande",
    tagline: "Un vrai To-Do list : ajouter, terminer, lister — avec un état persistant.",
    difficulty: "facile",
    minutes: 45,
    chapters: ["concepts-de-base", "enums", "collections", "gestion-erreurs"],
    context:
      "Tu construis le cœur d'une petite application de gestion de tâches, comme celles qu'on utilise tous les jours en ligne de commande. On se concentre sur la logique métier (pas l'affichage), pour qu'elle soit testable et réutilisable dans une vraie CLI.",
    objectives: [
      "Modéliser un domaine métier avec des `struct` et des `enum`.",
      "Manipuler une collection (`Vec`) et renvoyer des `Result` parlants.",
      "Écrire une API claire qu'on pourrait brancher à `clap` ou à un fichier JSON.",
    ],
    steps: [
      {
        title: "1. Modélise une tâche",
        detail:
          "Crée une `struct Tache { id: u32, titre: String, faite: bool }` et un `enum Statut { EnCours, Terminee }` (ou utilise directement le booléen `faite`).",
      },
      {
        title: "2. Un gestionnaire",
        detail:
          "Crée `struct GestionnaireTaches { taches: Vec<Tache>, prochain_id: u32 }` avec `pub fn nouveau() -> Self`.",
      },
      {
        title: "3. Ajouter",
        detail:
          "`ajouter(&mut self, titre: &str) -> u32` crée une tâche (id auto-incrémenté), l'ajoute au `Vec` et renvoie son id.",
      },
      {
        title: "4. Terminer",
        detail:
          "`terminer(&mut self, id: u32) -> Result<(), String>` marque la tâche comme faite, ou renvoie une erreur si l'id n'existe pas.",
      },
      {
        title: "5. Lister",
        detail:
          "`restantes(&self) -> Vec<&Tache>` renvoie les tâches non terminées, et `nombre_faites(&self) -> usize` compte les tâches terminées.",
      },
    ],
    starter: `#[derive(Debug, Clone, PartialEq)]
pub struct Tache {
    pub id: u32,
    pub titre: String,
    pub faite: bool,
}

#[derive(Debug, Default)]
pub struct GestionnaireTaches {
    taches: Vec<Tache>,
    prochain_id: u32,
}

impl GestionnaireTaches {
    pub fn nouveau() -> Self {
        // Astuce : prochain_id commence à 1.
        todo!()
    }

    /// Ajoute une tâche et renvoie son identifiant.
    pub fn ajouter(&mut self, titre: &str) -> u32 {
        todo!()
    }

    /// Marque une tâche comme terminée. Erreur si l'id est inconnu.
    pub fn terminer(&mut self, id: u32) -> Result<(), String> {
        todo!()
    }

    /// Les tâches encore à faire.
    pub fn restantes(&self) -> Vec<&Tache> {
        todo!()
    }

    /// Combien de tâches sont terminées.
    pub fn nombre_faites(&self) -> usize {
        todo!()
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ajout_incremente_les_ids() {
        let mut g = GestionnaireTaches::nouveau();
        let a = g.ajouter("Acheter du pain");
        let b = g.ajouter("Coder en Rust");
        assert_eq!(a, 1);
        assert_eq!(b, 2);
        assert_eq!(g.restantes().len(), 2);
    }

    #[test]
    fn terminer_une_tache() {
        let mut g = GestionnaireTaches::nouveau();
        let id = g.ajouter("Réviser ownership");
        assert!(g.terminer(id).is_ok());
        assert_eq!(g.nombre_faites(), 1);
        assert_eq!(g.restantes().len(), 0);
    }

    #[test]
    fn terminer_id_inconnu_echoue() {
        let mut g = GestionnaireTaches::nouveau();
        g.ajouter("Une tâche");
        assert!(g.terminer(999).is_err());
    }
}`,
    extensions: [
      "Ajoute une méthode `supprimer(&mut self, id: u32) -> Result<Tache, String>`.",
      "Sérialise l'état en JSON avec `serde` pour le sauvegarder dans un fichier.",
      "Branche une vraie interface CLI avec le crate `clap`.",
    ],
  },

  {
    id: "proj-calculatrice",
    slug: "calculatrice",
    title: "Évaluateur d'expressions arithmétiques",
    tagline: "Transforme « 3 + 4 * 2 » en 11 : tokenizer + priorité des opérateurs.",
    difficulty: "moyen",
    minutes: 75,
    chapters: ["enums", "collections", "gestion-erreurs", "generics-traits"],
    context:
      "Beaucoup d'outils réels (tableurs, moteurs de règles, langages de script) doivent évaluer des expressions saisies par l'utilisateur. Tu vas écrire un petit évaluateur qui respecte la priorité des opérateurs (× et ÷ avant + et −) et gère proprement les erreurs de saisie.",
    objectives: [
      "Découper une chaîne en tokens avec un `enum`.",
      "Implémenter l'algorithme de conversion (shunting-yard ou récursion) avec priorité.",
      "Propager les erreurs avec `Result` et un type d'erreur dédié.",
    ],
    steps: [
      {
        title: "1. Les tokens",
        detail:
          "Définis `enum Token { Nombre(f64), Plus, Moins, Fois, Division }` et un `enum ErreurCalc { CaractereInvalide(char), ExpressionInvalide, DivisionParZero }`.",
      },
      {
        title: "2. Tokeniser",
        detail:
          "`tokeniser(entree: &str) -> Result<Vec<Token>, ErreurCalc>` ignore les espaces, lit les nombres (avec décimales) et reconnaît les opérateurs.",
      },
      {
        title: "3. Évaluer avec priorité",
        detail:
          "`evaluer(entree: &str) -> Result<f64, ErreurCalc>` calcule le résultat en respectant `* /` avant `+ -`. Une division par zéro renvoie `DivisionParZero`.",
      },
      {
        title: "4. Robustesse",
        detail:
          "Une expression mal formée (« 3 + » ou « * 4 ») doit renvoyer `ExpressionInvalide` plutôt que paniquer.",
      },
    ],
    starter: `#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Nombre(f64),
    Plus,
    Moins,
    Fois,
    Division,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ErreurCalc {
    CaractereInvalide(char),
    ExpressionInvalide,
    DivisionParZero,
}

pub fn tokeniser(entree: &str) -> Result<Vec<Token>, ErreurCalc> {
    todo!()
}

/// Évalue une expression comme "3 + 4 * 2" en respectant la priorité.
pub fn evaluer(entree: &str) -> Result<f64, ErreurCalc> {
    todo!()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn priorite_respectee() {
        assert_eq!(evaluer("3 + 4 * 2"), Ok(11.0));
        assert_eq!(evaluer("2 * 3 + 4"), Ok(10.0));
    }

    #[test]
    fn decimales_et_soustraction() {
        assert_eq!(evaluer("10 - 2.5"), Ok(7.5));
    }

    #[test]
    fn division_par_zero() {
        assert_eq!(evaluer("5 / 0"), Err(ErreurCalc::DivisionParZero));
    }

    #[test]
    fn expression_invalide() {
        assert!(matches!(evaluer("3 +"), Err(ErreurCalc::ExpressionInvalide)));
    }

    #[test]
    fn caractere_invalide() {
        assert!(matches!(evaluer("3 $ 4"), Err(ErreurCalc::CaractereInvalide('$'))));
    }
}`,
    extensions: [
      "Ajoute la gestion des parenthèses « (3 + 4) * 2 ».",
      "Implémente `std::fmt::Display` et `std::error::Error` sur `ErreurCalc`.",
      "Supporte les fonctions comme `sqrt` ou une puissance `^`.",
    ],
  },

  {
    id: "proj-analyseur-logs",
    slug: "analyseur-logs",
    title: "Analyseur de journaux (logs)",
    tagline: "Compte les erreurs, trouve les IP les plus actives — avec des itérateurs.",
    difficulty: "moyen",
    minutes: 70,
    chapters: ["collections", "gestion-erreurs", "iterateurs-closures", "generics-traits"],
    context:
      "Les administrateurs système passent leur temps à analyser des logs. Tu vas écrire un module qui parse des lignes de log au format simple et en tire des statistiques utiles — le genre de tâche où les itérateurs de Rust brillent.",
    objectives: [
      "Parser des données textuelles semi-structurées en `struct`.",
      "Agréger avec `HashMap` et les combinateurs d'itérateurs (`filter`, `fold`, `count`).",
      "Renvoyer des résultats triés sans boucles manuelles verbeuses.",
    ],
    steps: [
      {
        title: "1. Une entrée de log",
        detail:
          "Format d'une ligne : `NIVEAU IP MESSAGE`, ex : `ERROR 10.0.0.1 timeout`. Modélise `enum Niveau { Info, Warn, Error }` et `struct Entree { niveau: Niveau, ip: String, message: String }`.",
      },
      {
        title: "2. Parser une ligne",
        detail:
          "`parser_ligne(ligne: &str) -> Option<Entree>` : renvoie `None` si la ligne est vide ou mal formée (moins de 3 champs).",
      },
      {
        title: "3. Parser un journal",
        detail:
          "`analyser(texte: &str) -> Vec<Entree>` : découpe par lignes et garde seulement les entrées valides (avec `filter_map`).",
      },
      {
        title: "4. Statistiques",
        detail:
          "`compter_erreurs(entrees: &[Entree]) -> usize` et `ip_la_plus_active(entrees: &[Entree]) -> Option<String>` (l'IP qui apparaît le plus souvent).",
      },
    ],
    starter: `use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum Niveau {
    Info,
    Warn,
    Error,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Entree {
    pub niveau: Niveau,
    pub ip: String,
    pub message: String,
}

pub fn parser_ligne(ligne: &str) -> Option<Entree> {
    todo!()
}

pub fn analyser(texte: &str) -> Vec<Entree> {
    todo!()
}

pub fn compter_erreurs(entrees: &[Entree]) -> usize {
    todo!()
}

/// Renvoie l'IP la plus fréquente (ou None si aucune entrée).
pub fn ip_la_plus_active(entrees: &[Entree]) -> Option<String> {
    let _ = HashMap::<String, usize>::new();
    todo!()
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    const JOURNAL: &str = "\\
INFO 10.0.0.1 démarrage
ERROR 10.0.0.2 timeout
ERROR 10.0.0.1 échec
ligne invalide
WARN 10.0.0.1 lente";

    #[test]
    fn parse_une_ligne() {
        let e = parser_ligne("ERROR 10.0.0.2 timeout").unwrap();
        assert_eq!(e.niveau, Niveau::Error);
        assert_eq!(e.ip, "10.0.0.2");
        assert_eq!(e.message, "timeout");
    }

    #[test]
    fn ignore_les_lignes_invalides() {
        assert!(parser_ligne("").is_none());
        assert!(parser_ligne("bloup").is_none());
        assert_eq!(analyser(JOURNAL).len(), 4);
    }

    #[test]
    fn compte_les_erreurs() {
        let entrees = analyser(JOURNAL);
        assert_eq!(compter_erreurs(&entrees), 2);
    }

    #[test]
    fn trouve_ip_active() {
        let entrees = analyser(JOURNAL);
        assert_eq!(ip_la_plus_active(&entrees), Some("10.0.0.1".to_string()));
    }
}`,
    extensions: [
      "Ajoute un filtre par niveau : `entrees_du_niveau(&[Entree], Niveau) -> Vec<&Entree>`.",
      "Produis un rapport trié des IP par nombre d'occurrences décroissant.",
      "Lis un vrai fichier avec `std::fs::read_to_string` et gère l'erreur d'IO.",
    ],
  },

  {
    id: "proj-banque",
    slug: "banque",
    title: "Cœur d'une application bancaire",
    tagline: "Comptes, virements et invariants garantis par le système de types.",
    difficulty: "difficile",
    minutes: 100,
    chapters: [
      "structures",
      "enums",
      "collections",
      "gestion-erreurs",
      "generics-traits",
      "tests",
    ],
    context:
      "Dans une vraie application financière, une erreur peut coûter cher. Tu vas concevoir le noyau d'une banque où les règles métier (pas de solde négatif, montants valides) sont impossibles à violer sans passer par une erreur explicite. C'est l'occasion d'utiliser les traits et un design orienté invariants.",
    objectives: [
      "Concevoir une API où les états invalides sont impossibles à représenter.",
      "Utiliser un type d'erreur riche et le trait `Display`.",
      "Écrire une suite de tests qui documente le comportement attendu.",
    ],
    steps: [
      {
        title: "1. Montant sûr",
        detail:
          "Un `struct Compte { id: u32, solde: u64 }` (le solde en centimes, jamais négatif grâce à `u64`).",
      },
      {
        title: "2. Erreurs métier",
        detail:
          "`enum ErreurBanque { CompteInconnu(u32), SoldeInsuffisant { demande: u64, disponible: u64 }, MontantNul }` + `impl Display`.",
      },
      {
        title: "3. La banque",
        detail:
          "`struct Banque { comptes: HashMap<u32, Compte>, prochain_id: u32 }`, `ouvrir_compte(&mut self, depot: u64) -> u32`.",
      },
      {
        title: "4. Opérations",
        detail:
          "`deposer`, `retirer` et `virer(&mut self, de: u32, vers: u32, montant: u64) -> Result<(), ErreurBanque>` qui vérifient tous les invariants (montant > 0, comptes existants, solde suffisant) de façon atomique.",
      },
      {
        title: "5. Consultation",
        detail: "`solde(&self, id: u32) -> Result<u64, ErreurBanque>`.",
      },
    ],
    starter: `use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub struct Compte {
    pub id: u32,
    pub solde: u64, // en centimes
}

#[derive(Debug, Clone, PartialEq)]
pub enum ErreurBanque {
    CompteInconnu(u32),
    SoldeInsuffisant { demande: u64, disponible: u64 },
    MontantNul,
}

impl fmt::Display for ErreurBanque {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        todo!()
    }
}

#[derive(Debug, Default)]
pub struct Banque {
    comptes: HashMap<u32, Compte>,
    prochain_id: u32,
}

impl Banque {
    pub fn nouvelle() -> Self {
        Self::default()
    }

    pub fn ouvrir_compte(&mut self, depot: u64) -> u32 {
        todo!()
    }

    pub fn deposer(&mut self, id: u32, montant: u64) -> Result<(), ErreurBanque> {
        todo!()
    }

    pub fn retirer(&mut self, id: u32, montant: u64) -> Result<(), ErreurBanque> {
        todo!()
    }

    pub fn virer(&mut self, de: u32, vers: u32, montant: u64) -> Result<(), ErreurBanque> {
        todo!()
    }

    pub fn solde(&self, id: u32) -> Result<u64, ErreurBanque> {
        todo!()
    }
}`,
    tests: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ouverture_et_solde() {
        let mut b = Banque::nouvelle();
        let c = b.ouvrir_compte(1000);
        assert_eq!(b.solde(c), Ok(1000));
    }

    #[test]
    fn virement_reussi() {
        let mut b = Banque::nouvelle();
        let a = b.ouvrir_compte(1000);
        let c = b.ouvrir_compte(0);
        assert!(b.virer(a, c, 400).is_ok());
        assert_eq!(b.solde(a), Ok(600));
        assert_eq!(b.solde(c), Ok(400));
    }

    #[test]
    fn solde_insuffisant() {
        let mut b = Banque::nouvelle();
        let a = b.ouvrir_compte(100);
        let c = b.ouvrir_compte(0);
        assert_eq!(
            b.virer(a, c, 500),
            Err(ErreurBanque::SoldeInsuffisant { demande: 500, disponible: 100 })
        );
        // Le virement a échoué : aucun solde n'a bougé.
        assert_eq!(b.solde(a), Ok(100));
        assert_eq!(b.solde(c), Ok(0));
    }

    #[test]
    fn montant_nul_refuse() {
        let mut b = Banque::nouvelle();
        let a = b.ouvrir_compte(100);
        assert_eq!(b.deposer(a, 0), Err(ErreurBanque::MontantNul));
    }

    #[test]
    fn compte_inconnu() {
        let b = Banque::nouvelle();
        assert_eq!(b.solde(42), Err(ErreurBanque::CompteInconnu(42)));
    }
}`,
    extensions: [
      "Ajoute un historique des opérations (`Vec<Operation>`) par compte.",
      "Rends le montant générique sur un trait `Devise`.",
      "Ajoute un verrou de concurrence (`Mutex`) pour une banque thread-safe.",
    ],
  },
];

/** Retrouve un projet par son slug. */
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
