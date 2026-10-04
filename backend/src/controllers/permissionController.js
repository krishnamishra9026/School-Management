const mongoose = require("mongoose");

const Permission = require("../models/Permission");
const RolePermission = require("../models/RolePermission");

/*
|--------------------------------------------------------------------------
| GET permissions
|--------------------------------------------------------------------------
*/
const getPermissions = async (req, res) => {
    try {
        const {
            search = "",
            module = "",
            status = "",
            page = 1,
            limit = 100,
        } = req.query;

        const query = {};

        if (search.trim()) {
            query.$or = [
                {
                    name: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
                {
                    slug: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
            ];
        }

        if (module) {
            query.module = module
                .trim()
                .toLowerCase();
        }

        if (status) {
            query.status = status;
        }

        const pageNumber = Math.max(
            Number(page),
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            200
        );

        const skip =
            (pageNumber - 1) *
            limitNumber;

        const [
            permissions,
            total,
        ] = await Promise.all([
            Permission.find(query)
                .sort({
                    module: 1,
                    slug: 1,
                })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Permission.countDocuments(query),
        ]);

        return res.json({
            success: true,
            data: permissions,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(
                    total / limitNumber
                ),
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch permissions.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET single permission
|--------------------------------------------------------------------------
*/
const getPermission = async (req, res) => {
    try {
        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid permission ID.",
            });
        }

        const permission =
            await Permission.findById(
                req.params.id
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    "Permission not found.",
            });
        }

        return res.json({
            success: true,
            data: permission,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch permission.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| POST permission
|--------------------------------------------------------------------------
*/
const createPermission = async (
    req,
    res
) => {
    try {
        const {
            module,
            name,
            slug,
            description = "",
            status = "active",
        } = req.body;

        if (!module?.trim()) {
            return res.status(422).json({
                success: false,
                message: "Module is required.",
            });
        }

        if (!name?.trim()) {
            return res.status(422).json({
                success: false,
                message: "Name is required.",
            });
        }

        if (!slug?.trim()) {
            return res.status(422).json({
                success: false,
                message: "Slug is required.",
            });
        }

        const normalizedSlug = slug
            .trim()
            .toLowerCase();

        const existing =
            await Permission.findOne({
                slug: normalizedSlug,
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Permission slug already exists.",
            });
        }

        const permission =
            await Permission.create({
                module: module
                    .trim()
                    .toLowerCase(),

                name: name.trim(),

                slug: normalizedSlug,

                description:
                    description.trim(),

                status,

                isSystemPermission: false,
            });

        return res.status(201).json({
            success: true,
            message:
                "Permission created successfully.",
            data: permission,
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Permission slug already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to create permission.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| PUT permission
|--------------------------------------------------------------------------
*/
const updatePermission = async (
    req,
    res
) => {
    try {
        const permission =
            await Permission.findById(
                req.params.id
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    "Permission not found.",
            });
        }

        const {
            module,
            name,
            slug,
            description,
            status,
        } = req.body;

        /*
         * Don't allow system permission
         * slug to change.
         */
        if (
            slug !== undefined &&
            slug.trim().toLowerCase() !==
                permission.slug
        ) {
            if (
                permission.isSystemPermission
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "System permission slug cannot be changed.",
                });
            }

            permission.slug = slug
                .trim()
                .toLowerCase();
        }

        if (module !== undefined) {
            permission.module =
                module.trim().toLowerCase();
        }

        if (name !== undefined) {
            permission.name =
                name.trim();
        }

        if (description !== undefined) {
            permission.description =
                description.trim();
        }

        if (status !== undefined) {
            if (
                !["active", "inactive"].includes(
                    status
                )
            ) {
                return res.status(422).json({
                    success: false,
                    message:
                        "Invalid status.",
                });
            }

            permission.status = status;
        }

        await permission.save();

        return res.json({
            success: true,
            message:
                "Permission updated successfully.",
            data: permission,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to update permission.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| DELETE permission
|--------------------------------------------------------------------------
*/
const deletePermission = async (
    req,
    res
) => {
    try {
        const permission =
            await Permission.findById(
                req.params.id
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    "Permission not found.",
            });
        }

        if (
            permission.isSystemPermission
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "System permissions cannot be deleted.",
            });
        }

        /*
         * Remove all role assignments first.
         */
        await RolePermission.deleteMany({
            permissionId:
                permission._id,
        });

        await Permission.deleteOne({
            _id: permission._id,
        });

        return res.json({
            success: true,
            message:
                "Permission deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete permission.",
        });
    }
};

module.exports = {
    getPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
};