# 08 – Sécurité, Maintenance et Bonnes Pratiques

Version : 1.0
Projet : Portfolio Professionnel + CMS
Architecture : React • TypeScript • Node.js • Express • Firebase • Cloudinary

---

# 1. Introduction

La sécurité constitue un élément essentiel de cette plateforme.

L'application est conçue afin de protéger :

- les comptes administrateurs
- les données utilisateurs
- les contenus du site
- les médias
- les API
- les formulaires publics

L'objectif est de limiter les risques tout en conservant une interface simple à administrer.

---

# 2. Authentification

Le système utilise Firebase Authentication.

Les administrateurs se connectent avec :

- Email
- Mot de passe

Aucun mot de passe n'est stocké dans Firestore.

Toute la gestion des identifiants est assurée par Firebase.

---

# 3. Gestion des rôles

Deux rôles existent actuellement.

## Administrateur

Peut :

- modifier le site
- gérer les projets
- gérer les articles
- gérer les utilisateurs
- gérer les paramètres
- gérer les médias

---

## pending_admin

Compte créé mais non encore validé.

Il ne possède aucun accès au CMS.

Un administrateur devra approuver le compte.

---

# 4. Protection Firestore

Les règles Firestore empêchent :

- la modification des données publiques
- la suppression non autorisée
- les accès anonymes au CMS

Seuls les administrateurs authentifiés peuvent écrire.

---

# 5. Protection Cloudinary

Les médias sont stockés sur Cloudinary.

Le système utilise :

- Upload Preset Unsigned

Les suppressions utilisent :

- API Key
- API Secret

Ces informations ne doivent jamais être exposées côté client.

---

# 6. Variables sensibles

Les secrets doivent rester dans :

.env

Jamais dans :

- GitHub
- JavaScript
- React
- HTML

Variables concernées :

- Firebase
- Cloudinary
- Resend
- Gemini
- Google Analytics

---

# 7. Protection du formulaire Contact

Le formulaire possède plusieurs protections.

## Honeypot

Champ invisible.

Les robots le remplissent.

Les utilisateurs ne le voient jamais.

---

## Vérification temporelle

Le formulaire refuse un envoi réalisé trop rapidement.

---

## Limitation de fréquence

Un utilisateur ne peut envoyer qu'un certain nombre de messages dans un intervalle réduit.

---

## Validation

Les champs sont validés avant l'envoi.

Exemple :

- email valide
- nom obligatoire
- message obligatoire

---

# 8. Protection des API

Toutes les routes Express utilisent :

Validation

Contrôle des paramètres

Gestion des erreurs

Réponses normalisées

Les webhooks utilisent un secret partagé.

SOCIAL_WEBHOOK_SECRET

---

# 9. Sécurité des médias

Les médias sont filtrés.

Formats autorisés :

Images

- JPG
- PNG
- WEBP

Documents

- PDF
- DOC
- DOCX

Vidéos

- MP4
- WEBM

Les fichiers non autorisés sont refusés.

---

# 10. Sauvegardes

Les données principales résident dans Firestore.

Cloudinary conserve les médias.

Il est recommandé de :

exporter Firestore régulièrement

sauvegarder les variables .env

conserver les fichiers critiques sur Git

---

# 11. Journalisation

Les activités administrateur sont enregistrées.

Exemples :

Création

Modification

Suppression

Connexion

Déconnexion

Ces informations permettent un suivi des actions.

---

# 12. Gestion des erreurs

Toutes les erreurs sont interceptées.

Le frontend affiche :

Toast

Notification

Message utilisateur

Le backend enregistre les erreurs importantes.

---

# 13. Surveillance

Les éléments à surveiller :

- utilisation Cloudinary
- quota Firebase
- trafic
- erreurs serveur
- temps de réponse

Google Analytics permet également d'analyser :

- visiteurs
- pages consultées
- durée moyenne

---

# 14. Mise à jour

Avant chaque mise à jour :

Sauvegarder Firestore

Exporter les médias

Créer une branche Git

Tester en local

Déployer

Vérifier

---

# 15. Maintenance préventive

Une fois par mois :

✔ nettoyer les médias inutilisés

✔ supprimer les comptes inactifs

✔ vérifier les clés API

✔ vérifier les dépendances npm

✔ mettre à jour React

✔ mettre à jour Firebase

✔ mettre à jour Express

---

# 16. Gestion des incidents

En cas de problème :

1. Identifier le composant

2. Consulter les logs

3. Restaurer la sauvegarde si nécessaire

4. Corriger

5. Tester

6. Déployer

---

# 17. Bonnes pratiques

Ne jamais :

- partager les API Keys
- publier .env
- stocker des secrets dans React

Toujours :

- utiliser HTTPS
- mettre à jour les dépendances
- tester avant production
- sauvegarder régulièrement

---

# 18. Évolutions recommandées

Pour les prochaines versions :

✓ Authentification à deux facteurs

✓ Journal d'audit complet

✓ Sauvegardes automatiques

✓ Antivirus des fichiers

✓ Signature des uploads

✓ Notifications de sécurité

✓ Monitoring Cloud

✓ Tableau de bord d'administration avancé

✓ Alertes en cas d'activité suspecte

✓ Rotation automatique des clés API

---

