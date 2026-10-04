const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Role = require("../models/Role");

const ALLOWED_STATUS = ["active", "inactive"];

/*
|--------------------------------------------------------------------------
| Helper: Remove Password
|--------------------------------------------------------------------------
*/

const sanitizeUser = (user) => {
    const userObject = user.toObject
        ? user.toObject()
        : { ...user };

    delete userObject.password;

    return userObject;
};

/*
|--------------------------------------------------------------------------
| Helper: Get Role Slug
|--------------------------------------------------------------------------
*/

const getRoleSlug = (user) => {
    if (!user) return null;

    if (user.roleId?.slug) {
        return user.roleId.slug;
    }

    if (user.role?.slug) {
        return user.role.slug;
    }

    if (typeof user.role === "string") {
        return user.role;
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
| POST /api/users
|--------------------------------------------------------------------------
*/

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            roleId,
            status = "active",
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (!name || !email || !password || !roleId) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and role are required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID.",
            });
        }

        if (!ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user status.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find Role
        |--------------------------------------------------------------------------
        */

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found.",
            });
        }

        if (role.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Selected role is inactive.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Role Security
        |--------------------------------------------------------------------------
        */

        const loggedInRole = getRoleSlug(req.user);

        if (
            loggedInRole === "school_admin" &&
            role.slug === "super_admin"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "School admin cannot create a super admin.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Duplicate Email
        |--------------------------------------------------------------------------
        */

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Hash Password
        |--------------------------------------------------------------------------
        */

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        /*
        |--------------------------------------------------------------------------
        | Create User
        |--------------------------------------------------------------------------
        */

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            roleId: role._id,
            status,
        });

        /*
        |--------------------------------------------------------------------------
        | Return User With Role
        |--------------------------------------------------------------------------
        */

        const responseUser = await User.findById(user._id)
            .select("-password")
            .populate(
                "roleId",
                "_id name slug status"
            );

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: responseUser,
        });
    } catch (error) {
        console.error("Create user error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create user.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Users
|--------------------------------------------------------------------------
| GET /api/users
|--------------------------------------------------------------------------
| Supports:
| ?page=1
| ?limit=10
| ?search=krishna
| ?role=teacher
| ?status=active
|--------------------------------------------------------------------------
*/

const getUsers = async (req, res) => {
    try {
        let page =
            parseInt(req.query.page, 10) || 1;

        let limit =
            parseInt(req.query.limit, 10) || 10;

        page = Math.max(page, 1);
        limit = Math.min(
            Math.max(limit, 1),
            100
        );

        const {
            search = "",
            role = "",
            status = "",
        } = req.query;

        const filter = {};

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Role Filter
        |--------------------------------------------------------------------------
        */

        if (role) {
            const roleDoc = await Role.findOne({
                slug: role,
                status: "active",
            }).select("_id");

            if (!roleDoc) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role filter.",
                });
            }

            filter.roleId = roleDoc._id;
        }

        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        if (status) {
            if (!ALLOWED_STATUS.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status filter.",
                });
            }

            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password")
                .populate(
                    "roleId",
                    "_id name slug status"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            User.countDocuments(filter),
        ]);

        const totalPages =
            Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch users.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Single User
|--------------------------------------------------------------------------
| GET /api/users/:id
|--------------------------------------------------------------------------
*/

const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(id)
            .select("-password")
            .populate(
                "roleId",
                "_id name slug status"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
| PUT /api/users/:id
|--------------------------------------------------------------------------
*/

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const {
            name,
            email,
            password,
            roleId,
            status,
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Current Logged-in User Role
        |--------------------------------------------------------------------------
        */

        const loggedInRole = getRoleSlug(
            req.user
        );

        /*
        |--------------------------------------------------------------------------
        | Find Existing Target Role
        |--------------------------------------------------------------------------
        */

        const currentTargetRole =
            await Role.findById(user.roleId);

        /*
        |--------------------------------------------------------------------------
        | Role Update
        |--------------------------------------------------------------------------
        */

        let newRole = currentTargetRole;

        if (roleId !== undefined) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    roleId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID.",
                });
            }

            newRole = await Role.findById(roleId);

            if (!newRole) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found.",
                });
            }

            if (newRole.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected role is inactive.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | School Admin Cannot Assign Super Admin
            |--------------------------------------------------------------------------
            */

            if (
                loggedInRole === "school_admin" &&
                newRole.slug === "super_admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "School admin cannot assign super admin role.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Prevent Super Admin From Removing Own Role
            |--------------------------------------------------------------------------
            */

            const currentUserId =
                req.user?.id ||
                req.user?._id;

            if (
                String(user._id) ===
                    String(currentUserId) &&
                currentTargetRole?.slug ===
                    "super_admin" &&
                newRole.slug !== "super_admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot remove your own super admin role.",
                });
            }

            user.roleId = newRole._id;
        }

        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        */

        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty.",
                });
            }

            user.name = name.trim();
        }

        /*
        |--------------------------------------------------------------------------
        | Email
        |--------------------------------------------------------------------------
        */

        if (email !== undefined) {
            if (
                typeof email !== "string" ||
                !email.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email cannot be empty.",
                });
            }

            const normalizedEmail =
                email.toLowerCase().trim();

            const emailExists =
                await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: id },
                });

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A user with this email already exists.",
                });
            }

            user.email = normalizedEmail;
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (status !== undefined) {
            if (
                !ALLOWED_STATUS.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user status.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Prevent Super Admin From Deactivating Own Account
            |--------------------------------------------------------------------------
            */

            const currentUserId =
                req.user?.id ||
                req.user?._id;

            const targetRoleSlug =
                newRole?.slug ||
                currentTargetRole?.slug;

            if (
                String(user._id) ===
                    String(currentUserId) &&
                targetRoleSlug === "super_admin" &&
                status === "inactive"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot deactivate your own super admin account.",
                });
            }

            user.status = status;
        }

        /*
        |--------------------------------------------------------------------------
        | Password
        |--------------------------------------------------------------------------
        */

        if (
            password !== undefined &&
            password !== ""
        ) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters.",
                });
            }

            user.password =
                await bcrypt.hash(
                    password,
                    12
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        */

        await user.save();

        /*
        |--------------------------------------------------------------------------
        | Return Updated User With Role
        |--------------------------------------------------------------------------
        */

        const responseUser =
            await User.findById(user._id)
                .select("-password")
                .populate(
                    "roleId",
                    "_id name slug status"
                );

        return res.status(200).json({
            success: true,
            message:
                "User updated successfully.",
            user: responseUser,
        });
    } catch (error) {
        console.error(
            "Update user error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to update user.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
| DELETE /api/users/:id
|--------------------------------------------------------------------------
*/

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Deleting Own Account
        |--------------------------------------------------------------------------
        */

        const currentUserId =
            req.user?.id ||
            req.user?._id;

        if (
            String(id) ===
            String(currentUserId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot delete your own account.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find User + Role
        |--------------------------------------------------------------------------
        */

        const user = await User.findById(id)
            .populate(
                "roleId",
                "_id name slug status"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const loggedInRole =
            getRoleSlug(req.user);

        const targetRole =
            user.roleId?.slug;

        /*
        |--------------------------------------------------------------------------
        | School Admin Cannot Delete Super Admin
        |--------------------------------------------------------------------------
        */

        if (
            loggedInRole === "school_admin" &&
            targetRole === "super_admin"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "School admin cannot delete a super admin.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        */

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message:
                "User deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete user.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Current Logged-in User
|--------------------------------------------------------------------------
| GET /api/users/me
|--------------------------------------------------------------------------
*/

const getMe = async (req, res) => {
    try {
        const currentUserId =
            req.user?.id ||
            req.user?._id;

        const user = await User.findById(
            currentUserId
        )
            .select("-password")
            .populate(
                "roleId",
                "_id name slug status"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(
            "Get me error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch current user.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getMe,
};
