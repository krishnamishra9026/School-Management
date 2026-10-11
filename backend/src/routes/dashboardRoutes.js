const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

// Every logged-in user gets a dashboard; the controller
// decides what data to return based on their role.
router.get("/", protect, getDashboard);

module.exports = router;
