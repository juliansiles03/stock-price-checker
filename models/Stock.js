const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: Array, default: [] }   // guardamos IPs anonimizadas
});

module.exports = mongoose.model("Stock", stockSchema);
