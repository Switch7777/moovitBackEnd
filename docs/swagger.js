// doc/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API MOOVE IT",
      version: "1.0.0",
      description: "Documentation des routes de l'API",
    },
  },
  apis: [path.join(__dirname, "../routes/**/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
