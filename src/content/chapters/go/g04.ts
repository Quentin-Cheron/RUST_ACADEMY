import type { Chapter } from "../../types";

export const g04: Chapter = {
  number: 4,
  slug: "fonctions",
  title: "Fonctions",
  subtitle:
    "Declarer des fonctions, retours multiples, fonctions variadiques et closures.",
  description:
    "Les fonctions sont les briques de base de tout programme Go. Ce chapitre couvre la declaration de fonctions avec le mot-cle `func`, les retours multiples (une signature de Go), les fonctions variadiques qui acceptent un nombre variable d'arguments, et les fonctions anonymes / closures qui capturent leur environnement. Tu verras aussi comment passer une fonction en parametre d'une autre — un outil puissant pour ecrire du code generique.",
  minutes: 30,
  rustBookRef: "Go Tour -- Fonctions",
  objectives: [
    "Declarer une fonction avec des parametres et un type de retour",
    "Utiliser les retours multiples et les retours nommes",
    "Ecrire des fonctions variadiques avec ...T",
    "Creer des fonctions anonymes et des closures",
  ],
  sections: [
    {
      id: "declarer-fonction",
      number: "4.1",
      title: "Declarer une fonction",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, une fonction se declare avec le mot-cle `func`. Les types des parametres viennent **apres** le nom (comme en Pascal, pas comme en C). Si plusieurs parametres partagent le meme type, on peut factoriser.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Fonction avec un parametre et un retour
func doubler(n int) int {
    return n * 2
}

// Parametres du meme type : on factorise
func additionner(a, b int) int {
    return a + b
}

// Fonction sans retour
func saluer(nom string) {
    fmt.Println("Bonjour,", nom, "!")
}

func main() {
    fmt.Println(doubler(21))         // 42
    fmt.Println(additionner(3, 7))   // 10
    saluer("Gopher")                 // Bonjour, Gopher !
}`,
          filename: "main.go",
          caption: "Declarer et appeler des fonctions en Go.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Passage par valeur",
          text: "En Go, les arguments sont **toujours passes par valeur** (copies). Pour modifier la variable d'origine, il faut passer un pointeur (`*int`). Les slices, maps et channels sont des types reference : la valeur copiee est une reference vers la structure sous-jacente.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Les fonctions exportees (visibles hors du package) commencent par une **majuscule** : `Additionner`. Les fonctions internes commencent par une minuscule : `additionner`. C'est la seule regle de visibilite de Go — pas de mot-cle `public`/`private`.",
        },
      ],
    },
    {
      id: "retours-multiples",
      number: "4.2",
      title: "Retours multiples",
      blocks: [
        {
          type: "paragraph",
          text: "Go permet de retourner **plusieurs valeurs** depuis une fonction. C'est le mecanisme central de la gestion d'erreur en Go : la convention est de retourner `(resultat, error)`. On peut aussi **nommer** les retours pour documenter leur role.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "errors"
    "fmt"
)

// Retour multiple : quotient et reste
func diviser(a, b int) (int, int) {
    return a / b, a % b
}

// Retour multiple avec erreur (pattern idiomatique)
func diviserSafe(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division par zero")
    }
    return a / b, nil
}

// Retours nommes : documente ce que chaque valeur represente
func dimensions(surface, ratio float64) (largeur, hauteur float64) {
    hauteur = surface / ratio
    largeur = surface / hauteur
    return // "naked return" : retourne les variables nommees
}

func main() {
    q, r := diviser(17, 5)
    fmt.Println("17 / 5 =", q, "reste", r) // 3 reste 2

    res, err := diviserSafe(10, 0)
    if err != nil {
        fmt.Println("Erreur :", err)
    } else {
        fmt.Println("Resultat :", res)
    }

    l, h := dimensions(100, 2)
    fmt.Printf("Largeur=%.1f Hauteur=%.1f\\n", l, h)
}`,
          filename: "main.go",
          caption: "Retours multiples et pattern (valeur, erreur).",
        },
        {
          type: "usecase",
          title: "Le pattern (valeur, erreur)",
          text: "En Go, on ne leve pas d'exceptions. On retourne une erreur comme seconde valeur : `result, err := maFonction()`. L'appelant verifie `if err != nil { ... }`. C'est explicite, previsible, et force a traiter les erreurs la ou elles apparaissent.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Naked return",
          text: "Le `return` sans arguments (naked return) retourne les variables nommees. C'est acceptable dans les fonctions courtes, mais **deconseille dans les fonctions longues** car ca nuit a la lisibilite. Prefere les retours explicites.",
        },
      ],
    },
    {
      id: "fonctions-variadiques",
      number: "4.3",
      title: "Fonctions variadiques",
      blocks: [
        {
          type: "paragraph",
          text: "Une fonction variadique accepte un **nombre variable d'arguments** grace a la syntaxe `...T`. A l'interieur de la fonction, le parametre est un slice. Tu as deja utilise une fonction variadique sans le savoir : `fmt.Println(a, b, c)` accepte un nombre quelconque d'arguments.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Fonction variadique : somme d'un nombre quelconque d'entiers
func somme(nombres ...int) int {
    total := 0
    for _, n := range nombres {
        total += n
    }
    return total
}

// On peut combiner parametres fixes et variadique (toujours en dernier)
func afficherListe(label string, elements ...string) {
    fmt.Println(label + " :")
    for i, e := range elements {
        fmt.Printf("  %d. %s\\n", i+1, e)
    }
}

func main() {
    fmt.Println(somme(1, 2, 3))         // 6
    fmt.Println(somme(10, 20, 30, 40))  // 100
    fmt.Println(somme())                // 0 (slice vide)

    // Passer un slice existant avec l'operateur de spread ...
    notes := []int{18, 15, 12, 20}
    fmt.Println(somme(notes...))        // 65

    afficherListe("Courses", "Pain", "Lait", "Oeufs")
}`,
          filename: "main.go",
          caption: "Les fonctions variadiques acceptent un nombre variable d'arguments.",
        },
        {
          type: "callout",
          variant: "info",
          text: "Pour passer un slice existant a une fonction variadique, utilise l'operateur de **spread** : `somme(monSlice...)`. Sans les `...`, le compilateur s'attend a des arguments individuels.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le parametre variadique doit toujours etre le **dernier** parametre de la fonction. Tu ne peux pas ecrire `func f(args ...int, label string)` — ca ne compile pas.",
        },
      ],
    },
    {
      id: "closures",
      number: "4.4",
      title: "Fonctions anonymes et closures",
      blocks: [
        {
          type: "paragraph",
          text: "Go supporte les **fonctions anonymes** (sans nom) et les **closures** (fonctions qui capturent des variables de leur environnement). Elles sont souvent utilisees comme callbacks, dans les goroutines, ou pour creer des generateurs.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Fonction qui retourne une closure (un compteur)
func nouveauCompteur() func() int {
    n := 0
    return func() int {
        n++ // capture et modifie n
        return n
    }
}

func main() {
    // Fonction anonyme appelee immediatement
    resultat := func(a, b int) int {
        return a + b
    }(3, 4)
    fmt.Println("3 + 4 =", resultat) // 7

    // Fonction anonyme assignee a une variable
    carre := func(x int) int {
        return x * x
    }
    fmt.Println("5^2 =", carre(5))   // 25

    // Closure : chaque compteur a son propre etat
    c1 := nouveauCompteur()
    c2 := nouveauCompteur()
    fmt.Println(c1(), c1(), c1()) // 1 2 3
    fmt.Println(c2(), c2())       // 1 2 (independant de c1)
}`,
          filename: "main.go",
          caption: "Fonctions anonymes et closures en Go.",
        },
        {
          type: "paragraph",
          text: "On peut aussi passer une fonction en parametre d'une autre. Le type d'une fonction se note avec sa signature complete :",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Appliquer une transformation a chaque element d'un slice
func appliquer(nombres []int, transform func(int) int) []int {
    resultat := make([]int, len(nombres))
    for i, n := range nombres {
        resultat[i] = transform(n)
    }
    return resultat
}

func main() {
    nombres := []int{1, 2, 3, 4, 5}

    // Passer une fonction anonyme en parametre
    doubles := appliquer(nombres, func(n int) int {
        return n * 2
    })
    fmt.Println(doubles) // [2 4 6 8 10]

    carres := appliquer(nombres, func(n int) int {
        return n * n
    })
    fmt.Println(carres)  // [1 4 9 16 25]
}`,
          filename: "main.go",
          caption: "Passer une fonction en parametre pour un traitement generique.",
        },
        {
          type: "usecase",
          title: "Closures pour les middlewares HTTP",
          text: "Dans un serveur web Go, les middlewares sont des fonctions qui prennent un handler et retournent un handler. `func logger(next http.Handler) http.Handler { return http.HandlerFunc(func(w, r) { log(r); next.ServeHTTP(w, r) }) }` — c'est une closure qui capture `next`.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Attention aux closures dans les boucles : la variable de boucle est **partagee**. `for i := 0; i < 3; i++ { go func() { fmt.Println(i) }() }` risque d'afficher `3 3 3`. Passe `i` en parametre : `go func(i int) { fmt.Println(i) }(i)`.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g4-ex1",
      title: "Fonction simple",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris une fonction `perimetre` qui prend deux parametres `largeur` et `hauteur` de type `float64` et retourne le perimetre d\'un rectangle (`2 * (largeur + hauteur)`). Dans `main`, appelle-la avec `5.0` et `3.0` et affiche le resultat avec `fmt.Println`.',
      hints: [
        "La signature est `func perimetre(largeur, hauteur float64) float64`.",
        "N'oublie pas le `return`.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Declare la fonction perimetre\n\nfunc main() {\n    // Appelle perimetre et affiche le resultat\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Calcule le perimetre d\'un rectangle\nfunc perimetre(largeur, hauteur float64) float64 {\n    return 2 * (largeur + hauteur)\n}\n\nfunc main() {\n    resultat := perimetre(5.0, 3.0)\n    fmt.Println("Perimetre :", resultat)\n}',
      checks: [
        { label: "Declare la fonction perimetre", pattern: "func\\s+perimetre\\(" },
        { label: "Parametres float64", pattern: "float64\\)\\s*float64" },
        { label: "Calcule 2 * (largeur + hauteur)", pattern: "2\\s*\\*\\s*\\(\\s*largeur\\s*\\+\\s*hauteur\\s*\\)" },
        { label: "Appelle perimetre(5.0, 3.0)", pattern: "perimetre\\(5\\.0\\s*,\\s*3\\.0\\)" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
      tests: `package main

import (
    "fmt"
    "math"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : perimetre(5.0, 3.0) = 16.0
    if got := perimetre(5.0, 3.0); math.Abs(got-16.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: perimetre(5.0, 3.0) = %v, attendu 16\\n", got)
        echecs++
    } else {
        fmt.Println("OK: perimetre(5.0, 3.0) =", got)
    }

    // Test 2 : perimetre(0, 0) = 0
    if got := perimetre(0, 0); math.Abs(got-0.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: perimetre(0, 0) = %v, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: perimetre(0, 0) =", got)
    }

    // Test 3 : perimetre(10.5, 4.5) = 30.0
    if got := perimetre(10.5, 4.5); math.Abs(got-30.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: perimetre(10.5, 4.5) = %v, attendu 30\\n", got)
        echecs++
    } else {
        fmt.Println("OK: perimetre(10.5, 4.5) =", got)
    }

    // Test 4 : perimetre(1.0, 1.0) = 4.0
    if got := perimetre(1.0, 1.0); math.Abs(got-4.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: perimetre(1.0, 1.0) = %v, attendu 4\\n", got)
        echecs++
    } else {
        fmt.Println("OK: perimetre(1.0, 1.0) =", got)
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
      id: "g4-ex2",
      title: "Retours multiples",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris une fonction `minMax` qui prend un slice `[]int` et retourne deux valeurs : le **minimum** et le **maximum**. Si le slice est vide, retourne `(0, 0)`. Dans `main`, appelle-la avec `[]int{3, 1, 4, 1, 5, 9, 2, 6}` et affiche les deux resultats.',
      hints: [
        "La signature est `func minMax(nombres []int) (int, int)`.",
        "Initialise min et max au premier element, puis parcours le reste.",
        "Verifie `len(nombres) == 0` en premier.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Declare minMax\n\nfunc main() {\n    nombres := []int{3, 1, 4, 1, 5, 9, 2, 6}\n    // Appelle et affiche\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne le minimum et le maximum d\'un slice\nfunc minMax(nombres []int) (int, int) {\n    if len(nombres) == 0 {\n        return 0, 0\n    }\n    min, max := nombres[0], nombres[0]\n    for _, n := range nombres {\n        if n < min {\n            min = n\n        }\n        if n > max {\n            max = n\n        }\n    }\n    return min, max\n}\n\nfunc main() {\n    nombres := []int{3, 1, 4, 1, 5, 9, 2, 6}\n    min, max := minMax(nombres)\n    fmt.Println("Min :", min, "Max :", max)\n}',
      checks: [
        { label: "Declare la fonction minMax", pattern: "func\\s+minMax\\(" },
        { label: "Retourne deux int", pattern: "\\(int\\s*,\\s*int\\)" },
        { label: "Parcourt avec range", pattern: "for\\s+.*range\\s+nombres" },
        { label: "Recupere min et max a l'appel", pattern: "(min|mn)\\s*,\\s*(max|mx)\\s*:=\\s*minMax" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : minMax([]int{3, 1, 4, 1, 5, 9, 2, 6})
    mn, mx := minMax([]int{3, 1, 4, 1, 5, 9, 2, 6})
    if mn != 1 || mx != 9 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: minMax([3,1,4,1,5,9,2,6]) = (%d, %d), attendu (1, 9)\\n", mn, mx)
        echecs++
    } else {
        fmt.Printf("OK: minMax([3,1,4,1,5,9,2,6]) = (%d, %d)\\n", mn, mx)
    }

    // Test 2 : slice vide
    mn2, mx2 := minMax([]int{})
    if mn2 != 0 || mx2 != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: minMax([]) = (%d, %d), attendu (0, 0)\\n", mn2, mx2)
        echecs++
    } else {
        fmt.Printf("OK: minMax([]) = (%d, %d)\\n", mn2, mx2)
    }

    // Test 3 : un seul element
    mn3, mx3 := minMax([]int{42})
    if mn3 != 42 || mx3 != 42 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: minMax([42]) = (%d, %d), attendu (42, 42)\\n", mn3, mx3)
        echecs++
    } else {
        fmt.Printf("OK: minMax([42]) = (%d, %d)\\n", mn3, mx3)
    }

    // Test 4 : nombres negatifs
    mn4, mx4 := minMax([]int{-5, -1, -10, -3})
    if mn4 != -10 || mx4 != -1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: minMax([-5,-1,-10,-3]) = (%d, %d), attendu (-10, -1)\\n", mn4, mx4)
        echecs++
    } else {
        fmt.Printf("OK: minMax([-5,-1,-10,-3]) = (%d, %d)\\n", mn4, mx4)
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
      id: "g4-ex3",
      title: "Somme variadique",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction variadique `somme` qui accepte un nombre quelconque d'entiers (`...int`) et retourne leur somme. Dans `main`, appelle-la de trois facons : (1) avec des arguments individuels `1, 2, 3, 4, 5`, (2) avec un slice `[]int{10, 20, 30}` en utilisant l'operateur de spread `...`, (3) sans argument.",
      hints: [
        "La signature est `func somme(nombres ...int) int`.",
        "Pour passer un slice : `somme(monSlice...)`.",
        "`somme()` retourne 0 car le slice est vide.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Declare la fonction variadique somme\n\nfunc main() {\n    // 1. Avec des arguments individuels\n\n    // 2. Avec un slice et l\'operateur spread\n\n    // 3. Sans argument\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Somme variadique\nfunc somme(nombres ...int) int {\n    total := 0\n    for _, n := range nombres {\n        total += n\n    }\n    return total\n}\n\nfunc main() {\n    // 1. Arguments individuels\n    fmt.Println(somme(1, 2, 3, 4, 5))    // 15\n\n    // 2. Slice avec spread\n    notes := []int{10, 20, 30}\n    fmt.Println(somme(notes...))          // 60\n\n    // 3. Sans argument\n    fmt.Println(somme())                  // 0\n}',
      checks: [
        { label: "Declare une fonction variadique", pattern: "func\\s+somme\\(nombres\\s+\\.\\.\\.int\\)" },
        { label: "Parcourt avec range", pattern: "for\\s+.*range\\s+nombres" },
        { label: "Appel avec arguments individuels", pattern: "somme\\(1\\s*,\\s*2\\s*,\\s*3" },
        { label: "Appel avec l'operateur spread", pattern: "somme\\(\\w+\\.\\.\\.\\)" },
        { label: "Appel sans argument", pattern: "somme\\(\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : somme(1, 2, 3, 4, 5) = 15
    if got := somme(1, 2, 3, 4, 5); got != 15 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme(1,2,3,4,5) = %d, attendu 15\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme(1,2,3,4,5) =", got)
    }

    // Test 2 : somme() = 0
    if got := somme(); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme() = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme() =", got)
    }

    // Test 3 : somme(10, 20, 30) = 60
    if got := somme(10, 20, 30); got != 60 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme(10,20,30) = %d, attendu 60\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme(10,20,30) =", got)
    }

    // Test 4 : somme avec spread
    nums := []int{100, 200, 300}
    if got := somme(nums...); got != 600 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme([]int{100,200,300}...) = %d, attendu 600\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme([]int{100,200,300}...) =", got)
    }

    // Test 5 : somme(-5, 5) = 0
    if got := somme(-5, 5); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme(-5, 5) = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme(-5, 5) =", got)
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
      id: "g4-ex4",
      title: "Closure compteur",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction `creerCompteur` qui retourne une **closure** de type `func() int`. A chaque appel, la closure incremente un compteur interne et retourne la nouvelle valeur. Dans `main`, cree **deux compteurs independants** et montre qu'ils comptent separement.",
      hints: [
        "Declare une variable `n := 0` dans `creerCompteur`, puis retourne une fonction anonyme qui incremente `n`.",
        "Chaque appel a `creerCompteur()` cree un nouvel `n` : les compteurs sont independants.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Declare creerCompteur\n\nfunc main() {\n    // Cree deux compteurs et montre leur independance\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne une closure qui incremente un compteur\nfunc creerCompteur() func() int {\n    n := 0\n    return func() int {\n        n++\n        return n\n    }\n}\n\nfunc main() {\n    c1 := creerCompteur()\n    c2 := creerCompteur()\n\n    fmt.Println(c1(), c1(), c1()) // 1 2 3\n    fmt.Println(c2(), c2())       // 1 2 (independant)\n}',
      checks: [
        { label: "Declare creerCompteur", pattern: "func\\s+creerCompteur\\(\\)" },
        { label: "Retourne une func() int", pattern: "func\\(\\)\\s*int" },
        { label: "Capture une variable n", pattern: "n\\s*:=\\s*0[\\s\\S]*n\\+\\+" },
        { label: "Cree deux compteurs", pattern: "c1\\s*:=\\s*creerCompteur[\\s\\S]*c2\\s*:=\\s*creerCompteur" },
        { label: "Appelle les compteurs", pattern: "c1\\(\\)[\\s\\S]*c2\\(\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : le compteur incremente a chaque appel
    c1 := creerCompteur()
    if got := c1(); got != 1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c1() premier appel = %d, attendu 1\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c1() premier appel =", got)
    }

    if got := c1(); got != 2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c1() deuxieme appel = %d, attendu 2\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c1() deuxieme appel =", got)
    }

    if got := c1(); got != 3 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c1() troisieme appel = %d, attendu 3\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c1() troisieme appel =", got)
    }

    // Test 2 : un deuxieme compteur est independant
    c2 := creerCompteur()
    if got := c2(); got != 1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c2() premier appel = %d, attendu 1 (independant de c1)\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c2() premier appel =", got, "(independant de c1)")
    }

    if got := c2(); got != 2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c2() deuxieme appel = %d, attendu 2\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c2() deuxieme appel =", got)
    }

    // Test 3 : c1 continue de compter
    if got := c1(); got != 4 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: c1() quatrieme appel = %d, attendu 4\\n", got)
        echecs++
    } else {
        fmt.Println("OK: c1() quatrieme appel =", got)
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
      id: "g4-ex5",
      title: "Fonction en parametre",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Ecris une fonction `filtrer` qui prend un slice `[]int` et une fonction de test `func(int) bool`, et retourne un nouveau slice contenant uniquement les elements pour lesquels le test renvoie `true`. Dans `main`, utilise-la pour filtrer les nombres **pairs** d'un slice `[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}`.",
      hints: [
        "La signature est `func filtrer(nombres []int, test func(int) bool) []int`.",
        "Cree un slice resultat vide et utilise `append` pour les elements qui passent le test.",
        "Le test pour les pairs : `func(n int) bool { return n%2 == 0 }`.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Declare la fonction filtrer\n\nfunc main() {\n    nombres := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}\n    // Filtre les pairs\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Filtre un slice selon une fonction de test\nfunc filtrer(nombres []int, test func(int) bool) []int {\n    resultat := []int{}\n    for _, n := range nombres {\n        if test(n) {\n            resultat = append(resultat, n)\n        }\n    }\n    return resultat\n}\n\nfunc main() {\n    nombres := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}\n\n    pairs := filtrer(nombres, func(n int) bool {\n        return n%2 == 0\n    })\n    fmt.Println("Pairs :", pairs) // [2 4 6 8 10]\n}',
      checks: [
        { label: "Declare la fonction filtrer", pattern: "func\\s+filtrer\\(" },
        { label: "Accepte une fonction en parametre", pattern: "func\\(int\\)\\s*bool" },
        { label: "Utilise append dans la boucle", pattern: "append\\(resultat\\s*,\\s*n\\)" },
        { label: "Passe une fonction anonyme pour les pairs", pattern: "n\\s*%\\s*2\\s*==\\s*0" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func slicesEqual(a, b []int) bool {
    if len(a) != len(b) {
        return false
    }
    for i := range a {
        if a[i] != b[i] {
            return false
        }
    }
    return true
}

func main() {
    echecs := 0

    // Test 1 : filtrer les pairs
    got := filtrer([]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, func(n int) bool { return n%2 == 0 })
    want := []int{2, 4, 6, 8, 10}
    if !slicesEqual(got, want) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: filtrer(pairs) = %v, attendu %v\\n", got, want)
        echecs++
    } else {
        fmt.Println("OK: filtrer(pairs) =", got)
    }

    // Test 2 : filtrer les impairs
    got2 := filtrer([]int{1, 2, 3, 4, 5}, func(n int) bool { return n%2 != 0 })
    want2 := []int{1, 3, 5}
    if !slicesEqual(got2, want2) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: filtrer(impairs) = %v, attendu %v\\n", got2, want2)
        echecs++
    } else {
        fmt.Println("OK: filtrer(impairs) =", got2)
    }

    // Test 3 : filtrer les > 3
    got3 := filtrer([]int{1, 2, 3, 4, 5}, func(n int) bool { return n > 3 })
    want3 := []int{4, 5}
    if !slicesEqual(got3, want3) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: filtrer(>3) = %v, attendu %v\\n", got3, want3)
        echecs++
    } else {
        fmt.Println("OK: filtrer(>3) =", got3)
    }

    // Test 4 : aucun match
    got4 := filtrer([]int{1, 2, 3}, func(n int) bool { return n > 10 })
    if len(got4) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: filtrer(>10) = %v, attendu []\\n", got4)
        echecs++
    } else {
        fmt.Println("OK: filtrer(>10) = [] (vide)")
    }

    // Test 5 : slice vide
    got5 := filtrer([]int{}, func(n int) bool { return true })
    if len(got5) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: filtrer(vide) = %v, attendu []\\n", got5)
        echecs++
    } else {
        fmt.Println("OK: filtrer(vide) = [] (vide)")
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
      id: "g4-ex6",
      title: "Retours nommes avec erreur",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris une fonction `racineCarree` avec des **retours nommes** `(resultat float64, err error)`. Si le nombre est negatif, retourne une erreur avec `errors.New("nombre negatif")`. Sinon, retourne `math.Sqrt(n)`. Dans `main`, appelle-la avec `25.0` puis avec `-4.0` et gere l\'erreur avec `if err != nil`.',
      hints: [
        "Importe les packages `errors` et `math`.",
        "Les retours nommes : `func racineCarree(n float64) (resultat float64, err error)`.",
        "`math.Sqrt(n)` calcule la racine carree.",
      ],
      starter:
        'package main\n\nimport (\n    "errors"\n    "fmt"\n    "math"\n)\n\n// Declare racineCarree avec retours nommes\n\nfunc main() {\n    // Appelle avec 25.0\n\n    // Appelle avec -4.0\n}',
      solution:
        'package main\n\nimport (\n    "errors"\n    "fmt"\n    "math"\n)\n\n// Racine carree avec gestion d\'erreur et retours nommes\nfunc racineCarree(n float64) (resultat float64, err error) {\n    if n < 0 {\n        err = errors.New("nombre negatif")\n        return\n    }\n    resultat = math.Sqrt(n)\n    return\n}\n\nfunc main() {\n    // Cas valide\n    res, err := racineCarree(25.0)\n    if err != nil {\n        fmt.Println("Erreur :", err)\n    } else {\n        fmt.Println("Racine de 25 :", res)\n    }\n\n    // Cas d\'erreur\n    res, err = racineCarree(-4.0)\n    if err != nil {\n        fmt.Println("Erreur :", err)\n    } else {\n        fmt.Println("Racine de -4 :", res)\n    }\n}',
      checks: [
        { label: "Declare racineCarree", pattern: "func\\s+racineCarree\\(" },
        { label: "Utilise des retours nommes", pattern: "\\(resultat\\s+float64\\s*,\\s*err\\s+error\\)" },
        { label: "Utilise errors.New", pattern: "errors\\.New" },
        { label: "Utilise math.Sqrt", pattern: "math\\.Sqrt" },
        { label: "Gere l'erreur avec if err != nil", pattern: "if\\s+err\\s*!=\\s*nil" },
        { label: "Appelle avec 25.0 et -4.0", pattern: "racineCarree\\(25\\.0\\)[\\s\\S]*racineCarree\\(-4\\.0\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "math"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : racineCarree(25.0) = 5.0, pas d'erreur
    res, err := racineCarree(25.0)
    if err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(25.0) erreur inattendue: %v\\n", err)
        echecs++
    } else if math.Abs(res-5.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(25.0) = %v, attendu 5\\n", res)
        echecs++
    } else {
        fmt.Println("OK: racineCarree(25.0) =", res)
    }

    // Test 2 : racineCarree(-4.0) retourne une erreur
    res2, err2 := racineCarree(-4.0)
    if err2 == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(-4.0) devrait retourner une erreur, got %v\\n", res2)
        echecs++
    } else {
        fmt.Println("OK: racineCarree(-4.0) erreur =", err2)
    }

    // Test 3 : racineCarree(0) = 0.0
    res3, err3 := racineCarree(0)
    if err3 != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(0) erreur inattendue: %v\\n", err3)
        echecs++
    } else if math.Abs(res3-0.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(0) = %v, attendu 0\\n", res3)
        echecs++
    } else {
        fmt.Println("OK: racineCarree(0) =", res3)
    }

    // Test 4 : racineCarree(2.0) ~ 1.4142
    res4, err4 := racineCarree(2.0)
    if err4 != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(2.0) erreur inattendue: %v\\n", err4)
        echecs++
    } else if math.Abs(res4-1.41421356) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racineCarree(2.0) = %v, attendu ~1.4142\\n", res4)
        echecs++
    } else {
        fmt.Printf("OK: racineCarree(2.0) = %.4f\\n", res4)
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
    id: "g4-projet",
    title: "Boite a outils mathematiques",
    difficulty: "moyen",
    language: "go",
    prompt:
      'Cree une boite a outils mathematiques avec les fonctions suivantes :\n\n1. `somme(nombres ...int) int` — fonction variadique qui retourne la somme\n2. `moyenne(nombres ...int) (float64, error)` — retourne la moyenne en `float64` ou une erreur si le slice est vide (utilise `errors.New("slice vide")`)\n3. `appliquerOp(a, b int, op func(int, int) int) int` — applique une operation passee en parametre\n4. `creerMultiplieur(facteur int) func(int) int` — retourne une closure qui multiplie par `facteur`\n\nDans `main`, demontre chaque fonction : calcule la somme de `1,2,3,4,5`, la moyenne de `10,20,30`, applique une addition avec `appliquerOp`, et cree un triplieur avec `creerMultiplieur(3)`.',
    hints: [
      "La moyenne est `float64(somme) / float64(len(nombres))`.",
      "Pour `appliquerOp`, le troisieme parametre est `func(int, int) int`.",
      "Le multiplieur capture `facteur` dans la closure.",
      "N'oublie pas de gerer l'erreur de `moyenne` avec `if err != nil`.",
    ],
    starter:
      'package main\n\nimport (\n    "errors"\n    "fmt"\n)\n\n// 1. somme variadique\n\n// 2. moyenne avec erreur\n\n// 3. appliquerOp avec fonction en parametre\n\n// 4. creerMultiplieur (closure)\n\nfunc main() {\n    // Demontre chaque fonction\n}',
    solution:
      'package main\n\nimport (\n    "errors"\n    "fmt"\n)\n\n// 1. Somme variadique\nfunc somme(nombres ...int) int {\n    total := 0\n    for _, n := range nombres {\n        total += n\n    }\n    return total\n}\n\n// 2. Moyenne avec retour multiple (valeur, erreur)\nfunc moyenne(nombres ...int) (float64, error) {\n    if len(nombres) == 0 {\n        return 0, errors.New("slice vide")\n    }\n    total := somme(nombres...)\n    return float64(total) / float64(len(nombres)), nil\n}\n\n// 3. Applique une operation passee en parametre\nfunc appliquerOp(a, b int, op func(int, int) int) int {\n    return op(a, b)\n}\n\n// 4. Retourne une closure qui multiplie par facteur\nfunc creerMultiplieur(facteur int) func(int) int {\n    return func(n int) int {\n        return n * facteur\n    }\n}\n\nfunc main() {\n    // Somme\n    fmt.Println("Somme :", somme(1, 2, 3, 4, 5)) // 15\n\n    // Moyenne\n    moy, err := moyenne(10, 20, 30)\n    if err != nil {\n        fmt.Println("Erreur :", err)\n    } else {\n        fmt.Printf("Moyenne : %.2f\\n", moy) // 20.00\n    }\n\n    // appliquerOp avec une addition\n    addition := func(a, b int) int { return a + b }\n    fmt.Println("3 + 7 =", appliquerOp(3, 7, addition)) // 10\n\n    // Closure multiplieur\n    tripler := creerMultiplieur(3)\n    fmt.Println("4 x 3 =", tripler(4))   // 12\n    fmt.Println("10 x 3 =", tripler(10)) // 30\n}',
    checks: [
      { label: "Declare le package main", pattern: "package\\s+main" },
      { label: "Fonction variadique somme", pattern: "func\\s+somme\\(nombres\\s+\\.\\.\\.int\\)\\s*int" },
      { label: "Fonction moyenne avec erreur", pattern: "func\\s+moyenne\\(.*\\)\\s*\\(float64\\s*,\\s*error\\)" },
      { label: "Utilise errors.New pour slice vide", pattern: 'errors\\.New\\("slice vide"\\)' },
      { label: "Fonction appliquerOp avec func en parametre", pattern: "func\\s+appliquerOp\\(.*func\\(int\\s*,\\s*int\\)\\s*int\\)" },
      { label: "Fonction creerMultiplieur retournant une closure", pattern: "func\\s+creerMultiplieur\\(.*\\)\\s*func\\(int\\)\\s*int" },
      { label: "Gere l'erreur de moyenne", pattern: "if\\s+err\\s*!=\\s*nil" },
      { label: "Cree un triplieur", pattern: "creerMultiplieur\\(3\\)" },
    ],
    tests: `package main

import (
    "fmt"
    "math"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test somme
    if got := somme(1, 2, 3, 4, 5); got != 15 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme(1,2,3,4,5) = %d, attendu 15\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme(1,2,3,4,5) =", got)
    }

    if got := somme(); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: somme() = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: somme() =", got)
    }

    // Test moyenne - cas normal
    moy, err := moyenne(10, 20, 30)
    if err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(10,20,30) erreur inattendue: %v\\n", err)
        echecs++
    } else if math.Abs(moy-20.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(10,20,30) = %v, attendu 20\\n", moy)
        echecs++
    } else {
        fmt.Println("OK: moyenne(10,20,30) =", moy)
    }

    // Test moyenne - slice vide
    _, errVide := moyenne()
    if errVide == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne() devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: moyenne() erreur =", errVide)
    }

    // Test appliquerOp
    add := func(a, b int) int { return a + b }
    if got := appliquerOp(3, 7, add); got != 10 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appliquerOp(3, 7, add) = %d, attendu 10\\n", got)
        echecs++
    } else {
        fmt.Println("OK: appliquerOp(3, 7, add) =", got)
    }

    mul := func(a, b int) int { return a * b }
    if got := appliquerOp(4, 5, mul); got != 20 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appliquerOp(4, 5, mul) = %d, attendu 20\\n", got)
        echecs++
    } else {
        fmt.Println("OK: appliquerOp(4, 5, mul) =", got)
    }

    // Test creerMultiplieur
    tripler := creerMultiplieur(3)
    if got := tripler(4); got != 12 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: tripler(4) = %d, attendu 12\\n", got)
        echecs++
    } else {
        fmt.Println("OK: tripler(4) =", got)
    }

    if got := tripler(10); got != 30 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: tripler(10) = %d, attendu 30\\n", got)
        echecs++
    } else {
        fmt.Println("OK: tripler(10) =", got)
    }

    doubler := creerMultiplieur(2)
    if got := doubler(7); got != 14 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: doubler(7) = %d, attendu 14\\n", got)
        echecs++
    } else {
        fmt.Println("OK: doubler(7) =", got)
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
    "Les fonctions se declarent avec `func`. Les types des parametres viennent apres le nom, et on peut factoriser les types identiques.",
    "Go permet les **retours multiples** : le pattern `(valeur, error)` est la base de la gestion d'erreur.",
    "Les fonctions variadiques (`...T`) acceptent un nombre variable d'arguments ; on peut passer un slice avec l'operateur spread `s...`.",
    "Les **closures** capturent les variables de leur environnement. Chaque instance a son propre etat.",
    "On peut passer une fonction en parametre (`func(int) int`) pour ecrire du code generique et composable.",
  ],
};
