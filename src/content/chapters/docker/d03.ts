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
        "Ouvre un shell interactif (`sh`) dans un conteneur en cours d'exécution nommé **api**.",
      hints: ["`docker exec` agit sur un conteneur qui tourne.", "Le mode interactif, c'est `-it`."],
      starter: "docker exec ",
      solution: "docker exec -it api sh",
      checks: [
        { label: "Utilise docker exec", pattern: "docker\\s+exec" },
        { label: "Mode interactif (-it)", pattern: "-it\\b|-i\\s+-t" },
        { label: "Cible le conteneur api", pattern: "\\bapi\\b" },
        { label: "Lance un shell (sh)", pattern: "\\bsh\\b|\\bbash\\b" },
      ],
    },
    {
      id: "d3-ex2",
      title: "Suivre les logs",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Affiche les logs du conteneur **web** et **suis-les en temps réel** (comme `tail -f`).",
      hints: ["L'option de suivi en continu est `-f`."],
      starter: "docker logs ",
      solution: "docker logs -f web",
      checks: [
        { label: "Utilise docker logs", pattern: "docker\\s+logs" },
        { label: "Suit en temps réel (-f)", pattern: "(^|\\s)-f(\\s|$|ollow)" },
        { label: "Cible le conteneur web", pattern: "\\bweb\\b" },
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
  ],
  project: {
    id: "d3-projet",
    title: "Kit de débogage",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Une API nommée `api` plante par intermittence. Écris la séquence de diagnostic (une commande par ligne) : (1) vérifier si le conteneur tourne encore (y compris s'il est arrêté), (2) afficher ses 200 dernières lignes de log, (3) ouvrir un shell `sh` dedans, (4) après diagnostic, le forcer à s'arrêter et le supprimer en une seule commande.",
    hints: [
      "`docker ps -a` montre aussi les conteneurs arrêtés.",
      "`--tail 200` limite le nombre de lignes.",
      "`docker rm -f` force la suppression.",
    ],
    starter: "# 1. État\n\n# 2. Logs récents\n\n# 3. Shell\n\n# 4. Nettoyage forcé\n",
    solution:
      "# 1. État\ndocker ps -a\n\n# 2. Logs récents\ndocker logs --tail 200 api\n\n# 3. Shell\ndocker exec -it api sh\n\n# 4. Nettoyage forcé\ndocker rm -f api",
    checks: [
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
