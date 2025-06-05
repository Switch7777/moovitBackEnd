//importation du module "mongoose"
const mongoose = require("mongoose");

//Schema du model de la Collection "Medals"
const medalSchema = mongoose.Schema({
  title: String,
  image: String,
  xp: { type: Number, default: 10 }, // valeur par défaut de 10 si non précisé
  activity: { type: mongoose.Schema.Types.ObjectId, ref: "activities" }, // Référence à une clé étrangère sur activities
});

//exportation du model "Medal"
const Medal = mongoose.model("medals", medalSchema);
module.exports = Medal;
