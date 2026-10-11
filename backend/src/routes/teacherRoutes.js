const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getMyPanel,
} = require("../controllers/teacherController");

const router = express.Router();

// Logged-in teacher's panel — keep before /:id
router.get("/me/panel", protect, getMyPanel);

router.get("/", getTeachers);

router.get("/:id", getTeacher);

router.post("/", createTeacher);

router.put("/:id", updateTeacher);

router.delete("/:id", deleteTeacher);

module.exports = router;
