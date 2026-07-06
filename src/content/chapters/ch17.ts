import type { Chapter } from "../types";

export const ch17: Chapter = {
  number: 17,
  slug: "poo",
  title: "Rust et la programmation orientée objet",
  subtitle: "Encapsulation, objets-traits et le patron d'état sans héritage.",
  description:
    "Rust n'a pas d'héritage de classes, et pourtant on peut y écrire du code « orienté objet » : encapsuler des données derrière une API publique, définir un comportement partagé par plusieurs types avec des traits, et stocker des valeurs de types différents dans la même collection grâce aux objets-traits (`Box<dyn Trait>`). Ce chapitre explore ce que Rust garde de la POO, ce qu'il rejette délibérément, et comment implémenter le classique patron d'état sans classe mère.",
  minutes: 45,
  rustBookRef: "Chapitre 17 — Object-Oriented Programming Features",
  objectives: [
    "Identifier ce que Rust retient de la POO (encapsulation) et ce qu'il rejette (héritage)",
    "Créer des objets-traits avec `Box<dyn Trait>` pour du polymorphisme dynamique",
    "Stocker des valeurs de types différents dans une collection homogène",
    "Distinguer dispatch statique (génériques) et dispatch dynamique (`dyn`), et choisir le bon",
    "Implémenter le patron d'état avec des objets-traits, puis avec des enums idiomatiques",
  ],
  sections: [
    {
      id: "poo-a-la-rust",
      title: "Ce que Rust garde (et rejette) de la POO",
      blocks: [
        {
          type: "paragraph",
          text: "La programmation orientée objet est traditionnellement définie par trois piliers : l'**encapsulation** (cacher les détails internes derrière une interface), le **polymorphisme** (traiter des types différents de façon uniforme) et l'**héritage** (réutiliser du code en héritant d'une classe parente). Rust n'a pas de `class`, pas de mot-clé `extends`, et aucune notion de classe mère. Pourtant, deux des trois piliers sont bien présents.",
        },
        {
          type: "heading",
          level: 3,
          text: "L'encapsulation via `pub`",
        },
        {
          type: "paragraph",
          text: "En Rust, l'encapsulation se fait au niveau du module avec le mot-clé `pub`. Une `struct` peut exposer des méthodes publiques tout en gardant ses champs privés, exactement comme une classe cacherait ses attributs derrière des accesseurs.",
        },
        {
          type: "code",
          language: "rust",
          code: "pub struct CompteBancaire {\n    solde: f64, // privé : inaccessible hors du module\n}\n\nimpl CompteBancaire {\n    pub fn nouveau() -> Self {\n        CompteBancaire { solde: 0.0 }\n    }\n\n    pub fn deposer(&mut self, montant: f64) {\n        if montant > 0.0 {\n            self.solde += montant;\n        }\n    }\n\n    pub fn solde(&self) -> f64 {\n        self.solde\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Le champ `solde` ne peut être modifié que via `deposer`, qui garantit l'invariant « le solde ne baisse jamais sous l'effet d'un dépôt négatif ». C'est exactement l'esprit de l'encapsulation, sans qu'il y ait la moindre classe.",
        },
        {
          type: "heading",
          level: 3,
          text: "Pas d'héritage, mais des traits",
        },
        {
          type: "paragraph",
          text: "Rust n'offre pas d'héritage d'implémentation entre structures : on ne peut pas écrire `struct Chien : Animal { ... }`. Deux raisons à ce choix : l'héritage encourage souvent à partager plus de code que nécessaire (fragilité du parent), et il complique le système de types. À la place, Rust propose la **composition** et les **traits**, qui permettent de partager un comportement (des méthodes) sans partager de représentation mémoire.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Traits avec méthodes par défaut",
          text: "Un trait peut fournir une implémentation par défaut pour certaines méthodes, ce qui se rapproche du partage de code de l'héritage — sans ses inconvénients : une struct peut implémenter plusieurs traits, alors qu'elle ne peut hériter que d'une seule classe dans les langages qui l'autorisent.",
        },
      ],
    },
    {
      id: "objets-traits",
      title: "Objets-traits : le polymorphisme dynamique",
      blocks: [
        {
          type: "paragraph",
          text: "Le vrai défi de la POO en Rust, c'est de stocker dans une même collection des valeurs de types **différents** qui partagent un comportement commun. Un `Vec<T>` exige un seul type concret `T` : impossible d'y mêler directement un `Cercle` et un `Carre`. La solution s'appelle l'**objet-trait** (*trait object*), écrit `Box<dyn Trait>`.",
        },
        {
          type: "code",
          language: "rust",
          code: "pub trait Dessinable {\n    fn aire(&self) -> f64;\n    fn nom(&self) -> &str;\n}\n\npub struct Cercle {\n    pub rayon: f64,\n}\n\nimpl Dessinable for Cercle {\n    fn aire(&self) -> f64 {\n        std::f64::consts::PI * self.rayon * self.rayon\n    }\n    fn nom(&self) -> &str {\n        \"cercle\"\n    }\n}\n\npub struct Rectangle {\n    pub largeur: f64,\n    pub hauteur: f64,\n}\n\nimpl Dessinable for Rectangle {\n    fn aire(&self) -> f64 {\n        self.largeur * self.hauteur\n    }\n    fn nom(&self) -> &str {\n        \"rectangle\"\n    }\n}",
        },
        {
          type: "paragraph",
          text: "On peut maintenant construire une collection **hétérogène** : un `Vec` de boîtes, chacune contenant un type concret différent, mais toutes garanties d'implémenter `Dessinable`.",
        },
        {
          type: "code",
          language: "rust",
          code: "fn aire_totale(formes: &[Box<dyn Dessinable>]) -> f64 {\n    formes.iter().map(|f| f.aire()).sum()\n}\n\nfn main() {\n    let formes: Vec<Box<dyn Dessinable>> = vec![\n        Box::new(Cercle { rayon: 2.0 }),\n        Box::new(Rectangle { largeur: 3.0, hauteur: 4.0 }),\n    ];\n\n    for forme in &formes {\n        println!(\"{} -> aire {:.2}\", forme.nom(), forme.aire());\n    }\n    println!(\"total: {:.2}\", aire_totale(&formes));\n}",
        },
        {
          type: "paragraph",
          text: "`Box<dyn Dessinable>` place la valeur sur le tas et efface son type concret : à l'exécution, le programme conserve un pointeur vers les données et un pointeur vers une **vtable** (table des méthodes) qui permet d'appeler la bonne implémentation. C'est le **dispatch dynamique** : la méthode appelée n'est déterminée qu'à l'exécution, pas à la compilation.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Objet-sûr (object safety)",
          text: "Tous les traits ne peuvent pas devenir des objets-traits. Un trait doit être « objet-sûr » : pas de méthode générique, pas de retour `Self` par valeur. `Clone`, par exemple, n'est pas objet-sûr (sa méthode renvoie `Self`), donc `Box<dyn Clone>` ne compile pas.",
        },
      ],
    },
    {
      id: "dispatch-statique-dynamique",
      title: "Dispatch statique vs dispatch dynamique",
      blocks: [
        {
          type: "paragraph",
          text: "Le même problème — appeler `aire()` sur des formes différentes — peut aussi se résoudre avec des **génériques**. C'est le **dispatch statique** : le compilateur génère une version spécialisée de la fonction pour chaque type concret utilisé (monomorphisation).",
        },
        {
          type: "code",
          language: "rust",
          code: "// Dispatch statique : un seul type T par appel, résolu à la compilation.\nfn afficher_aire<T: Dessinable>(forme: &T) {\n    println!(\"{} -> {:.2}\", forme.nom(), forme.aire());\n}\n\n// Dispatch dynamique : accepte n'importe quel type implémentant Dessinable.\nfn afficher_aire_dyn(forme: &dyn Dessinable) {\n    println!(\"{} -> {:.2}\", forme.nom(), forme.aire());\n}",
        },
        {
          type: "list",
          items: [
            "**Statique (`impl Trait` / `<T: Trait>`)** : aucun coût à l'exécution (la méthode est inlineable), mais chaque type concret utilisé génère du code binaire séparé — pas de collection hétérogène possible.",
            "**Dynamique (`dyn Trait`)** : un seul code binaire pour tous les types, autorise les collections hétérogènes (`Vec<Box<dyn Trait>>`), au prix d'une petite indirection (appel via vtable) et d'une allocation sur le tas dans le cas de `Box`.",
          ],
        },
        {
          type: "usecase",
          title: "Plugins et collections hétérogènes",
          text: "Le dispatch dynamique brille dès qu'on ne connaît pas à l'avance l'ensemble des types concrets : un système de **plugins** (chaque plugin implémente un trait `Plugin`, chargé dynamiquement), une interface graphique où des `Bouton`, `CaseACocher` et `ChampTexte` partagent un trait `Widget`, ou un moteur de jeu avec un `Vec<Box<dyn Entite>>` mêlant ennemis, projectiles et décors. Dans tous ces cas, la liste des types n'est pas figée dans une seule fonction générique : c'est exactement le problème que `dyn Trait` résout.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Règle pratique : commence par des génériques (dispatch statique). Ne passe à `dyn Trait` que lorsque tu as réellement besoin de stocker des types hétérogènes dans une même structure, ou d'éviter une explosion du nombre de fonctions monomorphisées.",
        },
      ],
    },
    {
      id: "patron-etat-objets-traits",
      title: "Le patron d'état avec des objets-traits",
      blocks: [
        {
          type: "paragraph",
          text: "Le **patron d'état** (*state pattern*) modélise un objet dont le comportement change selon son état interne, sans que le code appelant ait besoin de connaître tous les états possibles. En POO classique, on définit une interface `Etat` et une classe par état. Rust fait la même chose avec des traits et des objets-traits.",
        },
        {
          type: "paragraph",
          text: "Exemple : un article de blog qui passe de `Brouillon` à `EnRevue` puis à `Publie`. Le contenu n'est visible que lorsque l'article est publié.",
        },
        {
          type: "code",
          language: "rust",
          code: "trait Etat {\n    fn approuver(self: Box<Self>) -> Box<dyn Etat>;\n    fn demander_revue(self: Box<Self>) -> Box<dyn Etat>;\n    fn contenu<'a>(&self, _article: &'a Article) -> &'a str {\n        \"\"\n    }\n}\n\nstruct Brouillon;\nimpl Etat for Brouillon {\n    fn approuver(self: Box<Self>) -> Box<dyn Etat> {\n        self // rien ne se passe : il faut d'abord demander une revue\n    }\n    fn demander_revue(self: Box<Self>) -> Box<dyn Etat> {\n        Box::new(EnRevue)\n    }\n}\n\nstruct EnRevue;\nimpl Etat for EnRevue {\n    fn approuver(self: Box<Self>) -> Box<dyn Etat> {\n        Box::new(Publie)\n    }\n    fn demander_revue(self: Box<Self>) -> Box<dyn Etat> {\n        self\n    }\n}\n\nstruct Publie;\nimpl Etat for Publie {\n    fn approuver(self: Box<Self>) -> Box<dyn Etat> {\n        self\n    }\n    fn demander_revue(self: Box<Self>) -> Box<dyn Etat> {\n        self\n    }\n    fn contenu<'a>(&self, article: &'a Article) -> &'a str {\n        &article.texte\n    }\n}\n\npub struct Article {\n    etat: Option<Box<dyn Etat>>,\n    texte: String,\n}\n\nimpl Article {\n    pub fn nouveau(texte: &str) -> Self {\n        Article { etat: Some(Box::new(Brouillon)), texte: texte.to_string() }\n    }\n\n    pub fn demander_revue(&mut self) {\n        if let Some(etat) = self.etat.take() {\n            self.etat = Some(etat.demander_revue());\n        }\n    }\n\n    pub fn approuver(&mut self) {\n        if let Some(etat) = self.etat.take() {\n            self.etat = Some(etat.approuver());\n        }\n    }\n\n    pub fn contenu(&self) -> &str {\n        self.etat.as_ref().unwrap().contenu(self)\n    }\n}",
        },
        {
          type: "paragraph",
          text: "Chaque état décide lui-même de la transition suivante : `Brouillon::approuver` ne fait rien (il faut d'abord passer par la revue), `EnRevue::approuver` produit un `Publie`. Le `self: Box<Self>` consomme l'ancien état pour renvoyer le nouveau — impossible d'utiliser un état obsolète après transition.",
        },
        {
          type: "heading",
          level: 3,
          text: "L'alternative idiomatique : un enum",
        },
        {
          type: "paragraph",
          text: "Le patron d'état avec objets-traits vient du monde orienté objet ; en Rust, il est souvent plus simple, plus rapide et plus sûr d'utiliser un **enum** pour représenter les états, avec un `match` pour les transitions. On perd l'extensibilité « ajouter un état sans toucher au code existant », mais on gagne en clarté : le compilateur vérifie qu'on gère bien tous les cas.",
        },
        {
          type: "code",
          language: "rust",
          code: "enum EtatArticle {\n    Brouillon,\n    EnRevue,\n    Publie,\n}\n\nstruct ArticleEnum {\n    etat: EtatArticle,\n    texte: String,\n}\n\nimpl ArticleEnum {\n    fn demander_revue(&mut self) {\n        self.etat = match self.etat {\n            EtatArticle::Brouillon => EtatArticle::EnRevue,\n            ref autre => return *autre_inchange(autre),\n        };\n    }\n}\n\nfn autre_inchange(_e: &EtatArticle) -> Box<EtatArticle> {\n    unreachable!()\n}",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Exemple simplifié",
          text: "L'extrait ci-dessus illustre l'idée (un enum plutôt qu'une hiérarchie de traits) mais n'est pas la façon la plus propre de l'écrire — l'exercice-projet de ce chapitre te fera implémenter une version correcte et testée avec un simple `match` par transition, sans artifice.",
        },
      ],
    },
    {
      id: "quand-choisir",
      title: "Choisir entre trait objects et enums",
      blocks: [
        {
          type: "paragraph",
          text: "Deux questions permettent de trancher entre `dyn Trait` et un enum fermé (`match`) :",
        },
        {
          type: "list",
          items: [
            "L'ensemble des variantes/types est-il **connu et stable** à la compilation ? Si oui, un enum est presque toujours préférable : plus rapide (pas d'allocation, pas de vtable), et le compilateur force à traiter tous les cas dans un `match`.",
            "Le code doit-il rester **extensible par des tiers** sans recompiler la bibliothèque (ex : plugins tiers, types définis dans un autre crate) ? Si oui, `dyn Trait` est la seule option : n'importe qui peut implémenter le trait pour son propre type.",
          ],
        },
        {
          type: "usecase",
          title: "Bibliothèque de widgets graphiques",
          text: "Une bibliothèque d'interface graphique fournie à des développeurs tiers ne peut pas connaître à l'avance tous les widgets personnalisés que ses utilisateurs créeront. Elle expose donc un trait `Widget` et manipule des `Box<dyn Widget>` : n'importe qui peut créer un nouveau widget en implémentant le trait, sans jamais toucher au code de la bibliothèque. C'est l'exemple archétypal où le dispatch dynamique est indispensable, à l'opposé d'un enum fermé.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Retiens la formule : « des variantes fermées → enum + match ; des types ouverts, inconnus à l'avance → trait + dyn Trait ». Les deux coexistent très bien dans un même programme, chacun là où il est le plus adapté.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch17-ex1",
      title: "Une ménagerie hétérogène",
      difficulty: "facile",
      prompt:
        "Défini un trait `Animal` avec une méthode `bruit(&self) -> String`. Implémente-le pour deux structs `Chien` et `Chat`. Écris une fonction `chorale(animaux: &[Box<dyn Animal>]) -> Vec<String>` qui renvoie la liste des bruits de tous les animaux, dans l'ordre.",
      hints: [
        "`Vec<Box<dyn Animal>>` permet de mélanger `Chien` et `Chat` dans la même collection.",
        "Utilise `.iter().map(...).collect()` pour construire le `Vec<String>` de résultat.",
      ],
      starter:
        "trait Animal {\n    fn bruit(&self) -> String;\n}\n\nstruct Chien;\nstruct Chat;\n\nimpl Animal for Chien {\n    fn bruit(&self) -> String {\n        todo!()\n    }\n}\n\nimpl Animal for Chat {\n    fn bruit(&self) -> String {\n        todo!()\n    }\n}\n\nfn chorale(animaux: &[Box<dyn Animal>]) -> Vec<String> {\n    todo!()\n}",
      solution:
        "trait Animal {\n    fn bruit(&self) -> String;\n}\n\nstruct Chien;\nstruct Chat;\n\nimpl Animal for Chien {\n    fn bruit(&self) -> String {\n        \"Wouf\".to_string()\n    }\n}\n\nimpl Animal for Chat {\n    fn bruit(&self) -> String {\n        \"Miaou\".to_string()\n    }\n}\n\nfn chorale(animaux: &[Box<dyn Animal>]) -> Vec<String> {\n    animaux.iter().map(|a| a.bruit()).collect()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn melange_de_types() {\n        let animaux: Vec<Box<dyn Animal>> = vec![Box::new(Chien), Box::new(Chat), Box::new(Chien)];\n        assert_eq!(chorale(&animaux), vec![\"Wouf\", \"Miaou\", \"Wouf\"]);\n    }\n\n    #[test]\n    fn liste_vide() {\n        let animaux: Vec<Box<dyn Animal>> = vec![];\n        assert_eq!(chorale(&animaux), Vec::<String>::new());\n    }\n\n    #[test]\n    fn un_seul_type() {\n        let animaux: Vec<Box<dyn Animal>> = vec![Box::new(Chat), Box::new(Chat)];\n        assert_eq!(chorale(&animaux), vec![\"Miaou\", \"Miaou\"]);\n    }\n}",
    },
    {
      id: "ch17-ex2",
      title: "Surface totale de formes hétérogènes",
      difficulty: "moyen",
      prompt:
        "Défini un trait `Forme` avec une méthode `aire(&self) -> f64`. Implémente-le pour `Carre { cote: f64 }` et `Triangle { base: f64, hauteur: f64 }` (aire = base * hauteur / 2). Écris `surface_totale(formes: &[Box<dyn Forme>]) -> f64` qui additionne les aires de toutes les formes.",
      hints: [
        "`.iter().map(|f| f.aire()).sum()` calcule directement la somme.",
        "Attention à l'ordre des opérations pour l'aire du triangle.",
      ],
      starter:
        "trait Forme {\n    fn aire(&self) -> f64;\n}\n\nstruct Carre {\n    cote: f64,\n}\n\nstruct Triangle {\n    base: f64,\n    hauteur: f64,\n}\n\nimpl Forme for Carre {\n    fn aire(&self) -> f64 {\n        todo!()\n    }\n}\n\nimpl Forme for Triangle {\n    fn aire(&self) -> f64 {\n        todo!()\n    }\n}\n\nfn surface_totale(formes: &[Box<dyn Forme>]) -> f64 {\n    todo!()\n}",
      solution:
        "trait Forme {\n    fn aire(&self) -> f64;\n}\n\nstruct Carre {\n    cote: f64,\n}\n\nstruct Triangle {\n    base: f64,\n    hauteur: f64,\n}\n\nimpl Forme for Carre {\n    fn aire(&self) -> f64 {\n        self.cote * self.cote\n    }\n}\n\nimpl Forme for Triangle {\n    fn aire(&self) -> f64 {\n        self.base * self.hauteur / 2.0\n    }\n}\n\nfn surface_totale(formes: &[Box<dyn Forme>]) -> f64 {\n    formes.iter().map(|f| f.aire()).sum()\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    fn approx(a: f64, b: f64) -> bool {\n        (a - b).abs() < 1e-9\n    }\n\n    #[test]\n    fn additionne_formes_variees() {\n        let formes: Vec<Box<dyn Forme>> = vec![\n            Box::new(Carre { cote: 2.0 }),      // aire 4.0\n            Box::new(Triangle { base: 4.0, hauteur: 3.0 }), // aire 6.0\n        ];\n        assert!(approx(surface_totale(&formes), 10.0));\n    }\n\n    #[test]\n    fn liste_vide_donne_zero() {\n        let formes: Vec<Box<dyn Forme>> = vec![];\n        assert!(approx(surface_totale(&formes), 0.0));\n    }\n\n    #[test]\n    fn un_seul_carre() {\n        let formes: Vec<Box<dyn Forme>> = vec![Box::new(Carre { cote: 5.0 })];\n        assert!(approx(surface_totale(&formes), 25.0));\n    }\n}",
    },
    {
      id: "ch17-ex3",
      title: "Trait avec méthode par défaut",
      difficulty: "moyen",
      prompt:
        "Défini un trait `Employe` avec une méthode requise `nom(&self) -> String` et une méthode `salaire_annuel(&self) -> f64` (méthode requise). Ajoute une méthode **par défaut** `resume(&self) -> String` qui renvoie `\"<nom> gagne <salaire> par an\"` (utilise `nom()` et `salaire_annuel()`), sans que les implémenteurs aient à la redéfinir. Implémente le trait pour `Developpeur { nom: String, salaire: f64 }` sans redéfinir `resume`, et pour `Manager` en redéfinissant `resume` pour ajouter la mention `\" (management)\"` à la fin.",
      hints: [
        "Une méthode par défaut se définit directement dans le corps du trait, avec un corps de fonction complet.",
        "Un type qui implémente le trait peut choisir de redéfinir une méthode par défaut en la déclarant dans son `impl`.",
      ],
      starter:
        "trait Employe {\n    fn nom(&self) -> String;\n    fn salaire_annuel(&self) -> f64;\n\n    fn resume(&self) -> String {\n        todo!()\n    }\n}\n\nstruct Developpeur {\n    nom: String,\n    salaire: f64,\n}\n\nimpl Employe for Developpeur {\n    fn nom(&self) -> String {\n        self.nom.clone()\n    }\n    fn salaire_annuel(&self) -> f64 {\n        self.salaire\n    }\n}\n\nstruct Manager {\n    nom: String,\n    salaire: f64,\n}\n\nimpl Employe for Manager {\n    fn nom(&self) -> String {\n        self.nom.clone()\n    }\n    fn salaire_annuel(&self) -> f64 {\n        self.salaire\n    }\n    fn resume(&self) -> String {\n        todo!()\n    }\n}",
      solution:
        "trait Employe {\n    fn nom(&self) -> String;\n    fn salaire_annuel(&self) -> f64;\n\n    fn resume(&self) -> String {\n        format!(\"{} gagne {} par an\", self.nom(), self.salaire_annuel())\n    }\n}\n\nstruct Developpeur {\n    nom: String,\n    salaire: f64,\n}\n\nimpl Employe for Developpeur {\n    fn nom(&self) -> String {\n        self.nom.clone()\n    }\n    fn salaire_annuel(&self) -> f64 {\n        self.salaire\n    }\n}\n\nstruct Manager {\n    nom: String,\n    salaire: f64,\n}\n\nimpl Employe for Manager {\n    fn nom(&self) -> String {\n        self.nom.clone()\n    }\n    fn salaire_annuel(&self) -> f64 {\n        self.salaire\n    }\n    fn resume(&self) -> String {\n        format!(\"{} gagne {} par an (management)\", self.nom(), self.salaire_annuel())\n    }\n}",
      tests:
        "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn developpeur_utilise_le_resume_par_defaut() {\n        let d = Developpeur { nom: \"Alice\".to_string(), salaire: 45000.0 };\n        assert_eq!(d.resume(), \"Alice gagne 45000 par an\");\n    }\n\n    #[test]\n    fn manager_redefinit_le_resume() {\n        let m = Manager { nom: \"Bruno\".to_string(), salaire: 60000.0 };\n        assert_eq!(m.resume(), \"Bruno gagne 60000 par an (management)\");\n    }\n\n    #[test]\n    fn dispatch_dynamique_appelle_le_bon_resume() {\n        let employes: Vec<Box<dyn Employe>> = vec![\n            Box::new(Developpeur { nom: \"Chloe\".to_string(), salaire: 40000.0 }),\n            Box::new(Manager { nom: \"David\".to_string(), salaire: 70000.0 }),\n        ];\n        let resumes: Vec<String> = employes.iter().map(|e| e.resume()).collect();\n        assert_eq!(resumes[0], \"Chloe gagne 40000 par an\");\n        assert_eq!(resumes[1], \"David gagne 70000 par an (management)\");\n    }\n}",
    },
  ],
  project: {
    id: "ch17-projet",
    title: "Machine à états : Publication",
    difficulty: "difficile",
    prompt:
      "Implémente une struct `Publication` représentant un article qui traverse trois états : `Brouillon`, `EnRevue`, `Publie`, modélisés par un enum `EtatPublication`. La `Publication` possède un texte et un état courant. Fournis les méthodes : `nouvelle(texte: &str) -> Publication` (démarre en `Brouillon`), `demander_revue(&mut self)` (Brouillon -> EnRevue, ne fait rien sinon), `approuver(&mut self)` (EnRevue -> Publie, ne fait rien sinon), `rejeter(&mut self)` (EnRevue -> Brouillon, ne fait rien sinon) et `contenu(&self) -> &str` qui renvoie le texte **uniquement** si l'état est `Publie`, sinon une chaîne vide `\"\"`. Le but : construire une machine à états sûre à la compilation, où chaque transition est un simple `match`, et vérifier son comportement par des tests couvrant toutes les transitions et cas limites.",
    hints: [
      "Un enum à 3 variantes suffit ; pas besoin de traits ni de `Box<dyn Etat>` pour ce projet.",
      "Utilise un `match self.etat { ... }` dans chaque méthode de transition, avec une branche `_ => {}` pour les transitions invalides qui ne changent rien.",
      "`contenu` doit faire un `match` sur l'état et renvoyer soit `&self.texte`, soit `\"\"`.",
    ],
    starter:
      "#[derive(Debug, PartialEq, Clone, Copy)]\nenum EtatPublication {\n    Brouillon,\n    EnRevue,\n    Publie,\n}\n\npub struct Publication {\n    etat: EtatPublication,\n    texte: String,\n}\n\nimpl Publication {\n    pub fn nouvelle(texte: &str) -> Publication {\n        todo!()\n    }\n\n    pub fn demander_revue(&mut self) {\n        todo!()\n    }\n\n    pub fn approuver(&mut self) {\n        todo!()\n    }\n\n    pub fn rejeter(&mut self) {\n        todo!()\n    }\n\n    pub fn contenu(&self) -> &str {\n        todo!()\n    }\n}",
    solution:
      "#[derive(Debug, PartialEq, Clone, Copy)]\nenum EtatPublication {\n    Brouillon,\n    EnRevue,\n    Publie,\n}\n\npub struct Publication {\n    etat: EtatPublication,\n    texte: String,\n}\n\nimpl Publication {\n    pub fn nouvelle(texte: &str) -> Publication {\n        Publication {\n            etat: EtatPublication::Brouillon,\n            texte: texte.to_string(),\n        }\n    }\n\n    pub fn demander_revue(&mut self) {\n        self.etat = match self.etat {\n            EtatPublication::Brouillon => EtatPublication::EnRevue,\n            autre => autre, // transition invalide : rien ne change\n        };\n    }\n\n    pub fn approuver(&mut self) {\n        self.etat = match self.etat {\n            EtatPublication::EnRevue => EtatPublication::Publie,\n            autre => autre,\n        };\n    }\n\n    pub fn rejeter(&mut self) {\n        self.etat = match self.etat {\n            EtatPublication::EnRevue => EtatPublication::Brouillon,\n            autre => autre,\n        };\n    }\n\n    pub fn contenu(&self) -> &str {\n        match self.etat {\n            EtatPublication::Publie => &self.texte,\n            _ => \"\",\n        }\n    }\n}",
    tests:
      "#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn brouillon_ne_montre_pas_le_contenu() {\n        let article = Publication::nouvelle(\"Salut le monde\");\n        assert_eq!(article.contenu(), \"\");\n    }\n\n    #[test]\n    fn en_revue_ne_montre_toujours_pas_le_contenu() {\n        let mut article = Publication::nouvelle(\"Salut le monde\");\n        article.demander_revue();\n        assert_eq!(article.etat, EtatPublication::EnRevue);\n        assert_eq!(article.contenu(), \"\");\n    }\n\n    #[test]\n    fn publie_montre_le_contenu() {\n        let mut article = Publication::nouvelle(\"Salut le monde\");\n        article.demander_revue();\n        article.approuver();\n        assert_eq!(article.etat, EtatPublication::Publie);\n        assert_eq!(article.contenu(), \"Salut le monde\");\n    }\n\n    #[test]\n    fn approuver_sans_revue_ne_fait_rien() {\n        let mut article = Publication::nouvelle(\"Texte\");\n        article.approuver(); // toujours en Brouillon, transition invalide\n        assert_eq!(article.etat, EtatPublication::Brouillon);\n        assert_eq!(article.contenu(), \"\");\n    }\n\n    #[test]\n    fn rejeter_renvoie_en_brouillon() {\n        let mut article = Publication::nouvelle(\"Texte\");\n        article.demander_revue();\n        article.rejeter();\n        assert_eq!(article.etat, EtatPublication::Brouillon);\n        assert_eq!(article.contenu(), \"\");\n    }\n\n    #[test]\n    fn rejeter_apres_publication_ne_fait_rien() {\n        let mut article = Publication::nouvelle(\"Texte\");\n        article.demander_revue();\n        article.approuver();\n        article.rejeter(); // rejeter un article déjà publié : pas de transition définie\n        assert_eq!(article.etat, EtatPublication::Publie);\n        assert_eq!(article.contenu(), \"Texte\");\n    }\n\n    #[test]\n    fn double_demande_de_revue_est_sans_effet() {\n        let mut article = Publication::nouvelle(\"Texte\");\n        article.demander_revue();\n        article.demander_revue(); // déjà en revue\n        assert_eq!(article.etat, EtatPublication::EnRevue);\n    }\n}",
  },
  keyTakeaways: [
    "Rust encapsule via `pub`, mais n'a pas d'héritage : la composition et les traits remplacent l'héritage de classes.",
    "`Box<dyn Trait>` crée un objet-trait : il permet de stocker des types différents dans une même collection au prix d'une indirection (dispatch dynamique).",
    "Les génériques (`<T: Trait>`) offrent un dispatch statique, sans coût à l'exécution, mais sans collection hétérogène.",
    "Choisis un enum + `match` quand les variantes sont fermées et connues à l'avance ; choisis `dyn Trait` quand des types externes doivent pouvoir s'ajouter sans recompiler.",
    "Le patron d'état peut s'implémenter avec des objets-traits (chaque état gère ses transitions) ou, plus idiomatiquement en Rust, avec un simple enum et un `match` exhaustif.",
  ],
};
