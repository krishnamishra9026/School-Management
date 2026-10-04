const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
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

        relationship: {
            type: String,
            enum: [
                "father",
                "mother",
                "guardian",
            ],
            required: true,
        },

        occupation: {
            type: String,
            trim: true,
            default: "",
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

module.exports = mongoose.model("Parent", parentSchema);