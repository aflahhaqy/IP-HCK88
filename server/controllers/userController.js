const { User, Product } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");

module.exports = class UserController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.create({ email, password });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = generateToken(user);
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async home(req, res) {
    try {
      let data = await Product.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

