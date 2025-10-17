const {
  StaffProfile,
  Inventory,
  Product,
  Cart,
  CartItem,
  User,
  Transaction,
  TransactionItem,
} = require("../models");
const { validateCoordinates } = require("../helpers/geolocation");
const {
  generateQRIS,
  checkTransactionStatus,
  generateOrderId,
} = require("../helpers/midtrans");

module.exports = class StaffController {
  static async updateStatus(req, res, next) {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          error: "isActive must be a boolean value",
        });
      }

      let staffProfile = await StaffProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!staffProfile) {
        staffProfile = await StaffProfile.create({
          userId: req.user.id,
          isActive: isActive,
        });
      } else {
        await staffProfile.update({ isActive: isActive });
      }

      res.status(200).json({
        message: `Staff status ${
          isActive ? "activated" : "deactivated"
        } successfully`,
        data: staffProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req, res, next) {
    try {
      const { lat, lng } = req.body;

      if (!validateCoordinates(parseFloat(lat), parseFloat(lng))) {
        return res.status(400).json({
          error:
            "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180",
        });
      }

      let staffProfile = await StaffProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!staffProfile) {
        staffProfile = await StaffProfile.create({
          userId: req.user.id,
          locationLat: parseFloat(lat),
          locationLng: parseFloat(lng),
        });
      } else {
        await staffProfile.update({
          locationLat: parseFloat(lat),
          locationLng: parseFloat(lng),
        });
      }

      res.status(200).json({
        message: "Staff location updated successfully",
        data: staffProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOwnInventory(req, res, next) {
    try {
      const inventory = await Inventory.findAll({
        where: { staffId: req.user.id },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "description", "price", "imageUrl"],
          },
        ],
        order: [[Product, "name", "ASC"]],
      });

      const formattedInventory = inventory.map((item) => ({
        inventoryId: item.id,
        productId: item.productId,
        productName: item.Product?.name,
        description: item.Product?.description,
        price: item.Product?.price,
        imageUrl: item.Product?.imageUrl,
        availableStock: item.Stock,
      }));

      res.status(200).json({
        message: "Staff inventory retrieved successfully",
        staffId: req.user.id,
        data: formattedInventory,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInventoryStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { stock } = req.body;

      if (typeof stock !== "number" || stock < 0) {
        return res.status(400).json({
          error: "Stock must be a non-negative number",
        });
      }

      const staff = await User.findByPk(req.user.id);
      if (!staff) {
        return res.status(404).json({
          error: "Staff user not found",
        });
      }
      let staffProfile = await StaffProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!staffProfile) {
        staffProfile = await StaffProfile.create({
          userId: req.user.id,
          locationLat: null,
          locationLng: null,
          isActive: false,
        });
      }
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      let inventory = await Inventory.findOne({
        where: {
          staffId: req.user.id,
          productId: productId,
        },
      });

      if (!inventory) {
        inventory = await Inventory.create({
          staffId: req.user.id,
          productId: productId,
          Stock: stock,
        });
      } else {
        await inventory.update({ Stock: stock });
      }

      const updatedInventory = await Inventory.findByPk(inventory.id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "description", "price", "imageUrl"],
          },
        ],
      });

      res.status(200).json({
        message: "Inventory stock updated successfully",
        data: {
          inventoryId: updatedInventory.id,
          productId: updatedInventory.productId,
          productName: updatedInventory.Product?.name,
          availableStock: updatedInventory.Stock,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteInventoryItem(req, res, next) {
    try {
      const { productId } = req.params;

      const inventory = await Inventory.findOne({
        where: {
          staffId: req.user.id,
          productId: productId,
        },
        include: [
          {
            model: Product,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!inventory) {
        return res.status(404).json({
          error: "Product not found in your inventory",
        });
      }

      const productName = inventory.Product?.name;

      await inventory.destroy();

      res.status(200).json({
        message: `Product "${productName}" removed from inventory successfully`,
        data: {
          productId: parseInt(productId),
          productName: productName,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStaffCarts(req, res, next) {
    try {
      const { status } = req.query;

      const whereClause = {
        staffId: req.user.id,
      };

      if (status) {
        whereClause.status = status;
      }

      const carts = await Cart.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "Customer",
            attributes: ["id", "name", "email"],
          },
          {
            model: CartItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const formattedCarts = carts.map((cart) => {
        let totalAmount = 0;
        const items = cart.CartItems.map((item) => {
          const subtotal = item.quantity * item.Product.price;
          totalAmount += subtotal;
          return {
            productId: item.productId,
            productName: item.Product.name,
            quantity: item.quantity,
            price: item.Product.price,
            subtotal: subtotal,
          };
        });

        return {
          cartId: cart.id,
          customerId: cart.customerId,
          customerName: cart.Customer?.name,
          customerEmail: cart.Customer?.email,
          status: cart.status,
          totalAmount: totalAmount,
          itemCount: items.length,
          items: items,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        };
      });

      res.status(200).json({
        message: "Staff carts retrieved successfully",
        staffId: req.user.id,
        count: formattedCarts.length,
        data: formattedCarts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req, res, next) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "Items array is required and must not be empty",
        });
      }
      let totalAmount = 0;
      const transactionItems = [];
      const itemDetails = [];

      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({
            error: "Each item must have valid productId and quantity > 0",
          });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({
            error: `Product with ID ${productId} not found`,
          });
        }

        const inventory = await Inventory.findOne({
          where: {
            staffId: req.user.id,
            productId: productId,
          },
        });

        if (!inventory || inventory.Stock < quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}. Available: ${
              inventory ? inventory.Stock : 0
            }, Requested: ${quantity}`,
          });
        }

        const subtotal = product.price * quantity;
        totalAmount += subtotal;

        transactionItems.push({
          productId: product.id,
          quantity: quantity,
          priceAtPurchase: product.price,
          subtotal: subtotal,
        });

        itemDetails.push({
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          quantity: quantity,
        });
      }

      const orderId = generateOrderId(req.user.id);

      const transaction = await Transaction.create({
        staffId: req.user.id,
        totalAmount: totalAmount,
        status: "pending",
        midtransOrderId: orderId,
      });

      for (const item of transactionItems) {
        await TransactionItem.create({
          transactionId: transaction.id,
          ...item,
        });
      }

      try {
        const qrisData = await generateQRIS({
          orderId: orderId,
          grossAmount: totalAmount,
          itemDetails: itemDetails,
        });

        await transaction.update({
          qrisUrl: qrisData.qrisUrl,
          qrisCode: qrisData.qrisCode,
          midtransTransactionId: qrisData.transactionId,
          paymentExpiry: qrisData.expiryTime,
        });

        const completeTransaction = await Transaction.findByPk(transaction.id, {
          include: [
            {
              model: TransactionItem,
              include: [
                {
                  model: Product,
                  attributes: ["id", "name", "price", "imageUrl"],
                },
              ],
            },
          ],
        });

        res.status(201).json({
          message: "Transaction created and QRIS generated successfully",
          data: {
            transactionId: completeTransaction.id,
            orderId: completeTransaction.midtransOrderId,
            totalAmount: completeTransaction.totalAmount,
            status: completeTransaction.status,
            qrisUrl: completeTransaction.qrisUrl,
            qrisCode: completeTransaction.qrisCode,
            paymentExpiry: completeTransaction.paymentExpiry,
            items: completeTransaction.TransactionItems.map((item) => ({
              productId: item.productId,
              productName: item.Product.name,
              quantity: item.quantity,
              price: item.priceAtPurchase,
              subtotal: item.subtotal,
            })),
          },
        });
      } catch (midtransError) {
        await TransactionItem.destroy({
          where: { transactionId: transaction.id },
        });
        await transaction.destroy();

        throw new Error(`Failed to generate QRIS: ${midtransError.message}`);
      }
    } catch (error) {
      next(error);
    }
  }
  static async getTransactionStatus(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByPk(id, {
        include: [
          {
            model: TransactionItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      if (!transaction) {
        return res.status(404).json({
          error: "Transaction not found",
        });
      }

      if (transaction.staffId !== req.user.id) {
        return res.status(403).json({
          error: "You do not have permission to view this transaction",
        });
      }

      if (transaction.status === "pending" && transaction.midtransOrderId) {
        try {
          const midtransStatus = await checkTransactionStatus(
            transaction.midtransOrderId
          );

          if (
            midtransStatus.transactionStatus === "settlement" ||
            midtransStatus.transactionStatus === "capture"
          ) {
            await transaction.update({
              status: "paid",
              paidAt: new Date(
                midtransStatus.settlementTime || midtransStatus.transactionTime
              ),
            });
          } else if (midtransStatus.transactionStatus === "expire") {
            await transaction.update({ status: "expired" });
          } else if (midtransStatus.transactionStatus === "cancel") {
            await transaction.update({ status: "cancelled" });
          }

          await transaction.reload();
        } catch (midtransError) {}
      }

      res.status(200).json({
        message: "Transaction status retrieved successfully",
        data: {
          transactionId: transaction.id,
          orderId: transaction.midtransOrderId,
          staffId: transaction.staffId,
          totalAmount: transaction.totalAmount,
          status: transaction.status,
          paidAt: transaction.paidAt,
          createdAt: transaction.createdAt,
          items: transaction.TransactionItems.map((item) => ({
            productName: item.Product.name,
            quantity: item.quantity,
            price: item.priceAtPurchase,
            subtotal: item.subtotal,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByPk(id, {
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

      if (transaction.staffId !== req.user.id) {
        return res.status(403).json({
          error: "You do not have permission to complete this transaction",
        });
      }
      if (transaction.status === "completed") {
        return res.status(400).json({
          error: "Transaction already completed",
        });
      }

      if (transaction.status !== "paid") {
        return res.status(400).json({
          error:
            "Transaction must be paid before completing. Current status: " +
            transaction.status,
        });
      }

      for (const item of transaction.TransactionItems) {
        const inventory = await Inventory.findOne({
          where: {
            staffId: req.user.id,
            productId: item.productId,
          },
        });

        if (inventory) {
          const newStock = inventory.Stock - item.quantity;
          await inventory.update({ Stock: Math.max(0, newStock) });
        }
      }

      await transaction.update({ status: "completed" });

      res.status(200).json({
        message: "Transaction completed successfully and stock decremented",
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          totalAmount: transaction.totalAmount,
          paidAt: transaction.paidAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateInventory(req, res, next) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "Items array is required and must not be empty",
        });
      }

      let staffProfile = await StaffProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!staffProfile) {
        staffProfile = await StaffProfile.create({
          userId: req.user.id,
          locationLat: null,
          locationLng: null,
          isActive: false,
        });
      }

      const updatedInventory = [];

      for (const item of items) {
        const { productId, stock } = item;

        if (!productId || typeof stock !== "number" || stock < 0) {
          return res.status(400).json({
            error: "Each item must have valid productId and non-negative stock",
          });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({
            error: `Product with ID ${productId} not found`,
          });
        }

        let inventory = await Inventory.findOne({
          where: {
            staffId: req.user.id,
            productId: productId,
          },
        });

        if (!inventory) {
          inventory = await Inventory.create({
            staffId: req.user.id,
            productId: productId,
            Stock: stock,
          });
        } else {
          await inventory.update({ Stock: stock });
        }

        updatedInventory.push({
          productId: product.id,
          productName: product.name,
          stock: inventory.Stock,
        });
      }

      res.status(200).json({
        message: "Inventory updated successfully",
        count: updatedInventory.length,
        data: updatedInventory,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTodaySales(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactions = await Transaction.findAll({
        where: {
          staffId: req.user.id,
          createdAt: {
            [require("sequelize").Op.gte]: today,
          },
        },
        include: [
          {
            model: TransactionItem,
            include: [
              {
                model: Product,
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const totalTransactions = transactions.length;
      const completedTransactions = transactions.filter(
        (t) => t.status === "completed"
      );
      const paidTransactions = transactions.filter(
        (t) => t.status === "paid" || t.status === "completed"
      );

      const totalRevenue = completedTransactions.reduce(
        (sum, t) => sum + t.totalAmount,
        0
      );

      const productSales = {};
      completedTransactions.forEach((transaction) => {
        transaction.TransactionItems.forEach((item) => {
          const productName = item.Product.name;
          if (!productSales[productName]) {
            productSales[productName] = {
              productName: productName,
              quantitySold: 0,
              revenue: 0,
            };
          }
          productSales[productName].quantitySold += item.quantity;
          productSales[productName].revenue += item.subtotal;
        });
      });

      res.status(200).json({
        message: "Today's sales report retrieved successfully",
        date: today.toISOString().split("T")[0],
        summary: {
          totalTransactions: totalTransactions,
          completedTransactions: completedTransactions.length,
          paidTransactions: paidTransactions.length,
          pendingTransactions: transactions.filter(
            (t) => t.status === "pending"
          ).length,
          totalRevenue: totalRevenue,
        },
        productSales: Object.values(productSales),
        transactions: transactions.map((t) => ({
          transactionId: t.id,
          orderId: t.midtransOrderId,
          totalAmount: t.totalAmount,
          status: t.status,
          itemCount: t.TransactionItems.length,
          createdAt: t.createdAt,
          paidAt: t.paidAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async simulatePayment(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({
          error: "Transaction not found",
        });
      }

      if (transaction.staffId !== req.user.id) {
        return res.status(403).json({
          error: "You do not have permission to modify this transaction",
        });
      }

      if (transaction.status === "paid" || transaction.status === "completed") {
        return res.status(400).json({
          error: "Transaction already paid",
        });
      }

      await transaction.update({
        status: "paid",
        paidAt: new Date(),
      });

      res.status(200).json({
        message: "Payment simulated successfully. Transaction marked as paid.",
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          paidAt: transaction.paidAt,
          totalAmount: transaction.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
};
