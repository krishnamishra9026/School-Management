import React from "react";

import { useGetMyPanelQuery } from "../../features/teachers/teachersApi";
import TeacherStudentsTable from "./TeacherStudentsTable";

const TeacherPanel = () => {
    const { data, isLoading, isError, error } = useGetMyPanelQuery();

    const classes = data?.classes || [];

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-danger mt-3">
                {error?.data?.message || "Unable to load teacher panel."}
            </div>
        );
    }

    const { teacher, subjects = [], totalStudents = 0 } = data;

    return (
        <>
            {/* Page title */}
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">
                            My Panel — {teacher.firstName} {teacher.lastName}
                            <small className="text-muted ms-2">
                                ({teacher.employeeId})
                            </small>
                        </h4>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-1">
                                Classes
                            </h6>
                            <h3 className="mb-0">{classes.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-1">
                                Subjects
                            </h6>
                            <h3 className="mb-0">{subjects.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="text-muted text-uppercase mb-1">
                                Students
                            </h6>
                            <h3 className="mb-0">{totalStudents}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assigned subjects */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">My Assigned Subjects</h5>
                </div>

                <div className="card-body">
                    {subjects.length === 0 ? (
                        <p className="text-muted mb-0">
                            No subjects assigned yet.
                        </p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                                <span
                                    key={subject}
                                    className="badge bg-primary fs-6"
                                >
                                    {subject}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Class-wise subjects */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Class-wise Subjects</h5>
                </div>

                <div className="card-body">
                    {classes.length === 0 ? (
                        <p className="text-muted mb-0">
                            You are not assigned to any class yet.
                        </p>
                    ) : (
                        <div className="row">
                            {classes.map((c) => (
                                <div className="col-md-6 col-xl-4 mb-3" key={c._id}>
                                    <div className="border rounded p-3 h-100">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h5 className="mb-0">
                                                    {c.name}
                                                </h5>
                                                <small className="text-muted">
                                                    Grade {c.grade} · Section{" "}
                                                    {c.section} · {c.academicYear}
                                                    {c.room && ` · Room ${c.room}`}
                                                </small>
                                            </div>

                                            {c.isClassTeacher && (
                                                <span className="badge bg-success">
                                                    Class Teacher
                                                </span>
                                            )}
                                        </div>

                                        <p className="mb-2">
                                            <strong>{c.students.length}</strong>{" "}
                                            students
                                        </p>

                                        {c.subjects.length === 0 ? (
                                            <small className="text-muted">
                                                No subjects assigned to this class.
                                            </small>
                                        ) : (
                                            <table className="table table-sm mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Teacher</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {c.subjects.map((s) => (
                                                        <tr
                                                            key={s.subject}
                                                            className={
                                                                s.isMine
                                                                    ? "table-primary"
                                                                    : ""
                                                            }
                                                        >
                                                            <td>{s.subject}</td>
                                                            <td>
                                                                {s.isMine
                                                                    ? "You"
                                                                    : s.teacherName}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Student list */}
            <TeacherStudentsTable classes={classes} />
        </>
    );
};

export default TeacherPanel;
