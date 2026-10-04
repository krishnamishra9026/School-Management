const mongoose = require("mongoose");

const Teacher = require("../models/Teacher");


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

        const teacher =
            await Teacher.findByIdAndUpdate(
                id,
                {
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


module.exports = {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
};