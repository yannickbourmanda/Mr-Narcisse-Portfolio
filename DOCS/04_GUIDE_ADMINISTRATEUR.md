# Guide Administrateur

# Portfolio Professionnel & CMS de Gestion

    Version 2.0

1. Introduction

Bienvenue dans le panneau d'administration de votre Portfolio Professionnel.

Cette interface a été développée afin de vous permettre de gérer l'intégralité du site sans modifier une seule ligne de code.

Toutes les modifications sont synchronisées en temps réel avec le site public grâce à Firebase Firestore. Les fichiers (images, vidéos, documents et CV) sont stockés dans Cloudinary afin de garantir de meilleures performances, une sécurité renforcée et une évolutivité adaptée aux besoins futurs.

2. Accéder au panneau d'administration

Le panneau d'administration n'est pas visible publiquement.

Pour y accéder :

https://votresite.com/admin

ou

http://localhost:5173/admin

en développement.

3. Connexion

L'authentification utilise Firebase Authentication.

Vous devez renseigner :

Adresse e-mail
Mot de passe

Après validation :

le Dashboard apparaît automatiquement.

4. Tableau de bord

Le Dashboard constitue le centre de contrôle du site.

Vous y trouverez :

nombre de projets
nombre d'articles
nombre de services
nombre de publications
messages non lus
activités récentes
statistiques générales

Toutes les données sont mises à jour automatiquement.

5. Gestion de la page Accueil

Cette section permet de modifier :

le titre principal
le sous-titre
la description
les statistiques
l'image principale
les boutons d'action

Les modifications sont visibles immédiatement sur le site.

6. Gestion de la page À propos

Cette section permet de modifier :

photo de profil
biographie
signature
compétences
expériences
diplômes
réseaux sociaux
bouton CV
Gestion du CV

Depuis cette page vous pouvez :

téléverser un nouveau CV
remplacer un ancien CV
supprimer un CV

Le CV est automatiquement enregistré dans Cloudinary.

Dossier :

Documents/

CV/
Affichage côté client

Le visiteur peut :

ouvrir le CV
le consulter directement
le télécharger grâce au bouton "Télécharger".

7. Gestion des Services

Chaque service contient :

titre
description
icône
ordre d'affichage

Vous pouvez :

Ajouter

Modifier

Supprimer

Réorganiser

8. Gestion du Portfolio

Le Portfolio permet de présenter les réalisations.

Chaque projet contient :

titre
catégorie
client
description
technologies
date
image principale
galerie d'images
Création d'un projet

Cliquez sur :

Ajouter un projet

Complétez les informations.

Sélectionnez ensuite :

une image principale
plusieurs images secondaires

Cliquez sur :

Enregistrer
Organisation automatique des images

Lors de la création :

Portfolio/

Nom du Projet/

est créé automatiquement dans Cloudinary.

Toutes les images du projet sont enregistrées dans ce dossier.

Exemple :

Portfolio/

Application Bancaire/

cover.webp

dashboard.webp

login.webp

admin.webp

9. Gestion du Blog

Le Blog permet de publier :

actualités
partenariats
événements
innovations
annonces

Chaque article contient :

titre
catégorie
résumé
contenu complet
auteur
date
image de couverture
galerie
Upload

Toutes les images sont automatiquement classées :

Articles/

Titre de l'article/

Exemple

Articles/

Partenariat BN2 SMART/

photo1.webp

photo2.webp

photo3.webp

10. Barre de recherche

Le Blog possède une recherche intelligente.

La recherche fonctionne sur :

titre
contenu
catégorie
auteur

Les résultats apparaissent instantanément.

Le Portfolio possède également une recherche.

Critères :

titre
technologies
client
catégorie

11. Gestion des Publications

Les publications sont destinées aux :

rapports
études
PDF
documents
recherches

Une publication peut contenir :

image
document
lien externe

Formats supportés :

PDF

DOC

DOCX

ZIP

RAR

PPTX

XLSX

12. Gestion de la Médiathèque

La Médiathèque centralise tous les médias.

Elle fonctionne comme Google Drive.

Fonctionnalités :

Recherche

Tri

Prévisualisation

Suppression

Copie du lien

Téléchargement

Les médias sont classés automatiquement.

Portfolio/

Articles/

Publications/

Documents/

CV/

Chaque dossier contient uniquement les fichiers liés à son contenu.

13. Gestion des Messages

Tous les messages du formulaire Contact arrivent ici.

Vous pouvez :

Lire

Supprimer

Marquer comme lu

Répondre directement via votre messagerie.

14. Gestion des Administrateurs

Accessible uniquement aux administrateurs.

Vous pouvez :

Créer un administrateur

Approuver un utilisateur

Supprimer un administrateur

Révoquer les accès

15. Activités

Chaque action importante est enregistrée.

Exemple :

Création d'un article

Suppression d'une image

Ajout d'un projet

Connexion

Déconnexion

Modification d'un CV

16. Paramètres

Cette section permet de modifier :

Nom du site

Description

Logo

Favicon

Adresse

Téléphone

Email

Google Analytics

SEO

Réseaux sociaux

17. Configuration des API

Le projet utilise plusieurs services externes.

# Firebase

Créer un projet :

https://console.firebase.google.com

Configurer :

Authentication
Firestore

Les informations sont à renseigner dans :

src/config/firebase.ts

Variables :

apiKey

authDomain

projectId

storageBucket

messagingSenderId

appId

# Cloudinary

Créer un compte :

https://cloudinary.com

Créer un Upload Preset :

Unsigned

Puis renseigner :

VITE_CLOUDINARY_CLOUD_NAME

VITE_CLOUDINARY_UPLOAD_PRESET

Pour les suppressions automatiques :

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET
Resend

Créer un compte :

https://resend.com

Créer une API Key.

Ajouter :

RESEND_API_KEY

Le destinataire des emails :

CONTACT_EMAIL

# Google Analytics

Créer une propriété :

https://analytics.google.com

Copier :

G-XXXXXXXXXX

Ajouter :

VITE_GA_MEASUREMENT_ID

18. Variables d'environnement

Toutes les clés API sont stockées dans :

.env

ou

.env.local

Ne jamais publier ces fichiers sur GitHub.

19. Sauvegardes

Les données sont automatiquement conservées par :

Firestore

Cloudinary

Il est recommandé d'effectuer une sauvegarde mensuelle.

20. Maintenance

Il est conseillé de :

vérifier les comptes administrateurs
supprimer les médias inutilisés
mettre à jour les dépendances
vérifier les règles Firestore
contrôler les statistiques Analytics

21. Résolution des problèmes

Impossible d'envoyer un email

Vérifier :

RESEND_API_KEY

CONTACT_EMAIL
Les images ne s'affichent pas

Vérifier :

Cloudinary

Upload Preset

Cloud Name

Impossible de se connecter

Vérifier :

Firebase Authentication

Utilisateur autorisé

Mot de passe

Les données ne se synchronisent pas

Vérifier :

Connexion Internet

Firestore

Règles Firestore

Erreur API

Consulter :

F12

Console

Network

pour identifier précisément l'origine du problème.

22. Bonnes pratiques

Utiliser des images optimisées (WebP de préférence).
Organiser les contenus avec des catégories cohérentes.
Mettre à jour régulièrement les informations de contact.
Sauvegarder les documents importants.
Éviter de supprimer des médias encore utilisés par des articles ou des projets.
Tester les modifications avant une mise en production.

# Ce guide est conçu pour permettre à un administrateur de gérer entièrement la plateforme sans intervention d'un développeur. Il constitue la référence principale pour l'exploitation quotidienne du CMS et doit être mis à jour à chaque évolution majeure de l'application.