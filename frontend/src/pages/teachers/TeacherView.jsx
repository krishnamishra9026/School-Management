import React from "react";
import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useGetTeacherQuery,
} from "../../features/teachers/teachersApi";

const TeacherView = () => {
    const { id } = useParams();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetTeacherQuery(id);

    const teacher =
        data?.teacher ||
        data?.data ||
        data;

    if (isLoading) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <h5 className="mt-3">
                        Loading Teacher...
                    </h5>
                </div>
            </div>
        );
    }

    if (isError || !teacher) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="alert alert-danger">
                        {error?.data?.message ||
                            "Teacher not found."}
                    </div>

                    <Link
                        to="/teachers"
                        className="btn btn-secondary"
                    >
                        Back to Teachers
                    </Link>
                </div>
            </div>
        );
    }

    const fullName =
        `${teacher.firstName || ""} ${
            teacher.lastName || ""
        }`.trim();

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to="/teachers">
                                Teachers
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            View
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Teacher Details
                </h4>
            </div>

            {/* Profile */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex align-items-center">

                        <div className="avatar-lg me-3">
                            <span className="avatar-title bg-primary-subtle text-primary rounded-circle font-24">
                                {teacher.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "T"}
                            </span>
                        </div>

                        <div className="flex-grow-1">
                            <h4 className="mb-1">
                                {fullName}
                            </h4>

                            <p className="text-muted mb-0">
                                {teacher.designation ||
                                    "Teacher"}

                                {teacher.department &&
                                    ` • ${teacher.department}`}
                            </p>

                            <p className="text-muted mb-0">
                                Employee ID:{" "}
                                <strong>
                                    {teacher.employeeId}
                                </strong>
                            </p>
                        </div>

                        <Link
                            to={`/teachers/${id}/edit`}
                            className="btn btn-primary"
                        >
                            <i className="mdi mdi-pencil me-1"></i>
                            Edit Teacher
                        </Link>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Personal Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <strong>Full Name</strong>
                            <p className="text-muted mb-0">
                                {fullName || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Gender</strong>
                            <p className="text-muted text-capitalize mb-0">
                                {teacher.gender || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Date of Birth</strong>
                            <p className="text-muted mb-0">
                                {teacher.dateOfBirth
                                    ? new Date(
                                          teacher.dateOfBirth
                                      ).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Contact Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <strong>Email</strong>
                            <p className="text-muted mb-0">
                                {teacher.email || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Phone</strong>
                            <p className="text-muted mb-0">
                                {teacher.phone || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Alternate Phone</strong>
                            <p className="text-muted mb-0">
                                {teacher.alternatePhone ||
                                    "-"}
                            </p>
                        </div>

                        <div className="col-md-12 mb-3">
                            <strong>Address</strong>
                            <p className="text-muted mb-0">
                                {teacher.address || "-"}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Professional */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Professional Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <strong>Qualification</strong>
                            <p className="text-muted mb-0">
                                {teacher.qualification ||
                                    "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Specialization</strong>
                            <p className="text-muted mb-0">
                                {teacher.specialization ||
                                    "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Experience</strong>
                            <p className="text-muted mb-0">
                                {teacher.experience != null
                                    ? `${teacher.experience} years`
                                    : "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Department</strong>
                            <p className="text-muted mb-0">
                                {teacher.department || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Designation</strong>
                            <p className="text-muted mb-0">
                                {teacher.designation || "-"}
                            </p>
                        </div>

                        <div className="col-md-4 mb-3">
                            <strong>Status</strong>
                            <p className="mb-0">
                                <span
                                    className={`badge ${
                                        teacher.status ===
                                        "active"
                                            ? "bg-success-subtle text-success"
                                            : "bg-danger-subtle text-danger"
                                    }`}
                                >
                                    {teacher.status ||
                                        "active"}
                                </span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <div className="mb-3">
                <Link
                    to="/teachers"
                    className="btn btn-light"
                >
                    <i className="mdi mdi-arrow-left me-1"></i>
                    Back to Teachers
                </Link>
            </div>
        </>
    );
};

export default TeacherView;