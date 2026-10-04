import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    useGetStudentQuery,
    useUpdateStudentMutation,
} from "../../features/students/studentsApi";

import StudentForm from "./StudentForm";

const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading: isStudentLoading,
        isError,
        error,
    } = useGetStudentQuery(id);

    const [updateStudent, { isLoading: isUpdating }] =
        useUpdateStudentMutation();

    const student = data?.student || data?.data || data;

    const handleSubmit = async (formData) => {
        try {
            const result = await updateStudent({
                id,
                ...formData,
            }).unwrap();

            const updatedStudent =
                result?.student || result?.data || result;

            navigate(`/students/${updatedStudent?._id || id}`);
        } catch (err) {
            console.error("Update student error:", err);

            alert(
                err?.data?.message ||
                    err?.message ||
                    "Unable to update student."
            );
        }
    };

    if (isStudentLoading) {
        return (
            <>
                <div className="page-title-box">
                    <h4 className="page-title">Edit Student</h4>
                </div>

                <div className="card">
                    <div className="card-body text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        />

                        <h5 className="mt-3">
                            Loading Student...
                        </h5>

                        <p className="text-muted mb-0">
                            Please wait while student information is loaded.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (isError || !student) {
        return (
            <>
                <div className="page-title-box">
                    <div className="page-title-right">
                        <ol className="breadcrumb m-0">
                            <li className="breadcrumb-item">
                                <Link to="/dashboard">Dashboard</Link>
                            </li>

                            <li className="breadcrumb-item">
                                <Link to="/students">Students</Link>
                            </li>

                            <li className="breadcrumb-item active">
                                Edit Student
                            </li>
                        </ol>
                    </div>

                    <h4 className="page-title">Edit Student</h4>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-danger mb-3">
                            <i className="mdi mdi-alert-circle-outline me-1"></i>

                            {error?.data?.message ||
                                "Student not found or unable to load student."}
                        </div>

                        <Link
                            to="/students"
                            className="btn btn-secondary"
                        >
                            <i className="mdi mdi-arrow-left me-1"></i>
                            Back to Students
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Page Title */}
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to="/students">
                                Students
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to={`/students/${id}`}>
                                {student.firstName}{" "}
                                {student.lastName}
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            Edit
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Edit Student
                </h4>
            </div>

            {/* Student Header */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="avatar-lg me-3">
                                    <span className="avatar-title bg-primary-subtle text-primary rounded-circle font-24">
                                        {student.firstName
                                            ?.charAt(0)
                                            ?.toUpperCase() || "S"}
                                    </span>
                                </div>

                                <div className="flex-grow-1">
                                    <h4 className="mb-1">
                                        {student.firstName}{" "}
                                        {student.lastName}
                                    </h4>

                                    <p className="text-muted mb-0">
                                        <span className="me-3">
                                            <i className="mdi mdi-card-account-details-outline me-1"></i>
                                            {student.admissionNumber ||
                                                "-"}
                                        </span>

                                        <span>
                                            <i className="mdi mdi-school-outline me-1"></i>
                                            {student.className ||
                                                "-"}
                                            {student.section
                                                ? ` - ${student.section}`
                                                : ""}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <Link
                                        to={`/students/${id}`}
                                        className="btn btn-light"
                                    >
                                        <i className="mdi mdi-eye me-1"></i>
                                        View Student
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="row">
                <div className="col-12">
                    <StudentForm
                        student={student}
                        onSubmit={handleSubmit}
                        loading={isUpdating}
                        submitText="Update Student"
                    />
                </div>
            </div>
        </>
    );
};

export default StudentEdit;