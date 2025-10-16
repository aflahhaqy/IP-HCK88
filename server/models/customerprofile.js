"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CustomerProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CustomerProfile.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  CustomerProfile.init(
    {
      userId: DataTypes.INTEGER,
      locationLat: DataTypes.FLOAT,
      locationLng: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "CustomerProfile",
    }
  );
  return CustomerProfile;
};
