const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middleware/authMiddleware");
const { can } = require("../middleware/caslMiddleware");
const attendanceController = require("../controllers/attendanceController");

// Get all attendance records
router.get(
  "/",
  checkAuth,
  can("view", "attendance"),
  attendanceController.getAllAttendance
);

// Get a single attendance record by ID
router.get(
  "/:id",
  checkAuth,
  can("view", "attendance"),
  attendanceController.getAttendanceById
);

// Create a new attendance record
router.post(
  "/",
  checkAuth,
  can("create", "attendance"),
  attendanceController.createAttendance
);

// Update an attendance record by ID
router.put(
  "/:id",
  checkAuth,
  can("update", "attendance"),
  attendanceController.updateAttendance
);

// Delete an attendance record by ID
router.delete(
  "/:id",
  checkAuth,
  can("delete", "attendance"),
  attendanceController.deleteAttendance
);

module.exports = router;
