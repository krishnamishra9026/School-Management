const mongoose = require("mongoose");
const Student = require("../models/Student");

/**
 * GET /api/students
 * Get paginated students
 */
const getStudents = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
        } = req.query;

        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        const filter = {};

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { admissionNumber: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { className: searchRegex },
                { section: searchRegex },
            ];
        }

        const [students, total] = await Promise.all([
            Student.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Student.countDocuments(filter),
        ]);

        res.status(200).json({
            students,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            message: "Unable to fetch students.",
        });
    }
};


/**
 * GET /api/students/:id
 * Get single student
 */
const getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID.",
            });
        }

        const student = await Student.findById(id).lean();

        if (!student) {
            return res.status(404).json({
                message: "Student not found.",
            });
        }

        res.status(200).json({
            student,
        });
    } catch (error) {
        console.error("Get student error:", error);

        res.status(500).json({
            message: "Unable to fetch student.",
        });
    }
};


/**
 * POST /api/students
 * Create student
 */
const createStudent = async (req, res) => {
    try {
        const {
            admissionNumber,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            email,
            phone,
            className,
            section,
            rollNumber,
            fatherName,
            motherName,
            address,
            status,
        } = req.body;

        if (!admissionNumber || !firstName || !className) {
            return res.status(400).json({
                message:
                    "Admission number, first name and class are required.",
            });
        }

        const existingStudent =
            await Student.findOne({ admissionNumber });

        if (existingStudent) {
            return res.status(409).json({
                message:
                    "A student with this admission number already exists.",
            });
        }

        const student = await Student.create({
            admissionNumber,
            firstName,
            lastName,
            gender,
            dateOfBirth: dateOfBirth || null,
            email,
            phone,
            className,
            section,
            rollNumber,
            fatherName,
            motherName,
            address,
            status: status || "active",
        });

        res.status(201).json({
            message: "Student created successfully.",
            student,
        });
    } catch (error) {
        console.error("Create student error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "A student with this admission number already exists.",
            });
        }

        res.status(500).json({
            message: "Unable to create student.",
        });
    }
};


/**
 * PUT /api/students/:id
 * Update student
 */
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID.",
            });
        }

        const {
            admissionNumber,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            email,
            phone,
            className,
            section,
            rollNumber,
            fatherName,
            motherName,
            address,
            status,
        } = req.body;

        if (!admissionNumber || !firstName || !className) {
            return res.status(400).json({
                message:
                    "Admission number, first name and class are required.",
            });
        }

        const existingStudent =
            await Student.findOne({
                admissionNumber,
                _id: { $ne: id },
            });

        if (existingStudent) {
            return res.status(409).json({
                message:
                    "Another student already has this admission number.",
            });
        }

        const student =
            await Student.findByIdAndUpdate(
                id,
                {
                    admissionNumber,
                    firstName,
                    lastName,
                    gender,
                    dateOfBirth: dateOfBirth || null,
                    email,
                    phone,
                    className,
                    section,
                    rollNumber,
                    fatherName,
                    motherName,
                    address,
                    status: status || "active",
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!student) {
            return res.status(404).json({
                message: "Student not found.",
            });
        }

        res.status(200).json({
            message: "Student updated successfully.",
            student,
        });
    } catch (error) {
        console.error("Update student error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "A student with this admission number already exists.",
            });
        }

        res.status(500).json({
            message: "Unable to update student.",
        });
    }
};


/**
 * DELETE /api/students/:id
 * Delete student
 */
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID.",
            });
        }

        const student =
            await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found.",
            });
        }

        res.status(200).json({
            message: "Student deleted successfully.",
        });
    } catch (error) {
        console.error("Delete student error:", error);

        res.status(500).json({
            message: "Unable to delete student.",
        });
    }
};


module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
};