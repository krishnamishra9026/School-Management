import React, { useState } from "react";

import {
  useGetFeeQuery,
  useAddFeePaymentMutation,
  useDeleteFeePaymentMutation,
} from "../../features/fees/feesApi";

import {
  PAYMENT_METHODS,
  FeeStatusBadge,
  errorMessage,
  feeTypeLabel,
  formatDate,
  formatMoney,
  paymentMethodLabel,
  studentName,
  toInputDate,
} from "./feeUtils";

const emptyPayment = () => ({
  amount: "",
  method: "cash",
  reference: "",
  paidOn: toInputDate(),
  remarks: "",
});

/**
 * Fee breakdown and payment history. Staff can record and
 * remove payments (canEdit); parents/students only read.
 */
const FeeDetailsModal = ({ feeId, canEdit = false, onClose }) => {
  const { data, isLoading, isError, error } = useGetFeeQuery(feeId);

  const [addPayment, { isLoading: isAdding }] = useAddFeePaymentMutation();
  const [deletePayment, { isLoading: isRemoving }] = useDeleteFeePaymentMutation();

  const [payment, setPayment] = useState(emptyPayment);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [message, setMessage] = useState(null);

  const fee = data?.fee;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPayment((previous) => ({ ...previous, [name]: value }));
  };

  const openPaymentForm = () => {
    setPayment({ ...emptyPayment(), amount: fee.balance });
    setShowPaymentForm(true);
    setMessage(null);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const result = await addPayment({
        id: feeId,
        ...payment,
        amount: Number(payment.amount),
      }).unwrap();

      setShowPaymentForm(false);
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({ type: "danger", text: errorMessage(err, "Unable to record payment.") });
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Remove this payment?")) {
      return;
    }

    setMessage(null);

    try {
      const result = await deletePayment({ id: feeId, paymentId }).unwrap();

      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({ type: "danger", text: errorMessage(err, "Unable to remove payment.") });
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Fee Details</h5>

              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {isLoading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              )}

              {isError && (
                <div className="alert alert-danger mb-0">
                  {errorMessage(error, "Unable to load fee.")}
                </div>
              )}

              {fee && (
                <>
                  {message && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}

                  {/* Summary */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="mt-0 mb-1">{fee.title}</h4>

                      <p className="text-muted mb-0">
                        {studentName(fee.student)}
                        {fee.student?.admissionNumber && ` · ${fee.student.admissionNumber}`}
                        {fee.classId && ` · ${fee.classId.name} - ${fee.classId.section}`}
                      </p>
                    </div>

                    <FeeStatusBadge fee={fee} />
                  </div>

                  <div className="row g-2 mb-3">
                    {[
                      ["Fee Type", feeTypeLabel(fee.feeType)],
                      ["Academic Year", fee.academicYear || "-"],
                      ["Due Date", formatDate(fee.dueDate)],
                      ["Amount", formatMoney(fee.amount)],
                      ["Discount", formatMoney(fee.discount)],
                      ["Fine", formatMoney(fee.fine)],
                    ].map(([label, value]) => (
                      <div className="col-6 col-md-4" key={label}>
                        <div className="border rounded p-2">
                          <small className="text-muted d-block">{label}</small>
                          <span className="fw-semibold">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row text-center bg-light rounded py-2 mx-0 mb-3">
                    <div className="col-4">
                      <small className="text-muted d-block">Net Payable</small>
                      <h5 className="my-1">{formatMoney(fee.netAmount)}</h5>
                    </div>

                    <div className="col-4">
                      <small className="text-muted d-block">Paid</small>
                      <h5 className="my-1 text-success">{formatMoney(fee.paidAmount)}</h5>
                    </div>

                    <div className="col-4">
                      <small className="text-muted d-block">Balance</small>
                      <h5 className={`my-1 ${fee.balance > 0 ? "text-danger" : ""}`}>
                        {formatMoney(fee.balance)}
                      </h5>
                    </div>
                  </div>

                  {fee.remarks && (
                    <p className="text-muted">
                      <i className="mdi mdi-note-text-outline me-1"></i>
                      {fee.remarks}
                    </p>
                  )}

                  {/* Payments */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Payments</h5>

                    {canEdit && fee.balance > 0 && !showPaymentForm && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={openPaymentForm}
                      >
                        <i className="mdi mdi-cash-plus me-1"></i>
                        Record Payment
                      </button>
                    )}
                  </div>

                  {showPaymentForm && (
                    <form onSubmit={handleAddPayment} className="border rounded p-3 mb-3">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <label className="form-label">Amount</label>
                          <input
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={fee.balance}
                            className="form-control"
                            value={payment.amount}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Method</label>
                          <select
                            name="method"
                            className="form-select"
                            value={payment.method}
                            onChange={handleChange}
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <option key={method.value} value={method.value}>
                                {method.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Paid On</label>
                          <input
                            name="paidOn"
                            type="date"
                            className="form-control"
                            value={payment.paidOn}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Reference / Receipt No.</label>
                          <input
                            name="reference"
                            className="form-control"
                            value={payment.reference}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Remarks</label>
                          <input
                            name="remarks"
                            className="form-control"
                            value={payment.remarks}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={() => setShowPaymentForm(false)}
                          disabled={isAdding}
                        >
                          Cancel
                        </button>

                        <button type="submit" className="btn btn-success" disabled={isAdding}>
                          {isAdding ? "Saving..." : "Save Payment"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="table-responsive">
                    <table className="table table-sm table-centered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                          <th>Received By</th>
                          {canEdit && <th className="text-end">Action</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {fee.payments.length === 0 ? (
                          <tr>
                            <td colSpan={canEdit ? 6 : 5} className="text-center text-muted py-3">
                              No payments recorded yet.
                            </td>
                          </tr>
                        ) : (
                          fee.payments.map((item) => (
                            <tr key={item._id}>
                              <td>{formatDate(item.paidOn)}</td>
                              <td className="fw-semibold">{formatMoney(item.amount)}</td>
                              <td>{paymentMethodLabel(item.method)}</td>
                              <td>{item.reference || "-"}</td>
                              <td>{item.receivedBy?.name || "-"}</td>
                              {canEdit && (
                                <td className="text-end">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light text-danger"
                                    title="Remove Payment"
                                    disabled={isRemoving}
                                    onClick={() => handleDeletePayment(item._id)}
                                  >
                                    <i className="mdi mdi-delete"></i>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default FeeDetailsModal;
