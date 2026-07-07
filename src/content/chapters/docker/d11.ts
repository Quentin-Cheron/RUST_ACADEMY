import type { Chapter } from "../../types";

export const d11: Chapter = {
  number: 11,
  slug: "stacks-multi-services",
  title: "Stacks multi-services",
  subtitle: "Concevoir et orchestrer une application complète avec plusieurs services.",
  description:
    "Les chapitres précédents ont posé les briques une par une. Ici, on assemble tout : reverse proxy Nginx, API applicative, base de données PostgreSQL, cache Redis — dans une stack **Docker Compose** réaliste. On voit comment concevoir l'architecture, isoler les réseaux, centraliser les logs, et s'assurer que chaque service redémarre proprement.",
  minutes: 35,
  rustBookRef: "Docs Docker — Sample apps",
  objectives: [
    "Concevoir une architecture multi-services avec séparation des réseaux",
    "Écrire un compose.yaml complet avec 4+ services",
    "Centraliser et filtrer les logs avec docker compose logs",
    "Configurer les restart policies et healthchecks pour la résilience",
  ],
  sections: [
    {
      id: "concevoir-architecture",
      number: "11.1",
      title: "Concevoir une architecture multi-services",
      blocks: [
        {
          type: "paragraph",
          text: "Une application web moderne se découpe en services spécialisés. Chaque service a **une seule responsabilité** et tourne dans son propre conteneur. La communication se fait par le réseau Docker interne.",
        },
        {
          type: "heading",
          level: 3,
          text: "Architecture type",
        },
        {
          type: "code",
          language: "text",
          code: "Client (navigateur)\n  │\n  ▼\nNginx :80/:443   ← reverse proxy, TLS, fichiers statiques\n  │\n  ▼\nAPI :4000         ← logique métier\n  │         │\n  ▼         ▼\nPostgres  Redis    ← persistance + cache\n:5432     :6379",
          caption: "Flux typique : le client ne parle qu'à Nginx.",
        },
        {
          type: "heading",
          level: 3,
          text: "Isolation des réseaux",
        },
        {
          type: "paragraph",
          text: "On crée deux réseaux : **frontend** (Nginx + API) et **backend** (API + base + cache). Ainsi Nginx ne peut pas joindre la base directement, et la base n'est pas exposée au réseau frontend.",
        },
        {
          type: "code",
          language: "yaml",
          code: "networks:\n  frontend:\n  backend:",
          caption: "Deux réseaux isolés.",
        },
        {
          type: "list",
          items: [
            "**Nginx** : réseau `frontend` uniquement. Il reverse-proxifie vers l'API par son nom.",
            "**API** : réseaux `frontend` + `backend`. Elle est le pont entre les deux mondes.",
            "**PostgreSQL et Redis** : réseau `backend` uniquement. Jamais exposés à l'extérieur.",
          ],
        },
        {
          type: "usecase",
          title: "Blog avec admin",
          text: "Un blog a besoin d'un Nginx pour servir le frontend React et proxifier l'API, l'API Node/Rust pour la logique, PostgreSQL pour les articles, et Redis pour le cache de sessions. Quatre conteneurs, zéro installation sur la machine hôte.",
        },
      ],
    },
    {
      id: "stack-complete",
      number: "11.2",
      title: "Compose d'une stack complète",
      blocks: [
        {
          type: "paragraph",
          text: "Voici un `compose.yaml` réaliste avec quatre services, deux réseaux et un volume nommé :",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n    depends_on:\n      api:\n        condition: service_healthy\n    networks:\n      - frontend\n\n  api:\n    build: .\n    environment:\n      DATABASE_URL: postgres://postgres:secret@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n    networks:\n      - frontend\n      - backend\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      retries: 5\n    networks:\n      - backend\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      retries: 3\n    networks:\n      - backend\n\nnetworks:\n  frontend:\n  backend:\n\nvolumes:\n  pgdata:",
          caption: "Stack complète avec isolation réseau et healthchecks.",
        },
        {
          type: "callout",
          variant: "info",
          title: "L'API est le pont",
          text: "Seule l'API est sur les deux réseaux : elle reçoit les requêtes de Nginx (frontend) et accède à la base et au cache (backend). Nginx ne peut pas joindre db ou redis directement.",
        },
      ],
    },
    {
      id: "logging",
      number: "11.3",
      title: "Logging centralisé",
      blocks: [
        {
          type: "paragraph",
          text: "Compose centralise la sortie de tous les conteneurs. `docker compose logs` est votre premier outil de diagnostic.",
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose logs                  # tous les services\ndocker compose logs -f               # suivi en temps réel (Ctrl+C pour arrêter)\ndocker compose logs -f api db        # filtrer sur certains services\ndocker compose logs --tail 50 api    # les 50 dernières lignes de l'api\ndocker compose logs --since 5m       # les logs des 5 dernières minutes",
          caption: "Les commandes de log au quotidien.",
        },
        {
          type: "heading",
          level: 3,
          text: "Limiter la taille des logs",
        },
        {
          type: "paragraph",
          text: "Par défaut, Docker stocke les logs en JSON sans limite. Sur un serveur, ça peut remplir le disque. On configure une rotation par service :",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml (extrait)",
          code: "  api:\n    build: .\n    logging:\n      driver: json-file\n      options:\n        max-size: \"10m\"\n        max-file: \"3\"",
          caption: "3 fichiers de 10 Mo max = 30 Mo de logs maximum par service.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Faites émettre des logs structurés (JSON) par vos applications. C'est plus facile à parser et à chercher qu'un texte libre.",
        },
      ],
    },
    {
      id: "healthchecks-restart",
      number: "11.4",
      title: "Healthchecks et restart policies",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Restart policies",
        },
        {
          type: "paragraph",
          text: "En production, un conteneur doit redémarrer automatiquement s'il plante. La directive `restart` contrôle ce comportement :",
        },
        {
          type: "list",
          items: [
            "**no** (défaut) : ne redémarre jamais.",
            "**always** : redémarre toujours, même après un `docker stop` + redémarrage du démon.",
            "**unless-stopped** : comme `always`, sauf si arrêté manuellement avec `docker stop`.",
            "**on-failure** : redémarre uniquement si le processus sort avec un code d'erreur non-zéro.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Healthchecks par type de service",
        },
        {
          type: "code",
          language: "yaml",
          code: "  # PostgreSQL\n  db:\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      retries: 5\n    restart: unless-stopped\n\n  # Redis\n  redis:\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      retries: 3\n    restart: unless-stopped\n\n  # API HTTP\n  api:\n    healthcheck:\n      test: [\"CMD-SHELL\", \"curl -f http://localhost:4000/health || exit 1\"]\n      interval: 15s\n      timeout: 3s\n      retries: 3\n    restart: unless-stopped\n\n  # Nginx\n  nginx:\n    healthcheck:\n      test: [\"CMD-SHELL\", \"curl -f http://localhost/ || exit 1\"]\n      interval: 15s\n      retries: 3\n    restart: unless-stopped",
          caption: "Chaque service a un healthcheck adapté et une restart policy.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Le healthcheck d'un service HTTP nécessite `curl` ou `wget` dans l'image. Les images alpine n'ont pas curl par défaut : installez-le dans le Dockerfile ou utilisez `wget -q --spider`.",
        },
      ],
    },
    {
      id: "cas-pratique-ecommerce",
      number: "11.5",
      title: "Cas pratique : plateforme e-commerce",
      blocks: [
        {
          type: "paragraph",
          text: "Construisons la stack Docker d'une boutique en ligne : un storefront Next.js, une API Node, PostgreSQL, Redis pour le cache/sessions, et **MinIO** comme stockage d'images (compatible S3). 5 services, 2 réseaux, 3 volumes.",
        },
        {
          type: "heading",
          level: 3,
          text: "Architecture",
        },
        {
          type: "code",
          language: "text",
          code: "Client (navigateur)\n    │\n    ▼\n┌─────────────────┐\n│  Nginx :80/:443 │  ← TLS, static, reverse proxy\n│  (frontend)     │\n└───────┬─────────┘\n        │ réseau: frontend\n        ▼\n┌─────────────────┐\n│  API :4000      │  ← logique métier, auth, paiement\n│  (backend)      │\n└──┬──────┬───┬───┘\n   │      │   │      réseau: backend\n   ▼      ▼   ▼\n┌─────┐┌─────┐┌───────┐\n│ DB  ││Redis││ MinIO │  ← données, cache, images\n│:5432││:6379││ :9000 │\n└─────┘└─────┘└───────┘",
          caption: "Nginx parle à l'API ; l'API parle aux services backend. Le client ne voit que Nginx.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le compose.yaml complet",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml (e-commerce)",
          code: "services:\n  # ── Point d'entrée : Nginx ─────────────────────────────\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"                         # HTTP (redirige vers HTTPS en prod)\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n    depends_on:\n      api:\n        condition: service_healthy      # Attend que l'API réponde\n    networks:\n      - frontend                        # Parle uniquement au frontend\n    restart: unless-stopped\n\n  # ── API métier (Node.js / Express) ─────────────────────\n  api:\n    build:\n      context: ./api\n      target: production\n    env_file: .env                      # DATABASE_URL, REDIS_URL, S3_ENDPOINT…\n    healthcheck:\n      test: [\"CMD-SHELL\", \"wget -qO- http://localhost:4000/health || exit 1\"]\n      interval: 15s                     # Pas besoin de vérifier toutes les 5s\n      timeout: 3s\n      retries: 3\n      start_period: 10s                 # Laisse 10s à l'API pour démarrer\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n      minio:\n        condition: service_healthy\n    networks:\n      - frontend                        # Reçoit les requêtes de Nginx\n      - backend                         # Accède à DB, Redis, MinIO\n    restart: unless-stopped\n    logging:\n      driver: json-file\n      options:\n        max-size: \"10m\"                 # Rotation : 3 fichiers de 10 Mo max\n        max-file: \"3\"\n\n  # ── Base de données PostgreSQL ─────────────────────────\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: ${DB_USER}\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # Script d'init (schéma, seed)\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U ${DB_USER}\"]\n      interval: 5s\n      retries: 5\n    networks:\n      - backend\n    restart: unless-stopped\n\n  # ── Cache et sessions Redis ────────────────────────────\n  redis:\n    image: redis:7-alpine\n    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru\n    #         └─ Limite la RAM à 128 Mo ; évince les clés les moins utilisées\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      retries: 3\n    networks:\n      - backend\n    restart: unless-stopped\n\n  # ── Stockage d'images MinIO (compatible S3) ────────────\n  minio:\n    image: minio/minio\n    command: server /data --console-address \":9001\"\n    #         └─ /data = dossier de stockage ; 9001 = UI d'admin\n    environment:\n      MINIO_ROOT_USER: ${S3_ACCESS_KEY}\n      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}\n    volumes:\n      - minio-data:/data                # Les images uploadées sont persistées\n    healthcheck:\n      test: [\"CMD\", \"mc\", \"ready\", \"local\"]\n      interval: 10s\n      retries: 3\n    networks:\n      - backend\n    restart: unless-stopped\n\nnetworks:\n  frontend:                             # Nginx ↔ API\n  backend:                              # API ↔ DB, Redis, MinIO\n\nvolumes:\n  pgdata:                               # Données PostgreSQL\n  minio-data:                           # Fichiers uploadés (images produits)",
          caption: "Chaque service a un healthcheck, une restart policy, et un réseau approprié.",
        },
        {
          type: "heading",
          level: 3,
          text: "Commandes de diagnostic",
        },
        {
          type: "code",
          language: "bash",
          code: "# Voir l'état de santé de chaque service\ndocker compose ps\n\n# Suivre les logs de l'API et de la base en temps réel\ndocker compose logs -f api db\n\n# Ouvrir un shell dans l'API pour débugger\ndocker compose exec api sh\n\n# Vérifier la connectivité réseau depuis l'API\ndocker compose exec api wget -qO- http://db:5432 2>&1 | head -1\n\n# Redémarrer un seul service sans toucher au reste\ndocker compose restart api",
          caption: "Ces commandes sont ton kit de survie quotidien.",
        },
        {
          type: "usecase",
          title: "Pourquoi MinIO plutôt que le disque local ?",
          text: "Stocker les images produits sur le disque du conteneur les perd au restart. Un volume résout ça, mais ne scale pas sur plusieurs serveurs. MinIO offre une API compatible S3 : ton code utilise `aws-sdk`, et tu remplaces MinIO par AWS S3 en production en changeant juste l'URL dans le `.env`. Même code, stockage différent.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d11-ex1",
      title: "Réseaux isolés",
      difficulty: "facile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec deux réseaux nommés **frontend** et **backend**. Le service **api** est sur les deux réseaux, le service **db** (postgres:16, mot de passe `secret`) est uniquement sur **backend**.",
      hints: [
        "Déclare les réseaux dans le bloc `networks:` racine.",
        "Sous chaque service, `networks:` liste les réseaux auxquels il est attaché.",
      ],
      starter: "services:\n  api:\n\n  db:\n\nnetworks:\n",
      solution:
        "services:\n  api:\n    build: .\n    networks:\n      - frontend\n      - backend\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    networks:\n      - backend\n\nnetworks:\n  frontend:\n  backend:",
      checks: [
        { label: "Service api sur frontend et backend", pattern: "api:[\\s\\S]*networks:[\\s\\S]*-\\s*frontend[\\s\\S]*-\\s*backend" },
        { label: "Service db sur backend uniquement", pattern: "db:[\\s\\S]*networks:[\\s\\S]*-\\s*backend" },
        { label: "db pas sur frontend", pattern: "db:[\\s\\S]*networks:[\\s\\S]*-\\s*frontend", negate: true },
        { label: "Réseaux déclarés à la racine", pattern: "^networks:[\\s\\S]*frontend:[\\s\\S]*backend:" },
      ],
    },
    {
      id: "d11-ex2",
      title: "Redis avec healthcheck et restart",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **redis** : image `redis:7-alpine`, healthcheck `redis-cli ping` toutes les 5s avec 3 retries, restart `unless-stopped`.",
      hints: [
        "Le test healthcheck de Redis : `[\"CMD\", \"redis-cli\", \"ping\"]`.",
        "`restart: unless-stopped` redémarre sauf si arrêté manuellement.",
      ],
      starter: "services:\n  redis:\n",
      solution:
        'services:\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n    restart: unless-stopped',
      checks: [
        { label: "Image redis:7-alpine", pattern: "image:\\s*redis:7-alpine" },
        { label: "Healthcheck redis-cli ping", pattern: "redis-cli.*ping" },
        { label: "Intervalle 5s", pattern: "interval:\\s*5s" },
        { label: "3 retries", pattern: "retries:\\s*3" },
        { label: "Restart unless-stopped", pattern: "restart:\\s*unless-stopped" },
      ],
    },
    {
      id: "d11-ex3",
      title: "Rotation des logs",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** (build local, port 4000) configuré avec le driver de log `json-file`, une taille max de **10m** et **3 fichiers** maximum.",
      hints: [
        "La section `logging:` se place sous le service.",
        "Les options sont `max-size` et `max-file` (en strings).",
      ],
      starter: "services:\n  api:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"',
      checks: [
        { label: "Build local", pattern: "build:\\s*\\." },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Driver json-file", pattern: "driver:\\s*json-file" },
        { label: "Max-size 10m", pattern: "max-size:\\s*[\"']?10m[\"']?" },
        { label: "Max-file 3", pattern: "max-file:\\s*[\"']?3[\"']?" },
      ],
    },
    {
      id: "d11-ex4",
      title: "Trois services avec healthchecks",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (build local, port 4000, dépend de db et redis avec `service_healthy`, restart `unless-stopped`), **db** (postgres:16, mot de passe `secret`, healthcheck `pg_isready -U postgres` 5s/5 retries, restart `unless-stopped`) et **redis** (redis:7-alpine, healthcheck `redis-cli ping` 5s/3 retries, restart `unless-stopped`).",
      hints: [
        "Chaque service a son healthcheck adapté.",
        "L'API dépend des deux avec `condition: service_healthy`.",
      ],
      starter: "services:\n  api:\n\n  db:\n\n  redis:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n    restart: unless-stopped\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    restart: unless-stopped\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n    restart: unless-stopped',
      checks: [
        { label: "API dépend de db (healthy)", pattern: "db:[\\s\\S]*condition:\\s*service_healthy" },
        { label: "API dépend de redis (healthy)", pattern: "redis:[\\s\\S]*condition:\\s*service_healthy" },
        { label: "Healthcheck pg_isready pour db", pattern: "pg_isready" },
        { label: "Healthcheck redis-cli pour redis", pattern: "redis-cli.*ping" },
        { label: "Restart policies", pattern: "restart:\\s*unless-stopped" },
        { label: "Trois services présents", pattern: "api:[\\s\\S]*db:[\\s\\S]*redis:" },
      ],
    },
    {
      id: "d11-ex5",
      title: "Restart policy simple",
      difficulty: "facile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** (build local, port 4000) configuré avec `restart: unless-stopped`.",
      hints: [
        "`restart: unless-stopped` redémarre le conteneur sauf s'il a été arrêté manuellement.",
      ],
      starter: "services:\n  api:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    restart: unless-stopped',
      checks: [
        { label: "Build local", pattern: "build:\\s*\\." },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Restart unless-stopped", pattern: "restart:\\s*unless-stopped" },
      ],
    },
    {
      id: "d11-ex6",
      title: "Logging pour deux services",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (build local, port 4000) et **worker** (build `./worker`). Les deux services ont la même config de logging : driver `json-file`, max-size `5m`, max-file `3`.",
      hints: [
        "La section `logging:` se duplique sous chaque service.",
        "Les options sont des strings : `\"5m\"` et `\"3\"`.",
      ],
      starter: "services:\n  api:\n\n  worker:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    logging:\n      driver: json-file\n      options:\n        max-size: "5m"\n        max-file: "3"\n\n  worker:\n    build: ./worker\n    logging:\n      driver: json-file\n      options:\n        max-size: "5m"\n        max-file: "3"',
      checks: [
        { label: "Service api avec logging", pattern: "api:[\\s\\S]*logging:[\\s\\S]*json-file" },
        { label: "Service worker avec logging", pattern: "worker:[\\s\\S]*logging:[\\s\\S]*json-file" },
        { label: "Worker build depuis ./worker", pattern: "build:\\s*\\./worker" },
        { label: "Max-size 5m", pattern: "max-size:\\s*[\"']?5m[\"']?" },
        { label: "Max-file 3", pattern: "max-file:\\s*[\"']?3[\"']?" },
      ],
    },
    {
      id: "d11-ex7",
      title: "Stack complète avec tout",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **api** (build local, port 4000, réseaux `frontend` + `backend`, dépend de db healthy, restart `unless-stopped`, logging json-file 10m/3), **db** (postgres:16, mot de passe `secret`, healthcheck pg_isready 5s/5 retries, volume `pgdata`, réseau `backend`, restart `unless-stopped`), **redis** (redis:7-alpine, healthcheck redis-cli ping 5s/3 retries, réseau `backend`, restart `unless-stopped`). Déclare réseaux et volumes.",
      hints: [
        "L'API est sur les deux réseaux, db et redis uniquement sur backend.",
        "Chaque service a restart + healthcheck.",
      ],
      starter: "services:\n  api:\n\n  db:\n\n  redis:\n\nnetworks:\n\nvolumes:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    depends_on:\n      db:\n        condition: service_healthy\n    networks:\n      - frontend\n      - backend\n    restart: unless-stopped\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    networks:\n      - backend\n    restart: unless-stopped\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n    networks:\n      - backend\n    restart: unless-stopped\n\nnetworks:\n  frontend:\n  backend:\n\nvolumes:\n  pgdata:',
      checks: [
        { label: "API sur frontend et backend", pattern: "api:[\\s\\S]*networks:[\\s\\S]*frontend[\\s\\S]*backend" },
        { label: "DB sur backend uniquement", pattern: "db:[\\s\\S]*networks:[\\s\\S]*-\\s*backend" },
        { label: "Healthcheck pg_isready", pattern: "pg_isready" },
        { label: "Healthcheck redis-cli ping", pattern: "redis-cli.*ping" },
        { label: "Logging api json-file 10m", pattern: "api:[\\s\\S]*logging:[\\s\\S]*max-size.*10m" },
        { label: "Restart sur tous les services", pattern: "restart:\\s*unless-stopped" },
        { label: "Volume pgdata", pattern: "pgdata:/var/lib/postgresql/data" },
        { label: "Réseaux et volumes déclarés", pattern: "^networks:[\\s\\S]*frontend:[\\s\\S]*backend:[\\s\\S]*volumes:" },
      ],
    },
  ],
  project: {
    id: "d11-projet",
    title: "Stack de production complète",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "Écris un `compose.yaml` de production avec 4 services. **nginx** : image `nginx:alpine`, port `80:80`, dépend de api (healthy), réseau `frontend`, restart `unless-stopped`. **api** : build local, dépend de db et redis (healthy), réseaux `frontend` + `backend`, variables `DATABASE_URL=postgres://postgres:secret@db:5432/app` et `REDIS_URL=redis://redis:6379`, healthcheck curl sur `localhost:4000/health` (15s, 3 retries), restart `unless-stopped`, logging json-file 10m/3 fichiers. **db** : postgres:16, mot de passe `secret`, base `app`, volume `pgdata`, healthcheck pg_isready (5s, 5 retries), réseau `backend`, restart `unless-stopped`. **redis** : redis:7-alpine, healthcheck redis-cli ping (5s, 3 retries), réseau `backend`, restart `unless-stopped`. Déclare réseaux et volumes.",
    hints: [
      "Nginx est sur frontend, db et redis sur backend, api sur les deux.",
      "Chaque service a un restart et un healthcheck.",
      "Le logging est optionnel sauf pour api (demandé explicitement).",
    ],
    starter: "services:\n  nginx:\n\n  api:\n\n  db:\n\n  redis:\n\nnetworks:\n\nvolumes:\n",
    solution:
      'services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n    depends_on:\n      api:\n        condition: service_healthy\n    networks:\n      - frontend\n    restart: unless-stopped\n\n  api:\n    build: .\n    environment:\n      DATABASE_URL: postgres://postgres:secret@db:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n    healthcheck:\n      test: ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"]\n      interval: 15s\n      retries: 3\n    networks:\n      - frontend\n      - backend\n    restart: unless-stopped\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    networks:\n      - backend\n    restart: unless-stopped\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n    networks:\n      - backend\n    restart: unless-stopped\n\nnetworks:\n  frontend:\n  backend:\n\nvolumes:\n  pgdata:',
    checks: [
      { label: "4 services (nginx, api, db, redis)", pattern: "nginx:[\\s\\S]*api:[\\s\\S]*db:[\\s\\S]*redis:" },
      { label: "Nginx sur frontend uniquement", pattern: "nginx:[\\s\\S]*networks:[\\s\\S]*-\\s*frontend" },
      { label: "API sur frontend et backend", pattern: "api:[\\s\\S]*networks:[\\s\\S]*frontend[\\s\\S]*backend" },
      { label: "DB sur backend uniquement", pattern: "db:[\\s\\S]*networks:[\\s\\S]*-\\s*backend" },
      { label: "Healthcheck API (curl)", pattern: "curl.*localhost:4000/health" },
      { label: "Healthcheck DB (pg_isready)", pattern: "pg_isready" },
      { label: "Healthcheck Redis (redis-cli ping)", pattern: "redis-cli.*ping" },
      { label: "Volume pgdata pour db", pattern: "pgdata:/var/lib/postgresql/data" },
      { label: "Logging configuré pour api", pattern: "api:[\\s\\S]*logging:[\\s\\S]*json-file" },
      { label: "Réseaux et volumes déclarés", pattern: "^networks:[\\s\\S]*frontend:[\\s\\S]*backend:[\\s\\S]*volumes:[\\s\\S]*pgdata:" },
    ],
  },
  keyTakeaways: [
    "Sépare les réseaux (frontend / backend) pour isoler les services : seule l'API a accès aux deux mondes.",
    "`docker compose logs -f` centralise la sortie de tous les conteneurs ; configure la rotation avec json-file.",
    "`restart: unless-stopped` + healthchecks = résilience automatique en production.",
    "Chaque service a un healthcheck adapté : pg_isready, redis-cli ping, curl /health.",
    "Un compose.yaml bien structuré (réseaux, volumes, healthchecks, restart) est une documentation exécutable de l'architecture.",
  ],
};
