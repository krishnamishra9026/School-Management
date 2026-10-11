import React from "react";

import {
    PageTitle,
    ProfileMissing,
    StudentOverview,
} from "./DashboardWidgets";

const StudentDashboard = ({ data }) => {
    if (data.profileMissing) {
        return (
            <>
                <PageTitle title={`Welcome, ${data.user.name}`} subtitle={data.roleName} />
                <ProfileMissing roleName={data.roleName} />
            </>
        );
    }

    return (
        <StudentOverview
            student={data.student}
            heading={
                <PageTitle
                    title={`Welcome, ${data.student.name}`}
                    subtitle={data.roleName}
                />
            }
        />
    );
};

export default StudentDashboard;
