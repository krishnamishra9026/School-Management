const mongoose = require("mongoose");
const Student = require("../models/Student");
const User = require("../models/User");
const Role = require("../models/Role");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const ParentStudent = require("../models/ParentStudent");
const SchoolClass = require("../models/Class");

// Matches no documents — used when a teacher/parent/student
// user has no linked profile yet.
const NO_MATCH = { _id: null };

/**
 * Build a filter limiting which students the user can see.
 * - teacher: students in classes where they are class or subject teacher
 * - parent:  students linked to them via ParentStudent
 * - student: only their own record
 * - anyone else (admin, super_admin, ...): all students ({})
 */
const getStudentScope = async (user) => {
    const role =
        user.roleId && user.roleId.slug
            ? user.roleId
            : await Role.findById(user.roleId).select("slug").lean();

    const slug = role?.slug;

    if (slug === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id })
            .select("_id")
            .lean();

        if (!teacher) return NO_MATCH;

        const studentIds = await SchoolClass.distinct("students", {
            $or: [
                { classTeacher: teacher._id },
                { "subjectTeachers.teacherId": teacher._id },
            ],
        });

        return { _id: { $in: studentIds } };
    }

    if (slug === "parent") {
        const parent = await Parent.findOne({ userId: user._id })
            .select("_id")
            .lean();

        if (!parent) return NO_MATCH;

        const studentIds = await ParentStudent.distinct("studentId", {
            parentId: parent._id,
            status: "active",
        });

        return { _id: { $in: studentIds } };
    }

    if (slug === "student") {
        return { userId: user._id };
    }

    return {};
};

/**
 * Validate that userId points to an existing user not
 * already linked to another student. Returns an error
 * message, or null when valid.
 */
const validateStudentUser = async (userId, studentId = null) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return "A valid user is required.";
    }

    const user = await User.findById(userId).select("_id");

    if (!user) {
        return "Selected user not found.";
    }

    const linked = await Student.findOne({
        userId,
        ...(studentId && { _id: { $ne: studentId } }),
    }).select("_id");

    if (linked) {
        return "This user is already assigned to another student.";
    }

    return null;
};

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

        const scope = await getStudentScope(req.user);
        const scopedFilter = { $and: [scope, filter] };

        const [students, total] = await Promise.all([
            Student.find(scopedFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Student.countDocuments(scopedFilter),
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

        const scope = await getStudentScope(req.user);

        const student = await Student.findOne({
            $and: [{ _id: id }, scope],
        }).lean();

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
            userId,
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

        const userError = await validateStudentUser(userId);

        if (userError) {
            return res.status(400).json({
                message: userError,
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
            userId,
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

        await User.findByIdAndUpdate(userId, {
            studentId: student._id,
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
            userId,
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

        const userError = await validateStudentUser(userId, id);

        if (userError) {
            return res.status(400).json({
                message: userError,
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

        const previous = await Student.findById(id).select("userId");

        const student =
            await Student.findByIdAndUpdate(
                id,
                {
                    userId,
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

        if (
            previous?.userId &&
            String(previous.userId) !== String(userId)
        ) {
            await User.findByIdAndUpdate(previous.userId, {
                studentId: null,
            });
        }

        await User.findByIdAndUpdate(userId, {
            studentId: student._id,
        });

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

        if (student.userId) {
            await User.findByIdAndUpdate(student.userId, {
                studentId: null,
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