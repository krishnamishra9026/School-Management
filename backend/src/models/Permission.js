const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        module: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
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

        isSystemPermission: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

permissionSchema.index({ module: 1 });
permissionSchema.index({ status: 1 });

module.exports = mongoose.model(
    "Permission",
    permissionSchema
);