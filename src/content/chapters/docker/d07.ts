import type { Chapter } from "../../types";

export const d07: Chapter = {
  number: 7,
  slug: "dockerfile-avance",
  title: "Dockerfile avancé",
  subtitle: "Multi-stage builds, optimisation et bonnes pratiques de sécurité.",
  description:
    "Un Dockerfile basique suffit pour démarrer, mais en production les exigences changent : images légères, builds rapides, sécurité renforcée. Ce chapitre couvre les **multi-stage builds** (séparer la compilation du runtime), les instructions avancées (ARG, HEALTHCHECK), le `.dockerignore`, l'exécution en utilisateur non-root et les techniques d'optimisation de taille d'image.",
  minutes: 40,
  rustBookRef: "Docs Docker — Multi-stage builds",
  objectives: [
    "Écrire un Dockerfile multi-stage pour séparer build et runtime",
    "Utiliser ARG, HEALTHCHECK et LABEL",
    "Sécuriser une image : utilisateur non-root, pas de secrets embarqués",
    "Optimiser la taille d'image avec Alpine, distroless et le nettoyage de couches",
    "Maîtriser le .dockerignore pour accélérer les builds",
    "Utiliser les caches de build BuildKit et les mounts de secrets pour des builds rapides et sécurisés",
  ],
  sections: [
    {
      id: "multi-stage",
      number: "7.1",
      title: "Multi-stage builds",
      blocks: [
        {
          type: "paragraph",
          text: "Un **multi-stage build** utilise plusieurs instructions `FROM` dans un même Dockerfile. Chaque `FROM` démarre un **stage** (étape). On compile dans un premier stage lourd (compilateur, dépendances de build), puis on copie uniquement le résultat dans un stage final léger. L'image finale ne contient que le strict nécessaire.",
        },
        {
          type: "heading",
          level: 3,
          text: "Exemple Node.js : build puis runtime",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile",
          code: "# Stage 1 : build\nFROM node:22 AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Stage 2 : runtime léger\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD [\"node\", \"dist/index.js\"]",
          caption: "Le stage builder compile ; le stage final ne garde que le résultat.",
        },
        {
          type: "heading",
          level: 3,
          text: "Exemple Rust : compilation native",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile",
          code: "# Stage 1 : compilation\nFROM rust:1.82 AS builder\nWORKDIR /app\nCOPY . .\nRUN cargo build --release\n\n# Stage 2 : runtime minimal\nFROM debian:bookworm-slim\nCOPY --from=builder /app/target/release/myapp /usr/local/bin/myapp\nCMD [\"myapp\"]",
          caption: "L'image Rust passe de ~1.5 Go (avec le compilateur) à ~80 Mo (runtime seul).",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Gain de taille spectaculaire",
          text: "L'image `rust:1.82` fait ~1.5 Go car elle embarque le compilateur et toutes les chaînes d'outils. L'image finale `debian:bookworm-slim` ne pèse que ~80 Mo avec le binaire. C'est le principal avantage du multi-stage : une image de production ultra-légère.",
        },
        {
          type: "paragraph",
          text: "`COPY --from=builder` copie des fichiers **depuis un stage précédent** (nommé avec `AS`). On peut aussi copier depuis une image externe : `COPY --from=nginx:alpine /etc/nginx/nginx.conf /etc/nginx/nginx.conf`.",
        },
      ],
    },
    {
      id: "arg-healthcheck",
      number: "7.2",
      title: "ARG, HEALTHCHECK et instructions avancées",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "ARG : variables de build",
        },
        {
          type: "paragraph",
          text: "`ARG` définit une variable disponible **uniquement pendant le build** (pas au runtime). Pratique pour paramétrer la version d'une image de base ou un flag de compilation.",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "ARG RUST_VERSION=1.82\nFROM rust:${RUST_VERSION} AS builder\n\nARG BUILD_MODE=release\nRUN cargo build --${BUILD_MODE}",
          caption: "On peut surcharger au build : docker build --build-arg RUST_VERSION=1.83 .",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Un `ARG` défini **avant** le premier `FROM` n'est accessible que dans les instructions `FROM`. Après un `FROM`, il faut le redéclarer si on en a besoin dans le stage.",
        },
        {
          type: "heading",
          level: 3,
          text: "HEALTHCHECK : vérifier que l'appli répond",
        },
        {
          type: "paragraph",
          text: "Docker peut vérifier périodiquement que le conteneur est en bonne santé. Si le healthcheck échoue, le statut passe à `unhealthy` — utile pour que Compose ou un orchestrateur redémarre le service.",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\\n  CMD curl -f http://localhost:8080/health || exit 1",
          caption: "Teste /health toutes les 30 s ; 3 échecs consécutifs = unhealthy.",
        },
        {
          type: "list",
          items: [
            "**--interval** : fréquence des vérifications (défaut 30 s).",
            "**--timeout** : durée max d'une vérification (défaut 30 s).",
            "**--start-period** : grâce initiale avant de commencer les checks (défaut 0 s).",
            "**--retries** : nombre d'échecs consécutifs avant `unhealthy` (défaut 3).",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "LABEL et STOPSIGNAL",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "LABEL maintainer=\"equipe@exemple.fr\"\nLABEL version=\"1.0\" description=\"API de production\"\n\n# Signal envoyé au processus pour un arrêt propre (défaut SIGTERM)\nSTOPSIGNAL SIGQUIT",
          caption: "LABEL ajoute des métadonnées ; STOPSIGNAL change le signal d'arrêt.",
        },
      ],
    },
    {
      id: "dockerignore-securite",
      number: "7.3",
      title: ".dockerignore et sécurité",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Le fichier .dockerignore",
        },
        {
          type: "paragraph",
          text: "Le `.dockerignore` fonctionne comme un `.gitignore` : il exclut des fichiers du **contexte de build** envoyé au démon Docker. Moins de fichiers = build plus rapide et image plus propre.",
        },
        {
          type: "code",
          language: "text",
          filename: ".dockerignore",
          code: "node_modules\ntarget\n.git\n*.md\n*.log\n.env*\nDockerfile*\ndocker-compose*\n.dockerignore",
          caption: "Exclure tout ce qui n'a rien à faire dans l'image.",
        },
        {
          type: "heading",
          level: 3,
          text: "Exécuter en utilisateur non-root",
        },
        {
          type: "paragraph",
          text: "Par défaut, les processus dans un conteneur tournent en **root**. C'est dangereux : si un attaquant exploite une faille, il a les droits root dans le conteneur (et potentiellement sur l'hôte). La bonne pratique est de créer un utilisateur dédié.",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "FROM node:22-alpine\nWORKDIR /app\nCOPY --chown=node:node . .\nRUN npm ci --omit=dev\n\n# Passe à l'utilisateur non-root fourni par l'image Node\nUSER node\nCMD [\"node\", \"server.js\"]",
          caption: "L'image Node fournit déjà un utilisateur « node ». USER bascule dessus.",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "# Si l'image de base n'a pas d'utilisateur, on le crée\nRUN addgroup --system app && adduser --system --ingroup app app\nUSER app",
          caption: "Créer un utilisateur système dédié quand l'image n'en fournit pas.",
        },
        {
          type: "heading",
          level: 3,
          text: "Pas de secrets dans l'image",
        },
        {
          type: "callout",
          variant: "danger",
          title: "Ne jamais embarquer de secrets",
          text: "Les couches d'une image sont visibles par quiconque la télécharge (`docker history`). Ne mettez **jamais** de mots de passe, clés API ou tokens dans `ENV`, `COPY` ou `ARG`. Injectez-les au runtime avec `-e` ou `--env-file`, ou utilisez les Docker secrets.",
        },
        {
          type: "paragraph",
          text: "`docker scout cves mon-image` analyse les vulnérabilités connues (CVE) dans les paquets de l'image. Intégrez-le dans votre CI pour bloquer les images vulnérables avant le déploiement.",
        },
      ],
    },
    {
      id: "optimisation",
      number: "7.4",
      title: "Optimiser la taille et la vitesse",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Choisir la bonne image de base",
        },
        {
          type: "list",
          items: [
            "**alpine** (~5 Mo) : musl libc + busybox, ultra-léger. Parfait pour Node, Go, Rust.",
            "**slim** (~80 Mo) : Debian allégée, glibc complète. Bon compromis quand alpine pose des problèmes de compatibilité.",
            "**distroless** (~20 Mo) : images Google sans shell ni gestionnaire de paquets. Maximum de sécurité, mais debugging difficile.",
            "**scratch** (0 Mo) : image vide. Uniquement pour les binaires statiques (Go, Rust compilé en musl).",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Combiner les commandes RUN",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "# MAUVAIS : 3 couches, le cache apt reste\nRUN apt-get update\nRUN apt-get install -y curl\nRUN rm -rf /var/lib/apt/lists/*\n\n# BON : 1 seule couche, nettoyée\nRUN apt-get update && \\\n    apt-get install -y --no-install-recommends curl && \\\n    rm -rf /var/lib/apt/lists/*",
          caption: "Nettoyer dans le même RUN pour que la suppression réduise vraiment la taille.",
        },
        {
          type: "heading",
          level: 3,
          text: "Ordonner par fréquence de changement",
        },
        {
          type: "paragraph",
          text: "Les instructions qui changent **le moins souvent** vont en haut (image de base, dépendances système), celles qui changent **le plus souvent** en bas (code source). Ainsi le cache Docker est exploité au maximum.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Résumé : multi-stage + alpine/slim + RUN combinés + bon ordre = images 10× plus légères et builds 5× plus rapides.",
        },
      ],
    },
    {
      id: "buildkit",
      number: "7.5",
      title: "BuildKit : caches de build et secrets",
      blocks: [
        {
          type: "paragraph",
          text: "**BuildKit** est le moteur de build moderne de Docker, activé par défaut depuis Docker 23+. Il apporte des fonctionnalités avancées : caches de build persistants, montage de secrets, parallélisation des stages et bien plus. Pour activer les dernières fonctionnalités BuildKit dans un Dockerfile, ajoutez la directive `# syntax=docker/dockerfile:1` en première ligne.",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile (cache npm)",
          code: '# syntax=docker/dockerfile:1\nFROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\n# Le cache npm persiste entre les builds — meme si la couche est invalidee\nRUN --mount=type=cache,target=/root/.npm npm ci\nCOPY . .\nCMD ["node", "index.js"]',
          caption: "`--mount=type=cache` garde le cache npm entre les builds, meme quand package.json change.",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile (secret mount)",
          code: '# syntax=docker/dockerfile:1\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\n# Le secret n\'est jamais grave dans une couche de l\'image\nRUN --mount=type=secret,id=pip_token \\\n    PIP_INDEX_URL="https://$(cat /run/secrets/pip_token)@pypi.example.com/simple" \\\n    pip install -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]',
          caption: "`--mount=type=secret` injecte un secret au build sans le graver dans l'image.",
        },
        {
          type: "code",
          language: "bash",
          code: '# Passer le secret au build\necho "mon-token-secret" > token.txt\ndocker build --secret id=pip_token,src=token.txt -t mon-app .\n\n# Le secret est monte dans /run/secrets/pip_token pendant le build\n# Il n\'apparait dans AUCUNE couche de l\'image finale',
        },
        {
          type: "callout",
          variant: "tip",
          text: "Depuis BuildKit, `COPY --link` decouple la couche copiee du reste du systeme de fichiers. Les couches `COPY --link` peuvent etre construites en parallele et cachees independamment. Utile pour les copies de fichiers volumineux.",
        },
        {
          type: "usecase",
          title: "Accelerer les builds en CI",
          text: "En CI/CD, le cache npm/pip est souvent perdu entre les runs. `--mount=type=cache` + un cache persistant (GitHub Actions cache, BuildKit cache export) divisent le temps de build par 2 a 5. Les secrets evitent de stocker des tokens dans des variables d'environnement qui se retrouvent dans `docker history`.",
        },
      ],
    },
    {
      id: "cas-pratiques",
      number: "7.6",
      title: "Cas pratiques : vrais Dockerfiles de production",
      blocks: [
        {
          type: "paragraph",
          text: "Passons à la pratique avec trois Dockerfiles de production réels, commentés **ligne par ligne**. Chaque exemple applique les techniques vues dans ce chapitre.",
        },
        {
          type: "heading",
          level: 3,
          text: "1. API Express (Node.js)",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile (API Express)",
          code: "# ── Stage 1 : installer et compiler ──────────────────────\n# On part d'une image Node complète pour avoir les outils de build (gcc, make…)\n# nécessaires à certaines dépendances natives (bcrypt, sharp…).\nFROM node:22 AS builder\n\n# Dossier de travail dans le conteneur. Toutes les commandes s'exécutent ici.\nWORKDIR /app\n\n# On copie UNIQUEMENT les manifestes en premier.\n# Tant que package.json ne change pas, Docker réutilise le cache de npm ci.\nCOPY package.json package-lock.json ./\n\n# --omit=dev : n'installe que les dépendances de production (pas jest, eslint…).\n# npm ci est plus strict que npm install : il respecte le lockfile à la lettre.\nRUN npm ci --omit=dev\n\n# Maintenant on copie le reste du code source.\n# Cette couche est invalidée à chaque changement de code, mais le npm ci reste en cache.\nCOPY src ./src\nCOPY tsconfig.json ./\n\n# Compile le TypeScript en JavaScript dans le dossier dist/.\nRUN npm run build\n\n# ── Stage 2 : image de production légère ─────────────────\n# Alpine = ~50 Mo au lieu de ~350 Mo pour l'image Node complète.\nFROM node:22-alpine\n\nWORKDIR /app\n\n# On ne copie que ce qui est nécessaire au runtime :\n# - le code compilé (dist/)\n# - les dépendances de production (node_modules/)\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./\n\n# L'image Node Alpine fournit déjà un utilisateur « node ».\n# On bascule dessus pour ne pas tourner en root.\nUSER node\n\n# Documente le port (ne l'ouvre pas — il faut -p au docker run).\nEXPOSE 4000\n\n# La commande de démarrage. Format tableau = pas de shell intermédiaire,\n# le signal SIGTERM arrive directement au processus Node.\nCMD [\"node\", \"dist/server.js\"]",
          caption: "Image finale : ~80 Mo, non-root, cache optimisé.",
        },
        {
          type: "heading",
          level: 3,
          text: "2. API Actix-web (Rust)",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile (API Rust Actix-web)",
          code: "# ── Stage 1 : compilation ────────────────────────────────\n# L'image rust: embarque le compilateur (~1.5 Go). On ne la garde pas en prod.\nFROM rust:1.82-slim AS builder\n\nWORKDIR /app\n\n# Astuce cache : on copie les manifestes Cargo et on crée un faux main.rs\n# pour que « cargo build » télécharge et compile les dépendances.\n# Au prochain build, si seul le code métier change, les dépendances restent en cache.\nCOPY Cargo.toml Cargo.lock ./\nRUN mkdir src && echo 'fn main() {}' > src/main.rs\nRUN cargo build --release\n\n# Maintenant on copie le vrai code source et on recompile.\n# Seul le code métier est recompilé, les dépendances sont déjà en cache.\nRUN rm -rf src\nCOPY src ./src\nRUN touch src/main.rs && cargo build --release\n\n# ── Stage 2 : runtime minimal ────────────────────────────\n# Debian slim (~80 Mo) au lieu de l'image Rust (~1.5 Go).\n# On installe ca-certificates pour que les appels HTTPS sortants fonctionnent.\nFROM debian:bookworm-slim\n\nRUN apt-get update && \\\n    apt-get install -y --no-install-recommends ca-certificates && \\\n    rm -rf /var/lib/apt/lists/*\n\n# Le binaire compilé est tout ce qu'on copie du builder.\nCOPY --from=builder /app/target/release/mon-api /usr/local/bin/mon-api\n\n# Utilisateur non-root pour la sécurité.\nRUN useradd --system --no-create-home api\nUSER api\n\nEXPOSE 8080\nCMD [\"mon-api\"]",
          caption: "L'astuce du faux main.rs met les dépendances en cache. Image finale : ~90 Mo.",
        },
        {
          type: "heading",
          level: 3,
          text: "3. Site Next.js (standalone)",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile (Next.js)",
          code: "# ── Stage 1 : installer les dépendances ──────────────────\nFROM node:22-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\n# On installe TOUTES les dépendances (y compris dev) car le build en a besoin.\nRUN npm ci\n\n# ── Stage 2 : builder ────────────────────────────────────\nFROM node:22-alpine AS builder\nWORKDIR /app\n# On copie les node_modules du stage précédent.\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\n# next build avec output: 'standalone' dans next.config.js\n# produit un dossier .next/standalone qui contient tout le nécessaire.\nRUN npm run build\n\n# ── Stage 3 : runtime ────────────────────────────────────\nFROM node:22-alpine\nWORKDIR /app\n\n# Le mode standalone de Next.js copie uniquement les fichiers nécessaires.\nCOPY --from=builder /app/.next/standalone ./\n# Les fichiers statiques (images, CSS) sont dans .next/static.\nCOPY --from=builder /app/.next/static ./.next/static\n# Le dossier public (favicon, robots.txt…).\nCOPY --from=builder /app/public ./public\n\nUSER node\nEXPOSE 3000\n# Le serveur Next.js standalone est un simple fichier Node.\nCMD [\"node\", \"server.js\"]",
          caption: "3 stages : deps → build → runtime. Image finale : ~120 Mo au lieu de ~1 Go.",
        },
        {
          type: "usecase",
          title: "Pourquoi séparer deps et builder ?",
          text: "Dans le Dockerfile Next.js, le stage `deps` ne fait que `npm ci`. Si seul le code change (pas les dépendances), Docker saute entièrement ce stage grâce au cache. Le stage `builder` reçoit les node_modules en cache et ne refait que le `next build`. Résultat : un rebuild en 10 secondes au lieu de 2 minutes.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Quelle base pour quel langage ?",
          text: "**Node** : `node:22-alpine` en runtime (musl OK pour Node). **Rust/Go** : `debian:bookworm-slim` ou `scratch` (binaire statique). **Python** : `python:3.12-slim` (certaines libs ont besoin de glibc). **Java** : `eclipse-temurin:21-jre-alpine`.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d7-ex1",
      title: "Multi-stage Node.js",
      difficulty: "facile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile en deux stages. **Stage 1** (`builder`) : image `node:22`, WORKDIR `/app`, copie tout, `npm ci`, `npm run build`. **Stage 2** : image `node:22-alpine`, WORKDIR `/app`, copie le dossier `dist` depuis le builder, lance `node dist/index.js`.",
      hints: [
        "Le premier FROM nomme le stage : `FROM node:22 AS builder`.",
        "`COPY --from=builder /app/dist ./dist` copie depuis le stage builder.",
      ],
      starter: "# Stage 1 : build\nFROM node:22 AS builder\n\n# Stage 2 : runtime\n",
      solution:
        'FROM node:22 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/index.js"]',
      checks: [
        { label: "Premier stage nommé builder", pattern: "FROM\\s+node:22\\s+AS\\s+builder" },
        { label: "npm ci dans le builder", pattern: "RUN\\s+npm\\s+ci" },
        { label: "npm run build dans le builder", pattern: "RUN\\s+npm\\s+run\\s+build" },
        { label: "Stage runtime en alpine", pattern: "FROM\\s+node:22-alpine" },
        { label: "Copie dist depuis le builder", pattern: "COPY\\s+--from=builder" },
        { label: "Démarre avec node dist/index.js", pattern: "node.*dist/index\\.js" },
      ],
    },
    {
      id: "d7-ex2",
      title: "Ajouter un HEALTHCHECK",
      difficulty: "facile",
      language: "dockerfile",
      prompt:
        "Ajoute une instruction **HEALTHCHECK** à ce Dockerfile qui vérifie `http://localhost:3000/health` avec `curl` toutes les **30 secondes**, avec un timeout de **3 secondes** et **3 tentatives**.",
      hints: [
        "Format : `HEALTHCHECK --interval=... --timeout=... --retries=... CMD ...`.",
        "La commande : `curl -f http://localhost:3000/health || exit 1`.",
      ],
      starter: "FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nEXPOSE 3000\n\n# Ajoute le healthcheck ici\n\nCMD [\"node\", \"server.js\"]",
      solution:
        'FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nEXPOSE 3000\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost:3000/health || exit 1\nCMD ["node", "server.js"]',
      checks: [
        { label: "Instruction HEALTHCHECK présente", pattern: "^HEALTHCHECK" },
        { label: "Intervalle de 30s", pattern: "--interval=30s" },
        { label: "Timeout de 3s", pattern: "--timeout=3s" },
        { label: "3 tentatives", pattern: "--retries=3" },
        { label: "Vérifie /health avec curl", pattern: "curl.*localhost:3000/health" },
      ],
    },
    {
      id: "d7-ex3",
      title: "Écrire un .dockerignore",
      difficulty: "moyen",
      language: "text",
      prompt:
        "Écris un `.dockerignore` qui exclut : **node_modules**, **.git**, tous les fichiers **Markdown** (`*.md`), les fichiers **`.env`** (et variantes comme `.env.local`), et les fichiers **Dockerfile** et **docker-compose**.",
      hints: [
        "Un pattern par ligne.",
        "`*.md` exclut tous les fichiers Markdown.",
        "`.env*` exclut `.env`, `.env.local`, `.env.production`, etc.",
      ],
      starter: "# Fichiers à exclure du contexte de build\n",
      solution: "node_modules\n.git\n*.md\n.env*\nDockerfile*\ndocker-compose*",
      checks: [
        { label: "Exclut node_modules", pattern: "node_modules" },
        { label: "Exclut .git", pattern: "\\.git" },
        { label: "Exclut les fichiers Markdown", pattern: "\\*\\.md" },
        { label: "Exclut les fichiers .env", pattern: "\\.env" },
        { label: "Exclut les Dockerfile", pattern: "Dockerfile" },
      ],
    },
    {
      id: "d7-ex4",
      title: "Utilisateur non-root",
      difficulty: "moyen",
      language: "dockerfile",
      prompt:
        "Complète ce Dockerfile pour qu'il crée un groupe système **app**, un utilisateur système **app** dans ce groupe, puis bascule sur cet utilisateur avec `USER`. Place le `USER` après le `COPY` et avant le `CMD`.",
      hints: [
        "`addgroup --system app` crée le groupe.",
        "`adduser --system --ingroup app app` crée l'utilisateur.",
        "`USER app` bascule — toutes les instructions suivantes tournent sous cet utilisateur.",
      ],
      starter: "FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci --omit=dev\n\n# Crée l'utilisateur non-root ici\n\nCMD [\"node\", \"server.js\"]",
      solution:
        'FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci --omit=dev\nRUN addgroup --system app && adduser --system --ingroup app app\nUSER app\nCMD ["node", "server.js"]',
      checks: [
        { label: "Crée le groupe app", pattern: "addgroup\\s+--system\\s+app" },
        { label: "Crée l'utilisateur app", pattern: "adduser\\s+--system\\s+--ingroup\\s+app\\s+app" },
        { label: "Bascule sur USER app", pattern: "^USER\\s+app" },
        { label: "USER placé avant CMD", pattern: "USER\\s+app[\\s\\S]*CMD" },
      ],
    },
    {
      id: "d7-ex5",
      title: "Multi-stage Rust complet",
      difficulty: "difficile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile multi-stage pour une API Rust. **Stage builder** : `rust:1.82-slim`, WORKDIR `/app`, copie tout, `cargo build --release`. **Stage runtime** : `debian:bookworm-slim`, installe `ca-certificates` (une seule couche, nettoyée), copie le binaire depuis le builder vers `/usr/local/bin/api`, crée un utilisateur non-root `app`, bascule dessus, puis lance `api`.",
      hints: [
        "Le binaire compilé est dans `/app/target/release/api`.",
        "Installe et nettoie dans le même RUN : `apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*`.",
        "Crée l'utilisateur avec `useradd --system app` (Debian, pas Alpine).",
      ],
      starter: "# Stage builder\nFROM rust:1.82-slim AS builder\n\n# Stage runtime\nFROM debian:bookworm-slim\n",
      solution:
        'FROM rust:1.82-slim AS builder\nWORKDIR /app\nCOPY . .\nRUN cargo build --release\n\nFROM debian:bookworm-slim\nRUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*\nCOPY --from=builder /app/target/release/api /usr/local/bin/api\nRUN useradd --system app\nUSER app\nCMD ["api"]',
      checks: [
        { label: "Stage builder avec rust:1.82-slim", pattern: "FROM\\s+rust:1\\.82-slim\\s+AS\\s+builder" },
        { label: "cargo build --release", pattern: "cargo\\s+build\\s+--release" },
        { label: "Runtime debian:bookworm-slim", pattern: "FROM\\s+debian:bookworm-slim" },
        { label: "Installe ca-certificates", pattern: "ca-certificates" },
        { label: "Nettoyage apt dans le même RUN", pattern: "apt-get install[\\s\\S]*rm\\s+-rf\\s+/var/lib/apt/lists" },
        { label: "Copie le binaire depuis builder", pattern: "COPY\\s+--from=builder.*api.*api" },
        { label: "Utilisateur non-root", pattern: "USER\\s+app" },
      ],
    },
    {
      id: "d7-ex6",
      title: "ARG pour la version de base",
      difficulty: "facile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile qui utilise un **ARG** `NODE_VERSION` avec la valeur par défaut `22`, puis un `FROM` qui utilise `node:${NODE_VERSION}-alpine`. Ajoute un WORKDIR `/app` et un CMD `[\"node\"]`.",
      hints: [
        "ARG se place AVANT le FROM quand il paramètre l'image de base.",
        "La syntaxe est `ARG NOM=valeur_par_defaut`.",
      ],
      starter: "# Déclare l'argument\n\n# Utilise-le dans le FROM\n",
      solution:
        'ARG NODE_VERSION=22\nFROM node:${NODE_VERSION}-alpine\nWORKDIR /app\nCMD ["node"]',
      checks: [
        { label: "Déclare ARG NODE_VERSION", pattern: "^ARG\\s+NODE_VERSION=22" },
        { label: "FROM utilise la variable", pattern: "FROM\\s+node:\\$\\{NODE_VERSION\\}-alpine" },
        { label: "WORKDIR /app", pattern: "^WORKDIR\\s+/app" },
      ],
    },
    {
      id: "d7-ex7",
      title: "Multi-stage + non-root combinés",
      difficulty: "moyen",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile en deux stages pour une app Node. **Builder** : `node:22 AS builder`, WORKDIR `/app`, copie tout, `npm ci`, `npm run build`. **Runtime** : `node:22-alpine`, WORKDIR `/app`, copie `dist` et `node_modules` depuis builder, crée l'utilisateur `node` (déjà présent dans l'image Node Alpine) avec `USER node`, puis `CMD [\"node\", \"dist/index.js\"]`.",
      hints: [
        "L'image Node Alpine a déjà un utilisateur `node` — pas besoin de le créer.",
        "N'oublie pas de copier `node_modules` aussi pour le runtime.",
      ],
      starter: "# Builder\nFROM node:22 AS builder\n\n# Runtime\nFROM node:22-alpine\n",
      solution:
        'FROM node:22 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nUSER node\nCMD ["node", "dist/index.js"]',
      checks: [
        { label: "Stage builder", pattern: "FROM\\s+node:22\\s+AS\\s+builder" },
        { label: "npm ci + npm run build", pattern: "npm\\s+ci[\\s\\S]*npm\\s+run\\s+build" },
        { label: "Runtime alpine", pattern: "FROM\\s+node:22-alpine" },
        { label: "Copie dist depuis builder", pattern: "COPY\\s+--from=builder.*dist" },
        { label: "Copie node_modules depuis builder", pattern: "COPY\\s+--from=builder.*node_modules" },
        { label: "Utilisateur non-root", pattern: "^USER\\s+node" },
        { label: "USER avant CMD", pattern: "USER\\s+node[\\s\\S]*CMD" },
      ],
    },
    {
      id: "d7-ex8",
      title: "Multi-stage Go avec scratch",
      difficulty: "difficile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile multi-stage pour un binaire Go **statique**. **Builder** : `golang:1.23-alpine`, WORKDIR `/app`, copie `go.mod` et `go.sum`, `go mod download`, copie le code, compile en statique avec `CGO_ENABLED=0 go build -o server .`. **Runtime** : image **scratch** (vide), copie le binaire depuis builder vers `/server`, EXPOSE 8080, CMD `[\"/server\"]`.",
      hints: [
        "`CGO_ENABLED=0` force la compilation statique (pas de dépendance libc).",
        "`scratch` est une image vide : seul le binaire compilé y vit.",
        "Avec scratch, le chemin du CMD doit être absolu.",
      ],
      starter: "# Builder\nFROM golang:1.23-alpine AS builder\n\n# Runtime\nFROM scratch\n",
      solution:
        'FROM golang:1.23-alpine AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -o server .\n\nFROM scratch\nCOPY --from=builder /app/server /server\nEXPOSE 8080\nCMD ["/server"]',
      checks: [
        { label: "Builder golang:1.23-alpine", pattern: "FROM\\s+golang:1\\.23-alpine\\s+AS\\s+builder" },
        { label: "Copie go.mod en premier (cache)", pattern: "COPY\\s+go\\.mod" },
        { label: "Compilation statique (CGO_ENABLED=0)", pattern: "CGO_ENABLED=0" },
        { label: "go build -o server", pattern: "go\\s+build\\s+-o\\s+server" },
        { label: "Image scratch (vide)", pattern: "FROM\\s+scratch" },
        { label: "Copie le binaire depuis builder", pattern: "COPY\\s+--from=builder.*/server" },
        { label: "EXPOSE 8080", pattern: "^EXPOSE\\s+8080" },
      ],
    },
    {
      id: "d7-ex9",
      title: "BuildKit cache mount pour Python",
      difficulty: "moyen",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile qui utilise **BuildKit** pour accélérer l'installation de dépendances Python. Commence par `# syntax=docker/dockerfile:1`, utilise `python:3.12-slim` comme image de base, WORKDIR `/app`, copie `requirements.txt`, puis installe les dépendances avec `pip install` en montant un **cache BuildKit** sur `/root/.cache/pip` (avec `--mount=type=cache`). Copie le reste du code et lance `python app.py`.",
      hints: [
        "La première ligne doit être `# syntax=docker/dockerfile:1` pour activer les fonctionnalités BuildKit.",
        "Le cache pip se trouve dans `/root/.cache/pip`.",
        "La syntaxe est `RUN --mount=type=cache,target=/chemin commande`.",
      ],
      starter: "# syntax=docker/dockerfile:1\nFROM python:3.12-slim\n\n# Installe les dépendances avec cache BuildKit\n",
      solution:
        '# syntax=docker/dockerfile:1\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]',
      checks: [
        { label: "Directive syntax BuildKit", pattern: "#\\s*syntax=docker/dockerfile:1" },
        { label: "Image python:3.12-slim", pattern: "FROM\\s+python:3\\.12-slim" },
        { label: "WORKDIR /app", pattern: "^WORKDIR\\s+/app" },
        { label: "Copie requirements.txt", pattern: "COPY\\s+requirements\\.txt" },
        { label: "Mount cache BuildKit pour pip", pattern: "--mount=type=cache,target=/root/\\.cache/pip" },
        { label: "pip install", pattern: "pip\\s+install\\s+-r\\s+requirements\\.txt" },
        { label: "Lance python app.py", pattern: "python.*app\\.py" },
      ],
    },
  ],
  project: {
    id: "d7-projet",
    title: "Dockerfile de production Rust complet",
    difficulty: "difficile",
    language: "dockerfile",
    prompt:
      "Écris un Dockerfile de production complet pour une API web Rust. **Stage builder** : `rust:1.82 AS builder`, WORKDIR `/app`, copie d'abord `Cargo.toml` et `Cargo.lock`, puis le code source, compile en release. **Stage runtime** : `debian:bookworm-slim`, installe `ca-certificates` (nettoyé), copie le binaire `/app/target/release/myapi` vers `/usr/local/bin/myapi`, ajoute un `HEALTHCHECK` (curl sur `localhost:8080/health`, intervalle 30s, timeout 3s, 3 retries), crée un utilisateur non-root `api`, `EXPOSE 8080`, bascule sur `USER api`, lance `myapi`.",
    hints: [
      "Copie `Cargo.toml` et `Cargo.lock` avant le code pour optimiser le cache.",
      "HEALTHCHECK et USER sont dans le stage runtime, pas le builder.",
      "L'installation de curl est nécessaire pour le HEALTHCHECK dans l'image slim.",
    ],
    starter: "# Stage builder\nFROM rust:1.82 AS builder\n\n# Stage runtime\nFROM debian:bookworm-slim\n",
    solution:
      'FROM rust:1.82 AS builder\nWORKDIR /app\nCOPY Cargo.toml Cargo.lock ./\nCOPY src ./src\nRUN cargo build --release\n\nFROM debian:bookworm-slim\nRUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*\nCOPY --from=builder /app/target/release/myapi /usr/local/bin/myapi\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost:8080/health || exit 1\nRUN useradd --system api\nEXPOSE 8080\nUSER api\nCMD ["myapi"]',
    checks: [
      { label: "Stage builder avec rust:1.82", pattern: "FROM\\s+rust:1\\.82\\s+AS\\s+builder" },
      { label: "Copie Cargo.toml en premier (cache)", pattern: "COPY\\s+Cargo\\.toml" },
      { label: "cargo build --release", pattern: "cargo\\s+build\\s+--release" },
      { label: "Runtime debian:bookworm-slim", pattern: "FROM\\s+debian:bookworm-slim" },
      { label: "ca-certificates installé et nettoyé", pattern: "ca-certificates[\\s\\S]*rm\\s+-rf" },
      { label: "Binaire copié depuis builder", pattern: "COPY\\s+--from=builder.*myapi" },
      { label: "HEALTHCHECK présent", pattern: "^HEALTHCHECK" },
      { label: "Port 8080 documenté", pattern: "^EXPOSE\\s+8080" },
      { label: "Utilisateur non-root", pattern: "^USER\\s+api" },
      { label: "Lance myapi", pattern: "CMD.*myapi" },
    ],
  },
  keyTakeaways: [
    "Le multi-stage build sépare compilation et runtime : l'image finale ne contient que le binaire et ses dépendances.",
    "ARG paramètre le build (version, mode) ; HEALTHCHECK permet à Docker de vérifier la santé du conteneur.",
    "Le .dockerignore exclut les fichiers inutiles du contexte de build (node_modules, .git, .env…).",
    "Toujours exécuter en utilisateur non-root (USER) et ne jamais embarquer de secrets dans l'image.",
    "Alpine, slim, distroless, scratch : choisir l'image de base la plus légère possible pour le cas d'usage.",
    "`--mount=type=cache` accélère les builds en persistant le cache npm/pip entre les runs ; `--mount=type=secret` injecte des secrets sans les graver dans les couches.",
  ],
};
