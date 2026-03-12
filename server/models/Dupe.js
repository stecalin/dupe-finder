const mongoose = require("mongoose");

const dupeSchema = new mongoose.Schema({
  query: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String },
  link: { type: String },
});

module.exports = mongoose.model("Dupe", dupeSchema);