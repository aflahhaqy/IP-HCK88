'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add constraints to Users table
    await queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Customer',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove constraints
    await queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });

    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  }
};
