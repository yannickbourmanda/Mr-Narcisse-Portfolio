# Guide d'Utilisation : Portfolio & CMS

Bienvenue sur la documentation de votre nouveau Portfolio et système de gestion de contenu (CMS). Ce document est conçu pour vous guider de manière fluide et humaine à travers l'utilisation de la plateforme et sa configuration.

---

## 1. Accès au Tableau de Bord (Espace Admin)

Votre application dispose d'un espace d'administration sécurisé qui vous permet de gérer tout le contenu du site sans avoir à toucher au code.

1. Allez sur l'adresse de votre site et ajoutez `/admin` à la fin (par exemple : `monsite.com/admin`).
2. Connectez-vous en utilisant le module de connexion sécurisé Google.
3. Le **premier utilisateur** qui se connecte obtient automatiquement les droits d'Administrateur. Tout utilisateur suivant sera "En attente d'approbation".

---

## 2. Gérer le contenu du site

Une fois connecté au tableau de bord, vous avez accès à plusieurs menus sur votre gauche :

- **À Propos & CV** : Modifiez votre texte de présentation, vos informations professionnelles, et importez votre CV au format PDF. Lorsqu'un PDF est importé, il remplace automatiquement l'ancien. Sur la page publique, le CV est visualisable directement grâce à une fenêtre modale élégante avec option de téléchargement.
- **Blog** : Rédigez et publiez vos articles. Vous pouvez classer vos articles par catégories pour permettre à vos visiteurs de les filtrer facilement.
- **Portfolio** : Ajoutez vos études de cas ou projets. Vous pouvez uploader plusieurs images par projet.
- **Publications** : Partagez vos documents académiques ou rapports. Vous avez la possibilité de joindre un fichier (PDF, Word, Excel, ZIP) ou d'ajouter un lien externe (vers Google Drive par exemple).
- **Services** : Mettez en avant vos expertises.
- **Médiathèque** : Retrouvez l'intégralité des images et documents que vous avez importés sur le site.
- **Paramètres (SEO & Apparence)** : Modifiez la page d'accueil, les couleurs, et le référencement (SEO).

Toutes vos modifications sont **immédiatement visibles** sur le site en temps réel.

---

## 3. Configuration des Clés API (Pour changer de compte)

Si vous souhaitez lier le site à *vos propres comptes* (pour gérer les images sur votre Cloudinary, recevoir les emails via votre compte Resend, etc.), vous n'avez pas besoin de fouiller dans des centaines de fichiers. Tout se passe dans la configuration de vos **Secrets d'environnement**.

Dans l'interface de Google AI Studio, vous avez un menu **Secrets** (ou via un fichier `.env.example` si vous exportez le code sur GitHub).

### A. Hébergement des Images et Documents (Cloudinary)

Le site utilise **Cloudinary** pour stocker vos images et votre CV afin que le site reste ultra-rapide et optimisé.

1. **Où créer le compte ?** Allez sur [cloudinary.com](https://cloudinary.com/) et créez un compte gratuit.
2. **Où trouver les clés ?** Sur votre tableau de bord Cloudinary, vous verrez votre `Cloud Name`, `API Key`, et `API Secret`. 
   Vous devrez aussi aller dans les paramètres (*Settings > Upload*) pour créer un **Upload Preset** en mode "Unsigned".
3. **Que modifier dans les secrets ?**
   Remplacez les valeurs dans le panneau de Secrets :
   - `VITE_CLOUDINARY_CLOUD_NAME` : Votre Cloud Name.
   - `VITE_CLOUDINARY_UPLOAD_PRESET` : Le nom du preset (par exemple "portfolio_upload").
   - `CLOUDINARY_API_KEY` : Votre clé API.
   - `CLOUDINARY_API_SECRET` : Votre code secret API.

### B. Envoi d'Emails (Formulaire de Contact)

Lorsque quelqu'un vous écrit via la page Contact, vous recevez un email automatique. Le site utilise **Resend**.

1. **Où créer le compte ?** Allez sur [resend.com](https://resend.com/) et créez un compte.
2. **Où trouver la clé ?** Dans l'onglet *API Keys*, générez une nouvelle clé.
3. **Que modifier dans les secrets ?**
   - `RESEND_API_KEY` : Collez votre clé Resend ici.
   - `CONTACT_EMAIL` : Mettez l'adresse email sur laquelle vous souhaitez recevoir les messages de vos visiteurs.

### C. Base de Données & Authentification (Firebase)

Les données textuelles (articles, textes, paramètres) sont sauvegardées sur Firebase.

Si vous avez configuré le site via l'assistant AI Studio, la base de données est déjà liée. 
Si vous décidez d'exporter le code et de le déployer sur Vercel ou un autre service :
- Créez un projet sur [firebase.google.com](https://firebase.google.com/).
- Ajoutez Firebase Authentication (Google Sign-in) et Firestore Database.
- Les fichiers liés à Firebase dans le code sont : `src/config/firebase.ts` (pour les identifiants) et `firebase-applet-config.json`.

---

## 4. Foire Aux Questions (FAQ)

**Q : Mon CV ne s'affiche pas correctement ou je veux le supprimer.**
R : Allez dans le menu `À Propos` du panneau d'administration. Faites défiler jusqu'à la section "Gestion du CV". Vous y trouverez un bouton rouge en forme de corbeille pour supprimer le fichier actuel. Vous pourrez ensuite en télécharger un nouveau (au format PDF).

**Q : Comment voir les messages reçus depuis le formulaire de contact ?**
R : En plus de les recevoir par email (grâce à Resend), vous pouvez les lire directement depuis l'onglet **Messages** de votre espace d'administration.

**Q : Puis-je modifier la police ou les couleurs générales ?**
R : Vous pouvez ajuster les teintes depuis l'onglet **Paramètres** de l'administration. Pour la police d'écriture, elle est configurée globalement pour donner un style professionnel (Inter / Playfair / Geist). Si vous exportez le code, la configuration se trouve dans le fichier de styles Tailwind.


---

**Note pour le développement local ou l'hébergement externe (Vercel, Netlify) :**
Si vous travaillez en local (VS Code), copiez le fichier `.env.example` à la racine du projet et renommez-le en `.env`. Remplissez ensuite ce nouveau fichier `.env` avec vos clés (ces clés ne seront jamais partagées publiquement).
