// importation du module "mongoose"
const mongoose = require("mongoose");

// Définition du sous-schéma pour les items de "data"
const dataItemSchema = mongoose.Schema({
  title: String,
  desc: String,
  answer: String,
  src: String,
  name: String,
  fieldType: String,
  useGeolocation: Boolean,
  range: [Number],
});

// Définition du schéma principal
const onBoardingSchema = mongoose.Schema({
  type: String,
  required: Boolean,
  mainQuestion: String,
  secondaryQuestion: String,
  tertiary: String,
  data: [dataItemSchema],
});

// Création du modèle
const OnBoarding = mongoose.model("onBoardingQuestion", onBoardingSchema);

module.exports = OnBoarding;
