const mongoose = require("mongoose");

const parentStudentSchema = new mongoose.Schema(
    {
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parent",
            required: true,
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        relationship: {
            type: String,
            enum: [
                "father",
                "mother",
                "guardian",
            ],
            required: true,
        },

        isPrimary: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Same student cannot be linked twice to same parent
parentStudentSchema.index(
    {
        parentId: 1,
        studentId: 1,
    },
    {
        unique: true,
    }
);

module.exports =
    mongoose.model(
        "ParentStudent",
        parentStudentSchema
    );