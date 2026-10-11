import React from "react";
import { useSelector } from "react-redux";

import { useGetDashboardQuery } from "../../features/dashboard/dashboardApi";

import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import ParentDashboard from "./ParentDashboard";

// Roles not listed here (super_admin, school_admin, staff, ...)
// get the admin dashboard.
const DASHBOARDS = {
    teacher: TeacherDashboard,
    student: StudentDashboard,
    parent: ParentDashboard,
};

const Dashboard = () => {
    const userId = useSelector(
        (state) => state.auth.user?.id || state.auth.user?._id
    );

    const { data, isLoading, isError, error, refetch, isFetching } =
        useGetDashboardQuery(userId, { refetchOnMountOrArgChange: true });

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-danger mt-3 d-flex justify-content-between align-items-center">
                {error?.data?.message || "Unable to load dashboard."}
                <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={refetch}
                >
                    Retry
                </button>
            </div>
        );
    }

    const RoleDashboard = DASHBOARDS[data.role] || AdminDashboard;

    return (
        <div className={isFetching ? "opacity-75" : ""}>
            <RoleDashboard data={data} />
        </div>
    );
};

export default Dashboard;
