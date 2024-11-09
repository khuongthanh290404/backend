require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./router/userRouter");
const productRouter = require("./router/productRouter");
const cartRouter = require("./router/cartRouter");
const orderRouter = require("./router/orderRouter");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  exproseHeaders: "Authorization",
};
app.use(cors(corsOptions));
app.use(cookieParser());

try {
  mongoose.connect(`${process.env.MONGODB_URL}/duan2`);
  console.log("Connected to Mongo");
} catch (error) {
  console.log("error in mongodb");
}
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server listening on port${PORT}`);
});
