const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");

// Midtrans webhook (no authentication - called by Midtrans)
router.post("/payment/notification", PaymentController.handleNotification);

// Manual check payment status (for testing/debugging)
router.get("/payment/status/:orderId", PaymentController.checkPaymentStatus);

module.exports = router;
