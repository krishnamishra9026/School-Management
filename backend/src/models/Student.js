const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        admissionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
            default: "",
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: null,
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        className: {
            type: String,
            required: true,
            trim: true,
        },

        section: {
            type: String,
            trim: true,
            default: "",
        },

        rollNumber: {
            type: String,
            trim: true,
            default: "",
        },

        fatherName: {
            type: String,
            trim: true,
            default: "",
        },

        motherName: {
            type: String,
            trim: true,
            default: "",
        },

        address: {
            type: String,
            trim: true,
            default: "",
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

module.exports = mongoose.model("Student", studentSchema);