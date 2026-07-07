import type { Chapter } from "../../types";

export const d10: Chapter = {
  number: 10,
  slug: "https-certificats",
  title: "HTTPS & certificats",
  subtitle: "Sécuriser les échanges avec TLS, certificats auto-signés et Let's Encrypt.",
  description:
    "Les navigateurs modernes exigent HTTPS, et les utilisateurs s'attendent à voir le cadenas. Ce chapitre montre comment sécuriser une application web derrière **Nginx** dans Docker : d'abord avec un certificat auto-signé pour le développement, puis avec **Let's Encrypt** (Certbot) pour la production. On aborde aussi la redirection HTTP vers HTTPS et les en-têtes de sécurité.",
  minutes: 30,
  rustBookRef: "Docs Nginx — HTTPS",
  objectives: [
    "Comprendre le fonctionnement de TLS et le rôle des certificats",
    "Générer un certificat auto-signé pour le développement local",
    "Mettre en place Let's Encrypt avec Certbot dans Docker Compose",
    "Configurer la redirection HTTP vers HTTPS et les en-têtes de sécurité",
  ],
  sections: [
    {
      id: "tls-principes",
      number: "10.1",
      title: "TLS/SSL : pourquoi et comment",
      blocks: [
        {
          type: "paragraph",
          text: "**HTTPS** = HTTP + **TLS** (Transport Layer Security, successeur de SSL). Le navigateur et le serveur négocient une connexion chiffrée avant d'échanger la moindre donnée. Résultat : personne ne peut lire ni modifier le trafic entre les deux.",
        },
        {
          type: "heading",
          level: 3,
          text: "Le handshake TLS en bref",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Le client envoie un **ClientHello** (versions TLS, suites cryptographiques supportées).",
            "Le serveur répond avec son **certificat** (clé publique + identité) et choisit une suite.",
            "Le client vérifie que le certificat est signé par une **autorité de confiance** (CA).",
            "Les deux parties génèrent une **clé de session** symétrique ; tout le trafic est ensuite chiffré.",
          ],
        },
        {
          type: "paragraph",
          text: "Un **certificat** contient la clé publique du serveur, le nom de domaine couvert et la signature d'une CA. C'est cette chaîne de confiance qui permet au navigateur de vérifier l'identité du serveur.",
        },
        {
          type: "list",
          items: [
            "**Sécurité** : chiffrement des données, protection contre le man-in-the-middle.",
            "**SEO** : Google favorise les sites HTTPS dans son classement.",
            "**Navigateurs** : Chrome et Firefox affichent « Non sécurisé » pour les sites HTTP.",
            "**APIs modernes** : certaines fonctionnalités (géolocalisation, Service Workers) exigent HTTPS.",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Types de certificats",
        },
        {
          type: "list",
          items: [
            "**Auto-signé** : gratuit, généré localement, idéal pour le dev. Le navigateur affiche un avertissement.",
            "**Let's Encrypt** : gratuit, automatisé, reconnu par tous les navigateurs. Le standard en production.",
            "**Commercial** (DigiCert, Sectigo…) : payant, support garanti, parfois exigé en entreprise.",
          ],
        },
      ],
    },
    {
      id: "certificat-auto-signe",
      number: "10.2",
      title: "Certificat auto-signé pour le développement",
      blocks: [
        {
          type: "paragraph",
          text: "En développement, on n'a pas de nom de domaine public. Un certificat **auto-signé** permet d'activer HTTPS localement pour tester la configuration Nginx.",
        },
        {
          type: "code",
          language: "bash",
          code: "openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\\n  -keyout key.pem -out cert.pem \\\n  -subj \"/CN=localhost\"",
          caption: "Génère une paire clé privée + certificat valable 1 an pour localhost.",
        },
        {
          type: "list",
          items: [
            "**-x509** : produit un certificat auto-signé (pas une simple demande CSR).",
            "**-nodes** : pas de mot de passe sur la clé privée.",
            "**-newkey rsa:2048** : génère une nouvelle clé RSA de 2048 bits.",
            "**-subj \"/CN=localhost\"** : définit le Common Name (nom de domaine couvert).",
          ],
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf",
          code: "server {\n    listen 443 ssl;\n    server_name localhost;\n\n    ssl_certificate     /etc/nginx/certs/cert.pem;\n    ssl_certificate_key /etc/nginx/certs/key.pem;\n\n    location / {\n        root   /usr/share/nginx/html;\n        index  index.html;\n    }\n}",
          caption: "Bloc serveur HTTPS minimal avec certificat auto-signé.",
        },
        {
          type: "code",
          language: "bash",
          code: "docker run -d --name nginx-https \\\n  -p 443:443 \\\n  -v $(pwd)/certs:/etc/nginx/certs:ro \\\n  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \\\n  nginx:alpine",
          caption: "Le dossier certs/ contenant cert.pem et key.pem est monté en lecture seule.",
        },
        {
          type: "callout",
          variant: "info",
          title: "Avertissement du navigateur",
          text: "Avec un certificat auto-signé, le navigateur affiche « Votre connexion n'est pas privée ». C'est normal : aucune CA ne l'a validé. En dev, acceptez l'exception manuellement.",
        },
      ],
    },
    {
      id: "lets-encrypt",
      number: "10.3",
      title: "Let's Encrypt avec Certbot",
      blocks: [
        {
          type: "paragraph",
          text: "**Let's Encrypt** est une autorité de certification gratuite et automatisée. **Certbot** est l'outil officiel pour obtenir et renouveler les certificats. En production, Nginx et Certbot partagent des volumes dans Docker Compose.",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml",
          code: "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - certbot-etc:/etc/letsencrypt\n      - certbot-var:/var/www/certbot\n\n  certbot:\n    image: certbot/certbot\n    volumes:\n      - certbot-etc:/etc/letsencrypt\n      - certbot-var:/var/www/certbot\n\nvolumes:\n  certbot-etc:\n  certbot-var:",
          caption: "Nginx sert le site et le challenge ACME ; Certbot génère les certificats.",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf",
          code: "server {\n    listen 80;\n    server_name mondomaine.fr;\n\n    location /.well-known/acme-challenge/ {\n        root /var/www/certbot;\n    }\n\n    location / {\n        return 301 https://$host$request_uri;\n    }\n}\n\nserver {\n    listen 443 ssl;\n    server_name mondomaine.fr;\n\n    ssl_certificate     /etc/letsencrypt/live/mondomaine.fr/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/mondomaine.fr/privkey.pem;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n    }\n}",
          caption: "Le bloc port 80 sert le challenge puis redirige vers HTTPS.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Première obtention du certificat\ndocker compose run --rm certbot certonly \\\n  --webroot -w /var/www/certbot \\\n  -d mondomaine.fr --agree-tos -m admin@mondomaine.fr\n\n# Renouvellement (à planifier via cron)\ndocker compose run --rm certbot renew",
          caption: "Let's Encrypt émet des certificats valables 90 jours.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Renouvellement automatique",
          text: "Ajoutez une tâche cron qui exécute `docker compose run --rm certbot renew` toutes les semaines. Certbot ne renouvelle que si le certificat expire dans moins de 30 jours.",
        },
      ],
    },
    {
      id: "redirection-https",
      number: "10.4",
      title: "Redirection HTTP vers HTTPS",
      blocks: [
        {
          type: "paragraph",
          text: "En production, tout le trafic HTTP doit être redirigé vers HTTPS. On ajoute un bloc serveur sur le port 80 qui renvoie un code **301** (redirection permanente).",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (bloc HTTP)",
          code: "server {\n    listen 80;\n    server_name _;\n    return 301 https://$host$request_uri;\n}",
          caption: "Toute requête HTTP est renvoyée en HTTPS avec un 301.",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx.conf (complet)",
          code: "server {\n    listen 80;\n    server_name mondomaine.fr;\n    return 301 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n    server_name mondomaine.fr;\n\n    ssl_certificate     /etc/letsencrypt/live/mondomaine.fr/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/mondomaine.fr/privkey.pem;\n\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_prefer_server_ciphers on;\n\n    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n    }\n}",
          caption: "Configuration production : redirection, TLS moderne et HSTS.",
        },
        {
          type: "list",
          items: [
            "**HSTS** (`Strict-Transport-Security`) : force le navigateur à toujours utiliser HTTPS pendant la durée indiquée.",
            "**ssl_protocols TLSv1.2 TLSv1.3** : désactive les anciennes versions vulnérables.",
            "**ssl_prefer_server_ciphers on** : le serveur impose sa suite cryptographique préférée.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "HSTS est irréversible côté client",
          text: "Une fois l'en-tête HSTS reçu, le navigateur refuse de se connecter en HTTP pendant toute la durée du `max-age`. Ne l'activez que quand HTTPS fonctionne parfaitement.",
        },
      ],
    },
    {
      id: "cas-pratique-https",
      number: "10.5",
      title: "Cas pratique : déployer un site HTTPS de A à Z",
      blocks: [
        {
          type: "paragraph",
          text: "Scénario complet : tu as un nom de domaine `monapp.fr`, une API Express et un frontend React. On met tout en HTTPS avec Let's Encrypt.",
        },
        {
          type: "heading",
          level: 3,
          text: "Étape 1 : la config Nginx de production",
        },
        {
          type: "code",
          language: "text",
          filename: "nginx/default.conf",
          code: "# ── Bloc HTTP : redirection + challenge ACME ────────────\nserver {\n    listen 80;                                  # Port HTTP\n    server_name monapp.fr www.monapp.fr;        # Les domaines couverts\n\n    # Certbot dépose un fichier de vérification ici.\n    # Nginx doit le servir pour prouver qu'on contrôle le domaine.\n    location /.well-known/acme-challenge/ {\n        root /var/www/certbot;                  # Volume partagé avec le conteneur Certbot\n    }\n\n    # Tout le reste → HTTPS (redirection permanente 301).\n    location / {\n        return 301 https://$host$request_uri;\n    }\n}\n\n# ── Bloc HTTPS : le vrai serveur ────────────────────────\nserver {\n    listen 443 ssl;                             # Active TLS sur ce bloc\n    server_name monapp.fr www.monapp.fr;\n\n    # Chemins des certificats générés par Certbot.\n    # fullchain.pem = certificat + chaîne intermédiaire.\n    # privkey.pem = clé privée.\n    ssl_certificate     /etc/letsencrypt/live/monapp.fr/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/monapp.fr/privkey.pem;\n\n    # Sécurité TLS :\n    ssl_protocols TLSv1.2 TLSv1.3;             # Désactive les vieilles versions vulnérables\n    ssl_prefer_server_ciphers on;              # Le serveur choisit la suite crypto\n    ssl_session_cache shared:SSL:10m;          # Cache des sessions TLS (performance)\n\n    # HSTS : force le navigateur à utiliser HTTPS pendant 1 an.\n    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\n    # Empêche l'affichage dans une iframe (anti-clickjacking).\n    add_header X-Frame-Options DENY always;\n    # Empêche le navigateur de deviner le type MIME.\n    add_header X-Content-Type-Options nosniff always;\n\n    # Frontend React (fichiers statiques).\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n        try_files $uri $uri/ /index.html;\n    }\n\n    # Reverse proxy vers l'API Express.\n    location /api/ {\n        proxy_pass http://api:4000/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto https;  # L'API sait qu'elle est derrière HTTPS\n    }\n}",
          caption: "Config production complète : redirection HTTP, HTTPS, sécurité, reverse proxy.",
        },
        {
          type: "heading",
          level: 3,
          text: "Étape 2 : le compose.yaml de production",
        },
        {
          type: "code",
          language: "yaml",
          filename: "compose.yaml (production HTTPS)",
          code: "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"                         # Redirection HTTP → HTTPS\n      - \"443:443\"                       # HTTPS\n    volumes:\n      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro\n      - ./frontend/build:/usr/share/nginx/html:ro\n      - letsencrypt:/etc/letsencrypt    # Certificats Let's Encrypt\n      - certbot-www:/var/www/certbot    # Challenge ACME\n    depends_on:\n      - api\n    restart: always                     # « always » car c'est le point d'entrée\n\n  api:\n    build:\n      context: ./api\n      target: production\n    env_file: .env\n    expose:\n      - \"4000\"\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: always\n\n  db:\n    image: postgres:16-alpine\n    env_file: .env\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U $$POSTGRES_USER\"]\n      interval: 5s\n      retries: 5\n    restart: always\n\n  certbot:\n    image: certbot/certbot\n    volumes:\n      - letsencrypt:/etc/letsencrypt\n      - certbot-www:/var/www/certbot\n    # Pas de « restart » : Certbot s'exécute ponctuellement,\n    # pas en permanence.\n\nvolumes:\n  pgdata:\n  letsencrypt:\n  certbot-www:",
          caption: "4 services : Nginx (HTTPS) + API + DB + Certbot pour les certificats.",
        },
        {
          type: "heading",
          level: 3,
          text: "Étape 3 : obtenir le certificat",
        },
        {
          type: "code",
          language: "bash",
          code: "# 1. Démarrer Nginx (en HTTP seulement pour le challenge)\ndocker compose up -d nginx\n\n# 2. Lancer Certbot pour obtenir le certificat\ndocker compose run --rm certbot certonly \\\n  --webroot -w /var/www/certbot \\\n  -d monapp.fr -d www.monapp.fr \\\n  --agree-tos -m admin@monapp.fr\n\n# 3. Redémarrer Nginx pour activer HTTPS\ndocker compose restart nginx\n\n# 4. Démarrer toute la stack\ndocker compose up -d",
          caption: "Le certificat est valable 90 jours. Automatise le renouvellement avec cron.",
        },
        {
          type: "callout",
          variant: "tip",
          title: "Renouvellement automatique",
          text: "Ajoute dans le crontab du serveur : `0 3 * * 1 docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload`. Chaque lundi à 3h, Certbot renouvelle si nécessaire et Nginx recharge les certificats.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "d10-ex1",
      title: "Générer un certificat auto-signé",
      difficulty: "facile",
      language: "bash",
      prompt:
        "Écris la commande `openssl` qui génère un certificat auto-signé **x509** pour **localhost**, sans mot de passe (**-nodes**), valable **365** jours, clé RSA **2048** bits. Fichiers : `key.pem` (clé) et `cert.pem` (certificat).",
      hints: [
        "`openssl req -x509` pour un certificat auto-signé.",
        "`-keyout key.pem -out cert.pem` pour nommer les fichiers.",
        "`-subj \"/CN=localhost\"` pour le Common Name.",
      ],
      starter: "openssl ",
      solution:
        'openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost"',
      checks: [
        { label: "Utilise openssl req", pattern: "openssl\\s+req" },
        { label: "Certificat auto-signé (-x509)", pattern: "-x509" },
        { label: "Sans mot de passe (-nodes)", pattern: "-nodes" },
        { label: "Validité 365 jours", pattern: "-days\\s+365" },
        { label: "Clé RSA 2048 bits", pattern: "-newkey\\s+rsa:2048" },
        { label: "Fichier clé key.pem", pattern: "-keyout\\s+key\\.pem" },
        { label: "Fichier certificat cert.pem", pattern: "-out\\s+cert\\.pem" },
        { label: "CN=localhost", pattern: "CN=localhost" },
      ],
    },
    {
      id: "d10-ex2",
      title: "Bloc serveur HTTPS Nginx",
      difficulty: "moyen",
      language: "text",
      prompt:
        "Écris un bloc `server` Nginx qui écoute sur le port **443 ssl**, avec `ssl_certificate` pointant vers `/etc/nginx/certs/cert.pem` et `ssl_certificate_key` vers `/etc/nginx/certs/key.pem`. Le `root` est `/usr/share/nginx/html` avec un `index index.html`.",
      hints: [
        "`listen 443 ssl;` active le mode TLS.",
        "Les chemins des certificats sont absolus.",
      ],
      starter: "server {\n\n}",
      solution:
        "server {\n    listen 443 ssl;\n\n    ssl_certificate     /etc/nginx/certs/cert.pem;\n    ssl_certificate_key /etc/nginx/certs/key.pem;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n    }\n}",
      checks: [
        { label: "Écoute sur 443 ssl", pattern: "listen\\s+443\\s+ssl" },
        { label: "Chemin du certificat", pattern: "ssl_certificate\\s+/etc/nginx/certs/cert\\.pem" },
        { label: "Chemin de la clé privée", pattern: "ssl_certificate_key\\s+/etc/nginx/certs/key\\.pem" },
        { label: "Root défini", pattern: "root\\s+/usr/share/nginx/html" },
      ],
    },
    {
      id: "d10-ex3",
      title: "Redirection HTTP vers HTTPS",
      difficulty: "moyen",
      language: "text",
      prompt:
        "Écris un bloc `server` Nginx qui écoute sur le port **80** et redirige **tout** le trafic vers HTTPS avec un code **301**. Utilise `$host$request_uri` pour conserver l'URL.",
      hints: [
        "`return 301 https://...` pour la redirection permanente.",
        "`$host` et `$request_uri` conservent le domaine et le chemin.",
      ],
      starter: "server {\n\n}",
      solution:
        "server {\n    listen 80;\n    server_name _;\n    return 301 https://$host$request_uri;\n}",
      checks: [
        { label: "Écoute sur le port 80", pattern: "listen\\s+80" },
        { label: "Redirection 301", pattern: "return\\s+301" },
        { label: "Redirige vers HTTPS", pattern: "https://\\$host\\$request_uri" },
      ],
    },
    {
      id: "d10-ex4",
      title: "Compose Nginx + Certbot",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **nginx** (image `nginx:alpine`, ports 80 et 443, volumes : `./nginx.conf` monté en lecture seule sur `/etc/nginx/conf.d/default.conf`, `certbot-etc:/etc/letsencrypt`, `certbot-var:/var/www/certbot`) et **certbot** (image `certbot/certbot`, volumes `certbot-etc` et `certbot-var`). Déclare les volumes nommés.",
      hints: [
        "Les volumes `certbot-etc` et `certbot-var` sont partagés entre nginx et certbot.",
        "`:ro` rend le montage en lecture seule.",
      ],
      starter: "services:\n  nginx:\n\n  certbot:\n\nvolumes:\n",
      solution:
        "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - certbot-etc:/etc/letsencrypt\n      - certbot-var:/var/www/certbot\n\n  certbot:\n    image: certbot/certbot\n    volumes:\n      - certbot-etc:/etc/letsencrypt\n      - certbot-var:/var/www/certbot\n\nvolumes:\n  certbot-etc:\n  certbot-var:",
      checks: [
        { label: "Nginx avec image nginx:alpine", pattern: "image:\\s*nginx:alpine" },
        { label: "Port 80 publié", pattern: "-\\s*[\"']?80:80[\"']?" },
        { label: "Port 443 publié", pattern: "-\\s*[\"']?443:443[\"']?" },
        { label: "nginx.conf monté", pattern: "\\./nginx\\.conf:/etc/nginx/conf\\.d/default\\.conf" },
        { label: "Volume certbot-etc partagé", pattern: "certbot-etc:/etc/letsencrypt" },
        { label: "Volume certbot-var partagé", pattern: "certbot-var:/var/www/certbot" },
        { label: "Service certbot", pattern: "image:\\s*certbot/certbot" },
        { label: "Volumes déclarés", pattern: "^volumes:[\\s\\S]*certbot-etc:[\\s\\S]*certbot-var:" },
      ],
    },
    {
      id: "d10-ex5",
      title: "Config HTTPS complète avec HSTS",
      difficulty: "moyen",
      language: "text",
      prompt:
        "Écris une config Nginx avec **deux blocs server**. Le premier écoute sur le port **80** et redirige tout vers HTTPS (301). Le second écoute sur **443 ssl**, avec `ssl_certificate /etc/nginx/certs/cert.pem`, `ssl_certificate_key /etc/nginx/certs/key.pem`, `ssl_protocols TLSv1.2 TLSv1.3`, et l'en-tête HSTS `Strict-Transport-Security \"max-age=31536000\"`. Le root est `/usr/share/nginx/html`.",
      hints: [
        "Deux blocs `server {}` séparés : un pour HTTP, un pour HTTPS.",
        "HSTS s'ajoute avec `add_header Strict-Transport-Security ...`.",
      ],
      starter: "# Bloc HTTP\nserver {\n\n}\n\n# Bloc HTTPS\nserver {\n\n}",
      solution:
        "server {\n    listen 80;\n    server_name _;\n    return 301 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n\n    ssl_certificate     /etc/nginx/certs/cert.pem;\n    ssl_certificate_key /etc/nginx/certs/key.pem;\n    ssl_protocols TLSv1.2 TLSv1.3;\n\n    add_header Strict-Transport-Security \"max-age=31536000\" always;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n    }\n}",
      checks: [
        { label: "Bloc HTTP sur port 80", pattern: "listen\\s+80" },
        { label: "Redirection 301 vers HTTPS", pattern: "return\\s+301\\s+https" },
        { label: "Bloc HTTPS sur port 443 ssl", pattern: "listen\\s+443\\s+ssl" },
        { label: "ssl_protocols TLS 1.2 et 1.3", pattern: "ssl_protocols\\s+TLSv1\\.2\\s+TLSv1\\.3" },
        { label: "En-tête HSTS", pattern: "Strict-Transport-Security" },
        { label: "Certificat configuré", pattern: "ssl_certificate\\s+/etc/nginx/certs/cert\\.pem" },
      ],
    },
    {
      id: "d10-ex6",
      title: "Compose HTTPS auto-signé + API",
      difficulty: "difficile",
      language: "yaml",
      prompt:
        "Écris un `compose.yaml` avec **nginx** (image `nginx:alpine`, ports 80 et 443, volumes : `./nginx.conf` monté sur `/etc/nginx/conf.d/default.conf:ro` et `./certs` monté sur `/etc/nginx/certs:ro`, dépend de api) et **api** (build local, pas de port publié, expose 4000). Nginx gère le HTTPS avec les certificats auto-signés dans `./certs`.",
      hints: [
        "Le dossier ./certs contient cert.pem et key.pem.",
        "L'API n'a pas de port publié : seul Nginx y accède en interne.",
      ],
      starter: "services:\n  nginx:\n\n  api:\n",
      solution:
        "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - ./certs:/etc/nginx/certs:ro\n    depends_on:\n      - api\n\n  api:\n    build: .\n    expose:\n      - \"4000\"",
      checks: [
        { label: "Image nginx:alpine", pattern: "image:\\s*nginx:alpine" },
        { label: "Port 80 publié", pattern: "-\\s*[\"']?80:80[\"']?" },
        { label: "Port 443 publié", pattern: "-\\s*[\"']?443:443[\"']?" },
        { label: "nginx.conf monté en ro", pattern: "\\./nginx\\.conf:/etc/nginx/conf\\.d/default\\.conf:ro" },
        { label: "Certs montés en ro", pattern: "\\./certs:/etc/nginx/certs:ro" },
        { label: "Nginx dépend de api", pattern: "depends_on:[\\s\\S]*-\\s*api" },
        { label: "API expose 4000 sans publier", pattern: "expose:[\\s\\S]*[\"']?4000[\"']?" },
      ],
    },
  ],
  project: {
    id: "d10-projet",
    title: "Stack HTTPS complète",
    difficulty: "difficile",
    language: "yaml",
    prompt:
      "Écris un `compose.yaml` pour une stack HTTPS de production. **nginx** : construit depuis `./nginx`, ports 80 et 443, volumes `letsencrypt:/etc/letsencrypt` et `certbot-www:/var/www/certbot`, dépend de api. **api** : construite depuis `.`, aucun port publié. **certbot** : image `certbot/certbot`, volumes `letsencrypt` et `certbot-www`. Déclare les deux volumes nommés.",
    hints: [
      "Nginx publie les ports et fait reverse proxy vers api (réseau interne).",
      "L'api ne publie aucun port : seul Nginx y accède.",
      "Certbot partage les volumes de certificats avec Nginx.",
    ],
    starter: "services:\n  nginx:\n\n  api:\n\n  certbot:\n\nvolumes:\n",
    solution:
      "services:\n  nginx:\n    build: ./nginx\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - letsencrypt:/etc/letsencrypt\n      - certbot-www:/var/www/certbot\n    depends_on:\n      - api\n\n  api:\n    build: .\n\n  certbot:\n    image: certbot/certbot\n    volumes:\n      - letsencrypt:/etc/letsencrypt\n      - certbot-www:/var/www/certbot\n\nvolumes:\n  letsencrypt:\n  certbot-www:",
    checks: [
      { label: "Trois services", pattern: "nginx:[\\s\\S]*api:[\\s\\S]*certbot:" },
      { label: "Nginx construit depuis ./nginx", pattern: "build:\\s*\\./nginx" },
      { label: "Port 80", pattern: "-\\s*[\"']?80:80[\"']?" },
      { label: "Port 443", pattern: "-\\s*[\"']?443:443[\"']?" },
      { label: "Volumes Let's Encrypt", pattern: "letsencrypt:/etc/letsencrypt" },
      { label: "Volume webroot Certbot", pattern: "certbot-www:/var/www/certbot" },
      { label: "Nginx dépend de api", pattern: "depends_on:[\\s\\S]*-\\s*api" },
      { label: "API construite depuis .", pattern: "api:[\\s\\S]*build:\\s*\\." },
      { label: "Certbot image officielle", pattern: "image:\\s*certbot/certbot" },
      { label: "Volumes déclarés", pattern: "^volumes:[\\s\\S]*letsencrypt:[\\s\\S]*certbot-www:" },
    ],
  },
  keyTakeaways: [
    "TLS chiffre les échanges ; le certificat prouve l'identité du serveur via une chaîne de confiance.",
    "Un certificat auto-signé suffit pour le dev ; en production, Let's Encrypt est gratuit et reconnu.",
    "Certbot automatise l'obtention et le renouvellement via le challenge HTTP-01 (volume partagé avec Nginx).",
    "Toujours rediriger HTTP (port 80) vers HTTPS (port 443) avec `return 301` dans Nginx.",
    "HSTS, `ssl_protocols TLSv1.2 TLSv1.3` et `ssl_prefer_server_ciphers` renforcent la sécurité.",
  ],
};
