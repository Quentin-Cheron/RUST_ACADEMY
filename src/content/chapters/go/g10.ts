import type { Chapter } from "../../types";

export const g10: Chapter = {
  number: 10,
  slug: "erreurs",
  title: "Gestion des erreurs",
  subtitle:
    "Gerer les erreurs idiomatiquement avec le pattern if err != nil, errors.New et fmt.Errorf.",
  description:
    "En Go, les erreurs ne sont pas des exceptions : ce sont des valeurs. La fonction retourne un resultat et une erreur, et l'appelant decide quoi en faire. Ce chapitre couvre l'interface `error`, le pattern `if err != nil`, la creation d'erreurs personnalisees avec `errors.New` et `fmt.Errorf`, et le wrapping d'erreurs pour conserver le contexte avec `%w`, `errors.Is` et `errors.As`.",
  minutes: 30,
  rustBookRef: "Go Tour -- Erreurs",
  objectives: [
    "Comprendre l'interface error et sa methode Error() string",
    "Maitriser le pattern if err != nil avec retour anticipe",
    "Creer des erreurs personnalisees avec errors.New, fmt.Errorf et des structs",
    "Wrapper et deballer des erreurs avec %w, errors.Is et errors.As",
  ],
  sections: [
    {
      id: "type-error",
      number: "10.1",
      title: "Le type error",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, `error` est une **interface built-in** avec une seule methode : `Error() string`. N'importe quel type qui implemente cette methode est une erreur valide.",
        },
        {
          type: "code",
          language: "go",
          code: `// L'interface error est definie dans le langage :
// type error interface {
//     Error() string
// }

package main

import (
    "fmt"
    "strconv"
)

func main() {
    // strconv.Atoi retourne (int, error)
    n, err := strconv.Atoi("42")
    fmt.Println(n, err) // 42 <nil>

    n, err = strconv.Atoi("abc")
    fmt.Println(n, err) // 0 strconv.Atoi: parsing "abc": invalid syntax
}`,
          caption:
            "Les fonctions Go retournent une valeur et une erreur. nil signifie « pas d'erreur ».",
        },
        {
          type: "paragraph",
          text: "La convention en Go est de retourner l'erreur comme **dernier** element du tuple de retour. Si tout se passe bien, l'erreur vaut `nil`. Si quelque chose echoue, l'erreur contient un message descriptif.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Pas d'exceptions en Go",
          text: "Contrairement a Java, Python ou Rust (avec `panic!`), Go n'utilise pas d'exceptions pour le flux d'erreurs normal. Les erreurs sont des valeurs explicites que tu manipules comme n'importe quelle autre variable.",
        },
      ],
    },
    {
      id: "if-err-nil",
      number: "10.2",
      title: "Le pattern if err != nil",
      blocks: [
        {
          type: "paragraph",
          text: "Le pattern le plus courant en Go est de verifier l'erreur immediatement apres l'appel. Si l'erreur n'est pas `nil`, on la traite (souvent en la retournant a l'appelant) et on sort de la fonction.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "os"
)

func readFile(path string) (string, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return "", err // retour anticipe
    }
    return string(data), nil
}

func main() {
    content, err := readFile("config.txt")
    if err != nil {
        fmt.Println("Erreur :", err)
        return
    }
    fmt.Println("Contenu :", content)
}`,
          caption:
            "Le pattern if err != nil avec retour anticipe : le chemin heureux reste au niveau principal.",
        },
        {
          type: "paragraph",
          text: "Ce pattern peut sembler repetitif, mais il a un avantage majeur : le flux d'erreurs est **explicite** et **visible**. Tu sais exactement ou chaque erreur est geree.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Astuce : le « chemin heureux » (happy path) reste au niveau d'indentation principal. Les erreurs sont traitees dans les blocs `if` et provoquent un `return` immediat. Ca rend le code plus lisible.",
        },
        {
          type: "usecase",
          title: "Enchainer les appels avec gestion d'erreurs",
          text: "Dans un serveur web, chaque handler enchaine souvent plusieurs operations (lire la requete, valider, appeler la DB, formater la reponse). Chacune peut echouer. Le pattern `if err != nil { return err }` permet de gerer chaque etape sans imbriquer des blocs try/catch.",
        },
      ],
    },
    {
      id: "creer-erreurs",
      number: "10.3",
      title: "Creer ses propres erreurs",
      blocks: [
        {
          type: "paragraph",
          text: "Go offre plusieurs facons de creer des erreurs : `errors.New` pour les messages simples, `fmt.Errorf` pour les messages formates, et les structs personnalisees pour les erreurs riches.",
        },
        {
          type: "heading",
          level: 3,
          text: "errors.New et fmt.Errorf",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "errors"
    "fmt"
)

// Erreur sentinelle : variable globale reutilisable
var ErrDivisionParZero = errors.New("division par zero")

func diviser(a, b float64) (float64, error) {
    if b == 0 {
        return 0, ErrDivisionParZero
    }
    return a / b, nil
}

func calculer(expr string, a, b float64) (float64, error) {
    if expr != "div" {
        return 0, fmt.Errorf("operation inconnue : %s", expr)
    }
    return diviser(a, b)
}

func main() {
    _, err := diviser(10, 0)
    fmt.Println(err) // division par zero

    _, err = calculer("mul", 2, 3)
    fmt.Println(err) // operation inconnue : mul
}`,
          caption:
            "errors.New cree une erreur simple. fmt.Errorf permet de formater le message.",
        },
        {
          type: "heading",
          level: 3,
          text: "Erreur struct personnalisee",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// ValidationError contient des details sur l'erreur
type ValidationError struct {
    Field   string
    Message string
}

// Error implemente l'interface error
func (e *ValidationError) Error() string {
    return fmt.Sprintf("champ %s : %s", e.Field, e.Message)
}

func validerAge(age int) error {
    if age < 0 {
        return &ValidationError{Field: "age", Message: "doit etre positif"}
    }
    if age > 150 {
        return &ValidationError{Field: "age", Message: "valeur irrealiste"}
    }
    return nil
}

func main() {
    err := validerAge(-5)
    fmt.Println(err) // champ age : doit etre positif
}`,
          caption:
            "Un type struct qui implemente Error() peut transporter des donnees structurees.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Les erreurs sentinelles (`var ErrXxx = errors.New(...)`) sont des variables globales. Elles permettent de comparer les erreurs avec `==` ou `errors.Is`. Nomme-les avec le prefixe `Err` par convention.",
        },
      ],
    },
    {
      id: "wrapping",
      number: "10.4",
      title: "Wrapping d'erreurs",
      blocks: [
        {
          type: "paragraph",
          text: "Quand tu retournes une erreur depuis une couche intermediaire, il est utile d'ajouter du **contexte** sans perdre l'erreur originale. C'est le role du wrapping avec `%w` dans `fmt.Errorf`.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "errors"
    "fmt"
    "strconv"
)

var ErrFormatInvalide = errors.New("format invalide")

func parsePort(s string) (int, error) {
    port, err := strconv.Atoi(s)
    if err != nil {
        // %w wrappe l'erreur originale
        return 0, fmt.Errorf("%w : %s n'est pas un nombre", ErrFormatInvalide, s)
    }
    if port < 1 || port > 65535 {
        return 0, fmt.Errorf("%w : port %d hors limites", ErrFormatInvalide, port)
    }
    return port, nil
}

func main() {
    _, err := parsePort("abc")
    fmt.Println(err) // format invalide : abc n'est pas un nombre

    // errors.Is traverse la chaine de wrapping
    fmt.Println(errors.Is(err, ErrFormatInvalide)) // true
}`,
          caption:
            "fmt.Errorf avec %w wrappe l'erreur. errors.Is la retrouve dans la chaine.",
        },
        {
          type: "heading",
          level: 3,
          text: "errors.Is et errors.As",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "errors"
    "fmt"
)

type NotFoundError struct {
    Name string
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s introuvable", e.Name)
}

func chercher(name string) error {
    return fmt.Errorf("echec recherche : %w", &NotFoundError{Name: name})
}

func main() {
    err := chercher("config.yaml")

    // errors.Is : compare avec une erreur sentinelle
    // errors.As : extrait un type d'erreur specifique
    var nfe *NotFoundError
    if errors.As(err, &nfe) {
        fmt.Println("Ressource manquante :", nfe.Name)
        // Ressource manquante : config.yaml
    }
}`,
          caption:
            "errors.As extrait une erreur typee depuis la chaine de wrapping.",
        },
        {
          type: "list",
          items: [
            "**`fmt.Errorf(\"... %w\", err)`** : wrappe `err` dans une nouvelle erreur avec du contexte.",
            "**`errors.Is(err, target)`** : remonte la chaine de wrapping pour trouver `target`.",
            "**`errors.As(err, &target)`** : remonte la chaine pour trouver une erreur du type de `target` et la stocke dedans.",
            "**`errors.Unwrap(err)`** : retourne l'erreur wrappee d'un niveau (rarement utilise directement).",
          ],
        },
        {
          type: "usecase",
          title: "Diagnostiquer une erreur en production",
          text: "Ton serveur retourne « echec lecture config : ouverture fichier : permission refusee ». Grace au wrapping, chaque couche (config, fichier, OS) a ajoute du contexte. Tu vois toute la pile d'erreurs sans stack trace, et tu peux tester programmatiquement si c'est une erreur de permission avec errors.Is.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g10-ex1",
      title: "Retourner une erreur",
      difficulty: "facile",
      language: "go",
      prompt:
        "Ecris une fonction `racine(n float64) (float64, error)` qui retourne une erreur creee avec `errors.New` si `n` est negatif, sinon retourne `math.Sqrt(n)` et `nil`. Inclus les imports necessaires.",
      hints: [
        "Importe `errors` et `math`.",
        "Utilise `errors.New(\"nombre negatif\")` pour creer l'erreur.",
      ],
      starter: `package main

import (
    // Ajoute les imports necessaires
)

func racine(n float64) (float64, error) {
    // Retourne une erreur si n < 0
    // Sinon retourne math.Sqrt(n) et nil
}`,
      solution: `package main

import (
    "errors"
    "math"
)

func racine(n float64) (float64, error) {
    if n < 0 {
        return 0, errors.New("nombre negatif")
    }
    return math.Sqrt(n), nil
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: 'Importe "errors"', pattern: '"errors"' },
        { label: 'Importe "math"', pattern: '"math"' },
        { label: "Fonction racine declaree", pattern: "func\\s+racine\\(" },
        { label: "Retourne (float64, error)", pattern: "\\(float64,\\s*error\\)" },
        { label: "Verifie n < 0", pattern: "n\\s*<\\s*0" },
        { label: "Utilise errors.New", pattern: "errors\\.New\\(" },
        { label: "Utilise math.Sqrt", pattern: "math\\.Sqrt\\(n\\)" },
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

    // Test 1 : racine(25) = 5, nil
    if val, err := racine(25); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(25) erreur inattendue : %v\\n", err)
        echecs++
    } else if math.Abs(val-5.0) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(25) = %v, attendu 5\\n", val)
        echecs++
    } else {
        fmt.Println("OK: racine(25) =", val)
    }

    // Test 2 : racine(0) = 0, nil
    if val, err := racine(0); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(0) erreur inattendue : %v\\n", err)
        echecs++
    } else if math.Abs(val) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(0) = %v, attendu 0\\n", val)
        echecs++
    } else {
        fmt.Println("OK: racine(0) =", val)
    }

    // Test 3 : racine(-4) doit retourner une erreur
    if _, err := racine(-4); err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(-4) devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: racine(-4) retourne une erreur :", err)
    }

    // Test 4 : racine(2) ~ 1.4142
    if val, err := racine(2); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(2) erreur inattendue : %v\\n", err)
        echecs++
    } else if math.Abs(val-1.41421356) > 0.001 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: racine(2) = %v, attendu ~1.4142\\n", val)
        echecs++
    } else {
        fmt.Printf("OK: racine(2) = %.4f\\n", val)
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
      id: "g10-ex2",
      title: "Le pattern if err != nil",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris une fonction `convertir(s string) (int, error)` qui appelle `strconv.Atoi(s)`. Si l\'erreur n\'est pas nil, retourne `0` et une erreur formatee avec `fmt.Errorf("conversion echouee : %s", s)`. Sinon retourne le nombre et nil.',
      hints: [
        "Importe `fmt` et `strconv`.",
        "Utilise le pattern if err != nil apres strconv.Atoi.",
      ],
      starter: `package main

import (
    // Ajoute les imports
)

func convertir(s string) (int, error) {
    // Appelle strconv.Atoi et gere l'erreur
}`,
      solution: `package main

import (
    "fmt"
    "strconv"
)

func convertir(s string) (int, error) {
    n, err := strconv.Atoi(s)
    if err != nil {
        return 0, fmt.Errorf("conversion echouee : %s", s)
    }
    return n, nil
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Fonction convertir declaree", pattern: "func\\s+convertir\\(" },
        { label: "Appelle strconv.Atoi", pattern: "strconv\\.Atoi\\(s\\)" },
        { label: "Verifie if err != nil", pattern: "if\\s+err\\s*!=\\s*nil" },
        { label: "Utilise fmt.Errorf", pattern: "fmt\\.Errorf\\(" },
        { label: "Retourne nil en cas de succes", pattern: "return\\s+n,\\s*nil" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : convertir("42") = 42, nil
    if val, err := convertir("42"); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"42\\") erreur inattendue : %v\\n", err)
        echecs++
    } else if val != 42 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"42\\") = %d, attendu 42\\n", val)
        echecs++
    } else {
        fmt.Println("OK: convertir(\\"42\\") =", val)
    }

    // Test 2 : convertir("0") = 0, nil
    if val, err := convertir("0"); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"0\\") erreur inattendue : %v\\n", err)
        echecs++
    } else if val != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"0\\") = %d, attendu 0\\n", val)
        echecs++
    } else {
        fmt.Println("OK: convertir(\\"0\\") =", val)
    }

    // Test 3 : convertir("abc") doit retourner une erreur
    if val, err := convertir("abc"); err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"abc\\") devrait retourner une erreur, got %d\\n", val)
        echecs++
    } else {
        fmt.Println("OK: convertir(\\"abc\\") retourne une erreur :", err)
    }

    // Test 4 : convertir("-7") = -7, nil
    if val, err := convertir("-7"); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"-7\\") erreur inattendue : %v\\n", err)
        echecs++
    } else if val != -7 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: convertir(\\"-7\\") = %d, attendu -7\\n", val)
        echecs++
    } else {
        fmt.Println("OK: convertir(\\"-7\\") =", val)
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
      id: "g10-ex3",
      title: "Type d'erreur personnalise",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Cree un type `TemperatureError` (struct avec les champs `Value float64` et `Min float64`) qui implemente l\'interface `error`. La methode `Error()` retourne `"temperature X hors limite (min: Y)"` avec `fmt.Sprintf`. Ecris aussi une fonction `verifierTemp(val, min float64) error` qui retourne cette erreur si `val < min`.',
      hints: [
        "Le receveur de Error() est un pointeur *TemperatureError.",
        "Utilise fmt.Sprintf pour formater le message.",
        "Retourne &TemperatureError{...} pour creer un pointeur.",
      ],
      starter: `package main

import "fmt"

type TemperatureError struct {
    // Ajoute les champs
}

// Implemente l'interface error

func verifierTemp(val, min float64) error {
    // Retourne une erreur si val < min
}`,
      solution: `package main

import "fmt"

type TemperatureError struct {
    Value float64
    Min   float64
}

func (e *TemperatureError) Error() string {
    return fmt.Sprintf("temperature %.1f hors limite (min: %.1f)", e.Value, e.Min)
}

func verifierTemp(val, min float64) error {
    if val < min {
        return &TemperatureError{Value: val, Min: min}
    }
    return nil
}`,
      checks: [
        { label: "Struct TemperatureError", pattern: "type\\s+TemperatureError\\s+struct" },
        { label: "Champ Value float64", pattern: "Value\\s+float64" },
        { label: "Champ Min float64", pattern: "Min\\s+float64" },
        { label: "Methode Error() string", pattern: "func\\s+\\(e\\s+\\*TemperatureError\\)\\s+Error\\(\\)\\s+string" },
        { label: "Utilise fmt.Sprintf", pattern: "fmt\\.Sprintf\\(" },
        { label: "Fonction verifierTemp", pattern: "func\\s+verifierTemp\\(" },
        { label: "Retourne nil si valide", pattern: "return\\s+nil" },
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

    // Test 1 : verifierTemp(-10, 0) doit retourner une erreur
    if err := verifierTemp(-10, 0); err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp(-10, 0) devrait retourner une erreur\\n")
        echecs++
    } else {
        msg := err.Error()
        if !strings.Contains(msg, "-10") || !strings.Contains(msg, "0") {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp(-10, 0) message incomplet : %s\\n", msg)
            echecs++
        } else {
            fmt.Println("OK: verifierTemp(-10, 0) erreur :", msg)
        }
    }

    // Test 2 : verifierTemp(25, 10) doit retourner nil
    if err := verifierTemp(25, 10); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp(25, 10) erreur inattendue : %v\\n", err)
        echecs++
    } else {
        fmt.Println("OK: verifierTemp(25, 10) = nil (valide)")
    }

    // Test 3 : verifierTemp(0, 0) doit retourner nil (egal a min)
    if err := verifierTemp(0, 0); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp(0, 0) erreur inattendue : %v\\n", err)
        echecs++
    } else {
        fmt.Println("OK: verifierTemp(0, 0) = nil (egal a min)")
    }

    // Test 4 : verifierTemp(-5, -2) doit retourner une erreur
    if err := verifierTemp(-5, -2); err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp(-5, -2) devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: verifierTemp(-5, -2) erreur :", err)
    }

    // Test 5 : verifier que c'est un *TemperatureError
    err := verifierTemp(-10, 0)
    if terr, ok := err.(*TemperatureError); !ok {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierTemp doit retourner un *TemperatureError\\n")
        echecs++
    } else if terr.Value != -10 || terr.Min != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: champs incorrects Value=%v Min=%v\\n", terr.Value, terr.Min)
        echecs++
    } else {
        fmt.Println("OK: *TemperatureError avec Value=-10, Min=0")
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
      id: "g10-ex4",
      title: "Wrapper une erreur avec %w",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une erreur sentinelle `var ErrFichierInvalide = errors.New(\"fichier invalide\")` et une fonction `lireConfig(path string) error` qui retourne `fmt.Errorf(\"lecture config : %w\", ErrFichierInvalide)` si le path est vide. Sinon retourne nil.",
      hints: [
        "Importe `errors` et `fmt`.",
        "Le verbe %w wrappe l'erreur originale.",
        'Verifie path == "" pour le cas d\'erreur.',
      ],
      starter: `package main

import (
    // Ajoute les imports
)

// Declare l'erreur sentinelle

func lireConfig(path string) error {
    // Retourne une erreur wrappee si path est vide
}`,
      solution: `package main

import (
    "errors"
    "fmt"
)

var ErrFichierInvalide = errors.New("fichier invalide")

func lireConfig(path string) error {
    if path == "" {
        return fmt.Errorf("lecture config : %w", ErrFichierInvalide)
    }
    return nil
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Erreur sentinelle ErrFichierInvalide", pattern: "var\\s+ErrFichierInvalide\\s*=\\s*errors\\.New\\(" },
        { label: "Fonction lireConfig", pattern: "func\\s+lireConfig\\(path\\s+string\\)\\s+error" },
        { label: "Utilise %w pour wrapper", pattern: "%w" },
        { label: "Wrappe ErrFichierInvalide", pattern: "ErrFichierInvalide" },
        { label: "Verifie path vide", pattern: 'path\\s*==\\s*""' },
      ],
      tests: `package main

import (
    "errors"
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : lireConfig("") doit retourner une erreur
    if err := lireConfig(""); err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: lireConfig(\\"\\") devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: lireConfig(\\"\\") retourne une erreur :", err)
    }

    // Test 2 : lireConfig("config.json") doit retourner nil
    if err := lireConfig("config.json"); err != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: lireConfig(\\"config.json\\") erreur inattendue : %v\\n", err)
        echecs++
    } else {
        fmt.Println("OK: lireConfig(\\"config.json\\") = nil")
    }

    // Test 3 : l'erreur wrappe ErrFichierInvalide
    err := lireConfig("")
    if !errors.Is(err, ErrFichierInvalide) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: lireConfig(\\"\\") devrait wrapper ErrFichierInvalide\\n")
        echecs++
    } else {
        fmt.Println("OK: errors.Is(err, ErrFichierInvalide) = true")
    }

    // Test 4 : le message contient du contexte
    if err != nil {
        msg := err.Error()
        if len(msg) <= len(ErrFichierInvalide.Error()) {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: le message devrait contenir du contexte supplementaire\\n")
            echecs++
        } else {
            fmt.Println("OK: message avec contexte :", msg)
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
      id: "g10-ex5",
      title: "Verifier avec errors.Is",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris un programme complet. Declare une erreur sentinelle `var ErrNotFound = errors.New("non trouve")`. Ecris `chercher(id int) error` qui retourne `fmt.Errorf("utilisateur %d : %w", id, ErrNotFound)`. Dans `main`, appelle `chercher(42)` et utilise `errors.Is` pour tester si l\'erreur est `ErrNotFound`. Si oui, affiche `"Ressource introuvable"` avec `fmt.Println`.',
      hints: [
        "errors.Is(err, ErrNotFound) traverse la chaine de wrapping.",
        "N'oublie pas d'importer errors et fmt.",
      ],
      starter: `package main

import (
    // Ajoute les imports
)

// Erreur sentinelle

// Fonction chercher

func main() {
    // Appelle chercher(42) et teste avec errors.Is
}`,
      solution: `package main

import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("non trouve")

func chercher(id int) error {
    return fmt.Errorf("utilisateur %d : %w", id, ErrNotFound)
}

func main() {
    err := chercher(42)
    if errors.Is(err, ErrNotFound) {
        fmt.Println("Ressource introuvable")
    }
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Erreur sentinelle ErrNotFound", pattern: "var\\s+ErrNotFound\\s*=\\s*errors\\.New\\(" },
        { label: "Fonction chercher", pattern: "func\\s+chercher\\(id\\s+int\\)\\s+error" },
        { label: "Wrappe avec %w", pattern: "%w.*ErrNotFound|ErrNotFound.*%w" },
        { label: "Utilise errors.Is", pattern: "errors\\.Is\\(err,\\s*ErrNotFound\\)" },
        { label: 'Affiche "Ressource introuvable"', pattern: 'fmt\\.Println\\("Ressource introuvable"\\)' },
      ],
      tests: `package main

import (
    "errors"
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : chercher retourne une erreur non nil
    err := chercher(42)
    if err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: chercher(42) devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: chercher(42) retourne une erreur :", err)
    }

    // Test 2 : l'erreur wrappe ErrNotFound
    if !errors.Is(err, ErrNotFound) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: chercher(42) devrait wrapper ErrNotFound\\n")
        echecs++
    } else {
        fmt.Println("OK: errors.Is(err, ErrNotFound) = true")
    }

    // Test 3 : le message contient l'id 42
    if err != nil {
        msg := err.Error()
        if len(msg) == 0 {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: le message ne devrait pas etre vide\\n")
            echecs++
        } else {
            fmt.Println("OK: message d'erreur :", msg)
        }
    }

    // Test 4 : chercher avec un autre id
    err2 := chercher(99)
    if !errors.Is(err2, ErrNotFound) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: chercher(99) devrait aussi wrapper ErrNotFound\\n")
        echecs++
    } else {
        fmt.Println("OK: chercher(99) wrappe aussi ErrNotFound")
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
      id: "g10-ex6",
      title: "Extraire avec errors.As",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris un programme complet. Declare un type `APIError` (struct avec `Code int` et `Msg string`) qui implemente `Error()`. Ecris `appeler() error` qui retourne `&APIError{Code: 404, Msg: "page non trouvee"}` wrappee avec `fmt.Errorf("appel API : %w", ...)`. Dans `main`, utilise `errors.As` pour extraire le `*APIError` et affiche son `Code` avec `fmt.Println`.',
      hints: [
        "Declare `var apiErr *APIError` puis passe `&apiErr` a errors.As.",
        "errors.As modifie apiErr pour pointer sur l'erreur extraite.",
      ],
      starter: `package main

import (
    "errors"
    "fmt"
)

type APIError struct {
    // Ajoute les champs
}

// Implemente Error()

func appeler() error {
    // Retourne une APIError wrappee
}

func main() {
    // Utilise errors.As pour extraire l'APIError
}`,
      solution: `package main

import (
    "errors"
    "fmt"
)

type APIError struct {
    Code int
    Msg  string
}

func (e *APIError) Error() string {
    return fmt.Sprintf("erreur %d : %s", e.Code, e.Msg)
}

func appeler() error {
    return fmt.Errorf("appel API : %w", &APIError{Code: 404, Msg: "page non trouvee"})
}

func main() {
    err := appeler()
    var apiErr *APIError
    if errors.As(err, &apiErr) {
        fmt.Println(apiErr.Code)
    }
}`,
      checks: [
        { label: "Struct APIError", pattern: "type\\s+APIError\\s+struct" },
        { label: "Champ Code int", pattern: "Code\\s+int" },
        { label: "Champ Msg string", pattern: "Msg\\s+string" },
        { label: "Methode Error() string", pattern: "func\\s+\\(e\\s+\\*APIError\\)\\s+Error\\(\\)\\s+string" },
        { label: "Fonction appeler", pattern: "func\\s+appeler\\(\\)\\s+error" },
        { label: "Utilise errors.As", pattern: "errors\\.As\\(err,\\s*&apiErr\\)" },
        { label: "Affiche le code", pattern: "fmt\\.Println\\(apiErr\\.Code\\)" },
      ],
      tests: `package main

import (
    "errors"
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : appeler retourne une erreur non nil
    err := appeler()
    if err == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appeler() devrait retourner une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: appeler() retourne une erreur :", err)
    }

    // Test 2 : errors.As extrait un *APIError
    var apiErr *APIError
    if !errors.As(err, &apiErr) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: errors.As devrait extraire un *APIError\\n")
        echecs++
    } else {
        fmt.Println("OK: errors.As extrait un *APIError")
    }

    // Test 3 : le code est 404
    if apiErr != nil && apiErr.Code != 404 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Code = %d, attendu 404\\n", apiErr.Code)
        echecs++
    } else if apiErr != nil {
        fmt.Println("OK: Code =", apiErr.Code)
    }

    // Test 4 : le message contient "page non trouvee"
    if apiErr != nil && apiErr.Msg != "page non trouvee" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Msg = %q, attendu \\"page non trouvee\\"\\n", apiErr.Msg)
        echecs++
    } else if apiErr != nil {
        fmt.Println("OK: Msg =", apiErr.Msg)
    }

    // Test 5 : Error() retourne un message formate
    if apiErr != nil {
        msg := apiErr.Error()
        if len(msg) == 0 {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Error() ne devrait pas retourner une chaine vide\\n")
            echecs++
        } else {
            fmt.Println("OK: Error() =", msg)
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
    id: "g10-projet",
    title: "Validateur de fichier JSON",
    difficulty: "difficile",
    language: "go",
    prompt:
      'Ecris un programme complet de validation JSON-like. Declare deux erreurs sentinelles : `var ErrChampManquant = errors.New("champ manquant")` et `var ErrTypeInvalide = errors.New("type invalide")`. Ecris une fonction `validerJSON(data string) error` qui : (1) retourne `fmt.Errorf("validation : %w", ErrChampManquant)` si `data` ne contient pas `"name"` (utilise `strings.Contains`), (2) retourne `fmt.Errorf("validation : %w", ErrTypeInvalide)` si `data` ne contient pas `":"`, (3) retourne `nil` sinon. Dans `main`, appelle `validerJSON` avec `"age 25"` et utilise `errors.Is` pour tester les deux erreurs sentinelles. Affiche un message adapte pour chaque cas.',
    hints: [
      "Importe errors, fmt et strings.",
      "strings.Contains(data, \"name\") verifie la presence d'un champ.",
      "Teste ErrChampManquant d'abord, puis ErrTypeInvalide.",
    ],
    starter: `package main

import (
    // Ajoute les imports
)

// Erreurs sentinelles

func validerJSON(data string) error {
    // Validation en 2 etapes
}

func main() {
    // Appelle validerJSON("age 25") et gere les erreurs
}`,
    solution: `package main

import (
    "errors"
    "fmt"
    "strings"
)

var ErrChampManquant = errors.New("champ manquant")
var ErrTypeInvalide = errors.New("type invalide")

func validerJSON(data string) error {
    if !strings.Contains(data, "name") {
        return fmt.Errorf("validation : %w", ErrChampManquant)
    }
    if !strings.Contains(data, ":") {
        return fmt.Errorf("validation : %w", ErrTypeInvalide)
    }
    return nil
}

func main() {
    err := validerJSON("age 25")
    if errors.Is(err, ErrChampManquant) {
        fmt.Println("Champ name manquant dans les donnees")
    } else if errors.Is(err, ErrTypeInvalide) {
        fmt.Println("Format invalide : separateur : manquant")
    } else if err != nil {
        fmt.Println("Erreur :", err)
    } else {
        fmt.Println("Validation reussie")
    }
}`,
    checks: [
      { label: "Erreur sentinelle ErrChampManquant", pattern: "var\\s+ErrChampManquant\\s*=\\s*errors\\.New\\(" },
      { label: "Erreur sentinelle ErrTypeInvalide", pattern: "var\\s+ErrTypeInvalide\\s*=\\s*errors\\.New\\(" },
      { label: "Fonction validerJSON", pattern: "func\\s+validerJSON\\(data\\s+string\\)\\s+error" },
      { label: "Utilise strings.Contains", pattern: "strings\\.Contains\\(" },
      { label: "Wrappe avec %w", pattern: "fmt\\.Errorf\\(.*%w" },
      { label: "Teste avec errors.Is", pattern: "errors\\.Is\\(" },
      { label: "Retourne nil si valide", pattern: "return\\s+nil" },
    ],
    tests: `package main

import (
    "errors"
    "fmt"
    "os"
    "strings"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : validerJSON("age 25") doit retourner ErrChampManquant
    err := validerJSON("age 25")
    if !errors.Is(err, ErrChampManquant) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: validerJSON(\\"age 25\\") devrait retourner ErrChampManquant, got: %v\\n", err)
        echecs++
    } else {
        fmt.Println("OK: validerJSON(\\"age 25\\") retourne ErrChampManquant")
    }

    // Test 2 : validerJSON("name 42") (contient name mais pas :) doit retourner ErrTypeInvalide
    err2 := validerJSON("name 42")
    if !errors.Is(err2, ErrTypeInvalide) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: validerJSON(\\"name 42\\") devrait retourner ErrTypeInvalide, got: %v\\n", err2)
        echecs++
    } else {
        fmt.Println("OK: validerJSON(\\"name 42\\") retourne ErrTypeInvalide")
    }

    // Test 3 : validerJSON("name: Alice") doit retourner nil
    err3 := validerJSON("name: Alice")
    if err3 != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: validerJSON(\\"name: Alice\\") devrait retourner nil, got: %v\\n", err3)
        echecs++
    } else {
        fmt.Println("OK: validerJSON(\\"name: Alice\\") = nil (valide)")
    }

    // Test 4 : les erreurs sont wrappees (contiennent du contexte)
    if err != nil {
        msg := err.Error()
        if !strings.Contains(msg, "validation") {
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: le message devrait contenir \\"validation\\", got: %s\\n", msg)
            echecs++
        } else {
            fmt.Println("OK: message avec contexte :", msg)
        }
    }

    // Test 5 : validerJSON("") doit retourner ErrChampManquant (pas de name)
    err5 := validerJSON("")
    if !errors.Is(err5, ErrChampManquant) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: validerJSON(\\"\\") devrait retourner ErrChampManquant\\n")
        echecs++
    } else {
        fmt.Println("OK: validerJSON(\\"\\") retourne ErrChampManquant")
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
    "En Go, les erreurs sont des valeurs : l'interface `error` n'a qu'une methode `Error() string`.",
    "Le pattern `if err != nil { return ..., err }` est la facon idiomatique de propager les erreurs.",
    "`errors.New` cree une erreur simple, `fmt.Errorf` permet de formater le message.",
    "Les erreurs sentinelles (`var ErrXxx = errors.New(...)`) sont des variables globales comparables.",
    "`fmt.Errorf(\"contexte : %w\", err)` wrappe une erreur. `errors.Is` et `errors.As` la retrouvent dans la chaine.",
  ],
};
