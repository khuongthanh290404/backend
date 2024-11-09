const monggose = require("mongoose");
const itemSchema = new monggose.Schema({
  product: { type: monggose.Schema.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
});

const cartSchema = new monggose.Schema({
  user: {
    type: monggose.Schema.ObjectId,
    ref: "User",
  },
  cartItemArr: [itemSchema],
  shippingAddress: { type: monggose.Schema.ObjectId, ref: "Address" },
  date: { type: Date, default: new Date() },
});
module.exports = monggose.model("Cart", cartSchema);
