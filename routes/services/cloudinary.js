const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const User = require("../../models/users");
const checkBody = require("../../modules/checkBody");

router.use(fileUpload());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/idphoto", (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  if (!checkBody(req.body, ["token"])) {
    return res.status(400).json({
      result: false,
      error: "Token manquant",
    });
  }

  const photo = req.files.photoFromFront;
  const tempPath = `./tmp/${uniqid()}.jpg`;

  photo
    .mv(tempPath)
    .then(() => {
      return cloudinary.uploader.upload(tempPath, {
        folder: "mooveit/profil",
      });
    })
    .then((uploadResult) => {
      fs.unlinkSync(tempPath);

      return User.updateOne(
        { token: req.body.token },
        { $set: { photoUrl: uploadResult.secure_url } }
      ).then((updateRes) => {
        if (updateRes.modifiedCount === 0) {
          return res.status(404).json({
            result: false,
            error: "Utilisateur non trouvé ou non modifié",
          });
        }

        res.status(200).json({
          result: true,
          message: "Photo mise à jour",
          url: uploadResult.secure_url,
        });
      });
    })
    .catch((err) => {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      res.status(500).json({
        result: false,
        error: "Erreur lors de l’upload ou de la mise à jour",
        details: err.message,
      });
    });
});

/**
 * @swagger
 * /api/services/idphoto:
 *   post:
 *     summary: Upload et mise à jour de la photo de profil utilisateur
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
 *                 description: Token de l'utilisateur
 *                 example: "abc123token"
 *               photoFromFront:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image à uploader
 *     responses:
 *       200:
 *         description: Photo uploadée et enregistrée
 *       400:
 *         description: Données manquantes
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur lors de l’upload ou de la mise à jour
 */

module.exports = router;
