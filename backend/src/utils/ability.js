const {
    AbilityBuilder,
    createMongoAbility,
} = require("@casl/ability");

const RolePermission = require("../models/RolePermission");

const buildAbility = async (user) => {
    const { can, build } =
        new AbilityBuilder(createMongoAbility);

    // No authenticated user
    if (!user) {
        return build();
    }

    /*
     * Get role information
     *
     * New architecture:
     * user.roleId = ObjectId or populated Role
     */
    const role = user.roleId;

    /*
     * Super Admin
     */
    if (
        role &&
        typeof role === "object" &&
        role.slug === "super_admin"
    ) {
        can("manage", "all");

        return build();
    }

    /*
     * Get Role ID
     */
    const roleId =
        role && typeof role === "object"
            ? role._id
            : role;

    if (!roleId) {
        console.log(
            "CASL: No roleId found for user:",
            user._id
        );

        return build();
    }

    /*
     * Get permissions assigned to role
     */

    console.log('roleId',roleId);
    const rolePermissions =
        await RolePermission.find({
            roleId,
        }).populate(
            "permissionId",
            "slug status"
        );

    // console.log(
    //     "CASL Role ID:",
    //     roleId
    // );

    // console.log(
    //     "CASL Role Permissions:",
    //     rolePermissions
    // );

    /*
     * Convert permissions into CASL rules
     *
     * students.view
     *      ↓
     * can("view", "students")
     */
    for (const item of rolePermissions) {
        const permission =
            item.permissionId;

        if (
            !permission ||
            permission.status !== "active"
        ) {
            continue;
        }

        if (
            typeof permission.slug !==
            "string"
        ) {
            continue;
        }

        const parts =
            permission.slug.split(".");

        if (parts.length !== 2) {
            continue;
        }

        const [
            subject,
            action,
        ] = parts;

        if (!subject || !action) {
            continue;
        }

        can(action, subject);
    }

    return build();
};

module.exports = {
    buildAbility,
};