import type { Chapter } from "../../types";

export const ch11: Chapter = {
  number: 11,
  slug: "tests",
  title: "Écrire des tests automatisés",
  subtitle: "Vérifier son code automatiquement avec #[test], assert! et cargo test.",
  description:
    "Jusqu'ici, tu as vérifié ton code en le lisant ou en l'exécutant à la main — une méthode lente et peu fiable dès que le projet grossit. Rust intègre un framework de test directement dans le langage et dans Cargo : ce chapitre t'apprend à écrire des tests automatisés qui vérifient ton code à chaque compilation, sécurisent tes refactorings et documentent le comportement attendu de tes fonctions. C'est une compétence transversale : tout le reste du cours en dépendra.",
  minutes: 40,
  rustBookRef: "Chapitre 11 — Writing Automated Tests",
  objectives: [
    "Comprendre l'anatomie d'un test : #[test], #[cfg(test)] mod tests, use super::*",
    "Utiliser assert!, assert_eq! et assert_ne! avec des messages personnalisés",
    "Vérifier qu'une fonction panique bien avec #[should_panic] et son argument expected",
    "Écrire des tests qui renvoient un Result<(), E> pour utiliser l'opérateur ?",
    "Piloter cargo test : filtrage par nom, --test-threads, --nocapture, #[ignore]",
    "Distinguer tests unitaires (src/) et tests d'intégration (dossier tests/)",
  ],
  sections: [
    {
      id: "anatomie",
      number: "11.1",
      title: "Anatomie d'un test",
      blocks: [
        {
          type: "paragraph",
          text: "Un test Rust est une fonction ordinaire annotée par l'attribut `#[test]`. Quand tu lances `cargo test`, Cargo compile ton code dans un mode spécial où les blocs marqués `#[cfg(test)]` sont inclus, exécute toutes les fonctions de test, puis affiche un rapport : combien ont réussi, combien ont échoué.",
        },
        {
          type: "code",
          language: "rust",
          filename: "lib.rs",
          code:
            'fn addition(a: i32, b: i32) -> i32 {\n    a + b\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn deux_plus_deux_font_quatre() {\n        assert_eq!(addition(2, 2), 4);\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Trois éléments à comprendre : `#[cfg(test)]` indique au compilateur de n'inclure ce module que lors de `cargo test` — il disparaît du binaire final, donc pas de coût en production. `mod tests` est un simple module, une convention (pas une obligation) pour regrouper les tests près du code qu'ils vérifient. `use super::*;` importe tout ce qui est défini dans le module parent, pour accéder aux fonctions et types testés sans répéter leur chemin complet.",
        },
        {
          type: "code",
          language: "bash",
          code:
            "cargo test\n\n# running 1 test\n# test tests::deux_plus_deux_font_quatre ... ok\n#\n# test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out",
        },
        {
          type: "callout",
          variant: "info",
          title: "Pourquoi tester au même endroit que le code",
          text: "Placer les tests dans le même fichier via `#[cfg(test)] mod tests` permet de tester des fonctions et types **privés** (non `pub`), puisque le module `tests` est un enfant du module courant et hérite de la visibilité. C'est la norme pour les tests unitaires en Rust.",
        },
      ],
    },
    {
      id: "assertions",
      number: "11.1",
      title: "Les macros assert!, assert_eq! et assert_ne!",
      blocks: [
        {
          type: "paragraph",
          text: "Trois macros forment la base de la quasi-totalité des tests Rust.",
        },
        {
          type: "list",
          items: [
            "`assert!(expr)` — panique si `expr` vaut `false`.",
            "`assert_eq!(gauche, droite)` — panique si les deux valeurs diffèrent, et affiche les deux dans le message d'erreur.",
            "`assert_ne!(gauche, droite)` — panique si les deux valeurs sont égales.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn est_positif(n: i32) -> bool {\n    n > 0\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn verifie_les_trois_macros() {\n        assert!(est_positif(5));\n        assert_eq!(est_positif(5), true);\n        assert_ne!(est_positif(5), false);\n    }\n}',
        },
        {
          type: "paragraph",
          text: "`assert_eq!` et `assert_ne!` exigent que le type comparé implémente les traits `PartialEq` (pour comparer) et `Debug` (pour afficher les valeurs en cas d'échec). Pour tes propres structs et enums, ajoute `#[derive(PartialEq, Debug)]`.",
        },
        {
          type: "paragraph",
          text: "Toutes ces macros acceptent des arguments supplémentaires façon `format!` pour produire un message d'erreur personnalisé, très utile quand l'assertion seule ne dit pas *pourquoi* le test a échoué :",
        },
        {
          type: "code",
          language: "rust",
          code:
            'assert_eq!(\n    addition(2, 2),\n    5,\n    "addition(2, 2) a renvoyé {}, attendu 5",\n    addition(2, 2)\n);',
        },
        {
          type: "callout",
          variant: "tip",
          text: "En pratique, réserve le message personnalisé aux assertions dont l'échec serait ambigu (plusieurs valeurs comparées dans la même fonction de test, par exemple). Pour un `assert_eq!` isolé, le message par défaut de Rust — qui affiche déjà `left` et `right` — suffit largement.",
        },
      ],
    },
    {
      id: "panics",
      number: "11.1",
      title: "Tester qu'une fonction panique avec #[should_panic]",
      blocks: [
        {
          type: "paragraph",
          text: "Certaines fonctions doivent **paniquer** volontairement quand on les appelle avec des entrées invalides : ce sont des garde-fous. L'attribut `#[should_panic]` déclare qu'un test ne réussit que si le code panique effectivement.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'pub struct Pourcentage {\n    valeur: f64,\n}\n\nimpl Pourcentage {\n    pub fn new(valeur: f64) -> Pourcentage {\n        if !(0.0..=100.0).contains(&valeur) {\n            panic!("le pourcentage doit être compris entre 0 et 100, reçu {valeur}");\n        }\n        Pourcentage { valeur }\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    #[should_panic]\n    fn rejette_une_valeur_hors_bornes() {\n        Pourcentage::new(150.0);\n    }\n\n    #[test]\n    #[should_panic(expected = "compris entre 0 et 100")]\n    fn message_de_panique_est_explicite() {\n        Pourcentage::new(-1.0);\n    }\n}',
        },
        {
          type: "callout",
          variant: "warning",
          text: '`expected` vérifie qu\'une **sous-chaîne** du message de panique correspond — pas une correspondance exacte. Un `expected` trop court (ex: "invalide") risque de valider un test même si la fonction panique pour une tout autre raison que celle voulue. Sois aussi précis que possible.',
        },
        {
          type: "usecase",
          title: "Garde-fous et invariants",
          text: "`#[should_panic]` est idéal pour documenter et vérifier les *invariants* d'un type : des conditions qui ne doivent jamais être violées (un pourcentage hors bornes, un index hors limites, une division par zéro dans une fonction qui ne renvoie pas de `Result`). Le test agit comme une preuve exécutable que la garde-fou fonctionne, et qu'elle continuera de fonctionner après un refactoring.",
        },
      ],
    },
    {
      id: "result-tests",
      number: "11.1",
      title: "Des tests qui renvoient Result<(), E>",
      blocks: [
        {
          type: "paragraph",
          text: "Depuis l'édition 2018, un test peut aussi renvoyer un `Result<(), E>` plutôt que d'appeler `assert!` ou de paniquer. Le test échoue si la fonction renvoie `Err`, ce qui permet d'utiliser l'opérateur `?` pour enchaîner des opérations faillibles directement dans le corps du test.",
        },
        {
          type: "code",
          language: "rust",
          code:
            'fn diviser(a: i32, b: i32) -> Result<i32, String> {\n    if b == 0 {\n        Err("division par zéro".to_string())\n    } else {\n        Ok(a / b)\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn diviser_avec_l_operateur_interrogation() -> Result<(), String> {\n        let resultat = diviser(10, 2)?;\n        assert_eq!(resultat, 5);\n        Ok(())\n    }\n}',
        },
        {
          type: "callout",
          variant: "info",
          text: "Cette forme ne se combine pas avec `#[should_panic]` : un test qui renvoie un `Result` doit terminer par `Ok(())` en cas de succès, et signaler un échec en renvoyant `Err`, jamais en paniquant.",
        },
      ],
    },
    {
      id: "controle-execution",
      number: "11.2",
      title: "Piloter l'exécution avec cargo test",
      blocks: [
        {
          type: "paragraph",
          text: "`cargo test` propose de nombreuses options pour choisir précisément quels tests s'exécutent et comment.",
        },
        {
          type: "code",
          language: "bash",
          code:
            'cargo test                        # exécute tous les tests\ncargo test addition                # ne garde que les tests dont le nom contient "addition"\ncargo test -- --test-threads=1     # exécute les tests en séquence (utile si des tests partagent un état)\ncargo test -- --nocapture          # affiche les println! même pour les tests qui réussissent\ncargo test -- --ignored            # exécute uniquement les tests marqués #[ignore]',
        },
        {
          type: "paragraph",
          text: "Par défaut, Cargo exécute les tests **en parallèle** sur plusieurs threads et capture (masque) tout ce que les tests affichent avec `println!`, pour ne montrer que la sortie des tests qui échouent. Le séparateur `--` isole les arguments destinés à Cargo lui-même de ceux transmis au binaire de test.",
        },
        {
          type: "code",
          language: "rust",
          code:
            '#[test]\n#[ignore]\nfn test_tres_long_a_executer() {\n    // simulateur coûteux, calcul intensif, appel réseau…\n    // ignoré par défaut, lancé explicitement avec `cargo test -- --ignored`\n}',
        },
        {
          type: "callout",
          variant: "tip",
          text: "`#[ignore]` est pratique pour des tests lents (gros volumes de données, accès disque) que tu ne veux pas relancer à chaque `cargo test`, mais que tu veux garder disponibles pour une vérification complète avant une release.",
        },
      ],
    },
    {
      id: "unit-vs-integration",
      number: "11.3",
      title: "Tests unitaires vs tests d'intégration",
      blocks: [
        {
          type: "paragraph",
          text: "Rust distingue deux catégories de tests. Les **tests unitaires**, vus jusqu'ici, vivent dans `src/` à côté du code, dans des modules `#[cfg(test)]` : ils testent des fonctions isolées, y compris privées. Les **tests d'intégration** vivent dans un dossier `tests/` à la racine du projet (à côté de `src/`) : chaque fichier y est compilé comme un crate séparé qui n'a accès qu'à l'API **publique** de ta bibliothèque, exactement comme le ferait un utilisateur externe.",
        },
        {
          type: "code",
          language: "text",
          code:
            "mon_projet/\n├── Cargo.toml\n├── src/\n│   └── lib.rs         <- tests unitaires, dans des mod tests\n└── tests/\n    └── integration.rs <- tests d'intégration, un crate par fichier",
        },
        {
          type: "code",
          language: "rust",
          filename: "tests/integration.rs",
          code:
            'use mon_projet::addition;\n\n#[test]\nfn addition_est_accessible_depuis_lexterieur() {\n    assert_eq!(addition(2, 2), 4);\n}',
        },
        {
          type: "paragraph",
          text: "Comme chaque fichier de `tests/` est son propre crate, il faut `use` le nom du crate testé (celui déclaré dans `Cargo.toml`) suivi des éléments `pub` que tu veux exercer. Ce dossier n'a de sens que pour les bibliothèques (crates avec un `lib.rs`) : un simple binaire `main.rs` n'a pas d'API publique à tester depuis l'extérieur.",
        },
        {
          type: "usecase",
          title: "Sécuriser un refactoring et pratiquer le TDD",
          text: "La vraie valeur des tests apparaît quand tu modifies du code existant : une suite de tests qui passe avant *et après* un refactoring te garantit que le comportement observable n'a pas changé, même si l'implémentation interne est méconnaissable. Beaucoup de développeurs Rust pratiquent aussi le TDD (*Test-Driven Development*) : écrire un test qui échoue (rouge), écrire le minimum de code pour le faire passer (vert), puis nettoyer le code en gardant les tests au vert (refactor). Combiné à un compilateur strict sur les types, ce cycle donne une garantie de robustesse rare dans l'industrie.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Les tests d'intégration compilent chaque fichier en un crate séparé, ce qui ralentit `cargo test` si tu en as beaucoup. Pour partager du code utilitaire entre plusieurs fichiers de `tests/` sans qu'il soit traité comme une suite de tests à part entière, place-le dans `tests/commun/mod.rs` (convention historique du dossier `mod.rs`).",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch11-ex1",
      title: "Tester la fonction est_pair",
      difficulty: "facile",
      prompt:
        "Écris la fonction `est_pair(n: i32) -> bool` qui renvoie `true` si `n` est pair. Puis écris un module `#[cfg(test)]` qui couvre : un nombre pair positif, un nombre impair positif, zéro (qui est pair), et des nombres négatifs pairs et impairs.",
      hints: [
        "L'opérateur `%` donne le reste d'une division entière.",
        "Zéro est pair : `0 % 2 == 0`.",
        "Rust gère aussi les négatifs : `-4 % 2 == 0`.",
      ],
      starter: "fn est_pair(n: i32) -> bool {\n    todo!()\n}",
      solution: "fn est_pair(n: i32) -> bool {\n    n % 2 == 0\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn nombre_pair_positif() {\n        assert!(est_pair(4));\n    }\n\n    #[test]\n    fn nombre_impair_positif() {\n        assert!(!est_pair(7));\n    }\n\n    #[test]\n    fn zero_est_pair() {\n        assert!(est_pair(0));\n    }\n\n    #[test]\n    fn negatif_pair() {\n        assert!(est_pair(-8));\n    }\n\n    #[test]\n    fn negatif_impair() {\n        assert!(!est_pair(-3));\n    }\n}',
    },
    {
      id: "ch11-ex2",
      title: "Vérifier un garde-fou avec #[should_panic]",
      difficulty: "moyen",
      prompt:
        'Écris la fonction `retirer(solde: u32, montant: u32) -> u32` qui renvoie le nouveau solde après un retrait. Si `montant` dépasse `solde`, la fonction doit **paniquer** avec un message contenant la sous-chaîne `"solde insuffisant"`. Écris un test pour un retrait valide et un test `#[should_panic(expected = "solde insuffisant")]` pour le cas invalide.',
      hints: [
        'Utilise `panic!("...")` avec un message explicite, par exemple contenant "solde insuffisant".',
        "L'attribut `#[should_panic(expected = \"...\")]` vérifie une sous-chaîne du message de panique, pas une correspondance exacte.",
      ],
      starter: "fn retirer(solde: u32, montant: u32) -> u32 {\n    todo!()\n}",
      solution:
        'fn retirer(solde: u32, montant: u32) -> u32 {\n    if montant > solde {\n        panic!("solde insuffisant : impossible de retirer {montant} sur un solde de {solde}");\n    }\n    solde - montant\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn retrait_valide_diminue_le_solde() {\n        assert_eq!(retirer(100, 30), 70);\n    }\n\n    #[test]\n    fn retrait_du_solde_exact_donne_zero() {\n        assert_eq!(retirer(50, 50), 0);\n    }\n\n    #[test]\n    #[should_panic(expected = "solde insuffisant")]\n    fn retrait_trop_eleve_panique() {\n        retirer(10, 50);\n    }\n}',
    },
    {
      id: "ch11-ex3",
      title: "Message d'erreur personnalisé avec assert_eq!",
      difficulty: "moyen",
      prompt:
        "Écris la fonction `moyenne(notes: &[f64]) -> f64` qui renvoie la moyenne arithmétique d'une liste de notes, ou `0.0` si la liste est vide (pour éviter une division par zéro). Écris un test qui utilise `assert_eq!` avec un **message personnalisé** rappelant les notes utilisées, ainsi qu'un test du cas vide.",
      hints: [
        "`iter().sum::<f64>()` additionne les éléments d'un slice de `f64`.",
        '`assert_eq!(gauche, droite, "contexte {:?}", valeur)` accepte les mêmes arguments que `format!` après la comparaison, pour préciser le contexte en cas d\'échec.',
      ],
      starter: "fn moyenne(notes: &[f64]) -> f64 {\n    todo!()\n}",
      solution:
        "fn moyenne(notes: &[f64]) -> f64 {\n    if notes.is_empty() {\n        return 0.0;\n    }\n    notes.iter().sum::<f64>() / notes.len() as f64\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn moyenne_de_trois_notes() {\n        let notes = [10.0, 20.0, 30.0];\n        assert_eq!(\n            moyenne(&notes),\n            20.0,\n            "la moyenne de {:?} devrait valoir 20.0",\n            notes\n        );\n    }\n\n    #[test]\n    fn moyenne_liste_vide_est_nulle() {\n        let notes: [f64; 0] = [];\n        assert_eq!(\n            moyenne(&notes),\n            0.0,\n            "une liste vide doit donner une moyenne de 0.0, pas un crash par division par zéro"\n        );\n    }\n}',
    },
    {
      id: "ch11-ex4",
      title: "Un test qui renvoie Result",
      difficulty: "difficile",
      prompt:
        "Écris la fonction `diviser(a: i32, b: i32) -> Result<i32, String>` qui renvoie `Err` avec un message explicite si `b` vaut `0`, sinon `Ok(a / b)`. Écris ensuite un test dont la signature est `fn ...() -> Result<(), String>`, qui utilise l'opérateur `?` pour appeler `diviser` puis vérifie le résultat avec `assert_eq!`, en terminant par `Ok(())`. Ajoute aussi un test classique qui vérifie le cas `b == 0`.",
      hints: [
        "L'opérateur `?` propage une `Err` : si `diviser` renvoie `Err`, le test s'arrête immédiatement et échoue.",
        "N'oublie pas la dernière ligne `Ok(())` si toutes les assertions ont réussi.",
      ],
      starter: "fn diviser(a: i32, b: i32) -> Result<i32, String> {\n    todo!()\n}",
      solution:
        'fn diviser(a: i32, b: i32) -> Result<i32, String> {\n    if b == 0 {\n        Err("division par zéro".to_string())\n    } else {\n        Ok(a / b)\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn diviser_avec_l_operateur_interrogation() -> Result<(), String> {\n        let resultat = diviser(20, 4)?;\n        assert_eq!(resultat, 5);\n        Ok(())\n    }\n\n    #[test]\n    fn diviser_par_zero_renvoie_une_erreur() {\n        assert!(diviser(10, 0).is_err());\n    }\n\n    #[test]\n    fn diviser_par_zero_message_explicite() {\n        assert_eq!(diviser(10, 0), Err("division par zéro".to_string()));\n    }\n}',
    },
  ],
  project: {
    id: "ch11-projet",
    title: "Bibliothèque panier : suite de tests complète",
    difficulty: "difficile",
    prompt:
      "Construis une petite bibliothèque de panier d'achat. Le type `Panier` doit exposer : `Panier::nouveau()` pour créer un panier vide ; `ajouter(&mut self, nom: &str, prix_unitaire: f64, quantite: u32)` pour ajouter un article (elle doit **paniquer** si `prix_unitaire` est négatif, ou si `quantite` vaut `0`) ; `total(&self) -> f64` qui renvoie la somme de tous les articles (prix × quantité) ; et `appliquer_reduction(&self, pourcentage: f64) -> f64` qui renvoie le total après une réduction en pourcentage (elle doit **paniquer** si `pourcentage` n'est pas compris entre `0.0` et `100.0`). Livre une suite de tests exhaustive : panier vide, un article, plusieurs articles cumulés, réductions de 0 %, 50 % et 100 %, et un test `#[should_panic]` pour chacun des trois garde-fous.",
    hints: [
      "Stocke les articles dans un `Vec<Article>` interne, avec une struct `Article { nom: String, prix_unitaire: f64, quantite: u32 }`.",
      "`(0.0..=100.0).contains(&pourcentage)` vérifie proprement un intervalle de flottants.",
      "`self.articles.iter().map(|a| a.prix_unitaire * a.quantite as f64).sum()` calcule le total en une seule expression.",
      "Chaque garde-fou (`ajouter` avec prix négatif, `ajouter` avec quantité nulle, `appliquer_reduction` hors bornes) mérite son propre test `#[should_panic(expected = \"...\")]`.",
    ],
    starter:
      "pub struct Article {\n    pub nom: String,\n    pub prix_unitaire: f64,\n    pub quantite: u32,\n}\n\npub struct Panier {\n    articles: Vec<Article>,\n}\n\nimpl Panier {\n    pub fn nouveau() -> Self {\n        todo!()\n    }\n\n    /// Ajoute un article au panier.\n    /// Panique si `prix_unitaire` est négatif ou si `quantite` vaut 0.\n    pub fn ajouter(&mut self, nom: &str, prix_unitaire: f64, quantite: u32) {\n        todo!()\n    }\n\n    /// Renvoie le total du panier (prix * quantité, sommé sur tous les articles).\n    pub fn total(&self) -> f64 {\n        todo!()\n    }\n\n    /// Renvoie le total après une réduction en pourcentage (0.0 à 100.0).\n    /// Panique si `pourcentage` n'est pas compris entre 0 et 100.\n    pub fn appliquer_reduction(&self, pourcentage: f64) -> f64 {\n        todo!()\n    }\n}",
    solution:
      'pub struct Article {\n    pub nom: String,\n    pub prix_unitaire: f64,\n    pub quantite: u32,\n}\n\npub struct Panier {\n    articles: Vec<Article>,\n}\n\nimpl Panier {\n    pub fn nouveau() -> Self {\n        Panier { articles: Vec::new() }\n    }\n\n    /// Ajoute un article au panier.\n    /// Panique si `prix_unitaire` est négatif ou si `quantite` vaut 0.\n    pub fn ajouter(&mut self, nom: &str, prix_unitaire: f64, quantite: u32) {\n        if prix_unitaire < 0.0 {\n            panic!("le prix unitaire ne peut pas être négatif, reçu {prix_unitaire}");\n        }\n        if quantite == 0 {\n            panic!("la quantité doit être au moins 1, reçu {quantite}");\n        }\n        self.articles.push(Article {\n            nom: nom.to_string(),\n            prix_unitaire,\n            quantite,\n        });\n    }\n\n    /// Renvoie le total du panier (prix * quantité, sommé sur tous les articles).\n    pub fn total(&self) -> f64 {\n        self.articles\n            .iter()\n            .map(|a| a.prix_unitaire * a.quantite as f64)\n            .sum()\n    }\n\n    /// Renvoie le total après une réduction en pourcentage (0.0 à 100.0).\n    /// Panique si `pourcentage` n\'est pas compris entre 0 et 100.\n    pub fn appliquer_reduction(&self, pourcentage: f64) -> f64 {\n        if !(0.0..=100.0).contains(&pourcentage) {\n            panic!("le pourcentage de réduction doit être compris entre 0 et 100, reçu {pourcentage}");\n        }\n        let total = self.total();\n        total - (total * pourcentage / 100.0)\n    }\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn panier_vide_a_un_total_nul() {\n        let panier = Panier::nouveau();\n        assert_eq!(panier.total(), 0.0);\n    }\n\n    #[test]\n    fn ajouter_un_article_met_a_jour_le_total() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("stylo", 1.5, 2);\n        assert_eq!(panier.total(), 3.0);\n    }\n\n    #[test]\n    fn ajouter_plusieurs_articles_cumule_le_total() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("stylo", 1.5, 2);\n        panier.ajouter("cahier", 3.0, 1);\n        assert_eq!(\n            panier.total(),\n            6.0,\n            "le total devrait cumuler tous les articles du panier"\n        );\n    }\n\n    #[test]\n    fn reduction_de_zero_pourcent_ne_change_rien() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("livre", 10.0, 1);\n        assert_eq!(panier.appliquer_reduction(0.0), 10.0);\n    }\n\n    #[test]\n    fn reduction_de_cinquante_pourcent() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("livre", 20.0, 1);\n        assert_eq!(panier.appliquer_reduction(50.0), 10.0);\n    }\n\n    #[test]\n    fn reduction_de_cent_pourcent_annule_le_total() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("livre", 10.0, 1);\n        assert_eq!(panier.appliquer_reduction(100.0), 0.0);\n    }\n\n    #[test]\n    #[should_panic(expected = "prix unitaire ne peut pas être négatif")]\n    fn ajouter_prix_negatif_panique() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("erreur", -5.0, 1);\n    }\n\n    #[test]\n    #[should_panic(expected = "quantité doit être au moins 1")]\n    fn ajouter_quantite_nulle_panique() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("erreur", 5.0, 0);\n    }\n\n    #[test]\n    #[should_panic(expected = "compris entre 0 et 100")]\n    fn reduction_invalide_panique() {\n        let mut panier = Panier::nouveau();\n        panier.ajouter("livre", 10.0, 1);\n        panier.appliquer_reduction(150.0);\n    }\n}',
  },
  keyTakeaways: [
    "Un test est une fonction annotée #[test] ; #[cfg(test)] mod tests regroupe les tests unitaires près du code, avec use super::*.",
    "assert!, assert_eq! et assert_ne! sont les briques de base ; ajoute un message personnalisé pour clarifier un échec ambigu.",
    "#[should_panic] (et son argument expected) vérifie qu'une fonction panique bien face à une entrée invalide — reste précis dans le texte attendu.",
    "Un test peut renvoyer Result<(), E> pour utiliser l'opérateur ? au lieu de unwrap()/expect().",
    "cargo test accepte un filtre par nom, et -- --test-threads=1, --nocapture, --ignored pour contrôler précisément l'exécution.",
    "Tests unitaires (src/, accès au privé) et tests d'intégration (tests/, API publique uniquement) sont complémentaires.",
  ],
};
