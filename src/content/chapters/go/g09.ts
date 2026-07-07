import type { Chapter } from "../../types";

export const g09: Chapter = {
  number: 9,
  slug: "packages-modules",
  title: "Packages et modules",
  subtitle:
    "Organiser son code Go avec le systeme de packages et le gestionnaire de modules.",
  description:
    "Go impose une organisation claire du code grace a son systeme de packages et de modules. Dans ce chapitre, on decouvre comment structurer un projet, gerer la visibilite des identifiants, initialiser un module avec `go mod`, et integrer des dependances externes. Ces notions sont indispensables pour tout projet Go au-dela du simple fichier unique.",
  minutes: 35,
  rustBookRef: "Go Tour -- Packages",
  objectives: [
    "Comprendre le role du package main et de la fonction main",
    "Importer et utiliser des packages de la bibliotheque standard",
    "Connaitre la regle de visibilite majuscule/minuscule",
    "Initialiser un module Go avec go mod init",
    "Organiser un projet avec les conventions cmd/ et internal/",
  ],
  sections: [
    {
      id: "packages",
      number: "9.1",
      title: "Les packages",
      blocks: [
        {
          type: "paragraph",
          text: "En Go, chaque fichier appartient a un **package**. Le package `main` est special : c'est le point d'entree de l'executable. La fonction `main()` dans le package `main` est appelee au demarrage du programme.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    fmt.Println("Bonjour, Go !")
}`,
          caption:
            "Le programme Go le plus simple : package main, import fmt, fonction main.",
        },
        {
          type: "paragraph",
          text: "On importe les packages avec le mot-cle `import`. Pour importer plusieurs packages, on utilise la syntaxe parenthesee :",
        },
        {
          type: "code",
          language: "go",
          code: `import (
    "fmt"
    "strings"
    "math/rand"
)`,
          caption: "Import groupe : une seule instruction import pour plusieurs packages.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Regle de visibilite",
          text: "En Go, un identifiant exporte (visible depuis d'autres packages) commence par une **majuscule**. Un identifiant en minuscule est prive au package. `fmt.Println` est exporte, `fmt.println` n'existerait pas. C'est la seule regle de visibilite en Go -- pas de mot-cle `public`/`private`.",
        },
        {
          type: "code",
          language: "go",
          code: `package mathutil

// Add est exporte : accessible depuis d'autres packages
func Add(a, b int) int {
    return a + b
}

// helper est prive : accessible uniquement dans ce package
func helper() int {
    return 42
}`,
          caption:
            "Add commence par une majuscule : exporte. helper en minuscule : prive.",
        },
      ],
    },
    {
      id: "modules",
      number: "9.2",
      title: "Les modules",
      blocks: [
        {
          type: "paragraph",
          text: "Un **module** Go est un ensemble de packages versionnes. On initialise un module avec `go mod init`, ce qui cree un fichier `go.mod` a la racine du projet.",
        },
        {
          type: "code",
          language: "bash",
          code: `# Creer un nouveau module
go mod init github.com/monuser/monprojet

# Le fichier go.mod genere :
cat go.mod
# module github.com/monuser/monprojet
#
# go 1.22`,
          caption: "Initialiser un module Go.",
        },
        {
          type: "paragraph",
          text: "Le fichier `go.mod` declare le nom du module (son chemin d'import), la version de Go requise, et les dependances. Le fichier `go.sum` contient les checksums des dependances pour garantir l'integrite.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le chemin du module suit generalement le chemin du depot Git (ex. `github.com/user/repo`). Pour un projet local sans depot, on peut utiliser un nom simple comme `monprojet`.",
        },
        {
          type: "code",
          language: "go",
          code: `// go.mod
module github.com/monuser/monprojet

go 1.22

require (
    github.com/fatih/color v1.16.0
)`,
          filename: "go.mod",
          caption: "Un go.mod avec une dependance externe.",
        },
      ],
    },
    {
      id: "organiser-code",
      number: "9.3",
      title: "Organiser son code",
      blocks: [
        {
          type: "paragraph",
          text: "La communaute Go a etabli des conventions pour structurer les projets. Les deux repertoires les plus courants sont `cmd/` pour les points d'entree et `internal/` pour le code prive au module.",
        },
        {
          type: "code",
          language: "bash",
          code: `monprojet/
  go.mod
  cmd/
    monapp/
      main.go          # package main, point d'entree
  internal/
    greeter/
      greeter.go       # package greeter, logique metier
  pkg/
    utils/
      utils.go         # package utils, reutilisable par d'autres modules`,
          caption: "Structure type d'un projet Go.",
        },
        {
          type: "list",
          items: [
            "**cmd/** : contient les `package main`. Chaque sous-dossier est un executable.",
            "**internal/** : packages prives au module. Le compilateur Go **interdit** leur import depuis l'exterieur.",
            "**pkg/** : packages publics reutilisables (convention optionnelle).",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          text: "Le dossier `internal/` a un statut special en Go : le compilateur refuse tout import de ces packages depuis un module externe. C'est le seul moyen d'imposer une frontiere stricte.",
        },
      ],
    },
    {
      id: "dependances-externes",
      number: "9.4",
      title: "Dependances externes",
      blocks: [
        {
          type: "paragraph",
          text: "Pour ajouter une dependance externe, on utilise `go get`. La commande telecharge le package et met a jour `go.mod` et `go.sum`.",
        },
        {
          type: "code",
          language: "bash",
          code: `# Ajouter une dependance
go get github.com/fatih/color

# Nettoyer les dependances inutilisees
go mod tidy

# Telecharger toutes les dependances dans le cache
go mod download`,
          caption: "Gerer les dependances avec go get et go mod tidy.",
        },
        {
          type: "paragraph",
          text: "`go mod tidy` est la commande de menage : elle ajoute les dependances manquantes et retire celles qui ne sont plus utilisees. C'est une bonne pratique de la lancer regulierement.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "github.com/fatih/color"
)

func main() {
    color.Green("Succes !")
    color.Red("Erreur !")
    fmt.Println("Texte normal")
}`,
          caption: "Utiliser un package externe apres go get.",
        },
        {
          type: "usecase",
          title: "Verrouiller les versions",
          text: "Le fichier `go.sum` joue le role de fichier de verrouillage. Il enregistre les checksums de chaque dependance. Si quelqu'un modifie le code d'une dependance sur le depot, Go detectera l'incoherence et refusera de compiler.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g9-ex1",
      title: "Initialiser un module",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Ecris la commande pour initialiser un module Go avec le chemin `github.com/alice/calculator`.",
      hints: [
        "La commande est `go mod init` suivie du chemin du module.",
      ],
      starter: "go mod init ",
      solution: "go mod init github.com/alice/calculator",
      checks: [
        { label: "Utilise go mod init", pattern: "go\\s+mod\\s+init" },
        {
          label: "Chemin du module correct",
          pattern: "github\\.com/alice/calculator",
        },
      ],
    },
    {
      id: "g9-ex2",
      title: "Importer et utiliser fmt",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris un programme Go complet qui affiche `"Hello, modules !"` sur la sortie standard en utilisant `fmt.Println`.',
      hints: [
        "N'oublie pas `package main` en premiere ligne.",
        "Importe le package `fmt`.",
      ],
      starter: `package main

// Importe fmt ici

func main() {
    // Affiche "Hello, modules !" ici
}`,
      solution: `package main

import "fmt"

func main() {
    fmt.Println("Hello, modules !")
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: 'Importe "fmt"', pattern: 'import\\s+.*"fmt"' },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
        {
          label: "Affiche le bon message",
          pattern: "Hello,\\s*modules\\s*!",
        },
      ],
    },
    {
      id: "g9-ex3",
      title: "Creer un package utils",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris le contenu du fichier `utils.go` pour un package `utils` qui exporte une fonction `ToUpper(s string) string` utilisant `strings.ToUpper`.",
      hints: [
        "Le package doit s'appeler `utils`, pas `main`.",
        "La fonction doit commencer par une majuscule pour etre exportee.",
        "Utilise `strings.ToUpper` de la bibliotheque standard.",
      ],
      starter: `package utils

// Importe le package necessaire

// ToUpper convertit une chaine en majuscules
`,
      solution: `package utils

import "strings"

// ToUpper convertit une chaine en majuscules
func ToUpper(s string) string {
    return strings.ToUpper(s)
}`,
      checks: [
        { label: "Package utils", pattern: "package\\s+utils" },
        { label: 'Importe "strings"', pattern: 'import\\s+.*"strings"' },
        {
          label: "Fonction ToUpper exportee",
          pattern: "func\\s+ToUpper\\(",
        },
        {
          label: "Utilise strings.ToUpper",
          pattern: "strings\\.ToUpper",
        },
        {
          label: "Retourne un string",
          pattern: "\\)\\s*string\\s*\\{",
        },
      ],
    },
    {
      id: "g9-ex4",
      title: "Ajouter une dependance",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Ecris les deux commandes (une par ligne) pour : (1) ajouter la dependance `github.com/fatih/color` et (2) nettoyer les dependances inutilisees.",
      hints: [
        "`go get` ajoute une dependance.",
        "`go mod tidy` nettoie les dependances.",
      ],
      starter: "# 1. Ajouter la dependance\n\n# 2. Nettoyer\n",
      solution:
        "go get github.com/fatih/color\ngo mod tidy",
      checks: [
        {
          label: "Utilise go get",
          pattern: "go\\s+get\\s+github\\.com/fatih/color",
        },
        { label: "Utilise go mod tidy", pattern: "go\\s+mod\\s+tidy" },
      ],
    },
    {
      id: "g9-ex5",
      title: "Visibilite des identifiants",
      difficulty: "difficile",
      language: "go",
      prompt:
        "Ecris un package `auth` avec : une fonction exportee `HashPassword(password string) string` qui retourne le mot de passe prefixe par `\"hashed_\"`, et une fonction privee `validate(password string) bool` qui retourne `true` si le mot de passe fait au moins 8 caracteres. `HashPassword` doit appeler `validate` et retourner `\"invalid\"` si le mot de passe est trop court.",
      hints: [
        "Majuscule = exporte, minuscule = prive.",
        "Utilise `len(password)` pour la longueur.",
      ],
      starter: `package auth

// HashPassword hache un mot de passe (exporte)

// validate verifie la longueur (prive)
`,
      solution: `package auth

// HashPassword hache un mot de passe (exporte)
func HashPassword(password string) string {
    if !validate(password) {
        return "invalid"
    }
    return "hashed_" + password
}

// validate verifie la longueur (prive)
func validate(password string) bool {
    return len(password) >= 8
}`,
      checks: [
        { label: "Package auth", pattern: "package\\s+auth" },
        {
          label: "Fonction HashPassword exportee",
          pattern: "func\\s+HashPassword\\(",
        },
        {
          label: "Fonction validate privee (minuscule)",
          pattern: "func\\s+validate\\(",
        },
        {
          label: "Verifie la longueur du mot de passe",
          pattern: "len\\(password\\)",
        },
        {
          label: 'Retourne "hashed_" + password',
          pattern: '"hashed_"\\s*\\+\\s*password',
        },
      ],
    },
  ],
  project: {
    id: "g9-projet",
    title: "Structure de projet CLI",
    difficulty: "difficile",
    language: "go",
    prompt:
      "Cree la structure d'un projet CLI avec deux fichiers. **Fichier 1** (`internal/greeter/greeter.go`) : un package `greeter` qui exporte une fonction `Greet(name string) string` retournant `\"Bonjour, <name> !\"`. **Fichier 2** (`cmd/main.go`) : le `package main` qui importe le package greeter (chemin d'import : `monprojet/internal/greeter`) et appelle `greeter.Greet(\"Go\")` pour afficher le resultat avec `fmt.Println`. Ecris les deux fichiers separes par le commentaire `// --- cmd/main.go ---`.",
    hints: [
      "Le premier fichier est `package greeter`, le second `package main`.",
      "L'import du package local utilise le chemin du module + le chemin relatif.",
      'Utilise `fmt.Sprintf("Bonjour, %s !", name)` pour formater la chaine.',
    ],
    starter: `// --- internal/greeter/greeter.go ---
package greeter

// Greet retourne un message de bienvenue

// --- cmd/main.go ---
package main

// Importe fmt et le package greeter

func main() {
    // Appelle greeter.Greet("Go") et affiche le resultat
}`,
    solution: `// --- internal/greeter/greeter.go ---
package greeter

import "fmt"

// Greet retourne un message de bienvenue
func Greet(name string) string {
    return fmt.Sprintf("Bonjour, %s !", name)
}

// --- cmd/main.go ---
package main

import (
    "fmt"
    "monprojet/internal/greeter"
)

func main() {
    message := greeter.Greet("Go")
    fmt.Println(message)
}`,
    checks: [
      { label: "Package greeter declare", pattern: "package\\s+greeter" },
      { label: "Fonction Greet exportee", pattern: "func\\s+Greet\\(" },
      {
        label: "Retourne un message formate",
        pattern: "fmt\\.Sprintf|\"Bonjour,\\s*\"\\s*\\+",
      },
      { label: "Package main declare", pattern: "package\\s+main" },
      {
        label: "Importe le package greeter",
        pattern: 'import\\s*\\([\\s\\S]*greeter[\\s\\S]*\\)|import\\s+".*greeter"',
      },
      {
        label: "Appelle greeter.Greet",
        pattern: "greeter\\.Greet",
      },
      { label: "Affiche avec fmt.Println", pattern: "fmt\\.Println" },
    ],
  },
  keyTakeaways: [
    "Chaque fichier Go appartient a un package. Le package `main` avec sa fonction `main()` est le point d'entree.",
    "La visibilite est determinee par la casse : majuscule = exporte, minuscule = prive au package.",
    "`go mod init <chemin>` cree un module. Le `go.mod` declare les dependances et la version de Go.",
    "`go get` ajoute une dependance, `go mod tidy` nettoie celles qui ne sont plus utilisees.",
    "La convention `cmd/` pour les executables et `internal/` pour le code prive structure les projets professionnels.",
  ],
};
