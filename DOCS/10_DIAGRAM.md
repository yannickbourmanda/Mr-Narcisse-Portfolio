# DOCUMENTATION DES DIAGRAMMES
## Portfolio & Blog CMS
### Documentation UML & ERD
**Version : 1.0**  
**Langue : Français**

---

# 1. Introduction

Ce document présente l'ensemble des diagrammes utilisés pour concevoir et documenter l'architecture logicielle du projet **Portfolio & Blog CMS**.

Les diagrammes respectent les bonnes pratiques du génie logiciel et permettent de comprendre rapidement le fonctionnement général de la plateforme.

Le système est composé de deux grandes parties :

- Site Web (Client)
- CMS (Administration)

Les données sont stockées dans Firebase Firestore tandis que les fichiers multimédias (images, vidéos, documents et CV) sont hébergés sur Cloudinary.

---

# 2. Diagrammes UML

Les diagrammes UML décrivent le comportement, les interactions et l'architecture de l'application.

Les diagrammes produits sont les suivants :

## 2.1 Diagramme de Cas d'Utilisation (Use Case)

Objectif :

Présenter les fonctionnalités disponibles pour :

- Administrateur
- Visiteur

Fonctionnalités principales :

### Visiteur

- Consulter le portfolio
- Lire les articles
- Rechercher un article
- Rechercher un projet
- Consulter les publications
- Télécharger un document
- Télécharger le CV
- Envoyer un message
- Consulter les services

### Administrateur

- Connexion
- Gestion des utilisateurs
- Gestion des articles
- Gestion du portfolio
- Gestion des publications
- Gestion des médias
- Upload Images
- Upload Vidéos
- Upload Documents
- Upload CV
- Gestion des catégories
- Paramètres du site
- Tableau de bord

---

## 2.2 Diagramme de Classes

Décrit les principales classes métier.

Principales entités :

- User
- Article
- Project
- Publication
- Service
- Category
- Media
- Message
- Activity
- Settings

Chaque classe possède :

- attributs
- méthodes
- relations

---

## 2.3 Diagramme de Séquence

Décrit les interactions entre :

Utilisateur

↓

Frontend React

↓

Firebase

↓

Cloudinary

↓

Firestore

Les séquences documentées sont :

- Authentification
- Création d'un article
- Upload d'images
- Création d'un projet
- Suppression d'un média
- Envoi d'un message

---

## 2.4 Diagramme d'Activité

Décrit le workflow des opérations.

Exemple :

Connexion

↓

Validation

↓

Dashboard

↓

Création Article

↓

Upload Médias

↓

Enregistrement Firestore

↓

Publication

---

## 2.5 Diagramme de Composants

Architecture logicielle.

Frontend

- React
- Vite
- Tailwind

↓

Backend

- Firebase Authentication
- Firestore

↓

Cloudinary

↓

Utilisateur

---

## 2.6 Diagramme de Déploiement

Décrit les serveurs utilisés.

Navigateur

↓

React Application

↓

Firebase Authentication

↓

Firestore Database

↓

Cloudinary CDN

---

# 3. Diagramme ERD

Le diagramme Entity Relationship représente la structure logique de la base de données.

Toutes les collections Firestore utilisées sont représentées.

Collections principales :

## Users

Informations des administrateurs.

---

## Articles

Articles du blog.

Relations :

- 1 catégorie
- plusieurs médias

---

## Projects

Projets du portfolio.

Relations :

- plusieurs images
- plusieurs vidéos

---

## Publications

Publications scientifiques.

Peuvent contenir :

- document
- lien externe

---

## Services

Services proposés.

---

## Categories

Catégories communes :

- Blog
- Portfolio

---

## Media

Stockage logique des médias.

Les fichiers physiques sont hébergés sur Cloudinary.

Contient :

- URL
- dossier
- type
- taille
- format
- date

---

## Messages

Messages provenant du formulaire Contact.

---

## Activities

Historique des actions administrateur.

---

## Settings

Configuration globale du site.

---

# 4. Relations principales

Un utilisateur :

→ publie plusieurs articles

Un utilisateur :

→ crée plusieurs projets

Une catégorie :

→ possède plusieurs articles

Une catégorie :

→ possède plusieurs projets

Un article :

→ possède plusieurs médias

Un projet :

→ possède plusieurs médias

Une publication :

→ peut contenir un document

Une publication :

→ peut contenir un lien externe

---

# 5. Architecture générale

```
Client Web
      │
      ▼
React + Vite
      │
      ▼
Firebase Authentication
      │
      ▼
Firestore
      │
      ▼
Cloudinary
```

---

# 6. Gestion des médias

Les médias sont organisés automatiquement.

Création d'un article :

```
Articles
└── Nom de l'article
      ├── cover.webp
      ├── image1.webp
      ├── image2.webp
      ├── image3.webp
```

Création d'un projet :

```
Projects
└── Nom du projet
      ├── cover.webp
      ├── image1.webp
      ├── image2.webp
      ├── video.mp4
```

Publication :

```
Publications
└── Nom publication
      ├── document.pdf
```

CV :

```
Documents
└── CV
      ├── CV.pdf
```

---

# 7. Flux des données

Upload

↓

Cloudinary

↓

URL retournée

↓

Firestore

↓

Lecture

↓

Client

Aucun média n'est stocké directement dans Firestore.

---

# 8. Technologies utilisées

Frontend

- React
- TypeScript
- Vite
- TailwindCSS

Backend

- Firebase Authentication
- Firebase Firestore

Stockage

- Cloudinary

Déploiement

- Node.js
- Express

---

# 9. Convention des diagrammes

Les diagrammes UML suivent la norme UML 2.x.

Le diagramme ERD suit la notation Crow's Foot.

Toutes les relations indiquent :

- Cardinalité
- Clé primaire
- Clé étrangère
- Multiplicité

---

# 10. Conclusion

Ces diagrammes constituent la documentation technique officielle du projet.

Ils permettent :

- comprendre rapidement l'architecture ;
- faciliter la maintenance ;
- accélérer le développement ;
- intégrer de nouveaux développeurs ;
- préparer les futures évolutions de la plateforme.

---

# Annexes

Le dossier `docs/diagrams/` contient les illustrations suivantes :

- UML.png
- ERD.png

Ce document constitue le point d'entrée principal de la documentation des diagrammes de l'application.