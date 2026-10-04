const mongoose = require("mongoose");

const Role = require("../src/models/Role");
const Permission = require("../src/models/Permission");
const RolePermission = require("../src/models/RolePermission");

const permissions = require("../config/permissions");

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/school_management";

const roles = [
    {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full system access",
        isSystemRole: true,
    },

    {
        name: "School Admin",
        slug: "school_admin",
        description: "School administration access",
        isSystemRole: true,
    },

    {
        name: "Teacher",
        slug: "teacher",
        description: "Teacher access",
        isSystemRole: true,
    },

    {
        name: "Parent",
        slug: "parent",
        description: "Parent access",
        isSystemRole: true,
    },

    {
        name: "Student",
        slug: "student",
        description: "Student access",
        isSystemRole: true,
    },

    {
        name: "Accountant",
        slug: "accountant",
        description: "Accounts and fee management",
        isSystemRole: true,
    },

    {
        name: "Librarian",
        slug: "librarian",
        description: "Library management",
        isSystemRole: true,
    },

    {
        name: "Staff",
        slug: "staff",
        description: "General staff access",
        isSystemRole: true,
    },
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("MongoDB connected.");

        /*
         * Permissions
         */
        for (const permission of permissions) {
            await Permission.findOneAndUpdate(
                {
                    slug: permission.slug,
                },
                {
                    $set: {
                        module: permission.module,
                        name: permission.name,
                    },

                    $setOnInsert: {
                        description:
                            permission.description || "",
                        status: "active",
                        isSystemPermission: true,
                    },
                },
                {
                    upsert: true,
                    new: true,
                }
            );
        }

        console.log(
            `${permissions.length} permissions seeded.`
        );

        /*
         * Roles
         */
        for (const roleData of roles) {
            await Role.findOneAndUpdate(
                {
                    slug: roleData.slug,
                },
                {
                    $set: {
                        name: roleData.name,
                        description: roleData.description,
                        isSystemRole:
                            roleData.isSystemRole,
                    },

                    $setOnInsert: {
                        status: "active",
                    },
                },
                {
                    upsert: true,
                    new: true,
                }
            );
        }

        console.log(
            `${roles.length} roles seeded.`
        );

        /*
         * Super Admin = every permission
         */
        const superAdmin = await Role.findOne({
            slug: "super_admin",
        });

        const allPermissions =
            await Permission.find({
                status: "active",
            });

        if (superAdmin) {
            await RolePermission.deleteMany({
                roleId: superAdmin._id,
            });

            await RolePermission.insertMany(
                allPermissions.map((permission) => ({
                    roleId: superAdmin._id,
                    permissionId:
                        permission._id,
                })),
                {
                    ordered: false,
                }
            );
        }

        console.log(
            "Super Admin permissions assigned."
        );

        /*
         * School Admin
         *
         * Give school administration access,
         * excluding RBAC administration.
         */
        const schoolAdmin = await Role.findOne({
            slug: "school_admin",
        });

        if (schoolAdmin) {
            const schoolPermissions =
                await Permission.find({
                    status: "active",
                    module: {
                        $nin: [
                            "roles",
                            "permissions",
                        ],
                    },
                });

            await RolePermission.deleteMany({
                roleId: schoolAdmin._id,
            });

            await RolePermission.insertMany(
                schoolPermissions.map((permission) => ({
                    roleId: schoolAdmin._id,
                    permissionId:
                        permission._id,
                })),
                {
                    ordered: false,
                }
            );
        }

        console.log(
            "School Admin permissions assigned."
        );

        console.log("RBAC seed completed.");

        process.exit(0);
    } catch (error) {
        console.error(
            "RBAC seed failed:",
            error
        );

        process.exit(1);
    }
};

seed();