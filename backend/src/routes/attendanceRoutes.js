const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const {
    getAttendanceClasses,
    getAttendanceSheet,
    saveAttendanceSheet,
    getAttendance,
    getAttendanceSummary,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// All routes require authentication. Permissions decide the
// action; the controller limits data to the user's scope
// (teacher: own classes, parent: children, student: self).
router.use(protect);

router.get("/classes", requirePermission("view", "attendance"), getAttendanceClasses);

router.get("/sheet", requirePermission("view", "attendance"), getAttendanceSheet);

router.post("/sheet", requirePermission("create", "attendance"), saveAttendanceSheet);

router.get("/summary", requirePermission("view", "attendance"), getAttendanceSummary);

router.get("/", requirePermission("view", "attendance"), getAttendance);

router.put("/:id", requirePermission("update", "attendance"), updateAttendance);

router.delete("/:id", requirePermission("delete", "attendance"), deleteAttendance);

module.exports = router;
