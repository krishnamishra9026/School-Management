const mongoose = require("mongoose");

const Role = require("../models/Role");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const ParentStudent = require("../models/ParentStudent");
const SchoolClass = require("../models/Class");
const Attendance = require("../models/Attendance");
const { today, addDays } = require("../utils/dates");

const fullName = (person) =>
    person
        ? `${person.firstName || ""} ${person.lastName || ""}`.trim()
        : "";

const startOfToday = () => today();

const daysAgo = (days) => addDays(today(), -days);

/**
 * Attendance summary for a set of students since a date.
 * Late counts as attended. Returns null rate when no records.
 */
const attendanceSummary = async (studentIds, since) => {
    const match = { date: { $gte: since } };

    if (studentIds) {
        match.student = { $in: studentIds };
    }

    const rows = await Attendance.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = { Present: 0, Absent: 0, Late: 0 };
    rows.forEach((r) => {
        counts[r._id] = r.count;
    });

    const total = counts.Present + counts.Absent + counts.Late;

    return {
        ...counts,
        total,
        rate: total
            ? Math.round(((counts.Present + counts.Late) / total) * 1000) / 10
            : null,
    };
};

/*
|--------------------------------------------------------------------------
| Admin / Super Admin
|--------------------------------------------------------------------------
*/
const adminDashboard = async (roleSlug) => {
    const [
        students,
        teachers,
        parents,
        classes,
        users,
        recentStudents,
        classRows,
        attendanceToday,
    ] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Parent.countDocuments(),
        SchoolClass.countDocuments(),
        User.countDocuments(),
        Student.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .select("firstName lastName admissionNumber className section status createdAt")
            .lean(),
        SchoolClass.find()
            .populate("classTeacher", "firstName lastName")
            .select("name grade section academicYear capacity students classTeacher status")
            .sort({ grade: 1, section: 1 })
            .lean(),
        attendanceSummary(null, startOfToday()),
    ]);

    const classSummary = classRows.map((c) => ({
        _id: c._id,
        name: c.name,
        section: c.section,
        academicYear: c.academicYear,
        classTeacher: fullName(c.classTeacher) || null,
        enrolled: c.students.length,
        capacity: c.capacity,
    }));

    const result = {
        stats: { students, teachers, parents, classes, users },
        attendanceToday,
        recentStudents,
        classSummary,
        classesWithoutTeacher: classSummary.filter((c) => !c.classTeacher).length,
    };

    // Super admin also sees the user breakdown by role
    if (roleSlug === "super_admin") {
        const byRole = await User.aggregate([
            { $group: { _id: "$roleId", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "roles",
                    localField: "_id",
                    foreignField: "_id",
                    as: "role",
                },
            },
            { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, role: { $ifNull: ["$role.name", "Unknown"] }, count: 1 } },
            { $sort: { count: -1 } },
        ]);

        result.usersByRole = byRole;
    }

    return result;
};

/*
|--------------------------------------------------------------------------
| Teacher
|--------------------------------------------------------------------------
*/
const teacherDashboard = async (user) => {
    const teacher = await Teacher.findOne({ userId: user._id }).lean();

    if (!teacher) {
        return { profileMissing: true };
    }

    const teacherId = String(teacher._id);

    const classes = await SchoolClass.find({
        $or: [
            { classTeacher: teacher._id },
            { "subjectTeachers.teacherId": teacher._id },
        ],
    })
        .select("name grade section academicYear room students classTeacher subjectTeachers")
        .sort({ grade: 1, section: 1 })
        .lean();

    const subjects = new Set();
    const studentIds = new Set();

    const myClasses = classes.map((c) => {
        const mySubjects = c.subjectTeachers
            .filter((st) => String(st.teacherId) === teacherId)
            .map((st) => st.subject);

        mySubjects.forEach((s) => subjects.add(s));
        c.students.forEach((s) => studentIds.add(String(s)));

        return {
            _id: c._id,
            name: c.name,
            section: c.section,
            room: c.room,
            students: c.students.length,
            isClassTeacher: String(c.classTeacher) === teacherId,
            mySubjects,
        };
    });

    // ObjectIds, not strings: aggregate $match does not cast
    const ids = [...studentIds].map(
        (id) => new mongoose.Types.ObjectId(id)
    );

    return {
        profile: {
            name: fullName(teacher),
            employeeId: teacher.employeeId,
            designation: teacher.designation,
            specialization: teacher.specialization,
        },
        stats: {
            classes: myClasses.length,
            classTeacherOf: myClasses.filter((c) => c.isClassTeacher).length,
            subjects: subjects.size,
            students: ids.length,
        },
        subjects: [...subjects].sort(),
        classes: myClasses,
        attendanceToday: await attendanceSummary(ids, startOfToday()),
    };
};

/*
|--------------------------------------------------------------------------
| Shared: a student's class and attendance
|--------------------------------------------------------------------------
*/
const studentDetails = async (student) => {
    const [schoolClass, attendance, recentAttendance] = await Promise.all([
        SchoolClass.findOne({ students: student._id })
            .populate("classTeacher", "firstName lastName phone email")
            .populate("subjectTeachers.teacherId", "firstName lastName")
            .lean(),
        attendanceSummary([student._id], daysAgo(30)),
        Attendance.find({ student: student._id })
            .sort({ date: -1 })
            .limit(7)
            .select("date status remarks")
            .lean(),
    ]);

    return {
        _id: student._id,
        name: fullName(student),
        admissionNumber: student.admissionNumber,
        className: student.className,
        section: student.section,
        rollNumber: student.rollNumber,
        status: student.status,
        schoolClass: schoolClass
            ? {
                  name: schoolClass.name,
                  section: schoolClass.section,
                  room: schoolClass.room,
                  academicYear: schoolClass.academicYear,
                  classmates: Math.max(schoolClass.students.length - 1, 0),
                  classTeacher: schoolClass.classTeacher
                      ? {
                            name: fullName(schoolClass.classTeacher),
                            phone: schoolClass.classTeacher.phone,
                            email: schoolClass.classTeacher.email,
                        }
                      : null,
                  subjects: schoolClass.subjectTeachers.map((st) => ({
                      subject: st.subject,
                      teacher: fullName(st.teacherId) || null,
                  })),
              }
            : null,
        attendance,
        recentAttendance,
    };
};

/*
|--------------------------------------------------------------------------
| Student
|--------------------------------------------------------------------------
*/
const studentDashboard = async (user) => {
    const student = await Student.findOne({ userId: user._id }).lean();

    if (!student) {
        return { profileMissing: true };
    }

    return { student: await studentDetails(student) };
};

/*
|--------------------------------------------------------------------------
| Parent
|--------------------------------------------------------------------------
*/
const parentDashboard = async (user) => {
    const parent = await Parent.findOne({ userId: user._id }).lean();

    if (!parent) {
        return { profileMissing: true };
    }

    const links = await ParentStudent.find({
        parentId: parent._id,
        status: "active",
    })
        .populate("studentId")
        .lean();

    const children = await Promise.all(
        links
            .filter((link) => link.studentId)
            .map(async (link) => ({
                relationship: link.relationship,
                ...(await studentDetails(link.studentId)),
            }))
    );

    return {
        profile: {
            name: fullName(parent),
            relationship: parent.relationship,
        },
        children,
    };
};

/**
 * GET /api/dashboard
 * Role-specific dashboard data for the logged-in user.
 */
const getDashboard = async (req, res) => {
    try {
        const role = await Role.findById(req.user.roleId)
            .select("name slug")
            .lean();

        const roleSlug = role?.slug || "";

        let data;

        if (roleSlug === "teacher") {
            data = await teacherDashboard(req.user);
        } else if (roleSlug === "student") {
            data = await studentDashboard(req.user);
        } else if (roleSlug === "parent") {
            data = await parentDashboard(req.user);
        } else {
            data = await adminDashboard(roleSlug);
        }

        return res.json({
            success: true,
            role: roleSlug,
            roleName: role?.name || "",
            user: { name: req.user.name },
            ...data,
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load dashboard.",
        });
    }
};

module.exports = { getDashboard };
