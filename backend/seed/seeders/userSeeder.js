const { faker } = require("@faker-js/faker");

const {
    createUser,
    makeEmail,
    makePhone,
} = require("./helpers");

/**
 * Admin accounts with fixed emails, plus a few
 * staff-type users (accountant, librarian, staff).
 */
const seedUsers = async () => {
    const admins = [
        {
            name: "Super Admin",
            email: "superadmin@school.test",
            roleSlug: "super_admin",
        },
        {
            name: "School Admin",
            email: "admin@school.test",
            roleSlug: "school_admin",
        },
    ];

    const users = [];

    for (const admin of admins) {
        users.push(
            await createUser({
                ...admin,
                phone: makePhone(),
            })
        );
    }

    for (const roleSlug of ["accountant", "librarian", "staff"]) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        users.push(
            await createUser({
                name: `${firstName} ${lastName}`,
                email: makeEmail(firstName, lastName),
                phone: makePhone(),
                roleSlug,
            })
        );
    }

    console.log(`  ${users.length} admin/staff users created.`);

    return users;
};

module.exports = seedUsers;
