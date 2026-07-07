import type { Chapter } from "../../types";

export const ch21: Chapter = {
  number: 21,
  slug: "serveur-web",
  title: "Projet final : un serveur web multithreadé",
  subtitle: "Assembler ownership, traits, closures et threads pour construire un vrai serveur web depuis zéro.",
  description:
    "C'est le projet de synthèse du Rust Book : un serveur qui écoute des connexions TCP, lit des requêtes HTTP brutes, y répond avec le bon code de statut, et surtout traite plusieurs requêtes en parallèle grâce à un `ThreadPool` construit à la main. Ce chapitre ne se contente pas de faire fonctionner un serveur — il te fait réutiliser dans un seul projet à peu près tout ce que tu as appris depuis le chapitre 1 : structs, traits, closures, `Box<dyn Trait>`, `Arc`, `Mutex`, canaux `mpsc` et `Drop`.",
  minutes: 70,
  rustBookRef: "Chapitre 21 — Final Project: Building a Multithreaded Web Server",
  objectives: [
    "Ouvrir un socket TCP avec TcpListener et accepter des connexions",
    "Lire et analyser la première ligne d'une requête HTTP brute",
    "Construire une réponse HTTP valide (ligne de statut, en-têtes, corps)",
    "Comprendre pourquoi un serveur mono-thread bloque sous charge",
    "Concevoir un ThreadPool avec mpsc, Arc<Mutex> et des closures Box<dyn FnOnce() + Send>",
    "Implémenter un arrêt propre avec Drop et le join des threads",
  ],
  sections: [
    {
      id: "tcp-de-base",
      number: "21.1",
      title: "Les bases de TCP",
      blocks: [
        {
          type: "paragraph",
          text: "Le module `std::net` donne accès aux sockets réseau sans dépendance externe. `TcpListener` écoute un port et accepte des connexions entrantes ; chaque connexion acceptée devient un `TcpStream`, un flux bidirectionnel qu'on peut lire et écrire comme n'importe quel `Read` / `Write`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::net::TcpListener;\n\nfn main() {\n    // Écoute les connexions entrantes sur le port 7878.\n    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();\n\n    for flux in listener.incoming() {\n        let flux = flux.unwrap();\n        println!("Connexion établie !");\n    }\n}',
          caption: "listener.incoming() renvoie un itérateur infini de connexions.",
        },
        {
          type: "paragraph",
          text: "`incoming()` bloque tant qu'aucune connexion n'arrive : c'est un itérateur infini côté serveur. Chaque `flux` obtenu est un `TcpStream` sur lequel on peut appeler `read` pour récupérer les octets envoyés par le client.",
        },
        {
          type: "code",
          language: "rust",
          code: "use std::io::Read;\nuse std::net::TcpStream;\n\nfn lire_requete_brute(flux: &mut TcpStream) -> String {\n    let mut tampon = [0; 1024];\n    flux.read(&mut tampon).unwrap();\n    String::from_utf8_lossy(&tampon[..]).to_string()\n}",
        },
        {
          type: "callout",
          variant: "info",
          text: "`bind` peut échouer (port déjà utilisé, permissions insuffisantes) : en production on gérerait le `Result` proprement plutôt que d'appeler `unwrap()`, comme vu au chapitre 9.",
        },
      ],
    },
    {
      id: "lire-une-requete",
      number: "21.1",
      title: "Lire une requête HTTP",
      blocks: [
        {
          type: "paragraph",
          text: "HTTP est un protocole texte. Une requête ressemble à `\"GET /index.html HTTP/1.1\"` suivie d'en-têtes (une ligne `Clé: Valeur` chacun), puis d'une ligne vide, puis éventuellement d'un corps. La première ligne suffit pour router la requête : elle contient la méthode et le chemin demandé.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::io::{BufRead, BufReader};\nuse std::net::TcpStream;\n\nfn afficher_requete(flux: &TcpStream) {\n    let lecteur = BufReader::new(flux);\n    let lignes: Vec<_> = lecteur\n        .lines()\n        .map(|ligne| ligne.unwrap())\n        .take_while(|ligne| !ligne.is_empty())\n        .collect();\n\n    println!("Requête reçue :");\n    println!("{:#?}", lignes);\n}',
          caption: "BufReader::lines() coupe le flux en lignes, jusqu'à la ligne vide qui sépare en-têtes et corps.",
        },
        {
          type: "paragraph",
          text: "Le réseau n'est pas simple à tester unitairement : il faudrait ouvrir de vrais sockets. La bonne pratique consiste donc à isoler la **logique pure** — analyser une ligne, choisir un code de statut, formater du texte — dans des fonctions qui ne dépendent d'aucun `TcpStream`. C'est ce qu'on va tester dans les exercices.",
        },
        {
          type: "code",
          language: "rust",
          code: 'fn analyser_premiere_ligne(ligne: &str) -> Option<(&str, &str)> {\n    let mut morceaux = ligne.split_whitespace();\n    let methode = morceaux.next()?;\n    let chemin = morceaux.next()?;\n    Some((methode, chemin))\n}\n\nfn main() {\n    let resultat = analyser_premiere_ligne("GET /index.html HTTP/1.1");\n    println!("{:?}", resultat);\n}',
        },
        {
          type: "callout",
          variant: "tip",
          title: "Séparer réseau et logique",
          text: "Cette séparation — I/O d'un côté, fonctions pures de l'autre — est un des réflexes les plus utiles en Rust. Elle permet de tester la logique métier sans jamais toucher à un vrai socket, un vrai fichier ou une vraie base de données.",
        },
      ],
    },
    {
      id: "construire-une-reponse",
      number: "21.1",
      title: "Construire une réponse HTTP",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Le squelette d'une réponse",
        },
        {
          type: "paragraph",
          text: "Une réponse HTTP suit toujours la même forme : une ligne de statut (`HTTP/1.1 200 OK`), des en-têtes optionnels, une ligne vide, puis le corps. Le retour à la ligne HTTP est `\\r\\n` (CRLF), pas seulement `\\n`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::io::{Read, Write};\nuse std::net::TcpStream;\n\nfn analyser_premiere_ligne(ligne: &str) -> Option<(&str, &str)> {\n    let mut morceaux = ligne.split_whitespace();\n    let methode = morceaux.next()?;\n    let chemin = morceaux.next()?;\n    Some((methode, chemin))\n}\n\nfn formater_reponse(code: u16, message: &str, corps: &str) -> String {\n    format!(\n        "HTTP/1.1 {code} {message}\\r\\nContent-Length: {longueur}\\r\\n\\r\\n{corps}",\n        longueur = corps.len()\n    )\n}\n\nfn traiter_flux(flux: &mut TcpStream) {\n    let mut tampon = [0; 1024];\n    flux.read(&mut tampon).unwrap();\n    let requete = String::from_utf8_lossy(&tampon[..]);\n    let premiere_ligne = requete.lines().next().unwrap_or("");\n\n    let (_, chemin) = analyser_premiere_ligne(premiere_ligne).unwrap_or(("GET", "/"));\n    let (code, message, corps) = if chemin == "/" {\n        (200, "OK", "<html><body>Bienvenue !</body></html>")\n    } else {\n        (404, "Not Found", "<html><body>404</body></html>")\n    };\n\n    let reponse = formater_reponse(code, message, corps);\n    flux.write_all(reponse.as_bytes()).unwrap();\n}',
          caption: "On enchaîne : analyser la requête, choisir une réponse, l'écrire sur le flux.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Le `Content-Length` doit correspondre exactement à la taille en octets du corps, pas au nombre de caractères. Pour du texte UTF-8 avec des accents, `len()` sur une `&str` compte déjà des octets — c'est ce qu'il faut.",
        },
      ],
    },
    {
      id: "serveur-mono-thread",
      number: "21.1",
      title: "Serveur mono-thread : les limites",
      blocks: [
        {
          type: "paragraph",
          text: "La version la plus simple traite les connexions une par une, dans la boucle `for flux in listener.incoming()`. Ça fonctionne… tant que chaque requête est rapide.",
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::net::{TcpListener, TcpStream};\n\nfn main() {\n    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();\n\n    for flux in listener.incoming() {\n        let flux = flux.unwrap();\n        gerer_connexion(flux);\n    }\n}\n\nfn gerer_connexion(_flux: TcpStream) {\n    // Traitement potentiellement lent : lecture disque, calcul, accès base de données...\n    // Tant que cette fonction ne rend pas la main, AUCUNE autre connexion\n    // n\'est traitée : le serveur est bloqué.\n}',
        },
        {
          type: "paragraph",
          text: "Si un client demande une ressource lente à générer, tous les autres clients attendent derrière lui — même pour charger une simple page statique. La solution la plus naïve, `thread::spawn` un thread par requête, fonctionnerait mais laisserait un client malveillant ouvrir un nombre illimité de threads et épuiser la mémoire du serveur.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "Un thread par requête sans limite est une porte ouverte à une attaque par épuisement de ressources. La bonne solution est un nombre **fixe** de threads qui se partagent le travail : un pool.",
        },
      ],
    },
    {
      id: "concevoir-un-threadpool",
      number: "21.2",
      title: "Concevoir un ThreadPool",
      blocks: [
        {
          type: "paragraph",
          text: "Un `ThreadPool` démarre un nombre fixe de threads « workers » au lancement. Le thread principal ne fait qu'envoyer des tâches (des closures) dans une file d'attente ; chaque worker boucle en récupérant une tâche dès qu'il est libre et l'exécute.",
        },
        {
          type: "list",
          items: [
            "Un canal `mpsc` pour envoyer des jobs depuis le thread principal vers les workers.",
            "Un `Arc<Mutex<Receiver<Job>>>` partagé : plusieurs workers doivent pouvoir lire dans la même file, en toute sécurité.",
            "Un `Vec<Worker>`, chacun possédant son propre `JoinHandle` de thread.",
            "Un alias `type Job = Box<dyn FnOnce() + Send>` pour stocker n'importe quelle closure à exécuter une seule fois.",
          ],
        },
        {
          type: "code",
          language: "rust",
          code: 'use std::sync::{mpsc, Arc, Mutex};\nuse std::thread;\n\ntype Job = Box<dyn FnOnce() + Send>;\n\nstruct Worker {\n    id: usize,\n    handle: Option<thread::JoinHandle<()>>,\n}\n\nimpl Worker {\n    fn new(id: usize, recepteur: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {\n        let handle = thread::spawn(move || loop {\n            let message = recepteur.lock().unwrap().recv();\n            match message {\n                Ok(job) => job(),\n                Err(_) => break,\n            }\n        });\n\n        Worker { id, handle: Some(handle) }\n    }\n}\n\npub struct ThreadPool {\n    workers: Vec<Worker>,\n    emetteur: Option<mpsc::Sender<Job>>,\n}\n\nimpl ThreadPool {\n    pub fn new(taille: usize) -> ThreadPool {\n        assert!(taille > 0);\n\n        let (emetteur, recepteur) = mpsc::channel();\n        let recepteur = Arc::new(Mutex::new(recepteur));\n\n        let mut workers = Vec::with_capacity(taille);\n        for id in 0..taille {\n            workers.push(Worker::new(id, Arc::clone(&recepteur)));\n        }\n\n        ThreadPool { workers, emetteur: Some(emetteur) }\n    }\n\n    pub fn executer<F>(&self, f: F)\n    where\n        F: FnOnce() + Send + \'static,\n    {\n        let job = Box::new(f);\n        self.emetteur.as_ref().unwrap().send(job).unwrap();\n    }\n}',
          caption: "Le récepteur est partagé (Arc) et protégé (Mutex) : un seul worker à la fois peut en extraire un job.",
        },
        {
          type: "usecase",
          title: "Ce qui se passe sous un framework web",
          text: "Quand un framework comme Actix-web ou Axum traite une requête, il fait fondamentalement la même chose que ce que tu viens de construire : un pool de workers (souvent des tâches asynchrones plutôt que des threads OS), une file d'attente de travaux, et une fonction qui associe un chemin à un gestionnaire. Comprendre ce mécanisme démystifie ce qui se cache derrière n'importe quel framework web : ce ne sont pas des boîtes magiques, mais des `ThreadPool` avec plus de fonctionnalités.",
        },
      ],
    },
    {
      id: "arret-propre",
      number: "21.3",
      title: "Arrêt propre du pool",
      blocks: [
        {
          type: "paragraph",
          text: "Un `ThreadPool` qu'on abandonne brutalement laisse des threads bloqués indéfiniment sur `recv()`. Pour un arrêt propre, on implémente `Drop` : on ferme d'abord le canal d'émission, ce qui fait échouer les `recv()` en attente, puis on attend chaque thread avec `join`.",
        },
        {
          type: "code",
          language: "rust",
          code: 'impl Drop for ThreadPool {\n    fn drop(&mut self) {\n        // On ferme le canal : les workers en attente sur `recv()` reçoivent\n        // une erreur et sortent de leur boucle.\n        drop(self.emetteur.take());\n\n        for worker in &mut self.workers {\n            println!("Arrêt du worker {}", worker.id);\n\n            if let Some(handle) = worker.handle.take() {\n                handle.join().unwrap();\n            }\n        }\n    }\n}',
        },
        {
          type: "paragraph",
          text: "Les champs `emetteur: Option<Sender<Job>>` et `handle: Option<JoinHandle<()>>` existent justement pour permettre `take()` : on ne peut pas déplacer hors d'un champ de struct derrière une référence mutable, mais on peut en extraire l'`Option` et laisser `None` à la place. C'est le même schéma que celui vu au chapitre 15 avec les smart pointers.",
        },
        {
          type: "callout",
          variant: "tip",
          text: "Ce chapitre boucle la boucle : ownership et emprunt (ch. 4), traits et closures (ch. 10, 13), gestion d'erreurs (ch. 9), smart pointers (ch. 15) et concurrence (ch. 16) se retrouvent tous dans un seul petit programme.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "ch21-ex1",
      title: "Analyser la première ligne d'une requête",
      difficulty: "facile",
      prompt:
        "Écris une fonction `analyser_ligne` qui reçoit la première ligne d'une requête HTTP, comme `\"GET /index.html HTTP/1.1\"`, et renvoie `Some((methode, chemin))` sous forme de `String`, ou `None` si la ligne ne contient pas au moins deux mots.",
      hints: [
        "`split_whitespace()` découpe une chaîne sur les espaces et ignore les espaces multiples.",
        "L'opérateur `?` sur une `Option` court-circuite en renvoyant `None` immédiatement.",
      ],
      starter: "fn analyser_ligne(ligne: &str) -> Option<(String, String)> {\n    todo!()\n}",
      solution:
        "fn analyser_ligne(ligne: &str) -> Option<(String, String)> {\n    let mut morceaux = ligne.split_whitespace();\n    let methode = morceaux.next()?;\n    let chemin = morceaux.next()?;\n    Some((methode.to_string(), chemin.to_string()))\n}",
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn analyse_une_requete_get() {\n        assert_eq!(\n            analyser_ligne("GET /index.html HTTP/1.1"),\n            Some(("GET".to_string(), "/index.html".to_string()))\n        );\n    }\n\n    #[test]\n    fn analyse_une_requete_post() {\n        assert_eq!(\n            analyser_ligne("POST /api/utilisateurs HTTP/1.1"),\n            Some(("POST".to_string(), "/api/utilisateurs".to_string()))\n        );\n    }\n\n    #[test]\n    fn renvoie_none_si_ligne_vide() {\n        assert_eq!(analyser_ligne(""), None);\n    }\n}',
    },
    {
      id: "ch21-ex2",
      title: "Router un chemin vers un code de statut",
      difficulty: "facile",
      prompt:
        "Écris une fonction `router` qui reçoit un chemin (`&str`) et renvoie un code de statut HTTP : `200` pour `\"/\"` ou `\"/accueil\"`, `404` pour n'importe quel autre chemin.",
      hints: ['Un `match` avec le motif `"/" | "/accueil"` teste plusieurs valeurs en une seule branche.'],
      starter: "fn router(chemin: &str) -> u16 {\n    todo!()\n}",
      solution:
        'fn router(chemin: &str) -> u16 {\n    match chemin {\n        "/" | "/accueil" => 200,\n        _ => 404,\n    }\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn racine_renvoie_200() {\n        assert_eq!(router("/"), 200);\n    }\n\n    #[test]\n    fn accueil_renvoie_200() {\n        assert_eq!(router("/accueil"), 200);\n    }\n\n    #[test]\n    fn chemin_inconnu_renvoie_404() {\n        assert_eq!(router("/inexistant"), 404);\n        assert_eq!(router("/api/x"), 404);\n    }\n}',
    },
    {
      id: "ch21-ex3",
      title: "Formater une réponse HTTP",
      difficulty: "moyen",
      prompt:
        "Écris une fonction `construire_reponse` qui reçoit un code de statut (`u16`) et un corps (`&str`), et renvoie la réponse HTTP complète sous forme de `String` : ligne de statut, en-tête `Content-Length`, ligne vide, puis le corps. Le message associé au code est `\"OK\"` pour `200`, `\"Not Found\"` pour `404`, et `\"Unknown\"` pour tout autre code.",
      hints: [
        'Le format général est `"HTTP/1.1 {code} {message}\\r\\nContent-Length: {n}\\r\\n\\r\\n{corps}"`.',
        "`corps.len()` donne la longueur en octets à mettre dans `Content-Length`.",
      ],
      starter: "fn construire_reponse(code: u16, corps: &str) -> String {\n    todo!()\n}",
      solution:
        'fn construire_reponse(code: u16, corps: &str) -> String {\n    let message = match code {\n        200 => "OK",\n        404 => "Not Found",\n        _ => "Unknown",\n    };\n\n    format!(\n        "HTTP/1.1 {code} {message}\\r\\nContent-Length: {longueur}\\r\\n\\r\\n{corps}",\n        longueur = corps.len()\n    )\n}',
      tests:
        '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn reponse_200_bien_formee() {\n        let reponse = construire_reponse(200, "salut");\n        assert_eq!(\n            reponse,\n            "HTTP/1.1 200 OK\\r\\nContent-Length: 5\\r\\n\\r\\nsalut"\n        );\n    }\n\n    #[test]\n    fn reponse_404_bien_formee() {\n        let reponse = construire_reponse(404, "");\n        assert_eq!(reponse, "HTTP/1.1 404 Not Found\\r\\nContent-Length: 0\\r\\n\\r\\n");\n    }\n\n    #[test]\n    fn code_inconnu_utilise_le_message_generique() {\n        let reponse = construire_reponse(500, "erreur");\n        assert!(reponse.starts_with("HTTP/1.1 500 Unknown"));\n    }\n}',
    },
  ],
  project: {
    id: "ch21-projet",
    title: "Le cœur du serveur : router et répondre",
    difficulty: "difficile",
    prompt:
      "Implémente la fonction `traiter_requete(ligne: &str) -> String` qui prend la première ligne d'une requête HTTP (par exemple `\"GET / HTTP/1.1\"`) et renvoie une réponse HTTP **complète** : un `200 OK` avec un petit corps si le chemin est `\"/\"`, un `404 Not Found` sinon. Complète aussi le squelette du `ThreadPool` fourni (`Worker`, `ThreadPool`, `Drop`) : il doit compiler et permettre d'exécuter des closures sur des threads d'arrière-plan, même si les tests ci-dessous ne portent que sur `traiter_requete`.",
    hints: [
      "Réutilise les idées des exercices précédents : `analyser_ligne` (parsing), `router` (routage) et `construire_reponse` (formatage) — `traiter_requete` les enchaîne toutes les trois.",
      "Le canal `mpsc` distribue les jobs ; `Arc<Mutex<Receiver<Job>>>` permet à plusieurs workers de partager le même récepteur en toute sécurité.",
      "Pour un arrêt propre : `emetteur: Option<Sender<Job>>` permet de faire `self.emetteur.take()` puis de laisser tomber (`drop`) l'émetteur — les workers bloqués sur `recv()` reçoivent alors une erreur et sortent de leur boucle.",
    ],
    starter:
      'use std::sync::{mpsc, Arc, Mutex};\nuse std::thread;\n\ntype Job = Box<dyn FnOnce() + Send>;\n\nstruct Worker {\n    id: usize,\n    handle: Option<thread::JoinHandle<()>>,\n}\n\nimpl Worker {\n    fn new(id: usize, recepteur: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {\n        todo!()\n    }\n}\n\npub struct ThreadPool {\n    workers: Vec<Worker>,\n    emetteur: Option<mpsc::Sender<Job>>,\n}\n\nimpl ThreadPool {\n    pub fn new(taille: usize) -> ThreadPool {\n        todo!()\n    }\n\n    pub fn executer<F>(&self, f: F)\n    where\n        F: FnOnce() + Send + \'static,\n    {\n        todo!()\n    }\n}\n\nimpl Drop for ThreadPool {\n    fn drop(&mut self) {\n        todo!()\n    }\n}\n\n/// Traite la première ligne d\'une requête HTTP et renvoie la réponse HTTP\n/// complète correspondante (200 pour "/", 404 pour tout autre chemin).\nfn traiter_requete(ligne: &str) -> String {\n    todo!()\n}',
    solution:
      'use std::sync::{mpsc, Arc, Mutex};\nuse std::thread;\n\ntype Job = Box<dyn FnOnce() + Send>;\n\nstruct Worker {\n    id: usize,\n    handle: Option<thread::JoinHandle<()>>,\n}\n\nimpl Worker {\n    fn new(id: usize, recepteur: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {\n        let handle = thread::spawn(move || loop {\n            let message = recepteur.lock().unwrap().recv();\n            match message {\n                Ok(job) => job(),\n                Err(_) => break,\n            }\n        });\n\n        Worker { id, handle: Some(handle) }\n    }\n}\n\npub struct ThreadPool {\n    workers: Vec<Worker>,\n    emetteur: Option<mpsc::Sender<Job>>,\n}\n\nimpl ThreadPool {\n    pub fn new(taille: usize) -> ThreadPool {\n        assert!(taille > 0);\n\n        let (emetteur, recepteur) = mpsc::channel();\n        let recepteur = Arc::new(Mutex::new(recepteur));\n\n        let mut workers = Vec::with_capacity(taille);\n        for id in 0..taille {\n            workers.push(Worker::new(id, Arc::clone(&recepteur)));\n        }\n\n        ThreadPool { workers, emetteur: Some(emetteur) }\n    }\n\n    pub fn executer<F>(&self, f: F)\n    where\n        F: FnOnce() + Send + \'static,\n    {\n        let job = Box::new(f);\n        self.emetteur.as_ref().unwrap().send(job).unwrap();\n    }\n}\n\nimpl Drop for ThreadPool {\n    fn drop(&mut self) {\n        drop(self.emetteur.take());\n\n        for worker in &mut self.workers {\n            if let Some(handle) = worker.handle.take() {\n                handle.join().unwrap();\n            }\n        }\n    }\n}\n\n/// Analyse une ligne de requête HTTP en (méthode, chemin).\nfn analyser_ligne_requete(ligne: &str) -> Option<(&str, &str)> {\n    let mut morceaux = ligne.split_whitespace();\n    let methode = morceaux.next()?;\n    let chemin = morceaux.next()?;\n    Some((methode, chemin))\n}\n\n/// Traite la première ligne d\'une requête HTTP et renvoie la réponse HTTP\n/// complète correspondante (200 pour "/", 404 pour tout autre chemin).\nfn traiter_requete(ligne: &str) -> String {\n    let chemin = analyser_ligne_requete(ligne).map(|(_, chemin)| chemin).unwrap_or("/");\n\n    let (code, message, corps) = if chemin == "/" {\n        (200, "OK", "Bienvenue sur le serveur Rust !")\n    } else {\n        (404, "Not Found", "Page introuvable")\n    };\n\n    format!(\n        "HTTP/1.1 {code} {message}\\r\\nContent-Length: {longueur}\\r\\n\\r\\n{corps}",\n        longueur = corps.len()\n    )\n}',
    tests:
      '#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn racine_repond_200() {\n        let reponse = traiter_requete("GET / HTTP/1.1");\n        assert!(reponse.starts_with("HTTP/1.1 200 OK"));\n        assert!(reponse.contains("Bienvenue sur le serveur Rust !"));\n    }\n\n    #[test]\n    fn chemin_inconnu_repond_404() {\n        let reponse = traiter_requete("GET /toto HTTP/1.1");\n        assert!(reponse.starts_with("HTTP/1.1 404 Not Found"));\n        assert!(reponse.contains("Page introuvable"));\n    }\n\n    #[test]\n    fn reponse_contient_un_content_length_correct() {\n        let reponse = traiter_requete("GET / HTTP/1.1");\n        let longueur_attendue = "Bienvenue sur le serveur Rust !".len();\n        assert!(reponse.contains(&format!("Content-Length: {longueur_attendue}")));\n    }\n\n    #[test]\n    fn threadpool_se_construit_et_execute_une_tache() {\n        let pool = ThreadPool::new(2);\n        let (tx, rx) = mpsc::channel();\n\n        pool.executer(move || {\n            tx.send(42).unwrap();\n        });\n\n        let valeur = rx.recv_timeout(std::time::Duration::from_secs(1)).unwrap();\n        assert_eq!(valeur, 42);\n    }\n}',
  },
  keyTakeaways: [
    "TcpListener::bind ouvre un socket ; chaque connexion acceptée donne un TcpStream pour lire et écrire.",
    "Une requête HTTP est du texte : sa première ligne contient la méthode et le chemin, séparés par des espaces.",
    "Une réponse HTTP suit toujours le même squelette : ligne de statut, en-têtes, ligne vide, corps (séparateurs \\r\\n).",
    "Isoler le parsing et le formatage dans des fonctions pures les rend testables sans ouvrir le moindre socket.",
    "Un ThreadPool combine mpsc, Arc<Mutex<_>> et Box<dyn FnOnce() + Send> pour distribuer du travail sur un nombre fixe de threads.",
    "Drop permet un arrêt propre : fermer le canal débloque les workers, puis on join chaque thread.",
  ],
};
