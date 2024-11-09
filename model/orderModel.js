const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
  paymentStatus: { type: String, default: "not initialized" },
  shippingAddress: { type: mongoose.Schema.ObjectId, ref: "Address" },
  transactionId: { type: String, default: "" },
  status: { type: String, default: "pending" },
  itemArr: [itemSchema],
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Order", orderSchema);
