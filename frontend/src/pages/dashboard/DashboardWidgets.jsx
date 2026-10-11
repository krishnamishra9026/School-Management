import React from "react";

export const StatCard = ({ title, value, icon, subtitle, colClass = "col-lg-3 col-md-6" }) => (
    <div className={colClass}>
        <div className="card widget-flat">
            <div className="card-body">
                <div className="float-end">
                    <i className={`mdi ${icon} widget-icon`}></i>
                </div>

                <h5 className="text-muted fw-normal mt-0">{title}</h5>

                <h3 className="mt-3 mb-3">{value}</h3>

                {subtitle && (
                    <p className="mb-0 text-muted">
                        <span className="text-nowrap">{subtitle}</span>
                    </p>
                )}
            </div>
        </div>
    </div>
);

export const formatRate = (summary) =>
    summary?.rate === null || summary?.rate === undefined
        ? "—"
        : `${summary.rate}%`;

export const attendanceSubtitle = (summary, label) =>
    summary?.total
        ? `${summary.Present} present · ${summary.Absent} absent · ${summary.Late} late ${label}`
        : `No attendance marked ${label}`;

const ATTENDANCE_BADGE = {
    Present: "bg-success",
    Absent: "bg-danger",
    Late: "bg-warning",
};

export const AttendanceBadge = ({ status }) => (
    <span className={`badge ${ATTENDANCE_BADGE[status] || "bg-secondary"}`}>
        {status}
    </span>
);

export const StatusBadge = ({ status = "active" }) => (
    <span
        className={`badge ${
            status === "inactive" ? "bg-secondary" : "bg-success"
        } text-capitalize`}
    >
        {status}
    </span>
);

export const PageTitle = ({ title, subtitle }) => (
    <div className="row">
        <div className="col-12">
            <div className="page-title-box">
                <h4 className="page-title">
                    {title}
                    {subtitle && (
                        <small className="text-muted fw-normal ms-2">
                            {subtitle}
                        </small>
                    )}
                </h4>
            </div>
        </div>
    </div>
);

export const ProfileMissing = ({ roleName }) => (
    <div className="alert alert-warning">
        <i className="mdi mdi-alert-outline me-1"></i>
        Your account is not linked to a {roleName.toLowerCase()} profile yet.
        Please contact the school administrator.
    </div>
);

/**
 * Class, teachers, subjects and attendance for one student.
 * Used by the student dashboard and for each child on the
 * parent dashboard.
 */
export const StudentOverview = ({ student, heading }) => {
    const { schoolClass, attendance, recentAttendance = [] } = student;

    return (
        <>
            {heading}

            <div className="row">
                <StatCard
                    title="Class"
                    value={
                        schoolClass
                            ? `${schoolClass.name} - ${schoolClass.section}`
                            : `${student.className || "—"} ${student.section || ""}`
                    }
                    icon="mdi-google-classroom"
                    subtitle={schoolClass?.academicYear}
                />

                <StatCard
                    title="Roll No."
                    value={student.rollNumber || "—"}
                    icon="mdi-card-account-details-outline"
                    subtitle={`Admission No. ${student.admissionNumber}`}
                />

                <StatCard
                    title="Attendance (30 days)"
                    value={formatRate(attendance)}
                    icon="mdi-calendar-check"
                    subtitle={attendanceSubtitle(attendance, "in 30 days")}
                />

                <StatCard
                    title="Subjects"
                    value={schoolClass?.subjects.length ?? 0}
                    icon="mdi-book-open-variant"
                    subtitle={
                        schoolClass
                            ? `${schoolClass.classmates} classmates`
                            : "Not enrolled in a class yet"
                    }
                />
            </div>

            <div className="row">
                {/* Class & subjects */}
                <div className="col-xl-7">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="header-title mb-3">
                                Class & Subjects
                            </h4>

                            {!schoolClass ? (
                                <p className="text-muted mb-0">
                                    Not enrolled in a class yet.
                                </p>
                            ) : (
                                <>
                                    <p className="mb-3">
                                        <strong>Class Teacher:</strong>{" "}
                                        {schoolClass.classTeacher ? (
                                            <>
                                                {schoolClass.classTeacher.name}
                                                {schoolClass.classTeacher.phone && (
                                                    <span className="text-muted ms-2">
                                                        <i className="mdi mdi-phone"></i>{" "}
                                                        {schoolClass.classTeacher.phone}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-muted">Not assigned</span>
                                        )}
                                        {schoolClass.room && (
                                            <span className="text-muted ms-3">
                                                Room {schoolClass.room}
                                            </span>
                                        )}
                                    </p>

                                    {schoolClass.subjects.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            No subjects assigned yet.
                                        </p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm table-centered mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Teacher</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schoolClass.subjects.map((s) => (
                                                        <tr key={s.subject}>
                                                            <td>{s.subject}</td>
                                                            <td>{s.teacher || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent attendance */}
                <div className="col-xl-5">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="header-title mb-3">
                                Recent Attendance
                            </h4>

                            {recentAttendance.length === 0 ? (
                                <p className="text-muted mb-0">
                                    No attendance records yet.
                                </p>
                            ) : (
                                <table className="table table-sm table-centered mb-0">
                                    <tbody>
                                        {recentAttendance.map((a) => (
                                            <tr key={a._id}>
                                                <td>
                                                    {new Date(a.date).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <AttendanceBadge status={a.status} />
                                                </td>
                                                <td className="text-muted">
                                                    {a.remarks || ""}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
