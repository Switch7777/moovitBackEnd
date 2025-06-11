const express = require("express");
const router = express.Router();
require("../../models/connection");
const OnBoarding = require("../../models/onBoarding");

// Envoie du Onboarding dans le front

router.get("/", (req, res) => {
  OnBoarding.find()
    .then((questions) => {
      res.status(200).json({ result: true, data: questions });
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: "Erreur serveur" });
    });
});

/**
 * @swagger
 * /api/onboarding:
 *   get:
 *     summary: Récupère toutes les questions d’onboarding
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Questions d’onboarding récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: checkBox
 *                       required:
 *                         type: boolean
 *                         example: true
 *                       mainQuestion:
 *                         type: string
 *                         example: Peux-tu nous en dire plus sur toi ?
 *                       secondaryQuestion:
 *                         type: string
 *                         example: Ton genre ?
 *                       tertiary:
 *                         type: string
 *                         example: facultative
 *                       data:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             title:
 *                               type: string
 *                               example: Nom d'utilisateur
 *                             desc:
 *                               type: string
 *                               example: Entrez votre username
 *                             answer:
 *                               type: string
 *                               example: Masculin
 *                             src:
 *                               type: string
 *                               example: https://example.com/image.png
 *                             name:
 *                               type: string
 *                               example: gender
 *                             fieldType:
 *                               type: string
 *                               example: string
 *                             useGeolocation:
 *                               type: boolean
 *                               example: true
 *                             range:
 *                               type: array
 *                               items:
 *                                 type: number
 *       500:
 *         description: Erreur interne du serveur
 */

module.exports = router;
