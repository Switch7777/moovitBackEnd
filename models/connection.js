const mongoose = require("mongoose"); // Import de mongoose
const connectionString = process.env.CONNECTION_STRING; // Récupère l'URL de connexion

mongoose.set("strictQuery", true); // Definit un filtre strict

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 }) // time avant le timout
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));

module.exports = connectionString;
