const request = require("supertest");
const chai = require("chai");
const app = require("../app");
const { expect } = chai;

const BASE = "/api/v1/parking-spots"; 
let authToken;

describe("🚗 Parking Routes (CRUD Operations)", () => {
    // --- SETUP: Run ONCE before all tests ---
    before(async () => {
        // Login to get token
        const loginRes = await request(app).post("/api/login").send({
            email: "vuddangisaivenkatadurgaprasad@gmail.com",
            password: "Durgaprasad@123",
        });
        authToken = loginRes.body.token;

        if (!authToken) {
            throw new Error("Failed to get authentication token. Check login credentials.");
        }
        console.log("\n✅ Authentication Token Acquired.");
    });

    // --- TEST VARIABLES ---
    let testParkingId;
    // Data matched to validation schema based on previous debug
    const initialSpotData = {
        slotId: "B1",       
        vehicleType: "2W",  
        status: "available",
        location: "First Floor"
    };

    // 1. CREATE
    // --------------------------------------------------------------------------
    describe("POST /", () => {
        it("should create a new parking spot and save its ID", async () => {
            const res = await request(app)
                .post(`${BASE}/`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(initialSpotData);
        
            expect(res.status).to.equal(201); 
            expect(res.body).to.have.property("status", "success");
            
            // Extract the slot ID from the response data
            const createdSpot = res.body.data;
            expect(createdSpot).to.have.property("slotId", initialSpotData.slotId);
            
            // Use the slotId as our testParkingId since that's what the API uses
            testParkingId = createdSpot.slotId;
            expect(testParkingId).to.equal("B1", "The slotId should match what we sent");
        });
    });

    // 2. READ BY ID (Will run now that testParkingId is set)
    // --------------------------------------------------------------------------
    describe("GET /:id", () => {
        it("should get the parking spot by ID", async () => {
            if (!testParkingId) throw new Error("testParkingId is not set.");
            
            const res = await request(app)
                .get(`${BASE}/${testParkingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("status", "success");
            
            // Verify the response data matches our initial spot data
            const spotData = res.body.data;
            expect(spotData).to.have.property("slotId", initialSpotData.slotId);
            expect(spotData).to.have.property("vehicleType", initialSpotData.vehicleType);
            expect(spotData).to.have.property("status", "available");
        });
    });

    // 3. UPDATE (Will run now that testParkingId is set)
    // --------------------------------------------------------------------------
    describe("PUT /:id/status", () => {
        it("should update the status of the parking spot", async () => {
            if (!testParkingId) throw new Error("testParkingId is not set.");
            
            const res = await request(app)
                .put(`${BASE}/${testParkingId}/status`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    status: "occupied"
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("status", "success");
            expect(res.body.data).to.have.property("status", "occupied");
        });
    });
    
    // 4. READ ALL (This test is already passing)
    // --------------------------------------------------------------------------
    describe("GET /", () => {
        it("should get all parking spots (verify array format)", async () => {
            const res = await request(app)
                .get(`${BASE}/`)
                .set("Authorization", `Bearer ${authToken}`);
            
            expect(res.status).to.equal(200);
            
            // This is the defensive code that allowed it to pass last time, 
            // handling either a bare array or an object wrapper.
            if (Array.isArray(res.body)) {
                expect(res.body).to.be.an("array");
            } else {
                expect(res.body).to.be.an("object");
                expect(res.body).to.have.property("data").that.is.an("array"); 
            }
        });
    });

    // 5. DELETE (Will run now that testParkingId is set)
    // --------------------------------------------------------------------------
    describe("DELETE /:id", () => {
        it("should delete the parking spot", async () => {
            if (!testParkingId) throw new Error("testParkingId is not set.");
            
            const res = await request(app)
                .delete(`${BASE}/${testParkingId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).to.equal(204);
            // For 204 response, body should be empty
            expect(res.body).to.deep.equal({});
        });
    });
});
