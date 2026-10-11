import React, { useState } from "react";

import { useGetAttendanceSummaryQuery } from "../../features/attendance/attendanceApi";
import { StatCard } from "../dashboard/DashboardWidgets";

import AttendanceRecords from "./AttendanceRecords";
import {
    daysAgoString,
    todayString,
    errorMessage,
} from "./attendanceUtils";

/**
 * Attendance for a student (own) or parent (children).
 * The summary endpoint returns only students the user may see,
 * so it doubles as the child list for parents.
 */
const MyAttendance = ({ isParent }) => {
    const [selectedId, setSelectedId] = useState("");

    const { data, isLoading, isError, error } = useGetAttendanceSummaryQuery({
        from: daysAgoString(29),
        to: todayString(),
    });

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-danger">
                {errorMessage(error, "Unable to load attendance.")}
            </div>
        );
    }

    const students = data?.students || [];

    if (students.length === 0) {
        return (
            <div className="alert alert-info">
                {isParent
                    ? "No children are linked to your account yet."
                    : "Your account is not linked to a student profile yet."}{" "}
                Please contact the school administrator.
            </div>
        );
    }

    const active = students.find((s) => s._id === selectedId) || students[0];

    return (
        <>
            {/* Child switcher */}
            {students.length > 1 && (
                <ul className="nav nav-pills bg-nav-pills mb-3">
                    {students.map((s) => (
                        <li className="nav-item" key={s._id}>
                            <button
                                type="button"
                                className={`nav-link ${s._id === active._id ? "active" : ""}`}
                                onClick={() => setSelectedId(s._id)}
                            >
                                <i className="mdi mdi-account me-1"></i>
                                {s.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <h5 className="mb-3">
                {active.name}
                <small className="text-muted fw-normal ms-2">
                    {active.className}
                    {active.section && ` - ${active.section}`}
                    {active.rollNumber && ` · Roll ${active.rollNumber}`}
                </small>
            </h5>

            {/* Last 30 days */}
            <div className="row">
                <StatCard
                    title="Attendance (30 days)"
                    value={active.rate === null ? "—" : `${active.rate}%`}
                    icon="mdi-percent"
                    subtitle={`${active.total} day(s) recorded`}
                />
                <StatCard
                    title="Present"
                    value={active.Present}
                    icon="mdi-check-circle-outline"
                />
                <StatCard
                    title="Absent"
                    value={active.Absent}
                    icon="mdi-close-circle-outline"
                />
                <StatCard
                    title="Late"
                    value={active.Late}
                    icon="mdi-clock-alert-outline"
                />
            </div>

            <div className="card">
                <div className="card-body">
                    <h4 className="header-title mb-3">Attendance History</h4>

                    <AttendanceRecords key={active._id} studentId={active._id} />
                </div>
            </div>
        </>
    );
};

export default MyAttendance;
