import React from "react";
import { Link } from "react-router-dom";

import {
    StatCard,
    PageTitle,
    ProfileMissing,
    formatRate,
    attendanceSubtitle,
} from "./DashboardWidgets";

const TeacherDashboard = ({ data }) => {
    if (data.profileMissing) {
        return (
            <>
                <PageTitle title={`Welcome, ${data.user.name}`} subtitle={data.roleName} />
                <ProfileMissing roleName={data.roleName} />
            </>
        );
    }

    const { profile, stats, subjects = [], classes = [], attendanceToday } = data;

    return (
        <>
            <PageTitle
                title={`Welcome, ${profile.name}`}
                subtitle={`${profile.designation || "Teacher"} · ${profile.employeeId}`}
            />

            <div className="row">
                <StatCard
                    title="My Classes"
                    value={stats.classes}
                    icon="mdi-google-classroom"
                    subtitle={`Class teacher of ${stats.classTeacherOf}`}
                />
                <StatCard
                    title="Subjects"
                    value={stats.subjects}
                    icon="mdi-book-open-variant"
                    subtitle={profile.specialization && `Specialization: ${profile.specialization}`}
                />
                <StatCard
                    title="My Students"
                    value={stats.students}
                    icon="mdi-account-group"
                    subtitle="Across all my classes"
                />
                <StatCard
                    title="Attendance Today"
                    value={formatRate(attendanceToday)}
                    icon="mdi-calendar-check"
                    subtitle={attendanceSubtitle(attendanceToday, "today")}
                />
            </div>

            <div className="row">
                {/* My classes */}
                <div className="col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <Link to="/my-panel" className="btn btn-sm btn-light float-end">
                                Open My Panel
                            </Link>

                            <h4 className="header-title mb-3">My Classes</h4>

                            {classes.length === 0 ? (
                                <p className="text-muted mb-0">
                                    You are not assigned to any class yet.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-centered table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Class</th>
                                                <th>Room</th>
                                                <th>My Subjects</th>
                                                <th>Students</th>
                                                <th>Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.map((c) => (
                                                <tr key={c._id}>
                                                    <td>
                                                        <strong>
                                                            {c.name} - {c.section}
                                                        </strong>
                                                    </td>
                                                    <td>{c.room || "—"}</td>
                                                    <td>
                                                        {c.mySubjects.length
                                                            ? c.mySubjects.join(", ")
                                                            : <span className="text-muted">—</span>}
                                                    </td>
                                                    <td>{c.students}</td>
                                                    <td>
                                                        {c.isClassTeacher ? (
                                                            <span className="badge bg-success">
                                                                Class Teacher
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-light text-dark">
                                                                Subject Teacher
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-xl-4">
                    {/* Subjects */}
                    <div className="card">
                        <div className="card-body">
                            <h4 className="header-title mb-3">My Subjects</h4>

                            {subjects.length === 0 ? (
                                <p className="text-muted mb-0">No subjects assigned yet.</p>
                            ) : (
                                <div className="d-flex flex-wrap gap-2">
                                    {subjects.map((s) => (
                                        <span key={s} className="badge bg-primary fs-6">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="card">
                        <div className="card-body">
                            <h4 className="header-title mb-3">Quick Links</h4>

                            <div className="d-grid gap-2">
                                <Link to="/my-students" className="btn btn-primary">
                                    <i className="mdi mdi-account-group me-1"></i>
                                    My Students
                                </Link>
                                <Link to="/my-panel" className="btn btn-success">
                                    <i className="mdi mdi-view-dashboard-outline me-1"></i>
                                    My Panel
                                </Link>
                                <Link to="/attendance" className="btn btn-info">
                                    <i className="mdi mdi-calendar-check me-1"></i>
                                    Attendance
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherDashboard;
