const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null,
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
        },

        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parent",
            default: null,
        },


        phone: {
            type: String,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            trim: true,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;