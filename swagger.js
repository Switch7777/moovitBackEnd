// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Mooveit",
      version: "1.0.0",
      description: "Documentation automatique de l’API Mooveit",
    },
  },
  apis: ["./docs/swagger-docs.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
