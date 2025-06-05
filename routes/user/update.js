var express = require("express");
var router = express.Router();
require("../../models/connection"); //import de la connection string
const User = require("../../models/users"); //import du schema user
const Activity = require("../../models/activities"); //import du schema activity
const Medal = require("../../models/medals"); //import du schema activity
const { checkBody } = require("../../modules/checkBody"); //import de la fonction checkBody qui verifie que tout le champs soit ni null ni une string vide
const bcrypt = require("bcrypt");
///////////////////////////////////////////////////////////////////////////////
//        Update LEVEL a chaque passage de niveau
///////////////////////////////////////////////////////////////////////////////
router.post("/level", (req, res) => {
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
    }

    const nbrsublevel = level.subLevels.length;

    const currentSubLevel = Number(req.body.subLevel);
    const currentLevel = Number(req.body.level);

    let nextSubLevel;
    let nextLevel;

    if (currentSubLevel === nbrsublevel) {
      nextLevel = currentLevel + 1;
      nextSubLevel = 1;
    } else {
      nextLevel = currentLevel;
      nextSubLevel = currentSubLevel + 1;
    }

    User.updateOne(
      { token: req.body.token },
      {
        $set: {
          currentLevelID: nextLevel,
          currentSubLevelID: nextSubLevel,
        },
        $inc: {
          "stats.nbSessions": 1,
          "stats.totalTime": subLevel.timing,
          xp: subLevel.xp,
        },
      }
    ).then((modifiedUser) => {
      if (modifiedUser.modifiedCount > 0) {
        res.status(200).json({
          result: true,
          currentLevelID: nextLevel,
          currentSubLevelID: nextSubLevel,
        });
      } else {
        res
          .status(400)
          .json({ result: false, error: "Utilisateur non mis à jour" });
      }
    });
  });
});

///////////////////////////////////////////////////////////////////////////////
//        Suppresion du compte
///////////////////////////////////////////////////////////////////////////////
router.delete("/deleteaccount", (req, res) => {
  if (!checkBody(req.body, ["token", "password"])) {
    res.status(400).json({
      result: false,
      error: "mot de passe manquant",
    });
    return;
  }

  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      res.status(404).json({
        result: false,
        error: "Utilisateur introuvable",
      });
      return;
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(401).json({
        result: false,
        error: "Mot de passe incorrect",
      });
      return;
    }

    // Suppression de l'utilisateur
    User.deleteOne({ token: req.body.token })
      .then(() => {
        res.status(200).json({ result: true, message: "Compte supprimé" });
      })
      .catch((err) => {
        res.status(500).json({
          result: false,
          error: "Erreur lors de la suppression du compte",
        });
      });
  });
});

/**
 * @swagger
 * /api/user/update/level:
 *   post:
 *     summary: Met à jour le niveau/sous-niveau/xp/session d’un utilisateur après une session
 *     tags: [Update]
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
 *                 example: 1
 *     responses:
 *       200:
 *         description: Niveau mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 currentLevelID:
 *                   type: integer
 *                 currentSubLevelID:
 *                   type: integer
 *       400:
 *         description: Erreur de validation ou utilisateur non mis à jour
 *       404:
 *         description: Activité, niveau ou sous-niveau introuvable
 */

/**
 * @swagger
 * /api/user/update/idphoto:
 *   post:
 *     summary: Met à jour la photo de profil d’un utilisateur
 *     tags: [Update]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - photoUrl
 *             properties:
 *               token:
 *                 type: string
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://res.cloudinary.com/demo/image/upload/v1717000000/sample.jpg
 *     responses:
 *       200:
 *         description: Photo mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Champs manquants dans la requête
 *       404:
 *         description: Utilisateur introuvable ou aucune modification apportée
 *       500:
 *         description: Erreur serveur lors de la mise à jour
 */

/**
 * @swagger
 * /api/user/update/deleteaccount:
 *   delete:
 *     summary: Supprime le compte utilisateur
 *     tags: [Update]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token d’authentification de l’utilisateur
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l’utilisateur
 *                 example: azerty123
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Compte supprimé
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur lors de la suppression
 */
module.exports = router;
