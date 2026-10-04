import React from "react";
import { NavLink } from "react-router-dom";
import { useAbility } from "../auth/AbilityProvider";

const menuItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: "uil-home-alt",
        end: true,
        permission: ["view", "dashboard"],
    },

    {
        title: "Users",
        path: "/users",
        icon: "uil-users-alt",
        end: true,
        permission: ["view", "users"],
    },

    {
        title: "Students",
        path: "/students",
        icon: "uil-users-alt",
        end: true,
        permission: ["view", "students"],
    },

    {
        title: "Teachers",
        path: "/teachers",
        icon: "uil-user",
        end: true,
        permission: ["view", "teachers"],
    },

    {
        title: "Parents",
        path: "/parents",
        icon: "uil-user",
        end: true,
        permission: ["view", "parents"],
    },

    {
        title: "Parent Students",
        path: "/parent-students",
        icon: "uil-user",
        end: true,
        permission: ["view", "parent_students"],
    },

    {
        title: "Classes",
        path: "/classes",
        icon: "uil-sitemap",
        end: true,
        permission: ["view", "classes"],
    },

    {
        title: "Attendance",
        path: "/attendance",
        icon: "uil-clipboard-alt",
        end: true,
        permission: ["view", "attendance"],
    },

    {
        title: "Fees",
        path: "/fees",
        icon: "uil-money-bill",
        end: true,
        permission: ["view", "fees"],
    },

    {
        title: "Exams",
        path: "/exams",
        icon: "uil-edit",
        end: true,
        permission: ["view", "exams"],
    },

    {
        title: "Library",
        path: "/library",
        icon: "uil-book-open",
        end: true,
        permission: ["view", "library"],
    },

    {
        title: "Roles",
        path: "/roles",
        icon: "uil-shield-check",
        end: true,
        permission: ["view", "roles"],
    },
];

const Sidebar = () => {
    const ability = useAbility();

    console.log("Sidebar ability:", ability);

    /*
    |--------------------------------------------------------------------------
    | Filter Menu Based On CASL Permissions
    |--------------------------------------------------------------------------
    */

    const visibleMenuItems = menuItems.filter(
        (item) => {
            // No permission requirement
            if (!item.permission) {
                return true;
            }

            const [action, subject] =
                item.permission;

            return ability?.can(
                action,
                subject
            );
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Settings Permission
    |--------------------------------------------------------------------------
    */

    const canViewSettings =
        ability?.can(
            "view",
            "settings"
        );

    return (
        <div className="leftside-menu">

            {/* Logo */}

            <NavLink
                to="/dashboard"
                className="logo logo-light"
            >
                <span className="logo-lg">
                    <img
                        src="/assets/images/logo.png"
                        alt="School Management"
                        height="22"
                    />
                </span>

                <span className="logo-sm">
                    <img
                        src="/assets/images/logo-sm.png"
                        alt="School"
                        height="22"
                    />
                </span>
            </NavLink>

            <NavLink
                to="/dashboard"
                className="logo logo-dark"
            >
                <span className="logo-lg">
                    <img
                        src="/assets/images/logo-dark.png"
                        alt="School Management"
                        height="22"
                    />
                </span>

                <span className="logo-sm">
                    <img
                        src="/assets/images/logo-sm.png"
                        alt="School"
                        height="22"
                    />
                </span>
            </NavLink>

            <div
                className="h-100"
                id="leftside-menu-container"
                data-simplebar
            >
                <ul className="side-nav">

                    {/* Main */}

                    <li className="side-nav-title">
                        SCHOOL MANAGEMENT
                    </li>

                    {visibleMenuItems.map(
                        (item) => (
                            <li
                                className="side-nav-item"
                                key={item.path}
                            >
                                <NavLink
                                    to={item.path}
                                    end={item.end}
                                    className={({
                                        isActive,
                                    }) =>
                                        `side-nav-link ${
                                            isActive
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                >
                                    <i
                                        className={`uil ${item.icon}`}
                                    ></i>

                                    <span>
                                        {item.title}
                                    </span>
                                </NavLink>
                            </li>
                        )
                    )}

                    {/* System */}

                    {canViewSettings && (
                        <>
                            <li className="side-nav-title mt-3">
                                SYSTEM
                            </li>

                            <li className="side-nav-item">
                                <NavLink
                                    to="/settings"
                                    className={({
                                        isActive,
                                    }) =>
                                        `side-nav-link ${
                                            isActive
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                >
                                    <i className="uil uil-cog"></i>

                                    <span>
                                        Settings
                                    </span>
                                </NavLink>
                            </li>
                        </>
                    )}

                </ul>

                <div className="clearfix"></div>
            </div>
        </div>
    );
};

export default Sidebar;