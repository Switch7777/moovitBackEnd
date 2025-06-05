// doc/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API MOOVE IT",
      version: "1.0.0",
      description: "Documentation des routes de l'API",
    },
  },
  apis: ["./routes/**/*.js"], // <<< Vérifie bien ce chemin
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
