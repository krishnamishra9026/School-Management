/**
 * Demo data seeder (users, teachers, students, parents, classes).
 *
 * Usage:
 *   npm run seed:data            # seed once
 *   npm run seed:data -- --fresh # remove previous seed data, then seed
 *
 * Counts can be overridden with env vars:
 *   SEED_TEACHERS=20 SEED_STUDENTS=200 npm run seed:data
 *
 * Requires roles to exist — run `npm run seed:rbac` first.
 */
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const User = require("../src/models/User");
const Teacher = require("../src/models/Teacher");
const Student = require("../src/models/Student");
const Parent = require("../src/models/Parent");
const ParentStudent = require("../src/models/ParentStudent");
const SchoolClass = require("../src/models/Class");
const Permission = require("../src/models/Permission");
const RolePermission = require("../src/models/RolePermission");

const {
    SEED_EMAIL_DOMAIN,
    DEFAULT_PASSWORD,
    getRole,
} = require("./seeders/helpers");
const seedUsers = require("./seeders/userSeeder");
const { seedTeachers } = require("./seeders/teacherSeeder");
const seedStudents = require("./seeders/studentSeeder");
const seedParents = require("./seeders/parentSeeder");
const {
    buildClassSlots,
    seedClasses,
    SEED_MARKER,
} = require("./seeders/classSeeder");

const MONGO_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/school_management";

const TEACHER_COUNT = Number(process.env.SEED_TEACHERS) || 15;
const STUDENT_COUNT = Number(process.env.SEED_STUDENTS) || 120;

const GRADES = [
    "Nursery",
    "LKG",
    "UKG",
    ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
];
const SECTIONS = ["A", "B"];

const currentYear = new Date().getFullYear();
const ACADEMIC_YEAR = `${currentYear}-${currentYear + 1}`;

// Permissions each portal role needs to use its pages
const ROLE_PERMISSIONS = {
    teacher: [
        "dashboard.view",
        "students.view",
        "classes.view",
        "attendance.view",
        "attendance.create",
        "attendance.update",
    ],
    parent: ["dashboard.view", "students.view", "classes.view", "attendance.view", "fees.view"],
    student: ["dashboard.view", "classes.view", "attendance.view", "fees.view"],
};

const seedEmailRegex = new RegExp(`@${SEED_EMAIL_DOMAIN.replace(".", "\\.")}$`);

/**
 * Remove only data created by this seeder: users on the seed
 * domain, their profiles, parent links, and seed-created classes.
 * Pre-existing classes are kept; seeded people are removed from them.
 */
const clearSeedData = async () => {
    const users = await User.find({ email: seedEmailRegex }).select("_id");
    const userIds = users.map((u) => u._id);

    const [teacherIds, studentIds, parentIds] = await Promise.all([
        Teacher.distinct("_id", { userId: { $in: userIds } }),
        Student.distinct("_id", { userId: { $in: userIds } }),
        Parent.distinct("_id", { userId: { $in: userIds } }),
    ]);

    // Seed-created classes are deleted; existing classes the seed
    // reused just lose the seeded students and teachers.
    const { deletedCount: classes } =
        await SchoolClass.collection.deleteMany({ [SEED_MARKER]: true });

    await SchoolClass.updateMany(
        {},
        {
            $pull: {
                students: { $in: studentIds },
                subjectTeachers: { teacherId: { $in: teacherIds } },
            },
        }
    );

    await SchoolClass.updateMany(
        { classTeacher: { $in: teacherIds } },
        { $set: { classTeacher: null } }
    );

    const results = await Promise.all([
        ParentStudent.deleteMany({
            $or: [
                { parentId: { $in: parentIds } },
                { studentId: { $in: studentIds } },
            ],
        }),
        Teacher.deleteMany({ _id: { $in: teacherIds } }),
        Student.deleteMany({ _id: { $in: studentIds } }),
        Parent.deleteMany({ _id: { $in: parentIds } }),
        User.deleteMany({ _id: { $in: userIds } }),
    ]);

    const [links, teachers, students, parents, removedUsers] =
        results.map((r) => r.deletedCount);

    console.log(
        `Cleared previous seed data: ${removedUsers} users, ${teachers} teachers, ` +
            `${students} students, ${parents} parents, ${links} links, ${classes} classes.`
    );
};

/**
 * Give portal roles the view permissions they need.
 * Only adds missing ones — never removes existing permissions.
 */
const ensureRolePermissions = async () => {
    for (const [roleSlug, slugs] of Object.entries(ROLE_PERMISSIONS)) {
        const role = await getRole(roleSlug);
        const permissions = await Permission.find({ slug: { $in: slugs } });

        for (const permission of permissions) {
            await RolePermission.updateOne(
                { roleId: role._id, permissionId: permission._id },
                {},
                { upsert: true }
            );
        }
    }

    console.log("  Portal role permissions ensured (teacher, parent, student).");
};

const run = async () => {
    const fresh = process.argv.includes("--fresh");

    try {
        await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected: ${mongoose.connection.name}`);

        // Fail early if RBAC hasn't been seeded
        await Promise.all(
            ["super_admin", "school_admin", "teacher", "parent", "student"].map(getRole)
        );

        // Additive, so safe to run even when seed data exists
        await ensureRolePermissions();

        if (fresh) {
            await clearSeedData();
        } else if (await User.exists({ email: seedEmailRegex })) {
            console.log(
                "Seed data already exists. Re-run with --fresh to replace it:\n" +
                    "  npm run seed:data -- --fresh"
            );
            process.exit(0);
        }

        // Stable output between runs
        faker.seed(2026);

        console.log("Seeding...");

        await seedUsers();

        const classSlots = buildClassSlots(GRADES, SECTIONS);
        const teachers = await seedTeachers(TEACHER_COUNT);
        const students = await seedStudents(STUDENT_COUNT, classSlots);

        await seedParents(students);
        await seedClasses(classSlots, teachers, students, ACADEMIC_YEAR);

        console.log("\nDone. Login with any seeded account using password:", DEFAULT_PASSWORD);
        console.log("  Super admin:  superadmin@school.test");
        console.log("  School admin: admin@school.test");
        console.log(`  Others:       any *@${SEED_EMAIL_DOMAIN} user from the Users page`);

        process.exit(0);
    } catch (error) {
        console.error("Data seed failed:", error);
        process.exit(1);
    }
};

run();
