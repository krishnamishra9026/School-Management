const Attendance = require("../models/Attendance");

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.findAll();
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance records." });
    }
};

// Get a single attendance record by ID
exports.getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findByPk(id);
        if (!attendance) {
            return res.status(404).json({ error: "Attendance record not found." });
        }
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance record." });
    }
};

// Create a new attendance record
exports.createAttendance = async (req, res) => {
    try {
        const newAttendance = await Attendance.create(req.body);
        res.status(201).json(newAttendance);
    } catch (error) {
        res.status(500).json({ error: "Failed to create attendance record." });
    }
};

// Update an attendance record by ID
exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Attendance.update(req.body, { where: { id } });
        if (!updated) {
            return res.status(404).json({ error: "Attendance record not found." });
        }
        res.status(200).json({ message: "Attendance record updated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to update attendance record." });
    }
};

// Delete an attendance record by ID
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Attendance.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ error: "Attendance record not found." });
        }
        res.status(200).json({ message: "Attendance record deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete attendance record." });
    }
};