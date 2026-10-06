const express = require("express");
const {
    getAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const router = express.Router();

router.get("/", protect, requirePermission("view", "attendance"), getAttendance);
router.post("/", protect, requirePermission("create", "attendance"), createAttendance);
router.put("/:id", protect, requirePermission("update", "attendance"), updateAttendance);
router.delete("/:id", protect, requirePermission("delete", "attendance"), deleteAttendance);

module.exports = router;