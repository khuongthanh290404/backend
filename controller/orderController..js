const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");

module.exports = {
  createOrder: async (req, res) => {
    try {
      // Kiểm tra xem người dùng đã có đơn hàng nào trước đó chưa
      const existingOrder = await Order.findOne({ user: req.user.id });

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message:
            "Bạn đã có đơn hàng trước đó. Vui lòng hoàn tất đơn hàng trước khi tạo đơn hàng mới.",
        });
      }

      const userCart = await Cart.findOne({ user: req.user.id });

      if (userCart) {
        const newOrder = new Order({
          user: req.user.id,
          shippingAddress: userCart.shippingAddress,
          itemArr: userCart.cartItemArr,
        });

        const order = await newOrder.save();

        // Lấy thông tin chi tiết của địa chỉ và các sản phẩm trong đơn hàng
        const orderDetails = await Order.findById(order._id)
          .populate("itemArr.product")
          .populate("user")
          .populate({
            path: "shippingAddress",
            select: "name street city country username zip", // Lấy các trường thông tin của địa chỉ
          });

        res.status(200).json({ order: orderDetails });
      } else {
        res.status(404).json({ success: false, message: "Cart not found" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error processing order" });
    }
  },
};
