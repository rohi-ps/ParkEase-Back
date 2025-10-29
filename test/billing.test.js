const request = require("supertest");
const chai = require("chai");
const app = require("../app");
const { expect } = chai;

const BASE = "/api/v1/billing";
let authToken;
let testInvoiceId;

describe("Billing Routes", () => {
  before(async () => {
    // Register test user
    // try {
    //   await request(app).post("/api/register").send({
    //     email: "test@example.com",
    //     firstname: "Test",
    //     lastname: "User",
    //     password: "test123",
    //     confirmPassword: "test123",
    //   });
    // } catch (error) {
    //   // Ignore if user already exists
    // }

    // Login to get token
    const loginRes = await request(app).post("/api/login").send({
      email: "vuddangisaivenkatadurgaprasad@gmail.com",
      password: "Durgaprasad@123",
    });
    authToken = loginRes.body.token;
    if (!authToken) {
      throw new Error("Failed to get authentication token");
    }
  });

  describe("POST /invoices", () => {
    it("should fail with invalid check-in date format", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          parkingSpotId: "A1",
          vehicleType: "2W",
          checkInTime: "invalid-date",
          checkOutTime: "2025-10-28T12:00:00Z",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
      expect(res.body).to.have.property("errors");
    });

    it("should fail when checkout time is before checkin time", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          parkingSpotId: "A1",
          vehicleType: "2W",
          checkInTime: "2025-10-28T12:00:00Z",
          checkOutTime: "2025-10-28T10:00:00Z",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });

    it("should create invoice with valid data", async () => {
      const res = await request(app)
        .post(`${BASE}/invoices`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: "USER123", // Replace with actual user ID if needed
          parkingSpotId: "A1",
          vehicleType: "4W",
          checkInTime: "2025-10-28T10:00:00Z",
          checkOutTime: "2025-10-28T12:00:00Z",
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.data).to.have.property("invoiceId");
      testInvoiceId = res.body.data.invoiceId;
    });
  });

  describe("PUT /invoices/:id/payment", () => {
    it("should process payment with valid method", async () => {
      const res = await request(app)
        .put(`${BASE}/invoices/${testInvoiceId}/payment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ paymentMethod: "credit_card" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
    });

    it("should fail with invalid payment method", async () => {
      const res = await request(app)
        .put(`${BASE}/invoices/${testInvoiceId}/payment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ paymentMethod: "invalid_method" });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("status", "fail");
    });
  });

  describe("GET /invoices/:id", () => {
    it("should fetch invoice by ID", async () => {
      const res = await request(app)
        .get(`${BASE}/invoices/${testInvoiceId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body.data).to.have.property("invoiceId", testInvoiceId);
    });

    it("should return 404 for non-existent invoice", async () => {
      const res = await request(app)
        .get(`${BASE}/invoices/INV000000000`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("status", "fail");
    });
  });
});
