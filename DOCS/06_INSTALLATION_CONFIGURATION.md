# Guide d'Installation & Configuration

# Portfolio Professionnel & CMS

    Version 2.0

1. Introduction

Ce document décrit la procédure complète d'installation, de configuration et de déploiement du Portfolio Professionnel & CMS.

L'objectif est de permettre à un développeur d'installer le projet sur une nouvelle machine ou un nouveau serveur sans difficulté.

2. Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants.

Node.js

Version recommandée :

Node.js 22 LTS

Téléchargement :

https://nodejs.org

npm

Vérification

npm -v
Git

Téléchargement

https://git-scm.com

Visual Studio Code

Téléchargement

https://code.visualstudio.com

Extensions recommandées :

ESLint
Prettier
Tailwind CSS IntelliSense
Firebase
GitLens
Mermaid Preview
Thunder Client

3. Cloner le projet

git clone https://github.com/votre-compte/portfolio-cms.git

Puis

cd portfolio-cms

4. Installer les dépendances

npm install

ou

npm ci

5. Structure du projet

Portfolio-CMS/

docs/

public/

server.ts

package.json

src/

firebase.json

firestore.rules

.env

README.md

6. Configuration des variables d'environnement

Créer un fichier

.env.local

ou

.env

Ajouter :

# Firebase

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

# Cloudinary

VITE_CLOUDINARY_CLOUD_NAME=

VITE_CLOUDINARY_UPLOAD_PRESET=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

# Emails

RESEND_API_KEY=

CONTACT_EMAIL=

# Google Analytics

VITE_GA_MEASUREMENT_ID=

# Webhook

SOCIAL_WEBHOOK_SECRET=

7. Configuration Firebase

Créer un projet :

https://console.firebase.google.com

Activer

Authentication

Firestore Database

Authentication

Méthode

Email / Password

Firestore

Créer la base

Mode production

Copier la configuration

Depuis :

Paramètres du projet

↓

Configuration Web

Coller les informations dans

src/config/firebase.ts

8. Configuration Cloudinary

Créer un compte :

https://cloudinary.com

Créer un Upload Preset

Mode

Unsigned

Nom conseillé

portfolio_upload

Renseigner ensuite

VITE_CLOUDINARY_CLOUD_NAME

VITE_CLOUDINARY_UPLOAD_PRESET

Pour la suppression automatique

Ajouter également

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

9. Configuration Resend

Créer un compte

https://resend.com

Créer une API Key

Ajouter

RESEND_API_KEY

Définir ensuite

CONTACT_EMAIL

Toutes les demandes envoyées depuis le formulaire Contact seront redirigées vers cette adresse.

10. Google Analytics

Créer une propriété

https://analytics.google.com

Copier

G-XXXXXXXXXX

Ajouter

VITE_GA_MEASUREMENT_ID

11. Démarrer le projet

Mode développement

npm run dev

Le projet sera disponible sur

http://localhost:5173

Administration

http://localhost:5173/admin

12. Compilation

Créer la version production

npm run build

Le dossier

dist/

est généré automatiquement.

13. Production

Lancer

npm run start

Express servira automatiquement

le frontend
les API
les fichiers statiques

14. Déploiement

Le projet est compatible avec

✅ Vercel

✅ Firebase Hosting

✅ Render

✅ Railway

✅ Docker

✅ Google Cloud Run

15. Déploiement Firebase Hosting

Installer

npm install -g firebase-tools

Connexion

firebase login

Initialisation

firebase init

Déploiement

firebase deploy

16. Déploiement Vercel

Installer

npm install -g vercel

Connexion

vercel login

Déploiement

vercel

17. Déploiement Docker

Créer l'image

docker build -t portfolio-cms .

Lancer

docker run -p 3000:3000 portfolio-cms

18. Sauvegardes

Il est recommandé de sauvegarder régulièrement :

Firestore
Cloudinary
Variables d'environnement
Code source GitHub

19. Mise à jour des dépendances

Vérifier

npm outdated

Mettre à jour

npm update

20. Maintenance

Une fois par mois

✔ Vérifier Firebase

✔ Vérifier Cloudinary

✔ Vérifier Resend

✔ Vérifier Google Analytics

✔ Nettoyer les médias inutilisés

✔ Vérifier les administrateurs

✔ Sauvegarder Firestore

✔ Vérifier les journaux d'erreurs

21. Résolution des problèmes

Les images ne s'affichent pas

Vérifier :

Cloud Name
Upload Preset
Connexion Internet
Impossible d'envoyer un email

Contrôler :

RESEND_API_KEY

CONTACT_EMAIL
Erreur Firebase

Vérifier :

src/config/firebase.ts

ainsi que toutes les variables du fichier .env.

Firestore inaccessible

Contrôler :

les règles Firestore ;
le statut du projet Firebase ;
la connexion réseau.
Upload impossible

Vérifier :

le preset Cloudinary ;
le type de fichier ;
la taille du fichier ;
les clés Cloudinary.

22. Bonnes pratiques

Utiliser Git pour toutes les modifications.
Effectuer les tests en environnement local avant chaque déploiement.
Ne jamais publier le fichier .env.
Documenter chaque évolution importante.
Créer une branche dédiée pour les nouvelles fonctionnalités.

23. Conclusion

Cette procédure permet d'installer, configurer et déployer entièrement la plateforme Portfolio Professionnel & CMS dans un nouvel environnement. En suivant ces étapes, un développeur peut remettre le projet en fonctionnement rapidement tout en garantissant la sécurité, les performances et la maintenabilité de l'application.