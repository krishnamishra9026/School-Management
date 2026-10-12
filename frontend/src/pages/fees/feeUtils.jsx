export const CURRENCY = "₹";

export const FEE_TYPES = [
    { value: "tuition", label: "Tuition" },
    { value: "admission", label: "Admission" },
    { value: "transport", label: "Transport" },
    { value: "exam", label: "Exam" },
    { value: "library", label: "Library" },
    { value: "sports", label: "Sports" },
    { value: "other", label: "Other" },
];

export const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "online", label: "Online" },
];

export const STATUS_FILTERS = [
    { value: "pending", label: "Pending" },
    { value: "partial", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
];

const labelOf = (list, value) =>
    list.find((item) => item.value === value)?.label || value || "-";

export const feeTypeLabel = (value) => labelOf(FEE_TYPES, value);

export const paymentMethodLabel = (value) => labelOf(PAYMENT_METHODS, value);

export const formatMoney = (value) =>
    `${CURRENCY}${Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

export const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "-";

// "YYYY-MM-DD" for <input type="date">
export const toInputDate = (value) => {
    const date = value ? new Date(value) : new Date();
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const studentName = (student) =>
    student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "-";

export const errorMessage = (error, fallback) => error?.data?.message || fallback;

export const FeeStatusBadge = ({ fee }) => {
    if (fee.isOverdue) {
        return <span className="badge bg-danger-subtle text-danger">Overdue</span>;
    }

    const styles = {
        paid: ["bg-success-subtle text-success", "Paid"],
        partial: ["bg-warning-subtle text-warning", "Partial"],
        pending: ["bg-info-subtle text-info", "Pending"],
    };

    const [className, label] = styles[fee.status] || styles.pending;

    return <span className={`badge ${className}`}>{label}</span>;
};
