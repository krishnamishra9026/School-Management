const express = require("express");

const {
    createParentStudent,
    getParentStudents,
    getParentStudent,
    updateParentStudent,
    deleteParentStudent,
} = require("../controllers/parentStudentController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Parent Student Relationships
|--------------------------------------------------------------------------
*/

// GET /api/parent-students
router.get(
    "/",
    protect,
    getParentStudents
);

// POST /api/parent-students
router.post(
    "/",
    protect,
    createParentStudent
);

// GET /api/parent-students/:id
router.get(
    "/:id",
    protect,
    getParentStudent
);

// PUT /api/parent-students/:id
router.put(
    "/:id",
    protect,
    updateParentStudent
);

// DELETE /api/parent-students/:id
router.delete(
    "/:id",
    protect,
    deleteParentStudent
);

module.exports = router;