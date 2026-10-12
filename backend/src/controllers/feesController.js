const mongoose = require("mongoose");

const Fee = require("../models/Fee");
const SchoolClass = require("../models/Class");
const Student = require("../models/Student");

const { getAccessScope, includesId } = require("../utils/accessScope");

const STATUS_FILTERS = ["pending", "partial", "paid", "overdue"];

const STUDENT_FIELDS = "firstName lastName admissionNumber rollNumber className section";

const EDITABLE_FIELDS = [
    "title",
    "feeType",
    "academicYear",
    "amount",
    "discount",
    "fine",
    "dueDate",
    "remarks",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const round = (value) => Math.round(value * 100) / 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only admins/staff (accountant, school admin...) manage fees;
// parents and students only ever read their own.
const canWrite = (scope) => scope.isAdmin;

const toNumber = (value, fallback = 0) => {
    if (value === "" || value === null || value === undefined) {
        return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : NaN;
};

// Lean documents skip virtuals; add the computed figures here
const present = (fee) => {
    const netAmount = round(
        (fee.amount || 0) - (fee.discount || 0) + (fee.fine || 0)
    );

    return {
        ...fee,
        netAmount,
        balance: round(Math.max(netAmount - (fee.paidAmount || 0), 0)),
        isOverdue: fee.status !== "paid" && new Date(fee.dueDate) < new Date(),
    };
};

/**
 * Validate and normalise the editable fee fields.
 * Returns { values } or { error }.
 */
const readFeeFields = (body, { partial = false } = {}) => {
    const values = {};

    for (const field of EDITABLE_FIELDS) {
        if (body[field] !== undefined) {
            values[field] = body[field];
        }
    }

    if (!partial || values.title !== undefined) {
        if (!String(values.title || "").trim()) {
            return { error: "Fee title is required." };
        }

        values.title = String(values.title).trim();
    }

    if (values.feeType !== undefined && !Fee.FEE_TYPES.includes(values.feeType)) {
        return { error: "Invalid fee type." };
    }

    for (const field of ["amount", "discount", "fine"]) {
        if (values[field] === undefined) {
            if (!partial && field === "amount") {
                return { error: "Amount is required." };
            }

            continue;
        }

        const number = toNumber(values[field]);

        if (Number.isNaN(number) || number < 0) {
            return { error: `${field[0].toUpperCase()}${field.slice(1)} must be a positive number.` };
        }

        values[field] = round(number);
    }

    if (!partial || values.dueDate !== undefined) {
        const dueDate = new Date(values.dueDate);

        if (!values.dueDate || Number.isNaN(dueDate.getTime())) {
            return { error: "A valid due date is required." };
        }

        values.dueDate = dueDate;
    }

    return { values };
};

/**
 * Build the Mongo filter for fee lists from query params,
 * restricted to what the user can see. Returns { error }
 * when a param is invalid or out of scope.
 */
const buildFeeFilter = async (scope, query) => {
    const { classId, studentId, status, feeType, academicYear, search } = query;
    const filter = {};

    if (classId) {
        if (!isValidId(classId)) {
            return { error: "Invalid class ID." };
        }

        filter.classId = toObjectId(classId);
    }

    if (studentId) {
        if (!isValidId(studentId) || !includesId(scope.studentIds, studentId)) {
            return { error: "You do not have access to this student." };
        }

        filter.student = toObjectId(studentId);
    } else if (scope.studentIds !== null) {
        filter.student = { $in: scope.studentIds };
    }

    if (search && String(search).trim()) {
        const regex = new RegExp(escapeRegex(String(search).trim()), "i");

        const studentIds = await Student.distinct("_id", {
            $or: [
                { firstName: regex },
                { lastName: regex },
                { admissionNumber: regex },
            ],
        });

        // Match on the fee title or the student's name
        filter.$or = [
            { title: regex },
            {
                student: {
                    $in: studentIds.filter((id) => includesId(scope.studentIds, id)),
                },
            },
        ];
    }

    if (status) {
        if (!STATUS_FILTERS.includes(status)) {
            return { error: "Invalid status filter." };
        }

        if (status === "overdue") {
            filter.status = { $ne: "paid" };
            filter.dueDate = { $lt: new Date() };
        } else {
            filter.status = status;
        }
    }

    if (feeType) {
        if (!Fee.FEE_TYPES.includes(feeType)) {
            return { error: "Invalid fee type." };
        }

        filter.feeType = feeType;
    }

    if (academicYear) {
        filter.academicYear = String(academicYear).trim();
    }

    return { filter };
};

const emptySummary = () => ({
    totalAmount: 0,
    collected: 0,
    outstanding: 0,
    count: 0,
    pending: 0,
    partial: 0,
    paid: 0,
    overdue: 0,
});

const getSummary = async (filter) => {
    const [row] = await Fee.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalAmount: {
                    $sum: { $add: [{ $subtract: ["$amount", "$discount"] }, "$fine"] },
                },
                collected: { $sum: "$paidAmount" },
                count: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                partial: { $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] } },
                paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
                overdue: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ["$status", "paid"] },
                                    { $lt: ["$dueDate", new Date()] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    if (!row) {
        return emptySummary();
    }

    const { _id, ...summary } = row;

    return {
        ...summary,
        totalAmount: round(summary.totalAmount),
        collected: round(summary.collected),
        outstanding: round(Math.max(summary.totalAmount - summary.collected, 0)),
    };
};

/**
 * Load a fee the user may see. Sends the error response and
 * returns null when it is missing or out of scope.
 */
const loadFee = async (req, res, { write = false } = {}) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        res.status(400).json({ success: false, message: "Invalid fee ID." });
        return null;
    }

    const scope = await getAccessScope(req.user);

    if (write && !canWrite(scope)) {
        res.status(403).json({
            success: false,
            message: "You do not have permission to manage fees.",
        });
        return null;
    }

    const fee = await Fee.findById(id);

    if (!fee || !includesId(scope.studentIds, fee.student)) {
        res.status(404).json({ success: false, message: "Fee not found." });
        return null;
    }

    return fee;
};

const populateFee = (query) =>
    query
        .populate("student", STUDENT_FIELDS)
        .populate("classId", "name grade section")
        .populate("createdBy", "name")
        .populate("payments.receivedBy", "name");

const sendFee = async (res, id, status = 200, message) => {
    const fee = await populateFee(Fee.findById(id)).lean();

    return res.status(status).json({
        success: true,
        ...(message && { message }),
        fee: present(fee),
    });
};

/*
 * GET /fees
 * Query: page, limit, search, classId, studentId, status,
 *        feeType, academicYear
 */
const getFees = async (req, res) => {
    try {
        const scope = await getAccessScope(req.user);
        const { filter, error } = await buildFeeFilter(scope, req.query);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

        const [fees, total, summary] = await Promise.all([
            populateFee(Fee.find(filter))
                .sort({ dueDate: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Fee.countDocuments(filter),
            getSummary(filter),
        ]);

        return res.json({
            success: true,
            fees: fees.map(present),
            summary,
            canEdit: canWrite(scope),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get fees error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch fees.",
        });
    }
};

/*
 * GET /fees/:id
 */
const getFee = async (req, res) => {
    try {
        const fee = await loadFee(req, res);

        if (!fee) {
            return;
        }

        return sendFee(res, fee._id);
    } catch (error) {
        console.error("Get fee error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch fee.",
        });
    }
};

/*
 * POST /fees
 * Body: fee fields plus either
 *   - studentId (one student; classId optional), or
 *   - classId + applyToClass: true (every student in the class)
 */
const createFee = async (req, res) => {
    try {
        const scope = await getAccessScope(req.user);

        if (!canWrite(scope)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to manage fees.",
            });
        }

        const { values, error } = readFeeFields(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const { studentId, classId, applyToClass } = req.body;

        if (classId && !isValidId(classId)) {
            return res.status(400).json({ success: false, message: "Invalid class ID." });
        }

        const schoolClass = classId
            ? await SchoolClass.findById(classId).select("students academicYear").lean()
            : null;

        if (classId && !schoolClass) {
            return res.status(404).json({ success: false, message: "Class not found." });
        }

        const base = {
            ...values,
            academicYear: values.academicYear || schoolClass?.academicYear || "",
            createdBy: req.user._id,
        };

        if (applyToClass) {
            if (!schoolClass) {
                return res.status(400).json({
                    success: false,
                    message: "Select a class to assign the fee to.",
                });
            }

            if (!schoolClass.students.length) {
                return res.status(400).json({
                    success: false,
                    message: "This class has no students.",
                });
            }

            // create() (not insertMany) so the status hook runs
            const fees = await Fee.create(
                schoolClass.students.map((student) => ({
                    ...base,
                    student,
                    classId: schoolClass._id,
                }))
            );

            return res.status(201).json({
                success: true,
                message: `Fee assigned to ${fees.length} students.`,
                count: fees.length,
            });
        }

        if (!studentId || !isValidId(studentId)) {
            return res.status(400).json({
                success: false,
                message: "Select a student.",
            });
        }

        const student = await Student.findById(studentId).select("_id").lean();

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        // Default to the class the student is enrolled in
        const studentClass =
            schoolClass ||
            (await SchoolClass.findOne({ students: student._id }).select("_id").lean());

        const fee = await Fee.create({
            ...base,
            student: student._id,
            classId: studentClass?._id || null,
        });

        return sendFee(res, fee._id, 201, "Fee created successfully.");
    } catch (error) {
        console.error("Create fee error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create fee.",
        });
    }
};

/*
 * PUT /fees/:id
 */
const updateFee = async (req, res) => {
    try {
        const fee = await loadFee(req, res, { write: true });

        if (!fee) {
            return;
        }

        const { values, error } = readFeeFields(req.body, { partial: true });

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        fee.set(values);

        if (fee.netAmount < fee.paidAmount) {
            return res.status(400).json({
                success: false,
                message: `Net amount cannot be less than the ${fee.paidAmount} already paid.`,
            });
        }

        await fee.save();

        return sendFee(res, fee._id, 200, "Fee updated successfully.");
    } catch (error) {
        console.error("Update fee error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update fee.",
        });
    }
};

/*
 * DELETE /fees/:id
 */
const deleteFee = async (req, res) => {
    try {
        const fee = await loadFee(req, res, { write: true });

        if (!fee) {
            return;
        }

        await fee.deleteOne();

        return res.json({
            success: true,
            message: "Fee deleted successfully.",
        });
    } catch (error) {
        console.error("Delete fee error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete fee.",
        });
    }
};

/*
 * POST /fees/:id/payments
 * Body: amount, method, reference, paidOn, remarks
 */
const addPayment = async (req, res) => {
    try {
        const fee = await loadFee(req, res, { write: true });

        if (!fee) {
            return;
        }

        const amount = round(toNumber(req.body.amount, NaN));

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than zero.",
            });
        }

        if (amount > fee.balance) {
            return res.status(400).json({
                success: false,
                message: `Payment cannot exceed the balance of ${fee.balance}.`,
            });
        }

        const method = req.body.method || "cash";

        if (!Fee.PAYMENT_METHODS.includes(method)) {
            return res.status(400).json({ success: false, message: "Invalid payment method." });
        }

        const paidOn = req.body.paidOn ? new Date(req.body.paidOn) : new Date();

        if (Number.isNaN(paidOn.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid payment date." });
        }

        fee.payments.push({
            amount,
            method,
            paidOn,
            reference: req.body.reference || "",
            remarks: req.body.remarks || "",
            receivedBy: req.user._id,
        });

        await fee.save();

        return sendFee(res, fee._id, 201, "Payment recorded successfully.");
    } catch (error) {
        console.error("Add fee payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to record payment.",
        });
    }
};

/*
 * DELETE /fees/:id/payments/:paymentId
 */
const deletePayment = async (req, res) => {
    try {
        const fee = await loadFee(req, res, { write: true });

        if (!fee) {
            return;
        }

        const payment = fee.payments.id(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found." });
        }

        payment.deleteOne();

        await fee.save();

        return sendFee(res, fee._id, 200, "Payment removed successfully.");
    } catch (error) {
        console.error("Delete fee payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove payment.",
        });
    }
};

module.exports = {
    getFees,
    getFee,
    createFee,
    updateFee,
    deleteFee,
    addPayment,
    deletePayment,
};
