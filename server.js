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

// 🛡️ 1) CSP COMPATIBLE CON FCC
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://cdn.freecodecamp.org"],
        "style-src": ["'self'"],
      },
    },
  })
);

// 2) Archivos estáticos
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/tests", express.static(process.cwd() + "/tests")); // Requerido por FCC

// 3) CORS (FCC lo requiere)
app.use(cors({ origin: "*" }));

// 4) Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ⭐ 5) Home — FORZAMOS NO CACHE PARA EVITAR 304
app.get("/", function (req, res) {
  res.set("Cache-Control", "no-store");  // ⭐ Clave para que FCC lea la CSP
  res.sendFile(process.cwd() + "/views/index.html");
});

// 6) Rutas FCC
fccTestingRoutes(app);

// 7) Rutas de la API
apiRoutes(app);

// 8) 404
app.use(function (req, res) {
  res.status(404).type("text").send("Not Found");
});

// ⭐ 9) Servidor (Render necesita host 0.0.0.0)
const listener = app.listen(
  process.env.PORT || 3000,
  "0.0.0.0",
  function () {
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
  }
);

module.exports = app;