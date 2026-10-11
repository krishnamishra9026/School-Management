const { faker } = require("@faker-js/faker");

const Parent = require("../../src/models/Parent");
const ParentStudent = require("../../src/models/ParentStudent");

const {
    createUser,
    makeEmail,
    makePhone,
    makeAddress,
} = require("./helpers");

/**
 * One parent account per family. Students are grouped into
 * families of 1–2 children; each family gets a father or
 * mother (named from the student record) as primary parent,
 * linked via ParentStudent.
 */
const seedParents = async (students) => {
    const parents = [];
    let links = 0;
    let index = 0;

    while (index < students.length) {
        const familySize = faker.helpers.weightedArrayElement([
            { weight: 3, value: 1 },
            { weight: 1, value: 2 },
        ]);

        const children = students.slice(index, index + familySize);
        index += familySize;

        const firstChild = children[0];
        const relationship = faker.helpers.arrayElement(["father", "mother"]);
        const fullName =
            relationship === "father"
                ? firstChild.fatherName
                : firstChild.motherName;
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ") || firstChild.lastName;
        const phone = makePhone();

        const user = await createUser({
            name: `${firstName} ${lastName}`,
            email: makeEmail(firstName, lastName, "p."),
            phone,
            roleSlug: "parent",
        });

        const parent = await Parent.create({
            userId: user._id,
            firstName,
            lastName,
            phone,
            alternatePhone: makePhone(),
            relationship,
            occupation: faker.person.jobTitle(),
            ...makeAddress(),
            status: "active",
        });

        await user.updateOne({ parentId: parent._id });

        await ParentStudent.insertMany(
            children.map((child, i) => ({
                parentId: parent._id,
                studentId: child._id,
                relationship,
                isPrimary: i === 0,
                status: "active",
            }))
        );

        links += children.length;
        parents.push(parent);
    }

    console.log(
        `  ${parents.length} parents created, ${links} parent-student links.`
    );

    return parents;
};

module.exports = seedParents;
