const RolePermission = require(
  "../models/RolePermission"
);

const getUserPermissions = async (
  roleId
) => {
  const rolePermissions =
      await RolePermission.find({
          roleId,
      }).populate(
          "permissionId"
      );

  return rolePermissions
      .map(
          (item) =>
              item.permissionId
      )
      .filter(Boolean)
      .filter(
          (permission) =>
              permission.status ===
              "active"
      )
      .map(
          (permission) =>
              permission.slug
      );
};

module.exports = {
  getUserPermissions,
};