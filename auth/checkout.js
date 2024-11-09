const jwt = require("jsonwebtoken");

module.exports = {
  checkAuth: (request, response, next) => {
    if (request.headers.authorization) {
      const token = request.headers.authorization.split(" ")[1];
      jwt.verify(token, "123456", (error, data) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            return response.status(400).json({ message: "Token hết hạn" });
          } else if (error.name === "JsonWebTokenError") {
            return response.status(400).json({ message: "Token không hợp lệ" });
          }
        } else {
          request.user = data; // Gán thông tin người dùng vào request.user
          next();
        }
      });
    } else {
      return response
        .status(401)
        .json({ message: "Không có token được cung cấp" });
    }
  },
};
