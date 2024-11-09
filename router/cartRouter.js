const express = require("express");
const {
  createCart,
  getCartUser,
  deleteProduct,
  updateQuantity,
  addShippingCart,
} = require("../controller/cartController");
const { checkAuth } = require("../auth/checkout");
const router = express.Router();
router.post("/create", checkAuth, createCart);
router.get("/user-cart", checkAuth, getCartUser);
router.delete("/delete/:id", checkAuth, deleteProduct);
router.put("/update-cart/:id", checkAuth, updateQuantity);
router.post("/add-address", checkAuth, addShippingCart);
module.exports = router;
