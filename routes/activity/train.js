var express = require("express");
var router = express.Router();
require("../../models/connection");
const User = require("../../models/users");
const Train = require("../../models/train");
const { checkBody } = require("../../modules/checkBody");

// Route POST /getdataact - envoie une activité d'échauffement aléatoire
router.post("/getdataact", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
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

    Train.find().then((activityData) => {
      if (!activityData || activityData.length === 0) {
        res.status(404).json({ result: false, error: "Activité introuvable" });
        return;
      }

      const randomIndex = Math.floor(Math.random() * activityData.length); // genaration d'un random number entre la lenght et 0
      res.json({ result: true, activity: activityData[randomIndex] });
    });
  });
});

/**
 * @swagger
 * /api/train/getdataact:
 *   post:
 *     summary: Récupère une activité d’échauffement aléatoire
 *     tags: [Train]
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
 *                 description: Token de l'utilisateur
 *                 example: "abc123xyz"
 *     responses:
 *       200:
 *         description: Activité trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 activity:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Routine échauffement musculaire (5 min)"
 *                     duration:
 *                       type: number
 *                       example: 5
 *                     mediaUrl:
 *                       type: string
 *                       example: "https://www.youtube.com/watch?v=-OudjBZ4hh8"
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/..."
 *                     tipOfThePro:
 *                       type: string
 *                       example: "Échauffement tout en douceur"
 *                     xp:
 *                       type: number
 *                       example: 10
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Token invalide
 *       404:
 *         description: Aucune activité trouvée
 */

module.exports = router;
