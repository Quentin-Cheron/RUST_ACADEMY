import type { Chapter } from "../../types";

export const d03: Chapter = {
  number: 3,
  slug: "conteneurs-au-quotidien",
  title: "Conteneurs au quotidien",
  subtitle: "Gérer, inspecter et déboguer ses conteneurs comme un pro.",
  description:
    "Une fois qu'on sait lancer des conteneurs, il faut savoir vivre avec : les lister, entrer dedans, lire leurs logs, passer des variables d'environnement, comprendre pourquoi l'un s'arrête. Ce chapitre couvre les commandes de gestion et de débogage que tu utiliseras chaque jour.",
  minutes: 25,
  rustBookRef: "Docs Docker — Running containers",
  objectives: [
    "Lister, arrêter, redémarrer et supprimer des conteneurs",
    "Ouvrir un shell dans un conteneur avec docker exec",
    "Lire et suivre les logs en temps réel",
    "Passer des variables d'environnement et comprendre le cycle de vie",
  ],
  sections: [
    {
      id: "gerer",
      number: "3.1",
      title: "Lister et gérer",
      blocks: [
        {
          type: "paragraph",
          text: "`docker ps` liste les conteneurs **en cours d'exécution**. Ajoute `-a` pour voir aussi ceux qui sont arrêtés — utile pour comprendre pourquoi quelque chose a planté.",
        },
        {
          type: "code",
          language: "bash",
          code: "docker ps              # conteneurs actifs\ndocker ps -a           # tous, y compris arrêtés\n\ndocker stop web        # arrêt propre (SIGTERM)\ndocker start web       # redémarrage\ndocker restart web     # stop + start\ndocker rm web          # suppression (doit être arrêté)\ndocker rm -f web       # force (arrête puis supprime)",
          caption: "Le cycle de vie complet d'un conteneur.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Grand ménage",
          text: "`docker container prune` supprime tous les conteneurs arrêtés. `docker system prune` va plus loin (conteneurs, réseaux et images non utilisés). Pratique quand le disque se remplit.",
        },
      ],
    },
    {
      id: "exec-logs",
      number: "3.2",
      title: "Entrer et observer",
      blocks: [
        {
          type: "paragraph",
          text: "Pour déboguer, on a souvent besoin d'ouvrir un shell **dans** un conteneur qui tourne. C'est le rôle de `docker exec`. Le `-it` combine interactif (`-i`) et pseudo-terminal (`-t`).",
        },
        {
          type: "code",
          language: "bash",
          code: "# Ouvrir un shell dans le conteneur « web »\ndocker exec -it web sh          # ou bash si l'image l'a\n\n# Exécuter une commande unique sans shell interactif\ndocker exec web ls /app\n\n# Suivre les logs en temps réel (comme tail -f)\ndocker logs -f web\ndocker logs --tail 100 web      # les 100 dernières lignes",
          caption: "docker exec pour entrer, docker logs pour observer.",
        },
        {
          type: "usecase",
          title: "Diagnostiquer un conteneur récalcitrant",
          text: "Ton appli renvoie une erreur 500 ? `docker logs -f web` te montre la stack trace en direct. Besoin de vérifier un fichier de config généré à l'intérieur ? `docker exec -it web sh` et tu inspectes le système de fichiers du conteneur comme s'il s'agissait d'une machine.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "`docker exec` agit sur un conteneur **déjà en cours d'exécution**. Si le conteneur est arrêté, exec échoue : c'est `docker start` qu'il faut d'abord.",
        },
      ],
    },
    {
      id: "env-cycle",
      number: "3.3",
      title: "Configuration et cycle de vie",
      blocks: [
        {
          type: "paragraph",
          text: "On configure un conteneur au démarrage, principalement via des **variables d'environnement** (`-e`). C'est le moyen standard d'injecter des secrets, des URLs de base de données, des drapeaux de configuration.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Variables d'environnement individuelles\ndocker run -d --name api \\\n  -e NODE_ENV=production \\\n  -e DATABASE_URL=postgres://db/app \\\n  mon-api:1.0\n\n# Ou depuis un fichier .env\ndocker run -d --env-file .env mon-api:1.0\n\n# Inspecter la config complète d'un conteneur\ndocker inspect api",
          caption: "Injecter de la configuration dans un conteneur.",
        },
        {
          type: "paragraph",
          text: "Un conteneur vit tant que son **processus principal** (le PID 1, défini par CMD/ENTRYPOINT) tourne. Dès que ce processus se termine, le conteneur s'arrête. C'est pour ça qu'un conteneur dont la commande finit tout de suite (`echo hello`) s'arrête aussitôt.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Un conteneur = un processus",
          text: "La bonne pratique est **un service par conteneur**. On ne met pas nginx + postgres + l'appli dans le même conteneur : on lance trois conteneurs et on les fait communiquer (chapitres suivants).",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d3-ex1",
      title: "Ouvrir un shell",
      difficulty: "facile",
      language: "bash",
      prompt:
        "En **deux commandes** (une par ligne) : (1) lance **nginx** en arrière-plan nommé **api**, (2) ouvre un shell interactif (`sh`) dedans avec `docker exec`.",
      hints: [
        "`docker run -d --name api nginx` démarre le conteneur.",
        "`docker exec` agit sur un conteneur qui tourne ; le mode interactif, c'est `-it`.",
      ],
      starter: "# 1. Lancer\n\n# 2. Ouvrir un shell\n",
      solution: "docker run -d --name api nginx\ndocker exec -it api sh",
      checks: [
        { label: "Lance nginx en arrière-plan nommé api", pattern: "docker\\s+run\\s+-d\\s+--name\\s+api\\s+nginx" },
        { label: "Utilise docker exec", pattern: "docker\\s+exec" },
        { label: "Mode interactif (-it)", pattern: "-it\\b|-i\\s+-t" },
        { label: "Cible le conteneur api", pattern: "exec\\s+-it\\s+api" },
        { label: "Lance un shell (sh)", pattern: "\\bsh\\b|\\bbash\\b" },
      ],
    },
    {
      id: "d3-ex2",
      title: "Suivre les logs",
      difficulty: "facile",
      language: "bash",
      prompt:
        "En **deux commandes** (une par ligne) : (1) lance **nginx** en arrière-plan nommé **web**, (2) affiche ses logs et **suis-les en temps réel** (comme `tail -f`).",
      hints: [
        "`docker run -d --name web nginx` démarre le serveur.",
        "L'option de suivi en continu de `docker logs` est `-f`.",
      ],
      starter: "# 1. Lancer\n\n# 2. Suivre les logs\n",
      solution: "docker run -d --name web nginx\ndocker logs -f web",
      checks: [
        { label: "Lance nginx en arrière-plan nommé web", pattern: "docker\\s+run\\s+-d\\s+--name\\s+web\\s+nginx" },
        { label: "Utilise docker logs", pattern: "docker\\s+logs" },
        { label: "Suit en temps réel (-f)", pattern: "logs\\s+-f" },
        { label: "Cible le conteneur web", pattern: "logs\\s+-f\\s+web" },
      ],
    },
    {
      id: "d3-ex3",
      title: "Lancer avec de la config",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Lance l'image **mon-api:1.0** en arrière-plan, nommée **api**, avec la variable d'environnement `NODE_ENV` valant `production`, et le port `4000` publié.",
      hints: ["`-e CLE=valeur` pour la variable.", "Combine `-d`, `--name`, `-e`, `-p`."],
      starter: "docker run ",
      solution: "docker run -d --name api -e NODE_ENV=production -p 4000:4000 mon-api:1.0",
      checks: [
        { label: "docker run en arrière-plan", pattern: "docker\\s+run[\\s\\S]*-d\\b" },
        { label: "Nom du conteneur api", pattern: "--name\\s+api" },
        { label: "Variable NODE_ENV=production", pattern: "-e\\s+NODE_ENV=production" },
        { label: "Port 4000 publié", pattern: "-p\\s+4000:4000" },
        { label: "Image mon-api:1.0", pattern: "mon-api:1\\.0" },
      ],
    },
    {
      id: "d3-ex4",
      title: "Filtrer les conteneurs",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Affiche uniquement les conteneurs **arrêtés** (status `exited`) en utilisant `docker ps` avec l'option `--filter`.",
      hints: [
        "`docker ps -a` montre tous les conteneurs.",
        "Le filtre s'écrit `--filter \"status=exited\"`.",
      ],
      starter: "docker ps ",
      solution: 'docker ps -a --filter "status=exited"',
      checks: [
        { label: "Utilise docker ps", pattern: "docker\\s+ps" },
        { label: "Inclut les conteneurs arrêtés (-a)", pattern: "\\s-a\\b" },
        { label: "Filtre sur status=exited", pattern: "--filter\\s+[\"']?status=exited[\"']?" },
      ],
    },
    {
      id: "d3-ex5",
      title: "Copier un fichier depuis un conteneur",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Copie le fichier `/app/config.json` depuis le conteneur **api** vers le **dossier courant** de l'hôte.",
      hints: [
        "`docker cp` copie des fichiers entre un conteneur et l'hôte.",
        "Syntaxe : `docker cp conteneur:/chemin /destination`.",
      ],
      starter: "docker cp ",
      solution: "docker cp api:/app/config.json .",
      checks: [
        { label: "Utilise docker cp", pattern: "docker\\s+cp" },
        { label: "Source dans le conteneur api", pattern: "api:/app/config\\.json" },
        { label: "Destination = dossier courant", pattern: "\\s\\.\\s*$" },
      ],
    },
    {
      id: "d3-ex6",
      title: "Grand ménage",
      difficulty: "difficile",
      language: "bash",
      prompt:
        "Écris trois commandes (une par ligne) : (1) supprime tous les **conteneurs arrêtés** (`-f` pour ne pas demander confirmation), (2) supprime toutes les **images inutilisées** (y compris celles sans tag, `-a -f`), (3) affiche l'**utilisation disque** de Docker.",
      hints: [
        "`docker container prune -f` pour les conteneurs.",
        "`docker image prune -a -f` pour les images.",
        "`docker system df` pour le disque.",
      ],
      starter: "# 1. Conteneurs arrêtés\n\n# 2. Images inutilisées\n\n# 3. Utilisation disque\n",
      solution:
        "docker container prune -f\ndocker image prune -a -f\ndocker system df",
      checks: [
        { label: "Supprime les conteneurs arrêtés", pattern: "docker\\s+container\\s+prune\\s+-f" },
        { label: "Supprime les images inutilisées", pattern: "docker\\s+image\\s+prune\\s+-a\\s+-f" },
        { label: "Affiche l'utilisation disque", pattern: "docker\\s+system\\s+df" },
      ],
    },
    {
      id: "d3-ex7",
      title: "nginx : du lancement à la suppression",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Cycle complet en **quatre commandes** (une par ligne) : (1) lance **nginx** en arrière-plan nommé **serveur** ; (2) affiche la version d'nginx **depuis le conteneur** avec `docker exec serveur nginx -v` ; (3) arrête proprement le conteneur ; (4) supprime-le.",
      hints: [
        "`docker run -d --name serveur nginx` puis `docker exec serveur nginx -v`.",
        "`docker stop <nom>` (arrêt propre) puis `docker rm <nom>` (suppression).",
      ],
      starter: "# 1. Lancer\n\n# 2. Version d'nginx\n\n# 3. Arrêter\n\n# 4. Supprimer\n",
      solution:
        "docker run -d --name serveur nginx\ndocker exec serveur nginx -v\ndocker stop serveur\ndocker rm serveur",
      checks: [
        { label: "Lance nginx détaché nommé serveur", pattern: "docker\\s+run\\s+-d\\s+--name\\s+serveur\\s+nginx" },
        { label: "Lit la version via docker exec", pattern: "docker\\s+exec\\s+serveur\\s+nginx\\s+-v" },
        { label: "Arrêt propre du conteneur", pattern: "docker\\s+stop\\s+serveur" },
        { label: "Suppression du conteneur", pattern: "docker\\s+rm\\s+serveur" },
      ],
    },
    {
      id: "d3-ex8",
      title: "Redémarrer un service",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "En **trois commandes** (une par ligne) : (1) lance **redis:7** en arrière-plan nommé **cache** ; (2) **redémarre-le** (stop + start en une commande) ; (3) force son arrêt et sa suppression en une seule commande.",
      hints: [
        "`docker restart <nom>` enchaîne stop puis start.",
        "`docker rm -f <nom>` force l'arrêt et la suppression.",
      ],
      starter: "# 1. Lancer\n\n# 2. Redémarrer\n\n# 3. Nettoyer\n",
      solution:
        "docker run -d --name cache redis:7\ndocker restart cache\ndocker rm -f cache",
      checks: [
        { label: "Lance redis:7 détaché nommé cache", pattern: "docker\\s+run\\s+-d\\s+--name\\s+cache\\s+redis:7" },
        { label: "Redémarre le conteneur (restart)", pattern: "docker\\s+restart\\s+cache" },
        { label: "Force stop + suppression (rm -f cache)", pattern: "docker\\s+rm\\s+-f\\s+cache" },
      ],
    },
  ],
  project: {
    id: "d3-projet",
    title: "Kit de débogage",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Mets en place puis diagnostique une API. Écris la séquence complète (une commande par ligne) : (1) lance **nginx** en arrière-plan nommé `api` (il jouera le rôle de l'API) ; (2) vérifie l'état de tous les conteneurs (y compris arrêtés) ; (3) affiche ses 200 dernières lignes de log ; (4) ouvre un shell `sh` dedans ; (5) après diagnostic, force son arrêt et sa suppression en une seule commande.",
    hints: [
      "`docker run -d --name api nginx` pour préparer le conteneur à diagnostiquer.",
      "`docker ps -a` montre aussi les conteneurs arrêtés ; `--tail 200` limite les logs.",
      "`docker rm -f` force la suppression.",
    ],
    starter: "# 1. Préparer l'API\n\n# 2. État\n\n# 3. Logs récents\n\n# 4. Shell\n\n# 5. Nettoyage forcé\n",
    solution:
      "# 1. Préparer l'API\ndocker run -d --name api nginx\n\n# 2. État\ndocker ps -a\n\n# 3. Logs récents\ndocker logs --tail 200 api\n\n# 4. Shell\ndocker exec -it api sh\n\n# 5. Nettoyage forcé\ndocker rm -f api",
    checks: [
      { label: "Prépare le conteneur api (nginx détaché)", pattern: "docker\\s+run\\s+-d\\s+--name\\s+api\\s+nginx" },
      { label: "Liste tous les conteneurs (docker ps -a)", pattern: "docker\\s+ps\\s+-a" },
      { label: "Logs limités à 200 lignes", pattern: "docker\\s+logs\\s+--tail\\s+200\\s+api" },
      { label: "Ouvre un shell dans api", pattern: "docker\\s+exec\\s+-it\\s+api\\s+(sh|bash)" },
      { label: "Force stop + suppression", pattern: "docker\\s+rm\\s+-f\\s+api" },
    ],
  },
  keyTakeaways: [
    "`docker ps -a` révèle aussi les conteneurs arrêtés — indispensable pour déboguer.",
    "`docker exec -it <nom> sh` ouvre un shell dans un conteneur qui tourne.",
    "`docker logs -f` suit les logs en temps réel.",
    "On configure un conteneur avec `-e` (ou `--env-file`) au démarrage.",
    "Un conteneur vit tant que son processus principal (PID 1) tourne ; vise un service par conteneur.",
  ],
};
