MOOVEIT Backend

Backend Node.js pour l’application MOOVEIT (coaching sportif gamifié).
Ce backend gère l’authentification, l’onboarding, les niveaux, la géolocalisation, la météo, les médailles et l’administration utilisateur.

Stack
• Node.js / Express
• MongoDB / Mongoose
• Swagger pour la documentation API
• Cloudinary pour la gestion des photos de profil
• OpenWeatherMap pour la météo
• Nominatim (via lat/lon) pour la géolocalisation

⸻

Lancement local

npm install
cp .env.example .env

# Remplir les clés MongoDB, Cloudinary, OpenWeatherMap

node app.js

Swagger disponible sur : http://localhost:PORT/api-docs

⸻

Structure des dossiers

/routes -> Toutes les routes, classées par fonctionnalité
/auth -> Inscription, connexion, onboarding
/dashboard -> Récupération des données utilisateur + niveau
/services -> Météo, cloudinary, géolocalisation
/user -> Mise à jour du profil, suppression de compte

/models -> Schémas Mongoose : users, activities, medals
/modules -> Fonctions utilitaires (ex: checkBody)
/docs/swagger.js -> Configuration Swagger
/public -> Dossier statique
/data -> Fichiers JSON de données mock ou de référence

⸻

Routes principales

Authentification
• POST /api/auth/auth/signup : création de compte
• POST /api/auth/auth/postsignup : onboarding
• POST /api/auth/auth/signin : connexion

Utilisateur
• POST /api/user/update/idphoto : changer photo (via Cloudinary)
• DELETE /api/user/update/deleteaccount : suppression de compte

Dashboard
• POST /api/dashboard/dashboard/initdash : données dashboard + niveau
• POST /api/dashboard/dashboard/initcarroussel : récupère les visuels des niveaux
• POST /api/dashboard/dashboard/level : incrémentation subLevel/level/xp

Services
• POST /api/services/geoloc : géolocalisation depuis lat/lon
• POST /api/services/weather : météo actuelle selon ville utilisateur

⸻

Variables d’environnement (extraits)

MONGODB_URI=mongodb+srv://...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
WEATHER_API_KEY=...

⸻

Swagger

Swagger est généré à partir des commentaires JSDoc dans les fichiers /routes/\*_/_.js

URL de documentation : http://localhost:PORT/api-docs

⸻

Auteur

Sami Allaoui

Projet MOOVEIT - Juin 2025

⸻

TODO ✨
• Authentification sociale (Google / iCloud)
• WebSocket pour les sessions live ?
• Admin dashboard ?
