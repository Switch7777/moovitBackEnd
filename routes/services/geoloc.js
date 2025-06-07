// Importation des modules nécessaires
const express = require("express");
const router = express.Router();

// Route POST pour récupérer la ville et le pays depuis des coordonnées GPS
router.post("/", (req, res) => {
  const { lat, lon } = req.body;

  // Vérifie que les coordonnées sont bien présentes
  if (!lat || !lon) {
    return res
      .status(400)
      .json({ result: false, error: "Coordonnées manquantes" });
  }

  // Construction de l’URL pour l’API Nominatim
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  // Appel à l'API Nominatim avec en-tête obligatoire
  fetch(url, {
    headers: {
      "User-Agent": "mooveit-backend",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const address = data.address || {};
      const city = address.city || address.town || address.village || null;
      const country = address.country || null;

      // Vérifie que la ville et le pays ont bien été trouvés
      if (!city || !country) {
        return res.status(404).json({
          result: false,
          error: "Ville ou pays non trouvé",
        });
      }

      // Réponse avec les données géographiques
      res.status(200).json({
        result: true,
        city,
        country,
      });
    })
    .catch(() => {
      res
        .status(500)
        .json({ result: false, error: "Erreur de l'API Nominatim" });
    });
});

///////////////////////////////////////////////////////////////////////////////
// Swagger Documentation - POST /api/geoloc
///////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /api/geoloc:
 *   post:
 *     summary: Obtenir la ville et le pays à partir de coordonnées GPS
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lon
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 48.8566
 *               lon:
 *                 type: number
 *                 example: 2.3522
 *     responses:
 *       200:
 *         description: Ville et pays trouvés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 city:
 *                   type: string
 *                   example: Paris
 *                 country:
 *                   type: string
 *                   example: France
 *       400:
 *         description: Coordonnées GPS manquantes
 *       404:
 *         description: Ville ou pays non trouvés
 *       500:
 *         description: Erreur interne du serveur
 */

module.exports = router;
