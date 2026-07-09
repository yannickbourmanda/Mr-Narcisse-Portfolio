# 02 - Architecture Système

# Architecture Générale de la Plateforme

      Version : 1.0

---

# 1. Introduction

L'architecture du **Portfolio Professionnel & CMS** repose sur une approche Full-Stack moderne combinant plusieurs technologies complémentaires afin de fournir une plateforme performante, évolutive, sécurisée et facilement maintenable.

Le système est conçu selon une architecture en couches (Layered Architecture) permettant de séparer clairement la présentation, la logique métier, le stockage des données et la gestion des fichiers multimédias.

Cette séparation réduit le couplage entre les différents composants de l'application, facilite les évolutions futures et améliore considérablement la maintenabilité du projet.

L'ensemble de l'application est déployable sur une infrastructure Cloud tout en restant compatible avec un environnement de développement local.

---

# 2. Vue d'ensemble de l'architecture

La plateforme est composée de cinq couches principales :

• Interface utilisateur (Frontend)

↓

• Serveur d'application (Backend)

↓

• Services Firebase

↓

• Cloudinary

↓

• Services tiers

Chaque couche possède une responsabilité bien définie et communique avec les autres à travers des interfaces contrôlées.

---

# 3. Architecture logique

Le système peut être découpé en plusieurs modules fonctionnels.

```

```
                Utilisateur
                     │
                     ▼
            Interface React
                     │
                     ▼
          React Router + Context
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
   Firebase SDK             API Express
         │                        │
         ▼                        ▼
 Firestore Database         Resend API
         │
         ▼
   Cloudinary Media
```

---

# 4. Couche Présentation (Frontend)

Le Frontend constitue la partie visible de l'application.

Il est développé avec :

- React 18
- TypeScript
- Vite
- TailwindCSS

Cette couche est responsable de :

- l'affichage des pages ;
- la navigation ;
- les animations ;
- les formulaires ;
- les appels vers Firebase ;
- les appels vers Express ;
- la validation des données.

Le Frontend est entièrement responsive et s'adapte automatiquement aux ordinateurs, tablettes et smartphones.

---

# 5. React

React constitue le cœur de l'interface utilisateur.

L'application adopte une architecture par composants.

Chaque élément graphique est développé sous forme de composant réutilisable.

Exemples :

- Navbar
- Footer
- Hero
- Cards
- Gallery
- Blog Cards
- Project Cards
- Contact Form
- Search Bar
- Dashboard Widgets

Cette approche réduit fortement la duplication de code.

---

# 6. React Router

La navigation est assurée par React Router DOM.

Les principales routes sont :

```

/

about

services

portfolio

portfolio/:id

blog

blog/:id

publications

publication/:id

contact

admin

admin/setup

```

Le routage côté client permet une navigation fluide sans rechargement complet de la page.

---

# 7. Context API

Le Context API est utilisé pour partager les informations globales.

Par exemple :

- utilisateur connecté ;
- authentification ;
- paramètres globaux ;
- préférences.

Cette approche évite les échanges complexes entre composants.

---

# 8. Couche Backend

Le Backend est développé avec :

- Node.js
- Express.js

Le serveur joue plusieurs rôles essentiels.

Il :

- expose les API ;
- reçoit les formulaires ;
- envoie les emails ;
- gère les Webhooks ;
- sert l'application React en production.

Le point d'entrée est :

```

server.ts

```

---

# 9. API REST

Le serveur expose plusieurs routes.

## Vérification

```

GET /api/health

```

Permet de vérifier que le serveur fonctionne correctement.

---

## Contact

```

POST /api/contact

```

Reçoit les messages envoyés depuis le formulaire de contact.

Le serveur :

- valide les données ;
- protège contre le spam ;
- envoie un email ;
- enregistre le message.

---

## Social Webhook

```

POST /api/webhooks/social

```

Cette API permet aux plateformes externes comme :

- Zapier
- Make
- IFTTT

de publier automatiquement des contenus dans le Blog.

---

# 10. Firebase

Firebase fournit plusieurs services.

## Firestore

Stockage :

- Articles
- Projets
- Utilisateurs
- Services
- Publications
- Paramètres
- Messages
- Activités

Firestore fonctionne en temps réel.

Les modifications sont immédiatement visibles sur le site.

---

## Authentication

Firebase Authentication gère :

- connexion ;
- déconnexion ;
- création de compte ;
- validation des administrateurs.

Les mots de passe ne transitent jamais dans l'application.

Ils sont entièrement gérés par Firebase.

---

# 11. Cloudinary

Cloudinary est utilisé pour le stockage des médias.

Il remplace totalement l'ancien système Base64.

Cloudinary stocke :

- Images
- Vidéos
- Documents
- CV

Chaque média possède :

- une URL permanente ;
- un identifiant unique ;
- un dossier ;
- des métadonnées.

---

# 12. Organisation des médias

Les fichiers sont automatiquement classés.

Exemple :

```

Media/

Articles/

Signature partenariat/

image1.webp

image2.webp

Projet IA/

cover.webp

gallery1.webp

gallery2.webp

Documents/

CV/

cv.pdf

Publications/

Guide IA.pdf

```

Cette organisation facilite :

- la recherche ;
- la maintenance ;
- les suppressions ;
- les sauvegardes.

---

# 13. Flux de données

## Consultation d'un article

Le visiteur ouvre le Blog.

↓

React interroge Firestore.

↓

Firestore renvoie les données.

↓

React affiche les informations.

↓

Les images sont récupérées depuis Cloudinary.

---

## Création d'un projet

L'administrateur complète le formulaire.

↓

Les images sont envoyées vers Cloudinary.

↓

Cloudinary retourne les URLs.

↓

Les URLs sont enregistrées dans Firestore.

↓

Le projet devient immédiatement visible.

---

## Envoi d'un message

Utilisateur

↓

Formulaire

↓

Validation

↓

API Express

↓

Resend

↓

Email

↓

Firestore

↓

Dashboard

---

# 14. Architecture de sécurité

Plusieurs niveaux de sécurité sont présents.

## Authentification

Firebase Authentication.

---

## Autorisation

Gestion des rôles.

- admin
- pending_admin

---

## Firestore Rules

Protection complète des écritures.

Le public ne peut pas modifier les données.

---

## Variables d'environnement

Toutes les clés API sont stockées dans :

```

.env

```

Elles ne sont jamais publiées dans GitHub.

---

## Anti Spam

Le formulaire de contact utilise :

- Honeypot
- Validation temporelle
- Rate Limiting

---

## Protection Webhook

Chaque Webhook peut être protégé grâce à :

```

SOCIAL_WEBHOOK_SECRET

```

---

# 15. Synchronisation

Grâce à Firestore :

- chaque modification est instantanée ;

- aucun rafraîchissement manuel n'est nécessaire ;

- le Dashboard reste constamment synchronisé.

---

# 16. Performances

L'application utilise plusieurs optimisations.

## Vite

Compilation rapide.

---

## Lazy Loading

Chargement uniquement des ressources nécessaires.

---

## Cloudinary CDN

Les images sont distribuées mondialement.

---

## Compression

Les médias sont automatiquement optimisés.

---

## React

Réutilisation des composants.

Réduction du DOM.

---

# 17. SEO

L'application est optimisée pour les moteurs de recherche.

Elle utilise :

- React Helmet

- robots.txt

- sitemap.xml

- URLs propres

- titres dynamiques

- descriptions dynamiques

- Open Graph

- Google Analytics

---

# 18. Disponibilité

Le système repose sur plusieurs services Cloud.

Firebase :

- haute disponibilité ;

- sauvegardes automatiques ;

- réplication.

Cloudinary :

- CDN mondial ;

- optimisation ;

- cache.

---

# 19. Évolutivité

L'architecture permet l'ajout futur de nouveaux modules.

Par exemple :

- Marketplace

- LMS

- CRM

- Paiement

- IA Générative

- Chat

- Notifications

- Mobile App

- API Publique

Aucune refonte de l'architecture ne sera nécessaire.

---

# 20. Avantages de l'architecture

Cette architecture présente plusieurs avantages.

✓ Faible couplage.

✓ Forte cohésion.

✓ Excellente maintenabilité.

✓ Déploiement simple.

✓ Grande évolutivité.

✓ Très bonnes performances.

✓ Synchronisation temps réel.

✓ Hébergement Cloud.

✓ Architecture moderne.

✓ Compatible DevOps.

✓ Compatible Docker.

✓ Compatible Cloud Run.

✓ Compatible Render.

✓ Compatible Railway.

---

# 21. Limites actuelles

Comme tout système, la plateforme possède quelques limites.

- Dépendance à Firebase.

- Dépendance à Cloudinary.

- Authentification uniquement par email.

- Pas encore de cache Redis.

- Pas encore de microservices.

Ces limites n'empêchent toutefois pas une utilisation professionnelle.

---

# 22. Conclusion

L'architecture retenue combine simplicité, robustesse et évolutivité.

En s'appuyant sur React, Express, Firebase et Cloudinary, la plateforme bénéficie d'une infrastructure moderne répondant aux exigences actuelles du développement logiciel.

La séparation des responsabilités, la modularité des composants et l'utilisation de services Cloud garantissent une solution facilement maintenable, hautement disponible et prête à évoluer vers des fonctionnalités plus avancées sans remettre en cause les fondations du système.