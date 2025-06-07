// 📄 Dépendances & modèles
var express = require("express");
var router = express.Router();

require("../../models/connection"); // Connexion à MongoDB
const User = require("../../models/users"); // Schéma utilisateur
const Activity = require("../../models/activities"); // Schéma d’activité (sport, niveaux, sous-niveaux)
const Medal = require("../../models/medals"); // Schéma des médailles
const { checkBody } = require("../../modules/checkBody"); // Vérifie les champs requis
const bcrypt = require("bcrypt"); // Decrypt du passWord

///////////////////////////////////////////////////////////////////////////////
// Mise à jour du niveau et du sous-niveau après une session d'activité
///////////////////////////////////////////////////////////////////////////////
router.post("/level", (req, res) => {
  if (!checkBody(req.body, ["token", "sport", "subLevel", "level"])) {
    res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
    return;
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

    // Calcul du prochain niveau/sous-niveau
    let nextSubLevel;
    let nextLevel;

    if (currentSubLevel === nbrsublevel) {
      nextLevel = currentLevel + 1;
      nextSubLevel = 1;
    } else {
      nextLevel = currentLevel;
      nextSubLevel = currentSubLevel + 1;
    }

    // Mise à jour de l'utilisateur avec les nouvelles stats
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
//  Suppression du compte utilisateur
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

    // Suppression définitive du compte
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

///////////////////////////////////////////////////////////////////////////////
//  Documentation Swagger pour ces endpoints
///////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * tags:
 *   name: Update
 *   description: Mise à jour des utilisateurs (niveau, suppression)
 */

/**
 * @swagger
 * /api/update/level:
 *   post:
 *     summary: Met à jour le niveau, sous-niveau, XP et temps de jeu d’un utilisateur
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
 *                   example: true
 *                 currentLevelID:
 *                   type: integer
 *                 currentSubLevelID:
 *                   type: integer
 *       400:
 *         description: Données invalides ou utilisateur non modifié
 *       404:
 *         description: Activité, niveau ou sous-niveau introuvable
 */

/**
 * @swagger
 * /api/update/deleteaccount:
 *   delete:
 *     summary: Supprime définitivement un compte utilisateur
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
 *                 description: Token d’authentification
 *                 example: xBn9TVSFhH_sudEq73B3IR39b_ozIWhA
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe actuel de l’utilisateur
 *                 example: azerty123
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */

module.exports = router;
