# 07_API_REFERENCE.md

# Référence des API
## Portfolio & Blog CMS

**Version :** 1.0  
**Architecture :** Node.js + Express + Firebase + Cloudinary

---

# 1. Introduction

Le backend expose plusieurs services REST permettant la communication entre l'interface publique, le panneau d'administration, Firebase, Cloudinary et les services externes.

L'ensemble des API est développé avec **Express.js** et fonctionne aussi bien en développement qu'en production.

---

# 2. Architecture des API

```
Client React
      │
      │ HTTP / HTTPS
      ▼
Express Server
      │
 ┌────┴───────────────┐
 │                    │
 ▼                    ▼
Firebase         Cloudinary
 │                    │
 ▼                    ▼
Firestore      Images / Documents
```

---

# 3. Health Check API

Permet de vérifier que le serveur fonctionne correctement.

## Endpoint

```
GET /api/health
```

### Réponse

```json
{
   "status":"OK",
   "server":"running"
}
```

### Code HTTP

|Code|Description|
|------|----------------|
|200|Serveur opérationnel|

---

# 4. API Contact

Cette API est appelée lorsqu'un visiteur remplit le formulaire de contact.

## Endpoint

```
POST /api/contact
```

---

### Corps de la requête

```json
{
   "name":"Jean Dupont",
   "email":"jean@email.com",
   "subject":"Demande d'information",
   "message":"Bonjour..."
}
```

---

### Traitement

Le serveur :

- vérifie le Honeypot
- vérifie le délai minimal
- applique le Rate Limiting
- envoie un email avec Resend
- enregistre le message dans Firestore
- retourne une confirmation

---

### Réponse

```json
{
   "success":true,
   "message":"Votre message a été envoyé."
}
```

---

### Codes HTTP

|Code|Description|
|------|----------------|
|200|Message envoyé|
|400|Données invalides|
|429|Trop de requêtes|
|500|Erreur serveur|

---

# 5. API Webhook Social

Permet de publier automatiquement un article provenant de LinkedIn, Facebook ou d'une autre plateforme.

---

## Endpoint

```
POST /api/webhooks/social
```

---

### Authentification

Le webhook est protégé par :

```
SOCIAL_WEBHOOK_SECRET
```

---

### Exemple

```json
{
"title":"Nouvelle conférence",
"content":"Texte...",
"image":"https://...",
"category":"Actualités"
}
```

---

### Résultat

Le serveur :

- valide le secret
- crée un article
- ajoute la date
- définit le statut "Publié"
- l'enregistre dans Firestore

---

# 6. Cloudinary Upload Service

Les fichiers ne sont plus stockés dans Firestore.

Ils sont directement envoyés vers Cloudinary.

---

## Images

Formats :

- JPG
- PNG
- WEBP
- GIF
- SVG

---

## Documents

Formats :

- PDF
- DOC
- DOCX
- XLS
- XLSX
- PPT
- PPTX

---

## Vidéos

Formats :

- MP4
- MOV
- WEBM

---

Le système crée automatiquement les dossiers :

```
Articles/
    Article 1/

Portfolio/
    Projet ERP/

CV/

Documents/
```

---

# 7. Firebase Authentication

Authentification des administrateurs.

Services utilisés :

```
signInWithEmailAndPassword()

createUserWithEmailAndPassword()

signOut()

onAuthStateChanged()
```

---

## Workflow

Connexion

↓

Vérification Firebase

↓

Lecture du document Users

↓

role == admin ?

↓

Oui

↓

Dashboard

Sinon

↓

Accès refusé

---

# 8. Firestore Services

Collections principales

```
users

articles

projects

messages

activities

settings

publications

services

media
```

Toutes les opérations CRUD utilisent le SDK Firebase.

---

# 9. Activités

Chaque modification génère automatiquement une activité.

Exemples

```
Projet créé

Projet supprimé

Article publié

Connexion admin

Document ajouté

CV remplacé
```

---

# 10. Service Cloudinary

Fonctions principales

```
uploadImage()

uploadVideo()

uploadDocument()

deleteAsset()

renameFolder()

getAssets()

searchAssets()
```

---

# 11. Service CV

Le CV est stocké dans

```
CV/
```

Le CMS permet

- Upload

- Remplacement

- Suppression

Le site public permet

- Visualisation PDF

- Téléchargement

---

# 12. Service Publications

Chaque publication peut contenir

- image

- document

- lien externe

Exemple

```
Titre

Résumé

Auteur

Document PDF

Lien DOI

Lien Site Web
```

---

# 13. Recherche

Le moteur de recherche fonctionne sur :

Blog

Portfolio

Media Library

Recherche :

- titre

- catégorie

- auteur

- mots-clés

- contenu

- date

---

# 14. Synchronisation Temps Réel

Toutes les données utilisent

```
onSnapshot()
```

Toute modification dans Firestore est immédiatement visible :

CMS

↓

Firestore

↓

Site Public

sans rechargement.

---

# 15. Variables d'environnement

```
VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_MESSAGING_SENDER_ID

VITE_FIREBASE_APP_ID

VITE_CLOUDINARY_CLOUD_NAME

VITE_CLOUDINARY_UPLOAD_PRESET

RESEND_API_KEY

CONTACT_EMAIL

SOCIAL_WEBHOOK_SECRET

VITE_GA_MEASUREMENT_ID
```

---

# 16. Gestion des erreurs

Le serveur retourne toujours des réponses normalisées.

Exemple :

```json
{
"success":false,
"message":"Erreur lors de l'envoi."
}
```

---

# 17. Évolutions prévues

Les API ont été conçues pour intégrer facilement :

- IA (Gemini / OpenAI)

- Paiements

- Notifications Push

- API Mobile Flutter

- Version REST publique

- API GraphQL

- Authentification OAuth

- SSO Microsoft / Google

- WebSockets

- Microservices

sans modification majeure de l'architecture.