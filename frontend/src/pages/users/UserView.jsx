import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useGetUserQuery } from "../../features/users/usersApi";

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

const UserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
    } = useGetUserQuery(id);

    const user = data?.user || data;

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border text-primary"
                    role="status"
                />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="alert alert-danger">
                User not found.
            </div>
        );
    }

    return (
        <>
            <div className="row mb-3">
                <div className="col-12">
                    <div className="page-title-box">
                        <div className="page-title-right">
                            <Link
                                to="/users"
                                className="btn btn-secondary me-1"
                            >
                                <i className="ri-arrow-left-line me-1" />
                                Back
                            </Link>

                            <Link
                                to={`/users/${id}/edit`}
                                className="btn btn-primary"
                            >
                                <i className="ri-edit-line me-1" />
                                Edit
                            </Link>
                        </div>

                        <h4 className="page-title">
                            User Details
                        </h4>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="avatar-lg mx-auto mb-3">
                                <span className="avatar-title rounded-circle bg-primary-subtle text-primary fs-24">
                                    {user.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>

                            <h4>{user.name}</h4>

                            <p className="text-muted mb-2">
                                {user.email}
                            </p>

                            <span className="badge bg-primary">
                                {roleLabels[user.role] ||
                                    user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="header-title mb-3">
                                Account Information
                            </h4>

                            <div className="table-responsive">
                                <table className="table table-bordered mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="30%">
                                                Name
                                            </th>
                                            <td>
                                                {user.name}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Email</th>
                                            <td>
                                                {user.email}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Role</th>
                                            <td>
                                                {roleLabels[
                                                    user.role
                                                ] ||
                                                    user.role}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Status</th>
                                            <td>
                                                {user.status ===
                                                "active" ? (
                                                    <span className="badge bg-success">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-danger">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Created</th>
                                            <td>
                                                {user.createdAt
                                                    ? new Date(
                                                          user.createdAt
                                                      ).toLocaleString()
                                                    : "-"}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>Updated</th>
                                            <td>
                                                {user.updatedAt
                                                    ? new Date(
                                                          user.updatedAt
                                                      ).toLocaleString()
                                                    : "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserView;