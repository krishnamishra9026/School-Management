const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        // Class the attendance was taken in
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            default: null,
        },

        // Stored as UTC midnight of the calendar day (see utils/dates)
        date: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["Present", "Absent", "Late"],
            required: true,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// One record per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
