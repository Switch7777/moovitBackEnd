var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ result: true, message: "Back-end actif " });
});
/**
 * @swagger
 * /api/start:
 *   get:
 *     summary: Vérifie que le serveur est actif
 *     description: Route de test ou de "réveil" utilisée pour éviter que le serveur ne se mette en veille. Répond avec un message simple.
 *     tags:
 *       - Ping
 *     responses:
 *       200:
 *         description: Serveur actif
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
 *                   example: Backend actif
 */
module.exports = router;
