"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "paid",
          "completed",
          "expired",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      qrisUrl: {
        type: Sequelize.STRING,
      },
      qrisCode: {
        type: Sequelize.TEXT,
      },
      midtransOrderId: {
        type: Sequelize.STRING,
        unique: true,
      },
      midtransTransactionId: {
        type: Sequelize.STRING,
      },
      paymentExpiry: {
        type: Sequelize.DATE,
      },
      paidAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};
