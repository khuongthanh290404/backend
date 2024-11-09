const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
module.exports = {
  createCart: async (req, res) => {
    try {
      // Lấy thông tin người dùng từ request
      const userDetails = req.user;

      // Kiểm tra xem người dùng đã có giỏ hàng chưa
      let userCart = await Cart.findOne({ user: userDetails.id });

      if (userCart) {
        // Nếu người dùng đã có giỏ hàng, lấy danh sách các sản phẩm hiện có trong giỏ hàng
        let cartItems = userCart.cartItemArr;

        // Kiểm tra sản phẩm có tồn tại trong giỏ hàng không
        const existingProduct = cartItems.find(
          (item) => item.product == req.body.productId
        );

        if (existingProduct) {
          // Nếu sản phẩm đã có trong giỏ, tăng số lượng lên 1
          existingProduct.quantity += 1;
        } else {
          // Nếu sản phẩm chưa có trong giỏ, thêm sản phẩm vào giỏ với số lượng là 1
          cartItems = [
            ...cartItems,
            { product: req.body.productId, quantity: 1 },
          ];
        }

        // Tính tổng số lượng sản phẩm trong giỏ
        const totalItems = cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // Cập nhật giỏ hàng của người dùng với danh sách sản phẩm mới
        await Cart.updateOne(
          { user: userDetails.id },
          { cartItemArr: cartItems }
        );

        // Gửi phản hồi thành công kèm theo tổng số sản phẩm
        res.status(200).json({ success: true, message: "success", totalItems });
      } else {
        // Nếu người dùng chưa có giỏ hàng, tạo giỏ hàng mới
        const cartItems = [
          { product: req.body.productId, quantity: req.body.quantity || 1 },
        ];

        const newCart = new Cart({
          user: userDetails.id,
          cartItemArr: cartItems,
        });

        // Lưu giỏ hàng mới vào database
        await newCart.save();

        // Trả về phản hồi thành công với số lượng sản phẩm là 1
        res
          .status(200)
          .json({ success: true, message: "success", totalItems: 1 });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "error" });
    }
  },
  getCartUser: async (req, res) => {
    try {
      const userCart = await Cart.findOne({ user: req.user.id })
        .populate("cartItemArr.product")
        .populate("shippingAddress");
      res.status(200).json({ success: true, data: userCart });
    } catch (error) {
      console.error("Error fetching user cart:", error); // Log lỗi chi tiết
      res.status(500).json({ success: false, message: "error" });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      // Lấy itemId từ tham số đường dẫn của yêu cầu HTTP, đây là ID của sản phẩm cần xóa khỏi giỏ hàng
      const itemId = req.params.id;

      // Tìm giỏ hàng của người dùng hiện tại dựa vào ID người dùng (req.user.id)
      const userCart = await Cart.findOne({ user: req.user.id });

      // Kiểm tra nếu không tìm thấy giỏ hàng cho người dùng này, trả về lỗi 404
      if (!userCart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      // Lấy mảng các sản phẩm trong giỏ hàng
      const cartItemArr = userCart.cartItemArr;

      // Lưu độ dài ban đầu của mảng để kiểm tra sau này xem sản phẩm đã được xóa hay chưa
      const initialLength = cartItemArr.length;

      // Lọc mảng để loại bỏ sản phẩm có ID trùng với itemId, gán lại vào userCart.cartItemArr
      userCart.cartItemArr = cartItemArr.filter(
        (item) => item.product != itemId
      );

      // Nếu độ dài của mảng không thay đổi, có nghĩa là sản phẩm không tồn tại trong giỏ hàng
      if (userCart.cartItemArr.length === initialLength) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found in cart" });
      }

      // Lưu giỏ hàng đã cập nhật vào cơ sở dữ liệu
      await userCart.save();

      // Trả về phản hồi thành công với thông báo rằng sản phẩm đã được xóa
      res.status(200).json({
        success: true,
        message: "Item removed successfully",
        updateCart,
        totalItems,
      });
    } catch (error) {
      // Ghi lỗi ra console và trả về phản hồi lỗi 500 nếu có lỗi xảy ra
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const { productId, amount } = req.body; // Lấy productId và số lượng cần thay đổi từ yêu cầu
      const userId = req.user.id;

      // Kiểm tra nếu productId hoặc amount không hợp lệ
      if (!productId || !amount) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid productId or amount" });
      }

      // Tìm giỏ hàng của người dùng
      const userCart = await Cart.findOne({ user: userId }).populate(
        "cartItemArr.product"
      );
      if (!userCart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      // Log cart items và productId để kiểm tra
      console.log("Cart Items:", userCart.cartItemArr);
      console.log("Product ID:", productId);

      // Tìm sản phẩm trong giỏ hàng
      const cartItem = userCart.cartItemArr.find(
        (item) =>
          item.product && item.product._id.toString() === productId.toString()
      );

      if (!cartItem) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found in cart" });
      }

      // Cập nhật số lượng sản phẩm
      cartItem.quantity += amount;

      // Nếu số lượng giảm xuống 0, xóa sản phẩm khỏi giỏ
      if (cartItem.quantity <= 0) {
        userCart.cartItemArr = userCart.cartItemArr.filter(
          (item) => item.product._id.toString() !== productId.toString()
        );
      }

      // Lưu thay đổi vào database
      await userCart.save();

      // Tính lại tổng số lượng sản phẩm trong giỏ
      const totalItems = userCart.cartItemArr.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Trả về phản hồi thành công với giỏ hàng đã cập nhật
      res.status(200).json({
        success: true,
        message: "Quantity updated successfully",
        cart: userCart,
        totalItems,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  addShippingCart: async (req, res) => {
    try {
      const newShipingAddress = new Address({ ...req.body });
      const saveAddress = await newShipingAddress.save();

      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { shippingAddress: saveAddress._id }
      );
      res.status(200).json({ success: true, message: "success" });
    } catch (error) {
      res.status(500).json({ success: false, message: "error" });
    }
  },
};
