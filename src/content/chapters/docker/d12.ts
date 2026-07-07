import type { Chapter } from "../../types";

export const d12: Chapter = {
  number: 12,
  slug: "docker-production",
  title: "Docker en production",
  subtitle: "Registry, CI/CD, sécurité et introduction à l'orchestration.",
  description:
    "Docker en développement, c'est acquis. Maintenant on passe à la production : pousser ses images sur un **registry** (Docker Hub, GitHub Container Registry), automatiser les builds avec la **CI/CD** (GitHub Actions), appliquer les **bonnes pratiques de sécurité** (scan, limites de ressources, secrets), et découvrir les bases de l'**orchestration** (Docker Swarm, aperçu Kubernetes).",
  minutes: 40,
  rustBookRef: "Docs Docker — Deploy",
  objectives: [
    "Tagger et pousser une image sur Docker Hub ou un registry privé",
    "Automatiser le build et le push dans un pipeline CI/CD",
    "Appliquer les bonnes pratiques de sécurité en production",
    "Comprendre quand passer de Compose à un orchestrateur",
    "Limiter les ressources CPU/mémoire et scanner les vulnérabilités avec Docker Scout",
  ],
  sections: [
    {
      id: "registry",
      number: "12.1",
      title: "Publier sur un registry",
      blocks: [
        {
          type: "paragraph",
          text: "Un **registry** est un entrepôt d'images Docker. Docker Hub est le registry public par défaut, mais il existe aussi des registries privés (GitHub Container Registry, GitLab, AWS ECR, Google Artifact Registry).",
        },
        {
          type: "code",
          language: "bash",
          code: "# 1. Se connecter au registry\ndocker login\n\n# 2. Tagger l'image pour le registry (format: registre/utilisateur/image:tag)\ndocker tag mon-api:1.0 monuser/mon-api:1.0\n\n# 3. Pousser\ndocker push monuser/mon-api:1.0\n\n# 4. Tirer depuis n'importe quelle machine\ndocker pull monuser/mon-api:1.0",
          caption: "Le cycle tag → push → pull avec Docker Hub.",
        },
        {
          type: "heading",
          level: 3,
          text: "Registries privés",
        },
        {
          type: "code",
          language: "bash",
          code: "# GitHub Container Registry\ndocker login ghcr.io -u USERNAME --password-stdin < token.txt\ndocker tag mon-api:1.0 ghcr.io/monorg/mon-api:1.0\ndocker push ghcr.io/monorg/mon-api:1.0\n\n# AWS ECR (après aws ecr get-login-password)\ndocker tag mon-api:1.0 123456789.dkr.ecr.eu-west-1.amazonaws.com/mon-api:1.0",
          caption: "Le format du tag change selon le registry, mais le flux reste identique.",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Jamais de secrets dans l'image",
          text: "Toute personne ayant accès à l'image peut en extraire les couches. Ne bake jamais de mots de passe, tokens ou clés API dans le Dockerfile. Injectez-les au runtime.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Évitez le tag :latest en production",
          text: "`:latest` est un tag mobile : il pointe sur la dernière image poussée. En production, utilisez des tags explicites (`:1.0`, `:2024-07-07`, le SHA du commit) pour savoir exactement quelle version tourne.",
        },
      ],
    },
    {
      id: "ci-cd",
      number: "12.2",
      title: "CI/CD avec Docker",
      blocks: [
        {
          type: "paragraph",
          text: "Un pipeline CI/CD automatise le build, les tests et le push de l'image à chaque commit. Voici un exemple avec **GitHub Actions** :",
        },
        {
          type: "code",
          language: "yaml",
          filename: ".github/workflows/docker.yml",
          code: "name: Build & Push\n\non:\n  push:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Login to GHCR\n        uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n\n      - name: Build and push\n        uses: docker/build-push-action@v5\n        with:\n          push: true\n          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}",
          caption: "À chaque push sur main, l'image est buildée et poussée avec le SHA du commit.",
        },
        {
          type: "heading",
          level: 3,
          text: "Builds multi-plateformes",
        },
        {
          type: "code",
          language: "yaml",
          code: "      - name: Set up QEMU\n        uses: docker/setup-qemu-action@v3\n\n      - name: Set up Buildx\n        uses: docker/setup-buildx-action@v3\n\n      - name: Build multi-platform\n        uses: docker/build-push-action@v5\n        with:\n          push: true\n          platforms: linux/amd64,linux/arm64\n          tags: ghcr.io/${{ github.repository }}:latest",
          caption: "Buildx + QEMU permettent de builder pour AMD64 et ARM64.",
        },
        {
          type: "heading",
          level: 3,
          text: "Tests avec Compose en CI",
        },
        {
          type: "code",
          language: "bash",
          code: "# Dans un step GitHub Actions\ndocker compose up -d\ndocker compose exec api npm test\ndocker compose down",
          caption: "On peut démarrer toute la stack en CI pour les tests d'intégration.",
        },
      ],
    },
    {
      id: "securite-production",
      number: "12.3",
      title: "Sécurité en production",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Scanner les vulnérabilités",
        },
        {
          type: "code",
          language: "bash",
          code: "# Avec Docker Scout (intégré depuis Docker Desktop 4.17)\ndocker scout cves mon-api:1.0\ndocker scout quickview mon-api:1.0\n\n# Avec Trivy (open source)\ntrivy image mon-api:1.0",
          caption: "Scannez vos images AVANT de les déployer en production.",
        },
        {
          type: "heading",
          level: 3,
          text: "Checklist sécurité",
        },
        {
          type: "list",
          items: [
            "**Image minimale** : alpine, slim ou distroless plutôt qu'une image complète.",
            "**Utilisateur non-root** : `USER app` dans le Dockerfile.",
            "**Système de fichiers en lecture seule** : `docker run --read-only --tmpfs /tmp`.",
            "**Limites de ressources** : `--memory 512m --cpus 0.5`.",
            "**Pas de secrets dans l'image** : variables d'environnement ou Docker secrets.",
            "**Scanner en CI** : docker scout ou trivy dans le pipeline.",
          ],
        },
        {
          type: "code",
          language: "bash",
          code: "docker run -d --memory 512m --cpus 0.5 --read-only --tmpfs /tmp mon-api:1.0",
          caption: "Limiter la mémoire et le CPU protège l'hôte.",
        },
        {
          type: "heading",
          level: 3,
          text: "Docker secrets dans Compose",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt",
          caption: "Le secret est monté en fichier, jamais visible dans les variables d'environnement.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Les images officielles PostgreSQL, MySQL et MariaDB supportent `*_FILE` : `POSTGRES_PASSWORD_FILE=/run/secrets/db_password` au lieu de `POSTGRES_PASSWORD=secret`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Limiter les ressources",
        },
        {
          type: "paragraph",
          text: "Un conteneur sans limites peut consommer toute la mémoire ou tous les CPU de l'hôte. En production, on impose des **limites de ressources** pour éviter qu'un service dégrade les autres.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Limiter un conteneur à 512 Mo de RAM et 0.5 CPU\ndocker run -d --name api \\\n  --memory=512m \\\n  --cpus=0.5 \\\n  --pids-limit=100 \\\n  mon-api:1.0\n\n# Vérifier les limites\ndocker stats api --no-stream",
          caption: "`--memory`, `--cpus` et `--pids-limit` protègent l'hôte contre les fuites de ressources.",
        },
        {
          type: "code",
          language: "yaml",
          code: "# En Compose : deploy.resources\nservices:\n  api:\n    image: mon-api:1.0\n    deploy:\n      resources:\n        limits:\n          memory: 512M\n          cpus: \"0.50\"\n        reservations:\n          memory: 256M\n          cpus: \"0.25\"",
          caption: "En Compose, les limites se déclarent dans `deploy.resources`.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Sans `--memory`, un conteneur qui fuit peut déclencher l'**OOM Killer** du noyau Linux, tuant des conteneurs au hasard. Toujours fixer des limites en production.",
        },
        {
          type: "paragraph",
          text: "Pour les données sensibles éphémères (tokens de session, fichiers temporaires), utilise un **tmpfs mount** : stocké en RAM, jamais écrit sur disque, détruit avec le conteneur.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Monte un tmpfs de 64 Mo dans /app/tmp\ndocker run -d --tmpfs /app/tmp:rw,size=64m mon-api:1.0",
        },
        {
          type: "heading",
          level: 3,
          text: "Scanner ses images avec Docker Scout",
        },
        {
          type: "paragraph",
          text: "Docker Scout analyse les images pour détecter les **vulnérabilités connues** (CVE) dans les paquets et bibliothèques. Intégré à Docker Desktop et disponible en CLI.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Vue rapide des vulnérabilités\ndocker scout quickview mon-api:1.0\n\n# Détail des CVE\ndocker scout cves mon-api:1.0\n\n# Recommandations de mise à jour\ndocker scout recommendations mon-api:1.0",
          caption: "Docker Scout détecte les CVE et recommande des mises à jour d'images de base.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Intègre `docker scout cves` dans ta CI/CD pour bloquer le déploiement si des vulnérabilités critiques sont détectées. GitHub Actions : `docker/scout-action@v1`.",
        },
      ],
    },
    {
      id: "orchestration-intro",
      number: "12.4",
      title: "Introduction à l'orchestration",
      blocks: [
        {
          type: "paragraph",
          text: "Docker Compose est parfait pour un seul serveur. Quand l'application a besoin de **plusieurs machines**, de **scaling** ou de **haute disponibilité**, il faut un orchestrateur.",
        },
        {
          type: "heading",
          level: 3,
          text: "Docker Swarm",
        },
        {
          type: "code",
          language: "bash",
          code: "# Initialiser le cluster\ndocker swarm init\n\n# Déployer une stack depuis compose.yaml\ndocker stack deploy -c compose.yaml myapp\n\n# Scaler un service\ndocker service scale myapp_api=3\n\n# Voir l'état\ndocker service ls",
          caption: "Swarm réutilise le format compose.yaml — la transition est douce.",
        },
        {
          type: "heading",
          level: 3,
          text: "Aperçu de Kubernetes",
        },
        {
          type: "list",
          items: [
            "**Pod** : la plus petite unité déployable (un ou plusieurs conteneurs).",
            "**Deployment** : gère les réplicas et les mises à jour progressives.",
            "**Service** : expose des pods sous un nom DNS stable.",
            "**Ingress** : le reverse proxy d'entrée du cluster.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Quand utiliser quoi ?",
        },
        {
          type: "list",
          items: [
            "**Compose** : développement local, petits déploiements, un seul serveur.",
            "**Swarm** : production simple, quelques serveurs, transition douce depuis Compose.",
            "**Kubernetes** : grande échelle, multi-cloud, équipe infra dédiée.",
          ],
        },
        {
          type: "callout",
          variant: "info",
          text: "Ne sur-ingénieriez pas : Compose avec un bon CI/CD suffit pour la majorité des projets. Passez à un orchestrateur quand le besoin se présente réellement.",
        },
      ],
    },
    {
      id: "cas-pratique-cicd",
      number: "12.5",
      title: "Cas pratique : pipeline CI/CD complet",
      blocks: [
        {
          type: "paragraph",
          text: "Voici un pipeline GitHub Actions réaliste pour une API Node.js : lint, tests, build Docker multi-stage, scan de sécurité, push sur le registry, et déploiement. Chaque step est commenté.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le workflow complet",
        },
        {
          type: "code",
          language: "yaml",
          filename: ".github/workflows/deploy.yml",
          code: "name: CI/CD Pipeline\n\n# Déclenché sur chaque push sur main et sur les pull requests.\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\n# Permissions pour pousser sur GitHub Container Registry.\npermissions:\n  contents: read\n  packages: write\n\njobs:\n  # ── Job 1 : Lint et tests ─────────────────────────────\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4          # Clone le repo\n\n      - uses: actions/setup-node@v4        # Installe Node.js\n        with:\n          node-version: 22\n          cache: npm                       # Cache npm pour accélérer\n\n      - run: npm ci                        # Installe les dépendances\n      - run: npm run lint                  # Vérifie le style de code\n      - run: npm test                      # Lance les tests unitaires\n\n  # ── Job 2 : Build, scan et push ───────────────────────\n  build:\n    needs: test                            # Ne s'exécute que si les tests passent\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'    # Seulement sur main (pas les PRs)\n\n    steps:\n      - uses: actions/checkout@v4\n\n      # Connexion au registry GitHub Container Registry.\n      - name: Login to GHCR\n        uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}     # L'utilisateur qui a pushé\n          password: ${{ secrets.GITHUB_TOKEN }}  # Token auto-généré par GitHub\n\n      # Buildx permet les builds multi-plateforme et le cache avancé.\n      - name: Set up Buildx\n        uses: docker/setup-buildx-action@v3\n\n      # Build l'image et la pousse sur le registry.\n      # Deux tags : le SHA du commit (traçabilité) et « latest » (commodité).\n      - name: Build and push\n        uses: docker/build-push-action@v5\n        with:\n          push: true\n          context: .\n          target: production               # Stage du multi-stage Dockerfile\n          tags: |\n            ghcr.io/${{ github.repository }}:${{ github.sha }}\n            ghcr.io/${{ github.repository }}:latest\n          cache-from: type=gha             # Cache GitHub Actions (réutilise les couches)\n          cache-to: type=gha,mode=max\n\n      # Scanne l'image pour les vulnérabilités connues (CVE).\n      - name: Scan for vulnerabilities\n        uses: docker/scout-action@v1\n        with:\n          command: cves\n          image: ghcr.io/${{ github.repository }}:${{ github.sha }}\n          only-severities: critical,high   # Alerte uniquement sur les failles graves\n          exit-code: true                  # Fait échouer le pipeline si CVE critique",
          caption: "Pipeline complet : test → build → scan → push. Le scan bloque les images vulnérables.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le Dockerfile de production associé",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile",
          code: "# ── Stage development (utilisé par compose.override) ────\nFROM node:22-alpine AS development\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci                              # Toutes les deps (y compris dev)\nCOPY . .\nCMD [\"npm\", \"run\", \"dev\"]               # Rechargement à chaud\n\n# ── Stage production (utilisé par le CI/CD) ──────────────\nFROM node:22-alpine AS production\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev                   # Deps de production uniquement\nCOPY . .\nRUN npm run build                       # Compile TypeScript → JavaScript\n\n# Sécurité : utilisateur non-root\nUSER node\n\n# Healthcheck pour le monitoring\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD wget -qO- http://localhost:4000/health || exit 1\n\nEXPOSE 4000\nCMD [\"node\", \"dist/server.js\"]",
          caption: "Deux stages dans le même fichier : dev (avec nodemon) et prod (optimisé).",
        },
        {
          type: "heading",
          level: 3,
          text: "Checklist avant mise en production",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**Image scannée** : aucune CVE critique ou haute (`docker scout cves`).",
            "**Utilisateur non-root** : `USER node` ou un utilisateur créé avec `adduser`.",
            "**Pas de secrets dans l'image** : tout est injecté via `env_file` ou Docker secrets.",
            "**Tags versionnés** : `:sha-abc123` ou `:1.2.3`, jamais `:latest` seul.",
            "**Healthcheck** : le conteneur sait dire s'il est en bonne santé.",
            "**Limites de ressources** : `deploy.resources.limits` pour mémoire et CPU.",
            "**Logging configuré** : `json-file` avec rotation (`max-size`, `max-file`).",
            "**Restart policy** : `always` ou `unless-stopped` sur tous les services.",
            "**Volumes pour les données** : PostgreSQL, Redis (si persistance), fichiers uploadés.",
            "**Backup** : un script ou un cron qui dump la base régulièrement.",
          ],
        },
        {
          type: "usecase",
          title: "Pourquoi deux tags (SHA + latest) ?",
          text: "Le tag SHA (`:abc123`) identifie exactement quelle version du code tourne. Si un bug apparaît, tu sais quel commit le cause. Le tag `:latest` sert de commodité pour le développement. En production, utilise toujours le tag SHA dans ton compose.yaml de déploiement.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d12-ex1",
      title: "Tagger et pousser une image",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris deux commandes (une par ligne) : (1) tagge l'image locale `api:1.0` pour Docker Hub sous l'utilisateur **devuser**, (2) pousse-la sur le registry.",
      hints: [
        "Format : `docker tag source utilisateur/image:tag`.",
        "`docker push` utilise le même nom.",
      ],
      starter: "# 1. Tagger\n\n# 2. Pousser\n",
      solution: "docker tag api:1.0 devuser/api:1.0\ndocker push devuser/api:1.0",
      checks: [
        { label: "Tag vers devuser/api:1.0", pattern: "docker\\s+tag\\s+api:1\\.0\\s+devuser/api:1\\.0" },
        { label: "Push de l'image", pattern: "docker\\s+push\\s+devuser/api:1\\.0" },
      ],
    },
    {
      id: "d12-ex2",
      title: "GitHub Actions : build & push",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris le **step** GitHub Actions qui build et pousse une image Docker. Utilise l'action `docker/build-push-action@v5` avec `push: true` et le tag `ghcr.io/monorg/api:latest`.",
      hints: [
        "Un step a un `name`, `uses` et `with`.",
        "`with` contient `push` et `tags`.",
      ],
      starter: "- name: Build and push\n",
      solution:
        "- name: Build and push\n  uses: docker/build-push-action@v5\n  with:\n    push: true\n    tags: ghcr.io/monorg/api:latest",
      checks: [
        { label: "Action build-push-action@v5", pattern: "docker/build-push-action@v5" },
        { label: "Push activé", pattern: "push:\\s*true" },
        { label: "Tag ghcr.io", pattern: "tags:\\s*ghcr\\.io/monorg/api:latest" },
      ],
    },
    {
      id: "d12-ex3",
      title: "Conteneur sécurisé",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Lance **api:1.0** en arrière-plan avec : système de fichiers en **lecture seule**, `/tmp` en **tmpfs**, mémoire **256m**, CPU **0.5**.",
      hints: [
        "`--read-only` pour le FS immuable.",
        "`--tmpfs /tmp` pour un espace temporaire en RAM.",
      ],
      starter: "docker run -d ",
      solution: "docker run -d --read-only --tmpfs /tmp --memory 256m --cpus 0.5 api:1.0",
      checks: [
        { label: "Arrière-plan", pattern: "docker\\s+run.*-d" },
        { label: "Lecture seule", pattern: "--read-only" },
        { label: "tmpfs /tmp", pattern: "--tmpfs\\s+/tmp" },
        { label: "Mémoire 256m", pattern: "--memory\\s+256m" },
        { label: "CPU 0.5", pattern: "--cpus\\s+0\\.5" },
        { label: "Image api:1.0", pattern: "api:1\\.0" },
      ],
    },
    {
      id: "d12-ex4",
      title: "Docker secrets dans Compose",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **db** (postgres:16) qui utilise un **secret** `db_password` lu depuis `./secrets/db_password.txt`. Le service utilise `POSTGRES_PASSWORD_FILE: /run/secrets/db_password`. Déclare le secret au niveau racine.",
      hints: [
        "Sous le service : `secrets: [db_password]`.",
        "Au niveau racine : `secrets: db_password: file: ...`.",
      ],
      starter: "services:\n  db:\n\nsecrets:\n",
      solution:
        "services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt",
      checks: [
        { label: "Image postgres:16", pattern: "image:\\s*postgres:16" },
        { label: "POSTGRES_PASSWORD_FILE", pattern: "POSTGRES_PASSWORD_FILE:\\s*/run/secrets/db_password" },
        { label: "Secret monté dans le service", pattern: "secrets:[\\s\\S]*-\\s*db_password" },
        { label: "Secret déclaré au niveau racine", pattern: "^secrets:[\\s\\S]*db_password:[\\s\\S]*file:" },
        { label: "Fichier source", pattern: "file:\\s*\\./secrets/db_password\\.txt" },
      ],
    },
    {
      id: "d12-ex5",
      title: "Scanner une image",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande qui scanne les vulnérabilités (CVE) de l'image **mon-api:1.0** avec **Docker Scout**.",
      hints: [
        "Docker Scout est intégré à Docker Desktop depuis la version 4.17.",
        "La commande est `docker scout cves <image>`.",
      ],
      starter: "docker scout ",
      solution: "docker scout cves mon-api:1.0",
      checks: [
        { label: "Utilise docker scout", pattern: "docker\\s+scout" },
        { label: "Commande cves", pattern: "scout\\s+cves" },
        { label: "Image mon-api:1.0", pattern: "mon-api:1\\.0" },
      ],
    },
    {
      id: "d12-ex6",
      title: "Limites de ressources dans Compose",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec un service **api** (build local, port 4000) limité à **256M** de mémoire et **0.5** CPU via la section `deploy.resources.limits`.",
      hints: [
        "La structure est `deploy: resources: limits: memory: ... cpus: ...`.",
        "Les valeurs sont des strings pour cpus : `\"0.5\"`.",
      ],
      starter: "services:\n  api:\n",
      solution:
        'services:\n  api:\n    build: .\n    ports:\n      - "4000:4000"\n    deploy:\n      resources:\n        limits:\n          memory: 256M\n          cpus: "0.5"',
      checks: [
        { label: "Build local", pattern: "build:\\s*\\." },
        { label: "Port 4000", pattern: "-\\s*[\"']?4000:4000[\"']?" },
        { label: "Section deploy.resources.limits", pattern: "deploy:[\\s\\S]*resources:[\\s\\S]*limits:" },
        { label: "Mémoire 256M", pattern: "memory:\\s*256M" },
        { label: "CPU 0.5", pattern: "cpus:\\s*[\"']?0\\.5[\"']?" },
      ],
    },
    {
      id: "d12-ex7",
      title: "GitHub Actions complet multi-platform",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris les **4 steps** GitHub Actions pour un build multi-plateforme : (1) `actions/checkout@v4`, (2) setup QEMU avec `docker/setup-qemu-action@v3`, (3) setup Buildx avec `docker/setup-buildx-action@v3`, (4) build & push avec `docker/build-push-action@v5` (push true, platforms `linux/amd64,linux/arm64`, tag `ghcr.io/monorg/api:latest`).",
      hints: [
        "QEMU permet d'émuler les architectures différentes.",
        "Buildx est le builder multi-plateforme de Docker.",
        "Les 4 steps se suivent dans l'ordre indiqué.",
      ],
      starter: "steps:\n  - uses: actions/checkout@v4\n",
      solution:
        "steps:\n  - uses: actions/checkout@v4\n\n  - name: Set up QEMU\n    uses: docker/setup-qemu-action@v3\n\n  - name: Set up Buildx\n    uses: docker/setup-buildx-action@v3\n\n  - name: Build and push\n    uses: docker/build-push-action@v5\n    with:\n      push: true\n      platforms: linux/amd64,linux/arm64\n      tags: ghcr.io/monorg/api:latest",
      checks: [
        { label: "Checkout action", pattern: "actions/checkout@v4" },
        { label: "Setup QEMU", pattern: "docker/setup-qemu-action@v3" },
        { label: "Setup Buildx", pattern: "docker/setup-buildx-action@v3" },
        { label: "Build-push-action", pattern: "docker/build-push-action@v5" },
        { label: "Push activé", pattern: "push:\\s*true" },
        { label: "Plateformes AMD64 + ARM64", pattern: "platforms:\\s*linux/amd64,linux/arm64" },
        { label: "Tag ghcr.io", pattern: "ghcr\\.io/monorg/api:latest" },
      ],
    },
    {
      id: "d12-ex8",
      title: "Limites de ressources avec docker run",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Lance **mon-api:1.0** en arrière-plan avec le nom **api**, limité à **512 Mo** de RAM, **0.5** CPU et **100** processus maximum (`--pids-limit`).",
      hints: [
        "`--memory=512m` pour limiter la RAM.",
        "`--cpus=0.5` pour le CPU et `--pids-limit=100` pour les processus.",
      ],
      starter: "docker run -d --name api ",
      solution: "docker run -d --name api --memory=512m --cpus=0.5 --pids-limit=100 mon-api:1.0",
      checks: [
        { label: "Arrière-plan", pattern: "docker\\s+run.*-d" },
        { label: "Nom api", pattern: "--name\\s+api" },
        { label: "Mémoire 512m", pattern: "--memory[= ]512m" },
        { label: "CPU 0.5", pattern: "--cpus[= ]0\\.5" },
        { label: "PID limit 100", pattern: "--pids-limit[= ]100" },
        { label: "Image mon-api:1.0", pattern: "mon-api:1\\.0" },
      ],
    },
    {
      id: "d12-ex9",
      title: "Docker Scout : quickview et recommandations",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris deux commandes (une par ligne) : (1) affiche un **résumé rapide** des vulnérabilités de **mon-api:1.0** avec Docker Scout (`quickview`), (2) affiche les **recommandations** de mise à jour.",
      hints: [
        "`docker scout quickview` pour la vue rapide.",
        "`docker scout recommendations` pour les mises à jour suggérées.",
      ],
      starter: "# 1. Vue rapide\n\n# 2. Recommandations\n",
      solution: "docker scout quickview mon-api:1.0\ndocker scout recommendations mon-api:1.0",
      checks: [
        { label: "Commande quickview", pattern: "docker\\s+scout\\s+quickview\\s+mon-api:1\\.0" },
        { label: "Commande recommendations", pattern: "docker\\s+scout\\s+recommendations\\s+mon-api:1\\.0" },
      ],
    },
  ],
  project: {
    id: "d12-projet",
    title: "Stack de production sécurisée",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "Écris un `compose.yaml` de production sécurisé. **api** : build local, image `ghcr.io/monorg/api:1.0`, port 4000, limites (512M mémoire, 0.5 CPU), dépend de db (healthy), secret `db_password`, restart `always`. **db** : postgres:16-alpine, `POSTGRES_PASSWORD_FILE: /run/secrets/db_password`, healthcheck pg_isready (5s, 5 retries), volume `pgdata`, secret `db_password`, restart `always`. **redis** : redis:7-alpine, healthcheck redis-cli ping (5s, 3 retries), restart `always`. Déclare le secret, le volume et un réseau `backend`.",
    hints: [
      "L'API et la DB partagent le même secret.",
      "Les limites sont dans `deploy.resources.limits`.",
    ],
    starter: "services:\n  api:\n\n  db:\n\n  redis:\n\nsecrets:\n\nvolumes:\n\nnetworks:\n",
    solution:
      'services:\n  api:\n    build: .\n    image: ghcr.io/monorg/api:1.0\n    ports:\n      - "4000:4000"\n    deploy:\n      resources:\n        limits:\n          memory: 512M\n          cpus: "0.5"\n    depends_on:\n      db:\n        condition: service_healthy\n    secrets:\n      - db_password\n    networks:\n      - backend\n    restart: always\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    secrets:\n      - db_password\n    networks:\n      - backend\n    restart: always\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      retries: 3\n    networks:\n      - backend\n    restart: always\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt\n\nvolumes:\n  pgdata:\n\nnetworks:\n  backend:',
    checks: [
      { label: "Image ghcr.io", pattern: "image:\\s*ghcr\\.io/monorg/api:1\\.0" },
      { label: "Limites mémoire 512M", pattern: "memory:\\s*512M" },
      { label: "Limites CPU 0.5", pattern: "cpus:\\s*[\"']?0\\.5[\"']?" },
      { label: "Dépendance conditionnelle", pattern: "condition:\\s*service_healthy" },
      { label: "POSTGRES_PASSWORD_FILE", pattern: "POSTGRES_PASSWORD_FILE:\\s*/run/secrets/db_password" },
      { label: "Healthcheck pg_isready", pattern: "pg_isready" },
      { label: "Healthcheck redis-cli", pattern: "redis-cli.*ping" },
      { label: "Volume pgdata", pattern: "pgdata:/var/lib/postgresql/data" },
      { label: "Secret depuis fichier", pattern: "file:\\s*\\./secrets/db_password\\.txt" },
      { label: "Restart always", pattern: "restart:\\s*always" },
    ],
  },
  keyTakeaways: [
    "Tagger avec des versions explicites (:1.0, :sha) — jamais :latest en production.",
    "GitHub Actions + docker/build-push-action automatise le build et le push.",
    "Scanner les images (docker scout, trivy) en CI avant tout déploiement.",
    "Limites de ressources, read-only filesystem et Docker secrets renforcent la sécurité.",
    "Compose suffit pour un seul serveur ; Swarm ou Kubernetes pour scaler sur plusieurs machines.",
    "`--memory` et `--cpus` protègent l'hôte ; `docker scout cves` détecte les vulnérabilités avant le déploiement.",
  ],
};
