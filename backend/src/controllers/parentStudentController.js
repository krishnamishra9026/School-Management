const mongoose = require("mongoose");

const Parent = require("../models/Parent");
const Student = require("../models/Student");
const ParentStudent = require("../models/ParentStudent");

/*
|--------------------------------------------------------------------------
| Create Parent Student Relationship
|--------------------------------------------------------------------------
| POST /api/parent-students
|--------------------------------------------------------------------------
*/

const createParentStudent = async (req, res) => {
    try {
        const {
            parentId,
            studentId,
            relationship,
            isPrimary = false,
            status = "active",
        } = req.body;

        if (!parentId || !studentId) {
            return res.status(400).json({
                success: false,
                message:
                    "Parent and student are required.",
            });
        }

        if (!relationship) {
            return res.status(400).json({
                success: false,
                message:
                    "Relationship is required.",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                parentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid parent ID.",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                studentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid student ID.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Parent
        |--------------------------------------------------------------------------
        */

        const parent =
            await Parent.findById(parentId);

        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Student
        |--------------------------------------------------------------------------
        */

        const student =
            await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Existing Relationship
        |--------------------------------------------------------------------------
        */

        const existing =
            await ParentStudent.findOne({
                parentId,
                studentId,
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "This student is already linked to this parent.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Primary Parent
        |--------------------------------------------------------------------------
        */

        if (isPrimary) {
            await ParentStudent.updateMany(
                {
                    studentId,
                    _id: {
                        $ne: null,
                    },
                },
                {
                    $set: {
                        isPrimary: false,
                    },
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create Relationship
        |--------------------------------------------------------------------------
        */

        const parentStudent =
            await ParentStudent.create({
                parentId,
                studentId,
                relationship,
                isPrimary,
                status,
            });

        const populated =
            await ParentStudent.findById(
                parentStudent._id
            )
                .populate(
                    "parentId",
                    "firstName lastName phone userId"
                )
                .populate(
                    "studentId",
                    "firstName lastName admissionNumber className section rollNumber"
                );

        res.status(201).json({
            success: true,
            message:
                "Student linked to parent successfully.",
            parentStudent: populated,
        });
    } catch (error) {
        console.error(
            "Create parent student error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This student is already linked to this parent.",
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Unable to link student to parent.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Relationships
|--------------------------------------------------------------------------
| GET /api/parent-students
|--------------------------------------------------------------------------
|
| Optional:
| ?parentId=...
| ?studentId=...
| ?status=active
|--------------------------------------------------------------------------
*/

const getParentStudents = async (req, res) => {
    try {
        const {
            parentId,
            studentId,
            status,
        } = req.query;

        const filter = {};

        if (parentId) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    parentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid parent ID.",
                });
            }

            filter.parentId = parentId;
        }

        if (studentId) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    studentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID.",
                });
            }

            filter.studentId = studentId;
        }

        if (status) {
            filter.status = status;
        }

        const relationships =
            await ParentStudent.find(filter)
                .populate(
                    "parentId",
                    "firstName lastName phone userId"
                )
                .populate(
                    "studentId",
                    "firstName lastName admissionNumber className section rollNumber"
                )
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,
            count: relationships.length,
            parentStudents:
                relationships,
        });
    } catch (error) {
        console.error(
            "Get parent students error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch relationships.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Single Relationship
|--------------------------------------------------------------------------
| GET /api/parent-students/:id
|--------------------------------------------------------------------------
*/

const getParentStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid relationship ID.",
            });
        }

        const relationship =
            await ParentStudent.findById(id)
                .populate(
                    "parentId",
                    "firstName lastName phone userId"
                )
                .populate(
                    "studentId",
                    "firstName lastName admissionNumber className section rollNumber"
                );

        if (!relationship) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent-student relationship not found.",
            });
        }

        res.status(200).json({
            success: true,
            parentStudent:
                relationship,
        });
    } catch (error) {
        console.error(
            "Get parent student error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch relationship.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Relationship
|--------------------------------------------------------------------------
| PUT /api/parent-students/:id
|--------------------------------------------------------------------------
*/

const updateParentStudent = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid relationship ID.",
            });
        }

        const relationship =
            await ParentStudent.findById(id);

        if (!relationship) {
            return res.status(404).json({
                success: false,
                message:
                    "Relationship not found.",
            });
        }

        const {
            parentId,
            studentId,
            relationship: relation,
            isPrimary,
            status,
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Parent Change
        |--------------------------------------------------------------------------
        */

        if (
            parentId &&
            String(parentId) !==
                String(
                    relationship.parentId
                )
        ) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    parentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid parent ID.",
                });
            }

            const parent =
                await Parent.findById(
                    parentId
                );

            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Parent not found.",
                });
            }

            relationship.parentId =
                parentId;
        }

        /*
        |--------------------------------------------------------------------------
        | Student Change
        |--------------------------------------------------------------------------
        */

        if (
            studentId &&
            String(studentId) !==
                String(
                    relationship.studentId
                )
        ) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    studentId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID.",
                });
            }

            const student =
                await Student.findById(
                    studentId
                );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found.",
                });
            }

            const duplicate =
                await ParentStudent.findOne(
                    {
                        parentId:
                            relationship.parentId,
                        studentId,
                        _id: {
                            $ne: id,
                        },
                    }
                );

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This student is already linked to this parent.",
                });
            }

            relationship.studentId =
                studentId;
        }

        if (relation !== undefined) {
            relationship.relationship =
                relation;
        }

        /*
        |--------------------------------------------------------------------------
        | Primary
        |--------------------------------------------------------------------------
        */

        if (isPrimary === true) {
            await ParentStudent.updateMany(
                {
                    studentId:
                        relationship.studentId,
                    _id: {
                        $ne: id,
                    },
                },
                {
                    $set: {
                        isPrimary: false,
                    },
                }
            );

            relationship.isPrimary =
                true;
        }

        if (isPrimary === false) {
            relationship.isPrimary =
                false;
        }

        if (status !== undefined) {
            relationship.status =
                status;
        }

        await relationship.save();

        const updated =
            await ParentStudent.findById(
                relationship._id
            )
                .populate(
                    "parentId",
                    "firstName lastName phone userId"
                )
                .populate(
                    "studentId",
                    "firstName lastName admissionNumber className section rollNumber"
                );

        res.status(200).json({
            success: true,
            message:
                "Parent-student relationship updated successfully.",
            parentStudent: updated,
        });
    } catch (error) {
        console.error(
            "Update parent student error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This student is already linked to this parent.",
            });
        }

        res.status(500).json({
            success: false,
            message:
                "Unable to update relationship.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Relationship
|--------------------------------------------------------------------------
| DELETE /api/parent-students/:id
|--------------------------------------------------------------------------
|
| Only removes the relationship.
| Parent and Student are NOT deleted.
|--------------------------------------------------------------------------
*/

const deleteParentStudent = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid relationship ID.",
            });
        }

        const relationship =
            await ParentStudent.findById(id);

        if (!relationship) {
            return res.status(404).json({
                success: false,
                message:
                    "Relationship not found.",
            });
        }

        await ParentStudent.findByIdAndDelete(
            id
        );

        res.status(200).json({
            success: true,
            message:
                "Student unlinked from parent successfully.",
        });
    } catch (error) {
        console.error(
            "Delete parent student error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to remove relationship.",
        });
    }
};

module.exports = {
    createParentStudent,
    getParentStudents,
    getParentStudent,
    updateParentStudent,
    deleteParentStudent,
};