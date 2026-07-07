import type { Chapter } from "../../types";

export const g08: Chapter = {
  number: 8,
  slug: "interfaces",
  title: "Interfaces",
  subtitle:
    "Definir des comportements avec les interfaces, le duck typing et les interfaces vides.",
  description:
    "Les interfaces sont le mecanisme d'abstraction principal de Go. Contrairement a la plupart des langages, un type n'a pas besoin de declarer explicitement qu'il implemente une interface : il suffit qu'il possede les bonnes methodes. C'est le **duck typing** statique. Ce chapitre couvre la definition d'interfaces, les interfaces courantes de la bibliotheque standard, l'interface vide `any`, les assertions de type, les type switches et la composition d'interfaces.",
  minutes: 35,
  rustBookRef: "Go Tour -- Interfaces",
  objectives: [
    "Definir une interface et l'implementer implicitement",
    "Comprendre le duck typing statique de Go",
    "Utiliser les interfaces courantes : Stringer, error, Reader, Writer",
    "Manipuler l'interface vide (any) et les assertions de type",
    "Composer des interfaces par embedding",
  ],
  sections: [
    {
      id: "definir-interface",
      number: "8.1",
      title: "Definir une interface",
      blocks: [
        {
          type: "paragraph",
          text: "Une **interface** en Go est un ensemble de signatures de methodes. Un type **implemente** une interface simplement en possedant toutes ses methodes -- sans mot-cle `implements`. C'est le **duck typing** : « si ca marche comme un canard, c'est un canard ».",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Interface : tout type avec une methode Parler() string
type Parleur interface {
    Parler() string
}

type Chien struct{ Nom string }
type Chat struct{ Nom string }

// Chien implemente Parleur (implicitement)
func (c Chien) Parler() string {
    return c.Nom + " dit : Woof!"
}

// Chat implemente Parleur (implicitement)
func (c Chat) Parler() string {
    return c.Nom + " dit : Miaou!"
}

// Fonction qui accepte n'importe quel Parleur
func faireParleur(p Parleur) {
    fmt.Println(p.Parler())
}

func main() {
    rex := Chien{Nom: "Rex"}
    minou := Chat{Nom: "Minou"}

    faireParleur(rex)    // Rex dit : Woof!
    faireParleur(minou)  // Minou dit : Miaou!
}`,
          caption: "Implementation implicite : aucun mot-cle, juste les bonnes methodes.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Duck typing statique",
          text: "En Go, le duck typing est verifie a la **compilation**, pas a l'execution. Si tu passes un type qui n'a pas la methode requise, le compilateur refuse. C'est le meilleur des deux mondes : la souplesse du duck typing avec la securite du typage statique.",
        },
        {
          type: "usecase",
          title: "Decouplage entre packages",
          text: "Les interfaces permettent de decoupler le code. Un package `storage` peut definir une interface `Store` avec `Save()` et `Load()`. N'importe quel package peut l'implementer (fichiers, base de donnees, memoire) sans importer `storage`. C'est la cle de la testabilite en Go.",
        },
      ],
    },
    {
      id: "interfaces-courantes",
      number: "8.2",
      title: "Interfaces courantes",
      blocks: [
        {
          type: "paragraph",
          text: "La bibliotheque standard de Go definit plusieurs interfaces tres utilisees. Les connaitre permet de rendre ton code compatible avec l'ecosysteme Go.",
        },
        {
          type: "list",
          items: [
            "**fmt.Stringer** : methode `String() string`. Definit comment un type s'affiche avec `fmt.Println`.",
            "**error** : methode `Error() string`. Le type standard pour les erreurs en Go.",
            "**io.Reader** : methode `Read(p []byte) (n int, err error)`. Lire des donnees.",
            "**io.Writer** : methode `Write(p []byte) (n int, err error)`. Ecrire des donnees.",
          ],
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

type Joueur struct {
    Pseudo string
    Score  int
}

// Implemente fmt.Stringer
func (j Joueur) String() string {
    return fmt.Sprintf("%s (score: %d)", j.Pseudo, j.Score)
}

func main() {
    j := Joueur{Pseudo: "Alice", Score: 42}

    // fmt.Println utilise automatiquement String()
    fmt.Println(j)  // Alice (score: 42)
}`,
          caption: "Implementer Stringer change l'affichage par defaut d'un type.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

// Type d'erreur personnalise
type ErreurValidation struct {
    Champ   string
    Message string
}

// Implemente l'interface error
func (e ErreurValidation) Error() string {
    return fmt.Sprintf("champ %s : %s", e.Champ, e.Message)
}

func valider(age int) error {
    if age < 0 {
        return ErreurValidation{Champ: "age", Message: "doit etre positif"}
    }
    return nil
}

func main() {
    err := valider(-5)
    if err != nil {
        fmt.Println("Erreur :", err) // Erreur : champ age : doit etre positif
    }
}`,
          caption: "Un type d'erreur personnalise implemente l'interface error.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "En Go, les interfaces sont petites par convention. `io.Reader` n'a qu'une seule methode. Plus une interface est petite, plus elle est facile a implementer et plus elle est reutilisable.",
        },
      ],
    },
    {
      id: "interface-vide-assertions",
      number: "8.3",
      title: "Interface vide et assertions de type",
      blocks: [
        {
          type: "paragraph",
          text: "L'**interface vide** `interface{}` (ou son alias `any` depuis Go 1.18) est implementee par **tous les types** puisqu'elle n'exige aucune methode. On l'utilise pour accepter des valeurs de type inconnu. Pour recuperer le type concret, on utilise une **assertion de type** ou un **type switch**.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func decrire(i any) string {
    // Type switch : teste le type concret
    switch v := i.(type) {
    case int:
        return fmt.Sprintf("entier : %d", v)
    case string:
        return fmt.Sprintf("chaine : %q", v)
    case bool:
        return fmt.Sprintf("booleen : %t", v)
    default:
        return fmt.Sprintf("type inconnu : %T", v)
    }
}

func main() {
    fmt.Println(decrire(42))        // entier : 42
    fmt.Println(decrire("hello"))   // chaine : "hello"
    fmt.Println(decrire(true))      // booleen : true
    fmt.Println(decrire(3.14))      // type inconnu : float64
}`,
          caption: "Le type switch est la facon idiomatique de traiter une interface vide.",
        },
        {
          type: "code",
          language: "go",
          code: `// Assertion de type simple
var i any = "bonjour"

// Forme sure : avec comma-ok
s, ok := i.(string)
fmt.Println(s, ok)    // bonjour true

n, ok := i.(int)
fmt.Println(n, ok)    // 0 false

// Forme dangereuse : sans comma-ok (panic si le type ne correspond pas)
// s2 := i.(int)     // PANIC: interface conversion: interface is string, not int`,
          caption: "L'assertion de type avec comma-ok est plus sure.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Evite d'utiliser `any` partout : tu perds les avantages du typage statique. Prefere les interfaces specifiques. Utilise `any` uniquement quand tu dois reellement accepter n'importe quel type (serialisation JSON, logging generique, etc.).",
        },
      ],
    },
    {
      id: "composition-interfaces",
      number: "8.4",
      title: "Composition d'interfaces",
      blocks: [
        {
          type: "paragraph",
          text: "Comme les structs, les interfaces peuvent etre **composees** par embedding. On cree des interfaces plus riches en combinant des interfaces simples. C'est le pattern favorise en Go : de petites interfaces composables.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

type Lecteur interface {
    Lire() string
}

type Ecrivain interface {
    Ecrire(texte string)
}

// LecteurEcrivain compose les deux interfaces
type LecteurEcrivain interface {
    Lecteur
    Ecrivain
}

// Document implemente les deux interfaces
type Document struct {
    Contenu string
}

func (d Document) Lire() string {
    return d.Contenu
}

func (d *Document) Ecrire(texte string) {
    d.Contenu = texte
}

func traiter(rw LecteurEcrivain) {
    rw.Ecrire("Nouveau contenu")
    fmt.Println("Lu :", rw.Lire())
}

func main() {
    doc := &Document{Contenu: "Initial"}
    traiter(doc)  // Lu : Nouveau contenu
}`,
          caption: "io.ReadWriter de la bibliotheque standard fonctionne exactement sur ce principe.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Exemple de la lib standard",
          text: "`io.ReadWriter` est defini comme `type ReadWriter interface { Reader; Writer }`. Il combine `io.Reader` et `io.Writer`. Tout type qui implemente les deux methodes `Read` et `Write` satisfait automatiquement `ReadWriter`.",
        },
        {
          type: "usecase",
          title: "Petites interfaces, grande flexibilite",
          text: "La philosophie Go est de definir des interfaces **petites** (1 a 3 methodes) et de les combiner au besoin. Un `io.Reader` peut etre un fichier, une connexion reseau, un buffer en memoire ou une reponse HTTP. Cette abstraction minimale est ce qui rend le code Go si composable.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g8-ex1",
      title: "Implementer Stringer",
      difficulty: "facile",
      language: "go",
      prompt:
        "Definis un type `Couleur` avec un champ `Nom string` et un champ `Hex string`. Implemente l'interface `fmt.Stringer` (methode `String() string`) pour qu'elle retourne `\"Nom (#Hex)\"` (ex. `\"Rouge (#FF0000)\"`). Cree une couleur et affiche-la avec `fmt.Println`.",
      hints: [
        "L'interface Stringer demande `String() string`.",
        "Utilise `fmt.Sprintf(\"%s (#%s)\", c.Nom, c.Hex)`.",
        "fmt.Println utilise automatiquement String() si elle existe.",
      ],
      starter: `package main

import "fmt"

type Couleur struct {
    Nom string
    Hex string
}

// Implemente Stringer

func main() {
    rouge := Couleur{Nom: "Rouge", Hex: "FF0000"}
    fmt.Println(rouge)
}`,
      solution: `package main

import "fmt"

type Couleur struct {
    Nom string
    Hex string
}

// String implemente fmt.Stringer
func (c Couleur) String() string {
    return fmt.Sprintf("%s (#%s)", c.Nom, c.Hex)
}

func main() {
    rouge := Couleur{Nom: "Rouge", Hex: "FF0000"}
    fmt.Println(rouge) // Rouge (#FF0000)
}`,
      checks: [
        { label: "Definit le type Couleur struct", pattern: "type\\s+Couleur\\s+struct" },
        { label: "Methode String() string", pattern: "func\\s+\\(\\w+\\s+\\*?Couleur\\)\\s+String\\(\\)\\s*string" },
        { label: "Utilise fmt.Sprintf", pattern: "fmt\\.Sprintf" },
        { label: "Affiche avec fmt.Println", pattern: "fmt\\.Println" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : Rouge (#FF0000)
    c1 := Couleur{Nom: "Rouge", Hex: "FF0000"}
    if got := c1.String(); got != "Rouge (#FF0000)" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Couleur{Rouge, FF0000}.String() = %q, attendu %q\\n", got, "Rouge (#FF0000)")
        echecs++
    } else {
        fmt.Println("OK: Couleur{Rouge, FF0000}.String() =", got)
    }

    // Test 2 : Bleu (#0000FF)
    c2 := Couleur{Nom: "Bleu", Hex: "0000FF"}
    if got := c2.String(); got != "Bleu (#0000FF)" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Couleur{Bleu, 0000FF}.String() = %q, attendu %q\\n", got, "Bleu (#0000FF)")
        echecs++
    } else {
        fmt.Println("OK: Couleur{Bleu, 0000FF}.String() =", got)
    }

    // Test 3 : chaînes vides
    c3 := Couleur{Nom: "", Hex: ""}
    if got := c3.String(); got != " (#)" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Couleur{\"\", \"\"}.String() = %q, attendu %q\\n", got, " (#)")
        echecs++
    } else {
        fmt.Println("OK: Couleur vide.String() =", got)
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
      id: "g8-ex2",
      title: "Interface avec plusieurs types",
      difficulty: "facile",
      language: "go",
      prompt:
        "Definis une interface `Vehicule` avec une methode `Rouler() string`. Cree deux types `Voiture` et `Velo` qui implementent cette interface. `Voiture.Rouler()` retourne `\"Vrooom!\"` et `Velo.Rouler()` retourne `\"Pedales!\"`. Ecris une fonction `conduire(v Vehicule)` qui affiche le resultat de `Rouler()`.",
      hints: [
        "Chaque type doit avoir une methode `Rouler() string`.",
        "La fonction `conduire` prend un `Vehicule` en parametre.",
      ],
      starter: `package main

import "fmt"

// Definis l'interface Vehicule

// Definis Voiture et Velo

// Fonction conduire

func main() {
    conduire(Voiture{})
    conduire(Velo{})
}`,
      solution: `package main

import "fmt"

type Vehicule interface {
    Rouler() string
}

type Voiture struct{}
type Velo struct{}

func (v Voiture) Rouler() string {
    return "Vrooom!"
}

func (v Velo) Rouler() string {
    return "Pedales!"
}

func conduire(v Vehicule) {
    fmt.Println(v.Rouler())
}

func main() {
    conduire(Voiture{}) // Vrooom!
    conduire(Velo{})    // Pedales!
}`,
      checks: [
        { label: "Definit l'interface Vehicule", pattern: "type\\s+Vehicule\\s+interface" },
        { label: "Methode Rouler dans l'interface", pattern: "Rouler\\(\\)\\s*string" },
        { label: "Voiture implemente Rouler", pattern: "func\\s+\\(\\w+\\s+\\*?Voiture\\)\\s+Rouler\\(\\)" },
        { label: "Velo implemente Rouler", pattern: "func\\s+\\(\\w+\\s+\\*?Velo\\)\\s+Rouler\\(\\)" },
        { label: "Fonction conduire avec parametre Vehicule", pattern: "func\\s+conduire\\(.*Vehicule\\)" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : Voiture.Rouler() = "Vrooom!"
    v := Voiture{}
    if got := v.Rouler(); got != "Vrooom!" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Voiture.Rouler() = %q, attendu %q\\n", got, "Vrooom!")
        echecs++
    } else {
        fmt.Println("OK: Voiture.Rouler() =", got)
    }

    // Test 2 : Velo.Rouler() = "Pedales!"
    b := Velo{}
    if got := b.Rouler(); got != "Pedales!" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Velo.Rouler() = %q, attendu %q\\n", got, "Pedales!")
        echecs++
    } else {
        fmt.Println("OK: Velo.Rouler() =", got)
    }

    // Test 3 : les deux satisfont l'interface Vehicule
    var iv Vehicule
    iv = Voiture{}
    if got := iv.Rouler(); got != "Vrooom!" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Vehicule(Voiture).Rouler() = %q, attendu %q\\n", got, "Vrooom!")
        echecs++
    } else {
        fmt.Println("OK: Vehicule(Voiture).Rouler() =", got)
    }

    iv = Velo{}
    if got := iv.Rouler(); got != "Pedales!" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Vehicule(Velo).Rouler() = %q, attendu %q\\n", got, "Pedales!")
        echecs++
    } else {
        fmt.Println("OK: Vehicule(Velo).Rouler() =", got)
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
      id: "g8-ex3",
      title: "Assertion de type",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction `longueur(i any) int` qui retourne la longueur d'une chaine si `i` est un `string` (avec `len()`), la valeur si `i` est un `int`, ou `-1` pour tout autre type. Utilise le pattern **comma-ok** pour les assertions de type. Teste avec une string, un int et un float64.",
      hints: [
        "Assertion de type : `s, ok := i.(string)`.",
        "Teste d'abord string, puis int, sinon retourne -1.",
        "Tu peux aussi utiliser un type switch.",
      ],
      starter: `package main

import "fmt"

func longueur(i any) int {
    // A completer
}

func main() {
    fmt.Println(longueur("hello"))  // 5
    fmt.Println(longueur(42))       // 42
    fmt.Println(longueur(3.14))     // -1
}`,
      solution: `package main

import "fmt"

func longueur(i any) int {
    // Teste si c'est un string
    if s, ok := i.(string); ok {
        return len(s)
    }
    // Teste si c'est un int
    if n, ok := i.(int); ok {
        return n
    }
    // Type inconnu
    return -1
}

func main() {
    fmt.Println(longueur("hello"))  // 5
    fmt.Println(longueur(42))       // 42
    fmt.Println(longueur(3.14))     // -1
}`,
      checks: [
        { label: "Fonction longueur avec parametre any", pattern: "func\\s+longueur\\(.*\\bany\\b|func\\s+longueur\\(.*interface\\{\\}" },
        { label: "Assertion de type string", pattern: "i\\.\\(string\\)" },
        { label: "Assertion de type int", pattern: "i\\.\\(int\\)" },
        { label: "Utilise len() pour la chaine", pattern: "len\\(s\\)|len\\(\\w+\\)" },
        { label: "Retourne -1 par defaut", pattern: "return\\s+-1" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : longueur("hello") = 5
    if got := longueur("hello"); got != 5 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(\"hello\") = %d, attendu 5\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(\"hello\") =", got)
    }

    // Test 2 : longueur("") = 0
    if got := longueur(""); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(\"\") = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(\"\") =", got)
    }

    // Test 3 : longueur(42) = 42
    if got := longueur(42); got != 42 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(42) = %d, attendu 42\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(42) =", got)
    }

    // Test 4 : longueur(0) = 0
    if got := longueur(0); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(0) = %d, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(0) =", got)
    }

    // Test 5 : longueur(3.14) = -1
    if got := longueur(3.14); got != -1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(3.14) = %d, attendu -1\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(3.14) =", got)
    }

    // Test 6 : longueur(true) = -1
    if got := longueur(true); got != -1 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: longueur(true) = %d, attendu -1\\n", got)
        echecs++
    } else {
        fmt.Println("OK: longueur(true) =", got)
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
      id: "g8-ex4",
      title: "Type switch",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris une fonction `decrire(i any) string` qui utilise un **type switch** pour retourner : `\"entier: N\"` pour un int, `\"texte: S\"` pour un string, `\"booleen: B\"` pour un bool, et `\"inconnu\"` pour tout autre type. Teste-la avec 42, `\"Go\"`, true et 3.14.",
      hints: [
        "Un type switch s'ecrit `switch v := i.(type) { case int: ... }`.",
        "Utilise `fmt.Sprintf` pour formater le retour.",
      ],
      starter: `package main

import "fmt"

func decrire(i any) string {
    // A completer avec un type switch
}

func main() {
    fmt.Println(decrire(42))
    fmt.Println(decrire("Go"))
    fmt.Println(decrire(true))
    fmt.Println(decrire(3.14))
}`,
      solution: `package main

import "fmt"

func decrire(i any) string {
    switch v := i.(type) {
    case int:
        return fmt.Sprintf("entier: %d", v)
    case string:
        return fmt.Sprintf("texte: %s", v)
    case bool:
        return fmt.Sprintf("booleen: %t", v)
    default:
        return "inconnu"
    }
}

func main() {
    fmt.Println(decrire(42))     // entier: 42
    fmt.Println(decrire("Go"))   // texte: Go
    fmt.Println(decrire(true))   // booleen: true
    fmt.Println(decrire(3.14))   // inconnu
}`,
      checks: [
        { label: "Fonction decrire avec parametre any", pattern: "func\\s+decrire\\(.*\\bany\\b|func\\s+decrire\\(.*interface\\{\\}" },
        { label: "Utilise un type switch", pattern: "switch.*\\.(type)" },
        { label: "Case int", pattern: "case\\s+int" },
        { label: "Case string", pattern: "case\\s+string" },
        { label: "Case bool", pattern: "case\\s+bool" },
        { label: "Cas default", pattern: "default:" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : decrire(42) = "entier: 42"
    if got := decrire(42); got != "entier: 42" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrire(42) = %q, attendu %q\\n", got, "entier: 42")
        echecs++
    } else {
        fmt.Println("OK: decrire(42) =", got)
    }

    // Test 2 : decrire("Go") = "texte: Go"
    if got := decrire("Go"); got != "texte: Go" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrire(\"Go\") = %q, attendu %q\\n", got, "texte: Go")
        echecs++
    } else {
        fmt.Println("OK: decrire(\"Go\") =", got)
    }

    // Test 3 : decrire(true) = "booleen: true"
    if got := decrire(true); got != "booleen: true" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrire(true) = %q, attendu %q\\n", got, "booleen: true")
        echecs++
    } else {
        fmt.Println("OK: decrire(true) =", got)
    }

    // Test 4 : decrire(false) = "booleen: false"
    if got := decrire(false); got != "booleen: false" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrire(false) = %q, attendu %q\\n", got, "booleen: false")
        echecs++
    } else {
        fmt.Println("OK: decrire(false) =", got)
    }

    // Test 5 : decrire(3.14) = "inconnu"
    if got := decrire(3.14); got != "inconnu" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: decrire(3.14) = %q, attendu %q\\n", got, "inconnu")
        echecs++
    } else {
        fmt.Println("OK: decrire(3.14) =", got)
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
      id: "g8-ex5",
      title: "Composer des interfaces",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Definis deux interfaces : `Marcheur` avec `Marcher() string` et `Nageur` avec `Nager() string`. Compose-les en une interface `Athlete` qui embarque les deux. Cree un type `Triathlonien` qui implemente `Athlete`. Ecris une fonction `entrainer(a Athlete)` qui appelle les deux methodes et affiche les resultats.",
      hints: [
        "Compose avec embedding : `type Athlete interface { Marcheur; Nageur }`.",
        "Triathlonien doit avoir les methodes Marcher() et Nager().",
      ],
      starter: `package main

import "fmt"

// Interfaces Marcheur et Nageur

// Interface composee Athlete

// Type Triathlonien

// Fonction entrainer

func main() {
    t := Triathlonien{Nom: "Alice"}
    entrainer(t)
}`,
      solution: `package main

import "fmt"

type Marcheur interface {
    Marcher() string
}

type Nageur interface {
    Nager() string
}

// Athlete compose Marcheur et Nageur
type Athlete interface {
    Marcheur
    Nageur
}

type Triathlonien struct {
    Nom string
}

func (t Triathlonien) Marcher() string {
    return t.Nom + " marche vite"
}

func (t Triathlonien) Nager() string {
    return t.Nom + " nage vite"
}

func entrainer(a Athlete) {
    fmt.Println(a.Marcher())
    fmt.Println(a.Nager())
}

func main() {
    t := Triathlonien{Nom: "Alice"}
    entrainer(t)
    // Alice marche vite
    // Alice nage vite
}`,
      checks: [
        { label: "Interface Marcheur", pattern: "type\\s+Marcheur\\s+interface" },
        { label: "Interface Nageur", pattern: "type\\s+Nageur\\s+interface" },
        { label: "Interface Athlete composee", pattern: "type\\s+Athlete\\s+interface" },
        { label: "Athlete embarque Marcheur et Nageur", pattern: "Athlete\\s+interface\\s*\\{[\\s\\S]*?Marcheur[\\s\\S]*?Nageur[\\s\\S]*?\\}|Athlete\\s+interface\\s*\\{[\\s\\S]*?Nageur[\\s\\S]*?Marcheur[\\s\\S]*?\\}" },
        { label: "Type Triathlonien", pattern: "type\\s+Triathlonien\\s+struct" },
        { label: "Implemente Marcher", pattern: "func\\s+\\(\\w+\\s+\\*?Triathlonien\\)\\s+Marcher\\(\\)" },
        { label: "Implemente Nager", pattern: "func\\s+\\(\\w+\\s+\\*?Triathlonien\\)\\s+Nager\\(\\)" },
        { label: "Fonction entrainer avec Athlete", pattern: "func\\s+entrainer\\(.*Athlete\\)" },
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

    t := Triathlonien{Nom: "Alice"}

    // Test 1 : Marcher() contient "Alice" et n'est pas vide
    gotM := t.Marcher()
    if !strings.Contains(gotM, "Alice") {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Triathlonien{Alice}.Marcher() = %q, devrait contenir \"Alice\"\\n", gotM)
        echecs++
    } else {
        fmt.Println("OK: Marcher() =", gotM)
    }

    // Test 2 : Nager() contient "Alice" et n'est pas vide
    gotN := t.Nager()
    if !strings.Contains(gotN, "Alice") {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Triathlonien{Alice}.Nager() = %q, devrait contenir \"Alice\"\\n", gotN)
        echecs++
    } else {
        fmt.Println("OK: Nager() =", gotN)
    }

    // Test 3 : Triathlonien satisfait l'interface Athlete
    var a Athlete = t
    if got := a.Marcher(); got != gotM {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Athlete.Marcher() = %q, attendu %q\\n", got, gotM)
        echecs++
    } else {
        fmt.Println("OK: Athlete.Marcher() fonctionne via l'interface")
    }
    if got := a.Nager(); got != gotN {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Athlete.Nager() = %q, attendu %q\\n", got, gotN)
        echecs++
    } else {
        fmt.Println("OK: Athlete.Nager() fonctionne via l'interface")
    }

    // Test 4 : Marcher et Nager retournent des valeurs différentes
    if gotM == gotN {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Marcher() et Nager() retournent la même chose : %q\\n", gotM)
        echecs++
    } else {
        fmt.Println("OK: Marcher() et Nager() retournent des valeurs différentes")
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
      id: "g8-ex6",
      title: "Erreur personnalisee",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Cree un type `ErreurHTTP` avec les champs `Code int` et `Message string`. Implemente l'interface `error` (methode `Error() string`) pour retourner `\"Code: Message\"` (ex. `\"404: Page non trouvee\"`). Ecris une fonction `verifierStatus(code int) error` qui retourne une `ErreurHTTP` si le code est >= 400, sinon `nil`. Teste avec 200 et 404.",
      hints: [
        "L'interface error a une seule methode : `Error() string`.",
        "Utilise `fmt.Sprintf(\"%d: %s\", e.Code, e.Message)` dans Error().",
        "Retourne `nil` quand il n'y a pas d'erreur.",
      ],
      starter: `package main

import "fmt"

type ErreurHTTP struct {
    Code    int
    Message string
}

// Implemente l'interface error

// Fonction verifierStatus

func main() {
    err := verifierStatus(200)
    fmt.Println(err) // <nil>

    err = verifierStatus(404)
    fmt.Println(err) // 404: Page non trouvee
}`,
      solution: `package main

import "fmt"

type ErreurHTTP struct {
    Code    int
    Message string
}

// Error implemente l'interface error
func (e ErreurHTTP) Error() string {
    return fmt.Sprintf("%d: %s", e.Code, e.Message)
}

func verifierStatus(code int) error {
    if code >= 400 {
        return ErreurHTTP{
            Code:    code,
            Message: "Page non trouvee",
        }
    }
    return nil
}

func main() {
    err := verifierStatus(200)
    fmt.Println(err) // <nil>

    err = verifierStatus(404)
    fmt.Println(err) // 404: Page non trouvee
}`,
      checks: [
        { label: "Definit le type ErreurHTTP struct", pattern: "type\\s+ErreurHTTP\\s+struct" },
        { label: "Champs Code et Message", pattern: "Code\\s+int[\\s\\S]*Message\\s+string" },
        { label: "Methode Error() string", pattern: "func\\s+\\(\\w+\\s+\\*?ErreurHTTP\\)\\s+Error\\(\\)\\s*string" },
        { label: "Fonction verifierStatus retourne error", pattern: "func\\s+verifierStatus\\(.*\\)\\s*error" },
        { label: "Verifie code >= 400", pattern: "code\\s*>=\\s*400" },
        { label: "Retourne nil si pas d'erreur", pattern: "return\\s+nil" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : ErreurHTTP.Error() formate correctement
    e := ErreurHTTP{Code: 404, Message: "Page non trouvee"}
    if got := e.Error(); got != "404: Page non trouvee" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: ErreurHTTP{404}.Error() = %q, attendu %q\\n", got, "404: Page non trouvee")
        echecs++
    } else {
        fmt.Println("OK: ErreurHTTP{404}.Error() =", got)
    }

    // Test 2 : verifierStatus(200) retourne nil
    err2 := verifierStatus(200)
    if err2 != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierStatus(200) = %v, attendu nil\\n", err2)
        echecs++
    } else {
        fmt.Println("OK: verifierStatus(200) = nil")
    }

    // Test 3 : verifierStatus(404) retourne une erreur
    err3 := verifierStatus(404)
    if err3 == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierStatus(404) = nil, attendu une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: verifierStatus(404) =", err3)
    }

    // Test 4 : verifierStatus(399) retourne nil
    err4 := verifierStatus(399)
    if err4 != nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierStatus(399) = %v, attendu nil\\n", err4)
        echecs++
    } else {
        fmt.Println("OK: verifierStatus(399) = nil")
    }

    // Test 5 : verifierStatus(500) retourne une erreur
    err5 := verifierStatus(500)
    if err5 == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierStatus(500) = nil, attendu une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: verifierStatus(500) =", err5)
    }

    // Test 6 : le retour de verifierStatus satisfait l'interface error
    var errIface error = verifierStatus(400)
    if errIface == nil {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: verifierStatus(400) = nil, attendu une erreur\\n")
        echecs++
    } else {
        fmt.Println("OK: verifierStatus(400) satisfait error :", errIface.Error())
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
    id: "g8-projet",
    title: "Systeme de formes geometriques",
    difficulty: "difficile",
    language: "go",
    prompt:
      "Cree un systeme de formes geometriques polymorphe. (1) Definis une interface `Forme` avec deux methodes : `Aire() float64` et `Perimetre() float64`. (2) Cree un type `Rectangle` avec `Largeur` et `Hauteur float64` qui implemente `Forme`. (3) Cree un type `Cercle` avec `Rayon float64` qui implemente `Forme` (utilise `3.14159` pour Pi). (4) Ecris une fonction `afficherForme(f Forme)` qui affiche l'aire et le perimetre avec `fmt.Printf`. (5) Dans `main`, cree un slice `[]Forme` contenant un Rectangle(5, 3) et un Cercle(7), et itere dessus avec `afficherForme`.",
    hints: [
      "Aire du rectangle : largeur * hauteur. Perimetre : 2 * (largeur + hauteur).",
      "Aire du cercle : pi * r^2. Perimetre (circonference) : 2 * pi * r.",
      "Un slice d'interfaces : `formes := []Forme{Rectangle{...}, Cercle{...}}`.",
      "Utilise `fmt.Printf(\"Aire: %.2f, Perimetre: %.2f\\n\", f.Aire(), f.Perimetre())`.",
    ],
    starter: `package main

import "fmt"

// Interface Forme

// Type Rectangle

// Type Cercle

// Fonction afficherForme

func main() {
    // Cree un slice de Formes et itere
    _ = fmt.Sprintf // supprime l'erreur d'import inutilise
}`,
    solution: `package main

import "fmt"

// Interface Forme : tout type avec Aire et Perimetre
type Forme interface {
    Aire() float64
    Perimetre() float64
}

type Rectangle struct {
    Largeur float64
    Hauteur float64
}

func (r Rectangle) Aire() float64 {
    return r.Largeur * r.Hauteur
}

func (r Rectangle) Perimetre() float64 {
    return 2 * (r.Largeur + r.Hauteur)
}

type Cercle struct {
    Rayon float64
}

func (c Cercle) Aire() float64 {
    return 3.14159 * c.Rayon * c.Rayon
}

func (c Cercle) Perimetre() float64 {
    return 2 * 3.14159 * c.Rayon
}

func afficherForme(f Forme) {
    fmt.Printf("Aire: %.2f, Perimetre: %.2f\\n", f.Aire(), f.Perimetre())
}

func main() {
    formes := []Forme{
        Rectangle{Largeur: 5, Hauteur: 3},
        Cercle{Rayon: 7},
    }

    for _, f := range formes {
        afficherForme(f)
    }
    // Aire: 15.00, Perimetre: 16.00
    // Aire: 153.94, Perimetre: 43.98
}`,
    checks: [
      { label: "Definit l'interface Forme", pattern: "type\\s+Forme\\s+interface" },
      { label: "Methode Aire dans l'interface", pattern: "Aire\\(\\)\\s*float64" },
      { label: "Methode Perimetre dans l'interface", pattern: "Perimetre\\(\\)\\s*float64" },
      { label: "Type Rectangle avec Largeur et Hauteur", pattern: "type\\s+Rectangle\\s+struct[\\s\\S]*?Largeur\\s+float64[\\s\\S]*?Hauteur\\s+float64" },
      { label: "Rectangle implemente Aire", pattern: "func\\s+\\(\\w+\\s+\\*?Rectangle\\)\\s+Aire\\(\\)" },
      { label: "Rectangle implemente Perimetre", pattern: "func\\s+\\(\\w+\\s+\\*?Rectangle\\)\\s+Perimetre\\(\\)" },
      { label: "Type Cercle avec Rayon", pattern: "type\\s+Cercle\\s+struct[\\s\\S]*?Rayon\\s+float64" },
      { label: "Cercle implemente Aire", pattern: "func\\s+\\(\\w+\\s+\\*?Cercle\\)\\s+Aire\\(\\)" },
      { label: "Cercle implemente Perimetre", pattern: "func\\s+\\(\\w+\\s+\\*?Cercle\\)\\s+Perimetre\\(\\)" },
      { label: "Fonction afficherForme avec Forme", pattern: "func\\s+afficherForme\\(.*Forme\\)" },
      { label: "Slice de Forme", pattern: "\\[\\]Forme" },
      { label: "Itere avec range", pattern: "range\\s+formes" },
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

    // Test 1 : Rectangle(5, 3).Aire() = 15
    r := Rectangle{Largeur: 5, Hauteur: 3}
    if got := r.Aire(); !approxEqual(got, 15, 0.01) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Rectangle{5,3}.Aire() = %f, attendu 15\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Rectangle{5,3}.Aire() = %.2f\\n", got)
    }

    // Test 2 : Rectangle(5, 3).Perimetre() = 16
    if got := r.Perimetre(); !approxEqual(got, 16, 0.01) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Rectangle{5,3}.Perimetre() = %f, attendu 16\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Rectangle{5,3}.Perimetre() = %.2f\\n", got)
    }

    // Test 3 : Cercle(7).Aire() ~= 153.94
    c := Cercle{Rayon: 7}
    if got := c.Aire(); !approxEqual(got, 153.94, 0.5) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{7}.Aire() = %f, attendu ~153.94\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Cercle{7}.Aire() = %.2f\\n", got)
    }

    // Test 4 : Cercle(7).Perimetre() ~= 43.98
    if got := c.Perimetre(); !approxEqual(got, 43.98, 0.5) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{7}.Perimetre() = %f, attendu ~43.98\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Cercle{7}.Perimetre() = %.2f\\n", got)
    }

    // Test 5 : Rectangle satisfait l'interface Forme
    var f Forme = Rectangle{Largeur: 2, Hauteur: 4}
    if got := f.Aire(); !approxEqual(got, 8, 0.01) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Forme(Rectangle{2,4}).Aire() = %f, attendu 8\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Forme(Rectangle{2,4}).Aire() = %.2f\\n", got)
    }

    // Test 6 : Cercle satisfait l'interface Forme
    f = Cercle{Rayon: 1}
    if got := f.Aire(); !approxEqual(got, 3.14159, 0.1) {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Forme(Cercle{1}).Aire() = %f, attendu ~3.14\\n", got)
        echecs++
    } else {
        fmt.Printf("OK: Forme(Cercle{1}).Aire() = %.2f\\n", got)
    }

    // Test 7 : Cercle(0) -> Aire = 0, Perimetre = 0
    c0 := Cercle{Rayon: 0}
    if got := c0.Aire(); got != 0 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: Cercle{0}.Aire() = %f, attendu 0\\n", got)
        echecs++
    } else {
        fmt.Println("OK: Cercle{0}.Aire() = 0")
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
    "Une interface est un ensemble de signatures de methodes. Un type l'implemente **implicitement** en ayant les bonnes methodes (duck typing statique).",
    "Les interfaces courantes (Stringer, error, Reader, Writer) sont petites (1-2 methodes) et omni­presentes dans l'ecosysteme Go.",
    "L'interface vide `any` accepte n'importe quel type. Utilise les assertions de type (`v, ok := i.(T)`) ou un type switch pour recuperer le type concret.",
    "On compose les interfaces par embedding : `type ReadWriter interface { Reader; Writer }`.",
    "En Go, prefere les petites interfaces (1 a 3 methodes) : elles sont plus faciles a implementer et favorisent le decouplage.",
  ],
};
