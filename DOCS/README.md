# Portfolio Professionnel & CMS de Gestion de Contenu

![Version](https://img.shields.io/badge/version-1.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5)
![Express](https://img.shields.io/badge/Node.js-Express-339933)

---

# Présentation

Portfolio Professionnel & CMS est une plateforme web Full-Stack moderne permettant à Bandjim Narbe Narcisse Nasser de présenter son activité, ses projets, ses services, ses publications et son expertise tout en disposant d'un espace d'administration sécurisé permettant de gérer l'ensemble du contenu sans aucune modification du code source.

L'application repose sur une architecture moderne combinant React, TypeScript, Express.js, Firebase et Cloudinary afin d'offrir une solution rapide, évolutive, sécurisée et facilement maintenable.

L'objectif du projet est de proposer une plateforme professionnelle répondant aux besoins de communication, de marketing digital, de publication de contenus et de gestion documentaire, tout en restant suffisamment flexible pour évoluer vers de nouvelles fonctionnalités.

---

# Fonctionnalités principales

## Site public

Le site public permet aux visiteurs de :

- Consulter la page d'accueil
- Découvrir le profil professionnel
- Télécharger le CV
- Lire les articles du blog
- Consulter les publications
- Parcourir le portfolio
- Découvrir les services proposés
- Visualiser les galeries photos
- Lire les actualités
- Effectuer une recherche dans le Blog
- Effectuer une recherche dans le Portfolio
- Télécharger les documents liés aux publications
- Contacter l'administrateur via le formulaire de contact
- Consulter les réseaux sociaux

---

## Interface d'administration (CMS)

L'espace d'administration permet de gérer entièrement la plateforme.

Il est possible de :

- Gérer la page d'accueil
- Modifier la section À propos
- Mettre à jour les services
- Ajouter des projets
- Modifier des projets
- Supprimer des projets
- Ajouter des articles
- Modifier les articles
- Publier ou dépublier un article
- Ajouter des publications
- Joindre des documents
- Ajouter des liens externes
- Gérer les catégories
- Consulter les messages reçus
- Gérer les utilisateurs administrateurs
- Consulter les activités
- Modifier les paramètres généraux
- Configurer Google Analytics
- Gérer le CV
- Gérer la médiathèque
- Importer plusieurs images simultanément
- Importer des vidéos
- Organiser automatiquement les médias dans des dossiers Cloudinary

Toutes les modifications sont synchronisées instantanément avec le site public grâce à Firestore.

---

# Architecture générale

Le projet est composé de plusieurs couches.

## Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Helmet
- Context API

---

## Backend

- Node.js
- Express.js
- API REST
- Webhooks
- Resend API

---

## Base de données

Firebase Firestore

Utilisée pour :

- Articles
- Projets
- Publications
- Paramètres
- Services
- Utilisateurs
- Messages
- Activités
- Catégories

---

## Authentification

Firebase Authentication

Fonctionnalités :

- Connexion administrateur
- Gestion des rôles
- Validation des administrateurs
- Protection des routes privées

---

## Stockage des médias

Cloudinary

Tous les fichiers sont stockés dans le Cloud :

- Images
- Vidéos
- Documents PDF
- CV

Les médias sont automatiquement organisés dans des dossiers portant le nom du projet ou de l'article correspondant.

---

# Technologies utilisées

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Helmet
- Lucide Icons

## Backend

- Express.js
- Node.js

## Base de données

- Firebase Firestore

## Authentification

- Firebase Authentication

## Stockage

- Cloudinary

## Emails

- Resend

## Analytics

- Google Analytics 4

---

# Fonctionnalités techniques

- Architecture Full Stack
- Responsive Design
- SEO optimisé
- Chargement rapide
- Synchronisation temps réel
- Gestion complète des médias
- Compression automatique des images
- Support des vidéos
- Support des documents
- Recherche instantanée
- Gestion des catégories
- Gestion des utilisateurs
- Protection contre le spam
- Honeypot
- Rate Limiting
- Webhooks
- Intégration Cloudinary
- Intégration Firebase
- Google Analytics
- React Helmet
- Sitemap
- Robots.txt

---

# Installation

## Cloner le projet

```bash
git clone https://github.com/votre-compte/portfolio-cms.git
```

## Installer les dépendances

```bash
npm install
```

## Lancer le projet

```bash
npm run dev
```

---

# Construction de production

```bash
npm run build
```

---

# Lancement en production

```bash
npm run start
```

---

# Variables d'environnement

Le projet utilise plusieurs variables d'environnement.

Exemple :

```
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=

VITE_CLOUDINARY_UPLOAD_PRESET=

RESEND_API_KEY=

CONTACT_EMAIL=

SOCIAL_WEBHOOK_SECRET=

VITE_GA_MEASUREMENT_ID=
```

Le détail de chaque variable est expliqué dans :

```
docs/ENVIRONMENT_VARIABLES.md
```

---

# Structure du projet

```
docs/
public/
src/
server.ts
package.json
vite.config.ts
```

Une description complète de l'arborescence est disponible dans :

```
docs/PROJECT_STRUCTURE.md
```

---

# Documentation

Toute la documentation technique est disponible dans le dossier :

```
docs/
```

Elle comprend :

- Présentation du projet
- Architecture système
- Architecture technique
- Documentation API
- Base de données
- Guides utilisateur
- Guide administrateur
- Guide Cloudinary
- Guide Firebase
- Déploiement
- Sécurité
- Maintenance
- Diagrammes UML
- Variables d'environnement

---

# Sécurité

Le projet implémente plusieurs mécanismes de sécurité :

- Firebase Authentication
- Firestore Rules
- Routes protégées
- Validation des données
- Rate Limiting
- Honeypot
- Protection Webhook
- Variables d'environnement
- Gestion des rôles administrateurs

---

# Évolutivité

L'architecture a été conçue afin de faciliter l'ajout de nouvelles fonctionnalités telles que :

- Paiement en ligne
- Marketplace
- E-learning
- Notifications Push
- Chat
- IA générative
- Tableau de bord analytique
- CRM
- ERP
- Multi-langue
- Multi-tenant

sans remettre en cause l'architecture existante.

---

# Auteur

Développé pour Mr:

**BANDJIM NARBE NARCISSE NASSER**

Portfolio Professionnel & CMS

---

# Licence

Ce projet est destiné à un usage professionnel.

Tous droits réservés.