const { User, Product } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

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

  static async googleLogin(req, res) {

    const { id_token } = req.body;
    console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("ID Token received:", id_token ? "Yes" : "No");

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log("User email from Google:", payload.email);

        const user = await User.findOne({ where: { email: payload.email } });
        if (!user) {
            const newUser = await User.create({
                email: payload.email,
                password: Math.random().toString(36).slice(-8)
            });
            const access_token = generateToken({ id: newUser.id, email: newUser.email });
            return res.status(201).json({ user: newUser, access_token });
        }
        const access_token = generateToken({ id: user.id, email: user.email });
        res.status(200).json({ user, access_token });
    } catch (error) {
        console.log("=== GOOGLE LOGIN ERROR ===");
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Full error:", error);
        console.log("========================");
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
      if (!user){
        return res.status(401).json({ error: "Invalid email or password" });
      }
        const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const access_token = generateToken(user);
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

