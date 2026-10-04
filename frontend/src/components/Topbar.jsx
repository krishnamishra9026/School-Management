import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

const Topbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="navbar-custom">

            {/* Right Menu */}
            <ul className="list-unstyled topbar-menu float-end mb-0">

                {/* Mobile Search */}
                <li className="dropdown notification-list d-lg-none">
                    <a
                        className="nav-link dropdown-toggle arrow-none"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-expanded="false"
                        onClick={(e) => e.preventDefault()}
                    >
                        <i className="dripicons-search noti-icon"></i>
                    </a>

                    <div className="dropdown-menu dropdown-menu-animated dropdown-lg p-0">
                        <form className="p-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                            />
                        </form>
                    </div>
                </li>

                {/* Notifications */}
                <li className="dropdown notification-list">
                    <a
                        className="nav-link dropdown-toggle arrow-none"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-expanded="false"
                        onClick={(e) => e.preventDefault()}
                    >
                        <i className="dripicons-bell noti-icon"></i>

                        <span className="noti-icon-badge"></span>
                    </a>

                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg">

                        <div className="dropdown-item noti-title">
                            <h5 className="m-0">
                                <span className="float-end">
                                    <a
                                        href="#"
                                        className="text-dark"
                                        onClick={(e) =>
                                            e.preventDefault()
                                        }
                                    >
                                        <small>Clear All</small>
                                    </a>
                                </span>

                                Notifications
                            </h5>
                        </div>

                        <div
                            style={{ maxHeight: "230px" }}
                            data-simplebar=""
                        >
                            <a
                                href="#"
                                className="dropdown-item notify-item"
                                onClick={(e) =>
                                    e.preventDefault()
                                }
                            >
                                <div className="notify-icon bg-primary">
                                    <i className="mdi mdi-account-plus"></i>
                                </div>

                                <p className="notify-details">
                                    New student registered.
                                    <small className="text-muted">
                                        5 minutes ago
                                    </small>
                                </p>
                            </a>

                            <a
                                href="#"
                                className="dropdown-item notify-item"
                                onClick={(e) =>
                                    e.preventDefault()
                                }
                            >
                                <div className="notify-icon bg-info">
                                    <i className="mdi mdi-calendar-check"></i>
                                </div>

                                <p className="notify-details">
                                    Attendance updated.
                                    <small className="text-muted">
                                        1 hour ago
                                    </small>
                                </p>
                            </a>

                            <a
                                href="#"
                                className="dropdown-item notify-item"
                                onClick={(e) =>
                                    e.preventDefault()
                                }
                            >
                                <div className="notify-icon bg-success">
                                    <i className="mdi mdi-cash"></i>
                                </div>

                                <p className="notify-details">
                                    Fee payment received.
                                    <small className="text-muted">
                                        3 hours ago
                                    </small>
                                </p>
                            </a>
                        </div>

                        <a
                            href="#"
                            className="dropdown-item text-center text-primary notify-item notify-all"
                            onClick={(e) =>
                                e.preventDefault()
                            }
                        >
                            View All
                        </a>
                    </div>
                </li>

                {/* Settings */}
                <li className="notification-list">
                    <button
                        type="button"
                        className="nav-link end-bar-toggle border-0 bg-transparent"
                    >
                        <i className="dripicons-gear noti-icon"></i>
                    </button>
                </li>

                {/* User */}
                <li className="dropdown notification-list">
                    <a
                        className="nav-link dropdown-toggle nav-user arrow-none me-0"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-expanded="false"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="account-user-avatar">
                            <img
                                src="/assets/images/users/avatar-1.jpg"
                                alt="user"
                                className="rounded-circle"
                            />
                        </span>

                        <span>
                            <span className="account-user-name">
                                {user?.name || "School Admin"}
                            </span>

                            <span className="account-position text-capitalize">
                                {user?.roleId?.name.replace("_", " ") ||
                                    "Administrator1"}
                            </span>
                        </span>
                    </a>

                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated topbar-dropdown-menu profile-dropdown">

                        {/* Header */}
                        <div className="dropdown-header noti-title">
                            <h6 className="text-overflow m-0">
                                Welcome!
                            </h6>
                        </div>

                        {/* My Account */}
                        <button
                            type="button"
                            className="dropdown-item notify-item"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            <i className="mdi mdi-account-circle me-1"></i>
                            <span>My Account</span>
                        </button>

                        {/* Settings */}
                        <button
                            type="button"
                            className="dropdown-item notify-item"
                            onClick={() =>
                                navigate("/settings")
                            }
                        >
                            <i className="mdi mdi-account-edit me-1"></i>
                            <span>Settings</span>
                        </button>

                        {/* Support */}
                        <button
                            type="button"
                            className="dropdown-item notify-item"
                            onClick={() =>
                                navigate("/support")
                            }
                        >
                            <i className="mdi mdi-lifebuoy me-1"></i>
                            <span>Support</span>
                        </button>

                        {/* Logout */}
                        <button
                            type="button"
                            className="dropdown-item notify-item"
                            onClick={handleLogout}
                        >
                            <i className="mdi mdi-logout me-1"></i>
                            <span>Logout</span>
                        </button>

                    </div>
                </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
                className="button-menu-mobile open-left"
                type="button"
            >
                <i className="mdi mdi-menu"></i>
            </button>

            {/* Search */}
            <div className="app-search dropdown d-none d-lg-block">

                <form
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="input-group">

                        <input
                            type="text"
                            className="form-control dropdown-toggle"
                            placeholder="Search students, teachers..."
                            id="top-search"
                        />

                        <span className="mdi mdi-magnify search-icon"></span>

                        <button
                            className="input-group-text btn-primary"
                            type="submit"
                        >
                            Search
                        </button>

                    </div>
                </form>

            </div>
        </div>
    );
};

export default Topbar;