"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.CustomerProfile, { foreignKey: "userId" });
      User.hasOne(models.StaffProfile, { foreignKey: "userId" });
      User.hasMany(models.Cart, {
        foreignKey: "customerId",
        as: "CustomerCarts",
      });
      User.hasMany(models.Cart, { foreignKey: "staffId", as: "StaffCarts" });
      User.hasMany(models.Transaction, {
        foreignKey: "staffId",
        as: "StaffTransactions",
      });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists",
        },
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          len: {
            args: [5, 100],
            msg: "Password must be at least 5 characters",
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Customer",
        validate: {
          isIn: {
            args: [["Customer", "Staff", "Admin"]],
            msg: "Role must be Customer, Staff, or Admin",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.beforeCreate((user) => {
    user.password = hashPassword(user.password);
  });
  return User;
};
