import type { Chapter } from "../../types";

export const g02: Chapter = {
  number: 2,
  slug: "variables-types",
  title: "Variables et types",
  subtitle:
    "Declarer des variables, comprendre les types de base et utiliser les constantes.",
  description:
    "En Go, chaque variable a un type precis et le compilateur ne laisse rien passer. Ce chapitre te montre comment declarer des variables avec `var` et `:=`, les types de base (entiers, flottants, chaines, booleens), les conversions explicites et les constantes avec `const` et `iota`. Tu verras aussi les valeurs zero, un concept central de Go : chaque type a une valeur par defaut, jamais de donnee non initialisee.",
  minutes: 30,
  rustBookRef: "Go Tour -- Types de base",
  objectives: [
    "Declarer des variables avec var et l'operateur court :=",
    "Connaitre les types de base : int, float64, string, bool, byte, rune",
    "Effectuer des conversions de types explicites",
    "Definir des constantes avec const et utiliser iota pour les enumerations",
  ],
  sections: [
    {
      id: "declarer-variable",
      number: "2.1",
      title: "Declarer une variable",
      blocks: [
        {
          type: "paragraph",
          text: "Go propose deux facons de declarer une variable : le mot-cle `var` (utilisable partout) et l'operateur court `:=` (uniquement dans une fonction). La grande regle : **toute variable declaree doit etre utilisee**, sinon le compilateur refuse de compiler.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// var au niveau du package (pas de :=  ici)
var version string = "1.0.0"

func main() {
    // var avec type explicite
    var age int = 25

    // var avec inference de type
    var nom = "Gopher"

    // Operateur court := (declare + initialise)
    langage := "Go"

    // Declaration multiple
    var (
        largeur  int     = 100
        hauteur  int     = 50
        actif    bool    = true
    )

    fmt.Println(nom, age, langage, version)
    fmt.Println(largeur, hauteur, actif)
}`,
          filename: "main.go",
          caption: "Les differentes facons de declarer une variable en Go.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Valeurs zero",
          text: "En Go, une variable non initialisee a toujours une **valeur zero** : `0` pour les nombres, `false` pour les booleens, `\"\"` pour les chaines, `nil` pour les pointeurs, slices et maps. Il n'y a jamais de valeur indeterminee.",
        },
        {
          type: "code",
          language: "go",
          code: `var i int       // 0
var f float64   // 0
var b bool      // false
var s string    // "" (chaine vide)
fmt.Println(i, f, b, s)  // 0 0 false`,
          caption: "Les valeurs zero des types de base.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "L'operateur `:=` ne fonctionne que **dans** une fonction. Au niveau du package, tu dois utiliser `var`. Et attention : `=` affecte une variable existante, `:=` en declare une nouvelle.",
        },
      ],
    },
    {
      id: "types-de-base",
      number: "2.2",
      title: "Types de base",
      blocks: [
        {
          type: "paragraph",
          text: "Go dispose d'un ensemble de types primitifs clair et explicite. Contrairement a certains langages, il n'y a pas de type `number` generique : tu choisis precisement la taille et le signe.",
        },
        {
          type: "list",
          items: [
            "**Entiers signes** : `int8`, `int16`, `int32`, `int64` et `int` (taille du processeur, 64 bits en general).",
            "**Entiers non signes** : `uint8` (alias `byte`), `uint16`, `uint32`, `uint64` et `uint`.",
            "**Flottants** : `float32` et `float64` (prefere `float64` par defaut).",
            "**Booleens** : `bool` — `true` ou `false`.",
            "**Chaines** : `string` — sequences d'octets UTF-8 immuables.",
            "**Rune** : `rune` (alias de `int32`) — un point de code Unicode.",
            "**Byte** : `byte` (alias de `uint8`) — un octet.",
          ],
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Entiers
    var compteur int = 42
    var petit int8 = 127          // max pour int8

    // Flottants
    var pi float64 = 3.14159
    var temp float32 = 36.6

    // Booleen
    var actif bool = true

    // Chaine de caracteres (immuable, UTF-8)
    var message string = "Salut, le monde !"

    // Rune : un caractere Unicode
    var lettre rune = 'A'         // vaut 65 (point de code)
    var emoji rune = '🎉'

    // Byte : un octet
    var octet byte = 255          // max pour uint8

    fmt.Println(compteur, petit)
    fmt.Println(pi, temp)
    fmt.Println(actif)
    fmt.Println(message)
    fmt.Printf("lettre=%c emoji=%c octet=%d\\n", lettre, emoji, octet)
}`,
          filename: "main.go",
          caption: "Tour d'horizon des types de base en Go.",
        },
        {
          type: "usecase",
          title: "Quel type d'entier choisir ?",
          text: "Par defaut, utilise `int`. Choisis un type precis (`int32`, `uint16`...) uniquement quand tu as une contrainte de taille (protocole reseau, fichier binaire) ou de performance. Pour les indices de slice, `int` est le choix standard.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le package `fmt` offre des verbes de formatage : `%d` (entier), `%f` (flottant), `%s` (chaine), `%t` (booleen), `%c` (caractere), `%v` (valeur par defaut), `%T` (type). Utilise `fmt.Printf` pour un affichage precis.",
        },
      ],
    },
    {
      id: "conversions-types",
      number: "2.3",
      title: "Conversions de types",
      blocks: [
        {
          type: "paragraph",
          text: "Go n'a **aucune conversion implicite**. Meme entre `int` et `int64`, tu dois convertir explicitement. C'est une decision de design : les conversions implicites sont une source frequente de bugs, Go les interdit.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // int vers float64
    entier := 42
    flottant := float64(entier)       // 42.0

    // float64 vers int (troncature, pas d'arrondi !)
    pi := 3.99
    tronque := int(pi)                // 3 (pas 4)

    // int vers string : attention !
    // string(65) donne "A" (le caractere), pas "65"
    code := 65
    caractere := string(rune(code))   // "A"

    // Pour convertir un nombre en texte, utilise fmt.Sprint
    texte := fmt.Sprint(entier)       // "42"

    fmt.Println(flottant, tronque)
    fmt.Println(caractere, texte)

    // Entiers de tailles differentes
    var a int32 = 100
    var b int64 = int64(a)            // conversion explicite obligatoire
    fmt.Println(a, b)
}`,
          filename: "main.go",
          caption: "Toutes les conversions doivent etre explicites en Go.",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Piege classique",
          text: "`string(65)` ne donne pas `\"65\"` mais `\"A\"` (le caractere Unicode 65). Pour convertir un nombre en sa representation textuelle, utilise `fmt.Sprint(65)` ou `strconv.Itoa(65)`.",
        },
        {
          type: "callout",
          variant: "info",
          text: "La conversion `float64` vers `int` **tronque** la partie decimale (pas d'arrondi). `int(3.99)` donne `3`. Pour arrondir, utilise `math.Round(3.99)` qui renvoie `4.0`, puis convertis en `int`.",
        },
      ],
    },
    {
      id: "constantes",
      number: "2.4",
      title: "Constantes",
      blocks: [
        {
          type: "paragraph",
          text: "Les constantes sont declarees avec `const`. Elles doivent etre evaluables a la compilation (pas d'appel de fonction). Go offre une particularite puissante : les constantes numeriques non typees ont une precision arbitraire et s'adaptent au contexte d'utilisation.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Constante simple
const Pi = 3.14159265358979

// Bloc de constantes
const (
    AppNom    = "MonApp"
    AppVersion = "2.0"
    MaxRetries = 3
)

func main() {
    fmt.Println(AppNom, AppVersion)
    fmt.Println("Pi =", Pi)
    fmt.Println("Max retries :", MaxRetries)
}`,
          caption: "Declarer des constantes simples avec const.",
        },
        {
          type: "paragraph",
          text: "Le mot-cle `iota` est un generateur d'entiers qui s'incremente automatiquement dans un bloc `const`. C'est la facon idiomatique de creer des enumerations en Go.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Enumeration avec iota (commence a 0)
const (
    Lundi    = iota  // 0
    Mardi             // 1 (iota implicite)
    Mercredi          // 2
    Jeudi             // 3
    Vendredi          // 4
    Samedi            // 5
    Dimanche          // 6
)

// iota avec expressions
const (
    _  = iota             // 0 (ignore avec _)
    Ko = 1 << (10 * iota) // 1 << 10 = 1024
    Mo                    // 1 << 20 = 1048576
    Go                    // 1 << 30 = 1073741824
)

func main() {
    fmt.Println("Mercredi =", Mercredi)   // 2
    fmt.Println("Ko =", Ko)               // 1024
    fmt.Println("Mo =", Mo)               // 1048576
    fmt.Println("Go =", Go)               // 1073741824
}`,
          filename: "main.go",
          caption: "iota genere des enumerations elegantes.",
        },
        {
          type: "usecase",
          title: "iota pour les roles utilisateur",
          text: "Imaginons un systeme avec des niveaux d'acces : `const (Lecteur = iota; Editeur; Admin; SuperAdmin)`. Chaque role a un entier unique, automatiquement incremente. Pour des flags combinables, utilise `1 << iota` (bitmask).",
        },
        {
          type: "callout",
          variant: "tip",
          text: "On utilise souvent `_ = iota` pour ignorer la valeur 0 et commencer l'enumeration a 1. Cela evite de confondre la vraie valeur avec la valeur zero d'un `int`.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g2-ex1",
      title: "Declarer des variables",
      difficulty: "facile",
      language: "go",
      prompt:
        'Declare trois variables dans `main` : `nom` de type `string` avec la valeur `"Go"`, `annee` de type `int` avec la valeur `2009`, et `stable` de type `bool` avec la valeur `true`. Affiche-les avec `fmt.Println`.',
      hints: [
        "Tu peux utiliser `var` ou `:=` pour chaque variable.",
        "N'oublie pas d'importer le package `fmt`.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Declare les trois variables\n\n    // Affiche-les\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Declare les trois variables\n    nom := "Go"\n    annee := 2009\n    stable := true\n\n    // Affiche les valeurs\n    fmt.Println(nom, annee, stable)\n}',
      checks: [
        { label: "Declare la variable nom", pattern: '(var\\s+nom|nom\\s*:=)\\s*"Go"' },
        { label: "Declare la variable annee", pattern: "(var\\s+annee|annee\\s*:=)\\s*2009" },
        { label: "Declare la variable stable", pattern: "(var\\s+stable|stable\\s*:=)\\s*true" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g2-ex2",
      title: "L'operateur court :=",
      difficulty: "facile",
      language: "go",
      prompt:
        'Utilise exclusivement l\'operateur court `:=` pour declarer : `prenom` (`"Alice"`), `age` (`30`), `taille` (`1.68`). Affiche chaque variable avec son type en utilisant `fmt.Printf` et le verbe `%T`.',
      hints: [
        "L'operateur `:=` declare et initialise en une seule etape.",
        '`fmt.Printf("var=%v type=%T\\n", var, var)` affiche la valeur et le type.',
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Declare avec :=\n\n    // Affiche avec fmt.Printf et %T\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Declare avec l\'operateur court\n    prenom := "Alice"\n    age := 30\n    taille := 1.68\n\n    // Affiche chaque variable avec son type\n    fmt.Printf("prenom=%v type=%T\\n", prenom, prenom)\n    fmt.Printf("age=%v type=%T\\n", age, age)\n    fmt.Printf("taille=%v type=%T\\n", taille, taille)\n}',
      checks: [
        { label: "Utilise := pour prenom", pattern: 'prenom\\s*:=\\s*"Alice"' },
        { label: "Utilise := pour age", pattern: "age\\s*:=\\s*30" },
        { label: "Utilise := pour taille", pattern: "taille\\s*:=\\s*1\\.68" },
        { label: "Utilise le verbe %T", pattern: "%T" },
        { label: "Utilise fmt.Printf", pattern: "fmt\\.Printf" },
      ],
    },
    {
      id: "g2-ex3",
      title: "Conversions explicites",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction `moyenne(total, nombre int) float64` qui convertit les deux parametres en `float64` avant de diviser, pour ne pas perdre la decimale. Par exemple, `moyenne(175, 4)` retourne `43.75`. Dans `main`, appelle-la et affiche le resultat avec `fmt.Printf` en limitant a 2 decimales (`%.2f`).",
      hints: [
        "Si tu divises deux `int`, le resultat sera un `int` (tronque).",
        "`float64(total) / float64(nombre)` donne un resultat flottant.",
        '`fmt.Printf("%.2f\\n", val)` affiche avec 2 decimales.',
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Ecris la fonction moyenne\n\nfunc main() {\n    // Appelle moyenne(175, 4) et affiche avec %.2f\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Calcule la moyenne en convertissant en float64\nfunc moyenne(total, nombre int) float64 {\n    return float64(total) / float64(nombre)\n}\n\nfunc main() {\n    res := moyenne(175, 4)\n    fmt.Printf("Moyenne : %.2f\\n", res)\n}',
      checks: [
        { label: "Declare la fonction moyenne", pattern: "func\\s+moyenne\\(" },
        { label: "Convertit en float64", pattern: "float64\\(" },
        { label: "Retourne float64", pattern: "float64\\s*\\{" },
        { label: "Utilise fmt.Printf", pattern: "fmt\\.Printf" },
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

    // Test 1 : moyenne(175, 4) = 43.75
    if got := moyenne(175, 4); math.Abs(got-43.75) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(175, 4) = %v, attendu 43.75\\n", got)
        echecs++
    } else {
        fmt.Println("OK: moyenne(175, 4) =", got)
    }

    // Test 2 : moyenne(10, 3) ~ 3.333...
    if got := moyenne(10, 3); math.Abs(got-3.333333) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(10, 3) = %v, attendu ~3.333\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: moyenne(10, 3) = %.4f\\n", got)
    }

    // Test 3 : moyenne(100, 1) = 100.0
    if got := moyenne(100, 1); math.Abs(got-100.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(100, 1) = %v, attendu 100\\n", got)
        echecs++
    } else {
        fmt.Println("OK: moyenne(100, 1) =", got)
    }

    // Test 4 : moyenne(0, 5) = 0.0
    if got := moyenne(0, 5); math.Abs(got-0.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: moyenne(0, 5) = %v, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: moyenne(0, 5) =", got)
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
      id: "g2-ex4",
      title: "Constantes et iota",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Cree un bloc `const` avec une enumeration de saisons utilisant `iota` : `Printemps` (0), `Ete` (1), `Automne` (2), `Hiver` (3). Puis declare une constante `AnneeFondation` valant `2009`. Dans `main`, affiche chaque saison et la constante `AnneeFondation` avec `fmt.Println`.',
      hints: [
        "`iota` demarre a 0 et s'incremente dans un bloc `const`.",
        "Les lignes suivantes heritent de l'expression `iota` implicitement.",
        "Tu peux avoir plusieurs blocs `const`.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Enumeration des saisons\n\n// Constante simple\n\nfunc main() {\n    // Affiche les saisons et la constante\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Enumeration des saisons\nconst (\n    Printemps = iota  // 0\n    Ete               // 1\n    Automne           // 2\n    Hiver             // 3\n)\n\n// Constante simple\nconst AnneeFondation = 2009\n\nfunc main() {\n    fmt.Println("Printemps =", Printemps)\n    fmt.Println("Ete =", Ete)\n    fmt.Println("Automne =", Automne)\n    fmt.Println("Hiver =", Hiver)\n    fmt.Println("Annee de fondation :", AnneeFondation)\n}',
      checks: [
        { label: "Utilise iota", pattern: "iota" },
        { label: "Declare Printemps", pattern: "Printemps\\s*=\\s*iota" },
        { label: "Declare Ete, Automne, Hiver", pattern: "Ete[\\s\\S]*Automne[\\s\\S]*Hiver" },
        { label: "Declare AnneeFondation", pattern: "AnneeFondation\\s*=\\s*2009" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g2-ex5",
      title: "Formatage avec Printf",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Declare `nom := "Go"`, `version := 1.22` et `annee := 2009`. Affiche **une seule ligne** avec `fmt.Printf` au format : `Go version 1.22 (depuis 2009)`. Utilise les verbes `%s`, `%.2f` et `%d`.',
      hints: [
        "`%s` pour les chaines, `%.2f` pour les flottants avec 2 decimales, `%d` pour les entiers.",
        "N'oublie pas le `\\n` a la fin du format.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    nom := "Go"\n    version := 1.22\n    annee := 2009\n\n    // Affiche avec fmt.Printf\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    nom := "Go"\n    version := 1.22\n    annee := 2009\n\n    // Affiche sur une seule ligne avec les bons verbes de formatage\n    fmt.Printf("%s version %.2f (depuis %d)\\n", nom, version, annee)\n}',
      checks: [
        { label: "Utilise fmt.Printf", pattern: "fmt\\.Printf" },
        { label: "Utilise le verbe %s", pattern: "%s" },
        { label: "Utilise le verbe %.2f", pattern: "%\\.2f" },
        { label: "Utilise le verbe %d", pattern: "%d" },
        { label: "Contient les trois variables", pattern: "nom.*version.*annee|nom.*annee.*version" },
      ],
    },
    {
      id: "g2-ex6",
      title: "Tailles en octets avec iota",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Cree un bloc `const` qui definit les tailles `Ko`, `Mo` et `Go` en utilisant `iota` et l'operateur de decalage `<<`. Ignore la valeur 0 avec `_`. Dans `main`, declare `tailleFichier := 3 * Go` et affiche sa valeur avec `fmt.Println`.",
      hints: [
        "`1 << (10 * iota)` donne 1, 1024, 1048576, 1073741824...",
        "Utilise `_ = iota` pour ignorer la premiere valeur (1).",
        "Les constantes non typees peuvent etre multipliees sans conversion.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Definit Ko, Mo, Go avec iota\n\nfunc main() {\n    // Declare tailleFichier et affiche-la\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Tailles en octets avec iota\nconst (\n    _  = iota             // 0 (ignore)\n    Ko = 1 << (10 * iota) // 1 << 10 = 1024\n    Mo                    // 1 << 20 = 1048576\n    Go                    // 1 << 30 = 1073741824\n)\n\nfunc main() {\n    tailleFichier := 3 * Go\n    fmt.Println("Taille du fichier :", tailleFichier, "octets")\n}',
      checks: [
        { label: "Utilise iota", pattern: "iota" },
        { label: "Utilise l'operateur de decalage <<", pattern: "<<" },
        { label: "Declare Ko", pattern: "Ko\\s*=" },
        { label: "Declare Mo et Go", pattern: "Mo[\\s\\S]*Go" },
        { label: "Calcule 3 * Go", pattern: "3\\s*\\*\\s*Go" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
  ],
  project: {
    id: "g2-projet",
    title: "Mini-calculatrice",
    difficulty: "moyen",
    language: "go",
    prompt:
      'Ecris une mini-calculatrice sous forme de fonctions :\n\n1. `additionner(a, b float64) float64` — retourne la somme\n2. `soustraire(a, b float64) float64` — retourne la difference\n3. `multiplier(a, b float64) float64` — retourne le produit\n4. `diviser(a, b float64) float64` — retourne le quotient\n5. `modulo(a, b int) int` — retourne le reste de la division entiere\n6. `aireCercle(rayon float64) float64` — retourne l\'aire du cercle (`Pi * rayon * rayon`)\n\nDeclare une constante `Pi = 3.14159265358979`. Dans `main`, utilise ces fonctions avec `a = 17.0` et `b = 5.0` et affiche les resultats.',
    hints: [
      "Le modulo `%` ne fonctionne que sur des entiers.",
      "Declare `const Pi = 3.14159265358979` au niveau du package.",
      "L'aire d'un cercle est Pi * r * r.",
    ],
    starter:
      'package main\n\nimport "fmt"\n\n// Declare la constante Pi\n\n// Declare les 6 fonctions\n\nfunc main() {\n    a := 17.0\n    b := 5.0\n\n    // Appelle et affiche les resultats\n    _ = fmt.Sprintf("%.2f", a+b) // utilise fmt et les variables\n}',
    solution:
      'package main\n\nimport "fmt"\n\n// Constante Pi\nconst Pi = 3.14159265358979\n\nfunc additionner(a, b float64) float64 { return a + b }\nfunc soustraire(a, b float64) float64  { return a - b }\nfunc multiplier(a, b float64) float64  { return a * b }\nfunc diviser(a, b float64) float64     { return a / b }\nfunc modulo(a, b int) int              { return a % b }\nfunc aireCercle(rayon float64) float64  { return Pi * rayon * rayon }\n\nfunc main() {\n    a := 17.0\n    b := 5.0\n\n    fmt.Printf("Somme      : %.2f\\n", additionner(a, b))\n    fmt.Printf("Difference : %.2f\\n", soustraire(a, b))\n    fmt.Printf("Produit    : %.2f\\n", multiplier(a, b))\n    fmt.Printf("Quotient   : %.2f\\n", diviser(a, b))\n    fmt.Printf("Modulo     : %d\\n", modulo(int(a), int(b)))\n    fmt.Printf("Aire (r=%.0f) : %.2f\\n", a, aireCercle(a))\n}',
    checks: [
      { label: "Declare le package main", pattern: "package\\s+main" },
      { label: "Declare la constante Pi", pattern: "const\\s+Pi" },
      { label: "Declare la fonction additionner", pattern: "func\\s+additionner\\(" },
      { label: "Declare la fonction soustraire", pattern: "func\\s+soustraire\\(" },
      { label: "Declare la fonction multiplier", pattern: "func\\s+multiplier\\(" },
      { label: "Declare la fonction diviser", pattern: "func\\s+diviser\\(" },
      { label: "Declare la fonction modulo", pattern: "func\\s+modulo\\(" },
      { label: "Declare la fonction aireCercle", pattern: "func\\s+aireCercle\\(" },
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

    // Test additionner
    if got := additionner(17.0, 5.0); math.Abs(got-22.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: additionner(17, 5) = %v, attendu 22\\n", got)
        echecs++
    } else {
        fmt.Println("OK: additionner(17, 5) =", got)
    }

    // Test soustraire
    if got := soustraire(17.0, 5.0); math.Abs(got-12.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: soustraire(17, 5) = %v, attendu 12\\n", got)
        echecs++
    } else {
        fmt.Println("OK: soustraire(17, 5) =", got)
    }

    // Test multiplier
    if got := multiplier(17.0, 5.0); math.Abs(got-85.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: multiplier(17, 5) = %v, attendu 85\\n", got)
        echecs++
    } else {
        fmt.Println("OK: multiplier(17, 5) =", got)
    }

    // Test diviser
    if got := diviser(17.0, 5.0); math.Abs(got-3.4) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: diviser(17, 5) = %v, attendu 3.4\\n", got)
        echecs++
    } else {
        fmt.Println("OK: diviser(17, 5) =", got)
    }

    // Test modulo
    if got := modulo(17, 5); got != 2 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: modulo(17, 5) = %v, attendu 2\\n", got)
        echecs++
    } else {
        fmt.Println("OK: modulo(17, 5) =", got)
    }

    // Test aireCercle
    expected := 3.14159265358979 * 10.0 * 10.0
    if got := aireCercle(10.0); math.Abs(got-expected) > 0.01 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: aireCercle(10) = %v, attendu %.2f\\n", got, expected)
        echecs++
    } else {
        fmt.Printf("OK: aireCercle(10) = %.2f\\n", got)
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
    "`var` declare une variable partout ; `:=` declare et initialise mais uniquement dans une fonction.",
    "Chaque type a une **valeur zero** (0, false, \"\", nil) : pas de variable non initialisee en Go.",
    "Les types de base incluent `int`, `float64`, `string`, `bool`, `byte` (uint8) et `rune` (int32).",
    "Go n'a **aucune conversion implicite** : `float64(x)`, `int(y)` sont toujours explicites.",
    "`const` declare des constantes evaluees a la compilation ; `iota` genere des enumerations elegantes.",
  ],
};
