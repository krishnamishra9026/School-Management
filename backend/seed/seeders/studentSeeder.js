const { faker } = require("@faker-js/faker");

const Student = require("../../src/models/Student");
const User = require("../../src/models/User");

const {
    createUser,
    makeEmail,
    makePhone,
    pickGender,
} = require("./helpers");

/**
 * Student user + Student profile, linked both ways.
 * Students are spread evenly across the given class slots
 * ({ className, section, minAge }) so classes can enroll them.
 */
const seedStudents = async (count, classSlots) => {
    const students = [];
    const rollCounters = {};

    for (let i = 1; i <= count; i += 1) {
        const slot = classSlots[(i - 1) % classSlots.length];
        const slotKey = `${slot.className}-${slot.section}`;

        rollCounters[slotKey] = (rollCounters[slotKey] || 0) + 1;

        const gender = pickGender();
        const firstName = faker.person.firstName(gender);
        const lastName = faker.person.lastName();
        const email = makeEmail(firstName, lastName, "st.");
        const phone = makePhone();

        const user = await createUser({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            roleSlug: "student",
        });

        const student = await Student.create({
            userId: user._id,
            admissionNumber: `ADM-S${String(i).padStart(5, "0")}`,
            firstName,
            lastName,
            gender,
            dateOfBirth: faker.date.birthdate({
                min: slot.minAge,
                max: slot.minAge + 1,
                mode: "age",
            }),
            email,
            phone,
            className: slot.className,
            section: slot.section,
            rollNumber: String(rollCounters[slotKey]),
            fatherName: `${faker.person.firstName("male")} ${lastName}`,
            motherName: `${faker.person.firstName("female")} ${lastName}`,
            address: faker.location.streetAddress({ useFullAddress: true }),
            status: "active",
        });

        await User.updateOne(
            { _id: user._id },
            { studentId: student._id }
        );

        students.push(student);
    }

    console.log(`  ${students.length} students created.`);

    return students;
};

module.exports = seedStudents;
