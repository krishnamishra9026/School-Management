const { faker } = require("@faker-js/faker");

const Teacher = require("../../src/models/Teacher");
const User = require("../../src/models/User");

const {
    createUser,
    makeEmail,
    makePhone,
    pickGender,
    makeAddress,
} = require("./helpers");

const SUBJECTS = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Art",
    "Physical Education",
];

const QUALIFICATIONS = ["B.Ed", "M.Ed", "M.Sc, B.Ed", "M.A, B.Ed", "Ph.D"];

/**
 * Teacher user + Teacher profile, linked both ways.
 * Each teacher gets a specialization from SUBJECTS.
 */
const seedTeachers = async (count) => {
    const teachers = [];

    for (let i = 1; i <= count; i += 1) {
        const gender = pickGender();
        const firstName = faker.person.firstName(gender);
        const lastName = faker.person.lastName();
        const email = makeEmail(firstName, lastName);
        const phone = makePhone();

        const user = await createUser({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            roleSlug: "teacher",
        });

        const specialization = SUBJECTS[(i - 1) % SUBJECTS.length];
        const experience = faker.number.int({ min: 1, max: 25 });

        const teacher = await Teacher.create({
            userId: user._id,
            employeeId: `EMP-S${String(i).padStart(4, "0")}`,
            firstName,
            lastName,
            gender,
            dateOfBirth: faker.date.birthdate({ min: 25, max: 58, mode: "age" }),
            email,
            phone,
            alternatePhone: makePhone(),
            qualification: faker.helpers.arrayElement(QUALIFICATIONS),
            specialization,
            experience,
            joiningDate: faker.date.past({ years: experience }),
            department: specialization,
            designation: experience > 10 ? "Senior Teacher" : "Teacher",
            ...makeAddress(),
            status: "active",
        });

        await User.updateOne(
            { _id: user._id },
            { teacherId: teacher._id }
        );

        teachers.push(teacher);
    }

    console.log(`  ${teachers.length} teachers created.`);

    return teachers;
};

module.exports = { seedTeachers, SUBJECTS };
