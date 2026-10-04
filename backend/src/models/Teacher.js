const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        
        employeeId: {
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
            required: true,
            trim: true,
        },

        alternatePhone: {
            type: String,
            trim: true,
            default: "",
        },

        qualification: {
            type: String,
            trim: true,
            default: "",
        },

        specialization: {
            type: String,
            trim: true,
            default: "",
        },

        experience: {
            type: Number,
            min: 0,
            default: 0,
        },

        joiningDate: {
            type: Date,
            required: true,
        },

        department: {
            type: String,
            trim: true,
            default: "",
        },

        designation: {
            type: String,
            trim: true,
            default: "Teacher",
        },

        address: {
            type: String,
            trim: true,
            default: "",
        },

        city: {
            type: String,
            trim: true,
            default: "",
        },

        state: {
            type: String,
            trim: true,
            default: "",
        },

        pincode: {
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

module.exports = mongoose.model(
    "Teacher",
    teacherSchema
);