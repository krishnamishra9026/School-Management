
const express = require("express");

const router = express.Router();

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    requirePermission,
} = require("../middleware/caslMiddleware");

const {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    assignStudent,
    removeStudent,
    assignClassTeacher,
    assignSubjectTeacher,
} = require("../controllers/classController");

// All routes require authentication.
router.use(protect);

// List classes
router.get(
    "/",
    requirePermission("view", "classes"),
    getClasses
);

// Create class
router.post(
    "/",
    requirePermission("create", "classes"),
    createClass
);

// Assign student
router.post(
    "/:id/students",
    requirePermission("update", "classes"),
    assignStudent
);

// Remove student
router.delete(
    "/:id/students/:studentId",
    requirePermission("update", "classes"),
    removeStudent
);

// Assign class teacher
router.put(
    "/:id/class-teacher",
    requirePermission("update", "classes"),
    assignClassTeacher
);

// Assign subject teacher
router.post(
    "/:id/subject-teachers",
    requirePermission("update", "classes"),
    assignSubjectTeacher
);

// Update class
router.put(
    "/:id",
    requirePermission("update", "classes"),
    updateClass
);

// Delete class
router.delete(
    "/:id",
    requirePermission("delete", "classes"),
    deleteClass
);

// Class details — keep after specific routes
router.get(
    "/:id",
    requirePermission("view", "classes"),
    getClassById
);

module.exports = router;