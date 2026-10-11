import React, { useEffect, useState } from "react";

import {
    useGetAttendanceClassesQuery,
    useGetAttendanceSheetQuery,
    useSaveAttendanceSheetMutation,
} from "../../features/attendance/attendanceApi";

import { STATUSES, todayString, errorMessage } from "./attendanceUtils";

const STATUS_BUTTON = {
    Present: "success",
    Absent: "danger",
    Late: "warning",
};

/**
 * Pick a class and day, then mark each student
 * Present / Absent / Late and save in one request.
 */
const MarkAttendance = () => {
    const [classId, setClassId] = useState("");
    const [date, setDate] = useState(todayString());
    const [entries, setEntries] = useState({});
    const [message, setMessage] = useState(null);

    const { data: classesData, isLoading: classesLoading } =
        useGetAttendanceClassesQuery();

    const classes = classesData?.classes || [];

    // Default to the first class once loaded
    useEffect(() => {
        if (!classId && classes.length) {
            setClassId(classes[0]._id);
        }
    }, [classes, classId]);

    const {
        data: sheet,
        isFetching: sheetLoading,
        isError: sheetError,
        error: sheetErrorData,
    } = useGetAttendanceSheetQuery(
        { classId, date },
        { skip: !classId || !date, refetchOnMountOrArgChange: true }
    );

    const [saveSheet, { isLoading: saving }] = useSaveAttendanceSheetMutation();

    // Load saved statuses into the editable state
    useEffect(() => {
        if (sheet?.students) {
            setEntries(
                Object.fromEntries(
                    sheet.students.map((s) => [
                        s._id,
                        { status: s.status || "", remarks: s.remarks || "" },
                    ])
                )
            );
        }
    }, [sheet]);

    const students = sheet?.students || [];

    const setEntry = (studentId, changes) => {
        setEntries((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...changes },
        }));
    };

    const markAll = (status) => {
        setEntries((prev) =>
            Object.fromEntries(
                students.map((s) => [s._id, { ...prev[s._id], status }])
            )
        );
    };

    const counts = STATUSES.reduce((acc, status) => {
        acc[status] = students.filter((s) => entries[s._id]?.status === status).length;
        return acc;
    }, {});

    const unmarked = students.length - counts.Present - counts.Absent - counts.Late;

    const handleSave = async () => {
        setMessage(null);

        const records = students
            .filter((s) => entries[s._id]?.status)
            .map((s) => ({
                studentId: s._id,
                status: entries[s._id].status,
                remarks: entries[s._id].remarks,
            }));

        try {
            const result = await saveSheet({ classId, date, records }).unwrap();
            setMessage({ type: "success", text: result.message });
        } catch (error) {
            setMessage({
                type: "danger",
                text: errorMessage(error, "Unable to save attendance."),
            });
        }
    };

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
                You are not assigned to any class, so there is no
                attendance to mark.
            </div>
        );
    }

    return (
        <>
            {/* Class / date */}
            <div className="row g-2 mb-3">
                <div className="col-md-5">
                    <label className="form-label">Class</label>
                    <select
                        className="form-select"
                        value={classId}
                        onChange={(e) => {
                            setClassId(e.target.value);
                            setMessage(null);
                        }}
                    >
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name} - {c.section} ({c.academicYear}) · {c.students} students
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        max={todayString()}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setMessage(null);
                        }}
                    />
                </div>

                <div className="col-md-4 d-flex align-items-end gap-2">
                    {STATUSES.map((status) => (
                        <button
                            key={status}
                            type="button"
                            className={`btn btn-sm btn-outline-${STATUS_BUTTON[status]}`}
                            onClick={() => markAll(status)}
                            disabled={!students.length}
                        >
                            All {status}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {sheetError ? (
                <div className="alert alert-danger">
                    {errorMessage(sheetErrorData, "Unable to load students.")}
                </div>
            ) : sheetLoading && !sheet ? (
                <div className="text-center py-4">
                    <span className="spinner-border text-primary" />
                </div>
            ) : (
                <>
                    {/* Status of the sheet */}
                    <div className="d-flex flex-wrap gap-3 mb-2 small">
                        {sheet?.isMarked ? (
                            <span className="text-success">
                                <i className="mdi mdi-check-circle me-1"></i>
                                Already marked for this day — saving will update it.
                            </span>
                        ) : (
                            <span className="text-muted">
                                <i className="mdi mdi-information-outline me-1"></i>
                                Not marked yet for this day.
                            </span>
                        )}
                        <span className="text-success">Present: {counts.Present}</span>
                        <span className="text-danger">Absent: {counts.Absent}</span>
                        <span className="text-warning">Late: {counts.Late}</span>
                        <span className="text-muted">Unmarked: {unmarked}</span>
                    </div>

                    <div className={`table-responsive ${sheetLoading ? "opacity-50" : ""}`}>
                        <table className="table table-centered table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Roll</th>
                                    <th>Student</th>
                                    <th>Admission No.</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">
                                            No students enrolled in this class.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((s) => {
                                        const entry = entries[s._id] || {};

                                        return (
                                            <tr key={s._id}>
                                                <td>{s.rollNumber || "—"}</td>
                                                <td>
                                                    <strong>{s.name}</strong>
                                                </td>
                                                <td>{s.admissionNumber}</td>
                                                <td>
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        {STATUSES.map((status) => (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                className={`btn ${
                                                                    entry.status === status
                                                                        ? `btn-${STATUS_BUTTON[status]}`
                                                                        : `btn-outline-${STATUS_BUTTON[status]}`
                                                                }`}
                                                                onClick={() =>
                                                                    setEntry(s._id, { status })
                                                                }
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ minWidth: 180 }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Optional"
                                                        value={entry.remarks || ""}
                                                        onChange={(e) =>
                                                            setEntry(s._id, {
                                                                remarks: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                            {unmarked > 0 &&
                                `${unmarked} unmarked student(s) will be skipped.`}
                        </small>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || students.length === unmarked}
                        >
                            {saving && (
                                <span className="spinner-border spinner-border-sm me-1" />
                            )}
                            Save Attendance
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default MarkAttendance;
