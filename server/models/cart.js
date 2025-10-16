"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.belongsTo(models.User, { foreignKey: "customerId", as: "Customer" });
      Cart.belongsTo(models.User, { foreignKey: "staffId", as: "Staff" });
      Cart.hasMany(models.CartItem, { foreignKey: "cartId" });
    }
  }
  Cart.init(
    {
      customerId: DataTypes.INTEGER,
      staffId: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Cart",
    }
  );
  return Cart;
};
