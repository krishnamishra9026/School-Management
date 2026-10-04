const express = require("express");

const {
    createParent,
    getParents,
    getParent,
    updateParent,
    deleteParent,
} = require("../controllers/parentController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Parent Management
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

// GET /api/parents
router.get(
    "/",
    protect,
    getParents
);

// POST /api/parents
router.post(
    "/",
    protect,
    createParent
);

// GET /api/parents/:id
router.get(
    "/:id",
    protect,
    getParent
);

// PUT /api/parents/:id
router.put(
    "/:id",
    protect,
    updateParent
);

// DELETE /api/parents/:id
router.delete(
    "/:id",
    protect,
    deleteParent
);

module.exports = router;