import type { Chapter } from "../../types";

export const d08: Chapter = {
  number: 8,
  slug: "compose-avance",
  title: "Docker Compose avancé",
  subtitle: "Variables, healthchecks, profiles et builds dans Compose.",
  description:
    "Le chapitre précédent posait les bases de Compose. Ici on passe aux fonctionnalités avancées : fichiers `.env` et interpolation de variables, dépendances conditionnelles avec healthchecks, **profiles** pour activer des services selon le contexte, builds paramétrés avec `target`, et **docker compose watch** pour le rechargement automatique en développement.",
  minutes: 35,
  rustBookRef: "Docs Docker — Compose advanced",
  objectives: [
    "Utiliser des fichiers .env et l'interpolation de variables dans compose.yaml",
    "Configurer des healthchecks et des dépendances conditionnelles",
    "Activer des services selon le contexte avec les profiles",
    "Paramétrer le build dans Compose (context, target, args)",
    "Configurer docker compose watch pour le rechargement automatique",
    "Composer des stacks modulaires avec include et extends",
  ],
  sections: [
    {
      id: "env-interpolation",
      number: "8.1",
      title: "Variables d'environnement et fichiers .env",
      blocks: [
        {
          type: "paragraph",
          text: "Compose charge automatiquement un fichier `.env` placé à côté du `compose.yaml`. Les variables définies dedans sont utilisables dans le fichier Compose via la syntaxe `${VARIABLE}`.",
        },
        {
          type: "code",
          language: "text",
          filename: ".env",
          code: "POSTGRES_VERSION=16\nPOSTGRES_PASSWORD=supersecret\nDB_NAME=myapp\nAPI_PORT=4000",
          caption: "Le fichier .env contient les valeurs configurables.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  db:\n    image: postgres:${POSTGRES_VERSION}\n    environment:\n      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}\n\n  api:\n    build: .\n    ports:\n      - \"${API_PORT}:${API_PORT}\"\n    env_file: .env",
          caption: "Les ${...} sont remplacés par les valeurs du .env au démarrage.",
        },
        {
          type: "list",
          items: [
            "**${VARIABLE}** dans le fichier Compose : interpolation (remplacée par la valeur).",
            "**env_file: .env** sous un service : charge les variables **dans le conteneur** (runtime).",
            "**environment:** : définit des variables manuellement (priorité sur env_file).",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Ne commitez pas le .env en production",
          text: "Le fichier `.env` contient souvent des secrets (mots de passe, clés API). Ajoutez-le au `.gitignore` et fournissez un `.env.example` avec des valeurs factices pour documenter les variables attendues.",
        },
      ],
    },
    {
      id: "healthchecks-depends",
      number: "8.2",
      title: "Healthchecks et dépendances intelligentes",
      blocks: [
        {
          type: "paragraph",
          text: "`depends_on` sans condition ne fait qu'ordonner le démarrage des conteneurs. Mais un conteneur Postgres « démarré » ne veut pas dire « prêt à accepter des connexions ». Avec `condition: service_healthy`, Compose attend que le healthcheck du service passe au vert.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n      start_period: 10s\n\n  redis:\n    image: redis:7\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      retries: 3",
          caption: "L'API ne démarre que quand la base ET le cache sont prêts.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Healthchecks courants",
          text: "**Postgres** : `pg_isready -U postgres`. **Redis** : `redis-cli ping`. **HTTP** : `curl -f http://localhost:PORT/health || exit 1`. **MySQL** : `mysqladmin ping -h localhost`.",
        },
      ],
    },
    {
      id: "profiles-extends",
      number: "8.3",
      title: "Profiles et override",
      blocks: [
        {
          type: "paragraph",
          text: "Les **profiles** permettent d'inclure certains services uniquement quand on les demande. Parfait pour les outils de debug, d'administration ou de monitoring qu'on ne veut pas en prod.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n\n  adminer:\n    image: adminer\n    ports:\n      - \"8080:8080\"\n    profiles:\n      - debug\n\n  mailhog:\n    image: mailhog/mailhog\n    ports:\n      - \"8025:8025\"\n    profiles:\n      - debug",
          caption: "adminer et mailhog ne démarrent qu'avec --profile debug.",
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose up -d                   # api + db seulement\ndocker compose --profile debug up -d   # api + db + adminer + mailhog",
          caption: "Les services avec un profile ne sont inclus que si on active ce profile.",
        },
        {
          type: "heading",
          level: 3,
          text: "Fichiers override",
        },
        {
          type: "paragraph",
          text: "Compose fusionne automatiquement `compose.yaml` et `compose.override.yaml` (s'il existe). On met la config de base dans le premier, et les surcharges de développement (bind mounts, ports de debug) dans l'override.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.override.yaml",
          code: "services:\n  api:\n    volumes:\n      - .:/app\n    environment:\n      DEBUG: \"true\"",
          caption: "Automatiquement fusionné avec compose.yaml en dev.",
        },
      ],
    },
    {
      id: "build-compose",
      number: "8.4",
      title: "Build dans Compose",
      blocks: [
        {
          type: "paragraph",
          text: "Au lieu d'un simple `build: .`, Compose accepte une configuration détaillée : contexte, Dockerfile, target de multi-stage, arguments de build.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  api:\n    build:\n      context: .\n      dockerfile: Dockerfile\n      target: production\n      args:\n        NODE_ENV: production\n        API_VERSION: \"2.0\"\n    ports:\n      - \"4000:4000\"",
          caption: "Build paramétré avec un target multi-stage et des ARG.",
        },
        {
          type: "list",
          items: [
            "**context** : le dossier envoyé comme contexte de build (défaut `.`).",
            "**dockerfile** : chemin du Dockerfile (défaut `Dockerfile`).",
            "**target** : stage spécifique d'un multi-stage build (ex: `production`, `development`).",
            "**args** : variables passées comme `--build-arg` (utilisées par les `ARG` du Dockerfile).",
          ],
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose build             # construit toutes les images\ndocker compose build api         # construit uniquement le service api\ndocker compose up --build -d     # construit puis démarre",
          caption: "Par défaut, Compose ne rebuild pas si l'image existe déjà.",
        },
      ],
    },
    {
      id: "watch",
      number: "8.5",
      title: "docker compose watch",
      blocks: [
        {
          type: "paragraph",
          text: "`docker compose watch` surveille les fichiers sources et réagit automatiquement aux changements. C'est le remplacement moderne des bind mounts pour le développement, plus fiable et plus performant.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json",
          caption: "Les fichiers src/ sont synchronisés en live ; un changement de package.json déclenche un rebuild.",
        },
        {
          type: "list",
          items: [
            "**sync** : copie les fichiers modifiés dans le conteneur sans redémarrer.",
            "**rebuild** : reconstruit l'image et recrée le conteneur.",
            "**sync+restart** : copie les fichiers puis redémarre le conteneur.",
          ],
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose watch    # démarre et surveille les changements",
          caption: "Lancez watch à la place de up pour le développement.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "`docker compose watch` est plus propre qu'un bind mount car il respecte le `.dockerignore` et ne synchronise que les chemins déclarés. Plus besoin du hack du volume anonyme pour node_modules.",
        },
      ],
    },
    {
      id: "cas-pratique-blog",
      number: "8.6",
      title: "Cas pratique : stack d'un blog",
      blocks: [
        {
          type: "paragraph",
          text: "On assemble un **blog complet** : un frontend Next.js, une API Express, PostgreSQL pour les articles et Redis pour le cache de sessions. Chaque ligne est commentée.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le fichier .env",
        },
        {
          type: "code",
          language: "text",
          filename: ".env",
          code: "# ── Base de données ─────────────────────────────────────\n# Utilisé par Compose (interpolation ${...}) ET par l'API (env_file).\nPOSTGRES_USER=blog\nPOSTGRES_PASSWORD=s3cret_P@ss!\nPOSTGRES_DB=blog_prod\n\n# ── API ─────────────────────────────────────────────────\nAPI_PORT=4000\n# L'URL utilise le nom du service « db » comme hostname (DNS Docker).\nDATABASE_URL=postgres://blog:s3cret_P@ss!@db:5432/blog_prod\n# Pareil pour Redis : le hostname est le nom du service « redis ».\nREDIS_URL=redis://redis:6379\nSESSION_SECRET=change-moi-en-production\n\n# ── Frontend ────────────────────────────────────────────\nNEXT_PUBLIC_API_URL=http://localhost/api",
          caption: "Un seul fichier centralise toute la config. Jamais commité en production.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le compose.yaml principal",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  # ── Base de données PostgreSQL ─────────────────────────\n  db:\n    image: postgres:16-alpine          # Alpine = plus léger (~80 Mo vs ~400 Mo)\n    environment:                        # Variables lues par l'image officielle Postgres\n      POSTGRES_USER: ${POSTGRES_USER}   # Interpolé depuis .env au démarrage de Compose\n      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}\n      POSTGRES_DB: ${POSTGRES_DB}\n    volumes:\n      - pgdata:/var/lib/postgresql/data # Volume nommé = données persistées entre les restarts\n    healthcheck:                        # Compose attend que ce test passe avant de démarrer l'API\n      test: [\"CMD-SHELL\", \"pg_isready -U ${POSTGRES_USER}\"]\n      interval: 5s\n      retries: 5\n    restart: unless-stopped             # Redémarre auto sauf si arrêté manuellement\n\n  # ── Cache Redis ───────────────────────────────────────\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]  # Répond « PONG » si Redis est prêt\n      interval: 5s\n      retries: 3\n    restart: unless-stopped\n\n  # ── API Express (backend) ─────────────────────────────\n  api:\n    build:                              # Construit l'image depuis le Dockerfile local\n      context: ./api                    # Le contexte de build est le dossier api/\n      target: production                # Utilise le stage « production » du multi-stage\n    env_file: .env                      # Injecte toutes les variables .env dans le conteneur\n    depends_on:                         # Attend que db ET redis soient healthy\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n    restart: unless-stopped\n\n  # ── Frontend Next.js ──────────────────────────────────\n  frontend:\n    build:\n      context: ./frontend\n      target: production\n    depends_on:\n      - api                             # Pas de healthcheck ici : depends_on simple suffit\n    restart: unless-stopped\n\n  # ── Reverse proxy Nginx ───────────────────────────────\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"                         # Seul point d'entrée exposé à l'extérieur\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro  # :ro = lecture seule\n    depends_on:\n      - frontend\n      - api\n    restart: unless-stopped\n\nvolumes:\n  pgdata:                               # Déclaration du volume nommé (géré par Docker)",
          caption: "5 services, 1 volume, tout orchestré par Compose.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le compose.override.yaml (développement)",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.override.yaml",
          code: "# Fusionné automatiquement avec compose.yaml en dev.\n# Ajoute les bind mounts et les ports de debug.\nservices:\n  api:\n    build:\n      target: development              # Stage dev du Dockerfile (avec nodemon, ts-node…)\n    volumes:\n      - ./api/src:/app/src             # Le code est synchronisé en direct\n    ports:\n      - \"4000:4000\"                    # Port exposé pour tester l'API directement\n      - \"9229:9229\"                    # Port de debug Node.js (Chrome DevTools)\n    environment:\n      DEBUG: \"true\"\n\n  frontend:\n    build:\n      target: development\n    volumes:\n      - ./frontend/src:/app/src\n    ports:\n      - \"3000:3000\"                    # Accès direct au dev server Next.js",
          caption: "En dev : bind mounts + ports de debug. En prod : rien de tout ça.",
        },
        {
          type: "usecase",
          title: "Le flux de travail au quotidien",
          text: "En développement, tu lances `docker compose up` : le override est fusionné automatiquement, le code est monté en direct, tu édites et ça recharge. En production, tu lances `docker compose -f compose.yaml up` (sans override) : images buildées, pas de bind mount, seul le port 80 est exposé via Nginx.",
        },
      ],
    },
    {
      id: "include-extends",
      number: "8.7",
      title: "include et extends : stacks modulaires",
      blocks: [
        {
          type: "paragraph",
          text: "Quand un projet grossit (mono-repo, microservices), un seul `compose.yaml` devient difficile a maintenir. Compose propose deux mecanismes complementaires : **`include`** pour importer des fichiers Compose entiers, et **`extends`** pour heriter de la configuration d'un service defini ailleurs.",
        },
        {
          type: "heading",
          level: 2,
          text: "include : importer des fichiers Compose externes",
        },
        {
          type: "paragraph",
          text: "`include` importe un ou plusieurs fichiers Compose complets (services, reseaux, volumes) dans le fichier principal. Chaque fichier importe reste autonome : on peut le lancer seul ou l'inclure dans un projet plus large. C'est ideal pour les mono-repos ou l'infrastructure partagee.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "# compose.yaml principal\ninclude:\n  - path: ./monitoring/compose.yaml  # importe Prometheus + Grafana\n  - path: ./db/compose.yaml          # importe PostgreSQL\n\nservices:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    depends_on:\n      - db",
          caption: "`include` importe des fichiers Compose externes -- ideal pour les mono-repos.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Chemins relatifs dans include",
          text: "Les chemins dans `include` sont relatifs au fichier Compose principal. Les `build.context`, volumes et autres chemins du fichier importe restent relatifs a **leur propre fichier**, pas au fichier principal.",
        },
        {
          type: "heading",
          level: 2,
          text: "extends : heriter de la configuration d'un service",
        },
        {
          type: "paragraph",
          text: "`extends` permet a un service d'heriter de la configuration d'un autre service, defini dans le meme fichier ou dans un fichier externe. C'est le principe **DRY** applique a Compose : on definit une base commune et chaque service la specialise.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.base.yaml",
          code: "# compose.base.yaml\nservices:\n  node-base:\n    image: node:22-alpine\n    working_dir: /app\n    volumes:\n      - ./:/app\n    environment:\n      NODE_ENV: development",
          caption: "Service de base partage entre plusieurs services.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "# compose.yaml\nservices:\n  api:\n    extends:\n      file: compose.base.yaml\n      service: node-base\n    command: [\"node\", \"api/index.js\"]\n    ports:\n      - \"4000:4000\"\n\n  worker:\n    extends:\n      file: compose.base.yaml\n      service: node-base\n    command: [\"node\", \"worker/index.js\"]",
          caption: "`extends` herite de la config d'un service de base -- DRY pour les mono-repos.",
        },
        {
          type: "list",
          items: [
            "**file** : chemin du fichier Compose contenant le service de base (optionnel si le service est dans le meme fichier).",
            "**service** : nom du service dont on herite.",
            "Les proprietes du service enfant **ecrasent** celles du parent (meme cle = remplacement).",
            "Les listes (`volumes`, `environment`) sont **fusionnees** (les deux sont conservees).",
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "Difference entre include et extends",
          text: "**`include`** importe des **fichiers Compose entiers** (services, reseaux, volumes). **`extends`** herite de la **configuration d'un service** dans un autre fichier. Les deux sont complementaires : `include` pour la modularite des stacks, `extends` pour la reutilisation de configuration.",
        },
        {
          type: "usecase",
          title: "Mono-repo avec 5 microservices",
          text: "Dans un mono-repo, chaque microservice a son propre `compose.yaml` (build, ports, healthcheck). Le fichier racine utilise `include` pour importer la base de donnees et Redis partages (`./infra/compose.yaml`), et chaque service utilise `extends` pour heriter d'une config Node.js commune (`compose.base.yaml` : image, working_dir, volumes). Resultat : zero duplication, chaque equipe gere son fichier.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d8-ex1",
      title: "Interpolation de variables",
      difficulty: "facile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **db** utilisant l'image `postgres:${POSTGRES_VERSION}`, les variables d'environnement `POSTGRES_PASSWORD: ${DB_PASSWORD}` et `POSTGRES_DB: ${DB_NAME}`. Les valeurs viendront du fichier `.env`.",
      hints: [
        "La syntaxe `${...}` est remplacée par la valeur du `.env` au démarrage.",
        "Compose charge automatiquement le `.env` du même dossier.",
      ],
      starter: "services:\n  db:\n",
      solution:
        "services:\n  db:\n    image: postgres:${POSTGRES_VERSION}\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}",
      checks: [
        { label: "Image avec interpolation", pattern: "image:\\s*postgres:\\$\\{POSTGRES_VERSION\\}" },
        { label: "Mot de passe interpolé", pattern: "POSTGRES_PASSWORD:\\s*\\$\\{DB_PASSWORD\\}" },
        { label: "Base interpolée", pattern: "POSTGRES_DB:\\s*\\$\\{DB_NAME\\}" },
      ],
    },
    {
      id: "d8-ex2",
      title: "Dépendance conditionnelle",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **db** (postgres:16, mot de passe `secret`, healthcheck `pg_isready -U postgres` toutes les 5s, 5 retries) et **api** (build local, port 4000, dépend de db avec `condition: service_healthy`).",
      hints: [
        "Le healthcheck utilise `test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]`.",
        "La dépendance conditionnelle : `depends_on: db: condition: service_healthy`.",
      ],
      starter: "services:\n  api:\n\n  db:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      db:\n        condition: service_healthy\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5',
      checks: [
        { label: "API construite localement", pattern: "build:\\s*\\." },
        { label: "Port 4000 publié", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Dépendance conditionnelle", pattern: "condition:\\s*service_healthy" },
        { label: "Healthcheck pg_isready", pattern: "pg_isready" },
        { label: "Intervalle 5s", pattern: "interval:\\s*5s" },
        { label: "5 retries", pattern: "retries:\\s*5" },
      ],
    },
    {
      id: "d8-ex3",
      title: "Profiles",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** (build local, port 4000) toujours actif, et un service **adminer** (image `adminer`, port 8080) qui ne démarre que quand le profile **debug** est activé.",
      hints: [
        "Un service sans `profiles` démarre toujours.",
        "`profiles: [\"debug\"]` sous adminer le rend conditionnel.",
      ],
      starter: "services:\n  api:\n\n  adminer:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n\n  adminer:\n    image: adminer\n    ports:\n      - "8080:8080"\n    profiles:\n      - debug',
      checks: [
        { label: "Service api sans profile", pattern: "api:[\\s\\S]*build:\\s*\\." },
        { label: "Port 4000 pour api", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Service adminer", pattern: "adminer:[\\s\\S]*image:\\s*adminer" },
        { label: "Port 8080 pour adminer", pattern: "-\\s*[\"']?8080:8080[\"']?" },
        { label: "Profile debug", pattern: "profiles:[\\s\\S]*-\\s*debug" },
      ],
    },
    {
      id: "d8-ex4",
      title: "Build avec target",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** dont le build utilise le contexte `.`, le `Dockerfile` nommé `Dockerfile`, et le **target** `production`. Passe aussi un arg `NODE_ENV` valant `production`. Port 4000 publié.",
      hints: [
        "La configuration de build détaillée utilise un objet : `build: context: ... dockerfile: ... target: ... args: ...`.",
        "Le target correspond à un stage `AS production` dans le Dockerfile.",
      ],
      starter: "services:\n  api:\n    build:\n",
      solution:
        'services:\n  api:\n    build:\n      context: .\n      dockerfile: Dockerfile\n      target: production\n      args:\n        NODE_ENV: production\n    ports:\n      - "4000:4000"',
      checks: [
        { label: "Contexte de build", pattern: "context:\\s*\\." },
        { label: "Dockerfile spécifié", pattern: "dockerfile:\\s*Dockerfile" },
        { label: "Target production", pattern: "target:\\s*production" },
        { label: "Arg NODE_ENV", pattern: "NODE_ENV:\\s*production" },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
      ],
    },
    {
      id: "d8-ex5",
      title: "Compose watch",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** (build local, port 4000) configuré avec `develop.watch` : (1) **sync** du dossier `./src` vers `/app/src`, (2) **rebuild** quand `package.json` change.",
      hints: [
        "La section se place sous `develop: watch:` dans le service.",
        "Chaque règle a un `action`, un `path`, et éventuellement un `target`.",
      ],
      starter: "services:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    develop:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json',
      checks: [
        { label: "Section develop.watch", pattern: "develop:[\\s\\S]*watch:" },
        { label: "Action sync", pattern: "action:\\s*sync" },
        { label: "Chemin source ./src", pattern: "path:\\s*\\./src" },
        { label: "Cible /app/src", pattern: "target:\\s*/app/src" },
        { label: "Action rebuild", pattern: "action:\\s*rebuild" },
        { label: "Rebuild sur package.json", pattern: "path:\\s*package\\.json" },
      ],
    },
    {
      id: "d8-ex6",
      title: "Fichier override",
      difficulty: "facile",
      language: "yaml",
      prompt:
        "Écris un fichier `compose.override.yaml` qui ajoute au service **api** : un bind mount du dossier courant `.` vers `/app`, et la variable d'environnement `DEBUG=true`. Rappel : ce fichier est fusionné automatiquement avec `compose.yaml`.",
      hints: [
        "Le override ne contient que les surcharges, pas la config complète.",
        "Indentation : `services: api: volumes: [...]`.",
      ],
      starter: "services:\n  api:\n",
      solution:
        "services:\n  api:\n    volumes:\n      - .:/app\n    environment:\n      DEBUG: \"true\"",
      checks: [
        { label: "Service api", pattern: "^\\s+api:" },
        { label: "Bind mount .:/app", pattern: "-\\s*\\.:/app" },
        { label: "Variable DEBUG=true", pattern: "DEBUG:\\s*[\"']?true[\"']?" },
      ],
    },
    {
      id: "d8-ex7",
      title: "Deux profiles",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (build local, port 4000, toujours actif), **adminer** (image `adminer`, port 8080, profile `debug`), et **prometheus** (image `prom/prometheus`, port 9090, profile `monitoring`). Chaque service optionnel a son propre profile.",
      hints: [
        "Chaque service conditionnel a son `profiles:` avec un nom différent.",
        "`docker compose --profile debug --profile monitoring up` les active tous.",
      ],
      starter: "services:\n  api:\n\n  adminer:\n\n  prometheus:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n\n  adminer:\n    image: adminer\n    ports:\n      - "8080:8080"\n    profiles:\n      - debug\n\n  prometheus:\n    image: prom/prometheus\n    ports:\n      - "9090:9090"\n    profiles:\n      - monitoring',
      checks: [
        { label: "API sans profile", pattern: "api:[\\s\\S]*build:\\s*\\." },
        { label: "Adminer avec profile debug", pattern: "adminer:[\\s\\S]*profiles:[\\s\\S]*-\\s*debug" },
        { label: "Prometheus avec profile monitoring", pattern: "prometheus:[\\s\\S]*profiles:[\\s\\S]*-\\s*monitoring" },
        { label: "Image prom/prometheus", pattern: "image:\\s*prom/prometheus" },
        { label: "Port 9090 pour prometheus", pattern: "-\\s*[\"']?9090:9090[\"']?" },
      ],
    },
    {
      id: "d8-ex8",
      title: "Stack dev : watch + healthchecks + override",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **db** (postgres:16, mot de passe `secret`, healthcheck pg_isready 5s/5 retries, volume pgdata), **api** (build local, port 4000, dépend de db healthy, `env_file: .env`, `develop.watch` : sync `./src` vers `/app/src` et sync+restart sur `./config` vers `/app/config`). Déclare le volume `pgdata`.",
      hints: [
        "L'action `sync+restart` copie ET redémarre le conteneur.",
        "Chaque règle watch a `action`, `path` et `target`.",
      ],
      starter: "services:\n  db:\n\n  api:\n\nvolumes:\n",
      solution:
        'services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    env_file: .env\n    depends_on:\n      db:\n        condition: service_healthy\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: sync+restart\n          path: ./config\n          target: /app/config\n\nvolumes:\n  pgdata:',
      checks: [
        { label: "Healthcheck pg_isready", pattern: "pg_isready" },
        { label: "Dépendance conditionnelle", pattern: "condition:\\s*service_healthy" },
        { label: "env_file .env", pattern: "env_file:\\s*\\.env" },
        { label: "Watch sync pour ./src", pattern: "action:\\s*sync[\\s\\S]*?path:\\s*\\./src" },
        { label: "Watch sync+restart pour ./config", pattern: "action:\\s*sync\\+restart[\\s\\S]*?path:\\s*\\./config" },
        { label: "Target /app/config", pattern: "target:\\s*/app/config" },
        { label: "Volume pgdata déclaré", pattern: "^volumes:[\\s\\S]*pgdata:" },
      ],
    },
    {
      id: "d8-ex9",
      title: "Include et extends",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Ecris un `compose.yaml` qui utilise **`include`** pour importer `./db/compose.yaml` et `./monitoring/compose.yaml`, puis definit un service **api** qui utilise **`extends`** pour heriter du service `node-base` dans le fichier `compose.base.yaml`. L'api doit ajouter la commande `[\"node\", \"server.js\"]`, publier le port 4000, et dependre du service `db`.",
      hints: [
        "`include` est une liste d'objets avec une cle `path`.",
        "`extends` prend `file` (chemin du fichier) et `service` (nom du service parent).",
        "Les proprietes ajoutees dans le service enfant completent celles du parent.",
      ],
      starter: "include:\n\nservices:\n  api:\n",
      solution:
        'include:\n  - path: ./db/compose.yaml\n  - path: ./monitoring/compose.yaml\n\nservices:\n  api:\n    extends:\n      file: compose.base.yaml\n      service: node-base\n    command: ["node", "server.js"]\n    ports:\n      - "4000:4000"\n    depends_on:\n      - db',
      checks: [
        { label: "Include db/compose.yaml", pattern: "path:\\s*\\./db/compose\\.yaml" },
        { label: "Include monitoring/compose.yaml", pattern: "path:\\s*\\./monitoring/compose\\.yaml" },
        { label: "Extends depuis compose.base.yaml", pattern: "file:\\s*compose\\.base\\.yaml" },
        { label: "Service parent node-base", pattern: "service:\\s*node-base" },
        { label: "Commande node server.js", pattern: "command:.*node.*server\\.js" },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Depend de db", pattern: "depends_on:[\\s\\S]*-\\s*db" },
      ],
    },
  ],
  project: {
    id: "d8-projet",
    title: "Stack dev complète avec profiles et watch",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "Écris un `compose.yaml` complet. **db** : postgres:16, mot de passe `${DB_PASSWORD}` (interpolé), base `${DB_NAME}`, healthcheck pg_isready (5s, 5 retries), volume `pgdata`. **redis** : redis:7, healthcheck `redis-cli ping` (5s, 3 retries). **api** : build avec target `production`, port 4000, `env_file: .env`, dépend de db et redis (service_healthy), `develop.watch` (sync ./src → /app/src, rebuild sur package.json). **adminer** : image adminer, port 8080, profile `debug`. Déclare le volume `pgdata`.",
    hints: [
      "Quatre services : db, redis, api, adminer.",
      "Adminer a un profile ; les trois autres démarrent toujours.",
      "L'interpolation `${...}` sera remplacée par les valeurs du .env.",
    ],
    starter: "services:\n  db:\n\n  redis:\n\n  api:\n\n  adminer:\n\nvolumes:\n",
    solution:
      'services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  redis:\n    image: redis:7\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n\n  api:\n    build:\n      context: .\n      target: production\n    ports:\n      - "4000:4000"\n    env_file: .env\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json\n\n  adminer:\n    image: adminer\n    ports:\n      - "8080:8080"\n    profiles:\n      - debug\n\nvolumes:\n  pgdata:',
    checks: [
      { label: "Postgres avec interpolation du mot de passe", pattern: "POSTGRES_PASSWORD:\\s*\\$\\{DB_PASSWORD\\}" },
      { label: "Healthcheck pg_isready pour db", pattern: "pg_isready" },
      { label: "Redis avec healthcheck", pattern: "redis-cli.*ping" },
      { label: "API avec build target production", pattern: "target:\\s*production" },
      { label: "API avec env_file", pattern: "env_file:\\s*\\.env" },
      { label: "Dépendances conditionnelles (service_healthy)", pattern: "condition:\\s*service_healthy" },
      { label: "Watch sync pour ./src", pattern: "action:\\s*sync[\\s\\S]*path:\\s*\\./src" },
      { label: "Watch rebuild pour package.json", pattern: "action:\\s*rebuild[\\s\\S]*path:\\s*package\\.json" },
      { label: "Adminer avec profile debug", pattern: "adminer:[\\s\\S]*profiles:[\\s\\S]*-\\s*debug" },
      { label: "Volume pgdata déclaré", pattern: "^volumes:[\\s\\S]*pgdata:" },
    ],
  },
  keyTakeaways: [
    "Le fichier `.env` est chargé automatiquement par Compose ; `${VAR}` interpole dans le YAML, `env_file` injecte au runtime.",
    "`depends_on` avec `condition: service_healthy` attend que le service soit réellement prêt, pas juste démarré.",
    "Les profiles (`profiles: [debug]`) permettent d'inclure conditionnellement des services (adminer, monitoring…).",
    "Le build dans Compose accepte context, dockerfile, target (multi-stage) et args.",
    "`docker compose watch` synchronise le code source et rebuild automatiquement — remplace avantageusement les bind mounts.",
    "`include` importe des fichiers Compose entiers (ideal pour les mono-repos) ; `extends` herite de la config d'un service (DRY). Les deux sont complementaires.",
  ],
};
