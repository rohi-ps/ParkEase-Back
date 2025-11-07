const request = require("supertest");
const chai = require("chai");
const app = require("../app");
const { expect } = chai;
const UserCred = require('../src/models/userCredentials');
const User = require('../src/models/Registeruser');
const Rate = require('../src/models/rate');

const BASE = "/api/billing";
let userToken;
let adminToken;
let testInvoiceId;
let userId;

describe("Billing Routes", () => {
  before(async () => {
    // Clean up test data
    await UserCred.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
    await User.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
    await Rate.deleteMany({}); // Clean up all rates
    
    // Create test rates
    await Rate.create([
      {
        vehicleType: "2W",
        baseRate: 30,
        additionalHourRate: 20
      },
      {
        vehicleType: "4W",
        baseRate: 60,
        additionalHourRate: 40
      }
    ]);
    
    // Register test user
    await request(app)
      .post("/api/register")
      .send({
        email: "testuser@example.com",
        firstName: "Test",
        lastName: "User",
        password: "Test@123",
        confirmpassword: "Test@123",
        phone: "1234567890"
      });

    // Register test admin
    await request(app)
      .post("/api/register/admin")
      .send({
        email: "testadmin@example.com",
        firstName: "Test",
        lastName: "Admin",
        password: "Admin@123",
        confirmpassword: "Admin@123",
        phone: "9876543210"
      });

    // Set admin role manually
    // await UserCred.findOneAndUpdate(
    //   { email: "testadmin@example.com" },
    //   { role: "admin" }
    // );

    // Login as regular user
    const userLoginRes = await request(app)
      .post("/api/login")
      .send({
        email: "testuser@example.com",
        password: "Test@123"
      });
    userToken = userLoginRes.body.token;
    userId = userLoginRes.body.id;
    if (!userToken) {
      throw new Error("Failed to get user authentication token");
    }

    // Login as admin
    const adminLoginRes = await request(app)
      .post("/api/login")
      .send({
        email: "testadmin@example.com",
        password: "Admin@123"
      });
    adminToken = adminLoginRes.body.token;
    if (!adminToken) {
      throw new Error("Failed to get admin authentication token");
    }

    // Create test rate if it doesn't exist
    // const testRate = await Rate.findOne({ vehicleType: "4W" });
    // if (!testRate) {
    //   await Rate.create({
    //     vehicleType: "4W",
    //     baseRate: 60,
    //     additionalHourRate: 40
    //   });
    // }
  });

  describe("POST /invoices", () => {
    it("should fail with invalid check-in date format", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userId: userId,
          parkingSpotId: "A1",
          vehicleType: "4W",
          checkInTime: "invalid-date",
          checkOutTime: "2025-10-28T12:00:00Z",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });

    it("should fail when checkout time is before checkin time", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userId: userId,
          parkingSpotId: "A1",
          vehicleType: "4W",
          checkInTime: "2025-10-28T12:00:00Z",
          checkOutTime: "2025-10-28T10:00:00Z",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });

    it("should create invoice with valid data", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userId: userId,
          parkingSpotId: "A1",
          vehicleType: "4W",
          checkInTime: "2025-10-28T10:00:00Z",
          checkOutTime: "2025-10-28T12:00:00Z",
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.data).to.have.property("_id");
      testInvoiceId = res.body.data._id;
    });
  });

  describe("PUT /invoices/:id/payment", () => {
    it("should process payment with valid method", async () => {
      const res = await request(app)
        .put(`${BASE}/invoices/${testInvoiceId}/payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ paymentMethod: "credit_card" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.data).to.have.property("status", "paid");
    });

    it("should fail with invalid payment method", async () => {
      const res = await request(app)
        .put(`${BASE}/invoices/${testInvoiceId}/payment`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ paymentMethod: "invalid_method" });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });
  });

  describe("GET /invoices/:id", () => {
    it("should fetch invoice by ID", async () => {
      const res = await request(app)
        .get(`${BASE}/invoices/${testInvoiceId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.data).to.have.property("_id", testInvoiceId);
    });

    it("should return 404 for non-existent invoice", async () => {
      const invalidId = "507f1f77bcf86cd799439011"; // Valid ObjectId format but doesn't exist
      const res = await request(app)
        .get(`${BASE}/invoices/${invalidId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("status", "fail");
    });
  });

  describe("GET /payment-methods", () => {
    it("should return available payment methods for authenticated user", async () => {
      const res = await request(app)
        .get(`${BASE}/payment-methods`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data).to.include("credit_card");
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .get(`${BASE}/payment-methods`);

      expect(res.status).to.equal(401);
    });
  });

  describe("Admin Routes", () => {
    describe("GET /invoices (all)", () => {
      it("should allow admin to fetch all invoices", async () => {
        const res = await request(app)
          .get(`${BASE}/invoices`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("status", "success");
        expect(res.body).to.have.property("data").that.is.an("array");
      });

      it("should not allow regular user to fetch all invoices", async () => {
        const res = await request(app)
          .get(`${BASE}/invoices`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).to.equal(403);
      });
    });

    describe("Rate Management", () => {
      it("should allow admin to create new rate", async () => {
        const res = await request(app)
          .post(`${BASE}/rates`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            vehicleType: "2W",
            baseRate: 30,
            additionalHourRate: 20
          });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status", "success");
        expect(res.body.data).to.have.property("vehicleType", "2W");
      });

      it("should allow admin to update rate", async () => {
        const res = await request(app)
          .put(`${BASE}/rates/4W`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            baseRate: 70,
            additionalHourRate: 45
          });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("status", "success");
        expect(res.body.data.baseRate).to.equal(70);
      });

      it("should not allow regular user to create rates", async () => {
        const res = await request(app)
          .post(`${BASE}/rates`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            vehicleType: "3W",
            baseRate: 40,
            additionalHourRate: 25
          });

        expect(res.status).to.equal(403);
      });
    });
  });

  after(async () => {
    // Clean up test data
    await UserCred.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
    await User.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
    await Rate.deleteMany({ vehicleType: "2W" }); // Remove test rate
  });
});
