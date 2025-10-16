// Additional comprehensive tests to reach 90% coverage
// Append this content to app.test.js

/* ================= PAYMENT CONTROLLER - COMPREHENSIVE ERROR PATHS ================= */
describe("Payment Controller - Error Scenarios", () => {
  test("a. Payment webhook - capture dengan fraud accept", async () => {
    const { Transaction } = require("../models");
    const transaction = await Transaction.create({
      staffId: staffUserId,
      midtransOrderId: "ORDER-CAPTURE-TEST",
      totalAmount: 60000,
      status: "pending",
      qrisUrl: "https://test.com/qris",
    });

    const notification = {
      order_id: "ORDER-CAPTURE-TEST",
      transaction_status: "capture",
      fraud_status: "accept",
      transaction_time: new Date().toISOString(),
      signature_key: "mock-signature",
    };

    const response = await request(app)
      .post("/payment/notification")
      .send(notification);

    expect(response.status).toBe(200);
  });

  test("b. Payment webhook - deny status", async () => {
    const { Transaction } = require("../models");
    const transaction = await Transaction.create({
      staffId: staffUserId,
      midtransOrderId: "ORDER-DENY",
      totalAmount: 35000,
      status: "pending",
      qrisUrl: "https://test.com/qris",
    });

    const notification = {
      order_id: "ORDER-DENY",
      transaction_status: "deny",
      signature_key: "mock-signature",
    };

    const response = await request(app)
      .post("/payment/notification")
      .send(notification);

    expect(response.status).toBe(200);
  });

  test("c. Payment webhook - cancel status", async () => {
    const { Transaction } = require("../models");
    const transaction = await Transaction.create({
      staffId: staffUserId,
      midtransOrderId: "ORDER-CANCEL",
      totalAmount: 25000,
      status: "pending",
      qrisUrl: "https://test.com/qris",
    });

    const notification = {
      order_id: "ORDER-CANCEL",
      transaction_status: "cancel",
      signature_key: "mock-signature",
    };

    const response = await request(app)
      .post("/payment/notification")
      .send(notification);

    expect(response.status).toBe(200);
  });
});

/* ================= MIDDLEWARE - ERROR TESTS ================= */
describe("Middleware - Comprehensive Error Tests", () => {
  test("a. Authentication dengan user tidak ditemukan", async () => {
    const { generateToken } = require("../helpers/jwt");
    const fakeToken = generateToken({ id: 99999, role: "Staff" });

    const response = await request(app)
      .get("/staff/inventory")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(response.status).toBe(401);
  });

  test("b. Token JWT invalid format", async () => {
    const response = await request(app)
      .get("/staff/inventory")
      .set("Authorization", "Bearer not.valid.jwt");

    expect(response.status).toBe(401);
  });
});

/* ================= USER CONTROLLER - ERROR PATHS ================= */
describe("User Controller - Comprehensive Error Tests", () => {
  test("a. Register dengan password terlalu pendek", async () => {
    const response = await request(app).post("/register").send({
      name: "Short Pass",
      email: "shortpass@mail.com",
      password: "abc",
      role: "Customer",
    });

    expect(response.status).toBe(400);
  });

  test("b. Register dengan role invalid", async () => {
    const response = await request(app).post("/register").send({
      name: "Invalid Role",
      email: "invalidrole@mail.com",
      password: "test123",
      role: "SuperAdmin",
    });

    expect(response.status).toBe(400);
  });
});

/* ================= STAFF CONTROLLER - ERROR PATHS ================= */
describe("Staff Controller - Comprehensive Error Tests", () => {
  test("a. Update inventory dengan stock negatif", async () => {
    const { Product } = require("../models");
    const product = await Product.findOne();

    const response = await request(app)
      .put(`/staff/inventory/${product.id}`)
      .set("Authorization", `Bearer ${access_token_staff}`)
      .send({ stock: -10 });

    expect(response.status).toBe(400);
  });

  test("b. Create transaction dengan quantity 0", async () => {
    const { Product } = require("../models");
    const product = await Product.findOne();

    const response = await request(app)
      .post("/staff/transaction")
      .set("Authorization", `Bearer ${access_token_staff}`)
      .send({
        items: [{ productId: product.id, quantity: 0 }],
      });

    expect(response.status).toBe(400);
  });

  test("c. Create transaction tanpa productId", async () => {
    const response = await request(app)
      .post("/staff/transaction")
      .set("Authorization", `Bearer ${access_token_staff}`)
      .send({
        items: [{ quantity: 1 }],
      });

    expect(response.status).toBe(400);
  });
});

/* ================= INTEGRATION TESTS ================= */
describe("Integration Tests - Complete Workflows", () => {
  test("a. Complete staff workflow", async () => {
    const activate = await request(app)
      .put("/staff/status")
      .set("Authorization", `Bearer ${access_token_staff}`)
      .send({ isActive: true });
    expect(activate.status).toBe(200);

    const location = await request(app)
      .put("/staff/location")
      .set("Authorization", `Bearer ${access_token_staff}`)
      .send({ lat: -6.2, lng: 106.8 });
    expect(location.status).toBe(200);
  });

  test("b. Complete customer workflow", async () => {
    const location = await request(app)
      .put("/customer/location")
      .set("Authorization", `Bearer ${access_token_customer}`)
      .send({ lat: -6.2, lng: 106.8 });
    expect(location.status).toBe(200);

    const sellers = await request(app)
      .get("/seller/nearest")
      .set("Authorization", `Bearer ${access_token_customer}`);
    expect(sellers.status).toBe(200);
  });
});
