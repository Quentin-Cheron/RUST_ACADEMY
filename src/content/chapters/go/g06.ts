import type { Chapter } from "../../types";

export const g06: Chapter = {
  number: 6,
  slug: "pointeurs",
  title: "Pointeurs",
  subtitle:
    "Comprendre les pointeurs, passer des references aux fonctions et eviter les copies inutiles.",
  description:
    "En Go, tout est passe par valeur. Pour modifier une variable depuis une fonction ou eviter de copier une grosse structure, on utilise un **pointeur** : une adresse memoire vers la valeur originale. Ce chapitre explique comment obtenir l'adresse d'une variable avec `&`, lire la valeur pointee avec `*`, passer des pointeurs aux fonctions, et utiliser `new()`. Les pointeurs sont la cle pour ecrire du code performant et modulaire en Go.",
  minutes: 30,
  rustBookRef: "Go Tour -- Pointeurs",
  objectives: [
    "Obtenir l'adresse d'une variable avec & et la dereferencer avec *",
    "Comprendre la valeur zero d'un pointeur (nil)",
    "Passer un pointeur a une fonction pour modifier la valeur originale",
    "Utiliser new() pour allouer et obtenir un pointeur",
    "Acceder aux champs d'une struct via un pointeur (raccourci p.Field)",
  ],
  sections: [
    {
      id: "quest-ce-quun-pointeur",
      number: "6.1",
      title: "Qu'est-ce qu'un pointeur ?",
      blocks: [
        {
          type: "paragraph",
          text: "Un **pointeur** est une variable qui contient l'**adresse memoire** d'une autre variable. En Go, le type pointeur vers un `int` s'ecrit `*int`. On obtient l'adresse d'une variable avec l'operateur `&` et on lit la valeur pointee avec l'operateur `*` (dereferencement).",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    x := 42

    // & donne l'adresse de x
    p := &x              // p est de type *int
    fmt.Println(p)       // ex: 0xc0000b6010 (adresse memoire)

    // * lit la valeur pointee
    fmt.Println(*p)      // 42

    // Modifier la valeur via le pointeur
    *p = 100
    fmt.Println(x)       // 100 -- x a change !
}`,
          caption: "& prend l'adresse, * lit (ou modifie) la valeur pointee.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Valeur zero d'un pointeur : nil",
          text: "Un pointeur non initialise vaut `nil` (equivalent de null dans d'autres langages). Dereferencer un pointeur `nil` provoque un **panic** a l'execution. Verifie toujours `p != nil` avant de dereferencer un pointeur qui pourrait etre nul.",
        },
        {
          type: "code",
          language: "go",
          code: `var p *int          // p vaut nil
fmt.Println(p)      // <nil>
fmt.Println(p == nil) // true
// fmt.Println(*p)  // PANIC: nil pointer dereference`,
          caption: "Un pointeur non initialise vaut nil.",
        },
      ],
    },
    {
      id: "pointeurs-et-fonctions",
      number: "6.2",
      title: "Pointeurs et fonctions",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, les arguments sont toujours **passes par valeur** : la fonction recoit une copie. Pour qu'une fonction modifie la variable de l'appelant, on lui passe un **pointeur**. La fonction recoit une copie de l'adresse, mais cette adresse pointe vers la meme zone memoire.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// doubler recoit une copie de n : la variable originale ne change pas
func doubler(n int) {
    n = n * 2
}

// doublerPtr recoit un pointeur : elle modifie la valeur originale
func doublerPtr(p *int) {
    *p = *p * 2
}

func main() {
    x := 10

    doubler(x)
    fmt.Println(x)      // 10 -- inchange

    doublerPtr(&x)
    fmt.Println(x)      // 20 -- modifie via le pointeur
}`,
          caption: "Passer par valeur vs passer par pointeur.",
        },
        {
          type: "usecase",
          title: "Pourquoi passer par pointeur ?",
          text: "Deux raisons principales : (1) **modifier** la valeur de l'appelant sans retourner de resultat, et (2) **eviter une copie** couteuse quand la structure est volumineuse (ex. un struct avec de nombreux champs). Pour les types simples (int, bool, string courts), la copie est negligeable.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Une fonction qui retourne un pointeur vers une variable locale est parfaitement valide en Go. Le compilateur detecte que la variable « s'echappe » de la fonction et l'alloue sur le tas (heap) au lieu de la pile (stack). C'est l'**escape analysis**.",
        },
        {
          type: "code",
          language: "go",
          code: `// newInt retourne un pointeur vers un int local
func newInt(val int) *int {
    n := val
    return &n    // Go alloue n sur le heap automatiquement
}

p := newInt(42)
fmt.Println(*p)  // 42`,
          caption: "Retourner un pointeur vers une variable locale est sur en Go.",
        },
      ],
    },
    {
      id: "new-et-make",
      number: "6.3",
      title: "new() et make()",
      blocks: [
        {
          type: "paragraph",
          text: "Go offre deux fonctions d'allocation : `new` et `make`. Elles ont des roles differents.",
        },
        {
          type: "list",
          items: [
            "**new(T)** : alloue la memoire pour un type T, l'initialise a la valeur zero, et retourne un **pointeur** `*T`.",
            "**make(T, ...)** : reserve uniquement pour les **slices**, **maps** et **channels**. Retourne une valeur initialisee (pas un pointeur).",
          ],
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // new retourne un pointeur vers un int initialise a 0
    p := new(int)
    fmt.Println(*p)       // 0
    *p = 42
    fmt.Println(*p)       // 42

    // make cree un slice pret a l'emploi
    s := make([]int, 3)   // [0 0 0], pas un pointeur
    s[0] = 10
    fmt.Println(s)        // [10 0 0]

    // make cree une map prete a l'emploi
    m := make(map[string]int)
    m["a"] = 1
    fmt.Println(m)        // map[a:1]
}`,
          caption: "new retourne un *T ; make retourne un T initialise (slice, map, channel).",
        },
        {
          type: "callout",
          variant: "warning",
          text: "N'utilise pas `new` pour creer un slice ou une map : `new([]int)` te donne un `*[]int` pointant vers un slice `nil`, pas un slice pret a l'emploi. Utilise `make` pour ces types.",
        },
      ],
    },
    {
      id: "pointeurs-et-structs",
      number: "6.4",
      title: "Pointeurs et structs",
      blocks: [
        {
          type: "paragraph",
          text: "Quand on a un pointeur vers une struct, Go permet un raccourci syntaxique : au lieu d'ecrire `(*p).Field`, on ecrit simplement `p.Field`. Le compilateur comprend automatiquement qu'il faut dereferencer le pointeur.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

type Point struct {
    X int
    Y int
}

func deplacer(p *Point, dx, dy int) {
    // Pas besoin de (*p).X, Go fait le dereferencement automatique
    p.X += dx
    p.Y += dy
}

func main() {
    pt := Point{X: 1, Y: 2}

    // Passe un pointeur vers pt
    deplacer(&pt, 10, 20)

    fmt.Println(pt)    // {11 22}
}`,
          caption: "p.Field est un raccourci pour (*p).Field quand p est un pointeur vers struct.",
        },
        {
          type: "usecase",
          title: "Structs et pointeurs en pratique",
          text: "En Go, on passe presque toujours les structs par pointeur aux fonctions. Cela evite de copier l'integralite de la struct a chaque appel et permet a la fonction de modifier l'original. C'est la convention standard dans le code Go professionnel.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le literal `&Point{X: 1, Y: 2}` cree un Point et retourne directement un pointeur vers celui-ci. C'est un raccourci tres courant pour creer des pointeurs vers struct en une seule expression.",
        },
        {
          type: "code",
          language: "go",
          code: `// Creer un pointeur vers struct en une ligne
p := &Point{X: 5, Y: 10}
fmt.Println(p.X, p.Y)    // 5 10
fmt.Printf("%T\\n", p)    // *main.Point`,
          caption: "Le literal &Struct{...} est le pattern le plus courant.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g6-ex1",
      title: "Obtenir une adresse",
      difficulty: "facile",
      language: "go",
      prompt:
        "Declare une variable `age` de type `int` avec la valeur `25`. Cree un pointeur `p` vers `age` avec `&`. Affiche l'adresse (le pointeur) puis la valeur pointee avec `*p`.",
      hints: [
        "`p := &age` cree un pointeur vers age.",
        "`*p` lit la valeur pointee.",
        "Utilise `fmt.Println` pour afficher.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Declare age et un pointeur p vers age

    // Affiche l'adresse puis la valeur pointee
}`,
      solution: `package main

import "fmt"

func main() {
    // Declare la variable age
    age := 25

    // Cree un pointeur vers age
    p := &age

    // Affiche l'adresse et la valeur pointee
    fmt.Println("Adresse :", p)
    fmt.Println("Valeur :", *p)
}`,
      checks: [
        { label: "Declare la variable age", pattern: "age\\s*:=\\s*25|var\\s+age" },
        { label: "Cree un pointeur avec &", pattern: "&age" },
        { label: "Dereference avec *p", pattern: "\\*p" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g6-ex2",
      title: "Modifier via un pointeur",
      difficulty: "facile",
      language: "go",
      prompt:
        "Declare une variable `score` a `0`. Cree un pointeur `p` vers `score`, puis utilise `*p` pour changer la valeur a `100`. Affiche `score` pour verifier que la modification a fonctionne.",
      hints: [
        "`*p = 100` modifie la valeur pointee.",
        "Apres la modification, `score` vaut 100.",
      ],
      starter: `package main

import "fmt"

func main() {
    score := 0

    // Cree un pointeur vers score

    // Modifie la valeur via le pointeur

    fmt.Println(score) // doit afficher 100
}`,
      solution: `package main

import "fmt"

func main() {
    score := 0

    // Cree un pointeur vers score
    p := &score

    // Modifie la valeur via le pointeur
    *p = 100

    fmt.Println(score) // 100
}`,
      checks: [
        { label: "Cree un pointeur avec &score", pattern: "&score" },
        { label: "Modifie via *p = 100", pattern: "\\*p\\s*=\\s*100" },
        { label: "Affiche score", pattern: "fmt\\.Println\\(score\\)" },
      ],
    },
    {
      id: "g6-ex3",
      title: "Echanger deux valeurs (swap)",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction `swap(a, b *int)` qui echange les valeurs de `a` et `b` via les pointeurs. Dans `main`, declare `x := 1` et `y := 2`, appelle `swap(&x, &y)`, puis affiche `x` et `y` pour verifier l'echange.",
      hints: [
        "Pour echanger : `*a, *b = *b, *a` (affectation multiple en Go).",
        "Ou utilise une variable temporaire : `tmp := *a; *a = *b; *b = tmp`.",
      ],
      starter: `package main

import "fmt"

// Echange les valeurs pointees par a et b
func swap(a, b *int) {
    // A completer
}

func main() {
    x := 1
    y := 2

    swap(&x, &y)

    fmt.Println(x, y) // doit afficher 2 1
}`,
      solution: `package main

import "fmt"

// Echange les valeurs pointees par a et b
func swap(a, b *int) {
    *a, *b = *b, *a
}

func main() {
    x := 1
    y := 2

    swap(&x, &y)

    fmt.Println(x, y) // 2 1
}`,
      checks: [
        { label: "Fonction swap avec deux pointeurs *int", pattern: "func\\s+swap\\(.*\\*int.*\\*int" },
        { label: "Dereference les pointeurs dans swap", pattern: "\\*a.*\\*b|\\*b.*\\*a" },
        { label: "Appelle swap avec &x et &y", pattern: "swap\\(&x,\\s*&y\\)" },
        { label: "Affiche x et y apres l'echange", pattern: "fmt\\.Println\\(x,\\s*y\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : swap(1, 2) -> 2, 1
    a1, b1 := 1, 2
    swap(&a1, &b1)
    if a1 != 2 || b1 != 1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: swap(1, 2) => a=%d, b=%d, attendu a=2, b=1\\n", a1, b1)
        echecs++
    } else {
        fmt.Println("OK: swap(1, 2) => a=2, b=1")
    }

    // Test 2 : swap(100, -50) -> -50, 100
    a2, b2 := 100, -50
    swap(&a2, &b2)
    if a2 != -50 || b2 != 100 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: swap(100, -50) => a=%d, b=%d, attendu a=-50, b=100\\n", a2, b2)
        echecs++
    } else {
        fmt.Println("OK: swap(100, -50) => a=-50, b=100")
    }

    // Test 3 : swap(0, 0) -> 0, 0
    a3, b3 := 0, 0
    swap(&a3, &b3)
    if a3 != 0 || b3 != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: swap(0, 0) => a=%d, b=%d, attendu a=0, b=0\\n", a3, b3)
        echecs++
    } else {
        fmt.Println("OK: swap(0, 0) => a=0, b=0")
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
      id: "g6-ex4",
      title: "Pointeur vers struct",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Definis un type `Personne` avec les champs `Nom string` et `Age int`. Ecris une fonction `anniversaire(p *Personne)` qui incremente l'age de 1. Dans `main`, cree une `Personne{\"Alice\", 30}`, appelle `anniversaire` et affiche la personne.",
      hints: [
        "Avec un pointeur vers struct, on accede aux champs directement : `p.Age`.",
        "Passe l'adresse avec `&`.",
      ],
      starter: `package main

import "fmt"

type Personne struct {
    Nom string
    Age int
}

// Incremente l'age de 1
func anniversaire(p *Personne) {
    // A completer
}

func main() {
    alice := Personne{"Alice", 30}
    anniversaire(&alice)
    fmt.Println(alice)
}`,
      solution: `package main

import "fmt"

type Personne struct {
    Nom string
    Age int
}

// Incremente l'age de 1
func anniversaire(p *Personne) {
    p.Age++
}

func main() {
    alice := Personne{"Alice", 30}
    anniversaire(&alice)
    fmt.Println(alice) // {Alice 31}
}`,
      checks: [
        { label: "Definit le type Personne", pattern: "type\\s+Personne\\s+struct" },
        { label: "Fonction anniversaire avec *Personne", pattern: "func\\s+anniversaire\\(.*\\*Personne" },
        { label: "Modifie p.Age dans la fonction", pattern: "p\\.Age" },
        { label: "Passe &alice a la fonction", pattern: "anniversaire\\(&alice\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : anniversaire sur Alice (30 -> 31)
    p1 := Personne{"Alice", 30}
    anniversaire(&p1)
    if p1.Age != 31 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: anniversaire({Alice, 30}) => Age=%d, attendu 31\\n", p1.Age)
        echecs++
    } else {
        fmt.Println("OK: anniversaire({Alice, 30}) => Age=31")
    }

    // Test 2 : anniversaire deux fois sur Bob (0 -> 2)
    p2 := Personne{"Bob", 0}
    anniversaire(&p2)
    anniversaire(&p2)
    if p2.Age != 2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: anniversaire x2 ({Bob, 0}) => Age=%d, attendu 2\\n", p2.Age)
        echecs++
    } else {
        fmt.Println("OK: anniversaire x2 ({Bob, 0}) => Age=2")
    }

    // Test 3 : le nom ne change pas
    if p1.Nom != "Alice" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: le Nom a changé => %q, attendu \"Alice\"\\n", p1.Nom)
        echecs++
    } else {
        fmt.Println("OK: le Nom reste \"Alice\"")
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
      id: "g6-ex5",
      title: "Utiliser new()",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Utilise `new(int)` pour creer un pointeur `p` vers un `int`. Affiche la valeur initiale (valeur zero), puis assigne `42` via `*p` et affiche la nouvelle valeur.",
      hints: [
        "`new(int)` retourne un `*int` pointant vers 0.",
        "`*p = 42` modifie la valeur pointee.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Cree un pointeur avec new

    // Affiche la valeur initiale

    // Assigne 42 et affiche
}`,
      solution: `package main

import "fmt"

func main() {
    // Cree un pointeur avec new
    p := new(int)

    // Affiche la valeur initiale (0)
    fmt.Println("Avant :", *p)

    // Assigne 42 et affiche
    *p = 42
    fmt.Println("Apres :", *p)
}`,
      checks: [
        { label: "Utilise new(int)", pattern: "new\\(int\\)" },
        { label: "Lit la valeur avec *p", pattern: "\\*p" },
        { label: "Assigne 42", pattern: "\\*p\\s*=\\s*42" },
        { label: "Affiche avec fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g6-ex6",
      title: "Nil check",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Ecris une fonction `safeDeref(p *int) int` qui retourne la valeur pointee si `p` n'est pas `nil`, sinon retourne `-1`. Teste-la avec un pointeur valide et un pointeur nil.",
      hints: [
        "Compare avec `p == nil` ou `p != nil`.",
        "Si nil, retourne -1 ; sinon retourne `*p`.",
      ],
      starter: `package main

import "fmt"

// Retourne la valeur pointee ou -1 si nil
func safeDeref(p *int) int {
    // A completer
}

func main() {
    val := 42
    fmt.Println(safeDeref(&val))  // 42
    fmt.Println(safeDeref(nil))   // -1
}`,
      solution: `package main

import "fmt"

// Retourne la valeur pointee ou -1 si nil
func safeDeref(p *int) int {
    if p == nil {
        return -1
    }
    return *p
}

func main() {
    val := 42
    fmt.Println(safeDeref(&val))  // 42
    fmt.Println(safeDeref(nil))   // -1
}`,
      checks: [
        { label: "Fonction safeDeref avec *int", pattern: "func\\s+safeDeref\\(.*\\*int\\)\\s*int" },
        { label: "Verifie nil", pattern: "p\\s*==\\s*nil|p\\s*!=\\s*nil" },
        { label: "Retourne -1 pour nil", pattern: "return\\s+-1" },
        { label: "Dereference avec *p", pattern: "return\\s+\\*p" },
        { label: "Teste avec nil", pattern: "safeDeref\\(nil\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : safeDeref(&42) = 42
    val1 := 42
    if got := safeDeref(&val1); got != 42 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: safeDeref(&42) = %d, attendu 42\\n", got)
        echecs++
    } else {
        fmt.Println("OK: safeDeref(&42) =", got)
    }

    // Test 2 : safeDeref(nil) = -1
    if got := safeDeref(nil); got != -1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: safeDeref(nil) = %d, attendu -1\\n", got)
        echecs++
    } else {
        fmt.Println("OK: safeDeref(nil) =", got)
    }

    // Test 3 : safeDeref(&0) = 0 (valeur zero, pas nil)
    val3 := 0
    if got := safeDeref(&val3); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: safeDeref(&0) = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: safeDeref(&0) =", got)
    }

    // Test 4 : safeDeref(&(-99)) = -99
    val4 := -99
    if got := safeDeref(&val4); got != -99 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: safeDeref(&(-99)) = %d, attendu -99\\n", got)
        echecs++
    } else {
        fmt.Println("OK: safeDeref(&(-99)) =", got)
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
    id: "g6-projet",
    title: "Compteur partage",
    difficulty: "moyen",
    language: "go",
    prompt:
      "Cree un type `Compteur` avec un champ `valeur int`. Ecris trois fonctions qui prennent un `*Compteur` : `incrementer(c *Compteur)` qui ajoute 1, `decrementer(c *Compteur)` qui retire 1, et `lireValeur(c *Compteur) int` qui retourne la valeur actuelle. Dans `main`, cree un `Compteur`, incremente 3 fois, decremente 1 fois, et affiche la valeur finale (attendue : 2).",
    hints: [
      "Le type Compteur est un struct avec un champ `valeur`.",
      "Les fonctions recoivent un `*Compteur` pour modifier l'original.",
      "c.valeur++ incremente, c.valeur-- decremente.",
    ],
    starter: `package main

import "fmt"

type Compteur struct {
    valeur int
}

// Ajoute 1 au compteur
func incrementer(c *Compteur) {
    // A completer
}

// Retire 1 au compteur
func decrementer(c *Compteur) {
    // A completer
}

// Retourne la valeur actuelle
func lireValeur(c *Compteur) int {
    // A completer
}

func main() {
    cpt := Compteur{}

    incrementer(&cpt)
    incrementer(&cpt)
    incrementer(&cpt)
    decrementer(&cpt)

    fmt.Println("Valeur finale :", lireValeur(&cpt))
}`,
    solution: `package main

import "fmt"

type Compteur struct {
    valeur int
}

// Ajoute 1 au compteur
func incrementer(c *Compteur) {
    c.valeur++
}

// Retire 1 au compteur
func decrementer(c *Compteur) {
    c.valeur--
}

// Retourne la valeur actuelle
func lireValeur(c *Compteur) int {
    return c.valeur
}

func main() {
    cpt := Compteur{}

    incrementer(&cpt)
    incrementer(&cpt)
    incrementer(&cpt)
    decrementer(&cpt)

    fmt.Println("Valeur finale :", lireValeur(&cpt)) // Valeur finale : 2
}`,
    checks: [
      { label: "Definit le type Compteur struct", pattern: "type\\s+Compteur\\s+struct" },
      { label: "Champ valeur int", pattern: "valeur\\s+int" },
      { label: "Fonction incrementer avec *Compteur", pattern: "func\\s+incrementer\\(.*\\*Compteur" },
      { label: "Fonction decrementer avec *Compteur", pattern: "func\\s+decrementer\\(.*\\*Compteur" },
      { label: "Fonction lireValeur avec *Compteur", pattern: "func\\s+lireValeur\\(.*\\*Compteur\\)\\s*int" },
      { label: "Incremente c.valeur", pattern: "c\\.valeur\\s*\\+\\+|c\\.valeur\\s*\\+=\\s*1|c\\.valeur\\s*=\\s*c\\.valeur\\s*\\+\\s*1" },
      { label: "Decremente c.valeur", pattern: "c\\.valeur\\s*--|c\\.valeur\\s*-=\\s*1|c\\.valeur\\s*=\\s*c\\.valeur\\s*-\\s*1" },
      { label: "Retourne c.valeur", pattern: "return\\s+c\\.valeur" },
    ],
    tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : incrementer 3 fois -> 3
    cpt1 := Compteur{}
    incrementer(&cpt1)
    incrementer(&cpt1)
    incrementer(&cpt1)
    if got := lireValeur(&cpt1); got != 3 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: 3x incrementer => lireValeur = %d, attendu 3\\n", got)
        echecs++
    } else {
        fmt.Println("OK: 3x incrementer => lireValeur =", got)
    }

    // Test 2 : incrementer 3, decrementer 1 -> 2
    cpt2 := Compteur{}
    incrementer(&cpt2)
    incrementer(&cpt2)
    incrementer(&cpt2)
    decrementer(&cpt2)
    if got := lireValeur(&cpt2); got != 2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: 3x inc + 1x dec => lireValeur = %d, attendu 2\\n", got)
        echecs++
    } else {
        fmt.Println("OK: 3x inc + 1x dec => lireValeur =", got)
    }

    // Test 3 : compteur vide -> 0
    cpt3 := Compteur{}
    if got := lireValeur(&cpt3); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: compteur vide => lireValeur = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: compteur vide => lireValeur =", got)
    }

    // Test 4 : decrementer depuis 0 -> -1
    decrementer(&cpt3)
    if got := lireValeur(&cpt3); got != -1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: dec depuis 0 => lireValeur = %d, attendu -1\\n", got)
        echecs++
    } else {
        fmt.Println("OK: dec depuis 0 => lireValeur =", got)
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
    "Un pointeur `*T` contient l'adresse d'une variable de type T. On obtient l'adresse avec `&` et la valeur avec `*`.",
    "La valeur zero d'un pointeur est `nil`. Dereferencer nil provoque un panic.",
    "Passer un pointeur a une fonction permet de modifier la variable de l'appelant et d'eviter les copies couteuses.",
    "`new(T)` alloue un T a la valeur zero et retourne un `*T`. `make` est reserve aux slices, maps et channels.",
    "Avec un pointeur vers struct, `p.Field` est un raccourci pour `(*p).Field`.",
  ],
};
