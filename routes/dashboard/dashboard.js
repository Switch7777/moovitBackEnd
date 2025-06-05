var express = require("express");
var router = express.Router();
require("../../models/connection"); //import de la connection string
const User = require("../../models/users"); //import du schema user
const Activity = require("../../models/activities"); //import du schema activity
const Medal = require("../../models/medals"); //import du schema activity
const { checkBody } = require("../../modules/checkBody"); //import de la fonction checkBody qui verifie que tout le champs soit ni null ni une string vide

///////////////////////////////////////////////////////////////////////////////
//        Initialisation du Dashboard avec info de l'user
///////////////////////////////////////////////////////////////////////////////
router.post("/initdash", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
    res.status(400).json({
      result: false,
      error: "Token absent",
    });
    return; // FIN DU PROG
  }

  User.findOne({ token: req.body.token })
    .populate("sportPlayed", "title image")
    .then((userData) => {
      if (!userData) {
        res
          .status(404)
          .json({ result: false, error: "Utilisateur introuvable" });
        return;
      }

      const sport = userData.sportPlayed[0];
      if (!sport) {
        res.status(404).json({
          result: false,
          error: "Aucun sport enregisté",
        });
        return;
      }

      Activity.findOne({ title: sport.title }).then((activityData) => {
        if (!activityData) {
          res
            .status(404)
            .json({ result: false, error: "Activité introuvable" });
          return;
        }

        const activityLevel = activityData.levels.find(
          (level) => level.levelID === userData.currentLevelID
        );

        if (!activityLevel) {
          res.status(404).json({ result: false, error: "Niveau introuvable" });
          return;
        }

        const currentSubLevel = activityLevel.subLevels.find(
          (sub) => sub.subLevelID === userData.currentSubLevelID
        );
        let totalGame = 0;

        for (let i = 0; i < activityData.levels.length; i++) {
          for (let j = 0; j < activityData.levels[i].subLevels.length; j++) {
            totalGame++;
          }
        }

        res.status(200).json({
          result: true,
          user: {
            username: userData.username,
            name: userData.name,
            xp: userData.xp,
            stats: userData.stats,
            level: userData.currentLevelID,
            totalGame: totalGame,
            subLevel: userData.currentSubLevelID,
            photoUrl: userData.photoUrl,
          },
        });
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ result: false, error: "Erreur serveur", details: err });
    });
});
///////////////////////////////////////////////////////////////////////////////
//       Initialisation du carrousel
///////////////////////////////////////////////////////////////////////////////
router.post("/initcarroussel", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
    return res.status(400).json({
      result: false,
      error: "Token absent",
    });
  }

  User.findOne({ token: req.body.token })
    .populate("sportPlayed", "title")
    .then((userData) => {
      const sportTitle = userData.sportPlayed[0].title;

      Activity.findOne({ title: sportTitle }).then((activityData) => {
        const carouselData = activityData.levels.map((level) => ({
          title: level.title,
          image: level.image,
        }));

        res.status(200).json({
          result: true,
          carouselData: carouselData,
        });
      });
    })
    .catch((error) => {
      res.status(500).json({
        result: false,
        error: "Erreur serveur ",
      });
    });
});

/**
 * @swagger
 * /api/dashboard/dashboard/initcarroussel:
 *   post:
 *     summary: Récupère les images et titres des niveaux pour le carrousel
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *     responses:
 *       200:
 *         description: Liste des niveaux avec titres et images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 carouselData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *       400:
 *         description: Token manquant
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/dashboard/dashboard/initdash:
 *   post:
 *     summary: Initialise les données du tableau de bord utilisateur
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *     responses:
 *       200:
 *         description: Données utilisateur et tableau de bord renvoyées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     xp:
 *                       type: integer
 *                     stats:
 *                       type: object
 *                       properties:
 *                         nbSessions:
 *                           type: integer
 *                         totalTime:
 *                           type: integer
 *                     level:
 *                       type: integer
 *                     subLevel:
 *                       type: integer
 *                     totalGame:
 *                       type: integer
 *                     photoUrl:
 *                       type: string
 *       400:
 *         description: Token manquant
 *       404:
 *         description: Utilisateur ou activité introuvable
 *       500:
 *         description: Erreur serveur
 */
module.exports = router;
