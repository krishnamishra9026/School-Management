const express = require("express");

const router = express.Router();

const {
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
} = require("../controllers/permissionController");

const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

router.get(
  "/",
  protect,
//   requirePermission("view", "permissions"),
  getPermissions
);

router.post(
  "/",
  protect,
//   requirePermission("create", "permissions"),
  createPermission
);

router.get(
  "/:id",
  protect,
//   requirePermission("view", "permissions"),
  getPermission
);

router.put(
  "/:id",
  protect,
//   requirePermission("update", "permissions"),
  updatePermission
);

router.delete(
  "/:id",
  protect,
//   requirePermission("delete", "permissions"),
  deletePermission
);

module.exports = router;
