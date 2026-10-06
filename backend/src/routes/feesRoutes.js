const express = require("express");
const {
    getFees,
    createFee,
    updateFee,
    deleteFee,
} = require("../controllers/feesController");
const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const router = express.Router();

router.get("/", protect, requirePermission("view", "fees"), getFees);
router.post("/", protect, requirePermission("create", "fees"), createFee);
router.put("/:id", protect, requirePermission("update", "fees"), updateFee);
router.delete("/:id", protect, requirePermission("delete", "fees"), deleteFee);

module.exports = router;