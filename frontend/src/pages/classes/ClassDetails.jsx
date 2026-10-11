import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    useGetClassByIdQuery,
    useAssignStudentMutation,
    useRemoveStudentMutation,
    useAssignClassTeacherMutation,
    useAssignSubjectTeacherMutation,
} from "../../features/classes/classesApi";

import { useGetStudentsQuery } from "../../features/students/studentsApi";
import { useGetTeachersQuery } from "../../features/teachers/teachersApi";

const SUBJECTS = [
    "English",
    "Hindi",
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Social Studies",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
];

const getDisplayName = (item) => {
    if (!item) return "Unknown";

    return (
        item.userId?.name ||
        item.name ||
        [item.firstName, item.lastName].filter(Boolean).join(" ") ||
        item.admissionNumber ||
        item.employeeId ||
        item._id
    );
};

const getResponseList = (response, key) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    if (Array.isArray(response?.data)) return response.data;

    return [];
};

export default function ClassDetails() {
    const { id } = useParams();

    const {
        data: classResponse,
        isLoading: classLoading,
        isError: classError,
        error: classErrorDetails,
        refetch,
    } = useGetClassByIdQuery(id, {
        skip: !id,
    });

    const {
        data: studentsResponse,
        isLoading: studentsLoading,
    } = useGetStudentsQuery();

    const {
        data: teachersResponse,
        isLoading: teachersLoading,
    } = useGetTeachersQuery();

    const [assignStudent, { isLoading: assigningStudent }] =
        useAssignStudentMutation();

    const [removeStudent, { isLoading: removingStudent }] =
        useRemoveStudentMutation();

    const [assignClassTeacher, { isLoading: assigningClassTeacher }] =
        useAssignClassTeacherMutation();

    const [assignSubjectTeacher, { isLoading: assigningSubjectTeacher }] =
        useAssignSubjectTeacherMutation();

    const [studentId, setStudentId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [subjectTeacherId, setSubjectTeacherId] = useState("");
    const [subject, setSubject] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const schoolClass =
        classResponse?.class ||
        classResponse?.data?.class ||
        classResponse?.data ||
        classResponse;

    const students = getResponseList(studentsResponse, "students");
    const teachers = getResponseList(teachersResponse, "teachers");

    const classStudents = Array.isArray(schoolClass?.students)
        ? schoolClass.students
        : [];

    const subjectTeachers = Array.isArray(schoolClass?.subjectTeachers)
        ? schoolClass.subjectTeachers
        : [];

    const showError = (error, fallback) => {
        setSuccessMessage("");

        setErrorMessage(
            error?.data?.message ||
                error?.data?.error ||
                error?.error ||
                fallback
        );
    };

    const handleAssignStudent = async (event) => {
        event.preventDefault();

        if (!studentId) {
            setErrorMessage("Please select a student.");
            return;
        }

        try {
            const result = await assignStudent({
                id,
                studentId,
            }).unwrap();

            setStudentId("");
            setErrorMessage("");
            setSuccessMessage(
                result?.message || "Student assigned successfully."
            );

            refetch();
        } catch (error) {
            showError(error, "Failed to assign student.");
        }
    };

    const handleRemoveStudent = async (selectedStudentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this student from the class?"
        );

        if (!confirmed) return;

        try {
            const result = await removeStudent({
                id,
                studentId: selectedStudentId,
            }).unwrap();

            setErrorMessage("");
            setSuccessMessage(
                result?.message || "Student removed successfully."
            );

            refetch();
        } catch (error) {
            showError(error, "Failed to remove student.");
        }
    };

    const handleAssignTeacher = async (event) => {
        event.preventDefault();

        if (!teacherId) {
            setErrorMessage("Please select a class teacher.");
            return;
        }

        try {
            const result = await assignClassTeacher({
                id,
                teacherId,
            }).unwrap();

            setTeacherId("");
            setErrorMessage("");
            setSuccessMessage(
                result?.message || "Class teacher assigned successfully."
            );

            refetch();
        } catch (error) {
            showError(error, "Failed to assign class teacher.");
        }
    };

    const handleAssignSubjectTeacher = async (event) => {
        event.preventDefault();

        if (!subjectTeacherId || !subject) {
            setErrorMessage("Please select a teacher and subject.");
            return;
        }

        try {
            const result = await assignSubjectTeacher({
                id,
                teacherId: subjectTeacherId,
                subject,
            }).unwrap();

            setSubjectTeacherId("");
            setSubject("");
            setErrorMessage("");
            setSuccessMessage(
                result?.message || "Subject teacher assigned successfully."
            );

            refetch();
        } catch (error) {
            showError(error, "Failed to assign subject teacher.");
        }
    };

    if (classLoading) {
        return (
            <div className="container-fluid p-4">
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />
                    <p className="mt-2">Loading class details...</p>
                </div>
            </div>
        );
    }

    if (classError || !schoolClass?._id) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    {classErrorDetails?.data?.message ||
                        "Unable to load class details."}
                </div>

                <Link to="/classes" className="btn btn-secondary">
                    Back to Classes
                </Link>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <h4 className="mb-1">
                        {schoolClass.name || "Class Details"}
                    </h4>

                    <p className="text-muted mb-0">
                        Grade: {schoolClass.grade ?? "-"} | Section:{" "}
                        {schoolClass.section || "-"} | Academic Year:{" "}
                        {schoolClass.academicYear || "-"}
                    </p>
                </div>

                <Link to="/classes" className="btn btn-outline-secondary">
                    Back to Classes
                </Link>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div
                    className="alert alert-success alert-dismissible"
                    role="alert"
                >
                    {successMessage}

                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setSuccessMessage("")}
                    />
                </div>
            )}

            {errorMessage && (
                <div
                    className="alert alert-danger alert-dismissible"
                    role="alert"
                >
                    {errorMessage}

                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setErrorMessage("")}
                    />
                </div>
            )}

            {/* Class Information */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Class Information</h5>
                </div>

                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <strong>Class Name</strong>
                            <p className="mb-0">{schoolClass.name || "-"}</p>
                        </div>

                        <div className="col-md-4">
                            <strong>Room</strong>
                            <p className="mb-0">{schoolClass.room || "-"}</p>
                        </div>

                        <div className="col-md-4">
                            <strong>Capacity</strong>
                            <p className="mb-0">
                                {classStudents.length} /{" "}
                                {schoolClass.capacity ?? "-"}
                            </p>
                        </div>

                        <div className="col-md-4">
                            <strong>Status</strong>
                            <p className="mb-0">
                                <span
                                    className={`badge ${
                                        schoolClass.status === "active"
                                            ? "bg-success"
                                            : "bg-secondary"
                                    }`}
                                >
                                    {schoolClass.status || "Unknown"}
                                </span>
                            </p>
                        </div>

                        <div className="col-md-4">
                            <strong>Class Teacher</strong>
                            <p className="mb-0">
                                {getDisplayName(schoolClass.classTeacher)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Student */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Assign Student</h5>
                </div>

                <div className="card-body">
                    <form
                        onSubmit={handleAssignStudent}
                        className="row g-3 align-items-end"
                    >
                        <div className="col-md-9">
                            <label
                                htmlFor="studentId"
                                className="form-label"
                            >
                                Select Student
                            </label>

                            <select
                                id="studentId"
                                className="form-select"
                                value={studentId}
                                onChange={(event) =>
                                    setStudentId(event.target.value)
                                }
                                disabled={studentsLoading || assigningStudent}
                                required
                            >
                                <option value="">
                                    {studentsLoading
                                        ? "Loading students..."
                                        : "Choose a student"}
                                </option>

                                {students
                                    .filter(
                                        (student) =>
                                            !classStudents.some(
                                                (classStudent) =>
                                                    String(
                                                        classStudent?._id ||
                                                            classStudent
                                                    ) === String(student._id)
                                            )
                                    )
                                    .map((student) => (
                                        <option
                                            key={student._id}
                                            value={student._id}
                                        >
                                            {getDisplayName(student)}
                                            {student.admissionNumber
                                                ? ` (${student.admissionNumber})`
                                                : ""}
                                        </option>
                                    ))}
                            </select>

                            {!studentsLoading && students.length === 0 && (
                                <small className="text-muted">
                                    No students found. Check your students API.
                                </small>
                            )}
                        </div>

                        <div className="col-md-3">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={assigningStudent || !studentId}
                            >
                                {assigningStudent
                                    ? "Assigning..."
                                    : "Assign Student"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Assigned Students */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">
                        Assigned Students ({classStudents.length})
                    </h5>
                </div>

                <div className="card-body">
                    {classStudents.length === 0 ? (
                        <p className="text-muted mb-0">
                            No students assigned to this class.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student Name</th>
                                        <th>Admission Number</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {classStudents.map(
                                        (student, index) => (
                                            <tr
                                                key={
                                                    student?._id || student
                                                }
                                            >
                                                <td>{index + 1}</td>

                                                <td>
                                                    {getDisplayName(student)}
                                                </td>

                                                <td>
                                                    {student?.admissionNumber ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        disabled={
                                                            removingStudent
                                                        }
                                                        onClick={() =>
                                                            handleRemoveStudent(
                                                                student?._id ||
                                                                    student
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Class Teacher */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Assign Class Teacher</h5>
                </div>

                <div className="card-body">
                    <form
                        onSubmit={handleAssignTeacher}
                        className="row g-3 align-items-end"
                    >
                        <div className="col-md-9">
                            <label
                                htmlFor="classTeacherId"
                                className="form-label"
                            >
                                Select Teacher
                            </label>

                            <select
                                id="classTeacherId"
                                className="form-select"
                                value={teacherId}
                                onChange={(event) =>
                                    setTeacherId(event.target.value)
                                }
                                disabled={
                                    teachersLoading || assigningClassTeacher
                                }
                                required
                            >
                                <option value="">
                                    {teachersLoading
                                        ? "Loading teachers..."
                                        : "Choose a class teacher"}
                                </option>

                                {teachers.map((teacher) => (
                                    <option
                                        key={teacher._id}
                                        value={teacher._id}
                                    >
                                        {getDisplayName(teacher)}
                                        {teacher.employeeId
                                            ? ` (${teacher.employeeId})`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {!teachersLoading && teachers.length === 0 && (
                                <small className="text-muted">
                                    No teachers found. Check your teachers API.
                                </small>
                            )}
                        </div>

                        <div className="col-md-3">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={
                                    assigningClassTeacher || !teacherId
                                }
                            >
                                {assigningClassTeacher
                                    ? "Assigning..."
                                    : "Assign Teacher"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Assign Subject Teacher */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Assign Subject Teacher</h5>
                </div>

                <div className="card-body">
                    <form
                        onSubmit={handleAssignSubjectTeacher}
                        className="row g-3 align-items-end"
                    >
                        <div className="col-md-5">
                            <label
                                htmlFor="subjectTeacherId"
                                className="form-label"
                            >
                                Select Teacher
                            </label>

                            <select
                                id="subjectTeacherId"
                                className="form-select"
                                value={subjectTeacherId}
                                onChange={(event) =>
                                    setSubjectTeacherId(event.target.value)
                                }
                                disabled={
                                    teachersLoading ||
                                    assigningSubjectTeacher
                                }
                                required
                            >
                                <option value="">
                                    {teachersLoading
                                        ? "Loading teachers..."
                                        : "Choose a teacher"}
                                </option>

                                {teachers.map((teacher) => (
                                    <option
                                        key={teacher._id}
                                        value={teacher._id}
                                    >
                                        {getDisplayName(teacher)}
                                        {teacher.employeeId
                                            ? ` (${teacher.employeeId})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label
                                htmlFor="subject"
                                className="form-label"
                            >
                                Select Subject
                            </label>

                            <select
                                id="subject"
                                className="form-select"
                                value={subject}
                                onChange={(event) =>
                                    setSubject(event.target.value)
                                }
                                disabled={assigningSubjectTeacher}
                                required
                            >
                                <option value="">Choose a subject</option>

                                {SUBJECTS.map((subjectName) => (
                                    <option
                                        key={subjectName}
                                        value={subjectName}
                                    >
                                        {subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={
                                    assigningSubjectTeacher ||
                                    !subjectTeacherId ||
                                    !subject
                                }
                            >
                                {assigningSubjectTeacher
                                    ? "Assigning..."
                                    : "Assign Subject"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Assigned Subject Teachers */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">
                        Subject Teachers ({subjectTeachers.length})
                    </h5>
                </div>

                <div className="card-body">
                    {subjectTeachers.length === 0 ? (
                        <p className="text-muted mb-0">
                            No subject teachers assigned yet.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Subject</th>
                                        <th>Teacher</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {subjectTeachers.map((item, index) => (
                                        <tr key={`${item.subject}-${index}`}>
                                            <td>{index + 1}</td>
                                            <td>{item.subject || "-"}</td>
                                            <td>
                                                {getDisplayName(
                                                    item.teacherId
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
    );
}

