var express = require("express");
var router = express.Router();
require("../../models/connection");
const User = require("../../models/users");
const Activity = require("../../models/activities");
const { checkBody } = require("../../modules/checkBody");

///////////////////////////////////////////////////////////////////////////////
//        Initialisation du Dashboard avec info de l'user
///////////////////////////////////////////////////////////////////////////////
router.post("/initdash", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
    res.status(400).json({
      result: false,
      error: "Token absent",
    });
    return;
  }

  User.findOne({ token: req.body.token })
    .populate("sportPlayed", "title image") // Populate des clé etrangere
    .then((userData) => {
      if (!userData) {
        res
          .status(404)
          .json({ result: false, error: "Utilisateur introuvable" });
        return;
      }

      const sport = userData.sportPlayed[0]; // Recuperation de l'index 0 du populate
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
          (level) => level.levelID === userData.currentLevelID // Recuperation de la data de activité en fonction du level de l'user
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
            totalGame++; // Calcul du temps total des activité (dynamique ok )
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
            sport: sport,
            height: userData.height,
            weight: userData.weight,
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
 * /api/dashboard/initdash:
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
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: switch
 *                     name:
 *                       type: string
 *                       example: Sami
 *                     xp:
 *                       type: integer
 *                       example: 23
 *                     stats:
 *                       type: object
 *                       properties:
 *                         nbSessions:
 *                           type: integer
 *                           example: 5
 *                         totalTime:
 *                           type: integer
 *                           example: 1230
 *                     level:
 *                       type: integer
 *                       example: 1
 *                     subLevel:
 *                       type: integer
 *                       example: 5
 *                     totalGame:
 *                       type: integer
 *                       example: 12
 *                     height:
 *                       type: integer
 *                       example: 170
 *                     weight:
 *                       type: integer
 *                       example: 70
 *                     photoUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/photo.png
 *                     sport:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6835b97db0e48279faa91460
 *                         title:
 *                           type: string
 *                           example: Padel
 *                         image:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/padel.png
 *       400:
 *         description: Token manquant
 *       404:
 *         description: Utilisateur ou activité introuvable
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/dashboard/initcarroussel:
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
 *                   example: true
 *                 carouselData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: Niveau 1
 *                       image:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/niveau1.png
 *       400:
 *         description: Token manquant
 *       500:
 *         description: Erreur serveur
 */

module.exports = router;
