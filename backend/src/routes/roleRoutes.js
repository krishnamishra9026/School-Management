const express = require("express");

const router = express.Router();

const {
    getRoles,
    getAllRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    updateRolePermissions,
} = require("../controllers/roleController");

const { protect } = require("../middleware/authMiddleware");
const {
    requirePermission,
} = require("../middleware/caslMiddleware");

router.get(
    "/all",
    protect,
    getAllRoles
);

router.get(
    "/",
    protect,
    requirePermission("view", "roles"),
    getRoles
);

router.post(
    "/",
    protect,
    requirePermission("create", "roles"),
    createRole
);

router.get(
    "/:id",
    protect,
    requirePermission("view", "roles"),
    getRole
);

router.put(
    "/:id",
    protect,
    requirePermission("update", "roles"),
    updateRole
);

router.delete(
    "/:id",
    protect,
    requirePermission("delete", "roles"),
    deleteRole
);

/*
 * Role permissions
 *
 * IMPORTANT:
 * These routes must be declared before
 * /:id if using a route pattern that could
 * conflict with them. With /:roleId/permissions
 * Express will still correctly match the
 * two-segment URL.
 */
router.get(
    "/:roleId/permissions",
    protect,
    requirePermission("view", "roles"),
    getRolePermissions
);

router.put(
    "/:roleId/permissions",
    protect,
    requirePermission("update", "roles"),
    updateRolePermissions
);

module.exports = router;