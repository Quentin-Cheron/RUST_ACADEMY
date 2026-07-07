import type { Chapter } from "../../types";

export const g05: Chapter = {
  number: 5,
  slug: "slices-maps",
  title: "Tableaux, slices et maps",
  subtitle:
    "Maîtriser les collections natives de Go : tableaux à taille fixe, slices dynamiques et maps clé-valeur.",
  description:
    "Go propose trois structures de données fondamentales pour regrouper des valeurs. Les tableaux ont une taille fixe connue à la compilation. Les slices sont des vues dynamiques sur un tableau sous-jacent — on les utilise partout. Les maps associent des clés à des valeurs et offrent un accès en O(1). Ce chapitre couvre la création, la manipulation et l'itération sur ces trois types avec le mot-clé `range`.",
  minutes: 35,
  rustBookRef: "Go Tour — Slices, Maps",
  objectives: [
    "Déclarer et utiliser un tableau à taille fixe",
    "Créer un slice avec make, l'agrandir avec append et comprendre len/cap",
    "Manipuler une map : ajout, lecture, suppression et pattern comma-ok",
    "Itérer sur un slice et une map avec range",
  ],
  sections: [
    {
      id: "tableaux",
      number: "5.1",
      title: "Tableaux (arrays)",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, un tableau a une **taille fixe** qui fait partie de son type. `[5]int` et `[3]int` sont deux types distincts. On les utilise rarement directement — les slices sont bien plus courants — mais il faut comprendre qu'un slice repose sur un tableau sous-jacent.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Déclaration avec taille explicite
    var notes [5]int                    // [0 0 0 0 0] — valeurs zéro
    notes[0] = 18
    notes[1] = 15

    // Déclaration avec initialisation littérale
    jours := [3]string{"lun", "mar", "mer"}

    // Taille inférée avec [...]
    premiers := [...]int{2, 3, 5, 7, 11}

    fmt.Println(notes)                  // [18 15 0 0 0]
    fmt.Println(jours)                  // [lun mar mer]
    fmt.Println(len(premiers))          // 5
}`,
          caption:
            "Un tableau a une taille fixe connue à la compilation.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Assigner un tableau à une autre variable **copie toutes les valeurs**. Contrairement aux slices, il n'y a pas de partage de mémoire entre deux tableaux.",
        },
      ],
    },
    {
      id: "slices",
      number: "5.2",
      title: "Slices",
      blocks: [
        {
          type: "paragraph",
          text: "Un **slice** est une référence flexible vers une portion de tableau. Il a trois propriétés : un pointeur vers le premier élément, une longueur (`len`) et une capacité (`cap`). On crée un slice avec `make`, un littéral, ou en découpant un tableau existant.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Créer un slice avec make(type, longueur, capacité)
    s := make([]int, 3, 5)          // len=3, cap=5
    fmt.Println(s, len(s), cap(s))  // [0 0 0] 3 5

    // Littéral de slice (pas de taille entre [])
    fruits := []string{"pomme", "banane", "cerise"}

    // append ajoute des éléments et agrandit si nécessaire
    fruits = append(fruits, "datte", "figue")
    fmt.Println(fruits)             // [pomme banane cerise datte figue]

    // Slicing : [début:fin) — fin est exclu
    sub := fruits[1:3]              // [banane cerise]
    fmt.Println(sub)
}`,
          caption:
            "Les slices sont les collections dynamiques de Go.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Croissance d'un slice",
          text: "Quand `append` dépasse la capacité, Go alloue un nouveau tableau sous-jacent (environ le double de la capacité précédente) et copie les éléments. C'est pourquoi on récupère toujours le résultat : `s = append(s, v)`.",
        },
        {
          type: "code",
          language: "go",
          code: `// Observer la croissance de capacité
s := []int{}
for i := 0; i < 10; i++ {
    s = append(s, i)
    fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))
}
// len=1 cap=1
// len=2 cap=2
// len=3 cap=4   ← doublement
// len=4 cap=4
// len=5 cap=8   ← doublement
// ...`,
          caption:
            "La capacité double quand le slice doit s'agrandir.",
        },
      ],
    },
    {
      id: "maps",
      number: "5.3",
      title: "Maps",
      blocks: [
        {
          type: "paragraph",
          text: "Une **map** associe des clés à des valeurs, comme un dictionnaire. Les clés doivent être comparables (`string`, `int`, etc.). On crée une map avec `make` ou un littéral.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Créer une map avec make
    ages := make(map[string]int)
    ages["Alice"] = 30
    ages["Bob"] = 25

    // Littéral de map
    capitales := map[string]string{
        "France":   "Paris",
        "Espagne":  "Madrid",
        "Italie":   "Rome",
    }

    // Lecture avec le pattern comma-ok
    ville, ok := capitales["France"]    // "Paris", true
    fmt.Println(ville, ok)

    _, ok = capitales["Japon"]          // "", false
    fmt.Println(ok)

    // Suppression
    delete(capitales, "Espagne")
    fmt.Println(capitales)              // map[France:Paris Italie:Rome]
}`,
          caption:
            "CRUD sur une map : ajout, lecture (comma-ok), suppression.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Le pattern comma-ok",
          text: "Quand on lit une clé absente, Go renvoie la valeur zéro du type. Pour distinguer « clé absente » de « valeur zéro réelle », on utilise la deuxième valeur de retour : `v, ok := m[key]`. Si `ok` est `false`, la clé n'existe pas.",
        },
      ],
    },
    {
      id: "range",
      number: "5.4",
      title: "Itérer avec range",
      blocks: [
        {
          type: "paragraph",
          text: "Le mot-clé `range` permet d'itérer sur un slice, un tableau, une map ou une chaîne. Il renvoie deux valeurs : l'index (ou la clé) et la valeur.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    // Range sur un slice : index + valeur
    couleurs := []string{"rouge", "vert", "bleu"}
    for i, c := range couleurs {
        fmt.Printf("%d: %s\\n", i, c)
    }

    // Ignorer l'index avec _
    for _, c := range couleurs {
        fmt.Println(c)
    }

    // Range sur une map : clé + valeur
    scores := map[string]int{"Alice": 95, "Bob": 82}
    for nom, score := range scores {
        fmt.Printf("%s a %d points\\n", nom, score)
    }
}`,
          caption:
            "range fonctionne sur les slices, maps et strings.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "L'ordre d'itération sur une map est **non déterministe** en Go. Ne comptez pas sur un ordre particulier entre deux exécutions.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g5-ex1",
      title: "Créer un tableau",
      difficulty: "facile",
      language: "go",
      prompt:
        "Déclare un tableau `nombres` de 4 entiers contenant les valeurs `10, 20, 30, 40` et affiche-le avec `fmt.Println`.",
      hints: [
        "Un tableau à taille fixe se déclare avec `[4]int{...}`.",
        "Tu peux utiliser `:=` pour la déclaration courte.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Déclare le tableau nombres ici

    fmt.Println(nombres)
}`,
      solution: `package main

import "fmt"

func main() {
    // Tableau de 4 entiers
    nombres := [4]int{10, 20, 30, 40}

    fmt.Println(nombres) // [10 20 30 40]
}`,
      checks: [
        { label: "Déclare un tableau [4]int", pattern: "\\[4\\]int" },
        { label: "Contient les valeurs 10, 20, 30, 40", pattern: "10.*20.*30.*40" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
    {
      id: "g5-ex2",
      title: "Append sur un slice",
      difficulty: "facile",
      language: "go",
      prompt:
        "Crée un slice `fruits` contenant `\"pomme\"` et `\"banane\"`. Ajoute `\"cerise\"` et `\"datte\"` avec `append`, puis affiche le slice et sa longueur.",
      hints: [
        "Un slice littéral : `[]string{\"pomme\", \"banane\"}`.",
        "`append` peut recevoir plusieurs éléments : `append(s, a, b)`.",
        "La longueur s'obtient avec `len(s)`.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Crée le slice fruits

    // Ajoute cerise et datte

    fmt.Println(fruits, len(fruits))
}`,
      solution: `package main

import "fmt"

func main() {
    // Crée le slice fruits
    fruits := []string{"pomme", "banane"}

    // Ajoute cerise et datte
    fruits = append(fruits, "cerise", "datte")

    fmt.Println(fruits, len(fruits)) // [pomme banane cerise datte] 4
}`,
      checks: [
        { label: "Utilise un slice []string", pattern: "\\[\\]string" },
        { label: "Utilise append", pattern: "append\\(" },
        { label: "Contient cerise et datte", pattern: "cerise.*datte" },
        { label: "Affiche la longueur avec len", pattern: "len\\(" },
      ],
    },
    {
      id: "g5-ex3",
      title: "CRUD sur une map",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Crée une map `scores` de type `map[string]int` avec les entrées `\"Alice\": 95` et `\"Bob\": 82`. Ajoute `\"Charlie\": 78`, supprime `\"Bob\"`, puis vérifie si `\"Bob\"` existe avec le pattern **comma-ok** et affiche le résultat.",
      hints: [
        "Créer : `scores := map[string]int{...}`.",
        "Ajouter : `scores[\"Charlie\"] = 78`.",
        "Supprimer : `delete(scores, \"Bob\")`.",
        "Vérifier : `_, ok := scores[\"Bob\"]`.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Crée la map scores

    // Ajoute Charlie

    // Supprime Bob

    // Vérifie si Bob existe
}`,
      solution: `package main

import "fmt"

func main() {
    // Crée la map scores
    scores := map[string]int{
        "Alice": 95,
        "Bob":   82,
    }

    // Ajoute Charlie
    scores["Charlie"] = 78

    // Supprime Bob
    delete(scores, "Bob")

    // Vérifie si Bob existe (comma-ok)
    _, ok := scores["Bob"]
    fmt.Println("Bob existe ?", ok) // Bob existe ? false
}`,
      checks: [
        { label: "Déclare map[string]int", pattern: "map\\[string\\]int" },
        { label: "Ajoute Charlie", pattern: "scores\\[.Charlie.\\]\\s*=" },
        { label: "Supprime avec delete", pattern: "delete\\(scores" },
        { label: "Utilise le pattern comma-ok", pattern: ",\\s*ok\\s*:=\\s*scores" },
      ],
    },
    {
      id: "g5-ex4",
      title: "Filtrer un slice (garder les pairs)",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Écris une fonction `pairs(nombres []int) []int` qui renvoie un nouveau slice contenant uniquement les nombres **pairs**. Teste-la avec `[]int{1, 2, 3, 4, 5, 6}` et affiche le résultat.",
      hints: [
        "Un nombre est pair si `n % 2 == 0`.",
        "Commence par un slice vide `var result []int` et utilise `append`.",
        "Itère avec `range`.",
      ],
      starter: `package main

import "fmt"

// Renvoie uniquement les nombres pairs
func pairs(nombres []int) []int {
    // À compléter
}

func main() {
    fmt.Println(pairs([]int{1, 2, 3, 4, 5, 6}))
}`,
      solution: `package main

import "fmt"

// Renvoie uniquement les nombres pairs
func pairs(nombres []int) []int {
    var result []int
    for _, n := range nombres {
        if n%2 == 0 { // ne garder que les pairs
            result = append(result, n)
        }
    }
    return result
}

func main() {
    fmt.Println(pairs([]int{1, 2, 3, 4, 5, 6})) // [2 4 6]
}`,
      checks: [
        { label: "Fonction pairs avec paramètre []int", pattern: "func\\s+pairs\\(.*\\[\\]int" },
        { label: "Utilise range pour itérer", pattern: "range\\s+nombres" },
        { label: "Teste la parité avec % 2", pattern: "%\\s*2\\s*==\\s*0" },
        { label: "Utilise append pour construire le résultat", pattern: "append\\(" },
        { label: "Retourne un []int", pattern: "return\\s+result|return\\s+\\w+" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func sliceEqual(a, b []int) bool {
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

    // Test 1 : pairs([1,2,3,4,5,6]) = [2,4,6]
    if got := pairs([]int{1, 2, 3, 4, 5, 6}); !sliceEqual(got, []int{2, 4, 6}) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: pairs([1,2,3,4,5,6]) = %v, attendu [2 4 6]\\n", got)
        echecs++
    } else {
        fmt.Println("OK: pairs([1,2,3,4,5,6]) =", got)
    }

    // Test 2 : pairs([1,3,5]) = [] (aucun pair)
    if got := pairs([]int{1, 3, 5}); len(got) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: pairs([1,3,5]) = %v, attendu []\\n", got)
        echecs++
    } else {
        fmt.Println("OK: pairs([1,3,5]) = [] (vide)")
    }

    // Test 3 : pairs([2,4,8]) = [2,4,8] (tous pairs)
    if got := pairs([]int{2, 4, 8}); !sliceEqual(got, []int{2, 4, 8}) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: pairs([2,4,8]) = %v, attendu [2 4 8]\\n", got)
        echecs++
    } else {
        fmt.Println("OK: pairs([2,4,8]) =", got)
    }

    // Test 4 : pairs([]) = [] (slice vide)
    if got := pairs([]int{}); len(got) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: pairs([]) = %v, attendu []\\n", got)
        echecs++
    } else {
        fmt.Println("OK: pairs([]) = [] (vide)")
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
      id: "g5-ex5",
      title: "Range avec index",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Écris un programme qui utilise `range` pour itérer sur le slice `[\"Go\", \"Rust\", \"Python\", \"Java\"]` et affiche chaque élément avec son index sous la forme `0: Go`, `1: Rust`, etc. Utilise `fmt.Printf`.",
      hints: [
        "`range` renvoie l'index et la valeur : `for i, v := range s`.",
        "Le format pour Printf : `\"%d: %s\\n\"`.",
      ],
      starter: `package main

import "fmt"

func main() {
    langages := []string{"Go", "Rust", "Python", "Java"}

    // Itère avec range et affiche index: valeur
}`,
      solution: `package main

import "fmt"

func main() {
    langages := []string{"Go", "Rust", "Python", "Java"}

    // Itère avec range et affiche index: valeur
    for i, l := range langages {
        fmt.Printf("%d: %s\\n", i, l)
    }
}`,
      checks: [
        { label: "Utilise range pour itérer", pattern: "range\\s+langages" },
        { label: "Capture l'index et la valeur", pattern: "\\w+\\s*,\\s*\\w+\\s*:=\\s*range" },
        { label: "Utilise fmt.Printf", pattern: "fmt\\.Printf" },
        { label: "Format avec %d et %s", pattern: "%d.*%s" },
      ],
    },
    {
      id: "g5-ex6",
      title: "Inverser un slice",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Écris une fonction `inverser(s []int) []int` qui renvoie un **nouveau** slice avec les éléments dans l'ordre inverse. Teste avec `[]int{1, 2, 3, 4, 5}`.",
      hints: [
        "Parcours le slice de la fin vers le début.",
        "Ou utilise deux indices qui se rapprochent du centre.",
        "Crée un nouveau slice de même longueur avec `make([]int, len(s))`.",
      ],
      starter: `package main

import "fmt"

func inverser(s []int) []int {
    // À compléter
}

func main() {
    fmt.Println(inverser([]int{1, 2, 3, 4, 5}))
}`,
      solution: `package main

import "fmt"

func inverser(s []int) []int {
    n := len(s)
    result := make([]int, n) // nouveau slice de même taille
    for i, v := range s {
        result[n-1-i] = v // placer chaque élément en position miroir
    }
    return result
}

func main() {
    fmt.Println(inverser([]int{1, 2, 3, 4, 5})) // [5 4 3 2 1]
}`,
      checks: [
        { label: "Fonction inverser avec paramètre []int", pattern: "func\\s+inverser\\(.*\\[\\]int" },
        { label: "Crée un nouveau slice (make ou littéral)", pattern: "make\\(\\[\\]int|\\[\\]int\\{" },
        { label: "Utilise len(s)", pattern: "len\\(s\\)" },
        { label: "Retourne le résultat", pattern: "return" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func sliceEqual(a, b []int) bool {
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

    // Test 1 : inverser([1,2,3,4,5]) = [5,4,3,2,1]
    if got := inverser([]int{1, 2, 3, 4, 5}); !sliceEqual(got, []int{5, 4, 3, 2, 1}) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: inverser([1,2,3,4,5]) = %v, attendu [5 4 3 2 1]\\n", got)
        echecs++
    } else {
        fmt.Println("OK: inverser([1,2,3,4,5]) =", got)
    }

    // Test 2 : inverser([10,20]) = [20,10]
    if got := inverser([]int{10, 20}); !sliceEqual(got, []int{20, 10}) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: inverser([10,20]) = %v, attendu [20 10]\\n", got)
        echecs++
    } else {
        fmt.Println("OK: inverser([10,20]) =", got)
    }

    // Test 3 : inverser([42]) = [42] (un seul élément)
    if got := inverser([]int{42}); !sliceEqual(got, []int{42}) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: inverser([42]) = %v, attendu [42]\\n", got)
        echecs++
    } else {
        fmt.Println("OK: inverser([42]) =", got)
    }

    // Test 4 : inverser([]) = [] (slice vide)
    if got := inverser([]int{}); len(got) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: inverser([]) = %v, attendu []\\n", got)
        echecs++
    } else {
        fmt.Println("OK: inverser([]) = [] (vide)")
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
    id: "g5-projet",
    title: "Compteur de mots",
    difficulty: "difficile",
    language: "go",
    prompt:
      "Écris une fonction `compterMots(texte string) map[string]int` qui découpe une chaîne en mots (séparés par des espaces) et renvoie une map avec chaque mot en minuscule comme clé et son nombre d'occurrences comme valeur. Utilise `strings.Fields` pour découper et `strings.ToLower` pour normaliser. Teste avec la phrase `\"Go est simple Go est rapide\"`.",
    hints: [
      "`strings.Fields(s)` découpe une chaîne par les espaces et renvoie un `[]string`.",
      "`strings.ToLower(s)` convertit en minuscules.",
      "Pour compter : `compteur[mot]++` incrémente automatiquement (la valeur zéro d'un int est 0).",
      "N'oublie pas d'importer le package `strings`.",
    ],
    starter: `package main

import (
    "fmt"
    "strings"
)

// Compte les occurrences de chaque mot (en minuscule)
func compterMots(texte string) map[string]int {
    // À compléter
}

func main() {
    resultat := compterMots("Go est simple Go est rapide")
    fmt.Println(resultat)
}`,
    solution: `package main

import (
    "fmt"
    "strings"
)

// Compte les occurrences de chaque mot (en minuscule)
func compterMots(texte string) map[string]int {
    compteur := make(map[string]int) // map vide pour stocker les comptes
    mots := strings.Fields(texte)    // découpe par espaces
    for _, mot := range mots {
        mot = strings.ToLower(mot)   // normalise en minuscules
        compteur[mot]++              // incrémente (valeur zéro = 0)
    }
    return compteur
}

func main() {
    resultat := compterMots("Go est simple Go est rapide")
    fmt.Println(resultat) // map[est:2 go:2 rapide:1 simple:1]
}`,
    checks: [
      { label: "Fonction compterMots retourne map[string]int", pattern: "func\\s+compterMots\\(.*\\)\\s*map\\[string\\]int" },
      { label: "Utilise strings.Fields pour découper", pattern: "strings\\.Fields" },
      { label: "Utilise strings.ToLower pour normaliser", pattern: "strings\\.ToLower" },
      { label: "Crée une map avec make", pattern: "make\\(map\\[string\\]int\\)" },
      { label: "Incrémente le compteur", pattern: "compteur\\[.*\\]\\+\\+|\\w+\\[.*\\]\\+\\+" },
      { label: "Retourne la map", pattern: "return\\s+compteur|return\\s+\\w+" },
    ],
    tests: `package main

import (
    "fmt"
    "os"
    "strings"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : "Go est simple Go est rapide"
    got1 := compterMots("Go est simple Go est rapide")
    attendu1 := map[string]int{"go": 2, "est": 2, "simple": 1, "rapide": 1}
    for k, v := range attendu1 {
        if got1[k] != v {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: compterMots(\"Go est simple Go est rapide\")[%q] = %d, attendu %d\\n", k, got1[k], v)
            echecs++
        } else {
            fmt.Printf("OK: compterMots(...)[%q] = %d\\n", k, v)
        }
    }
    if len(got1) != len(attendu1) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: len(résultat) = %d, attendu %d\\n", len(got1), len(attendu1))
        echecs++
    }

    // Test 2 : "Bonjour bonjour BONJOUR"
    got2 := compterMots("Bonjour bonjour BONJOUR")
    if got2["bonjour"] != 3 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: compterMots(\"Bonjour bonjour BONJOUR\")[\"bonjour\"] = %d, attendu 3\\n", got2["bonjour"])
        echecs++
    } else {
        fmt.Println("OK: compterMots(\"Bonjour bonjour BONJOUR\")[\"bonjour\"] = 3")
    }

    // Test 3 : chaîne vide
    got3 := compterMots("")
    if len(got3) != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: compterMots(\"\") devrait être vide, obtenu %v\\n", got3)
        echecs++
    } else {
        fmt.Println("OK: compterMots(\"\") = map vide")
    }

    // Empêche l'erreur d'import inutilisé
    _ = strings.Fields

    fmt.Println()
    if echecs > 0 {
        fmt.Fprintf(os.Stderr, "%d test(s) échoué(s)\\n", echecs)
        os.Exit(1)
    }
    fmt.Println("Tous les tests passent !")
}`,
  },
  keyTakeaways: [
    "Un tableau `[N]T` a une taille fixe qui fait partie de son type ; un slice `[]T` est dynamique et bien plus utilisé en pratique.",
    "`append(s, v)` agrandit un slice — toujours récupérer le résultat car le tableau sous-jacent peut changer.",
    "Une map `map[K]V` offre un accès O(1) ; le pattern `v, ok := m[key]` distingue clé absente et valeur zéro.",
    "`range` itère sur slices (index, valeur) et maps (clé, valeur) — l'ordre sur une map est non déterministe.",
    "`make` crée des slices et maps vides avec une capacité initiale optionnelle.",
  ],
};
