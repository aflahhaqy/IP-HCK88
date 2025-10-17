'use strict';
const fs = require('fs').promises
const bcrypt = require('bcryptjs');
const { hashPassword } = require('../helpers/bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

   // Seed Products
   let data = JSON.parse(await fs.readFile('./products.json', 'utf-8')).map(el => {
      el.createdAt = new Date();
      el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert('Products', data);

    // Seed Staff User
    const hashedPassword = bcrypt.hashSync('staff123', 10);
    await queryInterface.bulkInsert('Users', [{
      name: 'Staff',
      email: 'staff@mail.com',
      password: hashPassword('staff'),
      role: 'Staff',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Get the staff user id
    const [staffUser] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'staff@mail.com';`
    );

    // Seed Staff Profile with location (example: Jakarta coordinates)
    await queryInterface.bulkInsert("StaffProfiles", [
      {
        userId: staffUser[0].id,
        locationLat: -6.176768,
        locationLng: 106.8138496,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

  },



  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('StaffProfiles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Products', null, {});
  }
};
