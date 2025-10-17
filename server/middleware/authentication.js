const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

module.exports = async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return next({ name: "UnauthorizedError", message: "Token required" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const data = verifyToken(token);

    const user = await User.findByPk(data.id);

    if (!user) {
      return next({ name: "UnauthorizedError", message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next({ name: "UnauthorizedError", message: "Invalid token" });
    }
    next(error);
  }
};
