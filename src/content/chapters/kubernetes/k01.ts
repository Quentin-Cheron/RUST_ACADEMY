import type { Chapter } from "../../types";

export const k01: Chapter = {
  number: 1,
  slug: "decouvrir-kubernetes",
  title: "Découvrir Kubernetes",
  subtitle: "Comprendre l'orchestration de conteneurs, l'architecture de K8s et lancer son premier cluster.",
  description:
    "Docker lance des conteneurs, mais qui les surveille, les redémarre, les répartit sur plusieurs machines ? C'est le rôle d'un orchestrateur. Kubernetes (K8s) est devenu le standard de fait. Dans ce chapitre, on découvre pourquoi il existe, comment il est architecturé (control plane et workers), on installe un cluster local avec Minikube, et on exécute nos premières commandes `kubectl`.",
  minutes: 25,
  rustBookRef: "Docs K8s — Overview",
  objectives: [
    "Expliquer pourquoi un orchestrateur est nécessaire au-delà de Docker",
    "Décrire les composants du control plane et des workers",
    "Installer Minikube et kubectl pour un cluster local",
    "Utiliser les commandes kubectl de base pour explorer un cluster",
  ],
  sections: [
    {
      id: "pourquoi-kubernetes",
      number: "1.1",
      title: "Pourquoi Kubernetes ?",
      blocks: [
        {
          type: "paragraph",
          text: "Docker permet de lancer un conteneur sur **une** machine. Mais en production, tu as des dizaines de services répartis sur plusieurs serveurs. Qui décide sur quel serveur lancer un nouveau conteneur ? Qui redémarre un conteneur qui plante ? Qui ajuste le nombre d'instances quand le trafic augmente ? C'est le travail d'un **orchestrateur**.",
        },
        {
          type: "paragraph",
          text: "**Kubernetes** (souvent abrégé **K8s**) est un système open source créé par Google, aujourd'hui maintenu par la CNCF. Il automatise le déploiement, la mise à l'échelle et la gestion d'applications conteneurisées.",
        },
        {
          type: "list",
          items: [
            "**Orchestration** : K8s décide où et comment lancer tes conteneurs sur un cluster de machines.",
            "**Scaling** : il peut augmenter ou réduire le nombre de réplicas d'un service automatiquement.",
            "**Self-healing** : si un conteneur tombe, K8s le redémarre. Si un noeud entier meurt, il replanifie les conteneurs ailleurs.",
            "**Rolling updates** : il met à jour tes applications sans interruption de service.",
          ],
        },
        {
          type: "usecase",
          title: "Gérer 50 microservices en production",
          text: "Tu as une architecture microservices avec 50 conteneurs. Certains doivent tourner en 3 exemplaires, d'autres ont besoin de GPU. Kubernetes te permet de déclarer l'état souhaité (« je veux 3 réplicas de mon API ») et il s'occupe de le maintenir, même si des machines tombent.",
        },
        {
          type: "callout",
          variant: "info",
          title: "K8s = Kubernetes",
          text: "Le nom « K8s » vient de **K** + 8 lettres + **s**. C'est l'abréviation standard que tu retrouveras partout dans la documentation et les conversations.",
        },
      ],
    },
    {
      id: "architecture",
      number: "1.2",
      title: "Architecture de Kubernetes",
      blocks: [
        {
          type: "paragraph",
          text: "Un cluster Kubernetes se compose de deux types de machines : le **control plane** (cerveau du cluster) et les **workers** (qui exécutent les conteneurs).",
        },
        {
          type: "heading",
          level: 3,
          text: "Le Control Plane",
        },
        {
          type: "list",
          items: [
            "**API Server (`kube-apiserver`)** : le point d'entrée de toutes les commandes. `kubectl` communique avec lui via l'API REST.",
            "**etcd** : base de données clé-valeur distribuée qui stocke tout l'état du cluster (configurations, secrets, état des pods).",
            "**Scheduler (`kube-scheduler`)** : choisit sur quel noeud placer un nouveau pod en fonction des ressources disponibles.",
            "**Controller Manager** : boucle de contrôle qui surveille l'état réel du cluster et le rapproche de l'état souhaité (ex : « il manque un réplica, j'en crée un »).",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Les Workers (Noeuds)",
        },
        {
          type: "list",
          items: [
            "**kubelet** : agent qui tourne sur chaque noeud, reçoit les instructions du control plane et s'assure que les conteneurs tournent.",
            "**kube-proxy** : gère les règles réseau pour que les services soient accessibles à l'intérieur du cluster.",
            "**Container runtime** : le moteur qui lance les conteneurs (containerd, CRI-O). Docker n'est plus le runtime par défaut depuis K8s 1.24.",
          ],
        },
        {
          type: "code",
          language: "text",
          code: "                    ┌─────────────────────────────────┐\n                    │        CONTROL PLANE            │\n                    │  ┌───────────┐  ┌──────────┐    │\n                    │  │ API Server│  │   etcd   │    │\n                    │  └───────────┘  └──────────┘    │\n                    │  ┌───────────┐  ┌───────────┐   │\n                    │  │ Scheduler │  │ Controller│   │\n                    │  └───────────┘  │  Manager  │   │\n                    │                 └───────────┘   │\n                    └──────────┬──────────────────────┘\n                               │\n              ┌────────────────┼────────────────┐\n              │                │                │\n       ┌──────▼──────┐  ┌─────▼───────┐  ┌─────▼───────┐\n       │  Worker 1   │  │  Worker 2   │  │  Worker 3   │\n       │  kubelet    │  │  kubelet    │  │  kubelet    │\n       │  kube-proxy │  │  kube-proxy │  │  kube-proxy │\n       │  [pods...]  │  │  [pods...]  │  │  [pods...]  │\n       └─────────────┘  └─────────────┘  └─────────────┘",
          caption: "Architecture simplifiée d'un cluster Kubernetes.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "En production, le control plane est lui-même répliqué (3 ou 5 instances) pour la haute disponibilité. Avec Minikube, tout tient sur une seule machine.",
        },
      ],
    },
    {
      id: "installation",
      number: "1.3",
      title: "Installation : Minikube et kubectl",
      blocks: [
        {
          type: "paragraph",
          text: "Pour apprendre Kubernetes sans cloud, on utilise **Minikube** : il crée un cluster K8s local dans une machine virtuelle ou un conteneur Docker. On a aussi besoin de **kubectl**, l'outil en ligne de commande pour interagir avec le cluster.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Installer Minikube (macOS avec Homebrew)\nbrew install minikube\n\n# Installer kubectl\nbrew install kubectl\n\n# Sous Linux (téléchargement direct)\ncurl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64\nsudo install minikube-linux-amd64 /usr/local/bin/minikube\n\n# Sous Windows (avec Chocolatey)\nchoco install minikube\nchoco install kubernetes-cli",
          caption: "Installation de Minikube et kubectl selon le système.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Démarrer un cluster local\nminikube start\n\n# Vérifier que le cluster tourne\nminikube status\n# Sortie attendue :\n# minikube\n# type: Control Plane\n# host: Running\n# kubelet: Running\n# apiserver: Running\n# kubeconfig: Configured",
          caption: "Lancement du cluster Minikube.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Alternatives à Minikube",
          text: "**kind** (Kubernetes in Docker) crée des clusters dans des conteneurs Docker — plus léger que Minikube. **k3d** utilise K3s (une distribution légère de K8s). Les trois sont parfaits pour apprendre.",
        },
        {
          type: "usecase",
          title: "Tester ses manifests avant le cloud",
          text: "Avant de déployer sur AWS EKS ou Google GKE, tu testes tes fichiers YAML sur Minikube. Si ça marche en local, ça marchera en production (les APIs sont les mêmes).",
        },
      ],
    },
    {
      id: "premiers-pas",
      number: "1.4",
      title: "Premiers pas avec kubectl",
      blocks: [
        {
          type: "paragraph",
          text: "`kubectl` est ton outil principal pour interagir avec Kubernetes. Sa syntaxe suit le schéma : `kubectl <verbe> <ressource> [options]`.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Vérifier la version du client et du serveur\nkubectl version\n# Client Version: v1.31.0\n# Server Version: v1.31.0\n\n# Informations sur le cluster\nkubectl cluster-info\n# Kubernetes control plane is running at https://192.168.49.2:8443\n# CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/...\n\n# Lister les noeuds du cluster\nkubectl get nodes\n# NAME       STATUS   ROLES           AGE   VERSION\n# minikube   Ready    control-plane   5m    v1.31.0\n\n# Lister les namespaces\nkubectl get namespaces\n# NAME              STATUS   AGE\n# default           Active   5m\n# kube-system       Active   5m\n# kube-public       Active   5m\n# kube-node-lease   Active   5m",
          caption: "Les commandes kubectl de base pour explorer un cluster.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Détails sur un noeud spécifique\nkubectl describe node minikube\n# Affiche : capacité CPU/mémoire, pods en cours, conditions, événements...\n\n# Lister les pods du namespace kube-system (composants internes de K8s)\nkubectl get pods -n kube-system\n# NAME                               READY   STATUS    RESTARTS   AGE\n# coredns-6f6b679f8f-xxxxx           1/1     Running   0          5m\n# etcd-minikube                      1/1     Running   0          5m\n# kube-apiserver-minikube            1/1     Running   0          5m\n# kube-scheduler-minikube            1/1     Running   0          5m",
          caption: "Inspecter les noeuds et les pods système.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Crée un alias `alias k=kubectl` dans ton `.bashrc` ou `.zshrc`. Tu taperas `k get pods` au lieu de `kubectl get pods` — ça fait une vraie différence au quotidien.",
        },
        {
          type: "list",
          items: [
            "`kubectl get <ressource>` : liste les ressources (pods, nodes, namespaces, services...).",
            "`kubectl describe <ressource> <nom>` : affiche les détails et événements d'une ressource.",
            "`kubectl cluster-info` : montre les URLs des composants du cluster.",
            "`kubectl version` : affiche la version du client et du serveur.",
          ],
        },
      ],
    },
  ],
  exercises: [
    {
      id: "k1-ex1",
      title: "Version de kubectl",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande qui affiche la version de **kubectl** (client et serveur).",
      hints: [
        "La sous-commande est `version`.",
      ],
      starter: "kubectl ",
      solution: "kubectl version",
      checks: [
        { label: "Utilise kubectl", pattern: "kubectl" },
        { label: "Sous-commande version", pattern: "\\bversion\\b" },
      ],
    },
    {
      id: "k1-ex2",
      title: "Lister les noeuds",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande qui liste tous les **noeuds** du cluster.",
      hints: [
        "`kubectl get` suivi du type de ressource.",
        "Les noeuds s'appellent `nodes`.",
      ],
      starter: "kubectl ",
      solution: "kubectl get nodes",
      checks: [
        { label: "Utilise kubectl", pattern: "kubectl" },
        { label: "Sous-commande get", pattern: "\\bget\\b" },
        { label: "Ressource nodes", pattern: "\\bnodes?\\b" },
      ],
    },
    {
      id: "k1-ex3",
      title: "Informations du cluster",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande qui affiche les **informations du cluster** (URLs du control plane et de CoreDNS).",
      hints: [
        "La sous-commande s'appelle `cluster-info`.",
      ],
      starter: "kubectl ",
      solution: "kubectl cluster-info",
      checks: [
        { label: "Utilise kubectl", pattern: "kubectl" },
        { label: "Sous-commande cluster-info", pattern: "cluster-info" },
      ],
    },
    {
      id: "k1-ex4",
      title: "Lister les namespaces",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Écris la commande qui liste tous les **namespaces** du cluster.",
      hints: [
        "`kubectl get` suivi du type de ressource.",
        "Les namespaces s'abrègent aussi en `ns`.",
      ],
      starter: "kubectl ",
      solution: "kubectl get namespaces",
      checks: [
        { label: "Utilise kubectl", pattern: "kubectl" },
        { label: "Sous-commande get", pattern: "\\bget\\b" },
        { label: "Ressource namespaces", pattern: "\\b(namespaces?|ns)\\b" },
      ],
    },
    {
      id: "k1-ex5",
      title: "Décrire un noeud",
      difficulty: "moyen",
      language: "bash",
      prompt:
        "Écris la commande qui affiche les **détails complets** du noeud **minikube** (capacité, conditions, pods, événements).",
      hints: [
        "`describe` affiche tous les détails d'une ressource.",
        "Le nom du noeud est `minikube`.",
      ],
      starter: "kubectl ",
      solution: "kubectl describe node minikube",
      checks: [
        { label: "Utilise kubectl", pattern: "kubectl" },
        { label: "Sous-commande describe", pattern: "\\bdescribe\\b" },
        { label: "Ressource node", pattern: "\\bnodes?\\b" },
        { label: "Cible le noeud minikube", pattern: "\\bminikube\\b" },
      ],
    },
    {
      id: "k1-ex6",
      title: "Pods système",
      difficulty: "difficile",
      language: "bash",
      prompt:
        "Écris la commande qui liste les **pods** du namespace **kube-system** avec une **sortie élargie** (option `-o wide`).",
      hints: [
        "On spécifie le namespace avec `-n <namespace>`.",
        "L'option `-o wide` affiche des colonnes supplémentaires (IP, noeud...).",
      ],
      starter: "kubectl ",
      solution: "kubectl get pods -n kube-system -o wide",
      checks: [
        { label: "Utilise kubectl get pods", pattern: "kubectl\\s+get\\s+pods?" },
        { label: "Namespace kube-system (-n)", pattern: "-n\\s+kube-system|--namespace\\s+kube-system" },
        { label: "Sortie élargie (-o wide)", pattern: "-o\\s+wide" },
      ],
    },
  ],
  project: {
    id: "k1-projet",
    title: "Installer Minikube et explorer le cluster",
    difficulty: "moyen",
    language: "bash",
    prompt:
      "Écris les commandes (une par ligne) qui : (1) démarrent un cluster Minikube, (2) affichent le statut de Minikube, (3) affichent les informations du cluster avec kubectl, (4) listent les noeuds, (5) listent les namespaces, (6) listent les pods du namespace **kube-system**.",
    hints: [
      "`minikube start` démarre le cluster.",
      "`minikube status` affiche l'état du cluster.",
      "Les commandes kubectl : `cluster-info`, `get nodes`, `get namespaces`, `get pods -n <ns>`.",
    ],
    starter:
      "# 1. Démarrer Minikube\n\n# 2. Statut de Minikube\n\n# 3. Infos du cluster\n\n# 4. Lister les noeuds\n\n# 5. Lister les namespaces\n\n# 6. Pods du namespace kube-system\n",
    solution:
      "# 1. Démarrer Minikube\nminikube start\n\n# 2. Statut de Minikube\nminikube status\n\n# 3. Infos du cluster\nkubectl cluster-info\n\n# 4. Lister les noeuds\nkubectl get nodes\n\n# 5. Lister les namespaces\nkubectl get namespaces\n\n# 6. Pods du namespace kube-system\nkubectl get pods -n kube-system",
    checks: [
      { label: "Démarre Minikube", pattern: "minikube\\s+start" },
      { label: "Affiche le statut de Minikube", pattern: "minikube\\s+status" },
      { label: "Affiche les infos du cluster", pattern: "kubectl\\s+cluster-info" },
      { label: "Liste les noeuds", pattern: "kubectl\\s+get\\s+nodes?" },
      { label: "Liste les namespaces", pattern: "kubectl\\s+get\\s+(namespaces?|ns)" },
      { label: "Liste les pods de kube-system", pattern: "kubectl\\s+get\\s+pods?\\s+-n\\s+kube-system" },
    ],
  },
  keyTakeaways: [
    "Kubernetes orchestre des conteneurs sur un cluster : il gère le placement, le scaling, le self-healing et les mises à jour.",
    "Le control plane (API Server, etcd, Scheduler, Controller Manager) prend les décisions ; les workers (kubelet, kube-proxy) exécutent les conteneurs.",
    "Minikube crée un cluster K8s local parfait pour apprendre ; kind et k3d sont des alternatives.",
    "`kubectl` est l'outil CLI principal : `get`, `describe`, `cluster-info`, `version` sont les commandes de base.",
    "Les namespaces isolent les ressources dans un cluster (ex : `default`, `kube-system`).",
  ],
};
