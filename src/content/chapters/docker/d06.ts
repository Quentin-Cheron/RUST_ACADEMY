import type { Chapter } from "../../types";

export const d06: Chapter = {
  number: 6,
  slug: "docker-compose",
  title: "Docker Compose",
  subtitle: "Décrire toute une stack dans un seul fichier YAML.",
  description:
    "Lancer trois conteneurs à la main avec le bon réseau, les bons volumes et les bonnes variables devient vite pénible. **Docker Compose** décrit toute la stack dans un fichier `compose.yaml` et la démarre d'une commande. C'est l'outil de référence pour le développement local multi-services.",
  minutes: 30,
  rustBookRef: "Docs Docker — Compose",
  objectives: [
    "Écrire un fichier compose.yaml multi-services",
    "Démarrer et arrêter une stack avec docker compose up/down",
    "Déclarer volumes, ports, variables et dépendances",
    "Comprendre le réseau automatique créé par Compose",
  ],
  sections: [
    {
      id: "premier-compose",
      number: "6.1",
      title: "Un premier compose.yaml",
      blocks: [
        {
          type: "paragraph",
          text: "Compose traduit en YAML tout ce qu'on faisait avec des `docker run`. Chaque **service** correspond à un conteneur. Compose crée automatiquement un réseau commun : les services se joignent par leur nom.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    environment:\n      DATABASE_URL: postgres://db:5432/app\n    depends_on:\n      - db\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:",
          caption: "Une stack API + base complète en un fichier.",
        },
        {
          type: "list",
          items: [
            "**build: .** construit l'image depuis le Dockerfile local (ou **image:** pour une image existante).",
            "**ports** publie les ports, comme `-p`.",
            "**environment** passe les variables, comme `-e`.",
            "**volumes** (au niveau service) monte les volumes ; le bloc **volumes** en bas les déclare.",
            "**depends_on** ordonne le démarrage (db avant api).",
          ],
        },
      ],
    },
    {
      id: "commandes",
      number: "6.2",
      title: "Piloter la stack",
      blocks: [
        {
          type: "paragraph",
          text: "Toute la stack se pilote avec `docker compose`. Les commandes s'exécutent dans le dossier contenant `compose.yaml`.",
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose up -d        # construit si besoin et démarre en arrière-plan\ndocker compose ps           # état des services\ndocker compose logs -f api  # logs d'un service\ndocker compose exec api sh  # shell dans un service\ndocker compose down         # arrête et supprime conteneurs + réseau\ndocker compose down -v      # ... et supprime aussi les volumes (DONNÉES !)",
          caption: "Le cycle de vie d'une stack Compose.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "down -v efface les données",
          text: "`docker compose down` garde les volumes (donc les données). Ajouter `-v` supprime aussi les volumes déclarés : à n'utiliser que pour repartir totalement à zéro.",
        },
        {
          type: "usecase",
          title: "Onboarding d'un nouveau développeur",
          text: "Un `git clone` puis `docker compose up` et toute la stack (API, base, cache) démarre à l'identique, sans rien installer sur la machine. Le `compose.yaml` devient la documentation exécutable de l'environnement de dev.",
        },
      ],
    },
    {
      id: "bonnes-pratiques",
      number: "6.3",
      title: "Aller plus loin",
      blocks: [
        {
          type: "paragraph",
          text: "Quelques réglages fréquents : le rechargement à chaud via un bind mount, et un healthcheck pour que `depends_on` attende que la base soit vraiment prête.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml (extrait)",
          code: "  api:\n    build: .\n    volumes:\n      - .:/app          # code monté en direct (dev)\n      - /app/node_modules\n    depends_on:\n      db:\n        condition: service_healthy\n\n  db:\n    image: postgres:16\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      retries: 5",
          caption: "Bind mount de développement + attente d'une base saine.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Le fichier s'appelle `compose.yaml` (nom moderne) ou `docker-compose.yml` (historique). La commande est `docker compose` (avec espace) ; l'ancienne `docker-compose` (tiret) est dépréciée.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d6-ex1",
      title: "Un service unique",
      difficulty: "facile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un seul service **web** utilisant l'image **nginx**, publiant le port **8080** de l'hôte vers **80** du conteneur.",
      hints: [
        "La racine est `services:`.",
        "Sous le service : `image:` et `ports:` (liste de `\"hôte:conteneur\"`).",
      ],
      starter: "services:\n  web:\n",
      solution: 'services:\n  web:\n    image: nginx\n    ports:\n      - "8080:80"',
      checks: [
        { label: "Déclare la section services", pattern: "^services:" },
        { label: "Un service web", pattern: "^\\s+web:" },
        { label: "Image nginx", pattern: "image:\\s*nginx" },
        { label: "Publie 8080:80", pattern: "-\\s*[\"']?8080:80[\"']?" },
      ],
    },
    {
      id: "d6-ex2",
      title: "Piloter la stack",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris les deux commandes (une par ligne) : (1) démarrer la stack en arrière-plan, (2) l'arrêter en supprimant conteneurs et réseau **sans** toucher aux volumes.",
      hints: ["`docker compose up -d` puis `docker compose down`.", "Pas de `-v` pour garder les données."],
      starter: "\n",
      solution: "docker compose up -d\ndocker compose down",
      checks: [
        { label: "Démarre en arrière-plan", pattern: "docker\\s+compose\\s+up\\s+-d" },
        { label: "Arrête la stack", pattern: "docker\\s+compose\\s+down(?!\\s+-v)" },
        { label: "Ne supprime pas les volumes (pas de -v)", pattern: "down\\s+-v", negate: true },
      ],
    },
    {
      id: "d6-ex3",
      title: "Deux services reliés",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (construite depuis le Dockerfile local, port `4000` publié, dépendante de `db`) et **db** (**postgres:16**, mot de passe `secret`). L'api n'a pas besoin de volume ici.",
      hints: [
        "`build: .` pour construire l'image locale.",
        "`depends_on: [db]` ordonne le démarrage.",
        "Indente correctement : deux espaces par niveau.",
      ],
      starter: "services:\n  api:\n\n  db:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      - db\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret',
      checks: [
        { label: "Section services", pattern: "^services:" },
        { label: "Service api construit localement", pattern: "build:\\s*\\." },
        { label: "Port 4000 publié pour l'api", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "api dépend de db", pattern: "depends_on:[\\s\\S]*-\\s*db" },
        { label: "Service db en postgres:16", pattern: "image:\\s*postgres:16" },
        { label: "Mot de passe défini pour db", pattern: "POSTGRES_PASSWORD:\\s*secret" },
      ],
    },
    {
      id: "d6-ex4",
      title: "Service avec volume",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **db** : image **postgres:16**, mot de passe `secret`, base `app`, volume nommé **pgdata** monté sur `/var/lib/postgresql/data`. **Déclare le volume** `pgdata` en bas du fichier.",
      hints: [
        "Les variables Postgres sont `POSTGRES_PASSWORD` et `POSTGRES_DB`.",
        "Le volume se monte sous le service : `volumes: [\"pgdata:/chemin\"]`.",
        "Il faut aussi un bloc `volumes:` racine pour déclarer `pgdata:`.",
      ],
      starter: "services:\n  db:\n\nvolumes:\n",
      solution:
        'services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:',
      checks: [
        { label: "Image postgres:16", pattern: "image:\\s*postgres:16" },
        { label: "Mot de passe secret", pattern: "POSTGRES_PASSWORD:\\s*secret" },
        { label: "Base app", pattern: "POSTGRES_DB:\\s*app" },
        { label: "Volume pgdata monté", pattern: "pgdata:/var/lib/postgresql/data" },
        { label: "Volume déclaré à la racine", pattern: "^volumes:\\s*\\n\\s+pgdata:" },
      ],
    },
    {
      id: "d6-ex5",
      title: "Variables depuis un fichier .env",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** : construit depuis le Dockerfile local, port `4000` publié, et qui charge ses variables d'environnement depuis un fichier `.env` via `env_file`.",
      hints: [
        "`env_file: .env` charge les variables du fichier `.env`.",
        "C'est plus propre que de lister chaque variable dans `environment:`.",
      ],
      starter: "services:\n  api:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    env_file: .env',
      checks: [
        { label: "Service api", pattern: "^\\s+api:" },
        { label: "Build local", pattern: "build:\\s*\\." },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Charge le fichier .env", pattern: "env_file:\\s*\\.env" },
      ],
    },
    {
      id: "d6-ex6",
      title: "Healthcheck dans Compose",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (build local, port `4000`, dépend de `db` avec la condition **service_healthy**) et **db** (**postgres:16**, mot de passe `secret`, **healthcheck** : `pg_isready -U postgres`, intervalle `5s`, 5 tentatives).",
      hints: [
        "Le healthcheck de `db` utilise `test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]`.",
        "La dépendance conditionnelle : `depends_on: db: condition: service_healthy`.",
      ],
      starter: "services:\n  api:\n\n  db:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      db:\n        condition: service_healthy\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5',
      checks: [
        { label: "Service api construit localement", pattern: "build:\\s*\\." },
        { label: "Port 4000 publié", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Dépendance conditionnelle (service_healthy)", pattern: "condition:\\s*service_healthy" },
        { label: "Image postgres:16", pattern: "image:\\s*postgres:16" },
        { label: "Healthcheck avec pg_isready", pattern: "pg_isready" },
        { label: "Intervalle de 5s", pattern: "interval:\\s*5s" },
        { label: "5 tentatives", pattern: "retries:\\s*5" },
      ],
    },
  ],
  project: {
    id: "d6-projet",
    title: "Stack complète : API + base + cache",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "Écris un `compose.yaml` complet pour une application à trois services. **api** : construite depuis le Dockerfile local, port `4000` publié, variables `DATABASE_URL=postgres://db:5432/app` et `REDIS_URL=redis://cache:6379`, dépend de `db` et `cache`. **db** : **postgres:16**, mot de passe `secret`, base `app`, volume nommé `pgdata` monté sur `/var/lib/postgresql/data`. **cache** : **redis:7**. Déclare le volume `pgdata` en bas du fichier.",
    hints: [
      "Les services se joignent par leur nom : `db` et `cache` dans les URLs.",
      "Le bloc `volumes:` racine déclare `pgdata` ; le service `db` le monte.",
      "`depends_on` accepte une liste : `- db` et `- cache`.",
    ],
    starter: "services:\n  api:\n\n  db:\n\n  cache:\n\nvolumes:\n",
    solution:
      'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    environment:\n      DATABASE_URL: postgres://db:5432/app\n      REDIS_URL: redis://cache:6379\n    depends_on:\n      - db\n      - cache\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  cache:\n    image: redis:7\n\nvolumes:\n  pgdata:',
    checks: [
      { label: "Trois services (api, db, cache)", pattern: "api:[\\s\\S]*db:[\\s\\S]*cache:" },
      { label: "api construite localement + port 4000", pattern: "build:\\s*\\.[\\s\\S]*4000:4000" },
      { label: "URL de base pointant sur db", pattern: "DATABASE_URL:\\s*postgres://db:5432/app" },
      { label: "URL de cache pointant sur cache", pattern: "REDIS_URL:\\s*redis://cache:6379" },
      { label: "api dépend de db et cache", pattern: "depends_on:[\\s\\S]*-\\s*db[\\s\\S]*-\\s*cache" },
      { label: "db en postgres:16 avec volume pgdata", pattern: "image:\\s*postgres:16[\\s\\S]*pgdata:/var/lib/postgresql/data" },
      { label: "cache en redis:7", pattern: "image:\\s*redis:7" },
      { label: "Volume pgdata déclaré à la racine", pattern: "^volumes:\\s*[\\s\\S]*pgdata:" },
    ],
  },
  keyTakeaways: [
    "Compose décrit toute une stack multi-services dans un seul fichier compose.yaml.",
    "Chaque service = un conteneur ; Compose crée un réseau commun où ils se joignent par leur nom.",
    "`docker compose up -d` démarre, `docker compose down` arrête (ajoute `-v` pour effacer les volumes).",
    "build/image, ports, environment, volumes, depends_on reprennent les options de docker run.",
    "La commande moderne est `docker compose` (avec espace) ; `docker-compose` est déprécié.",
  ],
};
