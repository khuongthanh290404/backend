const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
module.exports = {
  createUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          phone: req.body.phone,
          password: hash,
        });

        await newUser.save();
        res
          .status(200)
          .send({ success: true, message: "User created successfully" });
      } else {
        res
          .status(400)
          .send({ success: false, message: "User already exists" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  },
  Login: async (request, response) => {
    const { email, password } = request.body;
    const exisUser = await User.findOne({ email: email });
    if (!exisUser) {
      return response.status(400).json({ message: "email ko ton tai" });
    }
    const validPassword = await bcrypt.compare(password, exisUser.password);
    if (!validPassword) {
      return response.status(400).json({ message: "mat khau ko đúng" });
    }
    const token = jwt.sign({ id: exisUser._id }, "123456", { expiresIn: "1h" });
    response.cookie("token", token, { httpOnly: true });
    exisUser.password = undefined;
    response
      .status(200)
      .json({ message: "đăng nhập thành công", user: exisUser, token });
  },
};
