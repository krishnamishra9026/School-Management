import React, { useState } from "react";

import {
    PageTitle,
    ProfileMissing,
    StudentOverview,
} from "./DashboardWidgets";

const ParentDashboard = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (data.profileMissing) {
        return (
            <>
                <PageTitle title={`Welcome, ${data.user.name}`} subtitle={data.roleName} />
                <ProfileMissing roleName={data.roleName} />
            </>
        );
    }

    const { profile, children = [] } = data;
    const active = children[activeIndex] || children[0];

    return (
        <>
            <PageTitle
                title={`Welcome, ${profile.name}`}
                subtitle={data.roleName}
            />

            {children.length === 0 ? (
                <div className="alert alert-info">
                    No children are linked to your account yet. Please
                    contact the school administrator.
                </div>
            ) : (
                <>
                    {/* Child switcher */}
                    {children.length > 1 && (
                        <ul className="nav nav-pills bg-nav-pills mb-3">
                            {children.map((child, index) => (
                                <li className="nav-item" key={child._id}>
                                    <button
                                        type="button"
                                        className={`nav-link ${
                                            child === active ? "active" : ""
                                        }`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <i className="mdi mdi-account me-1"></i>
                                        {child.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <StudentOverview
                        key={active._id}
                        student={active}
                        heading={
                            <h4 className="mb-3">
                                {active.name}
                                <small className="text-muted fw-normal ms-2 text-capitalize">
                                    ({active.relationship === "guardian"
                                        ? "ward"
                                        : "child"})
                                </small>
                            </h4>
                        }
                    />
                </>
            )}
        </>
    );
};

export default ParentDashboard;
