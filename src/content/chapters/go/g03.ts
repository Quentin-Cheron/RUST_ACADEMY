import type { Chapter } from "../../types";

export const g03: Chapter = {
  number: 3,
  slug: "controle-flux",
  title: "Structures de controle",
  subtitle:
    "Maitriser if, for, switch et defer pour controler le flux d'execution.",
  description:
    "Go a fait le choix de la simplicite pour ses structures de controle : pas de parentheses autour des conditions, une seule boucle (`for`) qui remplace `while` et `do-while`, un `switch` sans fall-through par defaut, et un mecanisme unique — `defer` — pour planifier du nettoyage. Ce chapitre couvre ces quatre piliers qui te permettront de controler le flux de n'importe quel programme Go.",
  minutes: 30,
  rustBookRef: "Go Tour -- Flux de controle",
  objectives: [
    "Ecrire des conditions if/else, y compris avec une instruction d'initialisation",
    "Utiliser for comme boucle classique, boucle while et boucle infinie",
    "Maitriser switch avec et sans expression, et le type switch",
    "Comprendre defer et l'ordre LIFO d'execution des appels differes",
  ],
  sections: [
    {
      id: "if-else",
      number: "3.1",
      title: "if / else",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, les conditions `if` n'ont **pas de parentheses** mais les accolades sont **obligatoires**. Go offre aussi une fonctionnalite originale : tu peux declarer une variable dans l'instruction `if` elle-meme, et elle n'est visible que dans le bloc `if`/`else`.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    age := 20

    // if classique (pas de parentheses !)
    if age >= 18 {
        fmt.Println("Majeur")
    } else {
        fmt.Println("Mineur")
    }

    // if avec instruction d'initialisation
    // note n'existe que dans le bloc if/else
    if note := 15; note >= 10 {
        fmt.Println("Reussite, note :", note)
    } else {
        fmt.Println("Echec, note :", note)
    }
    // fmt.Println(note) // ERREUR : note n'existe plus ici

    // if / else if / else
    score := 85
    if score >= 90 {
        fmt.Println("Excellent")
    } else if score >= 70 {
        fmt.Println("Bien")
    } else if score >= 50 {
        fmt.Println("Passable")
    } else {
        fmt.Println("Insuffisant")
    }
}`,
          filename: "main.go",
          caption: "Le if de Go : pas de parentheses, accolades obligatoires, init optionnelle.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Variable d'init dans le if",
          text: "La syntaxe `if v := calcul(); v > seuil { ... }` est idiomatique en Go. Elle limite la portee de `v` au bloc if/else, ce qui evite de polluer le scope englobant. On la voit partout avec le pattern `if err := ...; err != nil`.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "En Go, il n'y a **pas d'operateur ternaire** (`condition ? a : b`). Il faut toujours ecrire un `if/else` complet. C'est un choix delibere pour la lisibilite.",
        },
      ],
    },
    {
      id: "boucle-for",
      number: "3.2",
      title: "La boucle for",
      blocks: [
        {
          type: "paragraph",
          text: "Go n'a qu'une seule boucle : `for`. Mais elle couvre tous les cas — boucle classique a trois clauses, boucle conditionnelle (style `while`) et boucle infinie. Pas besoin de parentheses autour des clauses.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Boucle classique (init; condition; post)
    for i := 0; i < 5; i++ {
        fmt.Print(i, " ")
    }
    fmt.Println() // 0 1 2 3 4

    // Boucle "while" (condition seule)
    n := 1
    for n < 100 {
        n *= 2
    }
    fmt.Println("n =", n) // 128

    // Boucle infinie (break pour sortir)
    compteur := 0
    for {
        compteur++
        if compteur >= 3 {
            break
        }
    }
    fmt.Println("compteur =", compteur) // 3

    // continue : sauter une iteration
    for i := 0; i < 10; i++ {
        if i%2 == 0 {
            continue // saute les pairs
        }
        fmt.Print(i, " ")
    }
    fmt.Println() // 1 3 5 7 9
}`,
          filename: "main.go",
          caption: "for est la seule boucle de Go, mais elle fait tout.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`break` sort de la boucle la plus proche. `continue` passe a l'iteration suivante. Pour sortir d'une boucle imbriquee, utilise un **label** : `outer: for ... { for ... { break outer } }`.",
        },
        {
          type: "usecase",
          title: "Boucle infinie pour un serveur",
          text: "`for { conn := accept(); go handle(conn) }` : une boucle infinie est le coeur de tout serveur. On ne sort jamais de la boucle, on traite chaque connexion dans une goroutine.",
        },
      ],
    },
    {
      id: "switch",
      number: "3.3",
      title: "switch",
      blocks: [
        {
          type: "paragraph",
          text: "Le `switch` de Go est plus puissant et plus sur que dans la plupart des langages. Par defaut, seul le `case` qui matche est execute — **pas de fall-through** (pas besoin de `break`). Tu peux aussi ecrire un switch **sans expression** pour remplacer des chaines de `if/else if`.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Switch classique sur une valeur
    jour := "mercredi"
    switch jour {
    case "lundi", "mardi", "mercredi", "jeudi", "vendredi":
        fmt.Println("Jour ouvre")
    case "samedi", "dimanche":
        fmt.Println("Week-end")
    default:
        fmt.Println("Jour inconnu")
    }

    // Switch sans expression (remplace if/else if)
    note := 15
    switch {
    case note >= 16:
        fmt.Println("Tres bien")
    case note >= 14:
        fmt.Println("Bien")
    case note >= 10:
        fmt.Println("Passable")
    default:
        fmt.Println("Insuffisant")
    }

    // Switch avec init (comme if)
    switch lang := "Go"; lang {
    case "Go":
        fmt.Println("Excellent choix !")
    case "Rust":
        fmt.Println("Bon choix aussi")
    default:
        fmt.Println("Autre langage")
    }
}`,
          filename: "main.go",
          caption: "Le switch de Go : pas de fall-through, multi-valeurs, sans expression.",
        },
        {
          type: "callout",
          variant: "info",
          title: "fallthrough",
          text: "Si tu veux volontairement enchainer avec le case suivant (comme en C), utilise le mot-cle `fallthrough`. C'est rare et deconseille dans la plupart des cas.",
        },
        {
          type: "code",
          language: "go",
          code: `// Type switch : agir selon le type dynamique d'une interface
func decrire(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Println("Entier :", v)
    case string:
        fmt.Println("Chaine :", v)
    case bool:
        fmt.Println("Booleen :", v)
    default:
        fmt.Printf("Type inconnu : %T\\n", v)
    }
}`,
          caption: "Le type switch permet d'agir selon le type reel d'une valeur.",
        },
      ],
    },
    {
      id: "defer",
      number: "3.4",
      title: "defer",
      blocks: [
        {
          type: "paragraph",
          text: "`defer` planifie l'execution d'une fonction juste avant que la fonction englobante retourne. Les appels differes sont empiles : le dernier `defer` s'execute en premier (**LIFO** — Last In, First Out). C'est l'outil idiomatique pour le nettoyage : fermer un fichier, une connexion, liberer un verrou.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    fmt.Println("debut")

    defer fmt.Println("differe 1")
    defer fmt.Println("differe 2")
    defer fmt.Println("differe 3")

    fmt.Println("fin")
}
// Sortie :
// debut
// fin
// differe 3
// differe 2
// differe 1`,
          filename: "main.go",
          caption: "Les defer s'executent en ordre LIFO, apres la fin de la fonction.",
        },
        {
          type: "usecase",
          title: "Fermer un fichier proprement",
          text: "`f, err := os.Open(\"data.txt\"); if err != nil { return err }; defer f.Close()` — on place le `defer` juste apres l'ouverture. Meme si la fonction panique ou retourne en erreur plus tard, le fichier sera ferme.",
        },
        {
          type: "code",
          language: "go",
          code: `// Pattern idiomatique : ouvrir + defer fermer
func lireFichier(chemin string) error {
    f, err := os.Open(chemin)
    if err != nil {
        return err
    }
    defer f.Close() // sera execute quoi qu'il arrive

    // ... lire le fichier ...
    return nil
}`,
          caption: "defer garantit le nettoyage meme en cas d'erreur.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Les arguments du `defer` sont evalues **immediatement**, seul l'appel est differe. `defer fmt.Println(x)` capture la valeur de `x` au moment du defer, pas au moment de l'execution.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Evite de mettre un `defer` dans une boucle : chaque iteration empile un appel. Si tu ouvres un fichier dans une boucle, place le defer dans une fonction interne ou ferme explicitement a chaque iteration.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g3-ex1",
      title: "if avec initialisation",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris un programme qui utilise un `if` avec une **instruction d\'initialisation** : declare `score := 75` dans le `if`, puis affiche `"Reussite"` si `score >= 50`, sinon `"Echec"`. Utilise `fmt.Println`.',
      hints: [
        "La syntaxe est `if variable := valeur; condition { ... } else { ... }`.",
        "La variable n'existe que dans le bloc if/else.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // if avec initialisation\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // if avec initialisation : score est local au bloc\n    if score := 75; score >= 50 {\n        fmt.Println("Reussite")\n    } else {\n        fmt.Println("Echec")\n    }\n}',
      checks: [
        { label: "Utilise if avec init", pattern: "if\\s+score\\s*:=\\s*75\\s*;" },
        { label: "Teste score >= 50", pattern: "score\\s*>=\\s*50" },
        { label: "Affiche Reussite", pattern: "Reussite" },
        { label: "Contient un else", pattern: "\\}\\s*else\\s*\\{" },
      ],
    },
    {
      id: "g3-ex2",
      title: "FizzBuzz",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris une fonction `fizzBuzz(n int) string` qui retourne `"FizzBuzz"` si `n` est divisible par 3 et 5, `"Fizz"` s\'il est divisible par 3, `"Buzz"` s\'il est divisible par 5, sinon le nombre sous forme de chaine (utilise `fmt.Sprint(n)`). Dans `main`, appelle-la dans une boucle de 1 a 20 et affiche chaque resultat.',
      hints: [
        "Commence par tester la divisibilite par 15 (3 et 5) avant de tester par 3 ou par 5.",
        "L'operateur modulo est `%`.",
        '`fmt.Sprint(n)` convertit un entier en chaine.',
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Ecris la fonction fizzBuzz\n\nfunc main() {\n    // Boucle de 1 a 20 et affiche fizzBuzz(i)\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne Fizz, Buzz, FizzBuzz ou le nombre en chaine\nfunc fizzBuzz(n int) string {\n    if n%15 == 0 {\n        return "FizzBuzz"\n    } else if n%3 == 0 {\n        return "Fizz"\n    } else if n%5 == 0 {\n        return "Buzz"\n    }\n    return fmt.Sprint(n)\n}\n\nfunc main() {\n    for i := 1; i <= 20; i++ {\n        fmt.Println(fizzBuzz(i))\n    }\n}',
      checks: [
        { label: "Declare la fonction fizzBuzz", pattern: "func\\s+fizzBuzz\\(" },
        { label: "Teste la divisibilite par 15 ou (3 et 5)", pattern: "n\\s*%\\s*15\\s*==\\s*0|n\\s*%\\s*3\\s*==\\s*0\\s*&&\\s*n\\s*%\\s*5" },
        { label: "Teste la divisibilite par 3", pattern: "n\\s*%\\s*3\\s*==\\s*0" },
        { label: "Teste la divisibilite par 5", pattern: "n\\s*%\\s*5\\s*==\\s*0" },
        { label: "Retourne FizzBuzz", pattern: "FizzBuzz" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    cas := []struct {
        n    int
        want string
    }{
        {1, "1"},
        {3, "Fizz"},
        {5, "Buzz"},
        {6, "Fizz"},
        {10, "Buzz"},
        {15, "FizzBuzz"},
        {30, "FizzBuzz"},
        {7, "7"},
    }

    for _, c := range cas {
        got := fizzBuzz(c.n)
        if got != c.want {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: fizzBuzz(%d) = %q, attendu %q\\n", c.n, got, c.want)
            echecs++
        } else {
            fmt.Printf("OK: fizzBuzz(%d) = %q\\n", c.n, got)
        }
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
      id: "g3-ex3",
      title: "Switch sur les jours",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris une fonction `typeJour(jour string) string` qui utilise un `switch` et retourne `"Jour ouvre"` pour lundi a vendredi (utilise les multi-valeurs dans les `case`), `"Week-end"` pour samedi et dimanche, et `"Jour inconnu"` par defaut. Dans `main`, teste-la avec `"samedi"` et affiche le resultat.',
      hints: [
        "Un `case` peut contenir plusieurs valeurs separees par des virgules.",
        "N'oublie pas le `default`.",
        "Retourne la chaine au lieu de l'afficher.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Ecris la fonction typeJour\n\nfunc main() {\n    fmt.Println(typeJour("samedi"))\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne le type de jour (ouvre, week-end, inconnu)\nfunc typeJour(jour string) string {\n    switch jour {\n    case "lundi", "mardi", "mercredi", "jeudi", "vendredi":\n        return "Jour ouvre"\n    case "samedi", "dimanche":\n        return "Week-end"\n    default:\n        return "Jour inconnu"\n    }\n}\n\nfunc main() {\n    fmt.Println(typeJour("samedi"))\n}',
      checks: [
        { label: "Declare la fonction typeJour", pattern: "func\\s+typeJour\\(" },
        { label: "Utilise switch", pattern: "switch\\s+jour" },
        { label: "Case avec multi-valeurs pour jours ouvres", pattern: 'case\\s+"lundi"\\s*,\\s*"mardi"' },
        { label: "Case pour le week-end", pattern: 'case\\s+"samedi"\\s*,\\s*"dimanche"' },
        { label: "Contient un default", pattern: "default\\s*:" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    cas := []struct {
        jour string
        want string
    }{
        {"lundi", "Jour ouvre"},
        {"mercredi", "Jour ouvre"},
        {"vendredi", "Jour ouvre"},
        {"samedi", "Week-end"},
        {"dimanche", "Week-end"},
        {"ferie", "Jour inconnu"},
    }

    for _, c := range cas {
        got := typeJour(c.jour)
        if got != c.want {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: typeJour(%q) = %q, attendu %q\\n", c.jour, got, c.want)
            echecs++
        } else {
            fmt.Printf("OK: typeJour(%q) = %q\\n", c.jour, got)
        }
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
      id: "g3-ex4",
      title: "Ordre des defer",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un programme qui utilise `defer` pour prouver l\'ordre LIFO. Affiche `"A"` avec `defer`, puis `"B"` avec `defer`, puis `"C"` avec `defer`. Enfin, affiche `"Direct"` sans defer. La sortie attendue est : `Direct`, `C`, `B`, `A`.',
      hints: [
        "Le dernier defer s'execute en premier (LIFO).",
        "Les instructions non-defer s'executent immediatement.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Place tes defer et ton affichage direct\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    defer fmt.Println("A")\n    defer fmt.Println("B")\n    defer fmt.Println("C")\n\n    fmt.Println("Direct")\n}',
      checks: [
        { label: "Utilise defer pour A", pattern: 'defer\\s+fmt\\.Println\\("A"\\)' },
        { label: "Utilise defer pour B", pattern: 'defer\\s+fmt\\.Println\\("B"\\)' },
        { label: "Utilise defer pour C", pattern: 'defer\\s+fmt\\.Println\\("C"\\)' },
        { label: "Affiche Direct sans defer", pattern: '\\n\\s*fmt\\.Println\\("Direct"\\)' },
      ],
    },
    {
      id: "g3-ex5",
      title: "Boucle avec break",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une boucle **infinie** (`for { ... }`) qui incremente un compteur a partir de 0. Quand le compteur atteint **10**, affiche sa valeur avec `fmt.Println` et sors de la boucle avec `break`.",
      hints: [
        "`for { ... }` est la boucle infinie de Go.",
        "Incremente le compteur a chaque iteration avec `compteur++`.",
        "Utilise `if compteur == 10 { break }` pour sortir.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    compteur := 0\n\n    // Boucle infinie avec break\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    compteur := 0\n\n    for {\n        compteur++\n        if compteur == 10 {\n            fmt.Println("Compteur atteint :", compteur)\n            break\n        }\n    }\n}',
      checks: [
        { label: "Utilise une boucle infinie (for {)", pattern: "for\\s*\\{" },
        { label: "Incremente le compteur", pattern: "compteur\\+\\+" },
        { label: "Teste compteur == 10", pattern: "compteur\\s*==\\s*10" },
        { label: "Utilise break", pattern: "\\bbreak\\b" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g3-ex6",
      title: "Switch sans expression",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris une fonction `decrireTemperature(t int) string` qui utilise un **switch sans expression** et retourne : `"Gel"` si t < 0, `"Froid"` si t < 10, `"Frais"` si t < 20, `"Agreable"` si t < 30, `"Chaud"` si t >= 30. Dans `main`, teste-la avec `32` et ajoute un `defer` qui affiche `"Fin du programme"`.',
      hints: [
        "Un switch sans expression : `switch { case t < 0: ... }`.",
        "Place le defer avant l'appel pour qu'il s'execute a la fin.",
        "Retourne la chaine au lieu de l'afficher.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Ecris la fonction decrireTemperature\n\nfunc main() {\n    defer fmt.Println("Fin du programme")\n\n    // Teste avec 32\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne une description de la temperature\nfunc decrireTemperature(t int) string {\n    switch {\n    case t < 0:\n        return "Gel"\n    case t < 10:\n        return "Froid"\n    case t < 20:\n        return "Frais"\n    case t < 30:\n        return "Agreable"\n    default:\n        return "Chaud"\n    }\n}\n\nfunc main() {\n    defer fmt.Println("Fin du programme")\n\n    fmt.Println(decrireTemperature(32))\n}',
      checks: [
        { label: "Declare la fonction decrireTemperature", pattern: "func\\s+decrireTemperature\\(" },
        { label: "Utilise un switch sans expression", pattern: "switch\\s*\\{" },
        { label: "Teste t < 0", pattern: "case\\s+t\\s*<\\s*0" },
        { label: "Teste t < 30 ou default", pattern: "case\\s+t\\s*<\\s*30|default" },
        { label: "Utilise defer", pattern: "defer\\s+fmt\\.Println" },
        { label: "Contient Chaud", pattern: "Chaud" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    cas := []struct {
        t    int
        want string
    }{
        {-10, "Gel"},
        {-1, "Gel"},
        {0, "Froid"},
        {5, "Froid"},
        {10, "Frais"},
        {19, "Frais"},
        {20, "Agreable"},
        {29, "Agreable"},
        {30, "Chaud"},
        {40, "Chaud"},
    }

    for _, c := range cas {
        got := decrireTemperature(c.t)
        if got != c.want {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrireTemperature(%d) = %q, attendu %q\\n", c.t, got, c.want)
            echecs++
        } else {
            fmt.Printf("OK: decrireTemperature(%d) = %q\\n", c.t, got)
        }
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
    id: "g3-projet",
    title: "Validateur de mot de passe",
    difficulty: "moyen",
    language: "go",
    prompt:
      'Ecris deux fonctions pour valider un mot de passe :\n\n1. `scoreMdp(mdp string) int` — retourne le nombre de regles validees (0 a 4) :\n   - Au moins **8 caracteres** (`len(mdp) >= 8`)\n   - Contient au moins **une majuscule** (`c >= \'A\' && c <= \'Z\'`)\n   - Contient au moins **un chiffre** (`c >= \'0\' && c <= \'9\'`)\n   - Contient au moins **un caractere special** parmi `!@#$%&*`\n\n2. `niveauSecurite(score int) string` — retourne `"Fort"` si score == 4, `"Moyen"` si score == 3, sinon `"Faible"` (utilise un **switch sans expression**).\n\nDans `main`, teste avec `"G0lang#2024"` et affiche le score et le niveau. Utilise `defer` pour afficher `"=== Fin de la validation ==="` en dernier.',
    hints: [
      "Parcours les caracteres avec `for _, c := range mdp`.",
      "Pour tester une majuscule : `c >= 'A' && c <= 'Z'`.",
      "Pour tester un chiffre : `c >= '0' && c <= '9'`.",
      "Compte le nombre de regles validees dans un entier, puis utilise switch.",
    ],
    starter:
      'package main\n\nimport "fmt"\n\n// Ecris scoreMdp et niveauSecurite\n\nfunc main() {\n    mdp := "G0lang#2024"\n    defer fmt.Println("=== Fin de la validation ===")\n\n    // Calcule le score et affiche le niveau\n}',
    solution:
      'package main\n\nimport "fmt"\n\n// Retourne le nombre de regles validees (0 a 4)\nfunc scoreMdp(mdp string) int {\n    aLongueur := len(mdp) >= 8\n    aMajuscule := false\n    aChiffre := false\n    aSpecial := false\n\n    for _, c := range mdp {\n        if c >= \'A\' && c <= \'Z\' {\n            aMajuscule = true\n        }\n        if c >= \'0\' && c <= \'9\' {\n            aChiffre = true\n        }\n        switch c {\n        case \'!\', \'@\', \'#\', \'$\', \'%\', \'&\', \'*\':\n            aSpecial = true\n        }\n    }\n\n    score := 0\n    if aLongueur { score++ }\n    if aMajuscule { score++ }\n    if aChiffre { score++ }\n    if aSpecial { score++ }\n    return score\n}\n\n// Retourne le niveau de securite\nfunc niveauSecurite(score int) string {\n    switch {\n    case score == 4:\n        return "Fort"\n    case score == 3:\n        return "Moyen"\n    default:\n        return "Faible"\n    }\n}\n\nfunc main() {\n    mdp := "G0lang#2024"\n    defer fmt.Println("=== Fin de la validation ===")\n\n    s := scoreMdp(mdp)\n    fmt.Println("Score :", s, "/ 4")\n    fmt.Println("Niveau :", niveauSecurite(s))\n}',
    checks: [
      { label: "Declare le package main", pattern: "package\\s+main" },
      { label: "Declare la fonction scoreMdp", pattern: "func\\s+scoreMdp\\(" },
      { label: "Declare la fonction niveauSecurite", pattern: "func\\s+niveauSecurite\\(" },
      { label: "Utilise defer", pattern: "defer\\s+fmt\\.Println" },
      { label: "Boucle sur les caracteres avec range", pattern: "for\\s+_\\s*,\\s*\\w+\\s*:=\\s*range" },
      { label: "Teste les majuscules", pattern: ">=\\s*'A'\\s*&&.*<=\\s*'Z'" },
      { label: "Teste les chiffres", pattern: ">=\\s*'0'\\s*&&.*<=\\s*'9'" },
      { label: "Utilise un switch sans expression", pattern: "switch\\s*\\{" },
    ],
    tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test scoreMdp
    casScore := []struct {
        mdp  string
        want int
    }{
        {"G0lang#2024", 4},
        {"abc", 0},
        {"abcdefgh", 1},
        {"Abcdefgh", 2},
        {"A1cdefgh", 3},
        {"A1#defgh", 4},
        {"short", 0},
        {"ALLCAPS!", 3},
    }

    for _, c := range casScore {
        got := scoreMdp(c.mdp)
        if got != c.want {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: scoreMdp(%q) = %d, attendu %d\\n", c.mdp, got, c.want)
            echecs++
        } else {
            fmt.Printf("OK: scoreMdp(%q) = %d\\n", c.mdp, got)
        }
    }

    // Test niveauSecurite
    casNiveau := []struct {
        score int
        want  string
    }{
        {4, "Fort"},
        {3, "Moyen"},
        {2, "Faible"},
        {1, "Faible"},
        {0, "Faible"},
    }

    for _, c := range casNiveau {
        got := niveauSecurite(c.score)
        if got != c.want {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: niveauSecurite(%d) = %q, attendu %q\\n", c.score, got, c.want)
            echecs++
        } else {
            fmt.Printf("OK: niveauSecurite(%d) = %q\\n", c.score, got)
        }
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
    "`if` n'a pas de parentheses mais les accolades sont obligatoires ; l'init dans le `if` (`if v := ...; cond`) limite la portee.",
    "`for` est la **seule boucle** de Go : `for init; cond; post`, `for cond` (while) et `for` (infinie).",
    "Le `switch` de Go n'a pas de fall-through par defaut. Il supporte les multi-valeurs, l'absence d'expression et le type switch.",
    "`defer` planifie un appel a la sortie de la fonction, en ordre **LIFO**. Ideal pour le nettoyage (fichiers, verrous, connexions).",
    "`break` sort de la boucle ; `continue` saute a l'iteration suivante ; les labels permettent de cibler une boucle externe.",
  ],
};
