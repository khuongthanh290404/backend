const express = require("express");
const { createOrder } = require("../controller/orderController.");
const { checkAuth } = require("../auth/checkout");
// const { checkAuth } = require("../auth/checkout");

const router = express.Router();
router.get("/create", checkAuth, createOrder);

module.exports = router;
