//importation du module "mongoose"
const mongoose = require("mongoose");

const trainSchema = mongoose.Schema({
  id: Number,
  title: String,
  duration: Number,
  mediaUrl: String,
  image: String,
  tipOfThePro: String,
  xp: Number,
});
const Train = mongoose.model("trains", trainSchema);
module.exports = Train;
