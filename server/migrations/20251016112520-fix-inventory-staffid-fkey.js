'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing FK constraint that points to StaffProfiles.id
    await queryInterface.removeConstraint('Inventories', 'Inventories_staffId_fkey');

    // Add new FK constraint pointing to Users.id instead
    await queryInterface.addConstraint('Inventories', {
      fields: ['staffId'],
      type: 'foreign key',
      name: 'Inventories_staffId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert: Drop new FK constraint
    await queryInterface.removeConstraint('Inventories', 'Inventories_staffId_fkey');

    // Restore old FK constraint pointing to StaffProfiles.id
    await queryInterface.addConstraint('Inventories', {
      fields: ['staffId'],
      type: 'foreign key',
      name: 'Inventories_staffId_fkey',
      references: {
        table: 'StaffProfiles',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
