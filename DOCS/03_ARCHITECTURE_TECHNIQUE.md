# 03 Architecture Technique

# Portfolio Professionnel & CMS de Gestion

    Version 2.0

1. Présentation générale

L'application est une plateforme web Full Stack permettant la gestion d'un portfolio professionnel, d'un blog, d'une médiathèque centralisée, d'un système de publications ainsi qu'un panneau d'administration complet.

Le projet a été développé afin de permettre à un administrateur de gérer l'intégralité du contenu du site sans aucune connaissance en programmation.

L'application repose sur une architecture moderne basée sur React, Node.js, Firebase et Cloudinary.

2. Architecture générale

L'application suit une architecture Client – Serveur.

Utilisateur
      │
      │ HTTPS
      ▼
Frontend React
      │
      ├────────► Firebase Authentication
      │
      ├────────► Firestore Database
      │
      ├────────► Cloudinary
      │
      ▼
Node.js + Express API
      │
      ├────────► Resend
      │
      └────────► Webhooks

L'ensemble des composants communiquent via HTTPS.

3. Architecture Frontend

Le frontend est développé avec :

React 18
TypeScript
Vite
Tailwind CSS
React Router DOM

Le frontend est responsable de :

l'affichage du site public
l'espace administrateur
les appels API
la connexion Firebase
l'upload vers Cloudinary
la gestion des formulaires
Organisation
src/

components/
pages/
hooks/
services/
config/
assets/
Pages publiques

Le site contient :

Accueil
A propos
Services
Portfolio
Blog
Contact

Chaque page possède :

SEO dynamique
Responsive Design
Optimisation mobile
Tableau de bord

Le CMS possède plusieurs modules.

            Dashboard

                ↓

            Website Content

                ↓

            Portfolio

                ↓

            Blog

                ↓

            Services

                ↓

            Publications

                ↓

            Media Library

                ↓

            Messages

                ↓

            Users

                ↓

            Settings

                ↓

            Activities

4. Architecture Backend

Le backend repose sur Express.

Le serveur possède plusieurs responsabilités :

Servir le frontend React
Exposer les API REST
Envoyer les emails
Recevoir les Webhooks
Contrôler certaines opérations administratives

Le point d'entrée est :

server.ts
API disponibles
Contact
POST /api/contact

Envoie un email via Resend.

Health Check
GET /api/health

Permet de vérifier que le serveur fonctionne.

Social Webhook
POST /api/webhooks/social

Permet de publier automatiquement un article depuis :

LinkedIn
Facebook
Make
Zapier
5. Base de données

Le projet utilise :

Firebase Firestore

Architecture NoSQL.

Les principales collections sont :

users

articles

projects

services

publications

activities

messages

settings

media

Toutes les données sont synchronisées en temps réel.

6. Authentification

Firebase Authentication est utilisé.

Méthode :

Email / Password

Le système gère automatiquement :

création du premier administrateur
comptes en attente
validation
suppression
révocation
Rôles
admin

pending_admin
7. Gestion des médias

L'ancienne architecture stockait les images directement dans Firestore.

Cette approche a été abandonnée.

Le projet utilise désormais Cloudinary.

Avantages

Aucune limite Firestore.

Images optimisées.

CDN mondial.

Upload multiple.

Support :

JPG
PNG
WEBP
GIF
MP4
WEBM
PDF
DOCX
Organisation automatique

Lorsqu'un article est créé :

Articles

└── Nom de l'article

        image1

        image2

        image3

Lorsqu'un projet est créé

Portfolio

└── Nom du projet

        cover.webp

        image2.webp

        image3.webp

Les dossiers sont créés automatiquement.

8. Recherche intelligente

Le Portfolio possède une recherche.

Critères :

titre
catégorie
client
technologies

Le Blog possède également une recherche.

Critères :

titre
contenu
auteur
catégorie
mots-clés

La recherche est instantanée.

9. Optimisation SEO

Le référencement est assuré grâce à :

React Helmet Async

Chaque page possède :

title
description
keywords
Open Graph
Twitter Cards

Le projet possède également :

robots.txt

sitemap.xml

Google Analytics 4

10. Gestion des activités

Chaque modification importante est enregistrée.

Exemple :

Nouvel article

Suppression d'un projet

Modification du CV

Ajout d'une image

Suppression d'un utilisateur

Ces informations sont visibles depuis :

Activities

11. Synchronisation temps réel

Toutes les modifications réalisées depuis le CMS apparaissent immédiatement sur le site.

Aucun redémarrage.

Aucun rebuild.

Grâce aux snapshots Firestore.

12. Sécurité

Le projet implémente plusieurs mécanismes.

Authentification

Firebase Authentication

Base de données

Firestore Rules

Protection du formulaire

Honeypot

Validation temporelle

Rate Limiting

Upload

Validation du type

Validation de la taille

Compression automatique

Webhooks

Protection via

SOCIAL_WEBHOOK_SECRET

13. Variables d'environnement

Le projet nécessite :

VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_MESSAGING_SENDER_ID

VITE_FIREBASE_APP_ID

VITE_CLOUDINARY_CLOUD_NAME

VITE_CLOUDINARY_UPLOAD_PRESET

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

RESEND_API_KEY

CONTACT_EMAIL

SOCIAL_WEBHOOK_SECRET

VITE_GA_MEASUREMENT_ID

14. Déploiement

L'application est compatible avec :

Firebase Hosting

Vercel

Netlify

Cloud Run

Render

Railway

Docker

Le backend Express écoute :

0.0.0.0

PORT

pour assurer la compatibilité Cloud Native.

15. Performances

Le projet est optimisé grâce à :

Vite
Lazy Loading
Compression des images
CDN Cloudinary
React Memo
Code Splitting
Firestore en temps réel
Assets minifiés

16. Évolutivité

L'architecture modulaire permet d'ajouter facilement :

un LMS
une boutique e-commerce
un système de paiement
une plateforme de formation
un espace client
une API mobile Flutter
un chatbot IA

sans modifier l'architecture existante.