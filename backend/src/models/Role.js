const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        isSystemRole: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

roleSchema.index({ status: 1 });

module.exports = mongoose.model("Role", roleSchema);