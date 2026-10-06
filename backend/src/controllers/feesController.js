const Fee = require("../models/Fee");

// Get all fees
exports.getFees = async (req, res) => {
    try {
        const fees = await Fee.find();
        res.json({ success: true, data: fees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new fee
exports.createFee = async (req, res) => {
    try {
        const { name, amount } = req.body;
        const fee = new Fee({ name, amount });
        await fee.save();
        res.status(201).json({ success: true, data: fee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a fee
exports.updateFee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount } = req.body;
        const fee = await Fee.findByIdAndUpdate(id, { name, amount }, { new: true });
        if (!fee) {
            return res.status(404).json({ success: false, message: "Fee not found" });
        }
        res.json({ success: true, data: fee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a fee
exports.deleteFee = async (req, res) => {
    try {
        const { id } = req.params;
        const fee = await Fee.findByIdAndDelete(id);
        if (!fee) {
            return res.status(404).json({ success: false, message: "Fee not found" });
        }
        res.json({ success: true, message: "Fee deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};