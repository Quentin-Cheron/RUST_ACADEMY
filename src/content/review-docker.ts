import type { ReviewExercise } from "./types";

// Exercices de révision transversaux pour Docker : chacun mélange les notions de
// plusieurs chapitres. Un exercice n'est débloqué que lorsque TOUS les chapitres
// listés dans `chapters` sont terminés.
//
// Comme le bac à sable Docker démarre vide, chaque solution est AUTONOME :
// elle crée la ressource dont elle a besoin avant d'agir dessus.

export const dockerReviewExercises: ReviewExercise[] = [
  {
    id: "drev-01",
    title: "Cycle de vie complet",
    difficulty: "facile",
    language: "bash",
    chapters: ["decouvrir-docker", "conteneurs-au-quotidien"],
    prompt:
      "Lance un conteneur **nginx** nommé `web` en arrière-plan, vérifie qu'il tourne avec `docker ps`, puis supprime-le de force. Tu combines le lancement du chapitre 1 avec la gestion du chapitre 3.",
    hints: [
      "L'arrière-plan, c'est l'option `-d`.",
      "`docker ps` liste les conteneurs actifs.",
      "`docker rm -f` arrête et supprime en une seule commande.",
    ],
    starter: "docker run ",
    solution: "docker run -d --name web nginx\ndocker ps\ndocker rm -f web",
    checks: [
      { label: "Lance nginx en arrière-plan", pattern: "docker\\s+run\\s+(-d|--detach).*nginx" },
      { label: "Nomme le conteneur web", pattern: "--name\\s+web" },
      { label: "Liste les conteneurs actifs", pattern: "docker\\s+ps" },
      { label: "Supprime le conteneur de force", pattern: "docker\\s+rm\\s+-f\\s+web" },
    ],
  },
  {
    id: "drev-02",
    title: "Publier un port et nettoyer",
    difficulty: "facile",
    language: "bash",
    chapters: ["decouvrir-docker", "reseau-et-ports"],
    prompt:
      "Lance **nginx** en arrière-plan sous le nom `site`, en publiant le port **8080** de l'hôte vers le **80** du conteneur, puis supprime-le de force. Publication de port (ch. 5) + cycle de vie (ch. 1).",
    hints: [
      "Format de publication : `-p hôte:conteneur`.",
      "Le nom se donne avec `--name`.",
      "`docker rm -f` fait le ménage en une commande.",
    ],
    starter: "docker run ",
    solution: "docker run -d -p 8080:80 --name site nginx\ndocker rm -f site",
    checks: [
      { label: "Lance en arrière-plan (-d)", pattern: "(^|\\s)(-d|--detach)(\\s|$)" },
      { label: "Publie 8080 vers 80", pattern: "-p\\s+8080:80" },
      { label: "Utilise l'image nginx", pattern: "nginx" },
      { label: "Supprime le conteneur de force", pattern: "docker\\s+rm\\s+-f\\s+site" },
    ],
  },
  {
    id: "drev-03",
    title: "Entrer dans un conteneur",
    difficulty: "facile",
    language: "bash",
    chapters: ["decouvrir-docker", "conteneurs-au-quotidien"],
    prompt:
      "Lance **nginx** en arrière-plan nommé `serveur`, exécute `nginx -v` à l'intérieur avec `docker exec`, puis supprime le conteneur de force.",
    hints: [
      "`docker exec <conteneur> <commande>` exécute une commande dans un conteneur qui tourne.",
      "Crée d'abord le conteneur, sinon `exec` échoue avec « No such container ».",
    ],
    starter: "docker run -d --name serveur nginx\n",
    solution: "docker run -d --name serveur nginx\ndocker exec serveur nginx -v\ndocker rm -f serveur",
    checks: [
      { label: "Lance le conteneur serveur", pattern: "docker\\s+run\\s+(-d|--detach).*--name\\s+serveur" },
      { label: "Exécute une commande dedans", pattern: "docker\\s+exec\\s+serveur" },
      { label: "Supprime le conteneur de force", pattern: "docker\\s+rm\\s+-f\\s+serveur" },
    ],
  },
  {
    id: "drev-04",
    title: "Lire les logs",
    difficulty: "facile",
    language: "bash",
    chapters: ["conteneurs-au-quotidien", "nginx-reverse-proxy"],
    prompt:
      "Lance **nginx** en arrière-plan nommé `front`, affiche ses logs, puis supprime-le de force. Utile pour diagnostiquer un serveur web.",
    hints: [
      "`docker logs <conteneur>` affiche la sortie du conteneur.",
      "Crée d'abord le conteneur.",
    ],
    starter: "docker run -d --name front nginx\n",
    solution: "docker run -d --name front nginx\ndocker logs front\ndocker rm -f front",
    checks: [
      { label: "Lance nginx nommé front", pattern: "docker\\s+run\\s+(-d|--detach).*--name\\s+front" },
      { label: "Affiche les logs", pattern: "docker\\s+logs\\s+front" },
      { label: "Nettoie de force", pattern: "docker\\s+rm\\s+-f\\s+front" },
    ],
  },
  {
    id: "drev-05",
    title: "Une commande jetable",
    difficulty: "facile",
    language: "bash",
    chapters: ["decouvrir-docker", "images-dockerfile"],
    prompt:
      "Affiche la version de Node avec un conteneur **jetable** (supprimé automatiquement à la sortie) à partir de l'image `node:22`. Aucun conteneur ne doit rester après.",
    hints: [
      "`--rm` supprime le conteneur dès qu'il s'arrête.",
      "La commande à exécuter est `node --version`.",
    ],
    starter: "docker run ",
    solution: "docker run --rm node:22 node --version",
    checks: [
      { label: "Conteneur jetable (--rm)", pattern: "docker\\s+run\\s+--rm" },
      { label: "Image node:22", pattern: "node:22" },
      { label: "Demande la version de node", pattern: "node\\s+--version" },
    ],
  },
  {
    id: "drev-06",
    title: "Redémarrer un service",
    difficulty: "moyen",
    language: "bash",
    chapters: ["conteneurs-au-quotidien", "stacks-multi-services"],
    prompt:
      "Lance un cache **redis:7** en arrière-plan nommé `cache`, redémarre-le avec `docker restart`, puis supprime-le de force.",
    hints: [
      "`docker restart <conteneur>` arrête puis relance.",
      "Redis se lance comme n'importe quelle image.",
    ],
    starter: "docker run -d --name cache redis:7\n",
    solution: "docker run -d --name cache redis:7\ndocker restart cache\ndocker rm -f cache",
    checks: [
      { label: "Lance redis en arrière-plan", pattern: "docker\\s+run\\s+(-d|--detach).*redis" },
      { label: "Redémarre le conteneur", pattern: "docker\\s+restart\\s+cache" },
      { label: "Nettoie de force", pattern: "docker\\s+rm\\s+-f\\s+cache" },
    ],
  },
  {
    id: "drev-07",
    title: "Volume : créer, lister, supprimer",
    difficulty: "moyen",
    language: "bash",
    chapters: ["volumes-et-donnees", "conteneurs-au-quotidien"],
    prompt:
      "Crée un volume nommé `data`, liste les volumes pour vérifier qu'il existe, puis supprime-le.",
    hints: [
      "`docker volume create <nom>` crée un volume.",
      "`docker volume ls` les liste, `docker volume rm` les supprime.",
    ],
    starter: "docker volume ",
    solution: "docker volume create data\ndocker volume ls\ndocker volume rm data",
    checks: [
      { label: "Crée le volume data", pattern: "docker\\s+volume\\s+create\\s+data" },
      { label: "Liste les volumes", pattern: "docker\\s+volume\\s+ls" },
      { label: "Supprime le volume", pattern: "docker\\s+volume\\s+rm\\s+data" },
    ],
  },
  {
    id: "drev-08",
    title: "Persister avec un volume",
    difficulty: "moyen",
    language: "bash",
    chapters: ["volumes-et-donnees", "reseau-et-ports"],
    prompt:
      "Crée le volume `dbdata`, puis lance un conteneur **redis:7** nommé `db` qui monte ce volume sur `/data`, en arrière-plan. Enfin supprime le conteneur de force.",
    hints: [
      "Le montage se fait avec `-v <volume>:<chemin>`.",
      "Crée le volume avant de le monter.",
    ],
    starter: "docker volume create dbdata\n",
    solution:
      "docker volume create dbdata\ndocker run -d --name db -v dbdata:/data redis:7\ndocker rm -f db",
    checks: [
      { label: "Crée le volume dbdata", pattern: "docker\\s+volume\\s+create\\s+dbdata" },
      { label: "Monte le volume sur /data", pattern: "-v\\s+dbdata:/data" },
      { label: "Lance en arrière-plan", pattern: "docker\\s+run\\s+(-d|--detach)" },
      { label: "Nettoie le conteneur", pattern: "docker\\s+rm\\s+-f\\s+db" },
    ],
  },
  {
    id: "drev-09",
    title: "Un réseau pour deux services",
    difficulty: "moyen",
    language: "bash",
    chapters: ["reseau-et-ports", "stacks-multi-services"],
    prompt:
      "Crée un réseau nommé `app-net`, lance **redis:7** dessus sous le nom `cache` (en arrière-plan), puis supprime le conteneur et le réseau.",
    hints: [
      "`docker network create <nom>` crée un réseau.",
      "On attache un conteneur avec `--network <nom>`.",
      "`docker network rm` supprime le réseau (le conteneur doit être parti avant).",
    ],
    starter: "docker network create app-net\n",
    solution:
      "docker network create app-net\ndocker run -d --name cache --network app-net redis:7\ndocker rm -f cache\ndocker network rm app-net",
    checks: [
      { label: "Crée le réseau app-net", pattern: "docker\\s+network\\s+create\\s+app-net" },
      { label: "Attache le conteneur au réseau", pattern: "--network\\s+app-net" },
      { label: "Supprime le conteneur", pattern: "docker\\s+rm\\s+-f\\s+cache" },
      { label: "Supprime le réseau", pattern: "docker\\s+network\\s+rm\\s+app-net" },
    ],
  },
  {
    id: "drev-10",
    title: "Inspecter une image",
    difficulty: "moyen",
    language: "bash",
    chapters: ["images-dockerfile", "conteneurs-au-quotidien"],
    prompt:
      "Télécharge l'image **alpine** avec `docker pull`, liste les images pour la voir, puis affiche son historique de couches avec `docker history`.",
    hints: [
      "`docker pull <image>` télécharge une image.",
      "`docker images` liste les images locales.",
      "`docker history <image>` montre les couches.",
    ],
    starter: "docker pull alpine\n",
    solution: "docker pull alpine\ndocker images\ndocker history alpine",
    checks: [
      { label: "Télécharge alpine", pattern: "docker\\s+pull\\s+alpine" },
      { label: "Liste les images", pattern: "docker\\s+images" },
      { label: "Affiche l'historique des couches", pattern: "docker\\s+history\\s+alpine" },
    ],
  },
  {
    id: "drev-11",
    title: "Tagger une image",
    difficulty: "moyen",
    language: "bash",
    chapters: ["images-dockerfile", "docker-production"],
    prompt:
      "Récupère **alpine**, crée un nouveau tag `mon-app:1.0` pointant sur cette image avec `docker tag`, puis vérifie avec `docker images`.",
    hints: [
      "`docker tag <source> <cible>` crée un alias.",
      "Le format d'un tag est `nom:version`.",
    ],
    starter: "docker pull alpine\n",
    solution: "docker pull alpine\ndocker tag alpine mon-app:1.0\ndocker images",
    checks: [
      { label: "Récupère alpine", pattern: "docker\\s+pull\\s+alpine" },
      { label: "Crée le tag mon-app:1.0", pattern: "docker\\s+tag\\s+alpine\\s+mon-app:1\\.0" },
      { label: "Vérifie avec docker images", pattern: "docker\\s+images" },
    ],
  },
  {
    id: "drev-12",
    title: "Nettoyer plusieurs conteneurs",
    difficulty: "moyen",
    language: "bash",
    chapters: ["conteneurs-au-quotidien", "decouvrir-docker"],
    prompt:
      "Lance deux conteneurs **nginx** en arrière-plan (`w1` et `w2`), liste-les, puis supprime-les **tous les deux** de force en une seule commande `docker rm`.",
    hints: [
      "`docker rm -f w1 w2` accepte plusieurs noms.",
      "Crée les deux conteneurs d'abord.",
    ],
    starter: "docker run -d --name w1 nginx\n",
    solution:
      "docker run -d --name w1 nginx\ndocker run -d --name w2 nginx\ndocker ps\ndocker rm -f w1 w2",
    checks: [
      { label: "Lance le conteneur w1", pattern: "docker\\s+run\\s+(-d|--detach).*--name\\s+w1" },
      { label: "Lance le conteneur w2", pattern: "docker\\s+run\\s+(-d|--detach).*--name\\s+w2" },
      { label: "Supprime les deux en une commande", pattern: "docker\\s+rm\\s+-f\\s+w1\\s+w2" },
    ],
  },
  {
    id: "drev-13",
    title: "Limiter les ressources",
    difficulty: "difficile",
    language: "bash",
    chapters: ["docker-production", "conteneurs-au-quotidien"],
    prompt:
      "Lance **nginx** en arrière-plan nommé `limite` en bornant sa mémoire à **128m** et son CPU à **0.5**, puis supprime-le de force. Bonnes pratiques de production.",
    hints: [
      "La mémoire se limite avec `--memory` (ou `-m`).",
      "Le CPU se limite avec `--cpus`.",
    ],
    starter: "docker run ",
    solution:
      "docker run -d --name limite --memory 128m --cpus 0.5 nginx\ndocker rm -f limite",
    checks: [
      { label: "Lance en arrière-plan", pattern: "docker\\s+run\\s+(-d|--detach)" },
      { label: "Limite la mémoire à 128m", pattern: "(--memory|-m)\\s+128m" },
      { label: "Limite le CPU à 0.5", pattern: "--cpus\\s+0\\.5" },
      { label: "Nettoie de force", pattern: "docker\\s+rm\\s+-f\\s+limite" },
    ],
  },
  {
    id: "drev-14",
    title: "Variables d'environnement",
    difficulty: "moyen",
    language: "bash",
    chapters: ["conteneurs-au-quotidien", "compose-avance"],
    prompt:
      "Lance un conteneur **alpine** jetable qui passe la variable d'environnement `NOM=docker` et l'affiche avec `env`. Rien ne doit rester ensuite.",
    hints: [
      "`-e CLE=valeur` définit une variable d'environnement.",
      "`--rm` supprime le conteneur à la sortie.",
    ],
    starter: "docker run ",
    solution: "docker run --rm -e NOM=docker alpine env",
    checks: [
      { label: "Conteneur jetable", pattern: "docker\\s+run\\s+--rm" },
      { label: "Définit la variable NOM", pattern: "-e\\s+NOM=docker" },
      { label: "Utilise alpine", pattern: "alpine" },
    ],
  },
  {
    id: "drev-15",
    title: "Compose : démarrer et arrêter",
    difficulty: "moyen",
    language: "bash",
    chapters: ["docker-compose", "stacks-multi-services"],
    prompt:
      "Écris les deux commandes Compose qui **démarrent** toute la stack en arrière-plan, puis l'**arrêtent** en supprimant aussi les conteneurs.",
    hints: [
      "`docker compose up -d` démarre en arrière-plan.",
      "`docker compose down` arrête et nettoie.",
    ],
    starter: "docker compose ",
    solution: "docker compose up -d\ndocker compose down",
    checks: [
      { label: "Démarre la stack en arrière-plan", pattern: "docker\\s+compose\\s+up\\s+(-d|--detach)" },
      { label: "Arrête et nettoie la stack", pattern: "docker\\s+compose\\s+down" },
    ],
  },
  {
    id: "drev-16",
    title: "Compose : lire les logs d'un service",
    difficulty: "moyen",
    language: "bash",
    chapters: ["docker-compose", "compose-avance"],
    prompt:
      "Démarre la stack en arrière-plan avec Compose, suis les logs du service `web` en temps réel, puis arrête la stack.",
    hints: [
      "`docker compose logs -f <service>` suit les logs.",
      "`-f` (follow) reste attaché au flux.",
    ],
    starter: "docker compose up -d\n",
    solution: "docker compose up -d\ndocker compose logs -f web\ndocker compose down",
    checks: [
      { label: "Démarre en arrière-plan", pattern: "docker\\s+compose\\s+up\\s+(-d|--detach)" },
      { label: "Suit les logs du service web", pattern: "docker\\s+compose\\s+logs\\s+-f\\s+web" },
      { label: "Arrête la stack", pattern: "docker\\s+compose\\s+down" },
    ],
  },
  {
    id: "drev-17",
    title: "Construire une image locale",
    difficulty: "difficile",
    language: "bash",
    chapters: ["images-dockerfile", "dockerfile-avance"],
    prompt:
      "Construis une image tagguée `mon-api:latest` à partir du Dockerfile du répertoire courant, puis liste les images pour vérifier.",
    hints: [
      "`docker build -t <tag> <contexte>` construit une image.",
      "Le contexte « répertoire courant » s'écrit `.`.",
    ],
    starter: "docker build ",
    solution: "docker build -t mon-api:latest .\ndocker images",
    checks: [
      { label: "Construit avec un tag", pattern: "docker\\s+build\\s+-t\\s+mon-api:latest" },
      { label: "Utilise le contexte courant", pattern: "docker\\s+build\\s+-t\\s+\\S+\\s+\\." },
      { label: "Liste les images", pattern: "docker\\s+images" },
    ],
  },
  {
    id: "drev-18",
    title: "Reverse proxy nginx",
    difficulty: "difficile",
    language: "bash",
    chapters: ["nginx-reverse-proxy", "reseau-et-ports"],
    prompt:
      "Crée un réseau `proxy-net`, lance un backend **redis:7** dessus nommé `api`, puis un **nginx** nommé `proxy` sur le même réseau publiant le port **80**. Enfin, supprime les deux conteneurs et le réseau.",
    hints: [
      "Attache chaque conteneur avec `--network proxy-net`.",
      "Publie le port de nginx avec `-p 80:80`.",
      "Nettoie les conteneurs avant le réseau.",
    ],
    starter: "docker network create proxy-net\n",
    solution:
      "docker network create proxy-net\ndocker run -d --name api --network proxy-net redis:7\ndocker run -d --name proxy --network proxy-net -p 80:80 nginx\ndocker rm -f proxy api\ndocker network rm proxy-net",
    checks: [
      { label: "Crée le réseau proxy-net", pattern: "docker\\s+network\\s+create\\s+proxy-net" },
      { label: "Lance le backend api sur le réseau", pattern: "--name\\s+api\\s+--network\\s+proxy-net" },
      { label: "Lance nginx en publiant le port 80", pattern: "nginx" },
      { label: "Publie le port 80", pattern: "-p\\s+80:80" },
      { label: "Supprime le réseau", pattern: "docker\\s+network\\s+rm\\s+proxy-net" },
    ],
  },
];
