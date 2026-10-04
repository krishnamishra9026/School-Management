import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetStudentsQuery,
  useDeleteStudentMutation,
} from "../../features/students/studentsApi";

const Students = () => {
  /* --------------------------------
       State
    -------------------------------- */

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [deleteStudentName, setDeleteStudentName] = useState("");

  /* --------------------------------
       Get Students
    -------------------------------- */

  const { data, isLoading, isFetching, isError, error } = useGetStudentsQuery({
    page,
    limit,
    search,
  });

  /* --------------------------------
       Delete Student
    -------------------------------- */

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  /* --------------------------------
       API Response
    -------------------------------- */

  const students = data?.students || data?.data || [];

  const pagination = data?.pagination || {};

  const total = pagination.total ?? students.length;

  const currentPage = pagination.page ?? page;

  const currentLimit = pagination.limit ?? limit;

  const totalPages =
    pagination.totalPages ?? Math.max(1, Math.ceil(total / currentLimit));

  /* --------------------------------
       Search
    -------------------------------- */

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  /* --------------------------------
       Page Size
    -------------------------------- */

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));

    setPage(1);
  };

  /* --------------------------------
       Pagination
    -------------------------------- */

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Reset page if search changes
   */
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* --------------------------------
       Delete
    -------------------------------- */

  const openDeleteConfirmation = (student) => {
    setDeleteStudentId(student._id);

    setDeleteStudentName(
      `${student.firstName || ""} ${student.lastName || ""}`.trim()
    );
  };

  const closeDeleteConfirmation = () => {
    if (isDeleting) {
      return;
    }

    setDeleteStudentId(null);
    setDeleteStudentName("");
  };

  const handleDelete = async () => {
    if (!deleteStudentId) {
      return;
    }

    try {
      await deleteStudent(deleteStudentId).unwrap();

      closeDeleteConfirmation();
    } catch (err) {
      console.error("Delete student error:", err);

      alert(err?.data?.message || "Unable to delete student.");
    }
  };

  /* --------------------------------
       Pagination Numbers
    -------------------------------- */

  const getPaginationPages = () => {
    const pages = [];

    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    let start = currentPage - 1;

    let end = currentPage + 1;

    if (currentPage <= 3) {
      start = 2;
      end = 4;
    }

    if (currentPage >= totalPages - 2) {
      start = totalPages - 3;

      end = totalPages - 1;
    }

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  /* --------------------------------
       Serial Number
    -------------------------------- */

  const getSerialNumber = (index) => {
    return (currentPage - 1) * currentLimit + index + 1;
  };

  /* --------------------------------
       Render
    -------------------------------- */

  return (
    <>
      {/* ============================
                Page Title
            ============================ */}

      <div className="page-title-box">
        <div className="page-title-right">
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </li>

            <li className="breadcrumb-item active">Students</li>
          </ol>
        </div>

        <h4 className="page-title">Students</h4>
      </div>

      {/* ============================
                Statistics
            ============================ */}

      <div className="row">
        {/* Total Students */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary-subtle text-primary rounded">
                      <i className="mdi mdi-account-group font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">{total}</h4>

                  <p className="text-muted mb-0">Total Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-success-subtle text-success rounded">
                      <i className="mdi mdi-account-check font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">{total}</h4>

                  <p className="text-muted mb-0">Active Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Male */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-info-subtle text-info rounded">
                      <i className="mdi mdi-human-male font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">-</h4>

                  <p className="text-muted mb-0">Male Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Female */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-warning-subtle text-warning rounded">
                      <i className="mdi mdi-human-female font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">-</h4>

                  <p className="text-muted mb-0">Female Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
                Students Table Card
            ============================ */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            {/* Card Header */}
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="header-title mb-0">Student List</h4>

                  <p className="text-muted mb-0 mt-1">Manage all students</p>
                </div>

                <div className="col-md-6">
                  <div className="text-md-end mt-2 mt-md-0">
                    <Link to="/students/create" className="btn btn-primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Add Student
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================
                            Search / Filters
                        ============================ */}

            <div className="card-body border-bottom">
              <form onSubmit={handleSearch}>
                <div className="row g-2 align-items-center">
                  {/* Search */}
                  <div className="col-md-6 col-lg-5">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="mdi mdi-magnify"></i>
                      </span>

                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search student..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />

                      <button type="submit" className="btn btn-primary">
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Clear */}
                  {search && (
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleClearSearch}
                      >
                        <i className="mdi mdi-close me-1"></i>
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Page Size */}
                  <div className="col-md-auto ms-md-auto">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-2">Show</span>

                      <select
                        className="form-select"
                        style={{
                          width: "80px",
                        }}
                        value={limit}
                        onChange={handleLimitChange}
                      >
                        <option value="10">10</option>

                        <option value="25">25</option>

                        <option value="50">50</option>

                        <option value="100">100</option>
                      </select>

                      <span className="text-muted ms-2">entries</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* ============================
                            Table
                        ============================ */}

            <div className="card-body">
              {/* Error */}
              {isError && (
                <div className="alert alert-danger">
                  <i className="mdi mdi-alert-circle-outline me-1"></i>

                  {error?.data?.message || "Unable to load students."}
                </div>
              )}

              {/* Loading */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />

                  <h5 className="mt-3">Loading Students...</h5>

                  <p className="text-muted">Please wait.</p>
                </div>
              ) : (
                <>
                  {/* Fetching indicator */}
                  {isFetching && !isLoading && (
                    <div className="text-center mb-2">
                      <small className="text-muted">
                        Updating student list...
                      </small>
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-centered table-nowrap table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th
                            style={{
                              width: "60px",
                            }}
                          >
                            #
                          </th>

                          <th>Student</th>

                          <th>Admission No.</th>

                          <th>Class</th>

                          <th>Section</th>

                          <th>Roll No.</th>

                          <th>Gender</th>

                          <th>Phone</th>

                          <th>Status</th>

                          <th className="text-end">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Empty */}
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center py-5">
                              <div className="text-muted">
                                <i
                                  className="mdi mdi-account-school-outline"
                                  style={{
                                    fontSize: "60px",
                                  }}
                                ></i>

                                <h5 className="mt-3">No Students Found</h5>

                                <p className="mb-3">
                                  {search
                                    ? "No students match your search."
                                    : "No students have been added yet."}
                                </p>

                                {!search && (
                                  <Link
                                    to="/students/create"
                                    className="btn btn-primary"
                                  >
                                    <i className="mdi mdi-plus me-1"></i>
                                    Add First Student
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          students.map((student, index) => (
                            <tr key={student._id}>
                              {/* # */}
                              <td>
                                <span className="text-muted">
                                  {getSerialNumber(index)}
                                </span>
                              </td>

                              {/* Student */}
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm me-2">
                                    <span className="avatar-title bg-primary-subtle text-primary rounded-circle">
                                      {student.firstName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "S"}
                                    </span>
                                  </div>

                                  <div>
                                    <h5 className="font-14 mb-0">
                                      <Link
                                        to={`/students/${student._id}`}
                                        className="text-body"
                                      >
                                        {student.firstName} {student.lastName}
                                      </Link>
                                    </h5>

                                    {student.email && (
                                      <small className="text-muted">
                                        {student.email}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Admission */}
                              <td>
                                <span className="badge bg-light text-dark">
                                  {student.admissionNumber || "-"}
                                </span>
                              </td>

                              {/* Class */}
                              <td>{student.className || "-"}</td>

                              {/* Section */}
                              <td>{student.section || "-"}</td>

                              {/* Roll */}
                              <td>{student.rollNumber || "-"}</td>

                              {/* Gender */}
                              <td>
                                {student.gender ? (
                                  <span className="text-capitalize">
                                    {student.gender}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>

                              {/* Phone */}
                              <td>{student.phone || "-"}</td>

                              {/* Status */}
                              <td>
                                <span className="badge bg-success-subtle text-success">
                                  <i className="mdi mdi-circle font-8 me-1"></i>
                                  Active
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="text-end">
                                <div className="btn-group">
                                  {/* View */}
                                  <Link
                                    to={`/students/${student._id}`}
                                    className="btn btn-sm btn-light"
                                    title="View Student"
                                  >
                                    <i className="mdi mdi-eye"></i>
                                  </Link>

                                  {/* Edit */}
                                  <Link
                                    to={`/students/${student._id}/edit`}
                                    className="btn btn-sm btn-light"
                                    title="Edit Student"
                                  >
                                    <i className="mdi mdi-pencil"></i>
                                  </Link>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light text-danger"
                                    title="Delete Student"
                                    onClick={() =>
                                      openDeleteConfirmation(student)
                                    }
                                  >
                                    <i className="mdi mdi-delete"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ============================
                                        Pagination Footer
                                    ============================ */}

                  {students.length > 0 && (
                    <div className="row align-items-center mt-3">
                      {/* Showing */}
                      <div className="col-md-6">
                        <p className="text-muted mb-0">
                          Showing{" "}
                          <strong>
                            {(currentPage - 1) * currentLimit + 1}
                          </strong>{" "}
                          to{" "}
                          <strong>
                            {Math.min(currentPage * currentLimit, total)}
                          </strong>{" "}
                          of <strong>{total}</strong> students
                        </p>
                      </div>

                      {/* Pagination */}
                      <div className="col-md-6">
                        <nav>
                          <ul className="pagination pagination-sm justify-content-end mb-0">
                            {/* Previous */}
                            <li
                              className={`page-item ${
                                currentPage === 1 ? "disabled" : ""
                              }`}
                            >
                              <button
                                type="button"
                                className="page-link"
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                              >
                                <i className="mdi mdi-chevron-left"></i>
                              </button>
                            </li>

                            {/* Page Numbers */}
                            {getPaginationPages().map((item, index) => {
                              if (item === "...") {
                                return (
                                  <li
                                    key={`dots-${index}`}
                                    className="page-item disabled"
                                  >
                                    <span className="page-link">...</span>
                                  </li>
                                );
                              }

                              return (
                                <li
                                  key={item}
                                  className={`page-item ${
                                    currentPage === item ? "active" : ""
                                  }`}
                                >
                                  <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => handlePageChange(item)}
                                  >
                                    {item}
                                  </button>
                                </li>
                              );
                            })}

                            {/* Next */}
                            <li
                              className={`page-item ${
                                currentPage >= totalPages ? "disabled" : ""
                              }`}
                            >
                              <button
                                type="button"
                                className="page-link"
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
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
        </div>
      </div>

      {/* ============================
                Delete Confirmation Modal
            ============================ */}

      {deleteStudentId && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Delete Student</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDeleteConfirmation}
                    disabled={isDeleting}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body text-center">
                  <div className="avatar-lg mx-auto mb-3">
                    <span className="avatar-title bg-danger-subtle text-danger rounded-circle">
                      <i className="mdi mdi-delete-outline font-24"></i>
                    </span>
                  </div>

                  <h4>Are you sure?</h4>

                  <p className="text-muted mb-0">
                    You are about to delete
                    {deleteStudentName && (
                      <>
                        {" "}
                        <strong>{deleteStudentName}</strong>
                      </>
                    )}
                    . This action cannot be undone.
                  </p>
                </div>

                {/* Footer */}
                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeDeleteConfirmation}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-delete me-1"></i>
                        Delete Student
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

export default Students;
