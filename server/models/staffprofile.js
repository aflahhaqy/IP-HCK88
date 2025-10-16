"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StaffProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StaffProfile.belongsTo(models.User, { foreignKey: "userId" });
      StaffProfile.hasMany(models.Inventory, { foreignKey: "staffId" });
    }
  }
  StaffProfile.init(
    {
      userId: DataTypes.INTEGER,
      locationLat: DataTypes.FLOAT,
      locationLng: DataTypes.FLOAT,
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "StaffProfile",
    }
  );
  return StaffProfile;
};
