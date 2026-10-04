import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../../features/users/usersApi";

const roleLabels = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  accountant: "Accountant",
  librarian: "Librarian",
  staff: "Staff",
};

const roleBadgeClasses = {
  super_admin: "bg-danger",
  school_admin: "bg-primary",
  teacher: "bg-info",
  student: "bg-success",
  parent: "bg-warning text-dark",
  accountant: "bg-secondary",
  librarian: "bg-dark",
  staff: "bg-light text-dark",
};

const Users = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isFetching, isError, error } = useGetUsersQuery({
    page,
    limit,
    search,
    role,
    status,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.users || [];

  const pagination = data?.pagination || {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await deleteUser(deleteId).unwrap();

      setDeleteId(null);

      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Delete user error:", error);

      alert(error?.data?.message || "Unable to delete user.");
    }
  };

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages || 1;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <Link to="/users/create" className="btn btn-primary">
                <i className="ri-add-line me-1" />
                Add User
              </Link>
            </div>

            <h4 className="page-title">Users</h4>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0">Total Users</h5>

              <h3 className="mt-3 mb-0">{pagination.total || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0">Active Users</h5>

              <h3 className="mt-3 mb-0 text-success">
                {status === "active" ? pagination.total : "-"}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="text-muted fw-normal mt-0">Current Role</h5>

              <h3 className="mt-3 mb-0">{role ? roleLabels[role] : "All"}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="card">
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-5 mb-2 mb-md-0">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-search-line" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3 mb-2 mb-md-0">
              <select
                className="form-select"
                value={role}
                onChange={handleRoleChange}
              >
                <option value="">All Roles</option>

                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 mb-2 mb-md-0">
              <select
                className="form-select"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={limit}
                onChange={handleLimitChange}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="alert alert-danger">
              {error?.data?.message || "Unable to load users."}
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <i className="ri-user-search-line fs-32 text-muted" />

                          <p className="mt-2 mb-0 text-muted">
                            No users found.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={user._id}>
                          <td>{(page - 1) * limit + index + 1}</td>

                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-2">
                                <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>

                              <div>
                                <h5 className="font-14 mb-0">{user.name}</h5>
                              </div>
                            </div>
                          </td>

                          <td>{user.email}</td>

                          <td>
                            <span
                              className={`badge ${
                                roleBadgeClasses[user.roleId?.slug] ||
                                "bg-secondary"
                              }`}
                            >
                              {user.roleId?.name ||
                                user.roleId?.slug ||
                                "No Role"}
                            </span>
                          </td>

                          <td>
                            {user.status === "active" ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-danger">Inactive</span>
                            )}
                          </td>

                          <td className="text-end">
                            <Link
                              to={`/users/${user._id}`}
                              className="btn btn-sm btn-light me-1"
                              title="View"
                            >
                              <i className="mdi mdi-eye" />
                            </Link>

                            <Link
                              to={`/users/${user._id}/edit`}
                              className="btn btn-sm btn-light me-1"
                              title="Edit"
                            >
                              <i className="mdi mdi-pencil" />
                            </Link>

                            <button
                              type="button"
                              className="btn btn-sm btn-light text-danger"
                              title="Delete"
                              onClick={() => setDeleteId(user._id)}
                            >
                              <i className="mdi mdi-delete" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Showing {users.length ? (page - 1) * limit + 1 : 0} to{" "}
                    {Math.min(page * limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </div>

                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {getPageNumbers().map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          page === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        page >= pagination.totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1)
                          )
                        }
                        disabled={page >= pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              {isFetching && !isLoading && (
                <div className="text-center mt-2">
                  <small className="text-muted">Loading...</small>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete User</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                />
              </div>

              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete this user?
                </p>

                <small className="text-muted">
                  This action cannot be undone.
                </small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
