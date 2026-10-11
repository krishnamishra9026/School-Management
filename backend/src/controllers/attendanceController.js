const mongoose = require("mongoose");

const Attendance = require("../models/Attendance");
const SchoolClass = require("../models/Class");
const Student = require("../models/Student");

const { getAccessScope, includesId } = require("../utils/accessScope");
const { isDayString, toDay, today, addDays } = require("../utils/dates");

const STATUSES = ["Present", "Absent", "Late"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const fullName = (person) =>
    person ? `${person.firstName || ""} ${person.lastName || ""}`.trim() : "";

const byRollNumber = (a, b) =>
    (Number(a.rollNumber) || Infinity) - (Number(b.rollNumber) || Infinity) ||
    fullName(a).localeCompare(fullName(b));

const emptyCounts = () => ({ Present: 0, Absent: 0, Late: 0, total: 0, rate: null });

// Late counts as attended
const withRate = (counts) => ({
    ...counts,
    rate: counts.total
        ? Math.round(((counts.Present + counts.Late) / counts.total) * 1000) / 10
        : null,
});

// Only admins/staff and teachers can mark or change attendance
const canWrite = (scope) => scope.isAdmin || scope.roleSlug === "teacher";

/**
 * Build the Mongo filter for record queries from query params,
 * restricted to what the user can see. Returns { error } when
 * a param is invalid or out of scope.
 */
const buildRecordFilter = async (scope, query) => {
    const { classId, studentId, status, from, to } = query;
    const filter = {};

    if (classId) {
        if (!isValidId(classId)) {
            return { error: "Invalid class ID." };
        }

        if (scope.roleSlug === "teacher" && !includesId(scope.classIds, classId)) {
            return { error: "You do not have access to this class." };
        }

        const schoolClass = await SchoolClass.findById(classId).select("students").lean();

        if (!schoolClass) {
            return { error: "Class not found." };
        }

        // Parents/students only ever see their own within a class
        filter.student = {
            $in: schoolClass.students.filter((id) =>
                includesId(scope.studentIds, id)
            ),
        };
    }

    if (studentId) {
        if (!isValidId(studentId) || !includesId(scope.studentIds, studentId)) {
            return { error: "You do not have access to this student." };
        }

        filter.student = new mongoose.Types.ObjectId(String(studentId));
    }

    // Default restriction for non-admins
    if (!filter.student && scope.studentIds !== null) {
        filter.student = { $in: scope.studentIds };
    }

    if (status) {
        if (!STATUSES.includes(status)) {
            return { error: "Invalid status." };
        }

        filter.status = status;
    }

    if (from || to) {
        if ((from && !isDayString(from)) || (to && !isDayString(to))) {
            return { error: "Dates must be in YYYY-MM-DD format." };
        }

        filter.date = {};
        if (from) filter.date.$gte = toDay(from);
        if (to) filter.date.$lte = toDay(to);
    }

    return { filter };
};

/**
 * GET /api/attendance/classes
 * Classes the user can take attendance for.
 */
const getAttendanceClasses = async (req, res) => {
    try {
        const scope = await getAccessScope(req.user);

        if (!canWrite(scope)) {
            return res.json({ success: true, classes: [] });
        }

        const filter = { status: "active" };

        if (scope.classIds !== null) {
            filter._id = { $in: scope.classIds };
        }

        const classes = await SchoolClass.find(filter)
            .select("name grade section academicYear students")
            .sort({ grade: 1, section: 1 })
            .lean();

        return res.json({
            success: true,
            classes: classes.map((c) => ({
                _id: c._id,
                name: c.name,
                section: c.section,
                academicYear: c.academicYear,
                students: c.students.length,
            })),
        });
    } catch (error) {
        console.error("Attendance classes error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch classes.",
        });
    }
};

/**
 * GET /api/attendance/sheet?classId=&date=YYYY-MM-DD
 * Class roster with each student's status for the day.
 */
const getAttendanceSheet = async (req, res) => {
    try {
        const { classId, date } = req.query;

        if (!isValidId(classId) || !isDayString(date)) {
            return res.status(400).json({
                success: false,
                message: "A valid class and date (YYYY-MM-DD) are required.",
            });
        }

        const scope = await getAccessScope(req.user);

        if (!canWrite(scope) || !includesId(scope.classIds, classId)) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this class.",
            });
        }

        const schoolClass = await SchoolClass.findById(classId)
            .populate("students", "firstName lastName admissionNumber rollNumber status")
            .lean();

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        const day = toDay(date);

        const records = await Attendance.find({
            student: { $in: schoolClass.students.map((s) => s._id) },
            date: day,
        }).lean();

        const recordByStudent = new Map(
            records.map((r) => [String(r.student), r])
        );

        const students = [...schoolClass.students]
            .sort(byRollNumber)
            .map((s) => {
                const record = recordByStudent.get(String(s._id));

                return {
                    _id: s._id,
                    name: fullName(s),
                    admissionNumber: s.admissionNumber,
                    rollNumber: s.rollNumber,
                    status: record?.status || null,
                    remarks: record?.remarks || "",
                    recordId: record?._id || null,
                };
            });

        return res.json({
            success: true,
            class: {
                _id: schoolClass._id,
                name: schoolClass.name,
                section: schoolClass.section,
                academicYear: schoolClass.academicYear,
            },
            date,
            isMarked: records.length > 0,
            markedCount: records.length,
            students,
        });
    } catch (error) {
        console.error("Attendance sheet error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load attendance sheet.",
        });
    }
};

/**
 * POST /api/attendance/sheet
 * Body: { classId, date, records: [{ studentId, status, remarks }] }
 * Creates or updates the day's attendance for the class.
 */
const saveAttendanceSheet = async (req, res) => {
    try {
        const { classId, date, records } = req.body;

        if (!isValidId(classId) || !isDayString(date) || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: "Class, date (YYYY-MM-DD) and records are required.",
            });
        }

        const day = toDay(date);

        if (day > today()) {
            return res.status(400).json({
                success: false,
                message: "Attendance cannot be marked for a future date.",
            });
        }

        const scope = await getAccessScope(req.user);

        if (!canWrite(scope) || !includesId(scope.classIds, classId)) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this class.",
            });
        }

        const schoolClass = await SchoolClass.findById(classId).select("students").lean();

        if (!schoolClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found.",
            });
        }

        const enrolled = new Set(schoolClass.students.map(String));

        const invalid = records.find(
            (r) =>
                !isValidId(r.studentId) ||
                !enrolled.has(String(r.studentId)) ||
                !STATUSES.includes(r.status)
        );

        if (invalid) {
            return res.status(400).json({
                success: false,
                message:
                    "Each record needs a student enrolled in this class and a status of Present, Absent or Late.",
            });
        }

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No attendance records to save.",
            });
        }

        await Attendance.bulkWrite(
            records.map((r) => ({
                updateOne: {
                    filter: { student: r.studentId, date: day },
                    update: {
                        $set: {
                            classId,
                            status: r.status,
                            remarks: String(r.remarks || "").trim(),
                            markedBy: req.user._id,
                        },
                    },
                    upsert: true,
                },
            }))
        );

        return res.json({
            success: true,
            message: `Attendance saved for ${records.length} students.`,
        });
    } catch (error) {
        console.error("Save attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save attendance.",
        });
    }
};

/**
 * GET /api/attendance?classId=&studentId=&status=&from=&to=&page=&limit=
 * Attendance records the user can see, with totals for the filter.
 */
const getAttendance = async (req, res) => {
    try {
        const scope = await getAccessScope(req.user);
        const { filter, error } = await buildRecordFilter(scope, req.query);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

        const [records, total, statusRows] = await Promise.all([
            Attendance.find(filter)
                .populate("student", "firstName lastName admissionNumber rollNumber className section")
                .populate("classId", "name section")
                .populate("markedBy", "name")
                .sort({ date: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Attendance.countDocuments(filter),
            Attendance.aggregate([
                { $match: filter },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        const summary = emptyCounts();
        statusRows.forEach((row) => {
            summary[row._id] = row.count;
            summary.total += row.count;
        });

        return res.json({
            success: true,
            records,
            summary: withRate(summary),
            canEdit: canWrite(scope),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch attendance.",
        });
    }
};

/**
 * GET /api/attendance/summary?classId=&studentId=&from=&to=
 * Student-wise totals. Defaults to the last 30 days.
 */
const getAttendanceSummary = async (req, res) => {
    try {
        const scope = await getAccessScope(req.user);

        const query = { ...req.query };

        if (!query.from && !query.to) {
            const end = today();
            query.from = addDays(end, -29).toISOString().slice(0, 10);
            query.to = end.toISOString().slice(0, 10);
        }

        const { filter, error } = await buildRecordFilter(scope, query);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const rows = await Attendance.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$student",
                    Present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                    Absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
                    Late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
                    total: { $sum: 1 },
                },
            },
        ]);

        const countsByStudent = new Map(rows.map((r) => [String(r._id), r]));

        // Show every student in range (with zero counts) when the
        // student set is known; otherwise only those with records.
        const studentFilter = filter.student || { $in: rows.map((r) => r._id) };

        const students = await Student.find({ _id: studentFilter })
            .select("firstName lastName admissionNumber rollNumber className section")
            .lean();

        const overall = emptyCounts();

        const result = students.sort(byRollNumber).map((s) => {
            const counts = countsByStudent.get(String(s._id)) || emptyCounts();

            STATUSES.forEach((key) => {
                overall[key] += counts[key];
            });
            overall.total += counts.total;

            return {
                _id: s._id,
                name: fullName(s),
                admissionNumber: s.admissionNumber,
                rollNumber: s.rollNumber,
                className: s.className,
                section: s.section,
                ...withRate({
                    Present: counts.Present,
                    Absent: counts.Absent,
                    Late: counts.Late,
                    total: counts.total,
                }),
            };
        });

        return res.json({
            success: true,
            from: query.from || null,
            to: query.to || null,
            overall: withRate(overall),
            students: result,
        });
    } catch (error) {
        console.error("Attendance summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch attendance summary.",
        });
    }
};

/**
 * Load a record and check the user may change it.
 */
const loadWritableRecord = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        res.status(400).json({ success: false, message: "Invalid attendance ID." });
        return null;
    }

    const record = await Attendance.findById(id);

    if (!record) {
        res.status(404).json({ success: false, message: "Attendance record not found." });
        return null;
    }

    const scope = await getAccessScope(req.user);

    if (!canWrite(scope) || !includesId(scope.studentIds, record.student)) {
        res.status(403).json({
            success: false,
            message: "You do not have permission to change this record.",
        });
        return null;
    }

    return record;
};

/**
 * PUT /api/attendance/:id
 * Body: { status, remarks }
 */
const updateAttendance = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        if (status !== undefined && !STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status." });
        }

        const record = await loadWritableRecord(req, res);

        if (!record) return;

        if (status !== undefined) record.status = status;
        if (remarks !== undefined) record.remarks = String(remarks).trim();
        record.markedBy = req.user._id;

        await record.save();

        return res.json({
            success: true,
            message: "Attendance updated.",
            record,
        });
    } catch (error) {
        console.error("Update attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update attendance.",
        });
    }
};

/**
 * DELETE /api/attendance/:id
 */
const deleteAttendance = async (req, res) => {
    try {
        const record = await loadWritableRecord(req, res);

        if (!record) return;

        await record.deleteOne();

        return res.json({
            success: true,
            message: "Attendance record deleted.",
        });
    } catch (error) {
        console.error("Delete attendance error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete attendance.",
        });
    }
};

module.exports = {
    getAttendanceClasses,
    getAttendanceSheet,
    saveAttendanceSheet,
    getAttendance,
    getAttendanceSummary,
    updateAttendance,
    deleteAttendance,
};
