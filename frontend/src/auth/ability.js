import {
    AbilityBuilder,
    createMongoAbility,
} from "@casl/ability";

export const createAbility = (
    permissions = [],
    roleSlug = null
) => {
    const { can, build } =
        new AbilityBuilder(
            createMongoAbility
        );

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */

    if (roleSlug === "super_admin") {
        can("manage", "all");

        return build();
    }

    /*
    |--------------------------------------------------------------------------
    | Role Permissions
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | [
    |     "dashboard.view",
    |     "students.view",
    |     "students.create",
    |     "students.update"
    | ]
    |
    */

    if (!Array.isArray(permissions)) {
        return build();
    }

    permissions.forEach((permission) => {
        /*
        |--------------------------------------------------------------------------
        | Permission can be a string
        |--------------------------------------------------------------------------
        */

        if (
            typeof permission !== "string"
        ) {
            return;
        }

        const parts =
            permission.split(".");

        if (parts.length !== 2) {
            return;
        }

        const [
            subject,
            action,
        ] = parts;

        if (
            !subject ||
            !action
        ) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Create CASL Rule
        |--------------------------------------------------------------------------
        |
        | students.view
        |       ↓
        | can("view", "students")
        |
        */

        can(
            action,
            subject
        );
    });

    return build();
};

