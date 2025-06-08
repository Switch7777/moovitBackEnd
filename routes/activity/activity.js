var express = require("express");
var router = express.Router();
require("../../models/connection");
const User = require("../../models/users");
const Activity = require("../../models/activities");
const Medal = require("../../models/medals");
const { checkBody } = require("../../modules/checkBody");
const bcrypt = require("bcrypt");

/**
 * Récupère les données du sous-niveau spécifié d'une activité donnée.
 * Nécessite le token, le sport, le niveau et le sous-niveau.
 */
router.post("/getdataact", (req, res) => {
  if (!checkBody(req.body, ["token", "sport", "subLevel", "level"])) {
    res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
    return;
  }
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      return res.status(401).json({
        result: false,
        error: "Token invalide ou utilisateur introuvable",
      });
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
        res
          .status(404)
          .json({ result: false, error: "Sous-niveau introuvable" });
        return;
      } else {
        res.json({ activity: level.subLevels });
      }
    });
  });
});

/**
 * @swagger
 * /api/activity/getdataact:
 *   post:
 *     summary: Récupère les données d’un sous-niveau d’activité
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - sport
 *               - level
 *               - subLevel
 *             properties:
 *               token:
 *                 type: string
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *               sport:
 *                 type: string
 *                 example: Padel
 *               level:
 *                 type: integer
 *                 example: 1
 *               subLevel:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Liste des sous-niveaux du niveau demandé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subLevelID:
 *                         type: integer
 *                         example: 2
 *                       title:
 *                         type: string
 *                         example: "Sous-niveau 2"
 *                       description:
 *                         type: string
 *                         example: "Travailler les volées"
 *                       mediaUrl:
 *                         type: string
 *                         example: "https://youtube.com/..."
 *                       xp:
 *                         type: integer
 *                         example: 50
 *                       timing:
 *                         type: integer
 *                         example: 180
 *       400:
 *         description: Champs de requête manquants
 *       404:
 *         description: Activité, niveau ou sous-niveau introuvable
 */

module.exports = router;
