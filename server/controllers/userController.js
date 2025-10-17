const { User, Product } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

module.exports = class UserController {
  static async register(req, res) {
    try {
      const { email, password, name, role } = req.body;

      const validRoles = ["Customer", "Staff", "Admin"];
      const userRole = role || "Customer"; 

      if (!validRoles.includes(userRole)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
      }

      const user = await User.create({
        email,
        password,
        name, 
        role: userRole,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: error.errors.map((e) => e.message).join(", "),
        });
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async googleLogin(req, res) {
    const { id_token } = req.body;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const user = await User.findOne({ where: { email: payload.email } });
      if (!user) {
        const newUser = await User.create({
          email: payload.email,
          password: Math.random().toString(36).slice(-8),
          name: payload.name || payload.email.split("@")[0],
          role: "Customer",
        });
        const access_token = generateToken({
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        });
        return res.status(201).json({ user: newUser, access_token });
      }
      const access_token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(200).json({ user, access_token });
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
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const access_token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(200).json({ user, access_token });
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
