const {
  Transaction,
  TransactionItem,
  Product,
  Inventory,
} = require("../models");
const {
  verifySignature,
  checkTransactionStatus,
} = require("../helpers/midtrans");

module.exports = class PaymentController {
  /**
   * POST /payment/notification
   * Midtrans webhook handler
   */
  static async handleNotification(req, res, next) {
    try {
      const notification = req.body;

      const isValid = verifySignature(notification);
      if (!isValid) {
        return res.status(403).json({
          error: "Invalid signature",
        });
      }

      const {
        order_id,
        transaction_status,
        fraud_status,
        transaction_time,
        settlement_time,
      } = notification;

      // Find transaction
      const transaction = await Transaction.findOne({
        where: { midtransOrderId: order_id },
        include: [
          {
            model: TransactionItem,
            include: [Product],
          },
        ],
      });

      if (!transaction) {
        return res.status(404).json({
          error: "Transaction not found",
        });
      }

      if (
        transaction_status === "capture" ||
        transaction_status === "settlement"
      ) {
        if (fraud_status === "accept" || !fraud_status) {
          await transaction.update({
            status: "paid",
            paidAt: new Date(settlement_time || transaction_time),
          });

          for (const item of transaction.TransactionItems) {
            const inventory = await Inventory.findOne({
              where: {
                staffId: transaction.staffId,
                productId: item.productId,
              },
            });

            if (inventory) {
              const newStock = inventory.Stock - item.quantity;
              await inventory.update({ Stock: Math.max(0, newStock) });
            }
          }

          await transaction.update({ status: "completed" });
        }
      } else if (transaction_status === "pending") {
        await transaction.update({ status: "pending" });
      } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel"
      ) {
        await transaction.update({ status: "cancelled" });
      } else if (transaction_status === "expire") {
        await transaction.update({ status: "expired" });
      }

      res.status(200).json({
        message: "Notification processed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkPaymentStatus(req, res, next) {
    try {
      const { orderId } = req.params;

      const transaction = await Transaction.findOne({
        where: { midtransOrderId: orderId },
      });

      if (!transaction) {
        return res.status(404).json({
          error: "Transaction not found",
        });
      }

      const midtransStatus = await checkTransactionStatus(orderId);

      res.status(200).json({
        message: "Payment status retrieved",
        localStatus: transaction.status,
        midtransStatus: midtransStatus,
      });
    } catch (error) {
      next(error);
    }
  }
};
