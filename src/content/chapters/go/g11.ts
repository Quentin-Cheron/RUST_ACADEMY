import type { Chapter } from "../../types";

export const g11: Chapter = {
  number: 11,
  slug: "concurrence",
  title: "Goroutines et channels",
  subtitle:
    "Ecrire du code concurrent avec les goroutines, channels et le mot-cle select.",
  description:
    "La concurrence est au coeur de Go. Les **goroutines** sont des fils d'execution ultra-legers, et les **channels** permettent de communiquer entre elles de facon sure. Dans ce chapitre, on lance des goroutines, on envoie et recoit des valeurs via des channels, on multiplex avec `select`, et on decouvre les patterns courants : fan-out/fan-in, worker pool et done channel.",
  minutes: 40,
  rustBookRef: "Go Tour -- Concurrence",
  objectives: [
    "Lancer des goroutines avec le mot-cle go",
    "Synchroniser des goroutines avec sync.WaitGroup",
    "Creer et utiliser des channels (buffered et unbuffered)",
    "Multiplexer des channels avec select et gerer les timeouts",
    "Appliquer les patterns fan-out/fan-in et worker pool",
  ],
  sections: [
    {
      id: "goroutines",
      number: "11.1",
      title: "Goroutines",
      blocks: [
        {
          type: "paragraph",
          text: "Une **goroutine** est un fil d'execution leger gere par le runtime Go. On en lance une avec le mot-cle `go` devant un appel de fonction. Contrairement aux threads systeme, les goroutines ne coutent que quelques Ko de memoire et Go peut en gerer des milliers simultanement.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "time"
)

func dire(msg string) {
    for i := 0; i < 3; i++ {
        fmt.Println(msg)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    go dire("monde")  // lance une goroutine
    dire("bonjour")   // s'execute dans la goroutine principale
}`,
          caption:
            "Le mot-cle go lance la fonction dans une goroutine separee.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Quand la fonction `main()` se termine, toutes les goroutines sont tuees immediatement. Si tu ne synchronises pas, tu risques de perdre le travail des goroutines en cours.",
        },
        {
          type: "heading",
          level: 3,
          text: "sync.WaitGroup",
        },
        {
          type: "paragraph",
          text: "Pour attendre que des goroutines terminent, on utilise `sync.WaitGroup`. On appelle `Add(n)` avant de lancer n goroutines, `Done()` dans chaque goroutine, et `Wait()` pour bloquer jusqu'a ce que toutes soient terminees.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "sync"
)

func traiter(id int, wg *sync.WaitGroup) {
    defer wg.Done() // decremente le compteur a la fin
    fmt.Printf("Goroutine %d en cours\\n", id)
}

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 5; i++ {
        wg.Add(1)        // incremente avant le lancement
        go traiter(i, &wg)
    }

    wg.Wait() // attend que toutes les goroutines terminent
    fmt.Println("Toutes les goroutines sont terminees")
}`,
          caption:
            "WaitGroup garantit que main attend la fin de toutes les goroutines.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`defer wg.Done()` en premiere ligne de la goroutine est une bonne pratique : meme si la fonction panique, le compteur sera decremente.",
        },
      ],
    },
    {
      id: "channels",
      number: "11.2",
      title: "Channels",
      blocks: [
        {
          type: "paragraph",
          text: "Un **channel** est un conduit type qui permet a deux goroutines de communiquer. On cree un channel avec `make(chan T)` et on envoie/recoit des valeurs avec l'operateur `<-`.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func calculer(ch chan int) {
    resultat := 21 * 2
    ch <- resultat // envoie le resultat dans le channel
}

func main() {
    ch := make(chan int) // channel non-buffered

    go calculer(ch)

    valeur := <-ch // recoit la valeur (bloquant)
    fmt.Println("Resultat :", valeur) // Resultat : 42
}`,
          caption:
            "Un channel non-buffered : l'envoi bloque jusqu'a ce qu'un receveur soit pret.",
        },
        {
          type: "heading",
          level: 3,
          text: "Channels buffered",
        },
        {
          type: "paragraph",
          text: "Un channel **buffered** a une capacite. L'envoi ne bloque que si le buffer est plein, et la reception ne bloque que si le buffer est vide.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func main() {
    ch := make(chan string, 2) // buffer de taille 2

    ch <- "premier"  // ne bloque pas (buffer non plein)
    ch <- "deuxieme" // ne bloque pas

    fmt.Println(<-ch) // premier
    fmt.Println(<-ch) // deuxieme
}`,
          caption:
            "Un channel buffered accepte des valeurs sans recepteur immediat, jusqu'a sa capacite.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Fermer un channel",
          text: "`close(ch)` signale qu'aucune valeur ne sera plus envoyee. Une boucle `for v := range ch` recoit toutes les valeurs puis s'arrete a la fermeture. Seul l'emetteur doit fermer un channel.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import "fmt"

func generer(ch chan int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch) // signale la fin
}

func main() {
    ch := make(chan int)
    go generer(ch)

    for val := range ch { // recoit jusqu'a la fermeture
        fmt.Println(val)
    }
}`,
          caption:
            "for range sur un channel : recoit les valeurs jusqu'a ce qu'il soit ferme.",
        },
        {
          type: "usecase",
          title: "Pipeline de donnees",
          text: "Imagine un pipeline de traitement d'images : une goroutine lit les fichiers, une autre les redimensionne, une troisieme les compresse. Chaque etape est connectee a la suivante par un channel. Chaque goroutine traite les elements au fur et a mesure, sans charger tout en memoire.",
        },
      ],
    },
    {
      id: "select",
      number: "11.3",
      title: "Select",
      blocks: [
        {
          type: "paragraph",
          text: "Le mot-cle `select` permet d'attendre sur **plusieurs channels** en meme temps. C'est le `switch` des channels : il bloque jusqu'a ce qu'un des cas soit pret, puis l'execute.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() {
        time.Sleep(100 * time.Millisecond)
        ch1 <- "un"
    }()
    go func() {
        time.Sleep(200 * time.Millisecond)
        ch2 <- "deux"
    }()

    // Attend le premier channel pret
    select {
    case msg := <-ch1:
        fmt.Println("Recu de ch1 :", msg)
    case msg := <-ch2:
        fmt.Println("Recu de ch2 :", msg)
    }
}`,
          caption:
            "select attend le premier channel pret parmi plusieurs.",
        },
        {
          type: "heading",
          level: 3,
          text: "Timeout avec time.After",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string)

    go func() {
        time.Sleep(2 * time.Second) // simule un traitement long
        ch <- "resultat"
    }()

    select {
    case msg := <-ch:
        fmt.Println("Recu :", msg)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout : trop long !")
    }
}`,
          caption:
            "time.After retourne un channel qui recoit une valeur apres le delai. Parfait pour les timeouts.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Un `default` dans un `select` le rend non-bloquant. Si aucun channel n'est pret, le `default` s'execute immediatement. Utile pour du polling ou des verifications rapides.",
        },
      ],
    },
    {
      id: "patterns-courants",
      number: "11.4",
      title: "Patterns courants",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Fan-out / Fan-in",
        },
        {
          type: "paragraph",
          text: "**Fan-out** : plusieurs goroutines lisent depuis le meme channel d'entree. **Fan-in** : plusieurs channels sont fusionnes dans un seul channel de sortie.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {
        fmt.Printf("Worker %d traite job %d\\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 10)
    results := make(chan int, 10)

    var wg sync.WaitGroup
    // Fan-out : 3 workers lisent depuis jobs
    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    // Envoie 9 jobs
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    // Attend la fin des workers puis ferme results
    go func() {
        wg.Wait()
        close(results)
    }()

    // Fan-in : lit tous les resultats
    for r := range results {
        fmt.Println("Resultat :", r)
    }
}`,
          caption:
            "Worker pool : fan-out sur les jobs, fan-in sur les resultats.",
        },
        {
          type: "heading",
          level: 3,
          text: "Done channel",
        },
        {
          type: "paragraph",
          text: "Un **done channel** (souvent `chan struct{}`) sert a signaler l'arret a une goroutine longue. C'est une forme de cancellation manuelle.",
        },
        {
          type: "code",
          language: "go",
          code: `package main

import (
    "fmt"
    "time"
)

func serveur(done chan struct{}) {
    for {
        select {
        case <-done:
            fmt.Println("Serveur arrete")
            return
        default:
            fmt.Println("Traitement...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    done := make(chan struct{})
    go serveur(done)

    time.Sleep(2 * time.Second)
    close(done) // signale l'arret
    time.Sleep(100 * time.Millisecond)
}`,
          caption:
            "Fermer le channel done signale a la goroutine de s'arreter proprement.",
        },
        {
          type: "usecase",
          title: "Serveur web concurrent",
          text: "Un serveur web Go utilise une goroutine par requete. Chaque handler peut lancer des sous-goroutines pour appeler une API et la base de donnees en parallele, puis fusionner les resultats via des channels. Le done channel (ou `context.Context`) permet d'annuler toutes les goroutines si le client deconnecte.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Directions de channel",
          text: "On peut restreindre un channel a l'envoi (`chan<- T`) ou a la reception (`<-chan T`) dans la signature d'une fonction. Ca documente l'intention et le compilateur empeche les mauvais usages.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "g11-ex1",
      title: "Lancer une goroutine",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris un programme complet qui lance une goroutine affichant `"Goroutine !"` avec `fmt.Println`, puis affiche `"Main !"` dans la goroutine principale. Utilise `time.Sleep(100 * time.Millisecond)` a la fin de `main` pour laisser le temps a la goroutine de s\'executer.',
      hints: [
        "Le mot-cle go lance une goroutine.",
        "Tu peux utiliser une fonction anonyme : go func() { ... }().",
        "N'oublie pas les imports time et fmt.",
      ],
      starter: `package main

import (
    // Ajoute les imports
)

func main() {
    // Lance une goroutine qui affiche "Goroutine !"
    // Affiche "Main !"
    // Attend un peu
}`,
      solution: `package main

import (
    "fmt"
    "time"
)

func main() {
    go func() {
        fmt.Println("Goroutine !")
    }()
    fmt.Println("Main !")
    time.Sleep(100 * time.Millisecond)
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Utilise le mot-cle go", pattern: "\\bgo\\s+(func|\\w)" },
        { label: 'Affiche "Goroutine !"', pattern: 'fmt\\.Println\\("Goroutine\\s*!"\\)' },
        { label: 'Affiche "Main !"', pattern: 'fmt\\.Println\\("Main\\s*!"\\)' },
        { label: "Utilise time.Sleep", pattern: "time\\.Sleep\\(" },
      ],
    },
    {
      id: "g11-ex2",
      title: "Envoyer et recevoir sur un channel",
      difficulty: "facile",
      language: "go",
      prompt:
        'Ecris un programme complet. Cree un channel `ch` de type `chan string`. Lance une goroutine qui envoie `"hello"` dans le channel. Dans `main`, recois la valeur et affiche-la avec `fmt.Println`.',
      hints: [
        "Cree le channel avec make(chan string).",
        "Envoie avec ch <- valeur, recois avec <-ch.",
        "La reception est bloquante : pas besoin de Sleep.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Cree le channel
    // Lance une goroutine qui envoie "hello"
    // Recois et affiche
}`,
      solution: `package main

import "fmt"

func main() {
    ch := make(chan string)
    go func() {
        ch <- "hello"
    }()
    msg := <-ch
    fmt.Println(msg)
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Cree un channel string", pattern: "make\\(chan\\s+string\\)" },
        { label: "Lance une goroutine", pattern: "\\bgo\\s+func" },
        { label: 'Envoie "hello"', pattern: 'ch\\s*<-\\s*"hello"' },
        { label: "Recoit depuis le channel", pattern: "<-ch" },
        { label: "Affiche le message", pattern: "fmt\\.Println\\(" },
      ],
    },
    {
      id: "g11-ex3",
      title: "Channel buffered",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un programme complet. Cree un channel buffered `ch` de type `chan int` avec une capacite de 3. Envoie les valeurs `10`, `20` et `30` (sans goroutine, directement dans main). Puis recois et affiche les trois valeurs avec `fmt.Println`.',
      hints: [
        "Un channel buffered se cree avec make(chan int, 3).",
        "L'envoi ne bloque pas tant que le buffer n'est pas plein.",
        "Recois avec <-ch trois fois.",
      ],
      starter: `package main

import "fmt"

func main() {
    // Cree un channel buffered de capacite 3
    // Envoie 10, 20, 30
    // Recois et affiche les trois valeurs
}`,
      solution: `package main

import "fmt"

func main() {
    ch := make(chan int, 3)
    ch <- 10
    ch <- 20
    ch <- 30
    fmt.Println(<-ch)
    fmt.Println(<-ch)
    fmt.Println(<-ch)
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Channel buffered de capacite 3", pattern: "make\\(chan\\s+int,\\s*3\\)" },
        { label: "Envoie 10", pattern: "ch\\s*<-\\s*10" },
        { label: "Envoie 20", pattern: "ch\\s*<-\\s*20" },
        { label: "Envoie 30", pattern: "ch\\s*<-\\s*30" },
        { label: "Recoit depuis le channel", pattern: "<-ch" },
      ],
    },
    {
      id: "g11-ex4",
      title: "Select avec timeout",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un programme complet. Cree un channel `ch` de type `chan string`. Lance une goroutine qui attend 2 secondes puis envoie `"fait"`. Utilise `select` pour soit recevoir depuis `ch`, soit afficher `"Timeout !"` apres 1 seconde (utilise `time.After(1 * time.Second)`).',
      hints: [
        "time.After retourne un channel qui recoit apres le delai.",
        "select attend le premier cas pret.",
        "Le timeout de 1s sera atteint avant les 2s de la goroutine.",
      ],
      starter: `package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string)
    // Lance une goroutine qui attend 2s
    // Select : reception ou timeout 1s
}`,
      solution: `package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string)
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "fait"
    }()
    select {
    case msg := <-ch:
        fmt.Println("Recu :", msg)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout !")
    }
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Cree un channel string", pattern: "make\\(chan\\s+string\\)" },
        { label: "Lance une goroutine", pattern: "\\bgo\\s+func" },
        { label: "Utilise select", pattern: "\\bselect\\s*\\{" },
        { label: "Reception depuis ch", pattern: "case\\s+.*<-ch" },
        { label: "Utilise time.After", pattern: "time\\.After\\(" },
        { label: 'Affiche "Timeout !"', pattern: 'fmt\\.Println\\("Timeout\\s*!"\\)' },
      ],
    },
    {
      id: "g11-ex5",
      title: "WaitGroup",
      difficulty: "moyen",
      language: "go",
      prompt:
        'Ecris un programme complet. Utilise `sync.WaitGroup` pour lancer 3 goroutines. Chaque goroutine recoit un numero `i` (de 1 a 3) et affiche `"Worker N termine"` avec `fmt.Printf`. `main` attend que toutes terminent puis affiche `"Tout est fini"` avec `fmt.Println`.',
      hints: [
        "Declare var wg sync.WaitGroup.",
        "Appelle wg.Add(1) avant chaque go.",
        "Utilise defer wg.Done() dans la goroutine.",
        "wg.Wait() bloque jusqu'a la fin.",
      ],
      starter: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    // Lance 3 goroutines avec WaitGroup
    // Attend puis affiche "Tout est fini"
}`,
      solution: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()
            fmt.Printf("Worker %d termine\\n", n)
        }(i)
    }
    wg.Wait()
    fmt.Println("Tout est fini")
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Utilise sync.WaitGroup", pattern: "sync\\.WaitGroup" },
        { label: "Appelle wg.Add", pattern: "wg\\.Add\\(1\\)" },
        { label: "Appelle wg.Done", pattern: "wg\\.Done\\(\\)" },
        { label: "Appelle wg.Wait", pattern: "wg\\.Wait\\(\\)" },
        { label: "Lance des goroutines", pattern: "\\bgo\\s+func" },
        { label: 'Affiche "Tout est fini"', pattern: 'fmt\\.Println\\("Tout est fini"\\)' },
      ],
    },
    {
      id: "g11-ex6",
      title: "Done channel pour annuler",
      difficulty: "difficile",
      language: "go",
      prompt:
        'Ecris un programme complet. Cree un channel `done` de type `chan struct{}`. Lance une goroutine qui boucle avec `select` : soit elle recoit de `done` et affiche `"Arrete"` puis return, soit le `default` affiche `"Travail..."` et sleep 200ms. Dans `main`, sleep 1 seconde, puis ferme `done` avec `close(done)`. Attends 100ms apres la fermeture pour laisser la goroutine afficher son message.',
      hints: [
        "chan struct{} est un channel vide, ideal pour le signalement.",
        "close(done) debloque toutes les receptions sur done.",
        "Le default dans select le rend non-bloquant.",
      ],
      starter: `package main

import (
    "fmt"
    "time"
)

func main() {
    done := make(chan struct{})
    // Lance la goroutine avec select/done
    // Attend 1s, ferme done, attend un peu
}`,
      solution: `package main

import (
    "fmt"
    "time"
)

func main() {
    done := make(chan struct{})
    go func() {
        for {
            select {
            case <-done:
                fmt.Println("Arrete")
                return
            default:
                fmt.Println("Travail...")
                time.Sleep(200 * time.Millisecond)
            }
        }
    }()
    time.Sleep(1 * time.Second)
    close(done)
    time.Sleep(100 * time.Millisecond)
}`,
      checks: [
        { label: "Declare le package main", pattern: "package\\s+main" },
        { label: "Channel done de type struct{}", pattern: "make\\(chan\\s+struct\\{\\}\\)" },
        { label: "Lance une goroutine", pattern: "\\bgo\\s+func" },
        { label: "Utilise select", pattern: "\\bselect\\s*\\{" },
        { label: "Recoit de done", pattern: "case\\s+<-done" },
        { label: "Ferme done avec close", pattern: "close\\(done\\)" },
        { label: 'Affiche "Arrete"', pattern: 'fmt\\.Println\\("Arrete"\\)' },
      ],
    },
  ],
  project: {
    id: "g11-projet",
    title: "Pipeline de traitement",
    difficulty: "difficile",
    language: "go",
    prompt:
      'Ecris un programme complet avec un pipeline a 3 etapes connectees par des channels. **Etape 1** (`generer`) : une fonction qui prend un channel `out chan<- int`, envoie les nombres de 1 a 5, puis ferme le channel. **Etape 2** (`doubler`) : prend `in <-chan int` et `out chan<- int`, lit chaque valeur de `in`, la multiplie par 2, l\'envoie dans `out`, puis ferme `out`. **Etape 3** (`afficher`) : prend `in <-chan int` et un `done chan<- struct{}`, lit chaque valeur de `in` et l\'affiche avec `fmt.Println`, puis envoie sur `done`. Dans `main`, cree les channels, lance chaque etape dans une goroutine, et attend sur le channel `done`.',
    hints: [
      "Chaque etape est une fonction lancee avec go.",
      "Utilise for val := range in pour lire jusqu'a la fermeture.",
      "Le channel done signale que le pipeline est termine.",
      "chan<- est envoi seul, <-chan est reception seule.",
    ],
    starter: `package main

import "fmt"

func generer(out chan<- int) {
    // Envoie 1 a 5 puis ferme
}

func doubler(in <-chan int, out chan<- int) {
    // Lit, double, envoie, puis ferme
}

func afficher(in <-chan int, done chan<- struct{}) {
    // Lit et affiche, puis signale done
}

func main() {
    // Cree les channels et lance le pipeline
}`,
    solution: `package main

import "fmt"

func generer(out chan<- int) {
    for i := 1; i <= 5; i++ {
        out <- i
    }
    close(out)
}

func doubler(in <-chan int, out chan<- int) {
    for val := range in {
        out <- val * 2
    }
    close(out)
}

func afficher(in <-chan int, done chan<- struct{}) {
    for val := range in {
        fmt.Println(val)
    }
    done <- struct{}{}
}

func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)
    done := make(chan struct{})

    go generer(ch1)
    go doubler(ch1, ch2)
    go afficher(ch2, done)

    <-done
}`,
    checks: [
      { label: "Fonction generer avec chan<- int", pattern: "func\\s+generer\\(out\\s+chan<-\\s*int\\)" },
      { label: "Fonction doubler avec <-chan et chan<-", pattern: "func\\s+doubler\\(in\\s+<-chan\\s*int,\\s*out\\s+chan<-\\s*int\\)" },
      { label: "Fonction afficher", pattern: "func\\s+afficher\\(" },
      { label: "Ferme le channel dans generer", pattern: "close\\(out\\)" },
      { label: "Utilise for range sur le channel", pattern: "for\\s+\\w+\\s*:=\\s*range\\s+in" },
      { label: "Multiplie par 2", pattern: "val\\s*\\*\\s*2|\\*\\s*2" },
      { label: "Lance les goroutines", pattern: "go\\s+generer|go\\s+doubler|go\\s+afficher" },
      { label: "Attend sur done", pattern: "<-done" },
    ],
    tests: `package main

import (
    "fmt"
    "os"
    "sort"
    "time"
)

// __USER_CODE__

func main() {
    echecs := 0

    // Test 1 : generer envoie les nombres 1 a 5
    ch1 := make(chan int)
    go generer(ch1)
    var nums []int
    timeout1 := time.After(2 * time.Second)
    for {
        select {
        case v, ok := <-ch1:
            if !ok {
                goto doneGenerer
            }
            nums = append(nums, v)
        case <-timeout1:
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: generer timeout\\n")
            echecs++
            goto doneGenerer
        }
    }
doneGenerer:
    sort.Ints(nums)
    if len(nums) != 5 || nums[0] != 1 || nums[4] != 5 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: generer devrait envoyer [1,2,3,4,5], got %v\\n", nums)
        echecs++
    } else {
        fmt.Println("OK: generer envoie [1,2,3,4,5]")
    }

    // Test 2 : doubler multiplie par 2
    in2 := make(chan int)
    out2 := make(chan int)
    go doubler(in2, out2)
    in2 <- 3
    in2 <- 7
    close(in2)
    var doubled []int
    timeout2 := time.After(2 * time.Second)
    for {
        select {
        case v, ok := <-out2:
            if !ok {
                goto doneDoubler
            }
            doubled = append(doubled, v)
        case <-timeout2:
            fmt.Fprintf(os.Stderr, "ÉCHOUÉ: doubler timeout\\n")
            echecs++
            goto doneDoubler
        }
    }
doneDoubler:
    sort.Ints(doubled)
    if len(doubled) != 2 || doubled[0] != 6 || doubled[1] != 14 {
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: doubler([3,7]) devrait donner [6,14], got %v\\n", doubled)
        echecs++
    } else {
        fmt.Println("OK: doubler([3,7]) = [6,14]")
    }

    // Test 3 : pipeline complet generer -> doubler -> afficher
    chA := make(chan int)
    chB := make(chan int)
    done := make(chan struct{})
    go generer(chA)
    go doubler(chA, chB)
    go afficher(chB, done)
    select {
    case <-done:
        fmt.Println("OK: pipeline complet termine correctement")
    case <-time.After(3 * time.Second):
        fmt.Fprintf(os.Stderr, "ÉCHOUÉ: pipeline timeout\\n")
        echecs++
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
    "Le mot-cle `go` lance une goroutine : un fil d'execution ultra-leger gere par le runtime Go.",
    "`sync.WaitGroup` permet d'attendre la fin de plusieurs goroutines (Add, Done, Wait).",
    "Les channels (`make(chan T)`) sont le moyen idiomatique de communiquer entre goroutines.",
    "Un channel non-buffered synchronise emetteur et recepteur. Un channel buffered decouple.",
    "`select` multiplex plusieurs channels. Combine avec `time.After`, il gere les timeouts.",
  ],
};
