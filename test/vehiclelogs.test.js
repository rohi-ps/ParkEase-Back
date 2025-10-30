// Import testing libraries
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const proxyquire = require('proxyquire'); // For reliable mocking

// Import Node.js core modules
const fs = require('fs').promises;
const path = require('path');

// --- Mocking Setup ---
// Define simple mock functions for auth middleware
let mockUserRole = 'admin'; // Global variable to control mock role

const mockVerifyToken = (req, res, next) => {
    req.user = mockUserRole === 'none' ? undefined : { email: `test@${mockUserRole}.com`, role: mockUserRole };
    next();
};

const mockRequireRole = (role) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Mock Auth Required' });
    }
    if (req.user.role !== role) {
        return res.status(403).json({ message: `Mock Access Denied: Requires ${role}` });
    }
    next();
};

// --- Use proxyquire to load the app WITH the mocks injected ---
const appPath = '../app';
const jwtMiddlewareRequirePath = './src/middleware/jwt.js'; 

const app = proxyquire(appPath, {
    // The key MUST match how app.js/routes require the middleware
    [jwtMiddlewareRequirePath]: {
        verifyToken: mockVerifyToken,
        requireRole: mockRequireRole,
        '@global': true // Helps ensure mock is used
    }
});

// --- Test Data Setup ---
// Adjust path from this test file TO your actual data file
const dataPath = path.join(__dirname, '../src/data/parkingData.json');
const initialTestData = [
    { id: 1, vehicleNumber: "MH12AB1234", customerName: "Test User 1", vehicleType: "4W", slotId: "A-01", entryTime: new Date(Date.now() - 3600000).toISOString(), exitTime: null, status: "Parked" },
    { id: 2, vehicleNumber: "MH14CD5678", customerName: "Test User 2", vehicleType: "2W", slotId: "B-02", entryTime: new Date(Date.now() - 7200000).toISOString(), exitTime: new Date(Date.now() - 1800000).toISOString(), status: "Completed" }
];

// --- Test Suite ---
describe('Vehicle Logs API (Simplified Tests)', () => {

    // Reset data file and default mock role before each test
    beforeEach(async () => {
        mockUserRole = 'admin'; // Default to admin
        try {
            await fs.mkdir(path.dirname(dataPath), { recursive: true });
            await fs.writeFile(dataPath, JSON.stringify(initialTestData, null, 2), 'utf8');
        } catch (err) {
            console.error("Setup Error: Could not write test data file.", err);
            // Consider throwing the error to stop tests if setup fails
            // throw err;
        }
    });

    // Test Case 1: POST /api/logs - Success (Admin)
    it('1. [Admin] POST /api/logs - should create a new log entry', async () => {
        const newLogData = { vehicleNumber: "KA01EF9999", customerName: "New Tester", vehicleType: "4W", slotId: "C-03" };
        const res = await request(app)
            .post('/api/logs') // Assuming base path is /api/logs
            .send(newLogData);
        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('status', 'Parked');
    });

    // Test Case 2: POST /api/logs - Fail: Missing Field (Admin)
    it('2. [Admin] POST /api/logs - should fail with missing fields', async () => {
        const incompleteData = { vehicleNumber: "KA01EF9999", customerName: "New Tester" }; // Missing type and slot
        const res = await request(app)
            .post('/api/logs')
            .send(incompleteData);
        expect(res.status).to.equal(400); // Expect validation failure
        expect(res.body).to.have.property('message'); // Should have an error message
    });

    // Test Case 3: POST /api/logs - Fail: User Role (User trying Admin action)
    it('3. [User] POST /api/logs - should return 403 Forbidden', async () => {
        mockUserRole = 'user'; // Set role to user for this test
        const newLogData = { vehicleNumber: "KA01EF9999", customerName: "New Tester", vehicleType: "4W", slotId: "C-03" };
        const res = await request(app)
            .post('/api/logs')
            .send(newLogData);
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Mock Access Denied: Requires admin');
    });

    // Test Case 4: GET /api/logs - Success (Admin)
    it('4. [Admin] GET /api/logs - should return all log entries', async () => {
        mockUserRole = 'admin'; // Ensure role is admin
        const res = await request(app).get('/api/logs');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(initialTestData.length);
    });

    // Test Case 5: GET /api/logs/:id - Success (Any Authenticated User)
    it('5. [User/Admin] GET /api/logs/:id - should return a single log by ID', async () => {
        mockUserRole = 'user'; // Test that a user can access this
        const res = await request(app).get('/api/logs/1'); // Get existing ID 1
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id', 1);
    });

    // Test Case 6: GET /api/logs/:id - Fail: Not Found
    it('6. [User/Admin] GET /api/logs/:id - should return 404 for non-existent ID', async () => {
        mockUserRole = 'admin'; // Role doesn't matter for 404
        const res = await request(app).get('/api/logs/999'); // Non-existent ID
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal('Parking log not found.');
    });

    // Test Case 7: PATCH /api/logs/:id/exit - Success (Admin)
    it('7. [Admin] PATCH /api/logs/:id/exit - should mark a vehicle as exited', async () => {
        mockUserRole = 'admin';
        const res = await request(app).patch('/api/logs/1/exit'); // Exit the first vehicle ('Parked')
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'Completed');
        expect(res.body.exitTime).to.not.be.null;

        // Verify file was updated
        const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        expect(data[0].status).to.equal('Completed');
    });

});