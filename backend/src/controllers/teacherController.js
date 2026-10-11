const mongoose = require("mongoose");

const Teacher = require("../models/Teacher");
const User = require("../models/User");
const SchoolClass = require("../models/Class");

/**
 * Validate that userId points to an existing user not
 * already linked to another teacher. Returns an error
 * message, or null when valid.
 */
const validateTeacherUser = async (userId, teacherId = null) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return "A valid user is required.";
    }

    const user = await User.findById(userId).select("_id");

    if (!user) {
        return "Selected user not found.";
    }

    const linked = await Teacher.findOne({
        userId,
        ...(teacherId && { _id: { $ne: teacherId } }),
    }).select("_id");

    if (linked) {
        return "This user is already assigned to another teacher.";
    }

    return null;
};


/**
 * GET /api/teachers
 */
const getTeachers = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
        } = req.query;

        page = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        limit = Math.min(
            Math.max(
                parseInt(limit, 10) || 10,
                1
            ),
            100
        );

        const skip =
            (page - 1) * limit;

        const filter = {};

        if (search.trim()) {
            const regex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                {
                    firstName: regex,
                },
                {
                    lastName: regex,
                },
                {
                    employeeId: regex,
                },
                {
                    email: regex,
                },
                {
                    phone: regex,
                },
                {
                    department: regex,
                },
                {
                    designation: regex,
                },
                {
                    qualification: regex,
                },
                {
                    specialization: regex,
                },
            ];
        }

        const [
            teachers,
            total,
        ] = await Promise.all([
            Teacher.find(filter)
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            Teacher.countDocuments(
                filter
            ),
        ]);

        res.status(200).json({
            teachers,

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get teachers error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to fetch teachers.",
        });
    }
};


/**
 * GET /api/teachers/:id
 */
const getTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID.",
            });
        }

        const teacher =
            await Teacher.findById(
                id
            ).lean();

        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found.",
            });
        }

        res.status(200).json({
            teacher,
        });
    } catch (error) {
        console.error(
            "Get teacher error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to fetch teacher.",
        });
    }
};


/**
 * POST /api/teachers
 */
const createTeacher = async (
    req,
    res
) => {
    try {
        const {
            userId,
            employeeId,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            email,
            phone,
            alternatePhone,
            qualification,
            specialization,
            experience,
            joiningDate,
            department,
            designation,
            address,
            city,
            state,
            pincode,
            status,
        } = req.body;

        if (
            !employeeId ||
            !firstName ||
            !phone ||
            !joiningDate
        ) {
            return res.status(400).json({
                message:
                    "Employee ID, first name, phone and joining date are required.",
            });
        }

        const userError = await validateTeacherUser(userId);

        if (userError) {
            return res.status(400).json({
                message: userError,
            });
        }

        const existingTeacher =
            await Teacher.findOne({
                employeeId,
            });

        if (existingTeacher) {
            return res.status(409).json({
                message:
                    "A teacher with this employee ID already exists.",
            });
        }

        const teacher =
            await Teacher.create({
                userId,
                employeeId,
                firstName,
                lastName,
                gender,
                dateOfBirth:
                    dateOfBirth || null,
                email,
                phone,
                alternatePhone,
                qualification,
                specialization,
                experience:
                    experience || 0,
                joiningDate,
                department,
                designation:
                    designation ||
                    "Teacher",
                address,
                city,
                state,
                pincode,
                status:
                    status || "active",
            });

        await User.findByIdAndUpdate(userId, {
            teacherId: teacher._id,
        });

        res.status(201).json({
            message:
                "Teacher created successfully.",
            teacher,
        });
    } catch (error) {
        console.error(
            "Create teacher error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "A teacher with this employee ID already exists.",
            });
        }

        res.status(500).json({
            message:
                "Unable to create teacher.",
        });
    }
};


/**
 * PUT /api/teachers/:id
 */
const updateTeacher = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID.",
            });
        }

        const {
            userId,
            employeeId,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            email,
            phone,
            alternatePhone,
            qualification,
            specialization,
            experience,
            joiningDate,
            department,
            designation,
            address,
            city,
            state,
            pincode,
            status,
        } = req.body;

        if (
            !employeeId ||
            !firstName ||
            !phone ||
            !joiningDate
        ) {
            return res.status(400).json({
                message:
                    "Employee ID, first name, phone and joining date are required.",
            });
        }

        const userError = await validateTeacherUser(userId, id);

        if (userError) {
            return res.status(400).json({
                message: userError,
            });
        }

        const existingTeacher =
            await Teacher.findOne({
                employeeId,
                _id: {
                    $ne: id,
                },
            });

        if (existingTeacher) {
            return res.status(409).json({
                message:
                    "Another teacher already has this employee ID.",
            });
        }

        const previous = await Teacher.findById(id).select("userId");

        const teacher =
            await Teacher.findByIdAndUpdate(
                id,
                {
                    userId,
                    employeeId,
                    firstName,
                    lastName,
                    gender,
                    dateOfBirth:
                        dateOfBirth || null,
                    email,
                    phone,
                    alternatePhone,
                    qualification,
                    specialization,
                    experience:
                        experience || 0,
                    joiningDate,
                    department,
                    designation:
                        designation ||
                        "Teacher",
                    address,
                    city,
                    state,
                    pincode,
                    status:
                        status || "active",
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found.",
            });
        }

        if (
            previous?.userId &&
            String(previous.userId) !== String(userId)
        ) {
            await User.findByIdAndUpdate(previous.userId, {
                teacherId: null,
            });
        }

        await User.findByIdAndUpdate(userId, {
            teacherId: teacher._id,
        });

        res.status(200).json({
            message:
                "Teacher updated successfully.",
            teacher,
        });
    } catch (error) {
        console.error(
            "Update teacher error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "A teacher with this employee ID already exists.",
            });
        }

        res.status(500).json({
            message:
                "Unable to update teacher.",
        });
    }
};


/**
 * DELETE /api/teachers/:id
 */
const deleteTeacher = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID.",
            });
        }

        const teacher =
            await Teacher.findByIdAndDelete(
                id
            );

        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found.",
            });
        }

        if (teacher.userId) {
            await User.findByIdAndUpdate(teacher.userId, {
                teacherId: null,
            });
        }

        res.status(200).json({
            message:
                "Teacher deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete teacher error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to delete teacher.",
        });
    }
};


/**
 * GET /api/teachers/me/panel
 * Logged-in teacher's classes, subjects and students
 */
const getMyPanel = async (
    req,
    res
) => {
    try {
        const teacher =
            await Teacher.findOne({
                userId: req.user._id,
            }).lean();

        if (!teacher) {
            return res.status(404).json({
                message:
                    "No teacher profile is linked to your account.",
            });
        }

        const classes =
            await SchoolClass.find({
                $or: [
                    { classTeacher: teacher._id },
                    {
                        "subjectTeachers.teacherId":
                            teacher._id,
                    },
                ],
            })
                .populate(
                    "subjectTeachers.teacherId",
                    "firstName lastName"
                )
                .populate(
                    "students",
                    "admissionNumber firstName lastName rollNumber gender email phone status"
                )
                .sort({ grade: 1, section: 1 })
                .lean();

        const teacherId = String(teacher._id);
        const allSubjects = new Set();
        const studentIds = new Set();

        const panelClasses = classes.map((item) => {
            const subjects = item.subjectTeachers.map(
                (st) => ({
                    subject: st.subject,
                    teacherName: st.teacherId
                        ? `${st.teacherId.firstName} ${st.teacherId.lastName || ""}`.trim()
                        : "—",
                    isMine:
                        String(st.teacherId?._id) ===
                        teacherId,
                })
            );

            const mySubjects = subjects
                .filter((s) => s.isMine)
                .map((s) => s.subject);

            mySubjects.forEach((s) => allSubjects.add(s));
            item.students.forEach((s) =>
                studentIds.add(String(s._id))
            );

            return {
                _id: item._id,
                name: item.name,
                grade: item.grade,
                section: item.section,
                academicYear: item.academicYear,
                room: item.room,
                status: item.status,
                isClassTeacher:
                    String(item.classTeacher) === teacherId,
                mySubjects,
                subjects,
                students: item.students,
            };
        });

        res.status(200).json({
            teacher: {
                _id: teacher._id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                employeeId: teacher.employeeId,
            },
            subjects: [...allSubjects].sort(),
            totalStudents: studentIds.size,
            classes: panelClasses,
        });
    } catch (error) {
        console.error(
            "Teacher panel error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load teacher panel.",
        });
    }
};


module.exports = {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getMyPanel,
};