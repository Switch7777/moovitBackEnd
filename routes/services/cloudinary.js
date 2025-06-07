const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const User = require("../../models/users");
const checkBody = require("../../modules/checkBody");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ROUTE D'UPLOAD
router.post("/idphoto", async (req, res) => {
  try {
    if (!req.files || !req.files.photoFromFront || !req.body.token) {
      return res
        .status(400)
        .json({ result: false, error: "Fichier ou token manquant" });
    }

    const photo = req.files.photoFromFront;

    const uploadResult = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "mooveit/profil",
    });

    const updateRes = await User.updateOne(
      { token: req.body.token },
      { $set: { photoUrl: uploadResult.secure_url } }
    );

    if (updateRes.modifiedCount === 0) {
      return res.status(404).json({
        result: false,
        error: "Utilisateur non trouvé ou non modifié",
      });
    }

    return res.status(200).json({
      result: true,
      message: "Photo mise à jour",
      url: uploadResult.secure_url,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ result: false, error: "Erreur serveur", details: err.message });
  }
});

module.exports = router;
/**
 * @swagger
 * /api/services/idphoto:
 *   post:
 *     summary: Upload de la photo de profil et mise à jour de l'utilisateur
 *     tags: [Services]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - photoFromFront
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de l'utilisateur permettant l'identification
 *                 example: "xBn9TVSFhH_sudEq73B3IR39b_ozIWhA"
 *               photoFromFront:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (jpeg, png) à uploader vers Cloudinary
 *     responses:
 *       200:
 *         description: Photo uploadée et URL enregistrée avec succès dans le profil utilisateur
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
 *                   example: "Photo mise à jour"
 *                 url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/demo/image/upload/v123456789/photo.jpg"
 *       400:
 *         description: Requête invalide - fichier ou token manquant
 *       404:
 *         description: Utilisateur non trouvé ou non modifié
 *       500:
 *         description: Erreur serveur lors de l’upload ou de la mise à jour
 */

module.exports = router;
