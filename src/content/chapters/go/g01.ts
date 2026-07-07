import type { Chapter } from "../../types";

export const g01: Chapter = {
  number: 1,
  slug: "decouvrir-go",
  title: "Decouvrir Go",
  subtitle:
    "Comprendre pourquoi Go existe, installer l'environnement et ecrire son premier programme.",
  description:
    "Go (ou Golang) est un langage compile, concurrent et minimaliste cree par Google en 2009. Il brille par sa simplicite, sa vitesse de compilation et son modele de concurrence integre (goroutines). Dans ce chapitre, on decouvre les motivations derriere Go, on installe la toolchain, on ecrit et on execute un premier programme, puis on decouvre le Go Playground pour experimenter en ligne.",
  minutes: 25,
  rustBookRef: "Go Tour -- Bienvenue",
  objectives: [
    "Comprendre les atouts de Go (simplicite, performance, concurrence)",
    "Installer Go et verifier l'environnement",
    "Ecrire, compiler et executer un premier programme Go",
    "Utiliser le Go Playground pour tester du code en ligne",
  ],
  sections: [
    {
      id: "pourquoi-go",
      number: "1.1",
      title: "Pourquoi Go ?",
      blocks: [
        {
          type: "paragraph",
          text: "Go a ete cree chez Google par Robert Griesemer, Rob Pike et Ken Thompson pour repondre a un probleme concret : les enormes bases de code en C++ compilaient trop lentement, et les langages dynamiques comme Python ne passaient pas a l'echelle. Go propose un compromis : la **performance** d'un langage compile avec la **simplicite** d'un langage moderne.",
        },
        {
          type: "list",
          items: [
            "**Compilation rapide** : un projet de millions de lignes compile en quelques secondes.",
            "**Concurrence native** : les goroutines et les channels sont integres au langage.",
            "**Simplicite radicale** : pas d'heritage, pas de generics complexes, peu de mots-cles (25 seulement).",
            "**Binaire statique** : un seul fichier executable, sans dependances externes.",
            "**Garbage collector** : gestion automatique de la memoire avec des pauses tres courtes.",
          ],
        },
        {
          type: "usecase",
          title: "Qui utilise Go ?",
          text: "Docker, Kubernetes, Terraform, Hugo, Prometheus... la majorite de l'infrastructure cloud moderne est ecrite en Go. Les API REST, les microservices et les outils CLI sont ses terrains de jeu favoris.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Go vs Golang",
          text: "Le nom officiel est **Go**, mais on dit souvent **Golang** (le domaine est golang.org) pour faciliter les recherches. Les deux termes designent le meme langage.",
        },
      ],
    },
    {
      id: "installation",
      number: "1.2",
      title: "Installer Go",
      blocks: [
        {
          type: "paragraph",
          text: "Go s'installe en telechargeant le binaire officiel depuis **go.dev/dl**. L'installateur configure automatiquement le chemin. Apres installation, on verifie avec `go version`.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Verifier l'installation\ngo version        # ex: go version go1.22.5 linux/amd64\n\n# Verifier l'environnement\ngo env GOPATH     # repertoire de travail ($HOME/go par defaut)\ngo env GOROOT     # ou Go est installe",
          caption: "Commandes pour verifier que Go est correctement installe.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "GOPATH vs modules",
          text: "Depuis Go 1.16, les **Go Modules** (`go.mod`) sont le mode par defaut. Tu n'as plus besoin de travailler dans `$GOPATH/src`. Cree tes projets ou tu veux et initialise-les avec `go mod init`.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Creer un nouveau projet\nmkdir mon-projet && cd mon-projet\ngo mod init mon-projet   # cree le fichier go.mod\n\n# Structure typique\n# mon-projet/\n#   go.mod\n#   main.go",
          caption: "Initialiser un projet Go avec les modules.",
        },
      ],
    },
    {
      id: "premier-programme",
      number: "1.3",
      title: "Premier programme",
      blocks: [
        {
          type: "paragraph",
          text: "Tout programme Go commence par une declaration de **package**. Le package `main` est special : c'est le point d'entree. La fonction `main()` est la premiere fonction executee.",
        },
        {
          type: "code",
          language: "go",
          code: "// Tout fichier Go commence par la declaration du package\npackage main\n\n// On importe le package fmt pour l'affichage\nimport \"fmt\"\n\n// La fonction main est le point d'entree du programme\nfunc main() {\n    // Println affiche une ligne sur la sortie standard\n    fmt.Println(\"Bonjour, Go !\")\n}",
          filename: "main.go",
          caption: "Le classique Hello World en Go.",
        },
        {
          type: "paragraph",
          text: "On a deux facons d'executer ce fichier :",
        },
        {
          type: "code",
          language: "bash",
          code: "# Compiler et executer en une commande (pratique pour le dev)\ngo run main.go\n# Affiche : Bonjour, Go !\n\n# Compiler en un binaire, puis l'executer\ngo build -o mon-programme main.go\n./mon-programme\n# Affiche : Bonjour, Go !",
          caption: "go run compile et execute a la volee ; go build produit un binaire.",
        },
        {
          type: "callout",
          variant: "info",
          title: "go run vs go build",
          text: "`go run` compile en memoire et execute immediatement -- ideal pour tester. `go build` produit un binaire reutilisable. En production, on utilise toujours `go build`.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "`package main` : declare le package executable.",
            "`import \"fmt\"` : importe le package de formatage de la bibliotheque standard.",
            "`func main()` : point d'entree, pas de parametres, pas de retour.",
            "`fmt.Println(...)` : affiche le texte suivi d'un retour a la ligne.",
          ],
        },
      ],
    },
    {
      id: "go-playground",
      number: "1.4",
      title: "Le Go Playground",
      blocks: [
        {
          type: "paragraph",
          text: "Le **Go Playground** (go.dev/play) est un editeur en ligne qui permet d'ecrire, compiler et executer du Go directement dans le navigateur. Pas besoin d'installer quoi que ce soit pour experimenter.",
        },
        {
          type: "list",
          items: [
            "**Partage** : chaque programme peut etre partage via un lien unique.",
            "**Formatage** : le bouton *Format* applique `gofmt`, le formateur officiel de Go.",
            "**Limitations** : pas d'acces reseau, pas de fichiers persistants, temps d'execution limite.",
          ],
        },
        {
          type: "code",
          language: "go",
          code: "package main\n\nimport (\n    \"fmt\"    // pour l'affichage\n    \"runtime\" // pour les infos sur l'environnement\n)\n\nfunc main() {\n    // Affiche la version de Go utilisee par le Playground\n    fmt.Println(\"Version de Go :\", runtime.Version())\n    // Affiche le systeme d'exploitation\n    fmt.Println(\"OS :\", runtime.GOOS)\n    // Affiche l'architecture du processeur\n    fmt.Println(\"Architecture :\", runtime.GOARCH)\n}",
          filename: "main.go",
          caption: "Un programme qui affiche des informations sur l'environnement Go.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le Playground utilise toujours la derniere version stable de Go. C'est un excellent outil pour tester des idees rapidement ou partager un bout de code avec un collegue.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g1-ex1",
      title: "Hello World",
      difficulty: "facile",
      language: "go",
      prompt:
        "Ecris un programme Go qui affiche **Bonjour, Go !** sur la sortie standard avec `fmt.Println`.",
      hints: [
        "Le package doit etre `main`.",
        "Il faut importer le package `fmt`.",
        "Utilise `fmt.Println` pour afficher du texte.",
      ],
      starter:
        'package main\n\n// Importe le package necessaire\n\nfunc main() {\n    // Affiche "Bonjour, Go !"\n}',
      solution:
        'package main\n\n// On importe fmt pour l\'affichage\nimport "fmt"\n\nfunc main() {\n    // Affiche le message sur la sortie standard\n    fmt.Println("Bonjour, Go !")\n}',
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Importe le package fmt", pattern: 'import\\s+"fmt"|import\\s+\\([^)]*"fmt"' },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
        { label: "Affiche le bon message", pattern: "Bonjour,\\s*Go\\s*!" },
      ],
    },
    {
      id: "g1-ex2",
      title: "go run vs go build",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Ecris les deux commandes (une par ligne) pour : (1) executer directement le fichier `main.go` avec `go run`, puis (2) compiler `main.go` en un binaire nomme `app`.",
      hints: [
        "`go run` execute directement un fichier source.",
        "`go build -o <nom>` compile et produit un binaire avec le nom donne.",
      ],
      starter: "# 1. Executer directement\n\n# 2. Compiler en binaire\n",
      solution:
        "# 1. Executer directement\ngo run main.go\n\n# 2. Compiler en binaire\ngo build -o app main.go",
      checks: [
        { label: "Utilise go run", pattern: "go\\s+run\\s+main\\.go" },
        { label: "Utilise go build avec -o", pattern: "go\\s+build\\s+-o\\s+app" },
      ],
    },
    {
      id: "g1-ex3",
      title: "Fonction de salutation",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris une fonction `saluer(nom string) string` qui retourne la chaine `"Salut, <nom> !"`. Par exemple, `saluer("Gopher")` retourne `"Salut, Gopher !"`. Dans `main`, appelle-la avec `"Gopher"` et affiche le resultat.',
      hints: [
        "La signature est `func saluer(nom string) string`.",
        'Utilise `fmt.Sprintf("Salut, %s !", nom)` ou la concatenation `"Salut, " + nom + " !"`.',
        "N'oublie pas le `return`.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\n// Ecris la fonction saluer\n\nfunc main() {\n    // Appelle saluer("Gopher") et affiche le resultat\n}',
      solution:
        'package main\n\nimport "fmt"\n\n// Retourne une salutation personnalisee\nfunc saluer(nom string) string {\n    return "Salut, " + nom + " !"\n}\n\nfunc main() {\n    fmt.Println(saluer("Gopher"))\n}',
      checks: [
        { label: "Declare la fonction saluer", pattern: "func\\s+saluer\\(" },
        { label: "Parametre nom de type string", pattern: "nom\\s+string" },
        { label: "Retourne un string", pattern: "\\)\\s*string" },
        { label: "Contient Gopher", pattern: "Gopher" },
      ],
      tests: `package main

import (
    "fmt"
    "os"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : saluer("Gopher")
    if got := saluer("Gopher"); got != "Salut, Gopher !" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: saluer(\\"Gopher\\") = %q, attendu %q\\n", got, "Salut, Gopher !")
        echecs++
    } else {
        fmt.Println("OK: saluer(\\"Gopher\\") =", got)
    }

    // Test 2 : saluer("Alice")
    if got := saluer("Alice"); got != "Salut, Alice !" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: saluer(\\"Alice\\") = %q, attendu %q\\n", got, "Salut, Alice !")
        echecs++
    } else {
        fmt.Println("OK: saluer(\\"Alice\\") =", got)
    }

    // Test 3 : saluer("") (chaine vide)
    if got := saluer(""); got != "Salut,  !" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: saluer(\\"\\") = %q, attendu %q\\n", got, "Salut,  !")
        echecs++
    } else {
        fmt.Println("OK: saluer(\\"\\") =", got)
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
      id: "g1-ex4",
      title: "Arguments de la ligne de commande",
      difficulty: "moyen",
      language: "go",
      prompt:
        "Ecris un programme qui importe le package `os` et affiche le nombre d'arguments de la ligne de commande avec `len(os.Args)`. Affiche aussi le nom du programme (`os.Args[0]`).",
      hints: [
        "`os.Args` est un slice de strings contenant les arguments.",
        "`os.Args[0]` est le nom du programme.",
        "`len(...)` retourne la taille d'un slice.",
      ],
      starter:
        "package main\n\n// Importe les packages necessaires\n\nfunc main() {\n    // Affiche le nombre d'arguments\n\n    // Affiche le nom du programme\n}",
      solution:
        'package main\n\nimport (\n    "fmt"  // pour l\'affichage\n    "os"   // pour acceder aux arguments\n)\n\nfunc main() {\n    // Affiche le nombre d\'arguments\n    fmt.Println("Nombre d\'arguments :", len(os.Args))\n    // Affiche le nom du programme (premier argument)\n    fmt.Println("Programme :", os.Args[0])\n}',
      checks: [
        { label: "Importe le package os", pattern: '"os"' },
        { label: "Utilise os.Args", pattern: "os\\.Args" },
        { label: "Utilise len()", pattern: "len\\(os\\.Args\\)" },
        { label: "Accede a os.Args[0]", pattern: "os\\.Args\\[0\\]" },
      ],
    },
    {
      id: "g1-ex5",
      title: "Commentaires en Go",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris un programme qui contient : un **commentaire sur une ligne** (`//`) et un **commentaire multi-lignes** (`/* ... */`), puis affiche `"Go est genial !"` avec `fmt.Println`.',
      hints: [
        "`//` pour un commentaire sur une ligne.",
        "`/* ... */` pour un commentaire multi-lignes.",
      ],
      starter:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Ajoute un commentaire sur une ligne\n\n    /* Ajoute un commentaire\n       multi-lignes */\n\n    // Affiche le message\n}',
      solution:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Ceci est un commentaire sur une ligne\n\n    /* Ceci est un commentaire\n       qui s\'etend sur plusieurs lignes */\n\n    // Affiche le message\n    fmt.Println("Go est genial !")\n}',
      checks: [
        { label: "Contient un commentaire //", pattern: "//.*\\w" },
        { label: "Contient un commentaire /* */", pattern: "/\\*[\\s\\S]*?\\*/" },
        { label: "Affiche le bon message", pattern: "Go est genial" },
        { label: "Utilise fmt.Println", pattern: "fmt\\.Println" },
      ],
    },
  ],
  project: {
    id: "g1-projet",
    title: "Carte de visite",
    difficulty: "moyen",
    language: "go",
    prompt:
      'Ecris trois fonctions qui retournent les informations d\'une carte de visite :\n\n1. `appName() string` — retourne `"GoApp"`\n2. `appVersion() string` — retourne `"1.0.0"`\n3. `appAuteur() string` — retourne `"Gopher"`\n\nDans `main`, appelle chaque fonction et affiche la carte de visite avec `fmt.Println`. Affiche aussi la version de Go avec `runtime.Version()`.',
    hints: [
      "Chaque fonction n'a pas de parametre et retourne un `string`.",
      "Importe `fmt` et `runtime`.",
      "Utilise `runtime.Version()` pour obtenir la version de Go.",
    ],
    starter:
      "package main\n\nimport (\n    \"fmt\"\n    \"runtime\"\n)\n\n// Declare les trois fonctions\n\nfunc main() {\n    // Affiche la carte de visite en appelant les fonctions\n    _ = runtime.Version() // utilise runtime\n}",
    solution:
      'package main\n\nimport (\n    "fmt"\n    "runtime"\n)\n\n// Retourne le nom de l\'application\nfunc appName() string {\n    return "GoApp"\n}\n\n// Retourne la version de l\'application\nfunc appVersion() string {\n    return "1.0.0"\n}\n\n// Retourne l\'auteur de l\'application\nfunc appAuteur() string {\n    return "Gopher"\n}\n\nfunc main() {\n    fmt.Println("=== Carte de visite ===")\n    fmt.Println("Application :", appName())\n    fmt.Println("Version :", appVersion())\n    fmt.Println("Auteur :", appAuteur())\n    fmt.Println("Go :", runtime.Version())\n}',
    checks: [
      { label: "Declare le package main", pattern: "package\\s+main" },
      { label: "Declare la fonction appName", pattern: "func\\s+appName\\(\\)\\s*string" },
      { label: "Declare la fonction appVersion", pattern: "func\\s+appVersion\\(\\)\\s*string" },
      { label: "Declare la fonction appAuteur", pattern: "func\\s+appAuteur\\(\\)\\s*string" },
      { label: "Retourne GoApp", pattern: "GoApp" },
      { label: "Retourne 1.0.0", pattern: "1\\.0\\.0" },
      { label: "Retourne Gopher", pattern: "Gopher" },
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

    // Test 1 : appName()
    if got := appName(); got != "GoApp" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appName() = %q, attendu %q\\n", got, "GoApp")
        echecs++
    } else {
        fmt.Println("OK: appName() =", got)
    }

    // Test 2 : appVersion()
    if got := appVersion(); got != "1.0.0" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appVersion() = %q, attendu %q\\n", got, "1.0.0")
        echecs++
    } else {
        fmt.Println("OK: appVersion() =", got)
    }

    // Test 3 : appAuteur()
    if got := appAuteur(); got != "Gopher" {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: appAuteur() = %q, attendu %q\\n", got, "Gopher")
        echecs++
    } else {
        fmt.Println("OK: appAuteur() =", got)
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
    "Go est un langage compile, concurrent et minimaliste cree par Google, ideal pour les serveurs, les outils CLI et l'infrastructure cloud.",
    "Tout programme Go commence par `package main` et la fonction `main()` est le point d'entree.",
    "`go run` compile et execute a la volee ; `go build` produit un binaire statique autonome.",
    "`fmt.Println` est la fonction de base pour afficher du texte sur la sortie standard.",
    "Le Go Playground (go.dev/play) permet de tester du code Go directement dans le navigateur sans installation.",
  ],
};
