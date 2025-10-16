const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/staffController");
const authentication = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

// Semua route staff memerlukan authentication dan role Staff
router.use(authentication);
router.use(authorize("Staff"));

// Staff status management (activate/deactivate selling)
router.put("/status", StaffController.updateStatus);

// Staff location management
router.put("/location", StaffController.updateLocation);

// Staff inventory management
router.get("/inventory", StaffController.getOwnInventory);
router.put("/inventory/:productId", StaffController.updateInventoryStock);
router.delete("/inventory/:productId", StaffController.deleteInventoryItem);
router.post("/inventory/bulk", StaffController.bulkUpdateInventory);

// Transaction management (POS System)
router.post("/transaction", StaffController.createTransaction);
router.get("/transaction/:id/status", StaffController.getTransactionStatus);
router.put(
  "/transaction/:id/simulate-payment",
  StaffController.simulatePayment
); // Sandbox testing only
router.put("/transaction/:id/complete", StaffController.completeTransaction);

// Sales report
router.get("/sales/today", StaffController.getTodaySales);

// Staff carts management (legacy - might not be used)
router.get("/carts", StaffController.getStaffCarts);

module.exports = router;
