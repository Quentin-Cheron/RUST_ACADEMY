import type { Chapter } from "../../types";

export const d09: Chapter = {
  number: 9,
  slug: "nginx-reverse-proxy",
  title: "Nginx : serveur web & reverse proxy",
  subtitle: "Servir des fichiers, proxifier un backend et r\u00e9partir la charge.",
  description:
    "Nginx est l'un des serveurs web les plus populaires au monde. L\u00e9ger, performant et polyvalent, il excelle aussi bien pour servir des fichiers statiques que pour jouer le r\u00f4le de **reverse proxy** ou de **load balancer**. Dans ce chapitre, on apprend \u00e0 configurer Nginx dans Docker pour h\u00e9berger un site statique, proxifier un backend et r\u00e9partir la charge entre plusieurs instances.",
  minutes: 35,
  rustBookRef: "Docs Nginx \u2014 Getting started",
  objectives: [
    "Comprendre l'architecture event-driven de Nginx et sa structure de configuration",
    "Servir un site statique avec Nginx dans un conteneur Docker",
    "Configurer Nginx en reverse proxy devant un backend",
    "Mettre en place du load balancing entre plusieurs instances",
    "Activer la compression gzip, les headers de cache et les headers de s\u00e9curit\u00e9",
  ],
  sections: [
    {
      id: "decouvrir-nginx",
      number: "9.1",
      title: "Qu'est-ce que Nginx ?",
      blocks: [
        {
          type: "paragraph",
          text: "**Nginx** (prononc\u00e9 \u00ab engine-x \u00bb) est un serveur web open-source cr\u00e9\u00e9 en 2004. Contrairement \u00e0 Apache qui cr\u00e9e un processus ou un thread par connexion, Nginx utilise une architecture **event-driven** (\u00e9v\u00e9nementielle) : un seul processus g\u00e8re des milliers de connexions simultan\u00e9es gr\u00e2ce \u00e0 une boucle d'\u00e9v\u00e9nements asynchrone. R\u00e9sultat : une empreinte m\u00e9moire minuscule et des performances tr\u00e8s \u00e9lev\u00e9es.",
        },
        {
          type: "list",
          items: [
            "**Serveur web** : sert des fichiers statiques (HTML, CSS, JS, images) avec une efficacit\u00e9 redoutable.",
            "**Reverse proxy** : re\u00e7oit les requ\u00eates des clients et les redirige vers un ou plusieurs backends (API, microservices).",
            "**Load balancer** : r\u00e9partit le trafic entre plusieurs instances d'un m\u00eame service.",
          ],
        },
        {
          type: "paragraph",
          text: "La configuration de Nginx repose sur un fichier `nginx.conf` organis\u00e9 en blocs imbriqu\u00e9s. Le bloc principal `http` contient un ou plusieurs blocs `server` (h\u00f4tes virtuels), chacun contenant des blocs `location` qui d\u00e9finissent le comportement par chemin d'URL.",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (structure)",
          code: "# Bloc principal\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    server {\n        listen 80;\n        server_name example.com;\n\n        location / {\n            # R\u00e8gles pour la racine\n        }\n\n        location /api/ {\n            # R\u00e8gles pour /api/\n        }\n    }\n}",
          caption: "Structure hi\u00e9rarchique : http > server > location.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Image officielle",
          text: "L'image Docker `nginx:alpine` p\u00e8se environ 40 Mo et embarque Nginx pr\u00e9-configur\u00e9. Le fichier de configuration par d\u00e9faut se trouve dans `/etc/nginx/nginx.conf` et le dossier HTML dans `/usr/share/nginx/html`.",
        },
      ],
    },
    {
      id: "site-statique",
      number: "9.2",
      title: "Servir un site statique",
      blocks: [
        {
          type: "paragraph",
          text: "Le cas d'usage le plus simple : servir un site statique (HTML/CSS/JS) avec Nginx. Il suffit de copier les fichiers dans le r\u00e9pertoire par d\u00e9faut de l'image.",
        },
        {
          type: "code",
          language: "dockerfile",
          filename: "Dockerfile",
          code: "FROM nginx:alpine\nCOPY ./site /usr/share/nginx/html",
          caption: "Deux lignes suffisent pour un site statique.",
        },
        {
          type: "paragraph",
          text: "Pour personnaliser le comportement (SPA, redirections, etc.), on fournit sa propre configuration Nginx :",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf",
          code: "server {\n    listen 80;\n    root /usr/share/nginx/html;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}",
          caption: "Configuration adapt\u00e9e aux Single Page Applications.",
        },
        {
          type: "paragraph",
          text: "En d\u00e9veloppement, on peut monter le dossier local directement sans construire d'image :",
        },
        {
          type: "code",
          language: "bash",
          code: "docker run -v $(pwd)/site:/usr/share/nginx/html -p 8080:80 nginx",
          caption: "Bind mount du dossier local \u2014 pratique pour it\u00e9rer vite.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Routing SPA avec try_files",
          text: "La directive `try_files $uri $uri/ /index.html` est essentielle pour les SPA (React, Vue, Angular). Elle tente d'abord de servir le fichier demand\u00e9 ; s'il n'existe pas, elle renvoie `index.html` pour laisser le routeur c\u00f4t\u00e9 client prendre la main.",
        },
      ],
    },
    {
      id: "reverse-proxy",
      number: "9.3",
      title: "Reverse proxy",
      blocks: [
        {
          type: "paragraph",
          text: "Un **reverse proxy** se place entre le client et le(s) serveur(s) backend. Le client ne communique jamais directement avec l'API : toutes les requ\u00eates passent par Nginx, qui les redistribue. Avantages : point d'entr\u00e9e unique, terminaison TLS centralis\u00e9e, mise en cache, protection contre les attaques.",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf",
          code: "upstream api {\n    server api:4000;\n}\n\nserver {\n    listen 80;\n\n    location /api/ {\n        proxy_pass http://api/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n\n    location / {\n        root /usr/share/nginx/html;\n        try_files $uri /index.html;\n    }\n}",
          caption: "Nginx sert le front et proxifie /api/ vers le backend.",
        },
        {
          type: "paragraph",
          text: "Dans Docker Compose, Nginx et le backend partagent le m\u00eame r\u00e9seau. Le nom du service (`api`) sert de nom DNS :",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  nginx:\n    build: ./nginx\n    ports:\n      - \"80:80\"\n    depends_on:\n      - api\n\n  api:\n    build: .\n    expose:\n      - \"4000\"",
          caption: "Seul Nginx publie un port. L'API reste interne au r\u00e9seau Docker.",
        },
        {
          type: "list",
          items: [
            "**Host** : transmet le nom d'h\u00f4te original de la requ\u00eate au backend.",
            "**X-Real-IP** : IP r\u00e9elle du client (sans proxy, le backend verrait l'IP de Nginx).",
            "**X-Forwarded-For** : cha\u00eene d'IPs travers\u00e9es (client, proxy 1, proxy 2\u2026).",
            "**X-Forwarded-Proto** : protocole original (`http` ou `https`) \u2014 utile quand TLS est termin\u00e9 sur Nginx.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Le slash final compte",
          text: "Avec `proxy_pass http://api/;` (slash final), Nginx supprime le pr\u00e9fixe `/api/` avant de transmettre. Sans slash (`proxy_pass http://api;`), le chemin `/api/users` est transmis tel quel au backend. Choisissez en fonction de vos routes backend.",
        },
      ],
    },
    {
      id: "load-balancing",
      number: "9.4",
      title: "Load balancing",
      blocks: [
        {
          type: "paragraph",
          text: "Quand un seul backend ne suffit plus, on lance plusieurs instances et on laisse Nginx r\u00e9partir la charge. Le bloc `upstream` liste les serveurs disponibles :",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf",
          code: "upstream backend {\n    server api1:4000;\n    server api2:4000;\n    server api3:4000;\n}\n\nserver {\n    listen 80;\n\n    location / {\n        proxy_pass http://backend;\n    }\n}",
          caption: "Trois instances derri\u00e8re un m\u00eame point d'entr\u00e9e.",
        },
        {
          type: "paragraph",
          text: "Nginx propose plusieurs strat\u00e9gies de r\u00e9partition :",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**Round-robin** (par d\u00e9faut) : chaque requ\u00eate va au serveur suivant, en boucle.",
            "**least_conn** : la requ\u00eate va au serveur qui a le moins de connexions actives. Id\u00e9al quand les requ\u00eates ont des dur\u00e9es variables.",
            "**ip_hash** : les requ\u00eates d'un m\u00eame client vont toujours au m\u00eame serveur. Utile pour les sessions sticky.",
          ],
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (least_conn)",
          code: "upstream backend {\n    least_conn;\n    server api1:4000;\n    server api2:4000;\n    server api3:4000;\n}",
          caption: "Il suffit d'ajouter la directive au d\u00e9but du bloc upstream.",
        },
        {
          type: "paragraph",
          text: "Avec Docker Compose, on peut scaler un service et laisser le DNS interne r\u00e9partir :",
        },
        {
          type: "code",
          language: "bash",
          code: "docker compose up --scale api=3 -d",
          caption: "Trois r\u00e9pliques du service api en une commande.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Scaling vs upstream fixe",
          text: "Avec `--scale`, Docker attribue des IPs dynamiques. Pour un contr\u00f4le pr\u00e9cis (poids, health checks), on pr\u00e9f\u00e8re lister explicitement les serveurs dans le bloc `upstream` ou utiliser un orchestrateur comme Docker Swarm ou Kubernetes.",
        },
      ],
    },
    {
      id: "headers-cache-gzip",
      number: "9.5",
      title: "Headers, cache et compression",
      blocks: [
        {
          type: "paragraph",
          text: "Nginx permet d'optimiser les performances et la s\u00e9curit\u00e9 en quelques directives. La compression **gzip** r\u00e9duit la taille des r\u00e9ponses textuelles (HTML, CSS, JS, JSON) de 60 \u00e0 80 %.",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (gzip)",
          code: "gzip on;\ngzip_types text/plain application/json text/css application/javascript;",
          caption: "Active la compression pour les types textuels courants.",
        },
        {
          type: "paragraph",
          text: "Les **headers de cache** indiquent au navigateur combien de temps garder un fichier en cache local :",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (cache)",
          code: "location ~* \\.(js|css|png|jpg)$ {\n    expires 30d;\n    add_header Cache-Control \"public, immutable\";\n}",
          caption: "Les assets statiques sont mis en cache 30 jours.",
        },
        {
          type: "paragraph",
          text: "On peut aussi personnaliser les **pages d'erreur** :",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (erreurs)",
          code: "error_page 404 /404.html;",
          caption: "Page 404 personnalis\u00e9e.",
        },
        {
          type: "paragraph",
          text: "Enfin, les **headers de s\u00e9curit\u00e9** prot\u00e8gent contre certaines attaques courantes :",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (s\u00e9curit\u00e9)",
          code: "add_header X-Frame-Options \"SAMEORIGIN\";\nadd_header X-Content-Type-Options \"nosniff\";\nadd_header X-XSS-Protection \"1; mode=block\";",
          caption: "Protection contre le clickjacking et le sniffing de type MIME.",
        },
        {
          type: "list",
          items: [
            "**X-Frame-Options** : emp\u00eache l'int\u00e9gration de la page dans une iframe tierce (anti-clickjacking).",
            "**X-Content-Type-Options** : emp\u00eache le navigateur de deviner le type MIME (anti-sniffing).",
            "**X-XSS-Protection** : active le filtre XSS int\u00e9gr\u00e9 du navigateur.",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          title: "Tester sa config",
          text: "Avant de red\u00e9marrer Nginx, testez la configuration avec `nginx -t`. Dans Docker : `docker exec mon-nginx nginx -t`. Une erreur de syntaxe dans `nginx.conf` emp\u00eachera le conteneur de d\u00e9marrer.",
        },
      ],
    },
    {
      id: "cas-pratique-nginx",
      number: "9.6",
      title: "Cas pratique : Nginx devant une vraie app web",
      blocks: [
        {
          type: "paragraph",
          text: "Voyons deux configurations Nginx r\u00e9alistes, comment\u00e9es ligne par ligne : un site **React SPA** avec API, et un **WordPress** avec PHP-FPM.",
        },
        {
          type: "heading",
          level: 3,
          text: "1. React SPA + API Express",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (React + API)",
          code: "server {\n    listen 80;                              # Port d'\u00e9coute (le seul expos\u00e9 au client)\n    server_name monsite.fr;                 # Nom de domaine (ou _ pour tout accepter)\n\n    # ── Compression gzip ─────────────────────────────────\n    gzip on;                                # Active la compression\n    gzip_types                              # Types MIME \u00e0 compresser\n        text/plain\n        text/css\n        application/json\n        application/javascript\n        image/svg+xml;\n    gzip_min_length 1000;                   # Ne compresse pas les fichiers < 1 Ko\n\n    # ── Frontend React (fichiers statiques) ──────────────\n    location / {\n        root /usr/share/nginx/html;         # Dossier contenant le build React (npm run build)\n        index index.html;\n        try_files $uri $uri/ /index.html;   # Cl\u00e9 du SPA : toute URL inconnue renvoie index.html\n                                            # React Router g\u00e8re le routing c\u00f4t\u00e9 client\n    }\n\n    # ── Cache des assets statiques ───────────────────────\n    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {\n        root /usr/share/nginx/html;\n        expires 30d;                        # Le navigateur garde ces fichiers 30 jours en cache\n        add_header Cache-Control \"public, immutable\";  # immutable = ne rev\u00e9rifie m\u00eame pas\n        access_log off;                     # Pas besoin de loguer chaque image servie\n    }\n\n    # ── API (reverse proxy vers le backend Express) ──────\n    location /api/ {\n        proxy_pass http://api:4000/;        # \"api\" = nom du service Docker, 4000 = port interne\n                                            # Le slash final strip le pr\u00e9fixe : /api/users -> /users\n        proxy_set_header Host $host;        # Transmet le nom de domaine original\n        proxy_set_header X-Real-IP $remote_addr;          # IP r\u00e9elle du client\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # Cha\u00eene de proxies\n        proxy_set_header X-Forwarded-Proto $scheme;       # http ou https\n    }\n\n    # ── Page d'erreur personnalis\u00e9e ──────────────────────\n    error_page 502 503 504 /50x.html;      # Si l'API est down, affiche une page propre\n    location = /50x.html {\n        root /usr/share/nginx/html;\n    }\n}",
          caption: "Configuration compl\u00e8te pour une SPA React avec API Express en reverse proxy.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le Compose associ\u00e9",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml (React + API + DB)",
          code: "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"                    # Seul point d'entr\u00e9e\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - ./frontend/build:/usr/share/nginx/html:ro  # Build React mont\u00e9 en lecture seule\n    depends_on:\n      - api\n    restart: unless-stopped\n\n  api:\n    build: ./api\n    expose:\n      - \"4000\"                     # Visible uniquement par les autres services\n    environment:\n      DATABASE_URL: postgres://app:secret@db:5432/myapp\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: unless-stopped\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: myapp\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app\"]\n      interval: 5s\n      retries: 5\n    restart: unless-stopped\n\nvolumes:\n  pgdata:",
          caption: "L'API n'a pas de port publi\u00e9 : seul Nginx y acc\u00e8de en interne.",
        },
        {
          type: "heading",
          level: 3,
          text: "2. WordPress avec PHP-FPM",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (WordPress)",
          code: "server {\n    listen 80;\n    server_name blog.exemple.fr;\n    root /var/www/html;                 # Dossier WordPress partag\u00e9 via un volume\n    index index.php index.html;\n\n    # ── Fichiers statiques ───────────────────────────────\n    location / {\n        try_files $uri $uri/ /index.php?$args;  # Si le fichier n'existe pas,\n                                                # passe la requ\u00eate \u00e0 WordPress (index.php)\n    }\n\n    # ── PHP-FPM ──────────────────────────────────────────\n    location ~ \\.php$ {\n        fastcgi_pass wordpress:9000;            # \"wordpress\" = nom du service Docker\n                                                # 9000 = port PHP-FPM par d\u00e9faut\n        fastcgi_index index.php;\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n        include fastcgi_params;                 # Param\u00e8tres standard (SERVER_NAME, etc.)\n    }\n\n    # ── S\u00e9curit\u00e9 : bloquer les fichiers sensibles ────────\n    location ~ /\\.ht {\n        deny all;                               # Bloque .htaccess, .htpasswd…\n    }\n}",
          caption: "Nginx transmet les requ\u00eates PHP \u00e0 WordPress via FastCGI.",
        },
        {
          type: "usecase",
          title: "Quand utiliser fastcgi_pass vs proxy_pass ?",
          text: "**proxy_pass** : pour les applications qui ont leur propre serveur HTTP (Node, Go, Rust, Python/Gunicorn). **fastcgi_pass** : pour PHP-FPM, qui parle le protocole FastCGI et non HTTP. WordPress, Laravel, Symfony utilisent PHP-FPM → fastcgi_pass.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d9-ex1",
      title: "Dockerfile pour un site statique",
      difficulty: "facile",
      language: "dockerfile",
      prompt:
        "\u00c9cris un **Dockerfile** qui utilise l'image `nginx:alpine` et copie le dossier `./site` dans le r\u00e9pertoire HTML par d\u00e9faut de Nginx (`/usr/share/nginx/html`).",
      hints: [
        "L'instruction `FROM` d\u00e9finit l'image de base.",
        "L'instruction `COPY` copie un dossier local dans le conteneur.",
      ],
      starter: "# Image de base\n\n# Copier le site\n",
      solution: "FROM nginx:alpine\nCOPY ./site /usr/share/nginx/html",
      checks: [
        { label: "Utilise l'image nginx:alpine", pattern: "FROM\\s+nginx:alpine" },
        { label: "Copie ./site dans le bon r\u00e9pertoire", pattern: "COPY\\s+\\.?/?site\\s+/usr/share/nginx/html" },
      ],
    },
    {
      id: "d9-ex2",
      title: "Configuration site statique",
      difficulty: "facile",
      language: "text",
      prompt:
        "\u00c9cris un bloc `server` Nginx qui \u00e9coute sur le port **80**, sert les fichiers depuis `/usr/share/nginx/html`, utilise `index.html` comme fichier d'index, et configure un `location /` avec `try_files $uri $uri/ /index.html;`.",
      hints: [
        "Le bloc commence par `server {` et se termine par `}`.",
        "`listen 80;` d\u00e9finit le port d'\u00e9coute.",
        "`root` d\u00e9finit le r\u00e9pertoire racine, `index` le fichier par d\u00e9faut.",
      ],
      starter: "server {\n\n}",
      solution:
        "server {\n    listen 80;\n    root /usr/share/nginx/html;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}",
      checks: [
        { label: "Bloc server pr\u00e9sent", pattern: "server\\s*\\{" },
        { label: "\u00c9coute sur le port 80", pattern: "listen\\s+80;" },
        { label: "Root vers /usr/share/nginx/html", pattern: "root\\s+/usr/share/nginx/html;" },
        { label: "Index index.html", pattern: "index\\s+index\\.html;" },
        { label: "Location / avec try_files", pattern: "location\\s+/\\s*\\{[\\s\\S]*try_files" },
      ],
    },
    {
      id: "d9-ex3",
      title: "Reverse proxy",
      difficulty: "moyen",
      language: "text",
      prompt:
        "\u00c9cris un bloc `server` Nginx qui \u00e9coute sur le port **80** avec : (1) un `location /api/` qui proxifie vers `http://api:4000/` avec `proxy_set_header Host $host`, et (2) un `location /` qui sert les fichiers statiques depuis `/usr/share/nginx/html` avec `try_files`.",
      hints: [
        "`proxy_pass http://api:4000/;` redirige les requ\u00eates vers le backend.",
        "`proxy_set_header` transmet les en-t\u00eates du client au backend.",
        "L'ordre des blocs `location` n'a pas d'importance, Nginx choisit le plus sp\u00e9cifique.",
      ],
      starter:
        "server {\n    listen 80;\n\n    location /api/ {\n\n    }\n\n    location / {\n\n    }\n}",
      solution:
        "server {\n    listen 80;\n\n    location /api/ {\n        proxy_pass http://api:4000/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n\n    location / {\n        root /usr/share/nginx/html;\n        try_files $uri /index.html;\n    }\n}",
      checks: [
        { label: "\u00c9coute sur le port 80", pattern: "listen\\s+80;" },
        { label: "Location /api/ pr\u00e9sent", pattern: "location\\s+/api/\\s*\\{" },
        { label: "proxy_pass vers api:4000", pattern: "proxy_pass\\s+http://api:4000" },
        { label: "Header Host transmis", pattern: "proxy_set_header\\s+Host\\s+\\$host;" },
        {
          label: "Location / pour fichiers statiques",
          pattern: "location\\s+/\\s*\\{[\\s\\S]*root\\s+/usr/share/nginx/html",
        },
        { label: "try_files pour le routing SPA", pattern: "try_files" },
      ],
    },
    {
      id: "d9-ex4",
      title: "Compose : Nginx + API",
      difficulty: "moyen",
      language: "yaml",
      prompt:
        "\u00c9cris un `compose.yaml` avec deux services : **nginx** (construit depuis le dossier `./nginx`, port `8080:80` publi\u00e9, d\u00e9pend de `api`) et **api** (construite depuis `.`, expose le port `4000` en interne uniquement, **pas de port publi\u00e9**). Nginx est le seul point d'entr\u00e9e.",
      hints: [
        "`build: ./nginx` construit depuis un sous-dossier contenant le Dockerfile et la config Nginx.",
        "`expose` rend un port visible aux autres services sans le publier sur l'h\u00f4te.",
        "Seul le service nginx a une section `ports:`.",
      ],
      starter: "services:\n  nginx:\n\n  api:\n",
      solution:
        "services:\n  nginx:\n    build: ./nginx\n    ports:\n      - \"8080:80\"\n    depends_on:\n      - api\n\n  api:\n    build: .\n    expose:\n      - \"4000\"",
      checks: [
        { label: "Section services pr\u00e9sente", pattern: "^services:" },
        { label: "Service nginx construit depuis ./nginx", pattern: "nginx:[\\s\\S]*?build:\\s*\\./nginx" },
        { label: "Port 8080:80 publi\u00e9 pour nginx", pattern: "-\\s*[\"']?8080:80[\"']?" },
        { label: "nginx d\u00e9pend de api", pattern: "nginx:[\\s\\S]*?depends_on:[\\s\\S]*?-\\s*api" },
        { label: "Service api construit depuis .", pattern: "api:[\\s\\S]*?build:\\s*\\." },
        {
          label: "api expose le port 4000 (sans publier)",
          pattern: "api:[\\s\\S]*?expose:[\\s\\S]*?-\\s*[\"']?4000[\"']?",
        },
        { label: "api ne publie pas de port", pattern: "api:[\\s\\S]*?ports:", negate: true },
      ],
    },
    {
      id: "d9-ex5",
      title: "Load balancing + gzip",
      difficulty: "difficile",
      language: "text",
      prompt:
        "\u00c9cris une configuration Nginx avec : (1) un bloc `upstream backend` contenant trois serveurs (`api1:4000`, `api2:4000`, `api3:4000`), (2) un bloc `server` qui \u00e9coute sur le port **80** et proxifie vers `http://backend`, et (3) la directive `gzip on;` dans le bloc server.",
      hints: [
        "Le bloc `upstream` se place avant le bloc `server`.",
        "`proxy_pass http://backend;` renvoie vers le groupe upstream.",
        "`gzip on;` s'active dans le bloc `server` ou `http`.",
      ],
      starter: "upstream backend {\n\n}\n\nserver {\n\n}",
      solution:
        "upstream backend {\n    server api1:4000;\n    server api2:4000;\n    server api3:4000;\n}\n\nserver {\n    listen 80;\n    gzip on;\n    gzip_types text/plain application/json text/css application/javascript;\n\n    location / {\n        proxy_pass http://backend;\n    }\n}",
      checks: [
        { label: "Bloc upstream backend", pattern: "upstream\\s+backend\\s*\\{" },
        { label: "Serveur api1:4000", pattern: "server\\s+api1:4000;" },
        { label: "Serveur api2:4000", pattern: "server\\s+api2:4000;" },
        { label: "Serveur api3:4000", pattern: "server\\s+api3:4000;" },
        { label: "proxy_pass vers http://backend", pattern: "proxy_pass\\s+http://backend" },
        { label: "gzip activ\u00e9", pattern: "gzip\\s+on;" },
      ],
    },
    {
      id: "d9-ex6",
      title: "Nginx en bind mount",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Lance l'image **nginx:alpine** en arri\u00e8re-plan, port **8080:80**, en montant le fichier local `nginx.conf` sur `/etc/nginx/conf.d/default.conf` en **lecture seule** (`:ro`).",
      hints: [
        "Le bind mount d'un fichier suit la m\u00eame syntaxe qu'un dossier : `-v source:destination:ro`.",
        "`:ro` rend le montage en lecture seule.",
      ],
      starter: "docker run ",
      solution: "docker run -d -p 8080:80 -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine",
      checks: [
        { label: "docker run en arri\u00e8re-plan", pattern: "docker\\s+run.*-d" },
        { label: "Port 8080:80", pattern: "-p\\s+8080:80" },
        { label: "Bind mount nginx.conf", pattern: "-v.*nginx\\.conf:/etc/nginx/conf\\.d/default\\.conf" },
        { label: "Lecture seule (:ro)", pattern: ":ro" },
        { label: "Image nginx:alpine", pattern: "nginx:alpine" },
      ],
    },
    {
      id: "d9-ex7",
      title: "Gzip et cache headers",
      difficulty: "moyen",
      language: "text",
      prompt:
        "\u00c9cris un bloc `server` Nginx qui \u00e9coute sur le port **80**, active **gzip** (avec `gzip_types` pour `text/plain`, `application/json`, `text/css`, `application/javascript`), et ajoute un bloc `location` pour les assets statiques (`~* \\.(js|css|png|jpg)$`) avec `expires 30d` et `add_header Cache-Control \"public, immutable\"`.",
      hints: [
        "`gzip on;` active la compression.",
        "`location ~*` fait un match case-insensitive sur les extensions.",
        "`expires 30d;` ajoute automatiquement un header Cache-Control.",
      ],
      starter: "server {\n    listen 80;\n\n}",
      solution: "server {\n    listen 80;\n    gzip on;\n    gzip_types text/plain application/json text/css application/javascript;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n    }\n\n    location ~* \\.(js|css|png|jpg)$ {\n        expires 30d;\n        add_header Cache-Control \"public, immutable\";\n    }\n}",
      checks: [
        { label: "gzip activ\u00e9", pattern: "gzip\\s+on;" },
        { label: "gzip_types d\u00e9finis", pattern: "gzip_types.*application/json" },
        { label: "Location pour les assets", pattern: "location.*\\\\\\." },
        { label: "Expires 30 jours", pattern: "expires\\s+30d" },
        { label: "Header Cache-Control", pattern: "add_header\\s+Cache-Control" },
      ],
    },
    {
      id: "d9-ex8",
      title: "Reverse proxy + static + error pages",
      difficulty: "difficile",
      language: "text",
      prompt:
        "\u00c9cris une config Nginx compl\u00e8te avec un bloc `server` qui : (1) \u00e9coute sur le port **80**, (2) sert les fichiers statiques sur `/` depuis `/usr/share/nginx/html` avec `try_files`, (3) proxifie `/api/` vers `http://api:4000/` avec `proxy_set_header Host $host` et `proxy_set_header X-Real-IP $remote_addr`, (4) d\u00e9finit une page d'erreur 404 personnalis\u00e9e avec `error_page 404 /404.html`.",
      hints: [
        "`location /api/` est plus sp\u00e9cifique que `location /` : Nginx le matche en priorit\u00e9.",
        "`proxy_pass http://api:4000/;` avec le slash final strip le pr\u00e9fixe `/api/`.",
        "`error_page 404 /404.html;` se place dans le bloc server.",
      ],
      starter: "server {\n    listen 80;\n\n}",
      solution: "server {\n    listen 80;\n\n    error_page 404 /404.html;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n        try_files $uri $uri/ /index.html;\n    }\n\n    location /api/ {\n        proxy_pass http://api:4000/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}",
      checks: [
        { label: "\u00c9coute sur le port 80", pattern: "listen\\s+80" },
        { label: "Root pour fichiers statiques", pattern: "root\\s+/usr/share/nginx/html" },
        { label: "try_files pour SPA", pattern: "try_files" },
        { label: "Reverse proxy /api/ vers api:4000", pattern: "location\\s+/api/[\\s\\S]*proxy_pass\\s+http://api:4000" },
        { label: "Header Host transmis", pattern: "proxy_set_header\\s+Host\\s+\\$host" },
        { label: "Header X-Real-IP transmis", pattern: "proxy_set_header\\s+X-Real-IP\\s+\\$remote_addr" },
        { label: "Page d'erreur 404 personnalis\u00e9e", pattern: "error_page\\s+404\\s+/404\\.html" },
      ],
    },
  ],
  project: {
    id: "d9-projet",
    title: "Stack compl\u00e8te : Nginx + API + base de donn\u00e9es",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "\u00c9cris un `compose.yaml` pour une stack compl\u00e8te \u00e0 trois services. **nginx** : construit depuis `./nginx` (contient le Dockerfile et le `nginx.conf` de reverse proxy), port `80:80` publi\u00e9, d\u00e9pend de `api`. **api** : construite depuis `.`, pas de port publi\u00e9 (accessible uniquement via Nginx), expose `4000`. **db** : image `postgres:16`, variable `POSTGRES_PASSWORD` \u00e0 `secret`, volume nomm\u00e9 `pgdata` mont\u00e9 sur `/var/lib/postgresql/data`. L'api d\u00e9pend de `db`. D\u00e9clare le volume `pgdata` \u00e0 la racine du fichier.\n\nLe `nginx.conf` (non \u00e9valu\u00e9 ici) proxifie `/api/` vers `http://api:4000/` et sert le front sur `/`.",
    hints: [
      "Seul Nginx publie un port : il est le point d'entr\u00e9e unique.",
      "`expose: [\"4000\"]` rend le port visible aux autres services sans le publier sur l'h\u00f4te.",
      "Le volume `pgdata` est d\u00e9clar\u00e9 au niveau racine et mont\u00e9 dans le service `db`.",
      "L'api d\u00e9pend de db, et nginx d\u00e9pend de api.",
    ],
    starter: "services:\n  nginx:\n\n  api:\n\n  db:\n\nvolumes:\n",
    solution:
      "services:\n  nginx:\n    build: ./nginx\n    ports:\n      - \"80:80\"\n    depends_on:\n      - api\n\n  api:\n    build: .\n    expose:\n      - \"4000\"\n    depends_on:\n      - db\n\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nvolumes:\n  pgdata:",
    checks: [
      { label: "Trois services (nginx, api, db)", pattern: "nginx:[\\s\\S]*api:[\\s\\S]*db:" },
      { label: "nginx construit depuis ./nginx", pattern: "nginx:[\\s\\S]*?build:\\s*\\./nginx" },
      { label: "Port 80:80 publi\u00e9 pour nginx", pattern: "-\\s*[\"']?80:80[\"']?" },
      { label: "nginx d\u00e9pend de api", pattern: "nginx:[\\s\\S]*?depends_on:[\\s\\S]*?-\\s*api" },
      { label: "api construite localement sans port publi\u00e9", pattern: "api:[\\s\\S]*?build:\\s*\\." },
      {
        label: "api expose le port 4000",
        pattern: "api:[\\s\\S]*?expose:[\\s\\S]*?-\\s*[\"']?4000[\"']?",
      },
      { label: "api d\u00e9pend de db", pattern: "api:[\\s\\S]*?depends_on:[\\s\\S]*?-\\s*db" },
      { label: "db en postgres:16", pattern: "image:\\s*postgres:16" },
      { label: "Mot de passe d\u00e9fini pour db", pattern: "POSTGRES_PASSWORD:\\s*secret" },
      { label: "Volume pgdata mont\u00e9 sur db", pattern: "pgdata:/var/lib/postgresql/data" },
      { label: "Volume pgdata d\u00e9clar\u00e9 \u00e0 la racine", pattern: "^volumes:\\s*\\n\\s*pgdata:" },
    ],
  },
  keyTakeaways: [
    "Nginx est un serveur web event-driven ultra-performant qui sert aussi de reverse proxy et de load balancer.",
    "Pour servir un site statique : `FROM nginx:alpine` + `COPY` des fichiers dans `/usr/share/nginx/html`.",
    "En reverse proxy, `proxy_pass` redirige les requ\u00eates vers un backend ; les headers `X-Real-IP` et `X-Forwarded-For` transmettent l'identit\u00e9 du client.",
    "Le bloc `upstream` liste plusieurs serveurs pour le load balancing (round-robin, least_conn, ip_hash).",
    "La compression gzip, les headers de cache (`expires`, `Cache-Control`) et les headers de s\u00e9curit\u00e9 (`X-Frame-Options`, `X-Content-Type-Options`) s'activent en quelques lignes.",
  ],
};
