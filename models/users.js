//importation du module "mongoose"
const mongoose = require("mongoose");

//Schema du model de la Souscollection "Stats" contenus dans la collection "Users"
const statSchema = mongoose.Schema({
  nbSessions: { type: Number, default: 0 }, // a defaut "o"
  totalTime: { type: Number, default: 0 }, // a default "0"
  lastConnection: Date,
  nbEtaps: Number,
  creationDate: Date,
  lastModified: Date,
});
//Schema du model de la Souscollection "form" contenus dans la collection "Users"
const formSchema = mongoose.Schema({
  reason: String,
  dayTime: String,
});
//Schema du model de la Collection "Users"
const userSchema = mongoose.Schema({
  admin: { type: Boolean, default: false },
  provToken: { type: String, required: false },
  token: { type: String, required: false },
  email: { type: String, required: true }, // requierr
  password: { type: String, required: true }, // requiert
  username: String,
  name: String,
  gender: String,
  age: Number,
  //déclaration du type geojson point ( Non utilisé - A mettre en place des qu'on questionne l'api )
  coordinate: {
    name: String,
    location: { type: { type: String }, coordinates: { type: [Number] } },
  },
  city: String,
  notificationActive: Boolean,
  photoUrl: String,
  currentLevelID: Number,
  currentSubLevelID: { type: Number, default: 1 }, // tout commencement d'une activité commence par le sublevle 1
  xp: { type: Number, default: 0 },
  isSocialConnected: Boolean,
  sportPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "activities" }], // Clé etrangere
  form: formSchema, // Sous collection
  stats: statSchema, // Sous collection
  medals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "medals" }], // Clé etrangere
    default: [],
  },
  height: Number,
  weight: Number,
});

//exportation du model "User"
const User = mongoose.model("users", userSchema);
module.exports = User;
