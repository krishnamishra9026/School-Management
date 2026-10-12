import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from "../../features/classes/classesApi";
import Pagination from "../../components/Pagination";

const initialForm = {
  name: "",
  grade: "",
  section: "",
  academicYear: "2026-2027",
  room: "",
  capacity: 40,
  status: "active",
};

const Classes = () => {
  /* --------------------------------
       State
    -------------------------------- */

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const [deleteClassId, setDeleteClassId] = useState(null);
  const [deleteClassName, setDeleteClassName] = useState("");

  /* --------------------------------
       Get Classes
    -------------------------------- */

  const { data, isLoading, isFetching, isError, error } = useGetClassesQuery({
    page,
    limit,
    search,
    status,
  });

  /*
   * Lightweight queries for the statistic cards
   */
  const { data: activeData } = useGetClassesQuery({
    status: "active",
    limit: 1,
  });

  const { data: inactiveData } = useGetClassesQuery({
    status: "inactive",
    limit: 1,
  });

  const { data: allData } = useGetClassesQuery({ limit: 1 });

  /* --------------------------------
       Mutations
    -------------------------------- */

  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();

  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const isSaving = isCreating || isUpdating;

  /* --------------------------------
       API Response
    -------------------------------- */

  const classes = data?.classes || [];

  const pagination = data?.pagination || {};

  const total = pagination.total ?? classes.length;

  const currentPage = pagination.page ?? page;

  const currentLimit = pagination.limit ?? limit;

  const totalPages =
    pagination.totalPages ?? Math.max(1, Math.ceil(total / currentLimit));

  const totalClasses = allData?.pagination?.total ?? "-";
  const activeClasses = activeData?.pagination?.total ?? "-";
  const inactiveClasses = inactiveData?.pagination?.total ?? "-";

  /* --------------------------------
       Search / Filters
    -------------------------------- */

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

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

  const getSerialNumber = (index) => {
    return (currentPage - 1) * currentLimit + index + 1;
  };

  /* --------------------------------
       Create / Edit Form
    -------------------------------- */

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      grade: item.grade || "",
      section: item.section || "",
      academicYear: item.academicYear || "",
      room: item.room || "",
      capacity: item.capacity ?? 40,
      status: item.status || "active",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const payload = {
      ...form,
      capacity: Number(form.capacity),
    };

    try {
      if (editingId) {
        await updateClass({ id: editingId, ...payload }).unwrap();
      } else {
        await createClass(payload).unwrap();
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
    } catch (err) {
      setFormError(err?.data?.message || "Unable to save class.");
    }
  };

  /* --------------------------------
       Delete
    -------------------------------- */

  const openDeleteConfirmation = (item) => {
    setDeleteClassId(item._id);
    setDeleteClassName(item.name || "");
  };

  const closeDeleteConfirmation = () => {
    if (isDeleting) {
      return;
    }

    setDeleteClassId(null);
    setDeleteClassName("");
  };

  const handleDelete = async () => {
    if (!deleteClassId) {
      return;
    }

    try {
      await deleteClass(deleteClassId).unwrap();

      closeDeleteConfirmation();
    } catch (err) {
      console.error("Delete class error:", err);

      alert(err?.data?.message || "Unable to delete class.");
    }
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

            <li className="breadcrumb-item active">Classes</li>
          </ol>
        </div>

        <h4 className="page-title">Classes</h4>
      </div>

      {/* ============================
                Statistics
            ============================ */}

      <div className="row">
        {/* Total Classes */}
        <div className="col-md-6 col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary-subtle text-primary rounded">
                      <i className="mdi mdi-google-classroom font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">{totalClasses}</h4>

                  <p className="text-muted mb-0">Total Classes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Classes */}
        <div className="col-md-6 col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-success-subtle text-success rounded">
                      <i className="mdi mdi-check-circle-outline font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">{activeClasses}</h4>

                  <p className="text-muted mb-0">Active Classes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inactive Classes */}
        <div className="col-md-6 col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-warning-subtle text-warning rounded">
                      <i className="mdi mdi-pause-circle-outline font-24"></i>
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1 ms-3">
                  <h4 className="my-1">{inactiveClasses}</h4>

                  <p className="text-muted mb-0">Inactive Classes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
                Classes Table Card
            ============================ */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            {/* Card Header */}
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="header-title mb-0">Class List</h4>

                  <p className="text-muted mb-0 mt-1">
                    Manage classes, students and teachers
                  </p>
                </div>

                <div className="col-md-6">
                  <div className="text-md-end mt-2 mt-md-0">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={openCreateForm}
                    >
                      <i className="mdi mdi-plus me-1"></i>
                      Add Class
                    </button>
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
                        placeholder="Search class, grade, section..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />

                      <button type="submit" className="btn btn-primary">
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-md-3 col-lg-2">
                    <select
                      className="form-select"
                      value={status}
                      onChange={handleStatusChange}
                    >
                      <option value="">All Statuses</option>

                      <option value="active">Active</option>

                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Clear */}
                  {(search || status) && (
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

                  {error?.data?.message || "Unable to load classes."}
                </div>
              )}

              {/* Loading */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />

                  <h5 className="mt-3">Loading Classes...</h5>

                  <p className="text-muted">Please wait.</p>
                </div>
              ) : (
                <>
                  {/* Fetching indicator */}
                  {isFetching && !isLoading && (
                    <div className="text-center mb-2">
                      <small className="text-muted">
                        Updating class list...
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

                          <th>Class</th>

                          <th>Academic Year</th>

                          <th>Room</th>

                          <th>Students</th>

                          <th>Class Teacher</th>

                          <th>Status</th>

                          <th className="text-end">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Empty */}
                        {classes.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-5">
                              <div className="text-muted">
                                <i
                                  className="mdi mdi-google-classroom"
                                  style={{
                                    fontSize: "60px",
                                  }}
                                ></i>

                                <h5 className="mt-3">No Classes Found</h5>

                                <p className="mb-3">
                                  {search || status
                                    ? "No classes match your filters."
                                    : "No classes have been added yet."}
                                </p>

                                {!search && !status && (
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={openCreateForm}
                                  >
                                    <i className="mdi mdi-plus me-1"></i>
                                    Add First Class
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          classes.map((item, index) => {
                            const studentCount = item.students?.length || 0;

                            const teacherName =
                              item.classTeacher?.name ||
                              item.classTeacher?.userId?.name ||
                              [
                                item.classTeacher?.firstName,
                                item.classTeacher?.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                              <tr key={item._id}>
                                {/* # */}
                                <td>
                                  <span className="text-muted">
                                    {getSerialNumber(index)}
                                  </span>
                                </td>

                                {/* Class */}
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm me-2">
                                      <span className="avatar-title bg-primary-subtle text-primary rounded-circle">
                                        {item.grade || "C"}
                                      </span>
                                    </div>

                                    <div>
                                      <h5 className="font-14 mb-0">
                                        <Link
                                          to={`/classes/${item._id}`}
                                          className="text-body"
                                        >
                                          {item.name}
                                        </Link>
                                      </h5>

                                      <small className="text-muted">
                                        Grade {item.grade} - Section{" "}
                                        {item.section}
                                      </small>
                                    </div>
                                  </div>
                                </td>

                                {/* Academic Year */}
                                <td>{item.academicYear || "-"}</td>

                                {/* Room */}
                                <td>
                                  <span className="badge bg-light text-dark">
                                    {item.room || "-"}
                                  </span>
                                </td>

                                {/* Students */}
                                <td>
                                  {studentCount} / {item.capacity ?? "-"}
                                </td>

                                {/* Class Teacher */}
                                <td>
                                  {teacherName || (
                                    <span className="text-muted fst-italic">
                                      Not assigned
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td>
                                  {item.status === "active" ? (
                                    <span className="badge bg-success-subtle text-success">
                                      <i className="mdi mdi-circle font-8 me-1"></i>
                                      Active
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary-subtle text-secondary">
                                      <i className="mdi mdi-circle font-8 me-1"></i>
                                      Inactive
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="text-end">
                                  <div className="d-flex justify-content-end gap-1">
                                    {/* View / Assign */}
                                    <Link
                                      to={`/classes/${item._id}`}
                                      className="btn btn-sm btn-light"
                                      title="View / Assign"
                                    >
                                      <i className="mdi mdi-eye"></i>
                                    </Link>

                                    {/* Edit */}
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light"
                                      title="Edit Class"
                                      onClick={() => openEditForm(item)}
                                    >
                                      <i className="mdi mdi-pencil"></i>
                                    </button>

                                    {/* Delete */}
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light text-danger"
                                      title="Delete Class"
                                      onClick={() =>
                                        openDeleteConfirmation(item)
                                      }
                                    >
                                      <i className="mdi mdi-delete"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <Pagination page={currentPage} totalPages={totalPages} total={total} limit={currentLimit} label="classes" onChange={handlePageChange} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================
                Create / Edit Class Modal
            ============================ */}

      {showForm && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId ? "Edit Class" : "Add Class"}
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeForm}
                      disabled={isSaving}
                    ></button>
                  </div>

                  {/* Body */}
                  <div className="modal-body">
                    {formError && (
                      <div className="alert alert-danger">
                        <i className="mdi mdi-alert-circle-outline me-1"></i>
                        {formError}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Class Name <span className="text-danger">*</span>
                        </label>
                        <input
                          name="name"
                          className="form-control"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Class 10"
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">
                          Grade <span className="text-danger">*</span>
                        </label>
                        <input
                          name="grade"
                          className="form-control"
                          value={form.grade}
                          onChange={handleChange}
                          placeholder="10"
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">
                          Section <span className="text-danger">*</span>
                        </label>
                        <input
                          name="section"
                          className="form-control"
                          value={form.section}
                          onChange={handleChange}
                          placeholder="A"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Academic Year <span className="text-danger">*</span>
                        </label>
                        <input
                          name="academicYear"
                          className="form-control"
                          value={form.academicYear}
                          onChange={handleChange}
                          placeholder="2026-2027"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Room</label>
                        <input
                          name="room"
                          className="form-control"
                          value={form.room}
                          onChange={handleChange}
                          placeholder="R-101"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Capacity <span className="text-danger">*</span>
                        </label>
                        <input
                          name="capacity"
                          type="number"
                          min="1"
                          className="form-control"
                          value={form.capacity}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={form.status}
                          onChange={handleChange}
                        >
                          <option value="active">Active</option>

                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeForm}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="mdi mdi-content-save me-1"></i>
                          {editingId ? "Update Class" : "Save Class"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* ============================
                Delete Confirmation Modal
            ============================ */}

      {deleteClassId && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Delete Class</h5>

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
                    {deleteClassName && (
                      <>
                        {" "}
                        <strong>{deleteClassName}</strong>
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
                        Delete Class
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

export default Classes;
