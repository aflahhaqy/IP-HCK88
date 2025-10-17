const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/customerController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

// Semua route customer memerlukan authentication dan role Customer
router.use(authentication);
router.use(authorize("Customer"));

// Customer location management
router.put("/customer/location", CustomerController.updateLocation);

// Find nearest sellers
router.get("/seller/nearest", CustomerController.findNearestSeller);

// View specific seller's inventory
router.get("/seller/:staffId/inventory", CustomerController.getSellerInventory);

// Get all products (master coffee list)
router.get("/products", CustomerController.getAllProducts);

module.exports = router;
