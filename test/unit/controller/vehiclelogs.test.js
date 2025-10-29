// Import supertest for making HTTP requests
const request = require('supertest');
// Import your Express app instance (make sure app.js exports it)
const app = require('../../../app'); // Adjust path as needed
// Import fs promises for interacting with the data file during tests
const fs = require('fs').promises;
const path = require('path');

// --- Mocking Setup ---

// Mock the authentication middleware
// Replace the actual implementations with dummies for testing purposes
jest.mock('../../../src/middleware/jwt.js', () => ({
    verifyToken: (req, res, next) => {
        // Simulate different users based on a test header or default to admin
        if (req.headers['x-test-role'] === 'user') {
            req.user = { email: 'test@user.com', role: 'user' };
        } else if (req.headers['x-test-role'] === 'none') {
             // Simulate no token by not setting req.user and calling next
             // Or simulate error by returning status directly (less clean)
             // return res.status(403).json({ message: 'Mock No Token' }); 
             req.user = undefined; // Simulate no user attached
        }
         else {
            req.user = { email: 'admin@test.com', role: 'admin' }; // Default to admin
        }
        next();
    },
    requireRole: (role) => (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: `Mock Access Denied: Requires ${role}` });
        }
        next();
    }
}));



// --- Test Data Setup ---
const dataPath = path.join(__dirname, '../../../src/data/parkingData.json');
const initialTestData = [
    { id: 1, vehicleNumber: "MH12AB1234", customerName: "Test User 1", vehicleType: "4W", slotId: "A-01", entryTime: new Date(Date.now() - 3600000).toISOString(), exitTime: null, status: "Parked" },
    { id: 2, vehicleNumber: "MH14CD5678", customerName: "Test User 2", vehicleType: "2W", slotId: "B-02", entryTime: new Date(Date.now() - 7200000).toISOString(), exitTime: new Date(Date.now() - 1800000).toISOString(), status: "Completed" }
];

// --- Test Suite ---
describe('Vehicle Logs API', () => {

    // Reset the data file before each test
    beforeEach(async () => {
        await fs.writeFile(dataPath, JSON.stringify(initialTestData, null, 2), 'utf8');
        // Reset mock function calls if mocking billing service
    });

    // --- POST /api/logs ---
    describe('POST /api/logs', () => {
        const newLogData = {
            vehicleNumber: "KA01EF9999",
            customerName: "New Tester",
            vehicleType: "4W",
            slotId: "C-03"
        };

        it('CL-001: should create a new log entry for admin', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', 'Bearer fakeAdminToken') // Token content doesn't matter due to mock
                .send(newLogData);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 3); // Assuming IDs auto-increment
            expect(res.body).toHaveProperty('status', 'Parked');
            expect(res.body.vehicleNumber).toEqual(newLogData.vehicleNumber);

            // Verify file write (optional, but good)
            const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
            expect(data).toHaveLength(3);
            expect(data[2].id).toEqual(3);
        });

        it('CL-002: should return 400 for missing fields', async () => {
            const { slotId, ...incompleteData } = newLogData; // Remove slotId
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', 'Bearer fakeAdminToken')
                .send(incompleteData);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message'); // Check for an error message
        });
        
         it('CL-003: should return 409 if vehicle already parked', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', 'Bearer fakeAdminToken')
                .send({ ...newLogData, vehicleNumber: "MH12AB1234"}); // Use number from initial data
            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', expect.stringContaining('already parked'));
        });

        it('CL-004: should return 403 for user role', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', 'Bearer fakeUserToken')
                .set('x-test-role', 'user') // Trigger user role in mock
                .send(newLogData);
            expect(res.statusCode).toEqual(403);
             expect(res.body).toHaveProperty('message', expect.stringContaining('Access Denied'));
        });
        
    });

    // --- GET /api/logs ---
    describe('GET /api/logs', () => {
        it('GAL-001: should return all logs for admin', async () => {
            const res = await request(app)
                .get('/api/logs')
                .set('Authorization', 'Bearer fakeAdminToken');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(initialTestData.length);
        });

         it('GAL-002: should return 403 for user role', async () => {
            const res = await request(app)
                .get('/api/logs')
                .set('Authorization', 'Bearer fakeUserToken')
                .set('x-test-role', 'user');
            expect(res.statusCode).toEqual(403);
        });
    });

    // --- GET /api/logs/:id ---
    describe('GET /api/logs/:id', () => {
        it('GID-001: should return a single log for any authenticated user', async () => {
            const res = await request(app)
                .get('/api/logs/1')
                .set('Authorization', 'Bearer fakeUserToken')
                .set('x-test-role', 'user'); // Test with user role
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 1);
            expect(res.body.vehicleNumber).toEqual(initialTestData[0].vehicleNumber);
        });

        it('GID-002: should return 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/logs/999')
                .set('Authorization', 'Bearer fakeAdminToken');
            expect(res.statusCode).toEqual(404);
        });

    });

    // --- PATCH /api/logs/:id/exit ---
    describe('PATCH /api/logs/:id/exit', () => {
        it('EV-001: should mark a vehicle as exited for admin', async () => {
            const res = await request(app)
                .patch('/api/logs/1/exit') // Exit the first vehicle which is 'Parked'
                .set('Authorization', 'Bearer fakeAdminToken');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 1);
            expect(res.body).toHaveProperty('status', 'Completed');
            expect(res.body.exitTime).not.toBeNull();

             // Verify file write
            const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
            expect(data[0].status).toEqual('Completed');
            expect(data[0].exitTime).not.toBeNull();
        });
        
         it('EV-002: should return 400 if vehicle already exited', async () => {
            const res = await request(app)
                .patch('/api/logs/2/exit') // Try to exit the second vehicle which is 'Completed'
                .set('Authorization', 'Bearer fakeAdminToken');
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Vehicle has already exited.');
        });

        it('EV-003: should return 403 for user role', async () => {
             const res = await request(app)
                .patch('/api/logs/1/exit')
                .set('Authorization', 'Bearer fakeUserToken')
                .set('x-test-role', 'user');
            expect(res.statusCode).toEqual(403);
        });
        
         it('EV-004: should return 404 for non-existent id', async () => {
            const res = await request(app)
                .patch('/api/logs/999/exit')
                .set('Authorization', 'Bearer fakeAdminToken');
            expect(res.statusCode).toEqual(404);
        });

    });

});
