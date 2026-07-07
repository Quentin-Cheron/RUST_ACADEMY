import type { Chapter } from "../../types";

export const d02: Chapter = {
  number: 2,
  slug: "images-dockerfile",
  title: "Images & Dockerfile",
  subtitle: "Construire ses propres images avec un Dockerfile, couche par couche.",
  description:
    "Utiliser des images existantes, c'est bien. Créer les siennes, c'est indispensable pour empaqueter sa propre application. Dans ce chapitre, on écrit un **Dockerfile** : la recette qui décrit, instruction par instruction, comment construire une image. On voit les instructions essentielles (FROM, WORKDIR, COPY, RUN, CMD) et comment le cache de couches accélère les builds.",
  minutes: 30,
  rustBookRef: "Docs Docker — Building images",
  objectives: [
    "Écrire un Dockerfile avec les instructions de base",
    "Construire une image avec docker build et la tagger",
    "Comprendre le système de couches et le cache de build",
    "Différencier CMD, ENTRYPOINT et la commande de run",
  ],
  sections: [
    {
      id: "anatomie-dockerfile",
      number: "2.1",
      title: "Anatomie d'un Dockerfile",
      blocks: [
        {
          type: "paragraph",
          text: "Un **Dockerfile** est un fichier texte contenant une suite d'instructions. Chaque instruction crée une **couche** (layer) empilée sur la précédente. Voici un Dockerfile complet pour une petite application Node :",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile",
          code: "# Image de base : on part de Node 22 en version légère (alpine)\nFROM node:22-alpine\n\n# Dossier de travail à l'intérieur du conteneur\nWORKDIR /app\n\n# On copie d'abord les manifestes pour profiter du cache\nCOPY package*.json ./\nRUN npm ci --omit=dev\n\n# Puis le reste du code source\nCOPY . .\n\n# Le port que l'appli écoute (documentation)\nEXPOSE 3000\n\n# Commande lancée au démarrage du conteneur\nCMD [\"node\", \"server.js\"]",
          caption: "Un Dockerfile idiomatique pour une application Node.",
        },
        {
          type: "list",
          items: [
            "**FROM** : l'image de base dont on hérite. Toujours la première instruction.",
            "**WORKDIR** : définit (et crée) le répertoire de travail des instructions suivantes.",
            "**COPY** : copie des fichiers de l'hôte vers l'image.",
            "**RUN** : exécute une commande pendant le build (installer des paquets, compiler…).",
            "**EXPOSE** : documente le port écouté (n'ouvre rien tout seul).",
            "**CMD** : la commande par défaut exécutée au démarrage du conteneur.",
          ],
        },
      ],
    },
    {
      id: "build-tag",
      number: "2.2",
      title: "Construire et tagger",
      blocks: [
        {
          type: "paragraph",
          text: "On construit l'image avec `docker build`. Le `-t` (tag) lui donne un nom et une version. Le `.` final indique le **contexte de build** : le dossier envoyé au démon.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Construire l'image et la tagger\ndocker build -t mon-appli:1.0 .\n\n# Lister les images locales\ndocker images\n\n# Lancer un conteneur à partir de notre image\ndocker run -d -p 3000:3000 mon-appli:1.0",
          caption: "Le cycle build → run de sa propre image.",
        },
        {
          type: "callout",
          variant: "tip",
          title: ".dockerignore",
          text: "Ajoute un fichier `.dockerignore` (comme `.gitignore`) pour exclure `node_modules`, `.git`, les fichiers de log… Le contexte envoyé au démon est plus petit, donc le build plus rapide.",
        },
        {
          type: "usecase",
          title: "Figer une version pour la production",
          text: "Tagger `mon-appli:1.0` puis `mon-appli:1.1` permet de déployer une version précise et de revenir en arrière instantanément si un bug survient. Le tag `latest` est pratique en dev mais dangereux en prod (il change sans prévenir).",
        },
      ],
    },
    {
      id: "cache-couches",
      number: "2.3",
      title: "Le cache de couches",
      blocks: [
        {
          type: "paragraph",
          text: "Docker met en cache chaque couche. Si une instruction et ses fichiers n'ont pas changé, Docker réutilise la couche au lieu de la reconstruire. C'est pour ça qu'on copie `package.json` **avant** le reste du code : tant que les dépendances ne changent pas, le `npm ci` (long) reste en cache.",
        },
        {
          type: "code",
          language: "dockerfile",
          code: "# MAUVAIS : le moindre changement de code invalide le cache du npm install\nCOPY . .\nRUN npm ci\n\n# BON : les dépendances sont mises en cache tant que package.json ne bouge pas\nCOPY package*.json ./\nRUN npm ci\nCOPY . .",
          caption: "L'ordre des instructions change tout pour le cache.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Chaque `RUN`, `COPY`, `ADD` crée une couche. Enchaîne les commandes liées avec `&&` dans un seul `RUN` pour limiter le nombre de couches et la taille finale.",
        },
        {
          type: "callout",
          variant: "info",
          title: "CMD vs ENTRYPOINT",
          text: "**CMD** définit la commande par défaut, facilement remplaçable au `docker run`. **ENTRYPOINT** définit l'exécutable fixe, et CMD lui fournit les arguments par défaut. Pour la plupart des applis, un simple CMD suffit.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d2-ex1",
      title: "Un Dockerfile minimal",
      difficulty: "facile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile qui part de l'image **python:3.12-slim**, place le répertoire de travail à **/app**, copie tout le contexte, et lance **`python app.py`** au démarrage.",
      hints: [
        "FROM définit l'image de base.",
        "WORKDIR définit le répertoire de travail.",
        "CMD au format tableau : `CMD [\"python\", \"app.py\"]`.",
      ],
      starter: "FROM \n",
      solution:
        'FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nCMD ["python", "app.py"]',
      checks: [
        { label: "Part de python:3.12-slim", pattern: "^FROM\\s+python:3\\.12-slim" },
        { label: "Répertoire de travail /app", pattern: "^WORKDIR\\s+/app" },
        { label: "Copie le contexte (COPY . .)", pattern: "^COPY\\s+\\.\\s+\\." },
        { label: "Démarre avec python app.py", pattern: "^CMD\\s+\\[\\s*\"python\"\\s*,\\s*\"app\\.py\"\\s*\\]" },
      ],
    },
    {
      id: "d2-ex2",
      title: "Construire et tagger",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Depuis le dossier courant, construis une image nommée **api** en version **2.0**, à partir du Dockerfile local.",
      hints: ["`docker build -t nom:tag .`", "N'oublie pas le point final (contexte de build)."],
      starter: "docker build ",
      solution: "docker build -t api:2.0 .",
      checks: [
        { label: "Utilise docker build", pattern: "docker\\s+build" },
        { label: "Tag api:2.0", pattern: "-t\\s+api:2\\.0" },
        { label: "Contexte = dossier courant (point final)", pattern: "\\s\\.\\s*$" },
      ],
    },
    {
      id: "d2-ex3",
      title: "Optimiser le cache",
      difficulty: "moyen",
      language: "dockerfile",
      prompt:
        "Complète ce Dockerfile Node pour **profiter du cache** : copie d'abord `package*.json`, installe les dépendances avec `npm ci`, PUIS copie le reste du code. Base : `node:22-alpine`, WORKDIR `/app`, démarrage `node server.js`.",
      hints: [
        "L'ordre compte : les manifestes AVANT `RUN npm ci`, le code APRÈS.",
        "`COPY package*.json ./` capture package.json et package-lock.json.",
      ],
      starter: "FROM node:22-alpine\nWORKDIR /app\n\n# À toi : copie des manifestes, install, puis le code\n\nCMD [\"node\", \"server.js\"]",
      solution:
        'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD ["node", "server.js"]',
      checks: [
        { label: "Copie les manifestes avant le reste", pattern: "COPY\\s+package\\*\\.json\\s+\\./" },
        { label: "Installe les dépendances avec npm ci", pattern: "RUN\\s+npm\\s+ci" },
        { label: "Copie ensuite tout le code (COPY . .)", pattern: "COPY\\s+\\.\\s+\\." },
        {
          label: "npm ci placé AVANT le COPY . . (bon ordre du cache)",
          pattern: "RUN\\s+npm\\s+ci[\\s\\S]*COPY\\s+\\.\\s+\\.",
        },
      ],
    },
    {
      id: "d2-ex4",
      title: "ENTRYPOINT vs CMD",
      difficulty: "moyen",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile basé sur **python:3.12-slim**, répertoire de travail **/app**, copie tout le contexte. Utilise **ENTRYPOINT** pour fixer l'exécutable `python` et **CMD** pour fournir le script par défaut `app.py` (ainsi l'utilisateur pourra remplacer le nom du script au `docker run`).",
      hints: [
        "ENTRYPOINT fixe le binaire, CMD fournit les arguments par défaut.",
        "Les deux utilisent la forme tableau : `[\"...\"]`.",
      ],
      starter: "FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\n",
      solution:
        'FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nENTRYPOINT ["python"]\nCMD ["app.py"]',
      checks: [
        { label: "Image python:3.12-slim", pattern: "^FROM\\s+python:3\\.12-slim" },
        { label: "ENTRYPOINT fixe python", pattern: "^ENTRYPOINT\\s+\\[\\s*\"python\"\\s*\\]" },
        { label: "CMD fournit app.py par défaut", pattern: "^CMD\\s+\\[\\s*\"app\\.py\"\\s*\\]" },
      ],
    },
    {
      id: "d2-ex5",
      title: "Le .dockerignore",
      difficulty: "moyen",
      language: "text",
      prompt:
        "Écris un fichier `.dockerignore` qui exclut : **node_modules**, **.git**, les fichiers **\\*.log**, **.env** et le **Dockerfile** lui-même.",
      hints: [
        "Un pattern par ligne, comme un `.gitignore`.",
        "Les wildcards fonctionnent : `*.log`.",
      ],
      starter: "# Fichiers à exclure du contexte de build\n",
      solution: "node_modules\n.git\n*.log\n.env\nDockerfile",
      checks: [
        { label: "Exclut node_modules", pattern: "node_modules" },
        { label: "Exclut .git", pattern: "\\.git" },
        { label: "Exclut les fichiers .log", pattern: "\\*\\.log" },
        { label: "Exclut .env", pattern: "\\.env" },
        { label: "Exclut le Dockerfile", pattern: "Dockerfile" },
      ],
    },
    {
      id: "d2-ex6",
      title: "Dockerfile pour une API Go",
      difficulty: "difficile",
      language: "dockerfile",
      prompt:
        "Écris un Dockerfile complet pour une API en Go. Base : **golang:1.23-alpine**, répertoire **/app**. Copie d'abord `go.mod` et `go.sum`, lance `go mod download`, puis copie le reste du code, compile avec `go build -o server .`, documente le port **8080**, et démarre avec `./server`.",
      hints: [
        "Même logique de cache que Node : les manifestes avant le code.",
        "`RUN go build -o server .` compile le binaire.",
        "CMD au format tableau : `[\"./server\"]`.",
      ],
      starter: "FROM golang:1.23-alpine\n",
      solution:
        'FROM golang:1.23-alpine\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN go build -o server .\nEXPOSE 8080\nCMD ["./server"]',
      checks: [
        { label: "Base golang:1.23-alpine", pattern: "^FROM\\s+golang:1\\.23-alpine" },
        { label: "WORKDIR /app", pattern: "^WORKDIR\\s+/app" },
        { label: "Copie les manifestes Go en premier", pattern: "COPY\\s+go\\.mod\\s+go\\.sum\\s+\\./" },
        { label: "Télécharge les dépendances", pattern: "RUN\\s+go\\s+mod\\s+download" },
        { label: "Compile le binaire", pattern: "RUN\\s+go\\s+build\\s+-o\\s+server" },
        { label: "Documente le port 8080", pattern: "^EXPOSE\\s+8080" },
        { label: "Démarre le serveur", pattern: "CMD\\s+\\[\\s*\"\\./server\"\\s*\\]" },
      ],
    },
  ],
  project: {
    id: "d2-projet",
    title: "Empaqueter une API",
    difficulty: "moyen",
    language: "dockerfile",
    prompt:
      "Écris le Dockerfile complet d'une petite API Node. Contraintes : image de base **node:22-alpine**, dossier de travail **/app**, cache optimisé (manifestes puis `npm ci --omit=dev` puis le code), documenter le port **4000** avec EXPOSE, et démarrer avec **`node index.js`**.",
    hints: [
      "Reprends la structure vue en 2.1 et 2.3.",
      "`--omit=dev` évite d'installer les dépendances de développement en production.",
      "EXPOSE ne publie rien, il documente le port écouté.",
    ],
    starter: "# Ton Dockerfile de production\nFROM \n",
    solution:
      'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 4000\nCMD ["node", "index.js"]',
    checks: [
      { label: "Base node:22-alpine", pattern: "^FROM\\s+node:22-alpine" },
      { label: "WORKDIR /app", pattern: "^WORKDIR\\s+/app" },
      { label: "Copie des manifestes en premier", pattern: "COPY\\s+package\\*\\.json\\s+\\./" },
      { label: "Install prod uniquement (npm ci --omit=dev)", pattern: "RUN\\s+npm\\s+ci\\s+--omit=dev" },
      { label: "Copie du code après l'install", pattern: "RUN\\s+npm\\s+ci[\\s\\S]*COPY\\s+\\.\\s+\\." },
      { label: "Documente le port 4000", pattern: "^EXPOSE\\s+4000" },
      { label: "Démarre avec node index.js", pattern: "^CMD\\s+\\[\\s*\"node\"\\s*,\\s*\"index\\.js\"\\s*\\]" },
    ],
  },
  keyTakeaways: [
    "Un Dockerfile décrit, instruction par instruction, comment construire une image.",
    "FROM, WORKDIR, COPY, RUN, EXPOSE, CMD sont les instructions du quotidien.",
    "`docker build -t nom:tag .` construit et tagge ; le `.` est le contexte de build.",
    "Chaque instruction crée une couche mise en cache : copie les manifestes avant le code pour accélérer les builds.",
    "Utilise un .dockerignore et évite le tag `latest` en production.",
  ],
};
