const express = require("express");
const {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
} = require("../controllers/classesController");
const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const router = express.Router();

router.get("/", protect, requirePermission("view", "classes"), getClasses);
router.get("/:id", protect, requirePermission("view", "classes"), getClass);
router.post("/", protect, requirePermission("create", "classes"), createClass);
router.put("/:id", protect, requirePermission("update", "classes"), updateClass);
router.delete("/:id", protect, requirePermission("delete", "classes"), deleteClass);

module.exports = router;