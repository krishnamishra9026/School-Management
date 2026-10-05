import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
    useGetTeachersQuery,
    useDeleteTeacherMutation,
} from "../../features/teachers/teachersApi";

const Teachers = () => {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState("");

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useGetTeachersQuery({
        page,
        limit,
        search,
    });

    const [
        deleteTeacher,
        { isLoading: isDeleting },
    ] = useDeleteTeacherMutation();

    const teachers =
        data?.teachers ||
        data?.data ||
        [];

    const pagination =
        data?.pagination || {};

    const total =
        pagination.total ??
        teachers.length;

    const currentPage =
        pagination.page ?? page;

    const currentLimit =
        pagination.limit ?? limit;

    const totalPages =
        pagination.totalPages ??
        Math.max(
            1,
            Math.ceil(
                total / currentLimit
            )
        );

    const handleSearch = (e) => {
        e.preventDefault();

        setPage(1);
        setSearch(
            searchInput.trim()
        );
    };

    const handleClear = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handleLimitChange = (e) => {
        setLimit(
            Number(e.target.value)
        );

        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteTeacher(
                deleteId
            ).unwrap();

            setDeleteId(null);
            setDeleteName("");
        } catch (error) {
            alert(
                error?.data?.message ||
                    "Unable to delete teacher."
            );
        }
    };

    const getSerialNumber = (index) =>
        (currentPage - 1) *
            currentLimit +
        index +
        1;

    return (
        <>
            {/* Page Title */}
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            Teachers
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Teachers
                </h4>
            </div>

            {/* Statistics */}
            <div className="row">

                <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">

                                <div className="avatar-sm">
                                    <span className="avatar-title bg-primary-subtle text-primary rounded">
                                        <i className="mdi mdi-account-tie font-24"></i>
                                    </span>
                                </div>

                                <div className="ms-3">
                                    <h4 className="my-1">
                                        {total}
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Total Teachers
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">

                                <div className="avatar-sm">
                                    <span className="avatar-title bg-success-subtle text-success rounded">
                                        <i className="mdi mdi-account-check font-24"></i>
                                    </span>
                                </div>

                                <div className="ms-3">
                                    <h4 className="my-1">
                                        -
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Active Teachers
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">

                                <div className="avatar-sm">
                                    <span className="avatar-title bg-info-subtle text-info rounded">
                                        <i className="mdi mdi-human-male font-24"></i>
                                    </span>
                                </div>

                                <div className="ms-3">
                                    <h4 className="my-1">
                                        -
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Male Teachers
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">

                                <div className="avatar-sm">
                                    <span className="avatar-title bg-warning-subtle text-warning rounded">
                                        <i className="mdi mdi-human-female font-24"></i>
                                    </span>
                                </div>

                                <div className="ms-3">
                                    <h4 className="my-1">
                                        -
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Female Teachers
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Teacher List */}
            <div className="card">

                <div className="card-header">
                    <div className="row align-items-center">

                        <div className="col-md-6">
                            <h4 className="header-title mb-0">
                                Teacher List
                            </h4>

                            <p className="text-muted mb-0 mt-1">
                                Manage all teachers
                            </p>
                        </div>

                        <div className="col-md-6 text-md-end mt-2 mt-md-0">
                            <Link
                                to="/teachers/create"
                                className="btn btn-primary"
                            >
                                <i className="mdi mdi-plus me-1"></i>
                                Add Teacher
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Search */}
                <div className="card-body border-bottom">

                    <form
                        onSubmit={handleSearch}
                    >
                        <div className="row g-2 align-items-center">

                            <div className="col-md-6 col-lg-5">
                                <div className="input-group">

                                    <span className="input-group-text">
                                        <i className="mdi mdi-magnify"></i>
                                    </span>

                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search teacher..."
                                        value={
                                            searchInput
                                        }
                                        onChange={(e) =>
                                            setSearchInput(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Search
                                    </button>

                                </div>
                            </div>

                            {search && (
                                <div className="col-auto">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={
                                            handleClear
                                        }
                                    >
                                        <i className="mdi mdi-close me-1"></i>
                                        Clear
                                    </button>
                                </div>
                            )}

                            <div className="col-md-auto ms-md-auto">
                                <div className="d-flex align-items-center">

                                    <span className="text-muted me-2">
                                        Show
                                    </span>

                                    <select
                                        className="form-select"
                                        style={{
                                            width: "80px",
                                        }}
                                        value={limit}
                                        onChange={
                                            handleLimitChange
                                        }
                                    >
                                        <option value="10">
                                            10
                                        </option>

                                        <option value="25">
                                            25
                                        </option>

                                        <option value="50">
                                            50
                                        </option>

                                        <option value="100">
                                            100
                                        </option>
                                    </select>

                                    <span className="text-muted ms-2">
                                        entries
                                    </span>

                                </div>
                            </div>

                        </div>
                    </form>

                </div>

                <div className="card-body">

                    {isError && (
                        <div className="alert alert-danger">
                            <i className="mdi mdi-alert-circle-outline me-1"></i>

                            {error?.data?.message ||
                                "Unable to load teachers."}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            />

                            <h5 className="mt-3">
                                Loading Teachers...
                            </h5>

                        </div>
                    ) : (
                        <>
                            {isFetching &&
                                !isLoading && (
                                    <div className="text-center mb-2">
                                        <small className="text-muted">
                                            Updating teacher list...
                                        </small>
                                    </div>
                                )}

                            <div className="table-responsive">

                                <table className="table table-centered table-nowrap table-hover mb-0">

                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Teacher</th>
                                            <th>Employee ID</th>
                                            <th>Department</th>
                                            <th>Designation</th>
                                            <th>Qualification</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th className="text-end">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {teachers.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="text-center py-5"
                                                >
                                                    <i
                                                        className="mdi mdi-account-tie-outline text-muted"
                                                        style={{
                                                            fontSize:
                                                                "60px",
                                                        }}
                                                    />

                                                    <h5 className="mt-3">
                                                        No Teachers Found
                                                    </h5>

                                                    <p className="text-muted">
                                                        {search
                                                            ? "No teachers match your search."
                                                            : "No teachers have been added yet."}
                                                    </p>

                                                    {!search && (
                                                        <Link
                                                            to="/teachers/create"
                                                            className="btn btn-primary"
                                                        >
                                                            <i className="mdi mdi-plus me-1"></i>
                                                            Add First Teacher
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            teachers.map(
                                                (
                                                    teacher,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            teacher._id
                                                        }
                                                    >
                                                        <td>
                                                            {getSerialNumber(
                                                                index
                                                            )}
                                                        </td>

                                                        <td>
                                                            <div className="d-flex align-items-center">

                                                                <div className="avatar-sm me-2">
                                                                    <span className="avatar-title bg-primary-subtle text-primary rounded-circle">
                                                                        {teacher.firstName
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase() ||
                                                                            "T"}
                                                                    </span>
                                                                </div>

                                                                <div>
                                                                    <h5 className="font-14 mb-0">
                                                                        <Link
                                                                            to={`/teachers/${teacher._id}`}
                                                                            className="text-body"
                                                                        >
                                                                            {
                                                                                teacher.firstName
                                                                            }{" "}
                                                                            {
                                                                                teacher.lastName
                                                                            }
                                                                        </Link>
                                                                    </h5>

                                                                    <small className="text-muted">
                                                                        {
                                                                            teacher.email
                                                                        }
                                                                    </small>
                                                                </div>

                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="badge bg-light text-dark">
                                                                {
                                                                    teacher.employeeId
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {teacher.department ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {teacher.designation ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {teacher.qualification ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {teacher.phone ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`badge ${
                                                                    teacher.status ===
                                                                    "active"
                                                                        ? "bg-success-subtle text-success"
                                                                        : "bg-danger-subtle text-danger"
                                                                }`}
                                                            >
                                                                <i className="mdi mdi-circle font-8 me-1"></i>

                                                                {teacher.status ||
                                                                    "active"}
                                                            </span>
                                                        </td>

                                                        <td className="text-end">
                                                            <div className="btn-group">

                                                                <Link
                                                                    to={`/teachers/${teacher._id}`}
                                                                    className="btn btn-sm btn-light"
                                                                    title="View"
                                                                >
                                                                    <i className="mdi mdi-eye"></i>
                                                                </Link>

                                                                <Link
                                                                    to={`/teachers/${teacher._id}/edit`}
                                                                    className="btn btn-sm btn-light"
                                                                    title="Edit"
                                                                >
                                                                    <i className="mdi mdi-pencil"></i>
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-light text-danger"
                                                                    title="Delete"
                                                                    onClick={() => {
                                                                        setDeleteId(
                                                                            teacher._id
                                                                        );

                                                                        setDeleteName(
                                                                            `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
                                                                        );
                                                                    }}
                                                                >
                                                                    <i className="mdi mdi-delete"></i>
                                                                </button>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {teachers.length >
                                0 && (
                                <div className="row align-items-center mt-3">

                                    <div className="col-md-6">
                                        <p className="text-muted mb-0">
                                            Showing{" "}
                                            <strong>
                                                {(currentPage -
                                                    1) *
                                                    currentLimit +
                                                    1}
                                            </strong>{" "}
                                            to{" "}
                                            <strong>
                                                {Math.min(
                                                    currentPage *
                                                        currentLimit,
                                                    total
                                                )}
                                            </strong>{" "}
                                            of{" "}
                                            <strong>
                                                {total}
                                            </strong>{" "}
                                            teachers
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <nav>
                                            <ul className="pagination pagination-sm justify-content-end mb-0">

                                                <li
                                                    className={`page-item ${
                                                        currentPage ===
                                                        1
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setPage(
                                                                currentPage -
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        <i className="mdi mdi-chevron-left"></i>
                                                    </button>
                                                </li>

                                                {Array.from(
                                                    {
                                                        length: totalPages,
                                                    },
                                                    (_, i) =>
                                                        i + 1
                                                ).map(
                                                    (
                                                        pageNumber
                                                    ) => (
                                                        <li
                                                            key={
                                                                pageNumber
                                                            }
                                                            className={`page-item ${
                                                                currentPage ===
                                                                pageNumber
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    setPage(
                                                                        pageNumber
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    pageNumber
                                                                }
                                                            </button>
                                                        </li>
                                                    )
                                                )}

                                                <li
                                                    className={`page-item ${
                                                        currentPage >=
                                                        totalPages
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setPage(
                                                                currentPage +
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        <i className="mdi mdi-chevron-right"></i>
                                                    </button>
                                                </li>

                                            </ul>
                                        </nav>
                                    </div>

                                </div>
                            )}

                        </>
                    )}

                </div>
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <>
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Delete Teacher
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        disabled={
                                            isDeleting
                                        }
                                        onClick={() =>
                                            setDeleteId(
                                                null
                                            )
                                        }
                                    />
                                </div>

                                <div className="modal-body text-center">

                                    <i className="mdi mdi-delete-outline text-danger font-36"></i>

                                    <h4 className="mt-3">
                                        Are you sure?
                                    </h4>

                                    <p className="text-muted">
                                        You are about to delete{" "}
                                        <strong>
                                            {deleteName}
                                        </strong>
                                        .
                                    </p>

                                </div>

                                <div className="modal-footer justify-content-center">

                                    <button
                                        className="btn btn-light"
                                        disabled={
                                            isDeleting
                                        }
                                        onClick={() =>
                                            setDeleteId(
                                                null
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        disabled={
                                            isDeleting
                                        }
                                        onClick={
                                            handleDelete
                                        }
                                    >
                                        {isDeleting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="mdi mdi-delete me-1"></i>
                                                Delete Teacher
                                            </>
                                        )}
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
};

export default Teachers;