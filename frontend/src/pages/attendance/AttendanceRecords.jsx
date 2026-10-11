import React, { useState } from "react";

import { useAbility } from "../../auth/AbilityProvider";
import {
    useGetAttendanceClassesQuery,
    useGetAttendanceRecordsQuery,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation,
} from "../../features/attendance/attendanceApi";
import { AttendanceBadge } from "../dashboard/DashboardWidgets";

import {
    STATUSES,
    daysAgoString,
    todayString,
    formatDay,
    errorMessage,
} from "./attendanceUtils";

/**
 * Filterable, paginated attendance records.
 *
 * - studentId: lock the list to one student (student/parent view)
 * - showClassFilter: staff can filter by class
 */
const AttendanceRecords = ({ studentId = "", showClassFilter = false }) => {
    const ability = useAbility();

    const [filters, setFilters] = useState({
        classId: "",
        status: "",
        from: daysAgoString(29),
        to: todayString(),
    });
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState("");

    const { data: classesData } = useGetAttendanceClassesQuery(undefined, {
        skip: !showClassFilter,
    });

    const { data, isFetching, isError, error } = useGetAttendanceRecordsQuery({
        ...filters,
        studentId,
        page,
        limit: 20,
    });

    const [updateAttendance] = useUpdateAttendanceMutation();
    const [deleteAttendance] = useDeleteAttendanceMutation();

    const canEdit = data?.canEdit && ability?.can("update", "attendance");
    const canDelete = data?.canEdit && ability?.can("delete", "attendance");

    const records = data?.records || [];
    const pagination = data?.pagination;
    const summary = data?.summary;

    const setFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleStatusChange = async (record, status) => {
        setActionError("");

        try {
            await updateAttendance({ id: record._id, status }).unwrap();
        } catch (err) {
            setActionError(errorMessage(err, "Unable to update attendance."));
        }
    };

    const handleDelete = async (record) => {
        if (!window.confirm("Delete this attendance record?")) return;

        setActionError("");

        try {
            await deleteAttendance(record._id).unwrap();
        } catch (err) {
            setActionError(errorMessage(err, "Unable to delete attendance."));
        }
    };

    const columns = 5 + (showClassFilter ? 1 : 0) + (canEdit || canDelete ? 1 : 0);

    return (
        <>
            {/* Filters */}
            <div className="row g-2 mb-3">
                {showClassFilter && (
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={filters.classId}
                            onChange={(e) => setFilter("classId", e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {(classesData?.classes || []).map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name} - {c.section}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={filters.status}
                        onChange={(e) => setFilter("status", e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3 col-6">
                    <div className="input-group">
                        <span className="input-group-text">From</span>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.from}
                            max={filters.to || undefined}
                            onChange={(e) => setFilter("from", e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3 col-6">
                    <div className="input-group">
                        <span className="input-group-text">To</span>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.to}
                            min={filters.from || undefined}
                            max={todayString()}
                            onChange={(e) => setFilter("to", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Totals for the current filter */}
            {summary && (
                <div className="d-flex flex-wrap gap-3 mb-2 small">
                    <span>Total: <strong>{summary.total}</strong></span>
                    <span className="text-success">Present: {summary.Present}</span>
                    <span className="text-danger">Absent: {summary.Absent}</span>
                    <span className="text-warning">Late: {summary.Late}</span>
                    <span>
                        Attendance rate:{" "}
                        <strong>{summary.rate === null ? "—" : `${summary.rate}%`}</strong>
                    </span>
                </div>
            )}

            {actionError && <div className="alert alert-danger">{actionError}</div>}

            {isError ? (
                <div className="alert alert-danger">
                    {errorMessage(error, "Unable to load attendance.")}
                </div>
            ) : (
                <div className={`table-responsive ${isFetching ? "opacity-50" : ""}`}>
                    <table className="table table-centered table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                {showClassFilter && <th>Class</th>}
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Marked By</th>
                                {(canEdit || canDelete) && <th className="text-end">Actions</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={columns} className="text-center text-muted">
                                        {isFetching ? "Loading..." : "No attendance records found."}
                                    </td>
                                </tr>
                            ) : (
                                records.map((r) => (
                                    <tr key={r._id}>
                                        <td className="text-nowrap">{formatDay(r.date)}</td>
                                        <td>
                                            {r.student ? (
                                                <>
                                                    <strong>
                                                        {r.student.firstName} {r.student.lastName}
                                                    </strong>
                                                    <div className="small text-muted">
                                                        {r.student.admissionNumber}
                                                        {r.student.rollNumber && ` · Roll ${r.student.rollNumber}`}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-muted">Deleted student</span>
                                            )}
                                        </td>
                                        {showClassFilter && (
                                            <td>
                                                {r.classId
                                                    ? `${r.classId.name} - ${r.classId.section}`
                                                    : "—"}
                                            </td>
                                        )}
                                        <td>
                                            {canEdit ? (
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 110 }}
                                                    value={r.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(r, e.target.value)
                                                    }
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <AttendanceBadge status={r.status} />
                                            )}
                                        </td>
                                        <td>{r.remarks || <span className="text-muted">—</span>}</td>
                                        <td>{r.markedBy?.name || "—"}</td>
                                        {(canEdit || canDelete) && (
                                            <td className="text-end">
                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light text-danger"
                                                        title="Delete"
                                                        onClick={() => handleDelete(r)}
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                        Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
                    </small>

                    <div className="btn-group">
                        <button
                            type="button"
                            className="btn btn-sm btn-light"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <i className="mdi mdi-chevron-left"></i> Prev
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-light"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next <i className="mdi mdi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AttendanceRecords;
