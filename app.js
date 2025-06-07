require("dotenv").config();
require("./models/connection");

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express(); // ✅ définie AVANT les app.use !

// Middlewares
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload()); // ✅ déplacé ici

// Routes
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const apiRouter = require("./routes/api");
const authRouter = require("./routes/auth/auth");
const dashboardRouter = require("./routes/dashboard/dashboard");
const weatherRouter = require("./routes/services/weather");
const updateRouter = require("./routes/user/update");
const geolocRouter = require("./routes/services/geoloc");
const idphotoRouter = require("./routes/services/cloudinary");

app.use("/api/auth/auth", authRouter);
app.use("/api/dashboard/dashboard", dashboardRouter);
app.use("/api/services/weather", weatherRouter);
app.use("/api/user/update", updateRouter);
app.use("/api/services/geoloc", geolocRouter);
app.use("/api/services/cloudinary", idphotoRouter);
app.use("/api", apiRouter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
