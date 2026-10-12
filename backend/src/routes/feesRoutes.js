const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/caslMiddleware");

const {
    getFees,
    getFee,
    createFee,
    updateFee,
    deleteFee,
    addPayment,
    deletePayment,
} = require("../controllers/feesController");

const router = express.Router();

// All routes require authentication. Permissions decide the
// action; the controller limits data to the user's scope
// (parent: children, student: self) and keeps writes to staff.
router.use(protect);

router.get("/", requirePermission("view", "fees"), getFees);

router.post("/", requirePermission("create", "fees"), createFee);

router.post("/:id/payments", requirePermission("update", "fees"), addPayment);

router.delete("/:id/payments/:paymentId", requirePermission("update", "fees"), deletePayment);

router.get("/:id", requirePermission("view", "fees"), getFee);

router.put("/:id", requirePermission("update", "fees"), updateFee);

router.delete("/:id", requirePermission("delete", "fees"), deleteFee);

module.exports = router;
