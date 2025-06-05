var express = require("express");
var router = express.Router();
require("../../models/connection"); //import de la connection string
const User = require("../../models/users"); //import du schema user
const Activity = require("../../models/activities"); //import du schema activity
const Medal = require("../../models/medals"); //import du schema activity
const { checkBody } = require("../../modules/checkBody"); //import de la fonction checkBody qui verifie que tout le champs soit ni null ni une string vide
const uid2 = require("uid2"); // module qui permet de genere une num de token
const bcrypt = require("bcrypt"); //module permet de haché le password

///////////////////////////////////////////////////////////////////////////////
//        SIGNUP  Creation d'un User
///////////////////////////////////////////////////////////////////////////////

router.post("/signup", (req, res) => {
  // -1ERE CONDITION CHECKBODY
  // Module CheckBody pour checkez si un element n'est pas vide , si checkbody est true ( false avec !) renvoie un mesage d'errer
  if (!checkBody(req.body, ["email", "password"])) {
    res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
    return; // FIN DU PROG
  }
  // -2EME CONDITION REGEX EMAIL
  // Regex de check pour le ReqBodyEmail , renvoie un boolean (([\w.-]=raccourci de [a-zA-Z0-9_.-])) @ et 2caractere apres le .
  const emailRegex = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(req.body.email)) {
    res.status(422).json({
      result: false,
      error: "Veuillez saisir un email valide",
    });
    return; // FIN DU PROG
  }
  // -3EME CONDITION EMAIL DEJA EXISTANT
  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      // Cryptage du password (hashé 10x)
      const hash = bcrypt.hashSync(req.body.password, 10);
      // Création d'un nouvel utilisateur
      const newUser = new User({
        email: req.body.email,
        password: hash,
        provToken: uid2(32), // Création d'un token PROVISOIRE de 32 caractères
        token: "",
      });

      newUser
        .save()
        .catch((error) => {
          res
            .status(500)
            .json({ error: "Une erreur est survenue pendant la sauvegarde" });
        })
        .then((newDoc) => {
          res.status(201).json({ result: true, provToken: newDoc.provToken }); // Utilisateur créé
        });
    } else {
      // EMAIL DÉJÀ EXISTANT EN BASE
      res.status(409).json({
        result: false,
        error: "Email déjà existant, veuillez vous connecter",
      });
    }
  });
});
///////////////////////////////////////////////////////////////////////////////
//        POSTSIGNUP  afin de metre a jour l'user si l'user n'a pas fait l'onboarding
///////////////////////////////////////////////////////////////////////////////
router.post("/postsignup", (req, res) => {
  if (
    !checkBody(req.body, [
      "provToken",
      "username",
      "name",
      "sportsPlayed",
      "level",
      "city",
    ])
  ) {
    res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
    return;
  }

  Activity.findOne({ title: req.body.sportsPlayed }).then((data) => {
    if (data) {
      let levelID;
      if (req.body.level === "Aucune expérience") levelID = 1;
      else if (req.body.level === "Débutant") levelID = 3;
      else if (req.body.level === "Intermédiaire") levelID = 5;
      else if (req.body.level === "Avancé") levelID = 7;
      else {
        res.status(422).json({ result: false, error: "Niveau non trouvé" });
        return;
      }

      User.updateOne(
        { provToken: req.body.provToken },
        {
          token: req.body.provToken,
          provToken: "",
          username: req.body.username,
          name: req.body.name,
          gender: req.body.gender,
          age: req.body.age,
          notificationActive: req.body.notificationActive,
          form: {
            reason: req.body.reason,
            dayTime: req.body.dayTime,
          },
          sportPlayed: [data._id],
          currentLevelID: levelID,
          height: req.body.height,
          weight: req.body.weight,
          city: req.body.city.toLowerCase(),
          stats: { nbSessions: 0, totalTime: 0 },
        }
      ).then((userData) => {
        if (userData.modifiedCount > 0) {
          res.status(200).json({ result: true, token: req.body.provToken });
        } else {
          res
            .status(400)
            .json({ result: false, error: "Utilisateur non mis à jour" });
        }
      });
    } else {
      res
        .status(404)
        .json({ result: false, error: "Activité erronée ou absente" });
    }
  });
});
///////////////////////////////////////////////////////////////////////////////
//        SIGNIN Connexion de l'user
///////////////////////////////////////////////////////////////////////////////
router.post("/signin", (req, res) => {
  // Vérification des champs requis
  if (!checkBody(req.body, ["email", "password"])) {
    return res.status(400).json({
      result: false,
      error: "Un ou plusieurs champs de saisie sont manquants",
    });
  }

  // Recherche de l'utilisateur par email
  User.findOne({ email: req.body.email })
    .then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        if (data.provToken && data.token === "") {
          return res.status(202).json({
            result: true,
            message: "Connexion ok , Onboarding en attente",
            provToken: data.provToken,
          });
        } else {
          return res.status(200).json({
            result: true,
            message: "Connexion OK , Onboarding OK",
            token: data.token,
          });
        }
      } else if (
        data &&
        !bcrypt.compareSync(req.body.password, data.password)
      ) {
        return res.status(401).json({
          result: false,
          error: "Email ou/et mot de passe erroné",
        });
      } else if (data === null) {
        // Utilisateur introuvable
        return res.status(404).json({
          result: false,
          error: "Utilisateur inexistant",
        });
      } else {
        return res.status(500).json({
          result: false,
          error: "Erreur lors de l'authentification",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        result: false,
        error: "Erreur lors de la connexion à la base de données",
      });
    });
});

/**
 * @swagger
 * /api/auth/auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un utilisateur avec une adresse email et un mot de passe. Retourne un token provisoire si la création est réussie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: azerty123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 provToken:
 *                   type: string
 *                   example: jZlK8HQxT6e7mRpWyWzVfuhzKfRrTjMg
 *       400:
 *         description: Champs manquants dans la requête
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
 *                   example: Un ou plusieurs champs de saisie sont manquants
 *       409:
 *         description: L'email existe déjà dans la base
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
 *                   example: Email déjà existant, veuillez vous connecter
 *       422:
 *         description: Format d'email invalide
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
 *                   example: Veuillez saisir un email valide
 *       500:
 *         description: Erreur lors de la sauvegarde en base
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Une erreur est survenue pendant la sauvegarde
 */

/**
 * @swagger
 * /api/auth/auth/postsignup:
 *   post:
 *     summary: Finaliser l'inscription d'un utilisateur
 *     description: Met à jour un utilisateur existant avec un token provisoire, en ajoutant les informations de profil et le sport choisi.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provToken
 *               - username
 *               - name
 *               - sportsPlayed
 *               - level
 *               - city
 *             properties:
 *               provToken:
 *                 type: string
 *                 example: kfksldjflzjdf093jfdsl
 *               username:
 *                 type: string
 *                 example: JohnDoe
 *               name:
 *                 type: string
 *                 example: John
 *               gender:
 *                 type: string
 *                 example: Masculin
 *               age:
 *                 type: integer
 *                 example: 25
 *               notificationActive:
 *                 type: boolean
 *                 example: true
 *               reason:
 *                 type: string
 *                 example: Pour me challenger
 *               dayTime:
 *                 type: string
 *                 example: 30 min/jour
 *               sportsPlayed:
 *                 type: string
 *                 example: Padel
 *               level:
 *                 type: string
 *                 enum: ["Aucune expérience", "Débutant", "Intermédiaire", "Avancé"]
 *               height:
 *                 type: integer
 *                 example: 180
 *               weight:
 *                 type: integer
 *                 example: 75
 *               city:
 *                 type: string
 *                 example: paris
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: abcdef123456token
 *       400:
 *         description: Données manquantes ou utilisateur non mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Utilisateur non mis à jour
 *       404:
 *         description: Activité non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Activité erronée ou absente
 *       422:
 *         description: Niveau non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Niveau non trouvé
 */

/**
 * @swagger
 * /api/auth/auth/signin:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur avec son email et son mot de passe. Retourne un token si l'onboarding est complété, ou un provToken sinon.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: Connexion réussie avec onboarding terminé
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
 *                   example: Connexion OK , Onboarding OK
 *                 token:
 *                   type: string
 *                   example: abc123token
 *       202:
 *         description: Connexion réussie, mais onboarding non terminé
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
 *                   example: Connexion ok , Onboarding en attente
 *                 provToken:
 *                   type: string
 *                   example: abc123provtoken
 *       400:
 *         description: Champs requis manquants
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
 *                   example: Un ou plusieurs champs de saisie sont manquants
 *       401:
 *         description: Mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Email ou/et mot de passe erroné
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Utilisateur inexistant
 *       500:
 *         description: Erreur serveur ou erreur d'authentification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: Erreur lors de l'authentification
 */

module.exports = router;
