const mongoose = require("mongoose");

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RolePermission = require("../models/RolePermission");

const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({
            status: "active",
        })
            .select("_id name slug status description isSystemRole")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            roles,
        });
    } catch (error) {
        console.error("Get all roles error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch roles.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/roles
|--------------------------------------------------------------------------
*/
const getRoles = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

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

    if (status) {
      query.status = status;
    }

    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const [roles, total] = await Promise.all([
      Role.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Role.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: roles,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/roles/:id
|--------------------------------------------------------------------------
*/
const getRole = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID.",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch role.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/roles
|--------------------------------------------------------------------------
*/
const createRole = async (req, res) => {
  try {
    const { name, slug, description = "", status = "active" } = req.body;

    if (!name?.trim()) {
      return res.status(422).json({
        success: false,
        message: "Role name is required.",
      });
    }

    if (!slug?.trim()) {
      return res.status(422).json({
        success: false,
        message: "Role slug is required.",
      });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existingRole = await Role.findOne({
      $or: [
        {
          name: name.trim(),
        },
        {
          slug: normalizedSlug,
        },
      ],
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role name or slug already exists.",
      });
    }

    const role = await Role.create({
      name: name.trim(),
      slug: normalizedSlug,
      description: description.trim(),
      status,
      isSystemRole: false,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Role name or slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create role.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/roles/:id
|--------------------------------------------------------------------------
*/
const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const { name, slug, description, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(422).json({
          success: false,
          message: "Role name cannot be empty.",
        });
      }

      role.name = name.trim();
    }

    /*
     * System role slug cannot change
     */
    if (slug !== undefined && slug.trim().toLowerCase() !== role.slug) {
      if (role.isSystemRole) {
        return res.status(400).json({
          success: false,
          message: "System role slug cannot be changed.",
        });
      }

      role.slug = slug.trim().toLowerCase();
    }

    if (description !== undefined) {
      role.description = description.trim();
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(422).json({
          success: false,
          message: "Invalid role status.",
        });
      }

      role.status = status;
    }

    await role.save();

    return res.json({
      success: true,
      message: "Role updated successfully.",
      data: role,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Role name or slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update role.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/roles/:id
|--------------------------------------------------------------------------
*/
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    if (role.isSystemRole) {
      return res.status(400).json({
        success: false,
        message: "System roles cannot be deleted.",
      });
    }

    /*
     * Important:
     * Users should not still reference
     * this role.
     */
    const User = require("../models/User");

    const usersUsingRole = await User.countDocuments({
      roleId: role._id,
    });

    if (usersUsingRole > 0) {
      return res.status(400).json({
        success: false,
        message: "This role is assigned to users and cannot be deleted.",
      });
    }

    await RolePermission.deleteMany({
      roleId: role._id,
    });

    await Role.deleteOne({
      _id: role._id,
    });

    return res.json({
      success: true,
      message: "Role deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete role.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/roles/:roleId/permissions
|--------------------------------------------------------------------------
*/
const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const rolePermissions = await RolePermission.find({
      roleId: role._id,
    }).populate("permissionId");

    const permissions = rolePermissions
      .map((item) => item.permissionId)
      .filter(Boolean)
      .filter((permission) => permission.status === "active");

    return res.json({
      success: true,
      role: {
        id: role._id,
        name: role.name,
        slug: role.slug,
      },
      permissions,
      permissionSlugs: permissions.map((permission) => permission.slug),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch role permissions.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/roles/:roleId/permissions
|--------------------------------------------------------------------------
*/
const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(422).json({
        success: false,
        message: "Permissions must be an array.",
      });
    }

    const role = await Role.findById(req.params.roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    /*
     * Validate permission slugs
     */
    const uniqueSlugs = [
      ...new Set(
        permissions
          .filter((item) => typeof item === "string")
          .map((item) => item.trim().toLowerCase())
      ),
    ];

    const permissionDocuments = await Permission.find({
      slug: {
        $in: uniqueSlugs,
      },
      status: "active",
    });

    const foundSlugs = permissionDocuments.map((permission) => permission.slug);

    const invalidPermissions = uniqueSlugs.filter(
      (slug) => !foundSlugs.includes(slug)
    );

    if (invalidPermissions.length) {
      return res.status(422).json({
        success: false,
        message: "One or more permissions are invalid.",
        invalidPermissions,
      });
    }

    /*
     * Replace existing assignments
     */
    await RolePermission.deleteMany({
      roleId: role._id,
    });

    if (permissionDocuments.length) {
      await RolePermission.insertMany(
        permissionDocuments.map((permission) => ({
          roleId: role._id,
          permissionId: permission._id,
        })),
        {
          ordered: false,
        }
      );
    }

    return res.json({
      success: true,
      message: "Role permissions updated successfully.",
      permissions: foundSlugs,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update role permissions.",
    });
  }
};

module.exports = {
  getRoles,
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
};
