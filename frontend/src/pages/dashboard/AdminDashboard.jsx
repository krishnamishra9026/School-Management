import React from "react";
import { Link } from "react-router-dom";

import { useAbility } from "../../auth/AbilityProvider";
import {
    StatCard,
    StatusBadge,
    PageTitle,
    formatRate,
    attendanceSubtitle,
} from "./DashboardWidgets";

const QUICK_ACTIONS = [
    { label: "Add Student", to: "/students/create", icon: "mdi-account-plus", color: "btn-primary", can: ["create", "students"] },
    { label: "Add Teacher", to: "/teachers/create", icon: "mdi-human-male-board", color: "btn-success", can: ["create", "teachers"] },
    { label: "Add Parent", to: "/parents/create", icon: "mdi-account-child", color: "btn-info", can: ["create", "parents"] },
    { label: "Manage Classes", to: "/classes", icon: "mdi-google-classroom", color: "btn-warning", can: ["view", "classes"] },
    { label: "Manage Users", to: "/users", icon: "mdi-account-cog", color: "btn-secondary", can: ["view", "users"] },
];

const AdminDashboard = ({ data }) => {
    const ability = useAbility();

    const {
        roleName,
        user,
        stats,
        attendanceToday,
        recentStudents = [],
        classSummary = [],
        classesWithoutTeacher = 0,
        usersByRole,
    } = data;

    const actions = QUICK_ACTIONS.filter(
        (a) => !ability || ability.can(...a.can)
    );

    return (
        <>
            <PageTitle
                title={`Welcome, ${user.name}`}
                subtitle={roleName}
            />

            {/* Statistics */}
            <div className="row">
                <StatCard
                    title="Students"
                    value={stats.students}
                    icon="mdi-account-group"
                    colClass="col-xl col-md-4 col-sm-6"
                />
                <StatCard
                    title="Teachers"
                    value={stats.teachers}
                    icon="mdi-human-male-board"
                    colClass="col-xl col-md-4 col-sm-6"
                />
                <StatCard
                    title="Parents"
                    value={stats.parents}
                    icon="mdi-account-child"
                    colClass="col-xl col-md-4 col-sm-6"
                />
                <StatCard
                    title="Classes"
                    value={stats.classes}
                    icon="mdi-google-classroom"
                    subtitle={
                        classesWithoutTeacher
                            ? `${classesWithoutTeacher} without class teacher`
                            : "All have a class teacher"
                    }
                    colClass="col-xl col-md-6 col-sm-6"
                />
                <StatCard
                    title="Attendance Today"
                    value={formatRate(attendanceToday)}
                    icon="mdi-calendar-check"
                    subtitle={attendanceSubtitle(attendanceToday, "today")}
                    colClass="col-xl col-md-6"
                />
            </div>

            <div className="row">
                {/* Recent students */}
                <div className="col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <Link
                                to="/students"
                                className="btn btn-sm btn-light float-end"
                            >
                                View All
                            </Link>

                            <h4 className="header-title mb-3">
                                Recent Students
                            </h4>

                            <div className="table-responsive">
                                <table className="table table-centered table-nowrap table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Class</th>
                                            <th>Admission No.</th>
                                            <th>Added</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">
                                                    No students yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentStudents.map((s) => (
                                                <tr key={s._id}>
                                                    <td>
                                                        <Link to={`/students/${s._id}`}>
                                                            <strong>
                                                                {s.firstName} {s.lastName}
                                                            </strong>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        {s.className}
                                                        {s.section && `-${s.section}`}
                                                    </td>
                                                    <td>{s.admissionNumber}</td>
                                                    <td>
                                                        {new Date(s.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={s.status} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick actions + users by role */}
                <div className="col-xl-4">
                    {actions.length > 0 && (
                        <div className="card">
                            <div className="card-body">
                                <h4 className="header-title mb-3">
                                    Quick Actions
                                </h4>

                                <div className="d-grid gap-2">
                                    {actions.map((a) => (
                                        <Link
                                            key={a.to}
                                            to={a.to}
                                            className={`btn ${a.color}`}
                                        >
                                            <i className={`mdi ${a.icon} me-1`}></i>
                                            {a.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {usersByRole && (
                        <div className="card">
                            <div className="card-body">
                                <h4 className="header-title mb-3">
                                    Users by Role
                                    <span className="text-muted fw-normal ms-2">
                                        ({stats.users})
                                    </span>
                                </h4>

                                <ul className="list-group list-group-flush">
                                    {usersByRole.map((r) => (
                                        <li
                                            key={r.role}
                                            className="list-group-item d-flex justify-content-between px-0"
                                        >
                                            {r.role}
                                            <span className="badge bg-primary rounded-pill">
                                                {r.count}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Class overview */}
            <div className="card">
                <div className="card-body">
                    <Link
                        to="/classes"
                        className="btn btn-sm btn-light float-end"
                    >
                        View All
                    </Link>

                    <h4 className="header-title mb-3">Class Overview</h4>

                    <div className="table-responsive">
                        <table className="table table-centered table-nowrap mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Class</th>
                                    <th>Year</th>
                                    <th>Class Teacher</th>
                                    <th style={{ width: "35%" }}>Enrollment</th>
                                </tr>
                            </thead>

                            <tbody>
                                {classSummary.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">
                                            No classes yet.
                                        </td>
                                    </tr>
                                ) : (
                                    classSummary.map((c) => {
                                        const pct = Math.min(
                                            100,
                                            Math.round((c.enrolled / (c.capacity || 1)) * 100)
                                        );

                                        return (
                                            <tr key={c._id}>
                                                <td>
                                                    <Link to={`/classes/${c._id}`}>
                                                        {c.name} - {c.section}
                                                    </Link>
                                                </td>
                                                <td>{c.academicYear}</td>
                                                <td>
                                                    {c.classTeacher || (
                                                        <span className="badge bg-warning">
                                                            Not assigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                                                            <div
                                                                className={`progress-bar ${pct >= 90 ? "bg-danger" : "bg-primary"}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <small className="text-muted text-nowrap">
                                                            {c.enrolled}/{c.capacity}
                                                        </small>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
