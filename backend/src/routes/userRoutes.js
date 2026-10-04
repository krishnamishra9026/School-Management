const express = require("express");

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getMe,
} = require("../controllers/userController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/me
router.get("/me", protect, getMe);

// GET /api/users
router.get(
    "/",
    protect,
    // authorize("super_admin", "school_admin"),
    getUsers
);

// POST /api/users
router.post(
    "/",
    protect,
    // authorize("super_admin", "school_admin"),
    createUser
);

// GET /api/users/:id
router.get(
    "/:id",
    protect,
    // authorize("super_admin", "school_admin"),
    getUser
);

// PUT /api/users/:id
router.put(
    "/:id",
    protect,
    // authorize("super_admin", "school_admin"),
    updateUser
);

// DELETE /api/users/:id
router.delete(
    "/:id",
    protect,
    // authorize("super_admin", "school_admin"),
    deleteUser
);

module.exports = router;