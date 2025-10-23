const express = require('express');
const { 
    getAllLogs,
    createLog,
    getLogById,
    exitVehicle 
} = require('../controllers/logController.js'); 

const { verifyToken, requireRole } = require('../middleware/jwt.js'); 

const router = express.Router();

router.use(verifyToken);

// --- Admin-Only Routes ---
// GET all logs and POST a new log are restricted to 'admin'.
router.route('/')
    .get(requireRole('admin'), getAllLogs)   
    .post(requireRole('admin'), createLog);  

// --- Route Accessible by Authenticated Users (Admin OR User) ---
// GET a single log by its ID
router.route('/:id')
    .get(getLogById); 

// --- Admin-Only Action Route ---
router.route('/:id/exit')
    .patch(requireRole('admin'), exitVehicle); 

module.exports = router;

