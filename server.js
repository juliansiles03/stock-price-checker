"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

// 🛡️ 1) CONTENT SECURITY POLICY — versión compatible con FCC
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

// 2) Archivos estáticos (FCC requiere /tests)
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/tests", express.static(process.cwd() + "/tests")); // ⭐ NECESARIO PARA FCC

// 3) CORS (FCC requiere acceso abierto)
app.use(cors({ origin: "*" }));

// 4) Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 5) Página de inicio
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// 6) Rutas de pruebas FCC
fccTestingRoutes(app);

// 7) Rutas de la API
apiRoutes(app);

// 8) Middleware 404
app.use(function (req, res) {
  res.status(404).type("text").send("Not Found");
});

// ⭐ 9) Iniciar servidor (Render requiere 0.0.0.0)
const listener = app.listen(process.env.PORT || 3000, "0.0.0.0", function () {
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
