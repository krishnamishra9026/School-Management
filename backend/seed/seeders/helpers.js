const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const Role = require("../../src/models/Role");
const User = require("../../src/models/User");

// All seeded accounts use this domain so --fresh can
// remove them without touching real users.
const SEED_EMAIL_DOMAIN = "school.test";

const DEFAULT_PASSWORD =
    process.env.SEED_PASSWORD || "password123";

let hashedPasswordCache = null;

const getHashedPassword = async () => {
    if (!hashedPasswordCache) {
        hashedPasswordCache = await bcrypt.hash(
            DEFAULT_PASSWORD,
            10
        );
    }

    return hashedPasswordCache;
};

const roleCache = {};

const getRole = async (slug) => {
    if (!roleCache[slug]) {
        const role = await Role.findOne({ slug });

        if (!role) {
            throw new Error(
                `Role "${slug}" not found. Run "npm run seed:rbac" first.`
            );
        }

        roleCache[slug] = role;
    }

    return roleCache[slug];
};

const slugify = (value) =>
    String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z0-9]/g, "");

let emailCounter = 0;

const makeEmail = (firstName, lastName, prefix = "") => {
    emailCounter += 1;

    return `${prefix}${slugify(firstName)}.${slugify(lastName)}${emailCounter}@${SEED_EMAIL_DOMAIN}`;
};

const makePhone = () =>
    `9${faker.string.numeric(9)}`;

/**
 * Create a login account for a role.
 */
const createUser = async ({
    name,
    email,
    phone,
    roleSlug,
}) => {
    const role = await getRole(roleSlug);

    return User.create({
        name,
        email,
        phone,
        password: await getHashedPassword(),
        roleId: role._id,
        isActive: true,
        status: "active",
    });
};

const pickGender = () =>
    faker.helpers.arrayElement(["male", "female"]);

const makeAddress = () => ({
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    pincode: faker.location.zipCode("######"),
});

module.exports = {
    SEED_EMAIL_DOMAIN,
    DEFAULT_PASSWORD,
    getRole,
    createUser,
    makeEmail,
    makePhone,
    pickGender,
    makeAddress,
};
