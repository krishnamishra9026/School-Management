const Exam = require("../models/Exam");

// Get all exams
exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate("class");
        res.json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const { name, date, class: classId, subject, totalMarks } = req.body;
        const exam = new Exam({ name, date, class: classId, subject, totalMarks });
        await exam.save();
        res.status(201).json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an exam
exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, class: classId, subject, totalMarks } = req.body;
        const exam = await Exam.findByIdAndUpdate(id, { name, date, class: classId, subject, totalMarks }, { new: true });
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }
        res.json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await Exam.findByIdAndDelete(id);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }
        res.json({ success: true, message: "Exam deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};