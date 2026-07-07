import type { Chapter } from "../../types";

export const d05: Chapter = {
  number: 5,
  slug: "reseau-et-ports",
  title: "Réseau & ports",
  subtitle: "Publier des ports et faire communiquer les conteneurs entre eux.",
  description:
    "Une application isolée sert rarement à quelque chose : elle doit être joignable depuis l'extérieur et parler à ses dépendances (base de données, cache…). Ce chapitre explique la publication de ports, les réseaux Docker, et comment un conteneur en appelle un autre par son nom.",
  minutes: 25,
  rustBookRef: "Docs Docker — Networking",
  objectives: [
    "Publier un port d'un conteneur vers l'hôte",
    "Créer un réseau et y attacher plusieurs conteneurs",
    "Faire communiquer deux conteneurs par leur nom",
    "Comprendre la résolution DNS interne de Docker",
  ],
  sections: [
    {
      id: "publier-ports",
      number: "5.1",
      title: "Publier des ports",
      blocks: [
        {
          type: "paragraph",
          text: "Par défaut, un conteneur n'est **pas** joignable depuis l'hôte. Il faut **publier** un port avec `-p hôte:conteneur`. Le trafic reçu sur le port de l'hôte est redirigé vers le port du conteneur.",
        },
        {
          type: "code",
          language: "bash",
          code: "# 8080 de l'hôte -> 80 du conteneur\ndocker run -d -p 8080:80 nginx\n\n# Ne publier que sur localhost (pas exposé sur le réseau)\ndocker run -d -p 127.0.0.1:8080:80 nginx\n\n# Laisser Docker choisir un port hôte libre\ndocker run -d -p 80 nginx\ndocker port <conteneur>   # voir le mapping choisi",
          caption: "Différentes façons de publier un port.",
        },
        {
          type: "callout",
          variant: "info",
          title: "EXPOSE ne publie rien",
          text: "L'instruction `EXPOSE` d'un Dockerfile ne fait que **documenter** le port écouté. Pour rendre le conteneur joignable, il faut `-p` au `docker run` (ou `ports:` dans Compose).",
        },
      ],
    },
    {
      id: "reseaux",
      number: "5.2",
      title: "Les réseaux Docker",
      blocks: [
        {
          type: "paragraph",
          text: "Deux conteneurs sur le **même réseau défini par l'utilisateur** peuvent se joindre par leur **nom**. Docker fournit un DNS interne : `db` résout vers l'adresse IP du conteneur `db`. C'est la base de toute application multi-conteneurs.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Créer un réseau dédié\ndocker network create app-net\n\n# Attacher les conteneurs à ce réseau\ndocker run -d --name db --network app-net \\\n  -e POSTGRES_PASSWORD=secret postgres:16\n\ndocker run -d --name api --network app-net \\\n  -e DATABASE_URL=postgres://db:5432/app -p 4000:4000 mon-api:1.0",
          caption: "L'API joint la base via le nom d'hôte « db ».",
        },
        {
          type: "usecase",
          title: "Un backend qui parle à sa base",
          text: "Dans l'URL `postgres://db:5432/app`, le `db` n'est pas une adresse IP figée : c'est le **nom du conteneur** de base de données. Tant que les deux conteneurs partagent le réseau `app-net`, l'API le résout automatiquement. Plus besoin de connaître d'adresse IP.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "La résolution par nom **ne marche pas** sur le réseau `bridge` par défaut. Il faut créer un réseau utilisateur (`docker network create`) — ou laisser Docker Compose le faire pour toi.",
        },
      ],
    },
    {
      id: "inspecter-reseau",
      number: "5.3",
      title: "Inspecter et nettoyer",
      blocks: [
        {
          type: "paragraph",
          text: "Quelques commandes pour comprendre qui est branché où :",
        },
        {
          type: "code",
          language: "bash",
          code: "docker network ls                 # lister les réseaux\ndocker network inspect app-net    # voir les conteneurs attachés\ndocker network connect app-net web   # brancher un conteneur existant\ndocker network disconnect app-net web\ndocker network rm app-net         # supprimer (doit être vide)\ndocker network prune              # supprimer les réseaux inutilisés",
          caption: "Gérer les réseaux au quotidien.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Isole tes stacks : un réseau par application. Ainsi les conteneurs d'un projet ne peuvent pas joindre par erreur ceux d'un autre.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d5-ex1",
      title: "Publier localhost seulement",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Lance **nginx** en arrière-plan en publiant le port **80** du conteneur, mais **uniquement sur localhost** (127.0.0.1) au port **8080** de l'hôte.",
      hints: ["Le format complet est `-p ip:hôte:conteneur`.", "Ici l'ip est 127.0.0.1."],
      starter: "docker run ",
      solution: "docker run -d -p 127.0.0.1:8080:80 nginx",
      checks: [
        { label: "docker run en arrière-plan", pattern: "docker\\s+run[\\s\\S]*-d\\b" },
        { label: "Publie seulement sur 127.0.0.1", pattern: "-p\\s+127\\.0\\.0\\.1:8080:80" },
        { label: "Image nginx", pattern: "\\bnginx\\b" },
      ],
    },
    {
      id: "d5-ex2",
      title: "Créer un réseau",
      difficulty: "facile",
      language: "bash",
      prompt: "Crée un réseau utilisateur nommé **app-net**.",
      hints: ["`docker network create <nom>`."],
      starter: "docker network ",
      solution: "docker network create app-net",
      checks: [
        { label: "Utilise docker network create", pattern: "docker\\s+network\\s+create" },
        { label: "Réseau nommé app-net", pattern: "app-net" },
      ],
    },
    {
      id: "d5-ex3",
      title: "Relier deux conteneurs",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Le réseau `app-net` existe déjà. Lance l'API **mon-api:1.0** nommée **api**, sur le réseau **app-net**, port `4000` publié, avec `DATABASE_URL=postgres://db:5432/app` (elle joint la base par son nom `db`).",
      hints: [
        "`--network app-net` attache le conteneur au réseau.",
        "Le nom d'hôte `db` dans l'URL = le nom du conteneur de base.",
      ],
      starter: "docker run ",
      solution:
        "docker run -d --name api --network app-net -e DATABASE_URL=postgres://db:5432/app -p 4000:4000 mon-api:1.0",
      checks: [
        { label: "docker run en arrière-plan", pattern: "docker\\s+run[\\s\\S]*-d\\b" },
        { label: "Conteneur nommé api", pattern: "--name\\s+api" },
        { label: "Attaché au réseau app-net", pattern: "--network\\s+app-net" },
        { label: "URL de base pointant sur l'hôte db", pattern: "postgres://db:5432/app" },
        { label: "Port 4000 publié", pattern: "-p\\s+4000:4000" },
      ],
    },
    {
      id: "d5-ex4",
      title: "Connecter un conteneur existant",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Un conteneur **web** tourne déjà. Connecte-le au réseau existant **app-net** sans le redémarrer.",
      hints: ["`docker network connect` attache un conteneur à un réseau."],
      starter: "docker network ",
      solution: "docker network connect app-net web",
      checks: [
        { label: "Utilise docker network connect", pattern: "docker\\s+network\\s+connect" },
        { label: "Réseau app-net", pattern: "app-net" },
        { label: "Conteneur web", pattern: "\\bweb\\b" },
      ],
    },
    {
      id: "d5-ex5",
      title: "Inspecter le réseau",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Écris deux commandes (une par ligne) : (1) **liste tous les réseaux** Docker, (2) **inspecte** le réseau **app-net** pour voir quels conteneurs y sont attachés.",
      hints: [
        "`docker network ls` liste les réseaux.",
        "`docker network inspect <nom>` montre les détails.",
      ],
      starter: "# 1. Lister\n\n# 2. Inspecter\n",
      solution: "docker network ls\ndocker network inspect app-net",
      checks: [
        { label: "Liste les réseaux", pattern: "docker\\s+network\\s+ls" },
        { label: "Inspecte app-net", pattern: "docker\\s+network\\s+inspect\\s+app-net" },
      ],
    },
    {
      id: "d5-ex6",
      title: "Trois conteneurs sur un réseau",
      difficulty: "difficile",
      language: "bash",
      prompt:
        "Écris quatre commandes (une par ligne) : (1) crée le réseau **stack-net**, (2) lance **postgres:16** nommé `db` sur ce réseau (mot de passe `secret`), (3) lance **redis:7** nommé `cache` sur ce réseau, (4) lance **mon-api:1.0** nommée `api` sur ce réseau, port `4000`, avec `DATABASE_URL=postgres://db:5432/app` et `REDIS_URL=redis://cache:6379`.",
      hints: [
        "Chaque conteneur utilise `--network stack-net`.",
        "Les services se joignent par leur nom sur le même réseau.",
      ],
      starter: "# 1. Réseau\n\n# 2. Postgres\n\n# 3. Redis\n\n# 4. API\n",
      solution:
        "docker network create stack-net\ndocker run -d --name db --network stack-net -e POSTGRES_PASSWORD=secret postgres:16\ndocker run -d --name cache --network stack-net redis:7\ndocker run -d --name api --network stack-net -e DATABASE_URL=postgres://db:5432/app -e REDIS_URL=redis://cache:6379 -p 4000:4000 mon-api:1.0",
      checks: [
        { label: "Crée le réseau stack-net", pattern: "docker\\s+network\\s+create\\s+stack-net" },
        { label: "Postgres sur stack-net", pattern: "--name\\s+db[\\s\\S]*--network\\s+stack-net|--network\\s+stack-net[\\s\\S]*--name\\s+db" },
        { label: "Redis sur stack-net", pattern: "--name\\s+cache[\\s\\S]*--network\\s+stack-net|--network\\s+stack-net[\\s\\S]*--name\\s+cache" },
        { label: "API avec DATABASE_URL pointant sur db", pattern: "DATABASE_URL=postgres://db:5432/app" },
        { label: "API avec REDIS_URL pointant sur cache", pattern: "REDIS_URL=redis://cache:6379" },
        { label: "Port 4000 publié pour l'API", pattern: "-p\\s+4000:4000" },
      ],
    },
  ],
  project: {
    id: "d5-projet",
    title: "Stack API + base en réseau",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Assemble une stack à la main. (1) Crée le réseau **app-net**. (2) Lance **postgres:16** nommé **db** sur ce réseau, mot de passe `secret`, base `app`, volume `pgdata` sur `/var/lib/postgresql/data`. (3) Lance **mon-api:1.0** nommée **api** sur ce réseau, port `4000` publié, `DATABASE_URL=postgres://db:5432/app`. (4) Vérifie que les deux conteneurs sont bien attachés au réseau.",
    hints: [
      "L'API joint la base par le nom `db` grâce au réseau partagé.",
      "`docker network inspect app-net` liste les conteneurs branchés.",
    ],
    starter:
      "# 1. Réseau\n\n# 2. Base\n\n# 3. API\n\n# 4. Vérification\n",
    solution:
      "# 1. Réseau\ndocker network create app-net\n\n# 2. Base\ndocker run -d --name db --network app-net -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app -v pgdata:/var/lib/postgresql/data postgres:16\n\n# 3. API\ndocker run -d --name api --network app-net -e DATABASE_URL=postgres://db:5432/app -p 4000:4000 mon-api:1.0\n\n# 4. Vérification\ndocker network inspect app-net",
    checks: [
      { label: "Crée le réseau app-net", pattern: "docker\\s+network\\s+create\\s+app-net" },
      { label: "Base sur le réseau app-net", pattern: "--name\\s+db[\\s\\S]*--network\\s+app-net|--network\\s+app-net[\\s\\S]*--name\\s+db" },
      { label: "API sur le réseau app-net", pattern: "--name\\s+api[\\s\\S]*--network\\s+app-net|--network\\s+app-net[\\s\\S]*--name\\s+api" },
      { label: "API joint la base par le nom db", pattern: "postgres://db:5432/app" },
      { label: "Vérifie le réseau (inspect)", pattern: "docker\\s+network\\s+inspect\\s+app-net" },
    ],
  },
  keyTakeaways: [
    "Un conteneur n'est joignable que si on publie un port avec `-p hôte:conteneur`.",
    "EXPOSE documente ; `-p` publie réellement.",
    "Sur un réseau utilisateur, les conteneurs se joignent par leur nom (DNS interne de Docker).",
    "La résolution par nom ne marche pas sur le bridge par défaut : crée un réseau avec `docker network create`.",
    "Un réseau par application pour isoler les stacks.",
  ],
};
