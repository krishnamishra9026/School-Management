import React, { useMemo, useState } from "react";

const studentName = (student) =>
    `${student.firstName || ""} ${student.lastName || ""}`.trim();

/**
 * Student list for a teacher's classes (from the /teachers/me/panel
 * response), with a class filter and search.
 */
const TeacherStudentsTable = ({ classes = [], title = "My Students" }) => {
    const [classFilter, setClassFilter] = useState("");
    const [search, setSearch] = useState("");

    // One row per student per class, filtered by class and search
    const studentRows = useMemo(() => {
        const term = search.trim().toLowerCase();

        return classes
            .filter((c) => !classFilter || c._id === classFilter)
            .flatMap((c) =>
                c.students.map((s) => ({ ...s, schoolClass: c }))
            )
            .filter(
                (s) =>
                    !term ||
                    studentName(s).toLowerCase().includes(term) ||
                    (s.admissionNumber || "")
                        .toLowerCase()
                        .includes(term) ||
                    (s.rollNumber || "").toLowerCase().includes(term)
            );
    }, [classes, classFilter, search]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="row g-2 align-items-center">
                    <div className="col-md-4">
                        <h5 className="mb-0">{title}</h5>
                    </div>

                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name} ({c.section})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search name, admission or roll no."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-centered table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Admission No.</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Roll No.</th>
                                <th>Gender</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="text-center text-muted"
                                    >
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                studentRows.map((s, index) => (
                                    <tr key={`${s.schoolClass._id}-${s._id}`}>
                                        <td>{index + 1}</td>
                                        <td>{s.admissionNumber}</td>
                                        <td>{studentName(s)}</td>
                                        <td>
                                            {s.schoolClass.name} (
                                            {s.schoolClass.section})
                                        </td>
                                        <td>{s.rollNumber || "—"}</td>
                                        <td className="text-capitalize">
                                            {s.gender || "—"}
                                        </td>
                                        <td>{s.phone || "—"}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    s.status === "inactive"
                                                        ? "bg-secondary"
                                                        : "bg-success"
                                                }`}
                                            >
                                                {s.status || "active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherStudentsTable;
