const express = require("express");
const {
  createProduct,
  fetchAllProducts,
  fetSingleProduct,
  deleteProduct,
  updateProduct,
} = require("../controller/productController");
const router = express.Router();
router.post("/create", createProduct);
router.get("/all", fetchAllProducts);
router.get("/one/:id", fetSingleProduct);
router.delete("/one/:id", deleteProduct);
router.put("/update/:id", updateProduct);

module.exports = router;
