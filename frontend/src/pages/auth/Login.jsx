import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        try {
            const response = await login(formData).unwrap();

            if (response.success) {
                dispatch(
                    setCredentials({
                        token: response.token,
                        user: response.user,
                        permissions: response.permissions,
                    })
                );

                navigate("/dashboard");
            }
        } catch (error) {
            setErrorMessage(
                error?.data?.message ||
                "Invalid email or password"
            );
        }
    };

    return (
        <div
            className="authentication-bg"
            data-layout-config='{"darkMode":false}'
        >
            <div className="account-pages mt-5 mb-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xxl-4 col-lg-5">
                            <div className="card">

                                {/* Logo */}
                                <div className="card-header pt-4 pb-4 text-center bg-primary">
                                    <Link to="/">
                                        <span>
                                            <img
                                                src="/assets/images/logo.png"
                                                alt="School Management"
                                                height="18"
                                            />
                                        </span>
                                    </Link>
                                </div>

                                <div className="card-body p-4">

                                    <div className="text-center w-75 m-auto">
                                        <h4 className="text-dark-50 text-center mt-0 fw-bold">
                                            Sign In
                                        </h4>

                                        <p className="text-muted mb-4">
                                            Enter your email address and password
                                            to access admin panel.
                                        </p>
                                    </div>

                                    {errorMessage && (
                                        <div
                                            className="alert alert-danger"
                                            role="alert"
                                        >
                                            {errorMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>

                                        {/* Email */}
                                        <div className="mb-3">
                                            <label
                                                htmlFor="emailaddress"
                                                className="form-label"
                                            >
                                                Email address
                                            </label>

                                            <input
                                                className="form-control"
                                                type="email"
                                                id="emailaddress"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your email"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="mb-3">
                                            <Link
                                                to="/forgot-password"
                                                className="text-muted float-end"
                                            >
                                                <small>
                                                    Forgot your password?
                                                </small>
                                            </Link>

                                            <label
                                                htmlFor="password"
                                                className="form-label"
                                            >
                                                Password
                                            </label>

                                            <div className="input-group input-group-merge">
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    className="form-control"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter your password"
                                                />

                                                <div
                                                    className="input-group-text"
                                                    data-password="false"
                                                >
                                                    <span className="password-eye"></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remember Me */}
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="checkbox-signin"
                                                />

                                                <label
                                                    className="form-check-label"
                                                    htmlFor="checkbox-signin"
                                                >
                                                    Remember me
                                                </label>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mb-3 mb-0 text-center">
                                            <button
                                                className="btn btn-primary"
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Logging in..."
                                                    : "Log In"}
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            </div>

                            {/* Register */}
                            <div className="row mt-3">
                                <div className="col-12 text-center">
                                    <p className="text-muted">
                                        Don't have an account?

                                        <Link
                                            to="/register"
                                            className="text-muted ms-1"
                                        >
                                            <b>Sign Up</b>
                                        </Link>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer footer-alt">
                2026 © School Management System
            </footer>
        </div>
    );
};

export default Login;