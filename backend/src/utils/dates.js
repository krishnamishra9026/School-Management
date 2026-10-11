/**
 * Attendance is per calendar day. Days are stored as UTC midnight
 * of the "YYYY-MM-DD" date so they compare the same regardless of
 * the server's timezone.
 */

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isDayString = (value) =>
    typeof value === "string" &&
    DAY_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

// "2026-10-11" -> Date(2026-10-11T00:00:00Z)
const toDay = (value) => new Date(`${value}T00:00:00.000Z`);

// Today's local calendar date as a day
const today = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    return toDay(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    );
};

const addDays = (day, days) => {
    const d = new Date(day);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
};

module.exports = { isDayString, toDay, today, addDays };
