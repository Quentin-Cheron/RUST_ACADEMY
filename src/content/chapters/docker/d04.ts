import type { Chapter } from "../../types";

export const d04: Chapter = {
  number: 4,
  slug: "volumes-et-donnees",
  title: "Volumes & persistance",
  subtitle: "Conserver les données au-delà de la vie d'un conteneur.",
  description:
    "Par défaut, tout ce qu'écrit un conteneur disparaît quand on le supprime. Pour une base de données, c'est catastrophique. Ce chapitre explique comment persister et partager des données avec les **volumes** et les **bind mounts**, et quand utiliser l'un ou l'autre.",
  minutes: 25,
  rustBookRef: "Docs Docker — Manage data",
  objectives: [
    "Comprendre pourquoi le système de fichiers d'un conteneur est éphémère",
    "Créer et monter un volume nommé pour persister des données",
    "Utiliser un bind mount pour développer en direct",
    "Choisir entre volume et bind mount selon le besoin",
  ],
  sections: [
    {
      id: "ephemere",
      number: "4.1",
      title: "Le système de fichiers est éphémère",
      blocks: [
        {
          type: "paragraph",
          text: "La couche d'écriture d'un conteneur vit et meurt avec lui. Supprime le conteneur, et tout ce qu'il a écrit dedans est perdu. Pour une base de données PostgreSQL, cela signifie **perdre toutes les données** au premier `docker rm`.",
        },
        {
          type: "list",
          items: [
            "**Volume nommé** : géré par Docker, stocké dans une zone dédiée. Idéal pour les données de production (bases de données).",
            "**Bind mount** : monte un dossier de l'hôte dans le conteneur. Idéal pour le développement (le code change en direct).",
            "**tmpfs** : stockage en mémoire, effacé à l'arrêt. Pour des données sensibles temporaires.",
          ],
        },
        {
          type: "callout",
          variant: "danger",
          title: "L'erreur classique",
          text: "Lancer `postgres` sans volume, remplir la base, puis faire `docker rm -f db` : toutes les données sont irrécupérables. Un volume aurait tout sauvé.",
        },
      ],
    },
    {
      id: "volumes",
      number: "4.2",
      title: "Les volumes nommés",
      blocks: [
        {
          type: "paragraph",
          text: "Un volume nommé est créé et géré par Docker. On le monte avec `-v nom:/chemin/dans/le/conteneur`. Les données survivent à la suppression du conteneur.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Créer explicitement un volume (optionnel : -v le crée à la volée)\ndocker volume create pgdata\n\n# Monter le volume sur le dossier de données de Postgres\ndocker run -d --name db \\\n  -e POSTGRES_PASSWORD=secret \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16\n\n# Lister et inspecter\ndocker volume ls\ndocker volume inspect pgdata",
          caption: "Persister les données de Postgres dans un volume nommé.",
        },
        {
          type: "usecase",
          title: "Recréer un conteneur sans perdre les données",
          text: "Tu veux passer Postgres 15 à 16 ? Tu supprimes le conteneur `db`, tu en relances un neuf sur le **même volume** `pgdata`. Le conteneur est jetable, les données restent. C'est tout l'intérêt de séparer calcul et stockage.",
        },
      ],
    },
    {
      id: "bind-mounts",
      number: "4.3",
      title: "Les bind mounts pour développer",
      blocks: [
        {
          type: "paragraph",
          text: "Un **bind mount** relie un dossier de ta machine à un dossier du conteneur. Tu édites un fichier sur l'hôte, le conteneur le voit **instantanément** — parfait pour le rechargement à chaud en développement.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Monter le dossier courant dans /app du conteneur\n# $(pwd) sous macOS/Linux ; sous PowerShell : ${PWD}\ndocker run -d --name dev \\\n  -p 3000:3000 \\\n  -v $(pwd):/app \\\n  -w /app \\\n  node:22-alpine npm run dev",
          caption: "Développer avec rechargement à chaud grâce à un bind mount.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Volume vs bind mount",
          text: "Règle simple : **volume nommé** pour des données que Docker doit conserver (bases de données) ; **bind mount** pour du code source qu'on édite en direct pendant le développement.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Un bind mount masque le contenu d'origine du dossier dans l'image. Si tu montes ton dossier hôte sur `/app`, le `node_modules` construit dans l'image devient invisible. On contourne souvent avec un volume anonyme sur `/app/node_modules`.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d4-ex1",
      title: "Persister une base",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Lance **postgres:16** en arrière-plan, nommé **db**, mot de passe `secret`, en montant le volume nommé **pgdata** sur `/var/lib/postgresql/data`.",
      hints: ["Le volume se monte avec `-v nom:/chemin`.", "Combine `-d`, `--name`, `-e`, `-v`."],
      starter: "docker run ",
      solution:
        "docker run -d --name db -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16",
      checks: [
        { label: "docker run en arrière-plan", pattern: "docker\\s+run[\\s\\S]*-d\\b" },
        { label: "Conteneur nommé db", pattern: "--name\\s+db" },
        { label: "Mot de passe défini", pattern: "-e\\s+POSTGRES_PASSWORD=secret" },
        { label: "Volume pgdata monté au bon endroit", pattern: "-v\\s+pgdata:/var/lib/postgresql/data" },
        { label: "Image postgres:16", pattern: "postgres:16" },
      ],
    },
    {
      id: "d4-ex2",
      title: "Créer un volume",
      difficulty: "facile",
      language: "bash",
      prompt: "Crée explicitement un volume nommé **appdata**.",
      hints: ["`docker volume create <nom>`."],
      starter: "docker volume ",
      solution: "docker volume create appdata",
      checks: [
        { label: "Utilise docker volume create", pattern: "docker\\s+volume\\s+create" },
        { label: "Nom du volume : appdata", pattern: "appdata" },
      ],
    },
    {
      id: "d4-ex3",
      title: "Bind mount de développement",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Lance **node:22-alpine** en montant le **dossier courant** dans `/app`, avec `/app` comme répertoire de travail, port `3000` publié, et la commande `npm run dev`. Utilise `$(pwd)` pour le dossier courant.",
      hints: [
        "`-v $(pwd):/app` relie l'hôte au conteneur.",
        "`-w /app` définit le répertoire de travail.",
      ],
      starter: "docker run ",
      solution: "docker run -p 3000:3000 -v $(pwd):/app -w /app node:22-alpine npm run dev",
      checks: [
        { label: "Utilise docker run", pattern: "docker\\s+run" },
        { label: "Port 3000 publié", pattern: "-p\\s+3000:3000" },
        { label: "Bind mount du dossier courant vers /app", pattern: "-v\\s+\\$\\(pwd\\):/app" },
        { label: "Répertoire de travail /app", pattern: "-w\\s+/app" },
        { label: "Lance npm run dev", pattern: "npm\\s+run\\s+dev" },
      ],
    },
    {
      id: "d4-ex4",
      title: "Inspecter un volume",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Écris deux commandes (une par ligne) : (1) **liste tous les volumes** Docker, (2) **inspecte** le volume nommé **pgdata** pour voir ses détails.",
      hints: [
        "`docker volume ls` liste les volumes.",
        "`docker volume inspect <nom>` montre les détails.",
      ],
      starter: "# 1. Lister\n\n# 2. Inspecter\n",
      solution: "docker volume ls\ndocker volume inspect pgdata",
      checks: [
        { label: "Liste les volumes", pattern: "docker\\s+volume\\s+ls" },
        { label: "Inspecte le volume pgdata", pattern: "docker\\s+volume\\s+inspect\\s+pgdata" },
      ],
    },
    {
      id: "d4-ex5",
      title: "Volume anonyme pour node_modules",
      difficulty: "difficile",
      language: "bash",
      prompt:
        "Lance **node:22-alpine** avec un bind mount de `$(pwd)` vers `/app` PLUS un **volume anonyme** sur `/app/node_modules` (pour préserver les `node_modules` installés dans l'image). Port `3000`, répertoire de travail `/app`, commande `npm run dev`.",
      hints: [
        "Le bind mount écrase le contenu de l'image. Un volume anonyme sur `/app/node_modules` le protège.",
        "Syntaxe du volume anonyme : `-v /app/node_modules` (sans nom ni chemin hôte).",
      ],
      starter: "docker run ",
      solution:
        "docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules -w /app node:22-alpine npm run dev",
      checks: [
        { label: "Bind mount du code source", pattern: "-v\\s+\\$\\(pwd\\):/app" },
        { label: "Volume anonyme pour node_modules", pattern: "-v\\s+/app/node_modules" },
        { label: "Port 3000 publié", pattern: "-p\\s+3000:3000" },
        { label: "Répertoire de travail /app", pattern: "-w\\s+/app" },
        { label: "Commande npm run dev", pattern: "npm\\s+run\\s+dev" },
      ],
    },
  ],
  project: {
    id: "d4-projet",
    title: "Base durable + admin",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Mets en place une base qui survit aux suppressions. (1) Crée un volume **pgdata**. (2) Lance **postgres:16** nommé **db**, mot de passe `secret`, base `app` (variable `POSTGRES_DB`), sur le volume `pgdata` (chemin `/var/lib/postgresql/data`), port `5432`. (3) Simule un incident : supprime de force le conteneur `db`. (4) Relance un conteneur **db** neuf sur le **même volume** — les données doivent être intactes.",
    hints: [
      "Le volume est réutilisé tel quel : les données restent.",
      "`POSTGRES_DB=app` crée la base au premier démarrage.",
      "Étapes 2 et 4 sont quasi identiques : même `-v pgdata:...`.",
    ],
    starter:
      "# 1. Volume\n\n# 2. Lancer la base\n\n# 3. Incident : suppression forcée\n\n# 4. Relancer sur le même volume\n",
    solution:
      "# 1. Volume\ndocker volume create pgdata\n\n# 2. Lancer la base\ndocker run -d --name db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app -v pgdata:/var/lib/postgresql/data -p 5432:5432 postgres:16\n\n# 3. Incident : suppression forcée\ndocker rm -f db\n\n# 4. Relancer sur le même volume\ndocker run -d --name db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app -v pgdata:/var/lib/postgresql/data -p 5432:5432 postgres:16",
    checks: [
      { label: "Crée le volume pgdata", pattern: "docker\\s+volume\\s+create\\s+pgdata" },
      { label: "Base app créée (POSTGRES_DB)", pattern: "-e\\s+POSTGRES_DB=app" },
      { label: "Volume monté sur le dossier de données", pattern: "-v\\s+pgdata:/var/lib/postgresql/data" },
      { label: "Incident simulé (rm -f db)", pattern: "docker\\s+rm\\s+-f\\s+db" },
      {
        label: "Base relancée sur le même volume après l'incident",
        pattern: "docker\\s+rm\\s+-f\\s+db[\\s\\S]*-v\\s+pgdata:/var/lib/postgresql/data",
      },
    ],
  },
  keyTakeaways: [
    "Le système de fichiers d'un conteneur est éphémère : sans volume, les données meurent avec le conteneur.",
    "Volume nommé (`-v nom:/chemin`) : géré par Docker, idéal pour les bases de données.",
    "Bind mount (`-v $(pwd):/app`) : relie un dossier de l'hôte, idéal pour développer en direct.",
    "Le conteneur devient jetable : on le recrée sur le même volume sans perdre les données.",
    "`docker volume ls` / `inspect` / `prune` gèrent les volumes.",
  ],
};
