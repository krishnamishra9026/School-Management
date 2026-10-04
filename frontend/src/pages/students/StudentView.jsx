import React from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useGetStudentQuery,
} from "../../features/students/studentsApi";

const StudentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
    } = useGetStudentQuery(id);

    const student =
        data?.student ||
        data?.data ||
        data;

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />

                <p className="mt-2 text-muted">
                    Loading student...
                </p>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <div className="alert alert-danger">
                Student not found.
            </div>
        );
    }

    return (
        <>
            {/* Page title */}
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            School Management
                        </li>

                        <li className="breadcrumb-item">
                            <Link to="/students">
                                Students
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            View Student
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Student Details
                </h4>
            </div>

            <div className="row">

                {/* Profile */}
                <div className="col-md-4">

                    <div className="card">
                        <div className="card-body text-center">

                            <div className="avatar-xl mx-auto mb-3">
                                <span className="avatar-title bg-primary-subtle text-primary rounded-circle font-24">
                                    {student.firstName
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>

                            <h4>
                                {student.firstName}{" "}
                                {student.lastName}
                            </h4>

                            <p className="text-muted">
                                {
                                    student.admissionNumber
                                }
                            </p>

                            <span className="badge bg-success">
                                Active
                            </span>

                            <div className="mt-3">

                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() =>
                                        navigate(
                                            `/students/${id}/edit`
                                        )
                                    }
                                >
                                    <i className="mdi mdi-pencil me-1" />
                                    Edit
                                </button>

                                <Link
                                    to="/students"
                                    className="btn btn-light"
                                >
                                    Back
                                </Link>

                            </div>

                        </div>
                    </div>

                </div>

                {/* Details */}
                <div className="col-md-8">

                    <div className="card">

                        <div className="card-header">
                            <h5 className="mb-0">
                                Student Information
                            </h5>
                        </div>

                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        First Name
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.firstName ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        Last Name
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.lastName ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        Admission Number
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.admissionNumber ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        Gender
                                    </label>

                                    <div className="fw-semibold text-capitalize">
                                        {
                                            student.gender ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        Date of Birth
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.dateOfBirth
                                                ? new Date(
                                                      student.dateOfBirth
                                                  ).toLocaleDateString()
                                                : "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted">
                                        Phone
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.phone ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label className="text-muted">
                                        Email
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.email ||
                                            "-"
                                        }
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Academic */}
                    <div className="card">

                        <div className="card-header">
                            <h5 className="mb-0">
                                Academic Information
                            </h5>
                        </div>

                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-4">
                                    <label className="text-muted">
                                        Class
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.className ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <label className="text-muted">
                                        Section
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.section ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <label className="text-muted">
                                        Roll Number
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.rollNumber ||
                                            "-"
                                        }
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Parents */}
                    <div className="card">

                        <div className="card-header">
                            <h5 className="mb-0">
                                Parent Information
                            </h5>
                        </div>

                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-6">
                                    <label className="text-muted">
                                        Father's Name
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.fatherName ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-muted">
                                        Mother's Name
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.motherName ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-12 mt-3">
                                    <label className="text-muted">
                                        Address
                                    </label>

                                    <div className="fw-semibold">
                                        {
                                            student.address ||
                                            "-"
                                        }
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default StudentView;