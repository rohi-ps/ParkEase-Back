const request = require('supertest');
const chai = require('chai');
const expect = chai.expect; 

const fs = require('fs').promises;
const path = require('path');

// --- Mocking Setup ---
// Override middleware BEFORE requiring the app or routes
let mockUserRole = 'admin'; // Global variable to control mock role

const mockVerifyToken = (req, res, next) => {
    // console.log(`MOCK verifyToken executing. Role set to: ${mockUserRole}`);
    if (mockUserRole === 'none') {
        // Simulate no token by just not setting req.user
        req.user = undefined;
        
    } else {
        req.user = { email: `test@${mockUserRole}.com`, role: mockUserRole };
    }
    next();
};

const mockRequireRole = (role) => (req, res, next) => {
    // console.log(`MOCK requireRole executing. Required: ${role}, User has: ${req.user?.role}`);
    if (!req.user) { // Added check for req.user existence
        return res.status(401).json({ message: 'Mock: Authentication required' });
    }
    if (req.user.role !== role) {
        return res.status(403).json({ message: `Mock Access Denied: Requires role "${role}"` });
    }
    next();
};

const authMiddlewarePath = require.resolve('../../../src/middleware/jwt.js'); 
require(authMiddlewarePath).verifyToken = mockVerifyToken;
require(authMiddlewarePath).requireRole = mockRequireRole;

// --- App Import ---
const app = require('../../../app'); 

// --- Test Data Setup ---
const dataPath = path.join(__dirname, '../../../src/data/parkingData.json');
const initialTestData = [
    { id: 1, vehicleNumber: "MH12AB1234", customerName: "Test User 1", vehicleType: "4W", slotId: "A-01", entryTime: new Date(Date.now() - 3600000).toISOString(), exitTime: null, status: "Parked" },
    { id: 2, vehicleNumber: "MH14CD5678", customerName: "Test User 2", vehicleType: "2W", slotId: "B-02", entryTime: new Date(Date.now() - 7200000).toISOString(), exitTime: new Date(Date.now() - 1800000).toISOString(), status: "Completed" }
];

// --- Test Suite ---
describe('Vehicle Logs API (Mocha/Chai)', () => {

    
    beforeEach(async () => {
        mockUserRole = 'admin'; // Default to admin for most tests
        try {
            // Ensure the directory exists before writing
            await fs.mkdir(path.dirname(dataPath), { recursive: true });
            await fs.writeFile(dataPath, JSON.stringify(initialTestData, null, 2), 'utf8');
        } catch (err) {
            console.error("Critical error setting up test data file:", err);
            
        }
    });

    // --- POST /api/logs ---
    describe('POST /api/logs', () => {
        const newLogData = { vehicleNumber: "KA01EF9999", customerName: "New Tester", vehicleType: "4W", slotId: "C-03" };

        it('1. [Admin] should create a new log entry successfully', async () => {
            const res = await request(app)
                .post('/api/logs')
                .send(newLogData); // No token needed in header due to direct mock override
            expect(res.status).to.equal(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('id'); // Check existence, value might vary slightly
            expect(res.body).to.have.property('status', 'Parked');
            expect(res.body.vehicleNumber).to.equal(newLogData.vehicleNumber);
        });

        it('2. [Admin] should return 400 for missing required fields', async () => {
            const { slotId, ...incompleteData } = newLogData; // Example: remove slotId
            const res = await request(app)
                .post('/api/logs')
                .send(incompleteData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').that.includes('required'); // Check error message loosely
        });

        it('3. [Admin] should return 409 if vehicle is already parked', async () => {
            const res = await request(app)
                .post('/api/logs')
                .send({ ...newLogData, vehicleNumber: "MH12AB1234"}); // Use number from initial 'Parked' data
            expect(res.status).to.equal(409);
            expect(res.body.message).to.include('already parked');
        });

        it('4. [User] should return 403 Forbidden when trying to create a log', async () => {
            mockUserRole = 'user'; // Set mock role for this specific test
            const res = await request(app)
                .post('/api/logs')
                .send(newLogData);
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal('Mock Access Denied: Requires role "admin"');
        });
    });

    // --- GET /api/logs ---
    describe('GET /api/logs', () => {
        it('5. [Admin] should return all log entries', async () => {
            const res = await request(app).get('/api/logs');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(initialTestData.length);
        });

        it('6. [User] should return 403 Forbidden when trying to get all logs', async () => {
            mockUserRole = 'user';
            const res = await request(app).get('/api/logs');
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal('Mock Access Denied: Requires role "admin"');
        });
    });

    // --- GET /api/logs/:id ---
    describe('GET /api/logs/:id', () => {
        it('7. [User/Admin] should return a single log by ID', async () => {
            mockUserRole = 'user'; // Test that users CAN access this
            const res = await request(app).get('/api/logs/1'); // Get existing ID 1
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('id', 1);
        });

        it('8. [User/Admin] should return 404 for a non-existent log ID', async () => {
            mockUserRole = 'admin'; // Role doesn't matter here if ID not found
            const res = await request(app).get('/api/logs/999'); // Non-existent ID
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Parking log not found.');
        });
    });

    // --- PATCH /api/logs/:id/exit ---
    describe('PATCH /api/logs/:id/exit', () => {
        it('9. [Admin] should successfully mark a vehicle as exited', async () => {
            const res = await request(app).patch('/api/logs/1/exit'); // Exit the first vehicle ('Parked')
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('id', 1);
            expect(res.body).to.have.property('status', 'Completed');
            expect(res.body.exitTime).to.not.be.null;

            // Verify file write
            const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
            expect(data[0].status).to.equal('Completed');
            expect(data[0].exitTime).to.not.be.null;
            
        });

        it('10. [Admin] should return 400 if attempting to exit an already completed log', async () => {
            const res = await request(app).patch('/api/logs/2/exit'); // Try exiting the second vehicle ('Completed')
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Vehicle has already exited.');
        });
    });
});
