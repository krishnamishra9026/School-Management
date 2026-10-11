const { faker } = require("@faker-js/faker");

const SchoolClass = require("../../src/models/Class");

const SEED_MARKER = "_seeded";

/**
 * Build the list of grade/section slots. Names match the
 * Class dropdown in StudentForm ("Nursery", "Class 1", ...).
 */
const buildClassSlots = (grades, sections) => {
    const allGrades = [
        { className: "Nursery", grade: "Nursery", minAge: 3 },
        { className: "LKG", grade: "LKG", minAge: 4 },
        { className: "UKG", grade: "UKG", minAge: 5 },
        ...Array.from({ length: 12 }, (_, i) => ({
            className: `Class ${i + 1}`,
            grade: String(i + 1),
            minAge: i + 6,
        })),
    ];

    return allGrades
        .filter((g) => grades.includes(g.className))
        .flatMap((g) =>
            sections.map((section) => ({ ...g, section }))
        );
};

const subjectsForGrade = (grade) => {
    const n = Number(grade);

    if (Number.isNaN(n) || n <= 5) {
        return ["English", "Hindi", "Mathematics", "Science", "Art"];
    }

    if (n <= 10) {
        return [
            "English",
            "Hindi",
            "Mathematics",
            "Science",
            "Social Studies",
            "Computer Science",
        ];
    }

    return [
        "English",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Physical Education",
    ];
};

/**
 * Create classes for each slot, enroll matching students,
 * assign a class teacher and subject teachers (preferring
 * teachers whose specialization matches the subject).
 */
const seedClasses = async (classSlots, teachers, students, academicYear) => {
    const classes = [];
    let reused = 0;
    let teacherIndex = 0;

    const nextTeacher = () => {
        const teacher = teachers[teacherIndex % teachers.length];
        teacherIndex += 1;
        return teacher;
    };

    for (const slot of classSlots) {
        const enrolled = students.filter(
            (s) =>
                s.className === slot.className &&
                s.section === slot.section
        );

        const subjectTeachers = subjectsForGrade(slot.grade).map(
            (subject) => {
                const specialists = teachers.filter(
                    (t) => t.specialization === subject
                );

                return {
                    teacherId: (specialists.length
                        ? faker.helpers.arrayElement(specialists)
                        : nextTeacher()
                    )._id,
                    subject,
                };
            }
        );

        const existing = await SchoolClass.findOne({
            grade: slot.grade,
            section: slot.section,
            academicYear,
        });

        // Class already exists (e.g. created manually): enroll the
        // seeded students and fill gaps, but keep what is there.
        if (existing) {
            const takenSubjects = new Set(
                existing.subjectTeachers.map((st) =>
                    st.subject.toLowerCase()
                )
            );

            existing.students.addToSet(...enrolled.map((s) => s._id));
            existing.subjectTeachers.push(
                ...subjectTeachers.filter(
                    (st) => !takenSubjects.has(st.subject.toLowerCase())
                )
            );

            if (!existing.classTeacher) {
                existing.classTeacher = nextTeacher()._id;
            }

            existing.capacity = Math.max(
                existing.capacity,
                existing.students.length
            );

            await existing.save();

            reused += 1;
            classes.push(existing);
            continue;
        }

        const schoolClass = await SchoolClass.create({
            name: slot.className,
            grade: slot.grade,
            section: slot.section,
            academicYear,
            room: `R-${faker.number.int({ min: 101, max: 350 })}`,
            capacity: Math.max(40, enrolled.length),
            classTeacher: nextTeacher()._id,
            subjectTeachers,
            students: enrolled.map((s) => s._id),
            status: "active",
        });

        // Mark seed-created classes so --fresh only deletes these.
        // Written via the driver because the schema has no such field.
        await SchoolClass.collection.updateOne(
            { _id: schoolClass._id },
            { $set: { [SEED_MARKER]: true } }
        );

        classes.push(schoolClass);
    }

    console.log(
        `  ${classes.length - reused} classes created, ${reused} existing classes reused.`
    );

    return classes;
};

module.exports = { buildClassSlots, seedClasses, SEED_MARKER };
