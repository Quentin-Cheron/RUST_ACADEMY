import type { Chapter } from "../../types";

export const d01: Chapter = {
  number: 1,
  slug: "decouvrir-docker",
  title: "Découvrir Docker",
  subtitle: "Comprendre les conteneurs, installer Docker et lancer son premier conteneur.",
  description:
    "Docker permet d'empaqueter une application avec tout ce dont elle a besoin pour tourner, puis de l'exécuter à l'identique sur n'importe quelle machine. Dans ce chapitre, on découvre ce qu'est vraiment un conteneur (et en quoi il diffère d'une machine virtuelle), on installe Docker, et on lance son tout premier conteneur avec `docker run`.",
  minutes: 20,
  rustBookRef: "Docs Docker — Get started",
  objectives: [
    "Expliquer ce qu'est un conteneur et le distinguer d'une VM",
    "Installer Docker et vérifier que le démon répond",
    "Lancer un conteneur avec docker run et lire sa sortie",
    "Distinguer une image d'un conteneur",
  ],
  sections: [
    {
      id: "pourquoi-docker",
      number: "1.1",
      title: "Pourquoi Docker ?",
      blocks: [
        {
          type: "paragraph",
          text: "« Ça marche sur ma machine » : la phrase que tout le monde a dite au moins une fois. Docker résout ce problème en empaquetant l'application **et son environnement** (bibliothèques, dépendances, configuration) dans une unité isolée et reproductible : le **conteneur**.",
        },
        {
          type: "paragraph",
          text: "Un conteneur partage le noyau du système hôte mais isole les processus, le système de fichiers et le réseau. C'est bien plus léger qu'une machine virtuelle, qui embarque un système d'exploitation complet.",
        },
        {
          type: "list",
          items: [
            "**Machine virtuelle** : un OS invité complet par-dessus un hyperviseur. Lourd (Go), démarre en minutes.",
            "**Conteneur** : partage le noyau de l'hôte, n'embarque que l'appli et ses dépendances. Léger (Mo), démarre en millisecondes.",
          ],
        },
        {
          type: "usecase",
          title: "Reproduire la production en local",
          text: "Ton API a besoin de PostgreSQL 16 et Redis 7 ? Au lieu de les installer sur ta machine, tu lances deux conteneurs aux versions exactes de la prod. Tu supprimes tout d'une commande, sans polluer ton système.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Image vs conteneur",
          text: "Une **image** est un modèle en lecture seule (comme une classe). Un **conteneur** est une instance en cours d'exécution de cette image (comme un objet). On lance plusieurs conteneurs à partir d'une même image.",
        },
      ],
    },
    {
      id: "installation",
      number: "1.2",
      title: "Installer Docker",
      blocks: [
        {
          type: "paragraph",
          text: "Sur Windows et macOS, on installe **Docker Desktop**, qui inclut le moteur Docker, la CLI et une interface graphique. Sur Linux, on installe **Docker Engine** directement.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Vérifie l'installation\ndocker --version        # ex: Docker version 27.3.1\ndocker info             # état du démon (daemon)\n\n# Le fameux test « hello-world »\ndocker run hello-world",
          caption: "Vérifier que Docker est bien installé et que le démon tourne.",
        },
        {
          type: "paragraph",
          text: "`docker run hello-world` télécharge une petite image depuis le **Docker Hub** (le registre public d'images), en crée un conteneur, l'exécute — il affiche un message puis s'arrête. Si tu vois « Hello from Docker! », tout fonctionne.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Si `docker info` renvoie « Cannot connect to the Docker daemon », c'est que le service Docker n'est pas démarré. Lance Docker Desktop (ou `sudo systemctl start docker` sous Linux).",
        },
      ],
    },
    {
      id: "premier-conteneur",
      number: "1.3",
      title: "Ton premier conteneur",
      blocks: [
        {
          type: "paragraph",
          text: "La commande centrale est `docker run <image>`. Elle télécharge l'image si besoin, puis démarre un conteneur. Quelques options que tu utiliseras tous les jours :",
        },
        {
          type: "code",
          language: "bash",
          code: "# Lancer un serveur web nginx, en arrière-plan (-d), port 8080 de l'hôte -> 80 du conteneur\ndocker run -d -p 8080:80 --name web nginx\n\n# Lister les conteneurs qui tournent\ndocker ps\n\n# Voir les logs, puis arrêter et supprimer\ndocker logs web\ndocker stop web\ndocker rm web",
          caption: "Le cycle de vie de base d'un conteneur.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "`-d` (detached) : le conteneur tourne en arrière-plan.",
            "`-p 8080:80` : publie le port. Format `hôte:conteneur`.",
            "`--name web` : donne un nom lisible au lieu d'un identifiant aléatoire.",
            "`nginx` : le nom de l'image (tag `latest` par défaut).",
          ],
        },
        {
          type: "usecase",
          title: "Essayer un outil sans l'installer",
          text: "Tu veux tester Node 22 sans toucher à ta machine ? `docker run -it node:22 node --version`. Le `-it` ouvre un terminal interactif. À la sortie, rien ne reste installé sur ton système.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`docker run --rm ...` supprime automatiquement le conteneur à son arrêt. Parfait pour les commandes ponctuelles qu'on ne veut pas laisser traîner.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d1-ex1",
      title: "Lancer nginx sur un port",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande `docker run` qui lance l'image **nginx** en arrière-plan, nommée `site`, en publiant le port **8080** de l'hôte vers le port **80** du conteneur.",
      hints: [
        "L'arrière-plan, c'est l'option `-d`.",
        "La publication de port suit le format `-p hôte:conteneur`.",
        "Le nom se donne avec `--name`.",
      ],
      starter: "docker run ",
      solution: "docker run -d -p 8080:80 --name site nginx",
      checks: [
        { label: "Utilise docker run", pattern: "docker\\s+run" },
        { label: "Lance en arrière-plan (-d)", pattern: "(^|\\s)-d(\\s|$|etach)" },
        { label: "Publie le port 8080 vers 80", pattern: "-p\\s+8080:80" },
        { label: "Nomme le conteneur « site »", pattern: "--name\\s+site" },
        { label: "Utilise l'image nginx", pattern: "\\bnginx\\b" },
      ],
    },
    {
      id: "d1-ex2",
      title: "Commande jetable",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Affiche la version de Node avec l'image `node:22`, **sans laisser de conteneur** après l'exécution. La commande à exécuter dans le conteneur est `node --version`.",
      hints: [
        "L'option qui supprime le conteneur à la fin est `--rm`.",
        "On passe la commande après le nom de l'image.",
      ],
      starter: "docker run ",
      solution: "docker run --rm node:22 node --version",
      checks: [
        { label: "Utilise docker run", pattern: "docker\\s+run" },
        { label: "Supprime le conteneur à la fin (--rm)", pattern: "--rm" },
        { label: "Utilise l'image node:22", pattern: "node:22" },
        { label: "Exécute node --version", pattern: "node\\s+--version" },
      ],
    },
    {
      id: "d1-ex3",
      title: "Nettoyer derrière soi",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Un conteneur nommé `web` tourne encore. Écris les **deux commandes** (une par ligne) qui l'arrêtent puis le suppriment.",
      hints: ["`docker stop <nom>` puis `docker rm <nom>`."],
      starter: "\n",
      solution: "docker stop web\ndocker rm web",
      checks: [
        { label: "Arrête le conteneur web", pattern: "docker\\s+stop\\s+web" },
        { label: "Supprime le conteneur web", pattern: "docker\\s+rm\\s+web" },
      ],
    },
    {
      id: "d1-ex4",
      title: "Conteneur interactif",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Lance l'image **ubuntu:24.04** en mode interactif avec un pseudo-terminal, ouvre un **bash**, et fais en sorte que le conteneur soit **supprimé automatiquement** à la sortie.",
      hints: [
        "`-it` combine interactif et pseudo-terminal.",
        "`--rm` supprime le conteneur à l'arrêt.",
        "La commande à lancer est `bash`.",
      ],
      starter: "docker run ",
      solution: "docker run -it --rm ubuntu:24.04 bash",
      checks: [
        { label: "Utilise docker run", pattern: "docker\\s+run" },
        { label: "Mode interactif (-it)", pattern: "-it\\b|-i\\s+-t" },
        { label: "Suppression automatique (--rm)", pattern: "--rm" },
        { label: "Image ubuntu:24.04", pattern: "ubuntu:24\\.04" },
        { label: "Ouvre un bash", pattern: "\\bbash\\b" },
      ],
    },
    {
      id: "d1-ex5",
      title: "Inspecter un conteneur",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Affiche **uniquement l'adresse IP** du conteneur **web** en utilisant `docker inspect` avec l'option `--format`. Le template Go est : `'{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'`.",
      hints: [
        "`docker inspect` affiche toute la config d'un conteneur.",
        "`--format` filtre la sortie avec un template Go.",
      ],
      starter: "docker inspect ",
      solution: "docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web",
      checks: [
        { label: "Utilise docker inspect", pattern: "docker\\s+inspect" },
        { label: "Utilise --format", pattern: "--format" },
        { label: "Template avec IPAddress", pattern: "IPAddress" },
        { label: "Cible le conteneur web", pattern: "\\bweb\\b" },
      ],
    },
    {
      id: "d1-ex6",
      title: "Multi-conteneurs à la main",
      difficulty: "difficile",
      language: "bash",
      prompt:
        "Lance trois commandes (une par ligne) : (1) **nginx** nommé `front`, port **3000:80**, arrière-plan ; (2) **redis:7** nommé `cache`, port **6380:6379**, arrière-plan ; (3) liste les conteneurs actifs.",
      hints: [
        "Chaque conteneur a besoin de `-d`, `--name` et `-p`.",
        "`docker ps` liste les conteneurs qui tournent.",
      ],
      starter: "# 1. Nginx\n\n# 2. Redis\n\n# 3. Lister\n",
      solution:
        "docker run -d --name front -p 3000:80 nginx\ndocker run -d --name cache -p 6380:6379 redis:7\ndocker ps",
      checks: [
        { label: "Nginx nommé front, port 3000:80", pattern: "--name\\s+front[\\s\\S]*-p\\s+3000:80|-p\\s+3000:80[\\s\\S]*--name\\s+front" },
        { label: "Redis nommé cache, port 6380:6379", pattern: "--name\\s+cache[\\s\\S]*-p\\s+6380:6379|-p\\s+6380:6379[\\s\\S]*--name\\s+cache" },
        { label: "Image redis:7", pattern: "redis:7" },
        { label: "Liste les conteneurs (docker ps)", pattern: "docker\\s+ps" },
      ],
    },
  ],
  project: {
    id: "d1-projet",
    title: "Mini-stack de test",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Prépare un petit environnement de test. Écris les commandes qui : (1) lancent **PostgreSQL 16** en arrière-plan, nommé `db`, avec le mot de passe `secret` (variable d'environnement `POSTGRES_PASSWORD`), port `5432` publié ; (2) lancent **Redis 7** en arrière-plan nommé `cache`, port `6379` publié ; (3) listent les conteneurs actifs.",
    hints: [
      "Une variable d'environnement se passe avec `-e CLE=valeur`.",
      "L'image officielle Postgres est `postgres:16`, Redis c'est `redis:7`.",
      "`docker ps` liste les conteneurs en cours.",
    ],
    starter:
      "# 1. PostgreSQL\ndocker run \n\n# 2. Redis\ndocker run \n\n# 3. Lister\n",
    solution:
      "# 1. PostgreSQL\ndocker run -d --name db -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16\n\n# 2. Redis\ndocker run -d --name cache -p 6379:6379 redis:7\n\n# 3. Lister\ndocker ps",
    checks: [
      { label: "Postgres en arrière-plan nommé db", pattern: "run\\s+.*-d.*--name\\s+db|run\\s+.*--name\\s+db.*-d" },
      { label: "Mot de passe Postgres via -e", pattern: "-e\\s+POSTGRES_PASSWORD=secret" },
      { label: "Port Postgres 5432 publié", pattern: "-p\\s+5432:5432" },
      { label: "Image postgres:16", pattern: "postgres:16" },
      { label: "Redis nommé cache, port 6379", pattern: "--name\\s+cache[\\s\\S]*-p\\s+6379:6379|-p\\s+6379:6379[\\s\\S]*--name\\s+cache" },
      { label: "Image redis:7", pattern: "redis:7" },
      { label: "Liste les conteneurs (docker ps)", pattern: "docker\\s+ps" },
    ],
  },
  keyTakeaways: [
    "Un conteneur isole une appli et ses dépendances en partageant le noyau de l'hôte : bien plus léger qu'une VM.",
    "Une image est un modèle en lecture seule ; un conteneur est une instance en cours d'exécution.",
    "`docker run` télécharge l'image si besoin puis démarre un conteneur.",
    "`-d` (arrière-plan), `-p hôte:conteneur` (port), `--name`, `-e` (variable d'env), `--rm` (auto-suppression).",
    "`docker ps`, `docker logs`, `docker stop`, `docker rm` gèrent le cycle de vie.",
  ],
};
