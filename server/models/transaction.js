"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, {
        foreignKey: "staffId",
        as: "Staff",
      });
      Transaction.hasMany(models.TransactionItem, {
        foreignKey: "transactionId",
      });
    }
  }
  Transaction.init(
    {
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "paid",
          "completed",
          "expired",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      qrisUrl: DataTypes.STRING,
      qrisCode: DataTypes.TEXT,
      midtransOrderId: {
        type: DataTypes.STRING,
        unique: true,
      },
      midtransTransactionId: DataTypes.STRING,
      paymentExpiry: DataTypes.DATE,
      paidAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
