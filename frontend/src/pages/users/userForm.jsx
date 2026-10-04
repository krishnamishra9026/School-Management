import React, { useEffect, useState } from "react";
import { useGetAllRolesQuery } from "../../features/roles/rolesApi";

const UserForm = ({
    user = null,
    onSubmit,
    loading = false,
    submitText = "Save User",
}) => {
    const {
        data: rolesResponse,
        isLoading: rolesLoading,
        isError: rolesError,
        error: rolesApiError,
    } = useGetAllRolesQuery();

    /**
     * Support different API response formats:
     *
     * {
     *   success: true,
     *   roles: [...]
     * }
     *
     * OR
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     *
     * OR
     *
     * [...]
     */
    const roles = Array.isArray(rolesResponse)
        ? rolesResponse
        : rolesResponse?.roles ||
          rolesResponse?.data ||
          [];

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleId: "",
        status: "active",
    });

    const [errors, setErrors] = useState({});

    /**
     * Debug
     */
    console.log("Roles API Response:", rolesResponse);
    console.log("Roles:", roles);
    console.log("Roles API Error:", rolesApiError);

    /**
     * Set form data
     */
    useEffect(() => {
        if (!user) {
            setFormData({
                name: "",
                email: "",
                password: "",
                roleId: "",
                status: "active",
            });

            return;
        }

        let roleId = "";

        /**
         * Possible backend formats:
         *
         * roleId: "ObjectId"
         *
         * roleId: {
         *     _id: "ObjectId",
         *     name: "Teacher"
         * }
         *
         * role: {
         *     _id: "ObjectId",
         *     name: "Teacher"
         * }
         */
        if (user.roleId?._id) {
            roleId = user.roleId._id;
        } else if (user.roleId) {
            roleId = user.roleId;
        } else if (user.role?._id) {
            roleId = user.role._id;
        }

        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            roleId,
            status: user.status || "active",
        });
    }, [user]);

    /**
     * Handle input change
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    /**
     * Validate form
     */
    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        }

        if (!user && !formData.password) {
            newErrors.password = "Password is required.";
        }

        if (
            formData.password &&
            formData.password.length < 6
        ) {
            newErrors.password =
                "Password must be at least 6 characters.";
        }

        if (!formData.roleId) {
            newErrors.roleId = "Role is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /**
     * Submit
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (typeof onSubmit !== "function") {
            console.error(
                "UserForm: onSubmit prop is missing."
            );
            return;
        }

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            roleId: formData.roleId,
            status: formData.status,
        };

        // Send password only if entered
        if (formData.password) {
            payload.password = formData.password;
        }

        console.log("User Payload:", payload);

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* Name */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Full Name{" "}
                        <span className="text-danger">*</span>
                    </label>

                    <input
                        type="text"
                        name="name"
                        className={`form-control ${
                            errors.name ? "is-invalid" : ""
                        }`}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                    />

                    {errors.name && (
                        <div className="invalid-feedback">
                            {errors.name}
                        </div>
                    )}
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Email{" "}
                        <span className="text-danger">*</span>
                    </label>

                    <input
                        type="email"
                        name="email"
                        className={`form-control ${
                            errors.email ? "is-invalid" : ""
                        }`}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                    />

                    {errors.email && (
                        <div className="invalid-feedback">
                            {errors.email}
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Password{" "}
                        {!user && (
                            <span className="text-danger">*</span>
                        )}
                    </label>

                    <input
                        type="password"
                        name="password"
                        className={`form-control ${
                            errors.password
                                ? "is-invalid"
                                : ""
                        }`}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={
                            user
                                ? "Leave blank to keep current password"
                                : "Enter password"
                        }
                    />

                    {errors.password && (
                        <div className="invalid-feedback">
                            {errors.password}
                        </div>
                    )}
                </div>

                {/* Role */}
                <div className="col-md-3 mb-3">
                    <label className="form-label">
                        Role{" "}
                        <span className="text-danger">*</span>
                    </label>

                    <select
                        name="roleId"
                        className={`form-select ${
                            errors.roleId ? "is-invalid" : ""
                        }`}
                        value={formData.roleId}
                        onChange={handleChange}
                        disabled={rolesLoading}
                    >
                        <option value="">
                            {rolesLoading
                                ? "Loading roles..."
                                : "Select Role"}
                        </option>

                        {roles.map((role) => (
                            <option
                                key={role._id}
                                value={role._id}
                            >
                                {role.name}
                            </option>
                        ))}
                    </select>

                    {errors.roleId && (
                        <div className="invalid-feedback">
                            {errors.roleId}
                        </div>
                    )}

                    {rolesError && (
                        <div className="text-danger small mt-1">
                            Unable to load roles.
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="col-md-3 mb-3">
                    <label className="form-label">
                        Status
                    </label>

                    <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="active">
                            Active
                        </option>
                        <option value="inactive">
                            Inactive
                        </option>
                    </select>
                </div>
            </div>

            {/* Submit */}
            <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || rolesLoading}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                            />
                            Saving...
                        </>
                    ) : (
                        submitText
                    )}
                </button>
            </div>
        </form>
    );
};

export default UserForm;