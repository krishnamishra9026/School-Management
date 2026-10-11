const Role = require("../models/Role");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const ParentStudent = require("../models/ParentStudent");
const SchoolClass = require("../models/Class");

const PORTAL_ROLES = ["teacher", "student", "parent"];

const getRoleSlug = async (user) => {
    if (user.roleId && user.roleId.slug) {
        return user.roleId.slug;
    }

    const role = await Role.findById(user.roleId).select("slug").lean();

    return role?.slug || "";
};

/**
 * Who the user is and what they can reach.
 *
 * - teacher: classIds they teach (class or subject teacher)
 *            and the students in those classes
 * - parent:  studentIds of their linked children
 * - student: their own studentId
 * - others (admins/staff): isAdmin, no restriction
 *
 * classIds / studentIds are arrays of ObjectIds, or null
 * when the user is unrestricted.
 */
const getAccessScope = async (user) => {
    const roleSlug = await getRoleSlug(user);

    if (!PORTAL_ROLES.includes(roleSlug)) {
        return { roleSlug, isAdmin: true, classIds: null, studentIds: null };
    }

    const scope = {
        roleSlug,
        isAdmin: false,
        classIds: [],
        studentIds: [],
        teacherId: null,
    };

    if (roleSlug === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id })
            .select("_id")
            .lean();

        if (teacher) {
            const classes = await SchoolClass.find({
                $or: [
                    { classTeacher: teacher._id },
                    { "subjectTeachers.teacherId": teacher._id },
                ],
            })
                .select("_id students")
                .lean();

            scope.teacherId = teacher._id;
            scope.classIds = classes.map((c) => c._id);
            scope.studentIds = classes.flatMap((c) => c.students);
        }
    }

    if (roleSlug === "parent") {
        const parent = await Parent.findOne({ userId: user._id })
            .select("_id")
            .lean();

        if (parent) {
            scope.studentIds = await ParentStudent.distinct("studentId", {
                parentId: parent._id,
                status: "active",
            });
        }
    }

    if (roleSlug === "student") {
        const student = await Student.findOne({ userId: user._id })
            .select("_id")
            .lean();

        if (student) {
            scope.studentIds = [student._id];
        }
    }

    return scope;
};

const includesId = (ids, id) =>
    ids === null || ids.some((item) => String(item) === String(id));

module.exports = { getRoleSlug, getAccessScope, includesId };
