const express = require("express");
const passport = require("../config/passportconfig");

const {
  getAllLogs,
  createLog,
  exitVehicleByNumber,
  getMyVehicleLogs,
} = require("../controllers/vehicleLogController.js");

const { requireRole } = require("../middleware/jwt.js");

const {
  validateCreateLogRequest,
} = require("../middleware/vehiclelogValidationMiddleware.js");

const router = express.Router();

// --- Admin-Only Routes ---
// GET all logs and POST a new log (vehicle entry)
router
  .route("/")
  .get(
    
    getAllLogs
  )
  .post(
    createLog
  );

// --- User-Only Route ---
// GET all logs associated with the currently logged-in user
router
  .route("/my-logs")
  .get(
   
    getMyVehicleLogs
  );

// --- Admin-Only Action Route ---
// POST to exit a vehicle based on its number (from req.body)
router
  .route("/exit")
  .patch(
    
    exitVehicleByNumber
  );

module.exports = router;
