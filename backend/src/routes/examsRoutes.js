const express = require("express");
const {
    getExams,
    createExam,
    updateExam,
    deleteExam,
} = require("../controllers/examsController");
const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const router = express.Router();

router.get("/", protect, requirePermission("view", "exams"), getExams);
router.post("/", protect, requirePermission("create", "exams"), createExam);
router.put("/:id", protect, requirePermission("update", "exams"), updateExam);
router.delete("/:id", protect, requirePermission("delete", "exams"), deleteExam);

module.exports = router;