const mongoose = require("mongoose");

const FEE_TYPES = [
    "tuition",
    "admission",
    "transport",
    "exam",
    "library",
    "sports",
    "other",
];

const PAYMENT_METHODS = [
    "cash",
    "card",
    "upi",
    "bank_transfer",
    "cheque",
    "online",
];

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },

        method: {
            type: String,
            enum: PAYMENT_METHODS,
            default: "cash",
        },

        // Receipt / transaction / cheque number
        reference: {
            type: String,
            trim: true,
            default: "",
        },

        paidOn: {
            type: Date,
            default: Date.now,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const feeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        // Class the fee was raised for
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            default: null,
        },

        // e.g. "Tuition Fee - April"
        title: {
            type: String,
            required: true,
            trim: true,
        },

        feeType: {
            type: String,
            enum: FEE_TYPES,
            default: "tuition",
        },

        academicYear: {
            type: String,
            trim: true,
            default: "",
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        fine: {
            type: Number,
            default: 0,
            min: 0,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        payments: {
            type: [paymentSchema],
            default: [],
        },

        // Kept in sync with payments by the pre-validate hook
        paidAmount: {
            type: Number,
            default: 0,
        },

        // Overdue is derived at read time (unpaid + past due date)
        status: {
            type: String,
            enum: ["pending", "partial", "paid"],
            default: "pending",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const round = (value) => Math.round(value * 100) / 100;

feeSchema.virtual("netAmount").get(function () {
    return round((this.amount || 0) - (this.discount || 0) + (this.fine || 0));
});

feeSchema.virtual("balance").get(function () {
    return round(Math.max(this.netAmount - (this.paidAmount || 0), 0));
});

feeSchema.virtual("isOverdue").get(function () {
    return this.status !== "paid" && this.dueDate && this.dueDate < new Date();
});

feeSchema.pre("validate", function () {
    this.paidAmount = round(
        this.payments.reduce((sum, payment) => sum + payment.amount, 0)
    );

    if (this.paidAmount <= 0) {
        this.status = "pending";
    } else if (this.paidAmount >= this.netAmount) {
        this.status = "paid";
    } else {
        this.status = "partial";
    }
});

feeSchema.index({ student: 1, dueDate: -1 });
feeSchema.index({ classId: 1, status: 1 });
feeSchema.index({ status: 1, dueDate: 1 });

feeSchema.statics.FEE_TYPES = FEE_TYPES;
feeSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;

module.exports = mongoose.model("Fee", feeSchema);
