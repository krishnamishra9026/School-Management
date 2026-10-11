
const mongoose = require("mongoose");

const SchoolClass = require("../models/Class");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Role = require("../models/Role");

const isValidId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

// Matches no documents — used when a student/teacher
// user has no linked profile yet.
const NO_MATCH = { _id: null };

/**
 * Build a filter limiting which classes the user can see.
 * - student: classes they are enrolled in
 * - teacher: classes where they are class or subject teacher
 * - anyone else (admin, super_admin, ...): all classes ({})
 */
const getClassScope = async (user) => {
    const role =
        user.roleId && user.roleId.slug
            ? user.roleId
            : await Role.findById(user.roleId).select("slug").lean();

    const slug = role?.slug;

    if (slug === "student") {
        const student = await Student.findOne({ userId: user._id })
            .select("_id")
            .lean();

        return student ? { students: student._id } : NO_MATCH;
    }

    if (slug === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id })
            .select("_id")
            .lean();

        return teacher
            ? {
                  $or: [
                      { classTeacher: teacher._id },
                      { "subjectTeachers.teacherId": teacher._id },
                  ],
              }
            : NO_MATCH;
    }

    return {};
};

const getClasses = async (req, res) => {
    try {
        const {
            search = "",
            status = "",
            page = 1,
            limit = 10,
        } = req.query;

        const pageNumber = Math.max(
            1,
            Number.parseInt(page, 10) || 1
        );

        const pageSize = Math.min(
            100,
            Math.max(
                1,
                Number.parseInt(limit, 10) || 10
            )
        );

        const filter = {};
        const scope = await getClassScope(req.user);

        if (status) {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status filter.",
                });
            }

            filter.status = status;
        }

        if (search.trim()) {
            const regex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            filter.$or = [
                { name: regex },
                { grade: regex },
                { section: regex },
                { academicYear: regex },
            ];
        }

        const scopedFilter = { $and: [scope, filter] };

        const [classes, total] = await Promise.all([
            SchoolClass.find(scopedFilter)
                .populate("classTeacher")
                .populate("students")
                .sort({ grade: 1, section: 1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .lean(),

            SchoolClass.countDocuments(scopedFilter),
        ]);

        return res.json({
            success: true,
            classes,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("Get classes error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch classes.",
        });
    }
};

const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID.",
            });
        }

        const scope = await getClassScope(req.user);

        const schoolClass = await SchoolClass.findOne({
            $and: [{ _id: id }, scope],
        })
            .populate("classTeacher")
            .populate("subjectTeachers.teacherId")
            .populate("students");

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        return res.json({
            success: true,
            class: schoolClass,
        });
    } catch (error) {
        console.error("Get class error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch class.",
        });
    }
};

const createClass = async (req, res) => {
    try {
        const {
            name,
            grade,
            section,
            academicYear,
            room = "",
            capacity = 40,
            status = "active",
        } = req.body;

        if (!name?.trim() || !grade?.trim() ||
            !section?.trim() || !academicYear?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, grade, section and academic year are required.",
            });
        }

        if (!Number.isInteger(Number(capacity)) ||
            Number(capacity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Capacity must be a positive integer.",
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class status.",
            });
        }

        const schoolClass = await SchoolClass.create({
            name: name.trim(),
            grade: grade.trim(),
            section: section.trim().toUpperCase(),
            academicYear: academicYear.trim(),
            room: room.trim(),
            capacity: Number(capacity),
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Class created successfully.",
            class: schoolClass,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This grade, section and academic year already exist.",
            });
        }

        console.error("Create class error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create class.",
        });
    }
};

const updateClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID.",
            });
        }

        const allowedFields = [
            "name",
            "grade",
            "section",
            "academicYear",
            "room",
            "capacity",
            "status",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.name !== undefined) {
            updates.name = String(updates.name).trim();
        }

        if (updates.grade !== undefined) {
            updates.grade = String(updates.grade).trim();
        }

        if (updates.section !== undefined) {
            updates.section = String(updates.section)
                .trim()
                .toUpperCase();
        }

        if (updates.academicYear !== undefined) {
            updates.academicYear =
                String(updates.academicYear).trim();
        }

        if (updates.room !== undefined) {
            updates.room = String(updates.room).trim();
        }

        if (updates.capacity !== undefined) {
            if (
                !Number.isInteger(Number(updates.capacity)) ||
                Number(updates.capacity) < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Capacity must be a positive integer.",
                });
            }

            updates.capacity = Number(updates.capacity);
        }

        if (
            updates.status !== undefined &&
            !["active", "inactive"].includes(updates.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid class status.",
            });
        }

        const schoolClass = await SchoolClass.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        return res.json({
            success: true,
            message: "Class updated successfully.",
            class: schoolClass,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This grade, section and academic year already exist.",
            });
        }

        console.error("Update class error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update class.",
        });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class ID.",
            });
        }

        const schoolClass = await SchoolClass.findById(id);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        if (schoolClass.students.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Remove enrolled students before deleting this class.",
            });
        }

        await schoolClass.deleteOne();

        return res.json({
            success: true,
            message: "Class deleted successfully.",
        });
    } catch (error) {
        console.error("Delete class error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete class.",
        });
    }
};

const assignStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        if (!isValidId(id) || !isValidId(studentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class or student ID.",
            });
        }

        const [schoolClass, student] = await Promise.all([
            SchoolClass.findById(id),
            Student.findById(studentId),
        ]);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found.",
            });
        }

        if (schoolClass.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign students to an inactive class.",
            });
        }

        if (schoolClass.students.some(
            (item) => item.toString() === studentId
        )) {
            return res.status(409).json({
                success: false,
                message: "Student is already assigned to this class.",
            });
        }

        if (schoolClass.students.length >= schoolClass.capacity) {
            return res.status(409).json({
                success: false,
                message: "Class capacity has been reached.",
            });
        }

        schoolClass.students.push(student._id);
        await schoolClass.save();

        return res.json({
            success: true,
            message: "Student assigned successfully.",
            class: schoolClass,
        });
    } catch (error) {
        console.error("Assign student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to assign student.",
        });
    }
};

const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        if (!isValidId(id) || !isValidId(studentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class or student ID.",
            });
        }

        const schoolClass = await SchoolClass.findById(id);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        schoolClass.students = schoolClass.students.filter(
            (item) => item.toString() !== studentId
        );

        await schoolClass.save();

        return res.json({
            success: true,
            message: "Student removed from class.",
            class: schoolClass,
        });
    } catch (error) {
        console.error("Remove student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove student.",
        });
    }
};

const assignClassTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;

        if (!isValidId(id) || !isValidId(teacherId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid class or teacher ID.",
            });
        }

        const [schoolClass, teacher] = await Promise.all([
            SchoolClass.findById(id),
            Teacher.findById(teacherId),
        ]);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found.",
            });
        }

        schoolClass.classTeacher = teacher._id;
        await schoolClass.save();

        return res.json({
            success: true,
            message: "Class teacher assigned successfully.",
            class: schoolClass,
        });
    } catch (error) {
        console.error("Assign class teacher error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to assign class teacher.",
        });
    }
};

const assignSubjectTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId, subject } = req.body;

        if (
            !isValidId(id) ||
            !isValidId(teacherId) ||
            !subject?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid class ID, teacher ID and subject are required.",
            });
        }

        const [schoolClass, teacher] = await Promise.all([
            SchoolClass.findById(id),
            Teacher.findById(teacherId),
        ]);

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found.",
            });
        }

        const normalizedSubject = subject.trim();

        const exists = schoolClass.subjectTeachers.some(
            (item) =>
                item.subject.toLowerCase() ===
                normalizedSubject.toLowerCase()
        );

        if (exists) {
            return res.status(409).json({
                success: false,
                message:
                    "A teacher is already assigned to this subject in this class.",
            });
        }

        schoolClass.subjectTeachers.push({
            teacherId: teacher._id,
            subject: normalizedSubject,
        });

        await schoolClass.save();

        return res.json({
            success: true,
            message: "Subject teacher assigned successfully.",
            class: schoolClass,
        });
    } catch (error) {
        console.error("Assign subject teacher error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to assign subject teacher.",
        });
    }
};

module.exports = {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    assignStudent,
    removeStudent,
    assignClassTeacher,
    assignSubjectTeacher,
};