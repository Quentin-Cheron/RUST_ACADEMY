# Docker local pour les exercices

## Prerequis

1. **Installer Docker Desktop** : https://docs.docker.com/desktop/install/windows-install/
2. Pendant l'installation, accepter l'activation de **WSL 2** si demande
3. **Lancer Docker Desktop** (il doit tourner en arriere-plan)

Verifier que Docker fonctionne :

```bash
docker version
```

## Configuration

Dans le fichier `.env` a la racine du projet, ajouter :

```env
# Exercices Rust compiles localement via Docker (au lieu du Rust Playground distant)
DOCKER_RUNNER=true

# Terminal Docker interactif dans les chapitres Docker
DOCKER_TERMINAL=true
```

C'est tout. Pas besoin de configurer `DOCKER_HOST` : l'app se connecte automatiquement via le named pipe Windows.

## Ce qui se passe au premier lancement

Au premier exercice Rust execute, l'app :

1. Detecte Docker via le named pipe (`//./pipe/docker_engine`)
2. Pull l'image `rust:slim` (~300 Mo) si elle n'existe pas
3. Cree un conteneur ephemere, injecte le code, compile avec `rustc --edition 2021 --test`, execute les tests
4. Retourne stdout/stderr, supprime le conteneur

Pour pre-telecharger l'image (evite l'attente au premier run) :

```bash
docker pull rust:slim
```

## Fallback automatique

Si Docker est eteint ou inaccessible, l'app bascule automatiquement sur le **Rust Playground** distant. Aucune action necessaire.

## Securite des conteneurs

Chaque execution cree un conteneur isole :

- Pas de reseau (`--network none`)
- 256 Mo de RAM max
- 1 CPU max
- Supprime automatiquement apres execution
- Timeout de 30 secondes

## Commandes utiles

```bash
# Verifier que Docker tourne
docker version

# Pre-telecharger les images
docker pull rust:slim      # exercices Rust
docker pull docker:cli     # terminal Docker interactif

# Voir les conteneurs en cours
docker ps

# Nettoyer les conteneurs orphelins
docker container prune -f

# Lancer le serveur de dev
pnpm dev
```
