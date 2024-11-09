const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: Number, required: true },
  pin: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
});
module.exports = mongoose.model("Address", addressSchema);
