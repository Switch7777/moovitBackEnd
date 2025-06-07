const { swaggerUi, swaggerSpec } = require("./docs/swagger");
require("dotenv").config(); // Chargement des variables d'environement ( auth MongoDB )
require("./models/connection"); // Connexion a la base de donnée
var express = require("express"); // Import du framework Express
var path = require("path"); // Module NodeJs pour gerer les chemins d'accés
var cookieParser = require("cookie-parser"); // Middleware pour lire les cookies
var logger = require("morgan"); // Middleware pour afficher les LOG HTTP
// Definition des routes

var app = express(); // Initialise Express

const fileUpload = require("express-fileupload");
app.use(fileUpload({ useTempFiles: true }));
var apiRouter = require("./routes/api"); //Defini le endpoint API pour les routes
var authRouter = require("./routes/auth/auth"); //Defini le endpoint USERS pour les routes
var dashboardRouter = require("./routes/dashboard/dashboard");
var weatherRouter = require("./routes/services/weather");
var updateRouter = require("./routes/user/update");
var geolocRouter = require("./routes/services/geoloc");
var idphotoRouter = require("./routes/services/cloudinary");

//

const cors = require("cors"); // Middleware pour autoriser les echanges BACK/FRONT
app.use(cors()); // Activation de CORS
app.use(logger("dev")); // Active le logger Morgan en mode "dev" pour afficher les requêtes HTTP dans la console
app.use(express.json()); // Conversion auto des requette en JSON
app.use(express.urlencoded({ extended: false })); // Conversion des requete en method HTTP
app.use(cookieParser()); // Active le middleware pour les cookies

app.use("/api/auth/auth", authRouter);
app.use("/api/dashboard/dashboard", dashboardRouter);
app.use("/api/services/weather", weatherRouter);
app.use("/api/services/cloudinary", idphotoRouter);
app.use("/api/user/update", updateRouter);
app.use("/api/services/geoloc", geolocRouter);

app.use("/api", apiRouter); //   indexRouter est remplacé par apiRouter (voir lg 12)
// Definition de la page Index
app.use(express.static(path.join(__dirname, "public")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
module.exports = app;
