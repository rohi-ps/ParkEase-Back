const express = require('express');
const { 
    getAllLogs,
    createLog,
    getLogById,
    exitVehicle 
} = require('../controllers/vehicleLogController.js'); 

const { verifyToken, requireRole } = require('../middleware/jwt.js'); 
const {validateCreateLogRequest, validateIdParameter}=require('../middleware/vehiclelogValidationMiddleware.js')
const router = express.Router();

router.use(verifyToken);

// --- Admin-Only Routes ---
// GET all logs and POST a new log are restricted to 'admin'.
router.route('/')
    .get(requireRole('admin'), getAllLogs)   
    .post(requireRole('admin'), validateCreateLogRequest, createLog);  

// --- Route Accessible by Authenticated Users (Admin OR User) ---
// GET a single log by its ID
router.route('/:id').get(validateIdParameter,getLogById); 

// --- Admin-Only Action Route ---
router.route('/:id/exit')
    .patch(requireRole('admin'), validateIdParameter, exitVehicle); 

module.exports = router;

