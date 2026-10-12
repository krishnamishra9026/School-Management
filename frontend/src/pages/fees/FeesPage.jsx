import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useAbility } from "../../auth/AbilityProvider";
import { useGetClassesQuery } from "../../features/classes/classesApi";
import {
  useGetFeesQuery,
  useDeleteFeeMutation,
} from "../../features/fees/feesApi";
import Pagination from "../../components/Pagination";

import FeeDetailsModal from "./FeeDetailsModal";
import {
  FEE_TYPES,
  STATUS_FILTERS,
  FeeStatusBadge,
  errorMessage,
  feeTypeLabel,
  formatDate,
  formatMoney,
  studentName,
} from "./feeUtils";

/**
 * Fees for every panel:
 * - admin / accountant: manage fees and record payments
 * - parent / student:   read-only view of their own fees
 *   (the API limits them to their own students)
 */
const FeesPage = () => {
  const ability = useAbility();
  const roleSlug = useSelector((state) => state.auth.user?.roleId?.slug);

  const isPortalUser = roleSlug === "student" || roleSlug === "parent";

  const location = useLocation();
  const navigate = useNavigate();

  /* --------------------------------
       State
    -------------------------------- */

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    classId: "",
    status: "",
    feeType: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [detailsId, setDetailsId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice || "");

  // Message passed back from the add/edit page; clear it from
  // history so a refresh doesn't show it again.
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  /* --------------------------------
       Queries
    -------------------------------- */

  const { data, isLoading, isFetching, isError, error } = useGetFeesQuery({
    ...filters,
    page,
    limit,
  });

  const { data: classData } = useGetClassesQuery(
    { status: "active", limit: 100 },
    { skip: isPortalUser }
  );

  const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();

  /* --------------------------------
       API Response
    -------------------------------- */

  const fees = data?.fees || [];
  const summary = data?.summary || {};
  const pagination = data?.pagination || {};
  const classes = classData?.classes || [];

  // Server decides who may write; permissions decide which buttons
  const canManage = Boolean(data?.canEdit);
  const canCreate = canManage && ability?.can("create", "fees");
  const canUpdate = canManage && ability?.can("update", "fees");
  const canDelete = canManage && ability?.can("delete", "fees");

  const hasFilters = Object.values(filters).some(Boolean);

  /* --------------------------------
       Filters
    -------------------------------- */

  const updateFilter = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter("search", searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", classId: "", status: "", feeType: "" });
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* --------------------------------
       Modals
    -------------------------------- */

  const handleDelete = async () => {
    try {
      const result = await deleteFee(deleteTarget._id).unwrap();

      setDeleteTarget(null);
      setNotice(result.message);

      if (fees.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }
    } catch (err) {
      alert(errorMessage(err, "Unable to delete fee."));
    }
  };

  /* --------------------------------
       Render
    -------------------------------- */

  const stats = [
    {
      label: "Total Billed",
      value: formatMoney(summary.totalAmount),
      icon: "mdi-cash-multiple",
      color: "primary",
    },
    {
      label: "Collected",
      value: formatMoney(summary.collected),
      icon: "mdi-cash-check",
      color: "success",
    },
    {
      label: "Outstanding",
      value: formatMoney(summary.outstanding),
      icon: "mdi-cash-clock",
      color: "warning",
    },
    {
      label: "Overdue Fees",
      value: summary.overdue ?? 0,
      icon: "mdi-alert-circle-outline",
      color: "danger",
    },
  ];

  const pageTitle =
    roleSlug === "parent" ? "Children's Fees" : roleSlug === "student" ? "My Fees" : "Fees";

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

            <li className="breadcrumb-item active">Fees</li>
          </ol>
        </div>

        <h4 className="page-title">{pageTitle}</h4>
      </div>

      {/* ============================
                Statistics
            ============================ */}

      <div className="row">
        {stats.map((stat) => (
          <div className="col-md-6 col-xl-3" key={stat.label}>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar-sm">
                      <span
                        className={`avatar-title bg-${stat.color}-subtle text-${stat.color} rounded`}
                      >
                        <i className={`mdi ${stat.icon} font-24`}></i>
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow-1 ms-3">
                    <h4 className="my-1">{stat.value}</h4>

                    <p className="text-muted mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================
                Fees Table Card
            ============================ */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            {/* Card Header */}
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="header-title mb-0">Fee List</h4>

                  <p className="text-muted mb-0 mt-1">
                    {isPortalUser
                      ? "Fees, payments and balances"
                      : "Manage student fees and payments"}
                  </p>
                </div>

                {canCreate && (
                  <div className="col-md-6">
                    <div className="text-md-end mt-2 mt-md-0">
                      <Link to="/fees/create" className="btn btn-primary">
                        <i className="mdi mdi-plus me-1"></i>
                        Add Fee
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================
                            Search / Filters
                        ============================ */}

            <div className="card-body border-bottom">
              <form onSubmit={handleSearch}>
                <div className="row g-2 align-items-center">
                  {/* Search */}
                  <div className="col-md-6 col-lg-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="mdi mdi-magnify"></i>
                      </span>

                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search student or fee..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />

                      <button type="submit" className="btn btn-primary">
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Class */}
                  {!isPortalUser && (
                    <div className="col-md-3 col-lg-2">
                      <select
                        className="form-select"
                        value={filters.classId}
                        onChange={(e) => updateFilter("classId", e.target.value)}
                      >
                        <option value="">All Classes</option>

                        {classes.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} - {item.section}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status */}
                  <div className="col-md-3 col-lg-2">
                    <select
                      className="form-select"
                      value={filters.status}
                      onChange={(e) => updateFilter("status", e.target.value)}
                    >
                      <option value="">All Statuses</option>

                      {STATUS_FILTERS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fee Type */}
                  <div className="col-md-3 col-lg-2">
                    <select
                      className="form-select"
                      value={filters.feeType}
                      onChange={(e) => updateFilter("feeType", e.target.value)}
                    >
                      <option value="">All Types</option>

                      {FEE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleClearFilters}
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
                        style={{ width: "80px" }}
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
              {notice && (
                <div className="alert alert-success alert-dismissible">
                  {notice}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setNotice("")}
                  ></button>
                </div>
              )}

              {isError && (
                <div className="alert alert-danger">
                  <i className="mdi mdi-alert-circle-outline me-1"></i>
                  {errorMessage(error, "Unable to load fees.")}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />

                  <h5 className="mt-3">Loading Fees...</h5>

                  <p className="text-muted">Please wait.</p>
                </div>
              ) : (
                <>
                  {isFetching && (
                    <div className="text-center mb-2">
                      <small className="text-muted">Updating fee list...</small>
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-centered table-nowrap table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "60px" }}>#</th>
                          <th>Student</th>
                          <th>Fee</th>
                          <th>Due Date</th>
                          <th className="text-end">Net Amount</th>
                          <th className="text-end">Paid</th>
                          <th className="text-end">Balance</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {fees.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-5">
                              <div className="text-muted">
                                <i
                                  className="mdi mdi-cash-remove"
                                  style={{ fontSize: "60px" }}
                                ></i>

                                <h5 className="mt-3">No Fees Found</h5>

                                <p className="mb-3">
                                  {hasFilters
                                    ? "No fees match your filters."
                                    : "No fees have been added yet."}
                                </p>

                                {!hasFilters && canCreate && (
                                  <Link to="/fees/create" className="btn btn-primary">
                                    <i className="mdi mdi-plus me-1"></i>
                                    Add First Fee
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          fees.map((fee, index) => (
                            <tr key={fee._id}>
                              {/* # */}
                              <td>
                                <span className="text-muted">
                                  {(page - 1) * limit + index + 1}
                                </span>
                              </td>

                              {/* Student */}
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm me-2">
                                    <span className="avatar-title bg-primary-subtle text-primary rounded-circle">
                                      {fee.student?.firstName?.charAt(0)?.toUpperCase() || "S"}
                                    </span>
                                  </div>

                                  <div>
                                    <h5 className="font-14 mb-0">{studentName(fee.student)}</h5>

                                    <small className="text-muted">
                                      {fee.classId
                                        ? `${fee.classId.name} - ${fee.classId.section}`
                                        : fee.student?.admissionNumber || "-"}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              {/* Fee */}
                              <td>
                                <span className="fw-semibold">{fee.title}</span>
                                <div>
                                  <span className="badge bg-light text-dark">
                                    {feeTypeLabel(fee.feeType)}
                                  </span>
                                </div>
                              </td>

                              {/* Due Date */}
                              <td className={fee.isOverdue ? "text-danger" : ""}>
                                {formatDate(fee.dueDate)}
                              </td>

                              <td className="text-end">{formatMoney(fee.netAmount)}</td>

                              <td className="text-end text-success">
                                {formatMoney(fee.paidAmount)}
                              </td>

                              <td className="text-end fw-semibold">
                                {formatMoney(fee.balance)}
                              </td>

                              {/* Status */}
                              <td>
                                <FeeStatusBadge fee={fee} />
                              </td>

                              {/* Actions */}
                              <td className="text-end">
                                <div className="d-flex justify-content-end gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light"
                                    title={canUpdate ? "View / Payments" : "View"}
                                    onClick={() => setDetailsId(fee._id)}
                                  >
                                    <i className="mdi mdi-eye"></i>
                                  </button>

                                  {canUpdate && (
                                    <Link
                                      to={`/fees/${fee._id}/edit`}
                                      className="btn btn-sm btn-light"
                                      title="Edit Fee"
                                    >
                                      <i className="mdi mdi-pencil"></i>
                                    </Link>
                                  )}

                                  {canDelete && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light text-danger"
                                      title="Delete Fee"
                                      onClick={() => setDeleteTarget(fee)}
                                    >
                                      <i className="mdi mdi-delete"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <Pagination
                    page={pagination.page ?? page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit ?? limit}
                    label="fees"
                    onChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================
                Modals
            ============================ */}

      {detailsId && (
        <FeeDetailsModal
          feeId={detailsId}
          canEdit={canUpdate}
          onClose={() => setDetailsId(null)}
        />
      )}

      {deleteTarget && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Fee</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <div className="avatar-lg mx-auto mb-3">
                    <span className="avatar-title bg-danger-subtle text-danger rounded-circle">
                      <i className="mdi mdi-delete-outline font-24"></i>
                    </span>
                  </div>

                  <h4>Are you sure?</h4>

                  <p className="text-muted mb-0">
                    You are about to delete <strong>{deleteTarget.title}</strong> for{" "}
                    <strong>{studentName(deleteTarget.student)}</strong>
                    {deleteTarget.paidAmount > 0 &&
                      `, including ${formatMoney(deleteTarget.paidAmount)} of recorded payments`}
                    . This action cannot be undone.
                  </p>
                </div>

                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setDeleteTarget(null)}
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
                        Delete Fee
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

export default FeesPage;
