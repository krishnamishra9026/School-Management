const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// All routes require authentication.
router.use(protect);

router.get("/", getStudents);

router.get("/:id", getStudent);

router.post("/", createStudent);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

module.exports = router;