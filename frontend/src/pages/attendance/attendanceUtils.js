export const STATUSES = ["Present", "Absent", "Late"];

const pad = (n) => String(n).padStart(2, "0");

// Local calendar date as "YYYY-MM-DD"
export const toDayString = (date = new Date()) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayString = () => toDayString();

export const daysAgoString = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return toDayString(d);
};

export const firstOfMonthString = () => {
    const d = new Date();
    return toDayString(new Date(d.getFullYear(), d.getMonth(), 1));
};

// Records are stored as UTC midnight of the day; format in UTC
// so the shown date never shifts with the viewer's timezone.
export const formatDay = (value) =>
    new Date(value).toLocaleDateString(undefined, {
        timeZone: "UTC",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export const errorMessage = (error, fallback) =>
    error?.data?.message || fallback;

export const rateClass = (rate) => {
    if (rate === null || rate === undefined) return "bg-secondary";
    if (rate >= 90) return "bg-success";
    if (rate >= 75) return "bg-warning";
    return "bg-danger";
};
