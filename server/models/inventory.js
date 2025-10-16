"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // staffId references Users.id (staff user), not StaffProfiles.id
      Inventory.belongsTo(models.User, { foreignKey: "staffId", as: "Staff" });
      Inventory.belongsTo(models.Product, { foreignKey: "productId" });
    }
  }
  Inventory.init(
    {
      staffId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      Stock: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Inventory",
    }
  );
  return Inventory;
};
