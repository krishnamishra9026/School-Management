import React, { useState } from "react";
import { useSelector } from "react-redux";

import { useAbility } from "../../auth/AbilityProvider";
import { PageTitle } from "../dashboard/DashboardWidgets";

import MarkAttendance from "./MarkAttendance";
import AttendanceRecords from "./AttendanceRecords";
import AttendanceReport from "./AttendanceReport";
import MyAttendance from "./MyAttendance";

/**
 * Attendance for every panel:
 * - student / parent: their own (or children's) attendance
 * - teacher / admin:  mark, browse records and class reports
 *   (the API limits teachers to their own classes)
 */
const AttendancePage = () => {
    const ability = useAbility();
    const roleSlug = useSelector((state) => state.auth.user?.roleId?.slug);

    const canMark = ability?.can("create", "attendance");

    const tabs = [
        canMark && { key: "mark", label: "Mark Attendance", icon: "mdi-calendar-check" },
        { key: "records", label: "Records", icon: "mdi-format-list-bulleted" },
        { key: "report", label: "Class Report", icon: "mdi-chart-bar" },
    ].filter(Boolean);

    const [activeTab, setActiveTab] = useState(tabs[0].key);

    if (roleSlug === "student" || roleSlug === "parent") {
        return (
            <>
                <PageTitle title={roleSlug === "parent" ? "Children's Attendance" : "My Attendance"} />
                <MyAttendance isParent={roleSlug === "parent"} />
            </>
        );
    }

    return (
        <>
            <PageTitle
                title="Attendance"
                subtitle={roleSlug === "teacher" ? "My classes" : "All classes"}
            />

            <div className="card">
                <div className="card-body">
                    <ul className="nav nav-tabs nav-bordered mb-3">
                        {tabs.map((tab) => (
                            <li className="nav-item" key={tab.key}>
                                <button
                                    type="button"
                                    className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <i className={`mdi ${tab.icon} me-1`}></i>
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {activeTab === "mark" && <MarkAttendance />}
                    {activeTab === "records" && <AttendanceRecords showClassFilter />}
                    {activeTab === "report" && <AttendanceReport />}
                </div>
            </div>
        </>
    );
};

export default AttendancePage;
