import type { Chapter } from "../../types";

export const g12: Chapter = {
  number: 12,
  slug: "tests",
  title: "Tests en Go",
  subtitle:
    "Ecrire des tests unitaires, des benchmarks et des tests d'exemple avec le package testing.",
  description:
    "Go integre un framework de test directement dans le langage et la toolchain. Pas besoin d'installer une bibliotheque externe : il suffit de creer un fichier `_test.go`, d'ecrire des fonctions `TestXxx(t *testing.T)` et de lancer `go test`. Ce chapitre couvre les tests unitaires, les tests tabulaires (table-driven), les subtests avec `t.Run`, les benchmarks et les commandes `go test`.",
  minutes: 30,
  rustBookRef: "Go Tour -- Testing",
  objectives: [
    "Ecrire des tests unitaires avec func TestXxx(t *testing.T)",
    "Appliquer le pattern des tests tabulaires (table-driven tests)",
    "Organiser les tests avec des subtests (t.Run)",
    "Ecrire des benchmarks avec func BenchmarkXxx(b *testing.B)",
    "Utiliser les options de go test : -v, -run, -cover, -bench",
  ],
  sections: [
    {
      id: "tests-unitaires",
      number: "12.1",
      title: "Tests unitaires",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, les tests vivent dans des fichiers qui se terminent par `_test.go`, dans le meme package que le code teste. Chaque fonction de test commence par `Test` (majuscule) et prend un parametre `*testing.T`.",
        },
        {
          type: "code",
          language: "go",
          code: `// math.go
package mathutil

func Add(a, b int) int {
    return a + b
}

func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}`,
          filename: "math.go",
          caption: "Le code a tester : deux fonctions simples.",
        },
        {
          type: "code",
          language: "go",
          code: `// math_test.go
package mathutil

import "testing"

func TestAdd(t *testing.T) {
    got := Add(2, 3)
    want := 5
    if got != want {
        t.Errorf("Add(2, 3) = %d, want %d", got, want)
    }
}

func TestAbs(t *testing.T) {
    got := Abs(-7)
    want := 7
    if got != want {
        t.Errorf("Abs(-7) = %d, want %d", got, want)
    }
}`,
          filename: "math_test.go",
          caption:
            "Les tests : meme package, fichier _test.go, fonctions TestXxx.",
        },
        {
          type: "paragraph",
          text: "Les methodes principales de `*testing.T` pour signaler les echecs sont :",
        },
        {
          type: "list",
          items: [
            "**`t.Error(args...)`** / **`t.Errorf(format, args...)`** : signale un echec mais continue le test.",
            "**`t.Fatal(args...)`** / **`t.Fatalf(format, args...)`** : signale un echec et arrete le test immediatement.",
            "**`t.Log(args...)`** / **`t.Logf(format, args...)`** : affiche un message (visible avec `-v`).",
            "**`t.Skip(args...)`** : saute le test (utile pour les tests conditionnels).",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Pas d'assertions built-in",
          text: "Contrairement a d'autres langages, Go n'a pas de `assert.Equal`. On utilise des `if` classiques et `t.Errorf`. C'est un choix delibere pour garder le code explicite. Des bibliotheques comme `testify` ajoutent des assertions si tu preferes.",
        },
      ],
    },
    {
      id: "tests-tabulaires",
      number: "12.2",
      title: "Tests tabulaires",
      blocks: [
        {
          type: "paragraph",
          text: "Les **table-driven tests** sont le pattern le plus idiomatique en Go. On definit un slice de cas de test (chacun avec un nom, des entrees et le resultat attendu), puis on boucle dessus. Ca evite la duplication et facilite l'ajout de nouveaux cas.",
        },
        {
          type: "code",
          language: "go",
          code: `package mathutil

import "testing"

func TestAdd_TableDriven(t *testing.T) {
    tests := []struct {
        name string
        a, b int
        want int
    }{
        {"positifs", 2, 3, 5},
        {"negatifs", -1, -2, -3},
        {"zero", 0, 0, 0},
        {"mixte", -5, 10, 5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.want {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
            }
        })
    }
}`,
          caption:
            "Table-driven test avec t.Run : chaque cas est un subtest nomme.",
        },
        {
          type: "heading",
          level: 3,
          text: "Subtests avec t.Run",
        },
        {
          type: "paragraph",
          text: "`t.Run(name, func)` cree un **subtest** nomme. Les subtests permettent de :",
        },
        {
          type: "list",
          items: [
            "Identifier precisement quel cas echoue dans la sortie.",
            "Filtrer avec `go test -run TestAdd/positifs` pour executer un seul cas.",
            "Paralleliser les subtests avec `t.Parallel()`.",
          ],
        },
        {
          type: "code",
          language: "go",
          code: `func TestAbs_SubTests(t *testing.T) {
    t.Run("positif", func(t *testing.T) {
        if Abs(5) != 5 {
            t.Error("Abs(5) devrait valoir 5")
        }
    })
    t.Run("negatif", func(t *testing.T) {
        if Abs(-5) != 5 {
            t.Error("Abs(-5) devrait valoir 5")
        }
    })
    t.Run("zero", func(t *testing.T) {
        if Abs(0) != 0 {
            t.Error("Abs(0) devrait valoir 0")
        }
    })
}`,
          caption:
            "Subtests explicites : chaque cas a son propre t.Run.",
        },
        {
          type: "usecase",
          title: "Ajouter un cas de test en 10 secondes",
          text: "Avec un test tabulaire, ajouter un nouveau cas se resume a une ligne dans le slice : `{\"grand nombre\", 1000000, -1000000, 0}`. Pas besoin d'ecrire une nouvelle fonction ou de copier-coller du code.",
        },
      ],
    },
    {
      id: "benchmarks",
      number: "12.3",
      title: "Benchmarks",
      blocks: [
        {
          type: "paragraph",
          text: "Go integre aussi les benchmarks dans le package `testing`. Une fonction benchmark commence par `Benchmark`, prend un `*testing.B`, et execute le code a mesurer dans une boucle `for i := 0; i < b.N; i++`.",
        },
        {
          type: "code",
          language: "go",
          code: `package mathutil

import "testing"

func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(42, 58)
    }
}

func BenchmarkAbs(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Abs(-42)
    }
}`,
          filename: "math_test.go",
          caption:
            "b.N est ajuste automatiquement par Go pour obtenir une mesure fiable.",
        },
        {
          type: "code",
          language: "bash",
          code: `$ go test -bench=.
BenchmarkAdd-8    1000000000    0.2500 ns/op
BenchmarkAbs-8    1000000000    0.5100 ns/op`,
          caption:
            "Resultat : nombre d'iterations et duree par operation.",
        },
        {
          type: "paragraph",
          text: "Go ajuste `b.N` automatiquement pour obtenir une mesure stable. Plus la fonction est rapide, plus `b.N` est grand.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Utilise `b.ResetTimer()` si tu as du setup couteux avant la boucle de benchmark. Ca evite de mesurer le temps d'initialisation.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Attention : le compilateur Go peut optimiser les appels dont le resultat n'est pas utilise. Pour eviter ca, assigne le resultat a une variable de package (`var result int`) et utilise-la : `result = Add(42, 58)`.",
        },
      ],
    },
    {
      id: "go-test",
      number: "12.4",
      title: "go test",
      blocks: [
        {
          type: "paragraph",
          text: "La commande `go test` execute tous les tests du package courant. Voici les options les plus utilisees :",
        },
        {
          type: "code",
          language: "bash",
          code: `# Lancer tous les tests du package courant
go test

# Mode verbeux : affiche chaque test et son resultat
go test -v

# Lancer tous les tests de tous les packages
go test ./...

# Filtrer par nom de test (regexp)
go test -run TestAdd
go test -run TestAdd/positifs   # subtest specifique

# Couverture de code
go test -cover
go test -coverprofile=cover.out
go tool cover -html=cover.out   # ouvre un rapport HTML

# Benchmarks
go test -bench=.
go test -bench=BenchmarkAdd -benchmem   # inclut les allocations`,
          caption:
            "Les commandes go test essentielles.",
        },
        {
          type: "list",
          items: [
            "**`go test`** : lance les tests du package courant.",
            "**`-v`** : mode verbeux, affiche chaque test.",
            "**`./...`** : tous les packages recursivement.",
            "**`-run <regexp>`** : filtre les tests par nom.",
            "**`-cover`** : affiche le pourcentage de couverture.",
            "**`-bench=<regexp>`** : lance les benchmarks (`.` = tous).",
            "**`-benchmem`** : affiche les allocations memoire dans les benchmarks.",
            "**`-count=N`** : repete les tests N fois (utile pour detecter les flaky tests).",
          ],
        },
        {
          type: "usecase",
          title: "Integration continue",
          text: "Dans un pipeline CI, on lance generalement `go test -v -cover ./...` pour tester tous les packages avec la couverture. Si le pourcentage de couverture descend en dessous d'un seuil, le pipeline echoue. C'est aussi simple que ca -- pas de config XML ni de plugin a installer.",
        },
        {
          type: "callout",
          variant: "info",
          title: "TestMain pour le setup global",
          text: "Si tu as besoin d'un setup/teardown global (demarrer une DB, etc.), definis `func TestMain(m *testing.M)` dans ton fichier de test. Fais le setup, appelle `os.Exit(m.Run())`, puis le teardown. C'est le point d'entree des tests du package.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g12-ex1",
      title: "Ecrire un TestAdd",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris une fonction de test `TestMultiply` qui teste une fonction `Multiply(a, b int) int`. Verifie que `Multiply(3, 4)` retourne `12`. Utilise `t.Errorf` pour signaler l\'echec avec le message `"Multiply(3, 4) = %d, want 12"`. Inclus le package et l\'import.',
      hints: [
        "Le fichier de test doit etre dans le meme package.",
        "Le parametre est *testing.T.",
        "Compare got et want avec un if.",
      ],
      starter: `package mathutil

import "testing"

// Ecris TestMultiply ici
`,
      solution: `package mathutil

import "testing"

func TestMultiply(t *testing.T) {
    got := Multiply(3, 4)
    want := 12
    if got != want {
        t.Errorf("Multiply(3, 4) = %d, want 12", got)
    }
}`,
      checks: [
        { label: "Package mathutil", pattern: "package\\s+mathutil" },
        { label: 'Importe "testing"', pattern: '"testing"' },
        { label: "Fonction TestMultiply", pattern: "func\\s+TestMultiply\\(t\\s+\\*testing\\.T\\)" },
        { label: "Appelle Multiply(3, 4)", pattern: "Multiply\\(3,\\s*4\\)" },
        { label: "Compare got et want", pattern: "got\\s*!=\\s*want|want\\s*!=\\s*got" },
        { label: "Utilise t.Errorf", pattern: "t\\.Errorf\\(" },
      ],
    },
    {
      id: "g12-ex2",
      title: "Test tabulaire",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un test tabulaire `TestAbs` pour une fonction `Abs(n int) int`. Definis au moins 3 cas de test dans un slice de structs avec les champs `name string`, `input int` et `want int`. Les cas doivent couvrir : un nombre positif, un nombre negatif et zero. Utilise `t.Run` pour les subtests.',
      hints: [
        "Definis le slice avec []struct{ name string; input int; want int }.",
        "Boucle avec for _, tt := range tests.",
        "Chaque cas est un subtest via t.Run(tt.name, func(t *testing.T) { ... }).",
      ],
      starter: `package mathutil

import "testing"

func TestAbs(t *testing.T) {
    tests := []struct {
        // Definis les champs
    }{
        // Ajoute au moins 3 cas
    }

    for _, tt := range tests {
        // Lance chaque cas avec t.Run
    }
}`,
      solution: `package mathutil

import "testing"

func TestAbs(t *testing.T) {
    tests := []struct {
        name  string
        input int
        want  int
    }{
        {"positif", 5, 5},
        {"negatif", -7, 7},
        {"zero", 0, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Abs(tt.input)
            if got != tt.want {
                t.Errorf("Abs(%d) = %d, want %d", tt.input, got, tt.want)
            }
        })
    }
}`,
      checks: [
        { label: "Package mathutil", pattern: "package\\s+mathutil" },
        { label: "Fonction TestAbs", pattern: "func\\s+TestAbs\\(t\\s+\\*testing\\.T\\)" },
        { label: "Slice de structs", pattern: "\\[\\]struct\\s*\\{" },
        { label: "Champ name string", pattern: "name\\s+string" },
        { label: "Au moins 3 cas de test", pattern: "\\{\"\\w+\".*\\}.*\\{\"\\w+\".*\\}.*\\{\"\\w+\".*\\}" },
        { label: "Utilise t.Run pour les subtests", pattern: "t\\.Run\\(tt\\.name" },
        { label: "Appelle Abs", pattern: "Abs\\(tt\\.input\\)" },
      ],
    },
    {
      id: "g12-ex3",
      title: "Subtests avec t.Run",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un test `TestContains` pour `strings.Contains`. Cree 3 subtests explicites avec `t.Run` : (1) `"present"` verifie que `strings.Contains("bonjour", "bon")` retourne `true`, (2) `"absent"` verifie que `strings.Contains("bonjour", "xyz")` retourne `false`, (3) `"vide"` verifie que `strings.Contains("bonjour", "")` retourne `true`.',
      hints: [
        "Importe testing et strings.",
        "Chaque t.Run est un subtest independant.",
        "Compare directement le booleen retourne.",
      ],
      starter: `package main

import (
    "strings"
    "testing"
)

func TestContains(t *testing.T) {
    // 3 subtests avec t.Run
}`,
      solution: `package main

import (
    "strings"
    "testing"
)

func TestContains(t *testing.T) {
    t.Run("present", func(t *testing.T) {
        if !strings.Contains("bonjour", "bon") {
            t.Error("devrait contenir 'bon'")
        }
    })
    t.Run("absent", func(t *testing.T) {
        if strings.Contains("bonjour", "xyz") {
            t.Error("ne devrait pas contenir 'xyz'")
        }
    })
    t.Run("vide", func(t *testing.T) {
        if !strings.Contains("bonjour", "") {
            t.Error("devrait contenir la chaine vide")
        }
    })
}`,
      checks: [
        { label: "Fonction TestContains", pattern: "func\\s+TestContains\\(t\\s+\\*testing\\.T\\)" },
        { label: 'Subtest "present"', pattern: 't\\.Run\\("present"' },
        { label: 'Subtest "absent"', pattern: 't\\.Run\\("absent"' },
        { label: 'Subtest "vide"', pattern: 't\\.Run\\("vide"' },
        { label: "Utilise strings.Contains", pattern: "strings\\.Contains\\(" },
        { label: "Signale les echecs", pattern: "t\\.Error" },
      ],
    },
    {
      id: "g12-ex4",
      title: "Ecrire un benchmark",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris un benchmark `BenchmarkConcat` qui mesure la concatenation de deux chaines `\"hello\"` et `\" world\"` avec l'operateur `+`. Inclus le package, l'import, et la boucle `for i := 0; i < b.N; i++`. Stocke le resultat dans une variable `result` pour eviter l'optimisation du compilateur.",
      hints: [
        "Le parametre est *testing.B, pas *testing.T.",
        "La boucle b.N est obligatoire pour les benchmarks.",
        "Declare var result string en dehors de la boucle.",
      ],
      starter: `package main

import "testing"

// Ecris BenchmarkConcat ici
`,
      solution: `package main

import "testing"

func BenchmarkConcat(b *testing.B) {
    var result string
    for i := 0; i < b.N; i++ {
        result = "hello" + " world"
    }
    _ = result
}`,
      checks: [
        { label: "Fonction BenchmarkConcat", pattern: "func\\s+BenchmarkConcat\\(b\\s+\\*testing\\.B\\)" },
        { label: "Boucle b.N", pattern: "i\\s*<\\s*b\\.N" },
        { label: "Concatenation de chaines", pattern: '"hello"\\s*\\+\\s*"\\s*world"' },
        { label: "Variable result", pattern: "result" },
      ],
    },
    {
      id: "g12-ex5",
      title: "Commandes go test",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Ecris les 4 commandes (une par ligne) : (1) lance tous les tests en mode verbeux, (2) lance uniquement les tests dont le nom contient `Add`, (3) affiche la couverture de code, (4) lance tous les benchmarks.",
      hints: [
        "-v pour verbeux, -run pour filtrer, -cover pour la couverture, -bench=. pour les benchmarks.",
        "Chaque commande commence par go test.",
      ],
      starter: "# 1. Tests verbeux\n\n# 2. Filtrer par nom\n\n# 3. Couverture\n\n# 4. Benchmarks\n",
      solution:
        "go test -v\ngo test -run Add\ngo test -cover\ngo test -bench=.",
      checks: [
        { label: "Tests verbeux avec -v", pattern: "go\\s+test\\s+-v" },
        { label: "Filtre avec -run Add", pattern: "go\\s+test\\s+-run\\s+Add" },
        { label: "Couverture avec -cover", pattern: "go\\s+test\\s+-cover" },
        { label: "Benchmarks avec -bench", pattern: "go\\s+test\\s+-bench" },
      ],
    },
    {
      id: "g12-ex6",
      title: "Test avec t.Fatal",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris un test `TestDivide` pour une fonction `Divide(a, b float64) (float64, error)`. Le test doit : (1) dans un subtest `"ok"`, verifier que `Divide(10, 2)` retourne `5.0` sans erreur (utilise `t.Fatal` si erreur non nil), (2) dans un subtest `"division par zero"`, verifier que `Divide(10, 0)` retourne une erreur non nil.',
      hints: [
        "t.Fatal arrete le test immediatement si l'erreur n'est pas nil.",
        "Pour le cas d'erreur, verifie que err != nil n'est PAS le cas (que err IS nil est un echec).",
        "Utilise t.Run pour les deux subtests.",
      ],
      starter: `package mathutil

import "testing"

func TestDivide(t *testing.T) {
    // Subtest "ok" et "division par zero"
}`,
      solution: `package mathutil

import "testing"

func TestDivide(t *testing.T) {
    t.Run("ok", func(t *testing.T) {
        got, err := Divide(10, 2)
        if err != nil {
            t.Fatal("erreur inattendue :", err)
        }
        want := 5.0
        if got != want {
            t.Errorf("Divide(10, 2) = %f, want %f", got, want)
        }
    })
    t.Run("division par zero", func(t *testing.T) {
        _, err := Divide(10, 0)
        if err == nil {
            t.Fatal("attendait une erreur, got nil")
        }
    })
}`,
      checks: [
        { label: "Fonction TestDivide", pattern: "func\\s+TestDivide\\(t\\s+\\*testing\\.T\\)" },
        { label: 'Subtest "ok"', pattern: 't\\.Run\\("ok"' },
        { label: 'Subtest "division par zero"', pattern: 't\\.Run\\("division par zero"' },
        { label: "Appelle Divide(10, 2)", pattern: "Divide\\(10,\\s*2\\)" },
        { label: "Appelle Divide(10, 0)", pattern: "Divide\\(10,\\s*0\\)" },
        { label: "Utilise t.Fatal", pattern: "t\\.Fatal\\(" },
        { label: "Verifie err == nil", pattern: "err\\s*==\\s*nil" },
      ],
    },
  ],
  project: {
    id: "g12-projet",
    title: "Suite de tests complete",
    difficulty: "difficile",
    language: "go",
    prompt:
      'Ecris une suite de tests complete pour un package `strutil` qui contient deux fonctions : `Reverse(s string) string` et `IsPalindrome(s string) bool`. (1) Ecris un test tabulaire `TestReverse` avec au moins 4 cas : chaine normale, chaine vide, un seul caractere, palindrome. Utilise `t.Run`. (2) Ecris un test tabulaire `TestIsPalindrome` avec au moins 4 cas : un palindrome, un non-palindrome, chaine vide, un caractere. Utilise `t.Run`. (3) Ecris un benchmark `BenchmarkReverse` qui mesure `Reverse("pneumonoultramicroscopicsilicovolcanoconiosis")`.',
    hints: [
      "Les deux fonctions de test utilisent le pattern table-driven.",
      "Pour IsPalindrome, le champ want est bool.",
      "Le benchmark utilise la boucle for i := 0; i < b.N; i++.",
      "N'oublie pas le package et l'import testing.",
    ],
    starter: `package strutil

import "testing"

// TestReverse : test tabulaire avec au moins 4 cas

// TestIsPalindrome : test tabulaire avec au moins 4 cas

// BenchmarkReverse : benchmark sur une longue chaine
`,
    solution: `package strutil

import "testing"

func TestReverse(t *testing.T) {
    tests := []struct {
        name  string
        input string
        want  string
    }{
        {"normale", "bonjour", "ruojnob"},
        {"vide", "", ""},
        {"un caractere", "a", "a"},
        {"palindrome", "kayak", "kayak"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Reverse(tt.input)
            if got != tt.want {
                t.Errorf("Reverse(%q) = %q, want %q", tt.input, got, tt.want)
            }
        })
    }
}

func TestIsPalindrome(t *testing.T) {
    tests := []struct {
        name  string
        input string
        want  bool
    }{
        {"palindrome", "kayak", true},
        {"non palindrome", "bonjour", false},
        {"vide", "", true},
        {"un caractere", "x", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := IsPalindrome(tt.input)
            if got != tt.want {
                t.Errorf("IsPalindrome(%q) = %v, want %v", tt.input, got, tt.want)
            }
        })
    }
}

func BenchmarkReverse(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Reverse("pneumonoultramicroscopicsilicovolcanoconiosis")
    }
}`,
    checks: [
      { label: "Package strutil", pattern: "package\\s+strutil" },
      { label: "Fonction TestReverse", pattern: "func\\s+TestReverse\\(t\\s+\\*testing\\.T\\)" },
      { label: "Fonction TestIsPalindrome", pattern: "func\\s+TestIsPalindrome\\(t\\s+\\*testing\\.T\\)" },
      { label: "Fonction BenchmarkReverse", pattern: "func\\s+BenchmarkReverse\\(b\\s+\\*testing\\.B\\)" },
      { label: "Tests tabulaires avec slice de structs", pattern: "\\[\\]struct\\s*\\{" },
      { label: "Utilise t.Run pour les subtests", pattern: "t\\.Run\\(tt\\.name" },
      { label: "Au moins 4 cas pour Reverse", pattern: "TestReverse[\\s\\S]*\\{\"[^\"]+\"[\\s\\S]*\\{\"[^\"]+\"[\\s\\S]*\\{\"[^\"]+\"[\\s\\S]*\\{\"[^\"]+\"" },
      { label: "Boucle b.N dans le benchmark", pattern: "i\\s*<\\s*b\\.N" },
      { label: "Appelle Reverse dans le benchmark", pattern: "Reverse\\(" },
    ],
  },
  keyTakeaways: [
    "Les tests vivent dans des fichiers `_test.go`, dans le meme package que le code teste.",
    "Chaque fonction de test est `func TestXxx(t *testing.T)`. `t.Errorf` signale un echec, `t.Fatal` arrete le test.",
    "Les tests tabulaires (table-driven) evitent la duplication : un slice de cas + boucle avec `t.Run`.",
    "Les benchmarks utilisent `func BenchmarkXxx(b *testing.B)` avec une boucle `for i := 0; i < b.N; i++`.",
    "`go test -v ./...` lance tout. `-run` filtre, `-cover` mesure la couverture, `-bench=.` lance les benchmarks.",
  ],
};
