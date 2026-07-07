import type { Chapter } from "../../types";

export const g07: Chapter = {
  number: 7,
  slug: "structs-methodes",
  title: "Structs et methodes",
  subtitle:
    "Definir des types structures, leur associer des methodes et composer par embedding.",
  description:
    "Les structs sont le mecanisme principal de Go pour regrouper des donnees. Contrairement aux langages orientes objet classiques, Go n'a ni classes ni heritage. A la place, on definit des structs, on leur associe des methodes via un **receiver**, et on compose des types en **embarquant** une struct dans une autre. Ce chapitre couvre la declaration de structs, les methodes a receiver valeur et pointeur, le pattern constructeur `NewXxx`, et la composition par embedding.",
  minutes: 35,
  rustBookRef: "Go Tour -- Structs",
  objectives: [
    "Definir un type struct avec des champs types",
    "Associer des methodes a un type via un receiver valeur ou pointeur",
    "Appliquer le pattern constructeur NewXxx",
    "Composer des types par embedding de structs",
    "Comprendre les champs et methodes promus",
  ],
  sections: [
    {
      id: "definir-struct",
      number: "7.1",
      title: "Definir une struct",
      blocks: [
        {
          type: "paragraph",
          text: "Une **struct** est un type compose qui regroupe des champs nommes et types. On la declare avec le mot-cle `type`. Chaque champ a une valeur zero par defaut (0 pour int, \"\" pour string, nil pour les pointeurs, etc.).",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Definir un type struct
type Personne struct {
    Nom    string
    Age    int
    Email  string
}

func main() {
    // Initialisation avec les noms de champs
    alice := Personne{
        Nom:   "Alice",
        Age:   30,
        Email: "alice@example.com",
    }

    // Initialisation positionnelle (deconseille si beaucoup de champs)
    bob := Personne{"Bob", 25, "bob@example.com"}

    // Valeur zero : tous les champs a leur zero
    var vide Personne
    fmt.Println(vide.Nom)   // "" (chaine vide)
    fmt.Println(vide.Age)   // 0

    fmt.Println(alice)       // {Alice 30 alice@example.com}
    fmt.Println(bob.Nom)     // Bob
}`,
          caption: "Declaration, initialisation et valeur zero d'une struct.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Prefere toujours l'initialisation avec les **noms de champs** (`Nom: \"Alice\"`). Elle est plus lisible et ne casse pas si on ajoute un champ a la struct plus tard.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Structs comparables",
          text: "Deux structs sont comparables avec `==` si **tous leurs champs** sont comparables. Les structs contenant des slices ou des maps ne sont pas comparables.",
        },
      ],
    },
    {
      id: "methodes",
      number: "7.2",
      title: "Methodes",
      blocks: [
        {
          type: "paragraph",
          text: "Une **methode** est une fonction associee a un type via un **receiver** (recepteur). Le receiver se declare entre `func` et le nom de la methode. Il peut etre un receiver **valeur** (copie) ou un receiver **pointeur** (reference a l'original).",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

type Rectangle struct {
    Largeur float64
    Hauteur float64
}

// Methode avec receiver valeur : ne modifie pas le rectangle original
func (r Rectangle) Aire() float64 {
    return r.Largeur * r.Hauteur
}

// Methode avec receiver valeur : lecture seule
func (r Rectangle) Perimetre() float64 {
    return 2 * (r.Largeur + r.Hauteur)
}

// Methode avec receiver pointeur : modifie le rectangle original
func (r *Rectangle) Agrandir(facteur float64) {
    r.Largeur *= facteur
    r.Hauteur *= facteur
}

func main() {
    rect := Rectangle{Largeur: 5, Hauteur: 3}

    fmt.Println("Aire :", rect.Aire())           // 15
    fmt.Println("Perimetre :", rect.Perimetre())  // 16

    rect.Agrandir(2)
    fmt.Println("Apres agrandissement :", rect)   // {10 6}
    fmt.Println("Nouvelle aire :", rect.Aire())   // 60
}`,
          caption: "Receiver valeur pour la lecture, receiver pointeur pour la modification.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Receiver valeur vs pointeur",
          text: "Utilise un **receiver pointeur** (`*T`) si la methode doit **modifier** la struct ou si la struct est **volumineuse** (evite une copie). Utilise un receiver **valeur** (`T`) si la methode est en lecture seule sur un petit type. En cas de doute, utilise un pointeur.",
        },
        {
          type: "usecase",
          title: "Coherence des receivers",
          text: "Si au moins une methode d'un type utilise un receiver pointeur, mets-les **toutes** en receiver pointeur par coherence. Cela evite la confusion et garantit que l'appel se comporte de la meme facon pour toutes les methodes.",
        },
      ],
    },
    {
      id: "constructeurs",
      number: "7.3",
      title: "Constructeurs par convention",
      blocks: [
        {
          type: "paragraph",
          text: "Go n'a pas de constructeur integre au langage. Par convention, on cree une fonction `NewXxx` qui retourne un pointeur vers la struct initialisee. C'est le pattern standard pour valider les parametres et fournir des valeurs par defaut.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "errors"
)

type Serveur struct {
    Hote string
    Port int
}

// NewServeur est le constructeur conventionnel
func NewServeur(hote string, port int) (*Serveur, error) {
    if hote == "" {
        return nil, errors.New("l'hote ne peut pas etre vide")
    }
    if port <= 0 || port > 65535 {
        return nil, errors.New("port invalide")
    }
    return &Serveur{
        Hote: hote,
        Port: port,
    }, nil
}

func main() {
    srv, err := NewServeur("localhost", 8080)
    if err != nil {
        fmt.Println("Erreur :", err)
        return
    }
    fmt.Printf("Serveur : %s:%d\\n", srv.Hote, srv.Port)
    // Serveur : localhost:8080
}`,
          caption: "Le pattern NewXxx retourne (*T, error) pour un constructeur robuste.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Si le constructeur ne peut pas echouer, il peut retourner juste `*T` sans erreur. Mais des qu'il y a de la validation, retourne `(*T, error)` -- c'est idiomatique en Go.",
        },
      ],
    },
    {
      id: "composition-embedding",
      number: "7.4",
      title: "Composition (embedding)",
      blocks: [
        {
          type: "paragraph",
          text: "Go n'a pas d'heritage. A la place, on utilise la **composition** en embarquant (embedding) une struct dans une autre. Les champs et methodes de la struct embarquee sont **promus** : on y accede directement sur la struct englobante.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

type Adresse struct {
    Rue   string
    Ville string
}

func (a Adresse) Complete() string {
    return a.Rue + ", " + a.Ville
}

type Employe struct {
    Nom string
    Adresse       // embedding : pas de nom de champ, juste le type
}

func main() {
    emp := Employe{
        Nom: "Alice",
        Adresse: Adresse{
            Rue:   "10 rue de Go",
            Ville: "Paris",
        },
    }

    // Champs promus : on accede directement
    fmt.Println(emp.Rue)          // 10 rue de Go
    fmt.Println(emp.Ville)        // Paris

    // Methode promue
    fmt.Println(emp.Complete())   // 10 rue de Go, Paris

    // On peut toujours acceder via le type embarque
    fmt.Println(emp.Adresse.Ville) // Paris
}`,
          caption: "L'embedding promeut les champs et methodes de la struct embarquee.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Ce n'est pas de l'heritage",
          text: "L'embedding est de la **composition**, pas de l'heritage. Un `Employe` n'est **pas** une `Adresse`. Il **contient** une Adresse. La struct englobante peut redefinir un champ ou une methode du meme nom pour le masquer (shadowing).",
        },
        {
          type: "code",
          language: "go",
          code: `type Base struct{}

func (b Base) Saluer() string {
    return "Bonjour depuis Base"
}

type Derive struct {
    Base
}

// Redefinit (masque) la methode de Base
func (d Derive) Saluer() string {
    return "Bonjour depuis Derive"
}`,
          caption: "Le type englobant peut masquer une methode du type embarque.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g7-ex1",
      title: "Creer une struct",
      difficulty: "facile",
      language: "go",
      prompt:
        "Definis un type `Livre` avec les champs `Titre string`, `Auteur string` et `Pages int`. Cree un livre `{\"Le Petit Prince\", \"Saint-Exupery\", 96}` et affiche ses champs un par un avec `fmt.Println`.",
      hints: [
        "Utilise `type Livre struct { ... }`.",
        "Accede aux champs avec `livre.Titre`, `livre.Auteur`, `livre.Pages`.",
      ],
      starter: `package main

import "fmt"

// Definis le type Livre

func main() {
    // Cree un Livre et affiche ses champs
}`,
      solution: `package main

import "fmt"

type Livre struct {
    Titre  string
    Auteur string
    Pages  int
}

func main() {
    livre := Livre{
        Titre:  "Le Petit Prince",
        Auteur: "Saint-Exupery",
        Pages:  96,
    }

    fmt.Println("Titre :", livre.Titre)
    fmt.Println("Auteur :", livre.Auteur)
    fmt.Println("Pages :", livre.Pages)
}`,
      checks: [
        { label: "Definit le type Livre struct", pattern: "type\\s+Livre\\s+struct" },
        { label: "Champ Titre string", pattern: "Titre\\s+string" },
        { label: "Champ Auteur string", pattern: "Auteur\\s+string" },
        { label: "Champ Pages int", pattern: "Pages\\s+int" },
        { label: "Cree un Livre avec les bonnes valeurs", pattern: "Le Petit Prince" },
      ],
    },
    {
      id: "g7-ex2",
      title: "Ajouter une methode",
      difficulty: "facile",
      language: "go",
      prompt:
        "Definis un type `Cercle` avec un champ `Rayon float64`. Ajoute une methode `Aire() float64` qui retourne l'aire du cercle (`3.14 * r * r`). Cree un cercle de rayon 5 et affiche son aire.",
      hints: [
        "Une methode se declare avec un receiver : `func (c Cercle) Aire() float64`.",
        "L'aire d'un cercle est pi * r^2. Utilise `3.14` ou `math.Pi`.",
      ],
      starter: `package main

import "fmt"

type Cercle struct {
    Rayon float64
}

// Ajoute la methode Aire

func main() {
    c := Cercle{Rayon: 5}
    fmt.Println("Aire :", c.Aire())
}`,
      solution: `package main

import "fmt"

type Cercle struct {
    Rayon float64
}

// Aire retourne l'aire du cercle
func (c Cercle) Aire() float64 {
    return 3.14 * c.Rayon * c.Rayon
}

func main() {
    c := Cercle{Rayon: 5}
    fmt.Println("Aire :", c.Aire()) // 78.5
}`,
      checks: [
        { label: "Definit le type Cercle", pattern: "type\\s+Cercle\\s+struct" },
        { label: "Methode Aire avec receiver Cercle", pattern: "func\\s+\\(\\w+\\s+\\*?Cercle\\)\\s+Aire\\(\\)" },
        { label: "Calcule avec le rayon", pattern: "Rayon\\s*\\*\\s*\\w+\\.?\\w*\\.?Rayon|Rayon.*Rayon" },
        { label: "Appelle c.Aire()", pattern: "c\\.Aire\\(\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "math"
    "os"
)

// __USER_CODE__

func approxEqual(a, b, tolerance float64) bool {
    return math.Abs(a-b) < tolerance
}

func main() {
    echecs := 0

    // Test 1 : Cercle rayon 5 -> aire ~78.5
    c1 := Cercle{Rayon: 5}
    got1 := c1.Aire()
    if !approxEqual(got1, 78.5, 1.0) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{5}.Aire() = %f, attendu ~78.5\\n", got1)
        echecs++
    } else {
        fmt.Printf("OK: Cercle{5}.Aire() = %.2f\\n", got1)
    }

    // Test 2 : Cercle rayon 1 -> aire ~3.14
    c2 := Cercle{Rayon: 1}
    got2 := c2.Aire()
    if !approxEqual(got2, 3.14, 0.1) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{1}.Aire() = %f, attendu ~3.14\\n", got2)
        echecs++
    } else {
        fmt.Printf("OK: Cercle{1}.Aire() = %.2f\\n", got2)
    }

    // Test 3 : Cercle rayon 0 -> aire 0
    c3 := Cercle{Rayon: 0}
    got3 := c3.Aire()
    if got3 != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{0}.Aire() = %f, attendu 0\\n", got3)
        echecs++
    } else {
        fmt.Printf("OK: Cercle{0}.Aire() = %.2f\\n", got3)
    }

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
    },
    {
      id: "g7-ex3",
      title: "Receiver pointeur",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Definis un type `Compteur` avec un champ `N int`. Ajoute une methode `Incrementer()` avec un **receiver pointeur** qui augmente `N` de 1. Dans `main`, cree un compteur, appelle `Incrementer()` trois fois et affiche la valeur de `N`.",
      hints: [
        "Un receiver pointeur se declare `func (c *Compteur) Incrementer()`.",
        "Go appelle automatiquement la methode avec l'adresse si besoin.",
      ],
      starter: `package main

import "fmt"

type Compteur struct {
    N int
}

// Ajoute la methode Incrementer avec receiver pointeur

func main() {
    cpt := Compteur{}

    cpt.Incrementer()
    cpt.Incrementer()
    cpt.Incrementer()

    fmt.Println("N =", cpt.N) // doit afficher 3
}`,
      solution: `package main

import "fmt"

type Compteur struct {
    N int
}

// Incrementer ajoute 1 a N (receiver pointeur pour modifier l'original)
func (c *Compteur) Incrementer() {
    c.N++
}

func main() {
    cpt := Compteur{}

    cpt.Incrementer()
    cpt.Incrementer()
    cpt.Incrementer()

    fmt.Println("N =", cpt.N) // N = 3
}`,
      checks: [
        { label: "Definit le type Compteur struct", pattern: "type\\s+Compteur\\s+struct" },
        { label: "Methode avec receiver pointeur *Compteur", pattern: "func\\s+\\(\\w+\\s+\\*Compteur\\)" },
        { label: "Incremente c.N", pattern: "c\\.N\\s*\\+\\+|c\\.N\\s*\\+=\\s*1" },
        { label: "Appelle Incrementer trois fois", pattern: "Incrementer\\(\\)[\\s\\S]*Incrementer\\(\\)[\\s\\S]*Incrementer\\(\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : Incrementer 3 fois -> N = 3
    cpt1 := Compteur{}
    cpt1.Incrementer()
    cpt1.Incrementer()
    cpt1.Incrementer()
    if cpt1.N != 3 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: 3x Incrementer() => N=%d, attendu 3\\n", cpt1.N)
        echecs++
    } else {
        fmt.Println("OK: 3x Incrementer() => N =", cpt1.N)
    }

    // Test 2 : Incrementer 1 fois -> N = 1
    cpt2 := Compteur{}
    cpt2.Incrementer()
    if cpt2.N != 1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: 1x Incrementer() => N=%d, attendu 1\\n", cpt2.N)
        echecs++
    } else {
        fmt.Println("OK: 1x Incrementer() => N =", cpt2.N)
    }

    // Test 3 : Valeur initiale = 0
    cpt3 := Compteur{}
    if cpt3.N != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Compteur{} => N=%d, attendu 0\\n", cpt3.N)
        echecs++
    } else {
        fmt.Println("OK: Compteur{} => N =", cpt3.N)
    }

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
    },
    {
      id: "g7-ex4",
      title: "Pattern constructeur NewXxx",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Definis un type `Joueur` avec les champs `Pseudo string` et `Score int`. Ecris un constructeur `NewJoueur(pseudo string) *Joueur` qui retourne un pointeur vers un Joueur avec le pseudo donne et un score initial de 0. Cree deux joueurs et affiche-les.",
      hints: [
        "Le constructeur retourne `&Joueur{...}`.",
        "Le score initial est 0 (valeur zero, ou explicite).",
      ],
      starter: `package main

import "fmt"

type Joueur struct {
    Pseudo string
    Score  int
}

// Constructeur NewJoueur

func main() {
    j1 := NewJoueur("Alice")
    j2 := NewJoueur("Bob")

    fmt.Println(j1)
    fmt.Println(j2)
}`,
      solution: `package main

import "fmt"

type Joueur struct {
    Pseudo string
    Score  int
}

// NewJoueur cree un nouveau joueur avec un score initial de 0
func NewJoueur(pseudo string) *Joueur {
    return &Joueur{
        Pseudo: pseudo,
        Score:  0,
    }
}

func main() {
    j1 := NewJoueur("Alice")
    j2 := NewJoueur("Bob")

    fmt.Println(j1) // &{Alice 0}
    fmt.Println(j2) // &{Bob 0}
}`,
      checks: [
        { label: "Definit le type Joueur struct", pattern: "type\\s+Joueur\\s+struct" },
        { label: "Fonction NewJoueur retournant *Joueur", pattern: "func\\s+NewJoueur\\(.*\\)\\s*\\*Joueur" },
        { label: "Retourne &Joueur{...}", pattern: "return\\s+&Joueur" },
        { label: "Appelle NewJoueur", pattern: "NewJoueur\\(" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : NewJoueur("Alice")
    j1 := NewJoueur("Alice")
    if j1 == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: NewJoueur(\"Alice\") retourne nil\\n")
        echecs++
    } else if j1.Pseudo != "Alice" || j1.Score != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: NewJoueur(\"Alice\") = {%q, %d}, attendu {\"Alice\", 0}\\n", j1.Pseudo, j1.Score)
        echecs++
    } else {
        fmt.Printf("OK: NewJoueur(\"Alice\") = {%q, %d}\\n", j1.Pseudo, j1.Score)
    }

    // Test 2 : NewJoueur("Bob")
    j2 := NewJoueur("Bob")
    if j2 == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: NewJoueur(\"Bob\") retourne nil\\n")
        echecs++
    } else if j2.Pseudo != "Bob" || j2.Score != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: NewJoueur(\"Bob\") = {%q, %d}, attendu {\"Bob\", 0}\\n", j2.Pseudo, j2.Score)
        echecs++
    } else {
        fmt.Printf("OK: NewJoueur(\"Bob\") = {%q, %d}\\n", j2.Pseudo, j2.Score)
    }

    // Test 3 : les deux pointeurs sont distincts
    if j1 == j2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: NewJoueur retourne le même pointeur pour deux appels\\n")
        echecs++
    } else {
        fmt.Println("OK: les deux joueurs ont des adresses distinctes")
    }

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
    },
    {
      id: "g7-ex5",
      title: "Composition par embedding",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Definis un type `Animal` avec un champ `Nom string` et une methode `Parler() string` qui retourne `\"...\"`. Definis un type `Chien` qui embarque `Animal` et redefinit `Parler()` pour retourner `\"Woof!\"`. Dans `main`, cree un `Chien{Animal{\"Rex\"}}` et affiche son `Nom` (champ promu) et le resultat de `Parler()`.",
      hints: [
        "Embedding : mets juste `Animal` comme champ sans nom dans Chien.",
        "Pour redefinir, declare une methode `Parler()` sur Chien.",
        "Le champ `Nom` est promu : `chien.Nom` fonctionne directement.",
      ],
      starter: `package main

import "fmt"

type Animal struct {
    Nom string
}

// Methode Parler sur Animal

type Chien struct {
    // Embedding ici
}

// Methode Parler sur Chien (redefinition)

func main() {
    rex := Chien{Animal{"Rex"}}
    fmt.Println(rex.Nom)
    fmt.Println(rex.Parler())
}`,
      solution: `package main

import "fmt"

type Animal struct {
    Nom string
}

// Parler retourne un son generique
func (a Animal) Parler() string {
    return "..."
}

type Chien struct {
    Animal // embedding
}

// Parler redefinit le comportement pour Chien
func (c Chien) Parler() string {
    return "Woof!"
}

func main() {
    rex := Chien{Animal{"Rex"}}
    fmt.Println(rex.Nom)      // Rex (champ promu)
    fmt.Println(rex.Parler()) // Woof! (methode redéfinie)
}`,
      checks: [
        { label: "Definit le type Animal struct", pattern: "type\\s+Animal\\s+struct" },
        { label: "Definit le type Chien struct", pattern: "type\\s+Chien\\s+struct" },
        { label: "Chien embarque Animal", pattern: "struct\\s*\\{[^}]*Animal[^}]*\\}" },
        { label: "Methode Parler sur Animal", pattern: "func\\s+\\(\\w+\\s+\\*?Animal\\)\\s+Parler\\(\\)" },
        { label: "Methode Parler sur Chien", pattern: "func\\s+\\(\\w+\\s+\\*?Chien\\)\\s+Parler\\(\\)" },
        { label: "Retourne Woof!", pattern: "Woof!" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : Animal.Parler() retourne "..."
    a := Animal{Nom: "Generique"}
    if got := a.Parler(); got != "..." {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Animal{\"Generique\"}.Parler() = %q, attendu %q\\n", got, "...")
        echecs++
    } else {
        fmt.Println("OK: Animal.Parler() =", got)
    }

    // Test 2 : Chien.Parler() retourne "Woof!"
    rex := Chien{Animal{"Rex"}}
    if got := rex.Parler(); got != "Woof!" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Chien{\"Rex\"}.Parler() = %q, attendu %q\\n", got, "Woof!")
        echecs++
    } else {
        fmt.Println("OK: Chien.Parler() =", got)
    }

    // Test 3 : Champ promu Nom accessible sur Chien
    if rex.Nom != "Rex" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Chien.Nom = %q, attendu %q\\n", rex.Nom, "Rex")
        echecs++
    } else {
        fmt.Println("OK: Chien.Nom = Rex (champ promu)")
    }

    // Test 4 : Animal.Parler() original accessible via embedding
    if got := rex.Animal.Parler(); got != "..." {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Chien.Animal.Parler() = %q, attendu %q\\n", got, "...")
        echecs++
    } else {
        fmt.Println("OK: Chien.Animal.Parler() = ... (methode originale)")
    }

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
    },
  ],
  project: {
    id: "g7-projet",
    title: "Systeme de personnages",
    difficulty: "difficile",
    language: "go",
    prompt:
      "Cree un systeme de personnages de jeu. (1) Definis un type `Personnage` avec les champs `Nom string`, `PV int` (points de vie) et `Attaque int`. Ajoute une methode `EstVivant() bool` qui retourne `true` si `PV > 0` et une methode `String() string` qui retourne `\"Nom (PV pv)\"` avec `fmt.Sprintf`. (2) Definis un type `Guerrier` qui embarque `Personnage` et ajoute un champ `Armure int`. Ajoute une methode `CoupEpee() int` qui retourne `Attaque * 2`. (3) Definis un type `Mage` qui embarque `Personnage` et ajoute un champ `Mana int`. Ajoute une methode `Boule­DeFeu() int` qui retourne `Attaque * 3` si `Mana >= 10` (et decremente Mana de 10), sinon retourne 0. (4) Dans `main`, cree un Guerrier et un Mage, affiche-les, et affiche le resultat de leurs attaques.",
    hints: [
      "Utilise `fmt.Sprintf(\"%s (%d pv)\", p.Nom, p.PV)` pour String().",
      "L'embedding promeut les champs : `guerrier.Nom` fonctionne.",
      "Pour BouleDeFeu, le receiver doit etre un pointeur pour modifier Mana.",
    ],
    starter: `package main

import "fmt"

// Personnage de base

// Guerrier embarque Personnage + Armure

// Mage embarque Personnage + Mana

func main() {
    // Cree un Guerrier et un Mage
    // Affiche-les et teste leurs attaques
    _ = fmt.Sprintf // supprime l'erreur d'import inutilise
}`,
    solution: `package main

import "fmt"

type Personnage struct {
    Nom     string
    PV      int
    Attaque int
}

func (p Personnage) EstVivant() bool {
    return p.PV > 0
}

func (p Personnage) String() string {
    return fmt.Sprintf("%s (%d pv)", p.Nom, p.PV)
}

type Guerrier struct {
    Personnage
    Armure int
}

func (g Guerrier) CoupEpee() int {
    return g.Attaque * 2
}

type Mage struct {
    Personnage
    Mana int
}

func (m *Mage) BouleDeFeu() int {
    if m.Mana >= 10 {
        m.Mana -= 10
        return m.Attaque * 3
    }
    return 0
}

func main() {
    guerrier := Guerrier{
        Personnage: Personnage{Nom: "Thorin", PV: 100, Attaque: 15},
        Armure:     20,
    }

    mage := Mage{
        Personnage: Personnage{Nom: "Gandalf", PV: 70, Attaque: 25},
        Mana:       30,
    }

    fmt.Println(guerrier.String())    // Thorin (100 pv)
    fmt.Println("Coup d'epee :", guerrier.CoupEpee()) // 30

    fmt.Println(mage.String())        // Gandalf (70 pv)
    fmt.Println("Boule de feu :", mage.BouleDeFeu())  // 75
    fmt.Println("Mana restant :", mage.Mana)           // 20
}`,
    checks: [
      { label: "Definit le type Personnage struct", pattern: "type\\s+Personnage\\s+struct" },
      { label: "Champs Nom, PV, Attaque", pattern: "Nom\\s+string[\\s\\S]*PV\\s+int[\\s\\S]*Attaque\\s+int" },
      { label: "Methode EstVivant sur Personnage", pattern: "func\\s+\\(\\w+\\s+\\*?Personnage\\)\\s+EstVivant\\(\\)" },
      { label: "Methode String sur Personnage", pattern: "func\\s+\\(\\w+\\s+\\*?Personnage\\)\\s+String\\(\\)" },
      { label: "Type Guerrier avec embedding Personnage", pattern: "type\\s+Guerrier\\s+struct[\\s\\S]*?Personnage" },
      { label: "Champ Armure sur Guerrier", pattern: "Armure\\s+int" },
      { label: "Methode CoupEpee sur Guerrier", pattern: "func\\s+\\(\\w+\\s+\\*?Guerrier\\)\\s+CoupEpee\\(\\)" },
      { label: "Type Mage avec embedding Personnage", pattern: "type\\s+Mage\\s+struct[\\s\\S]*?Personnage" },
      { label: "Champ Mana sur Mage", pattern: "Mana\\s+int" },
      { label: "Methode BouleDeFeu sur Mage", pattern: "func\\s+\\(\\w+\\s+\\*?Mage\\)\\s+BouleDeFeu\\(\\)" },
      { label: "Verifie Mana >= 10 dans BouleDeFeu", pattern: "Mana\\s*>=\\s*10" },
    ],
    tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : EstVivant avec PV > 0
    p1 := Personnage{Nom: "Test", PV: 50, Attaque: 10}
    if !p1.EstVivant() {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Personnage{PV:50}.EstVivant() = false, attendu true\\n")
        echecs++
    } else {
        fmt.Println("OK: Personnage{PV:50}.EstVivant() = true")
    }

    // Test 2 : EstVivant avec PV = 0
    p2 := Personnage{Nom: "Mort", PV: 0, Attaque: 5}
    if p2.EstVivant() {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Personnage{PV:0}.EstVivant() = true, attendu false\\n")
        echecs++
    } else {
        fmt.Println("OK: Personnage{PV:0}.EstVivant() = false")
    }

    // Test 3 : String()
    p3 := Personnage{Nom: "Thorin", PV: 100, Attaque: 15}
    if got := p3.String(); got != "Thorin (100 pv)" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Personnage{Thorin,100}.String() = %q, attendu %q\\n", got, "Thorin (100 pv)")
        echecs++
    } else {
        fmt.Println("OK: String() =", got)
    }

    // Test 4 : Guerrier.CoupEpee = Attaque * 2
    g := Guerrier{
        Personnage: Personnage{Nom: "Thorin", PV: 100, Attaque: 15},
        Armure:     20,
    }
    if got := g.CoupEpee(); got != 30 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Guerrier{Attaque:15}.CoupEpee() = %d, attendu 30\\n", got)
        echecs++
    } else {
        fmt.Println("OK: CoupEpee() =", got)
    }

    // Test 5 : Mage.BouleDeFeu avec assez de mana
    m := Mage{
        Personnage: Personnage{Nom: "Gandalf", PV: 70, Attaque: 25},
        Mana:       30,
    }
    if got := m.BouleDeFeu(); got != 75 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Mage{Attaque:25,Mana:30}.BouleDeFeu() = %d, attendu 75\\n", got)
        echecs++
    } else {
        fmt.Println("OK: BouleDeFeu() =", got)
    }
    if m.Mana != 20 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Mana après BouleDeFeu = %d, attendu 20\\n", m.Mana)
        echecs++
    } else {
        fmt.Println("OK: Mana après BouleDeFeu =", m.Mana)
    }

    // Test 6 : Mage.BouleDeFeu sans assez de mana
    m2 := Mage{
        Personnage: Personnage{Nom: "Faible", PV: 50, Attaque: 20},
        Mana:       5,
    }
    if got := m2.BouleDeFeu(); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Mage{Mana:5}.BouleDeFeu() = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: BouleDeFeu() avec Mana insuffisant =", got)
    }
    if m2.Mana != 5 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Mana inchangé = %d, attendu 5\\n", m2.Mana)
        echecs++
    } else {
        fmt.Println("OK: Mana inchangé =", m2.Mana)
    }

    // Test 7 : Champ promu Nom sur Guerrier
    if g.Nom != "Thorin" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Guerrier.Nom = %q, attendu \"Thorin\"\\n", g.Nom)
        echecs++
    } else {
        fmt.Println("OK: Guerrier.Nom = Thorin (champ promu)")
    }

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
  },
  keyTakeaways: [
    "Une struct regroupe des champs types. Sa valeur zero initialise chaque champ a sa propre valeur zero.",
    "Une methode est une fonction avec un receiver. Receiver valeur pour la lecture, receiver pointeur pour la modification.",
    "Le pattern `NewXxx` est la convention Go pour les constructeurs : une fonction qui retourne `*T` (ou `(*T, error)`).",
    "L'embedding compose des types : les champs et methodes de la struct embarquee sont promus sur la struct englobante.",
    "Go n'a pas d'heritage. On compose par embedding et on definit des comportements avec des interfaces (chapitre suivant).",
  ],
};
