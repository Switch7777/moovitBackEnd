// Chargement des dépendances et configuration initiale
require("dotenv").config(); // Charge les variables d'environnement
require("./models/connection"); // Connexion à la base de données MongoDB

const express = require("express"); // Framework Express.js
const path = require("path"); // Utilitaire Node.js pour gérer les chemins de fichiers
const cookieParser = require("cookie-parser"); // Middleware pour lire/écrire les cookies
const logger = require("morgan"); // Middleware pour logger les requêtes HTTP dans la console
const cors = require("cors"); // Middleware pour autoriser les échanges entre domaines (CORS)
const fileUpload = require("express-fileupload"); // Middleware pour gérer l'upload de fichiers

// Swagger - Documentation API
const { swaggerUi, swaggerSpec } = require("./docs/swagger");

//  Initialisation de l'app Express
const app = express();

//  Middlewares globaux
app.use(cors()); // Active les autorisations Cross-Origin (utile pour le Front en local ou déployé ailleurs)
app.use(logger("dev")); // Affiche les requêtes HTTP dans la console (format dev)
app.use(express.json()); // Parse les requêtes entrantes avec du JSON
app.use(express.urlencoded({ extended: false })); // Supporte les formulaires HTML
app.use(cookieParser()); // Active le middleware cookie
app.use(fileUpload({ useTempFiles: true })); // Active l'upload de fichiers avec stockage temporaire

//  Déclaration des routes
const apiRouter = require("./routes/api"); // Routes génériques
const authRouter = require("./routes/auth/auth"); // Authentification / Inscription
const dashboardRouter = require("./routes/dashboard/dashboard"); // Données pour le dashboard utilisateur
const weatherRouter = require("./routes/services/weather"); // Service météo pour le dashboard
const geolocRouter = require("./routes/services/geoloc"); // Service de géolocalisation pour le onBoarding
const idphotoRouter = require("./routes/services/cloudinary"); // Upload photo de profil de profil via Cloudinary
const updateRouter = require("./routes/user/update"); // Mise à jour du profil utilisateur ( Level++ ) et Suppresion de compte
const actRouter = require("./routes/activity/activity"); // Données d’activités (BDD pour la data des activités)
const trainRouter = require("./routes/activity/train");
//  Affectation des routes avec leur prefixe
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/geoloc", geolocRouter);
app.use("/api/cloudinary", idphotoRouter);
app.use("/api/update", updateRouter);
app.use("/api/activity", actRouter);
app.use("/api/train", trainRouter);
app.use("/api", apiRouter); // Route de base API (par ex: /api/ping)

//  Fichiers statiques (si tu ajoutes une page publique ou une doc statique)
app.use(express.static(path.join(__dirname, "public")));

//  Documentation Swagger accessible sur /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
