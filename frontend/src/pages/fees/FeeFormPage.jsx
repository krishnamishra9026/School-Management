import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useGetClassesQuery } from "../../features/classes/classesApi";
import {
  useGetFeeQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
} from "../../features/fees/feesApi";

import {
  FEE_TYPES,
  errorMessage,
  formatMoney,
  studentName,
  toInputDate,
} from "./feeUtils";

const emptyForm = {
  classId: "",
  applyToClass: true,
  studentId: "",
  title: "",
  feeType: "tuition",
  academicYear: "",
  amount: "",
  discount: 0,
  fine: 0,
  dueDate: toInputDate(),
  remarks: "",
};

const formFromFee = (fee) => ({
  ...emptyForm,
  title: fee.title || "",
  feeType: fee.feeType || "tuition",
  academicYear: fee.academicYear || "",
  amount: fee.amount ?? "",
  discount: fee.discount ?? 0,
  fine: fee.fine ?? 0,
  dueDate: toInputDate(fee.dueDate),
  remarks: fee.remarks || "",
});

/**
 * Fee form. Without a fee it creates one for a student or a
 * whole class; with a fee it edits that fee's details.
 */
const FeeForm = ({ fee = null }) => {
  const navigate = useNavigate();
  const isEdit = Boolean(fee);

  const [form, setForm] = useState(() => (isEdit ? formFromFee(fee) : emptyForm));
  const [formError, setFormError] = useState("");

  const { data: classData, isLoading: classesLoading } = useGetClassesQuery(
    { status: "active", limit: 100 },
    { skip: isEdit }
  );

  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();

  const isSaving = isCreating || isUpdating;

  const classes = classData?.classes || [];
  const selectedClass = classes.find((item) => item._id === form.classId);
  const classStudents = selectedClass?.students || [];

  const netAmount =
    (Number(form.amount) || 0) - (Number(form.discount) || 0) + (Number(form.fine) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const schoolClass = classes.find((item) => item._id === classId);

    setForm((previous) => ({
      ...previous,
      classId,
      studentId: "",
      academicYear: schoolClass?.academicYear || previous.academicYear,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (netAmount < 0) {
      setFormError("Discount cannot be more than the amount plus fine.");
      return;
    }

    const fields = {
      title: form.title,
      feeType: form.feeType,
      academicYear: form.academicYear,
      amount: Number(form.amount),
      discount: Number(form.discount) || 0,
      fine: Number(form.fine) || 0,
      dueDate: form.dueDate,
      remarks: form.remarks,
    };

    try {
      const result = isEdit
        ? await updateFee({ id: fee._id, ...fields }).unwrap()
        : await createFee({
            ...fields,
            classId: form.classId,
            applyToClass: form.applyToClass,
            studentId: form.applyToClass ? undefined : form.studentId,
          }).unwrap();

      navigate("/fees", { state: { notice: result.message } });
    } catch (err) {
      setFormError(errorMessage(err, "Unable to save fee."));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="alert alert-danger">
              <i className="mdi mdi-alert-circle-outline me-1"></i>
              {formError}
            </div>
          )}

          {/* ============================
                    Assign To
                ============================ */}

          <h5 className="mb-3 text-uppercase bg-light p-2">
            <i className="mdi mdi-account-group me-1"></i>
            Assign To
          </h5>

          <div className="row g-3 mb-4">
            {isEdit ? (
              <div className="col-12">
                <i className="mdi mdi-account me-1"></i>
                <strong>{studentName(fee.student)}</strong>
                {fee.classId && (
                  <span className="text-muted ms-2">
                    {fee.classId.name} - {fee.classId.section}
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="col-md-6">
                  <label className="form-label">
                    Class <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.classId}
                    onChange={handleClassChange}
                    required
                    disabled={classesLoading}
                  >
                    <option value="">
                      {classesLoading ? "Loading classes..." : "Select class"}
                    </option>

                    {classes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} - {item.section} ({item.students?.length || 0} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label d-block">Apply To</label>

                  <div className="form-check form-check-inline mt-1">
                    <input
                      id="applyAll"
                      type="radio"
                      className="form-check-input"
                      checked={form.applyToClass}
                      onChange={() =>
                        setForm((previous) => ({ ...previous, applyToClass: true }))
                      }
                    />
                    <label className="form-check-label" htmlFor="applyAll">
                      Whole class
                    </label>
                  </div>

                  <div className="form-check form-check-inline">
                    <input
                      id="applyOne"
                      type="radio"
                      className="form-check-input"
                      checked={!form.applyToClass}
                      onChange={() =>
                        setForm((previous) => ({ ...previous, applyToClass: false }))
                      }
                    />
                    <label className="form-check-label" htmlFor="applyOne">
                      One student
                    </label>
                  </div>
                </div>

                {!form.applyToClass && (
                  <div className="col-md-6">
                    <label className="form-label">
                      Student <span className="text-danger">*</span>
                    </label>
                    <select
                      name="studentId"
                      className="form-select"
                      value={form.studentId}
                      onChange={handleChange}
                      required
                      disabled={!form.classId}
                    >
                      <option value="">
                        {form.classId ? "Select student" : "Select a class first"}
                      </option>

                      {classStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {studentName(student)}
                          {student.admissionNumber ? ` (${student.admissionNumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.applyToClass && selectedClass && (
                  <div className="col-12">
                    <small className="text-muted">
                      <i className="mdi mdi-information-outline me-1"></i>
                      A separate fee will be created for each of the{" "}
                      {classStudents.length} students in this class.
                    </small>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ============================
                    Fee Details
                ============================ */}

          <h5 className="mb-3 text-uppercase bg-light p-2">
            <i className="mdi mdi-cash me-1"></i>
            Fee Details
          </h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Fee Title <span className="text-danger">*</span>
              </label>
              <input
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                placeholder="Tuition Fee - April"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Fee Type</label>
              <select
                name="feeType"
                className="form-select"
                value={form.feeType}
                onChange={handleChange}
              >
                {FEE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Academic Year</label>
              <input
                name="academicYear"
                className="form-control"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="2026-2027"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Amount <span className="text-danger">*</span>
              </label>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Discount</label>
              <input
                name="discount"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.discount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Fine</label>
              <input
                name="fine"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.fine}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Due Date <span className="text-danger">*</span>
              </label>
              <input
                name="dueDate"
                type="date"
                className="form-control"
                value={form.dueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-9">
              <label className="form-label">Remarks</label>
              <input
                name="remarks"
                className="form-control"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Net Payable</label>
              <div className="form-control bg-light fw-semibold">
                {formatMoney(netAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer d-flex justify-content-end gap-2">
          <Link to="/fees" className="btn btn-light">
            Cancel
          </Link>

          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="mdi mdi-content-save me-1"></i>
                {isEdit ? "Update Fee" : "Save Fee"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

/*
 * /fees/create and /fees/:id/edit
 */
const FeeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data, isLoading, isError, error } = useGetFeeQuery(id, { skip: !isEdit });

  const title = isEdit ? "Edit Fee" : "Add Fee";

  return (
    <>
      {/* Page Title */}
      <div className="page-title-box">
        <div className="page-title-right">
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </li>

            <li className="breadcrumb-item">
              <Link to="/fees">Fees</Link>
            </li>

            <li className="breadcrumb-item active">{title}</li>
          </ol>
        </div>

        <h4 className="page-title">{title}</h4>
      </div>

      <div className="row">
        <div className="col-12">
          {isEdit && isLoading && (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <h5 className="mt-3">Loading Fee...</h5>
              </div>
            </div>
          )}

          {isEdit && isError && (
            <div className="alert alert-danger">
              <i className="mdi mdi-alert-circle-outline me-1"></i>
              {errorMessage(error, "Unable to load fee.")}
            </div>
          )}

          {(!isEdit || data?.fee) && (
            <FeeForm key={data?.fee?._id || "new"} fee={data?.fee || null} />
          )}
        </div>
      </div>
    </>
  );
};

export default FeeFormPage;
