"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");   // ← Seguridad agregada

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

// 🛡️ CONTENT SECURITY POLICY (Requisito de FreeCodeCamp)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "style-src": ["'self'"],
      },
    },
  })
);

// Archivos estáticos
app.use("/public", express.static(process.cwd() + "/public"));

// CORS (FCC lo requiere abierto)
app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Página de inicio
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Rutas para tests FCC
fccTestingRoutes(app);

// Rutas API
apiRoutes(app);

// Middleware 404
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

// Iniciar servidor
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);

  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app;
