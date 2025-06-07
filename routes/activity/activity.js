var express = require("express");
var router = express.Router();
require("../../models/connection"); //import de la connection string
const User = require("../../models/users"); //import du schema user
const Activity = require("../../models/activities"); //import du schema activity
const Medal = require("../../models/medals"); //import du schema activity
const { checkBody } = require("../../modules/checkBody"); //import de la fonction checkBody qui verifie que tout le champs soit ni null ni une string vide
const bcrypt = require("bcrypt");

router.post("/getdataact", (req, res) => {
  if (!checkBody(req.body, ["token", "sport", "subLevel", "level"])) {
    res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
    return; // FIN DU PROG
  }

  Activity.findOne({ title: req.body.sport }).then((activityData) => {
    if (!activityData) {
      res.status(404).json({ result: false, error: "Activité introuvable" });
      return;
    }

    const level = activityData.levels.find(
      (levels) => levels.levelID === Number(req.body.level)
    );
    if (!level) {
      res.status(404).json({ result: false, error: "Niveau introuvable" });
      return;
    }

    const subLevel = level.subLevels.find(
      (sub) => sub.subLevelID === Number(req.body.subLevel)
    );
    if (!subLevel) {
      res.status(404).json({ result: false, error: "Sous-niveau introuvable" });
      return;
    } else {
      res.json({ activity: level.subLevels });
    }
  });
});

module.exports = router;
