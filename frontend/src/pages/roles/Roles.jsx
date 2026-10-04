import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "../../features/roles/rolesApi";

const Roles = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, isLoading, isFetching, error } = useGetRolesQuery({
    page,
    limit,
    search,
    status,
  });

  const [deleteRole] = useDeleteRoleMutation();

  const roles = data?.data || [];
  const pagination = data?.pagination || {};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (role) => {
    if (role.isSystemRole) {
      alert("System roles cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRole(role._id).unwrap();

      alert("Role deleted successfully.");
    } catch (error) {
      alert(error?.data?.message || "Failed to delete role.");
    }
  };

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <Link to="/roles/create" className="btn btn-primary">
                <i className="ri-add-line me-1" />
                Add Role
              </Link>
            </div>

            <h4 className="page-title">Roles</h4>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-search-line" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search role..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <h4 className="header-title mb-0">Role List</h4>

            {isFetching && <span className="text-muted">Loading...</span>}
          </div>

          {isLoading ? (
            <div className="text-center py-5">Loading roles...</div>
          ) : error ? (
            <div className="alert alert-danger">
              {error?.data?.message || "Failed to load roles."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-centered table-nowrap mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Role Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>System Role</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No roles found.
                      </td>
                    </tr>
                  ) : (
                    roles.map((role, index) => (
                      <tr key={role._id}>
                        <td>{(page - 1) * limit + index + 1}</td>

                        <td>
                          <strong>{role.name}</strong>
                        </td>

                        <td>
                          <code>{role.slug}</code>
                        </td>

                        <td>{role.description}</td>

                        <td>
                          <span
                            className={`badge ${
                              role.status === "active"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {role.status}
                          </span>
                        </td>

                        <td>
                          {role.isSystemRole ? (
                            <span className="badge bg-info">Yes</span>
                          ) : (
                            <span className="badge bg-light text-dark">No</span>
                          )}
                        </td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Link
                              to={`/roles/${role._id}/permissions`}
                              className="btn btn-sm btn-info"
                              title="Permissions"
                            >
                              <i className="mdi mdi-eye" />
                            </Link>

                            <Link
                              to={`/roles/${role._id}/edit`}
                              className="btn btn-sm btn-primary"
                              title="Edit"
                            >
                              <i className="mdi mdi-pencil" />
                            </Link>

                            {!role.isSystemRole && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                title="Delete"
                                onClick={() => handleDelete(role)}
                              >
                                <i className="mdi mdi-delete" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.totalPages}</strong>
              </div>

              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                <button
                  className="btn btn-outline-primary"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roles;
