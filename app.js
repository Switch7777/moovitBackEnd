require("dotenv").config();
require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var apiRouter = require("./routes/api"); //api remplace l'appel a index

// var indexRouter = require("./routes/index"); //index n'est plus appelé
var usersRouter = require("./routes/users");
var app = express();
const cors = require("cors");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// pour servir les style de la page public/index.html
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/api/users", usersRouter); // maj de usersRouter avec le /api
app.use("/api", apiRouter); //   indexRouter est remplacé par apiRouter (voir lg 12)

// Renvoie index.html à la racine du domaine (https://api.mooveit.ovh)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
