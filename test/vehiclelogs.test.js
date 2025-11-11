const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const proxyquire = require('proxyquire'); // For reliable mocking
const sinon = require('sinon'); // Used to create stubs for model methods

// --- Mocking Setup ---

// This object will store our mock user for each test
const mockUser = {
    id: 'mockUserId123',
    role: 'admin',
    vehicleNumbers: ["MH12AB1234"]
};

// 1. Mock the Passport.js middleware
const mockPassport = {
    authenticate: (strategy, options) => (req, res, next) => {
        if (mockUser.role !== 'none') req.user = mockUser;
        next();
    }
};

// 2. Mock the custom requireRole middleware
const { requireRole } = require('../src/middleware/jwt.js'); // Use the REAL role logic

// 3. Mock the validation middleware (simple pass-through)
const mockValidation = {
    validateCreateLogRequest: (req, res, next) => {
        const { vehicleNumber, userId, vehicleType, slotId } = req.body;
        if (!vehicleNumber || !userId || !vehicleType || !slotId) {
            return res.status(400).json({ message: "Mock Validation: Missing required fields." });
        }
        next();
    },
    validateExitVehicleRequest: (req, res, next) => {
        if (!req.body.vehicleNumber) {
            return res.status(400).json({ message: "Mock Validation: vehicleNumber is required." });
        }
        next();
    },
    validateIdParameter: (req, res, next) => {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) { // Simple ObjectId check
             return res.status(400).json({ message: "Mock Validation: Invalid ID format." });
        }
        next();
    }
};

// 4. --- Mongoose Model Mocks ---
// We create stubs that we can control in each test
const vehicleLogStub = {
    find: sinon.stub(),
    findOne: sinon.stub(),
    findById: sinon.stub(),
    create: sinon.stub(),
    save: sinon.stub()
};
const parkingSlotStub = {
    findOne: sinon.stub(),
    findByIdAndUpdate: sinon.stub(),
    save: sinon.stub()
};
const userStub = {
    findById: sinon.stub()
};

// The 'save' stub needs to be on the *instance*, so we mock the main model constructor
const VehicleLogMock = function(data) { return { ...data, save: vehicleLogStub.save }; };
VehicleLogMock.find = vehicleLogStub.find;
VehicleLogMock.findOne = vehicleLogStub.findOne;
VehicleLogMock.findById = vehicleLogStub.findById;
VehicleLogMock.create = vehicleLogStub.create;

const ParkingSlotMock = function(data) { return { ...data, save: parkingSlotStub.save }; };
ParkingSlotMock.findOne = parkingSlotStub.findOne;
ParkingSlotMock.findByIdAndUpdate = parkingSlotStub.findByIdAndUpdate;

const UserMock = {
    findById: userStub.findById
};

// 5. Use proxyquire to load the app WITH ALL mocks
// !!! ADJUST ALL PATHS TO MATCH YOUR PROJECT !!!
const app = proxyquire('../app', {
    // Middleware Mocks:
    '../config/passportconfig': mockPassport,
    '../middleware/jwt.js': { requireRole: requireRole },
    '../middleware/vehiclelogValidationMiddleware.js': mockValidation,
    
    // Model Mocks:
    '../models/vehicleLog.model': VehicleLogMock,
    '../models/parkingModel': ParkingSlotMock,
    '../models/Registeruser': UserMock
});


// --- Test Suite ---
describe('Vehicle Logs API (Mongoose Mocked)', () => {

    // Reset stubs and mock user before each test
    beforeEach(() => {
        mockUser.role = 'admin';
        mockUser.id = 'mockAdminId';

        vehicleLogStub.find.reset();
        vehicleLogStub.findOne.reset();
        vehicleLogStub.findById.reset();
        vehicleLogStub.create.reset();
        vehicleLogStub.save.reset();
        
        parkingSlotStub.findOne.reset();
        parkingSlotStub.findByIdAndUpdate.reset();
        parkingSlotStub.save.reset();
        
        userStub.findById.reset();
    });

    // Test Case 1: POST /api/logs - Success (Admin)
    it('1. [Admin] POST /api/logs - should create a new log entry', async () => {
        const newLogData = {
            vehicleNumber: "KA01EF9999",
            userId: "New Tester",
            vehicleType: "4W",
            slotId: "A01", // This is the slotName
            userId: "cust123"
        };
        const mockSlot = { _id: "slotObjectId", slotName: "A01", vehicleType: "4W", status: "available", save: parkingSlotStub.save };
        const createdLog = { ...newLogData, _id: "newLogId", slotId: "slotObjectId", status: "Parked" };

        // Setup mocks:
        vehicleLogStub.findOne.resolves(null); // No existing parked vehicle
        parkingSlotStub.findOne.withArgs({ slotName: "A01" }).resolves(mockSlot); // Find the slot by name
        vehicleLogStub.create.resolves(createdLog); // Return the created log
        
        const res = await request(app)
            .post('/api/logs')
            .send(newLogData);
            
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('status', 'Parked');
        expect(res.body.vehicleNumber).to.equal(newLogData.vehicleNumber);
        expect(parkingSlotStub.save.called).to.be.true; // Check that slot.save() was called
    });

    // Test Case 2: POST /api/logs - Fail: Validation
    it('2. [Admin] POST /api/logs - should fail validation for missing vehicleNumber', async () => {
        const invalidLogData = { userId: "New Tester", vehicleType: "4W", slotId: "A01" };
        
        const res = await request(app)
            .post('/api/logs')
            .send(invalidLogData);
            
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("Mock Validation: vehicleNumber is required.");
    });
    
    // Test Case 3: POST /api/logs - Fail: User Role
    it('3. [User] POST /api/logs - should return 403 Forbidden', async () => {
        mockUser.role = 'user'; // Set role to user
        const newLogData = { vehicleNumber: "KA01EF9999", userId: "New Tester", vehicleType: "4W", slotId: "A01" };
        
        const res = await request(app)
            .post('/api/logs')
            .send(newLogData);
            
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Access denied: insufficient permissions');
    });

    // Test Case 4: GET /api/logs - Success (Admin)
    it('4. [Admin] GET /api/logs - should return all log entries', async () => {
        const mockLogs = [{ id: 1, vehicleNumber: "MH12AB1234" }, { id: 2, vehicleNumber: "MH14CD5678" }];
        // Mock the chain: find().populate().sort()
        vehicleLogStub.find.returns({
            populate: sinon.stub().returnsThis(), // .populate() returns 'this' (the chain)
            sort: sinon.stub().resolves(mockLogs) // .sort() resolves with our data
        });

        const res = await request(app).get('/api/logs');
        
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0].vehicleNumber).to.equal("MH12AB1234");
    });

    // Test Case 5: GET /my-logs - Success (User)
    it('5. [User] GET /my-logs - should get their own logs', async () => {
        mockUser.role = 'user';
        mockUser.id = 'cust123';
        
        const mockDbUser = { _id: "cust123", name: "Mock User", vehicleNumbers: ["MH12AB1234"] };
        const mockUserLogs = [{ id: 1, vehicleNumber: "MH12AB1234", status: "Parked" }];

        userStub.findById.withArgs("cust123").resolves(mockDbUser);
        vehicleLogStub.find.returns({ // Mock the find().populate().sort() chain
            populate: sinon.stub().returnsThis(),
            sort: sinon.stub().resolves(mockUserLogs)
        });

        const res = await request(app).get('/api/logs/my-logs');
        
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body[0].vehicleNumber).to.equal("MH12AB1234");
    });

    // Test Case 6: GET /my-logs - Fail: Admin Role
    it('6. [Admin] GET /my-logs - should fail for admin role', async () => {
        mockUser.role = 'admin'; // Admins use /api/logs, not /my-logs
        
        const res = await request(app).get('/api/logs/my-logs');
            
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Access denied: insufficient permissions');
    });

    // Test Case 7: PATCH /exit-by-vehicle - Success (Admin)
    it('7. [Admin] PATCH /exit-by-vehicle - should mark a vehicle as exited', async () => {
        const exitData = { vehicleNumber: "MH12AB1234" };
        const mockLogToExit = { 
            _id: "log123", 
            vehicleNumber: "MH12AB1234", 
            status: "Parked", 
            slotId: "slotObjectId",
            save: vehicleLogStub.save // Attach the save stub
        };
        const exitedLog = { ...mockLogToExit, status: "Completed" };

        vehicleLogStub.findOne.withArgs({ vehicleNumber: "MH12AB1234", status: "Parked" }).resolves(mockLogToExit);
        vehicleLogStub.save.resolves(exitedLog); // Mock the save() call
        parkingSlotStub.findByIdAndUpdate.resolves(true); // Mock the slot update

        const res = await request(app)
            .patch('/api/logs/exit-by-vehicle') // 
            .send(exitData);
        
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'Completed');
    });
});