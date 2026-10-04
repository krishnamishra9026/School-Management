const mongoose = require("mongoose");

const Parent = require("../models/Parent");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Create Parent
|--------------------------------------------------------------------------
| POST /api/parents
|--------------------------------------------------------------------------
*/

const createParent = async (req, res) => {
    try {
        const {
            userId,
            firstName,
            lastName,
            phone,
            alternatePhone,
            relationship,
            occupation,
            address,
            city,
            state,
            pincode,
            status = "active",
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User is required.",
            });
        }

        if (!firstName) {
            return res.status(400).json({
                success: false,
                message: "First name is required.",
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone is required.",
            });
        }

        if (!relationship) {
            return res.status(400).json({
                success: false,
                message: "Relationship is required.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check User
        |--------------------------------------------------------------------------
        */

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Selected user not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | User must have parent role
        |--------------------------------------------------------------------------
        */

        if (user.role !== "parent") {
            return res.status(400).json({
                success: false,
                message:
                    "Selected user must have parent role.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Existing Parent Profile
        |--------------------------------------------------------------------------
        */

        const existingParent = await Parent.findOne({
            userId,
        });

        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent profile already exists for this user.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Create Parent
        |--------------------------------------------------------------------------
        */

        const parent = await Parent.create({
            userId,
            firstName: firstName.trim(),
            lastName: lastName?.trim() || "",
            phone: phone.trim(),
            alternatePhone:
                alternatePhone?.trim() || "",
            relationship,
            occupation: occupation?.trim() || "",
            address: address?.trim() || "",
            city: city?.trim() || "",
            state: state?.trim() || "",
            pincode: pincode?.trim() || "",
            status,
        });

        /*
        |--------------------------------------------------------------------------
        | Populate User
        |--------------------------------------------------------------------------
        */

        const populatedParent = await Parent.findById(
            parent._id
        ).populate(
            "userId",
            "name email role status"
        );

        res.status(201).json({
            success: true,
            message: "Parent created successfully.",
            parent: populatedParent,
        });
    } catch (error) {
        console.error(
            "Create parent error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This user already has a parent profile.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to create parent.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Parents
|--------------------------------------------------------------------------
| GET /api/parents
|--------------------------------------------------------------------------
|
| ?page=1
| ?limit=10
| ?search=krishna
| ?status=active
|--------------------------------------------------------------------------
*/

const getParents = async (req, res) => {
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

        const search =
            req.query.search?.trim() || "";

        const status =
            req.query.status?.trim() || "";

        const filter = {};

        if (status) {
            filter.status = status;
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (search) {
            const users = await User.find({
                $or: [
                    {
                        name: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    {
                        email: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                ],
                role: "parent",
            }).select("_id");

            const userIds = users.map(
                (user) => user._id
            );

            filter.$or = [
                {
                    firstName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    lastName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    userId: {
                        $in: userIds,
                    },
                },
            ];
        }

        const skip = (page - 1) * limit;

        const [parents, total] =
            await Promise.all([
                Parent.find(filter)
                    .populate(
                        "userId",
                        "name email role status"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limit),

                Parent.countDocuments(filter),
            ]);

        res.status(200).json({
            success: true,

            parents,

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get parents error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch parents.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Single Parent
|--------------------------------------------------------------------------
| GET /api/parents/:id
|--------------------------------------------------------------------------
*/

const getParent = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID.",
            });
        }

        const parent = await Parent.findById(
            id
        ).populate(
            "userId",
            "name email role status"
        );

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found.",
            });
        }

        res.status(200).json({
            success: true,
            parent,
        });
    } catch (error) {
        console.error(
            "Get parent error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch parent.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Parent
|--------------------------------------------------------------------------
| PUT /api/parents/:id
|--------------------------------------------------------------------------
*/

const updateParent = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID.",
            });
        }

        const parent =
            await Parent.findById(id);

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found.",
            });
        }

        const {
            userId,
            firstName,
            lastName,
            phone,
            alternatePhone,
            relationship,
            occupation,
            address,
            city,
            state,
            pincode,
            status,
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | Change User
        |--------------------------------------------------------------------------
        */

        if (
            userId !== undefined &&
            String(userId) !==
                String(parent.userId)
        ) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID.",
                });
            }

            const user =
                await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected user not found.",
                });
            }

            if (user.role !== "parent") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected user must have parent role.",
                });
            }

            const existingParent =
                await Parent.findOne({
                    userId,
                    _id: { $ne: id },
                });

            if (existingParent) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This user already has a parent profile.",
                });
            }

            parent.userId = userId;
        }

        /*
        |--------------------------------------------------------------------------
        | Update Fields
        |--------------------------------------------------------------------------
        */

        if (firstName !== undefined) {
            parent.firstName =
                firstName.trim();
        }

        if (lastName !== undefined) {
            parent.lastName =
                lastName.trim();
        }

        if (phone !== undefined) {
            parent.phone =
                phone.trim();
        }

        if (alternatePhone !== undefined) {
            parent.alternatePhone =
                alternatePhone.trim();
        }

        if (relationship !== undefined) {
            parent.relationship =
                relationship;
        }

        if (occupation !== undefined) {
            parent.occupation =
                occupation.trim();
        }

        if (address !== undefined) {
            parent.address =
                address.trim();
        }

        if (city !== undefined) {
            parent.city =
                city.trim();
        }

        if (state !== undefined) {
            parent.state =
                state.trim();
        }

        if (pincode !== undefined) {
            parent.pincode =
                pincode.trim();
        }

        if (status !== undefined) {
            parent.status = status;
        }

        await parent.save();

        const updatedParent =
            await Parent.findById(
                parent._id
            ).populate(
                "userId",
                "name email role status"
            );

        res.status(200).json({
            success: true,
            message:
                "Parent updated successfully.",
            parent: updatedParent,
        });
    } catch (error) {
        console.error(
            "Update parent error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to update parent.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Parent
|--------------------------------------------------------------------------
| DELETE /api/parents/:id
|--------------------------------------------------------------------------
|
| Important:
| This deletes ONLY the Parent profile.
| It does NOT delete the User/login account.
|--------------------------------------------------------------------------
*/

const deleteParent = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID.",
            });
        }

        const parent =
            await Parent.findById(id);

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found.",
            });
        }

        await Parent.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:
                "Parent profile deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete parent error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to delete parent.",
        });
    }
};

module.exports = {
    createParent,
    getParents,
    getParent,
    updateParent,
    deleteParent,
};