
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        grade: {
            type: String,
            required: true,
            trim: true,
        },

        section: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        academicYear: {
            type: String,
            required: true,
            trim: true,
        },

        room: {
            type: String,
            default: "",
            trim: true,
        },

        capacity: {
            type: Number,
            default: 40,
            min: 1,
        },

        classTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
        },

        subjectTeachers: [
            {
                teacherId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Teacher",
                    required: true,
                },
                subject: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
        ],

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

// A section must be unique within a grade
// and academic year.
classSchema.index(
    {
        grade: 1,
        section: 1,
        academicYear: 1,
    },
    { unique: true }
);

module.exports = mongoose.model(
    "Class",
    classSchema
);