const midtransClient = require("midtrans-client");
require("dotenv").config();

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Initialize Core API client (for QRIS)
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Generate QRIS payment
 * @param {Object} transactionDetails
 * @returns {Promise<Object>} QRIS data with URL and code
 */
async function generateQRIS(transactionDetails) {
  try {
    const {
      orderId,
      grossAmount,
      customerDetails = {},
      itemDetails = [],
    } = transactionDetails;

    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      qris: {
        acquirer: "gopay", // or 'airpay shopee'
      },
    };

    // Add customer details if provided
    if (customerDetails && Object.keys(customerDetails).length > 0) {
      parameter.customer_details = customerDetails;
    }

    // Add item details if provided
    if (itemDetails && itemDetails.length > 0) {
      parameter.item_details = itemDetails;
    }

    const chargeResponse = await core.charge(parameter);

    return {
      orderId: chargeResponse.order_id,
      transactionId: chargeResponse.transaction_id,
      qrisUrl: chargeResponse.actions ? chargeResponse.actions[0].url : null,
      qrisCode: chargeResponse.qr_string || null,
      status: chargeResponse.transaction_status,
      expiryTime: chargeResponse.expiry_time,
    };
  } catch (error) {
    throw new Error(`Failed to generate QRIS: ${error.message}`);
  }
}

/**
 * Check transaction status from Midtrans
 * @param {string} orderId
 * @returns {Promise<Object>} Transaction status
 */
async function checkTransactionStatus(orderId) {
  try {
    const statusResponse = await core.transaction.status(orderId);

    return {
      orderId: statusResponse.order_id,
      transactionId: statusResponse.transaction_id,
      transactionStatus: statusResponse.transaction_status,
      fraudStatus: statusResponse.fraud_status,
      paymentType: statusResponse.payment_type,
      transactionTime: statusResponse.transaction_time,
      settlementTime: statusResponse.settlement_time,
      grossAmount: statusResponse.gross_amount,
    };
  } catch (error) {
    throw new Error(`Failed to check transaction status: ${error.message}`);
  }
}

/**
 * Cancel transaction
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
async function cancelTransaction(orderId) {
  try {
    const cancelResponse = await core.transaction.cancel(orderId);
    return {
      orderId: cancelResponse.order_id,
      transactionStatus: cancelResponse.transaction_status,
      statusMessage: cancelResponse.status_message,
    };
  } catch (error) {
    throw new Error(`Failed to cancel transaction: ${error.message}`);
  }
}

/**
 * Verify Midtrans notification signature
 * @param {Object} notification - Notification data from Midtrans
 * @returns {boolean}
 */
function verifySignature(notification) {
  const crypto = require("crypto");
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const input = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(input).digest("hex");

  return hash === signature_key;
}

/**
 * Generate unique order ID
 * @param {number} staffId
 * @returns {string}
 */
function generateOrderId(staffId) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TRX-${staffId}-${timestamp}-${random}`;
}

module.exports = {
  generateQRIS,
  checkTransactionStatus,
  cancelTransaction,
  verifySignature,
  generateOrderId,
  snap,
  core,
};
