import React, { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import {
  useGetRolesQuery,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "../../features/roles/rolesApi";

import { useGetPermissionsQuery } from "../../features/permissions/permissionsApi";

const ACTIONS = ["view", "create", "update", "delete"];

const RolePermissions = () => {
  // Get roleId from URL
  const { roleId } = useParams();

  console.log("Role ID:", roleId);

  const { data: rolesResponse } = useGetRolesQuery();

  const { data: permissionsResponse, isLoading: permissionsLoading } =
    useGetPermissionsQuery({
      limit: 200,
      status: "active",
    });

  const { data: rolePermissionsResponse, isLoading: rolePermissionsLoading } =
    useGetRolePermissionsQuery(roleId, {
      skip: !roleId,
    });

  const [updateRolePermissions, { isLoading: saving }] =
    useUpdateRolePermissionsMutation();

  const [selected, setSelected] = useState(new Set());

  const permissions = permissionsResponse?.data || [];

  const role = rolesResponse?.data?.find((item) => item._id === roleId);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }

      groups[permission.module].push(permission);

      return groups;
    }, {});
  }, [permissions]);

  useEffect(() => {
    const slugs = rolePermissionsResponse?.permissionSlugs || [];

    setSelected(new Set(slugs));
  }, [rolePermissionsResponse]);

  const togglePermission = (slug) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      return next;
    });
  };

  const toggleModule = (modulePermissions) => {
    const moduleSlugs = modulePermissions.map((permission) => permission.slug);

    const allSelected = moduleSlugs.every((slug) => selected.has(slug));

    setSelected((previous) => {
      const next = new Set(previous);

      moduleSlugs.forEach((slug) => {
        if (allSelected) {
          next.delete(slug);
        } else {
          next.add(slug);
        }
      });

      return next;
    });
  };

  const handleSave = async () => {
    if (!roleId) {
      alert("Role ID is missing.");
      return;
    }

    try {
      await updateRolePermissions({
        roleId,
        permissions: Array.from(selected),
      }).unwrap();

      alert("Permissions saved successfully.");
    } catch (error) {
      alert(error?.data?.message || "Failed to save permissions.");
    }
  };

  if (permissionsLoading || rolePermissionsLoading) {
    return <div className="text-center py-5">Loading permissions...</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="header-title mb-1">Role Permissions</h4>

            <p className="text-muted mb-0">
              Role: <strong>{role?.name || "Loading..."}</strong>
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={saving || !roleId}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>Module</th>

                {ACTIONS.map((action) => (
                  <th key={action} className="text-center">
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Object.entries(groupedPermissions).map(
                ([module, modulePermissions]) => {
                  const permissionMap = Object.fromEntries(
                    modulePermissions.map((permission) => [
                      permission.slug.split(".")[1],
                      permission,
                    ])
                  );

                  return (
                    <tr key={module}>
                      <td>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={modulePermissions.every((permission) =>
                              selected.has(permission.slug)
                            )}
                            onChange={() => toggleModule(modulePermissions)}
                          />

                          <label className="form-check-label fw-semibold">
                            {module
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (char) => char.toUpperCase())}
                          </label>
                        </div>
                      </td>

                      {ACTIONS.map((action) => {
                        const permission = permissionMap[action];

                        return (
                          <td key={action} className="text-center">
                            {permission ? (
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selected.has(permission.slug)}
                                onChange={() =>
                                  togglePermission(permission.slug)
                                }
                              />
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
