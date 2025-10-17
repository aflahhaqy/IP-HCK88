const {
  CustomerProfile,
  StaffProfile,
  User,
  Product,
  Inventory,
} = require("../models");
const {
  calculateDistance,
  validateCoordinates,
} = require("../helpers/geolocation");

module.exports = class CustomerController {
  static async updateLocation(req, res, next) {
    try {
      const { lat, lng } = req.body;

      if (!validateCoordinates(parseFloat(lat), parseFloat(lng))) {
        return res.status(400).json({
          error:
            "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180",
        });
      }

      let customerProfile = await CustomerProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!customerProfile) {
        customerProfile = await CustomerProfile.create({
          userId: req.user.id,
          locationLat: parseFloat(lat),
          locationLng: parseFloat(lng),
        });
      } else {
        await customerProfile.update({
          locationLat: parseFloat(lat),
          locationLng: parseFloat(lng),
        });
      }

      res.status(200).json({
        message: "Location updated successfully",
        data: customerProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findNearestSeller(req, res, next) {
    try {
      const customerProfile = await CustomerProfile.findOne({
        where: { userId: req.user.id },
      });

      if (
        !customerProfile ||
        !customerProfile.locationLat ||
        !customerProfile.locationLng
      ) {
        return res.status(400).json({
          error:
            "Customer location not set. Please update your location first.",
        });
      }

      const activeStaff = await StaffProfile.findAll({
        where: { isActive: true },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (activeStaff.length === 0) {
        return res.status(404).json({
          message: "No active sellers found",
          data: [],
        });
      }
      const staffWithDistance = activeStaff
        .filter((staff) => staff.locationLat && staff.locationLng)
        .map((staff) => {
          const distance = calculateDistance(
            customerProfile.locationLat,
            customerProfile.locationLng,
            staff.locationLat,
            staff.locationLng
          );

          return {
            staffId: staff.userId,
            staffName: staff.User?.name || "Unknown",
            staffEmail: staff.User?.email || "",
            locationLat: staff.locationLat,
            locationLng: staff.locationLng,
            distance: parseFloat(distance.toFixed(2)), 
            isActive: staff.isActive,
          };
        })
        .sort((a, b) => a.distance - b.distance); 

      res.status(200).json({
        message: "Nearest sellers found",
        customerLocation: {
          lat: customerProfile.locationLat,
          lng: customerProfile.locationLng,
        },
        data: staffWithDistance,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSellerInventory(req, res, next) {
    try {
      const { staffId } = req.params;
      const staffProfile = await StaffProfile.findOne({
        where: { userId: staffId },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (!staffProfile) {
        return res.status(404).json({
          error: "Staff not found",
        });
      }
      const inventory = await Inventory.findAll({
        where: { staffId: staffId },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "description", "price", "imageUrl"],
          },
        ],
      });

      const formattedInventory = inventory.map((item) => ({
        productId: item.productId,
        productName: item.Product?.name,
        description: item.Product?.description,
        price: item.Product?.price,
        imageUrl: item.Product?.imageUrl,
        availableStock: item.Stock,
      }));

      res.status(200).json({
        message: "Seller inventory retrieved successfully",
        seller: {
          staffId: staffProfile.userId,
          staffName: staffProfile.User?.name,
          isActive: staffProfile.isActive,
          location: {
            lat: staffProfile.locationLat,
            lng: staffProfile.locationLng,
          },
        },
        inventory: formattedInventory,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllProducts(req, res, next) {
    try {
      const products = await Product.findAll({
        order: [["name", "ASC"]],
      });

      res.status(200).json({
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
};
