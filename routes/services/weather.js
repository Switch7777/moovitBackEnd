// Dépendances & setup
const express = require("express");
const router = express.Router();
const User = require("../../models/users"); // Schéma utilisateur

// Récupère la météo à partir de la ville enregistrée chez l'utilisateur
router.post("/", (req, res) => {
  const { token } = req.body;

  // Vérifie que le token est bien fourni
  if (!token) {
    return res.status(400).json({ result: false, error: "Token requis" });
  }

  // Recherche de l'utilisateur à partir du token
  User.findOne({ token }).then((user) => {
    if (!user?.city) {
      return res
        .status(404)
        .json({ result: false, error: "Ville non trouvée" });
    }

    // Préparation de la requête vers l'API OpenWeatherMap
    const city = encodeURIComponent(user.city);
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=fr`;

    // Appel à l'API météo
    fetch(url)
      .then((response) => response.json())
      .then((weatherData) => {
        if (weatherData.cod !== 200) {
          res.status(404).json({ result: false, error: "Météo introuvable" });
        } else {
          res.status(200).json({
            result: true,
            city: weatherData.name,
            weather: weatherData.weather[0].description,
            temperature: weatherData.main.temp,
            icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
          });
        }
      });
  });
});

///////////////////////////////////////////////////////////////////////////////
// Swagger Documentation - POST /api/services/weather
///////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /api/weather:
 *   post:
 *     summary: Récupère la météo actuelle selon la ville enregistrée de l'utilisateur
 *     description: "Requiert un token valide d'utilisateur. Utilise la ville enregistrée dans son profil pour interroger l'API OpenWeatherMap."
 *     tags: [Services]
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
 *                 description: Token d'authentification de l'utilisateur
 *                 example: "abc123xyz456"
 *     responses:
 *       200:
 *         description: "Données météo récupérées avec succès"
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
 *                   example: "Paris"
 *                 weather:
 *                   type: string
 *                   example: "ciel dégagé"
 *                 temperature:
 *                   type: number
 *                   example: 22.5
 *                 icon:
 *                   type: string
 *                   example: "https://openweathermap.org/img/wn/01d@2x.png"
 *       400:
 *         description: "Requête invalide (ex: token manquant)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token requis"
 *       404:
 *         description: "Ville ou météo introuvable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Ville non trouvée"
 */
module.exports = router;
