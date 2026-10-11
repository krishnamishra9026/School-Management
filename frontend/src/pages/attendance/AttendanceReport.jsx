import React, { useEffect, useState } from "react";

import {
    useGetAttendanceClassesQuery,
    useGetAttendanceSummaryQuery,
} from "../../features/attendance/attendanceApi";

import {
    daysAgoString,
    todayString,
    errorMessage,
    rateClass,
} from "./attendanceUtils";

/**
 * Student-wise attendance totals for a class and date range.
 */
const AttendanceReport = () => {
    const [classId, setClassId] = useState("");
    const [from, setFrom] = useState(daysAgoString(29));
    const [to, setTo] = useState(todayString());

    const { data: classesData, isLoading: classesLoading } =
        useGetAttendanceClassesQuery();

    const classes = classesData?.classes || [];

    useEffect(() => {
        if (!classId && classes.length) {
            setClassId(classes[0]._id);
        }
    }, [classes, classId]);

    const { data, isFetching, isError, error } = useGetAttendanceSummaryQuery(
        { classId, from, to },
        { skip: !classId }
    );

    const students = data?.students || [];
    const overall = data?.overall;

    if (classesLoading) {
        return (
            <div className="text-center py-4">
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div className="alert alert-info mb-0">
                No classes available for reports.
            </div>
        );
    }

    return (
        <>
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                    >
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name} - {c.section} ({c.academicYear})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3 col-6">
                    <div className="input-group">
                        <span className="input-group-text">From</span>
                        <input
                            type="date"
                            className="form-control"
                            value={from}
                            max={to}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3 col-6">
                    <div className="input-group">
                        <span className="input-group-text">To</span>
                        <input
                            type="date"
                            className="form-control"
                            value={to}
                            min={from}
                            max={todayString()}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {overall && (
                <div className="d-flex flex-wrap gap-3 mb-2 small">
                    <span>Records: <strong>{overall.total}</strong></span>
                    <span className="text-success">Present: {overall.Present}</span>
                    <span className="text-danger">Absent: {overall.Absent}</span>
                    <span className="text-warning">Late: {overall.Late}</span>
                    <span>
                        Class average:{" "}
                        <strong>{overall.rate === null ? "—" : `${overall.rate}%`}</strong>
                    </span>
                </div>
            )}

            {isError ? (
                <div className="alert alert-danger">
                    {errorMessage(error, "Unable to load report.")}
                </div>
            ) : (
                <div className={`table-responsive ${isFetching ? "opacity-50" : ""}`}>
                    <table className="table table-centered table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Roll</th>
                                <th>Student</th>
                                <th className="text-center">Present</th>
                                <th className="text-center">Absent</th>
                                <th className="text-center">Late</th>
                                <th className="text-center">Days</th>
                                <th style={{ width: "25%" }}>Attendance</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted">
                                        {isFetching ? "Loading..." : "No students in this class."}
                                    </td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s._id}>
                                        <td>{s.rollNumber || "—"}</td>
                                        <td>
                                            <strong>{s.name}</strong>
                                            <div className="small text-muted">
                                                {s.admissionNumber}
                                            </div>
                                        </td>
                                        <td className="text-center text-success">{s.Present}</td>
                                        <td className="text-center text-danger">{s.Absent}</td>
                                        <td className="text-center text-warning">{s.Late}</td>
                                        <td className="text-center">{s.total}</td>
                                        <td>
                                            {s.rate === null ? (
                                                <span className="text-muted small">No records</span>
                                            ) : (
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                                                        <div
                                                            className={`progress-bar ${rateClass(s.rate)}`}
                                                            style={{ width: `${s.rate}%` }}
                                                        />
                                                    </div>
                                                    <small className="text-nowrap">{s.rate}%</small>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default AttendanceReport;
