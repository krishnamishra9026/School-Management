import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useRegisterMutation } from "../../features/auth/authApi";

const Register = () => {
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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
        setSuccessMessage("");

        if (!acceptTerms) {
            setErrorMessage(
                "Please accept the Terms and Conditions."
            );
            return;
        }

        try {
            const response = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            }).unwrap();

            if (response.success) {
                setSuccessMessage(
                    "Account created successfully. Redirecting to login..."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (error) {
            setErrorMessage(
                error?.data?.message ||
                "Registration failed. Please try again."
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

                                    {/* Heading */}
                                    <div className="text-center w-75 m-auto">
                                        <h4 className="text-dark-50 text-center mt-0 fw-bold">
                                            Free Sign Up
                                        </h4>

                                        <p className="text-muted mb-4">
                                            Don't have an account? Create your
                                            account, it takes less than a minute
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {errorMessage && (
                                        <div
                                            className="alert alert-danger"
                                            role="alert"
                                        >
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Success */}
                                    {successMessage && (
                                        <div
                                            className="alert alert-success"
                                            role="alert"
                                        >
                                            {successMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>

                                        {/* Full Name */}
                                        <div className="mb-3">
                                            <label
                                                htmlFor="fullname"
                                                className="form-label"
                                            >
                                                Full Name
                                            </label>

                                            <input
                                                className="form-control"
                                                type="text"
                                                id="fullname"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </div>

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
                                                    minLength={6}
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

                                        {/* Terms */}
                                        <div className="mb-3">
                                            <div className="form-check">

                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="checkbox-signup"
                                                    checked={acceptTerms}
                                                    onChange={(e) =>
                                                        setAcceptTerms(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <label
                                                    className="form-check-label"
                                                    htmlFor="checkbox-signup"
                                                >
                                                    I accept{" "}
                                                    <a
                                                        href="#"
                                                        className="text-muted"
                                                        onClick={(e) =>
                                                            e.preventDefault()
                                                        }
                                                    >
                                                        Terms and Conditions
                                                    </a>
                                                </label>

                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mb-3 text-center">
                                            <button
                                                className="btn btn-primary"
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Creating Account..."
                                                    : "Sign Up"}
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            </div>

                            {/* Login */}
                            <div className="row mt-3">
                                <div className="col-12 text-center">
                                    <p className="text-muted">
                                        Already have account?{" "}

                                        <Link
                                            to="/login"
                                            className="text-muted ms-1"
                                        >
                                            <b>Log In</b>
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

export default Register;
