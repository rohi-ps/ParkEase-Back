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
    passport.authenticate("jwt", { session: false }),
    requireRole("admin"),
    getAllLogs
  )
  .post(
    passport.authenticate("jwt", { session: false }),
    requireRole("admin"),
    validateCreateLogRequest,
    createLog
  );

// --- User-Only Route ---
// GET all logs associated with the currently logged-in user
router
  .route("/my-logs")
  .get(
    passport.authenticate("jwt", { session: false }),
    requireRole("user"),
    getMyVehicleLogs
  );

// --- Admin-Only Action Route ---
// POST to exit a vehicle based on its number (from req.body)
router
  .route("/exit")
  .post(
    passport.authenticate("jwt", { session: false }),
    requireRole("admin"),
    exitVehicleByNumber
  );

module.exports = router;
