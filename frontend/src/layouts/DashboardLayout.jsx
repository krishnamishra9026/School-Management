import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = () => {
    return (
        <div className="wrapper">

            {/* Sidebar */}
            <Sidebar />

            {/* Content */}
            <div className="content-page">

                <div className="content">

                    {/* Topbar */}
                    <Topbar />

                    {/* Page Content */}
                    <div className="container-fluid">
                        <Outlet />
                    </div>

                </div>

                {/* Footer */}
                <footer className="footer">
                    <div className="container-fluid">
                        <div className="row">

                            <div className="col-md-6">
                                {new Date().getFullYear()} ©
                                School Management System
                            </div>

                            <div className="col-md-6">
                                <div className="text-md-end footer-links d-none d-md-block">
                                    <a href="#">About</a>
                                    <a href="#">Support</a>
                                    <a href="#">Contact Us</a>
                                </div>
                            </div>

                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default DashboardLayout;