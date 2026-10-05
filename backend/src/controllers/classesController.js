const Class = require("../models/Class");

exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getClass = async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id);
        if (!classItem) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }
        res.json({ success: true, data: classItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createClass = async (req, res) => {
    try {
        const newClass = await Class.create(req.body);
        res.status(201).json({ success: true, data: newClass });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }
        res.json({ success: true, data: updatedClass });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }
        res.json({ success: true, message: "Class deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};