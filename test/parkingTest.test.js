const request = require("supertest");
const chai = require("chai");
const app = require("../app");
const { expect } = chai;
const UserCred = require('../src/models/userCredentials');
const User = require('../src/models/Registeruser');
const ParkingSpot = require('../src/models/parkingModel');

const BASE = "/api/parking-spots"; // Updated to match your actual API endpoint
let userToken;
let userId;
let adminToken;
let testParkingId;

describe("Parking Routes", function() {
  before(async function() {
    try {
      // Clean up test users if they exist
      await UserCred.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
      await User.deleteMany({ email: { $in: ['testuser@example.com', 'testadmin@example.com'] }});
      await ParkingSpot.deleteMany({});

      // Register test user
      const userRegResponse = await request(app)
        .post("/api/register")
        .send({
          email: "testuser@example.com",
          firstName: "Test",
          lastName: "User",
          password: "Test@123",
          confirmpassword: "Test@123",
          phone: "1234567890"
        });
      expect(userRegResponse.status).to.equal(201);

      // Register test admin
      const adminRegResponse = await request(app)
        .post("/api/register/admin")
        .send({
          email: "testadmin@example.com",
          firstName: "Test",
          lastName: "Admin",
          password: "Admin@123",
          confirmpassword: "Admin@123",
          phone: "9876543210"
        });
      expect(adminRegResponse.status).to.equal(201);

      // Login as regular user
      const userLoginRes = await request(app)
        .post("/api/login")
        .send({
          email: "testuser@example.com",
          password: "Test@123"
        });
      expect(userLoginRes.status).to.equal(200);
      userToken = userLoginRes.body.token;
      userId = userLoginRes.body.userId;
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
      expect(adminLoginRes.status).to.equal(200);
      adminToken = adminLoginRes.body.token;
      if (!adminToken) {
        throw new Error("Failed to get admin authentication token");
      }
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });


  after(async () => {
    try {
      // Clean up test users
      await UserCred.deleteMany({ 
        email: { $in: ['testuser@example.com', 'testadmin@example.com'] }
      });
      await User.deleteMany({ 
        email: { $in: ['testuser@example.com', 'testadmin@example.com'] }
      });
      
      // Clean up test parking spots
      await ParkingSpot.deleteMany({ 
        slotName: { $in: ["C01", "D01", "E01", "F01"] }
      });
      
      console.log('✓ Test cleanup completed successfully');
    } catch (error) {
      console.error('Error during test cleanup:', error);
      throw error; // Re-throw to fail the test suite if cleanup fails
    }
  });

  // Since the parking spots CRUD operations below typically require admin rights,
  // we will ensure the token is attached to those requests.

  describe("GET /", () => {
    it("should get all parking spots", async () => {
      try {
        const res = await request(app)
          .get(`${BASE}`)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('data');
        expect(Array.isArray(res.body.data)).to.be.true;
        
        if (res.body.data.length > 0) {
          const spot = res.body.data[0];
          expect(spot).to.have.property('slotName');
          expect(spot).to.have.property('vehicleType');
          expect(spot).to.have.property('status');
          expect(['available', 'occupied', 'reserved']).to.include(spot.status);
          expect(['2W', '4W']).to.include(spot.vehicleType);
        }
      } catch (error) {
        console.error('Error in get all parking spots test:', error);
        throw error;
      }
    });

    it("should get a specific parking spot by ID", async () => {
      try {
        // First, create a parking spot to ensure it exists
        const createRes = await request(app)
          .post(`${BASE}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            slotName: "C01",
            vehicleType: "2W",
            status: "available"
          });
        expect(createRes.status).to.equal(201);
        expect(createRes.body).to.have.property("status", "success");
        expect(createRes.body).to.have.property("data");
        
        const spotId = createRes.body.data.slotName;
        testParkingId = spotId; // Save for other tests
        
        // Now, get the parking spot by ID
        const res = await request(app)
          .get(`${BASE}/${spotId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).to.equal(200);
        expect(res.body.data).to.have.property("slotName", spotId);
        expect(res.body.data).to.have.property("vehicleType", "2W");
        expect(res.body.data).to.have.property("status", "available");
      } catch (error) {
        console.error('Error in get specific parking spot test:', error);
        throw error;
      }
    });
  });

  describe("POST /", () => {
    it("should add a new parking spot (Admin Required)", async () => {
      try {
        const res = await request(app)
          .post(`${BASE}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            slotName: "D01",
            vehicleType: "4W",
            status: "available"
          });
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("status", "success");
        expect(res.body.data).to.have.property("slotName", "D01");
        expect(res.body.data).to.have.property("vehicleType", "4W");
        expect(res.body.data).to.have.property("status", "available");
      } catch (error) {
        console.error('Error in add parking spot test:', error);
        throw error;
      }
    });

  });

  describe("PUT /:id", () => {
    it("should update parking spot status (Admin Required)", async () => {
      try {
        if (!testParkingId) {
          throw new Error("Test parking ID not set");
        }

        const res = await request(app)
          .put(`${BASE}/${testParkingId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            status: "occupied"
          });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("status", "success");
        expect(res.body.data).to.have.property("status", "occupied");
      } catch (error) {
        console.error('Error in update parking spot test:', error);
        throw error;
      }
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a parking spot (Admin Required)", async () => {
      try {
        // Create a parking spot to delete
        const createRes = await request(app)
          .post(`${BASE}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            slotName: "F01",
            vehicleType: "4W",
            status: "available"
          });
        expect(createRes.status).to.equal(201);
        expect(createRes.body).to.have.property("status", "success");
        const spotId = createRes.body.data.slotName;

        // Delete the parking spot
        const res = await request(app)
          .delete(`${BASE}/${spotId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).to.equal(204);
        
        // Verify the spot was deleted
        const checkRes = await request(app)
          .get(`${BASE}/${spotId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(checkRes.status).to.equal(404);
      } catch (error) {
        console.error('Error in delete parking spot test:', error);
        throw error;
      }
    });
  });
});