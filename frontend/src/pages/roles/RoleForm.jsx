import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
} from "../../features/roles/rolesApi";

const RoleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const {
        data: roleResponse,
        isLoading: isRoleLoading,
        isError: isRoleError,
        error: roleError,
    } = useGetRoleQuery(id, {
        skip: !isEditMode,
    });

    const [createRole, { isLoading: isCreating }] =
        useCreateRoleMutation();

    const [updateRole, { isLoading: isUpdating }] =
        useUpdateRoleMutation();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        status: "active",
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const role = roleResponse?.data;

    const isSystemRole = Boolean(role?.isSystemRole);

    const isSubmitting =
        isCreating || isUpdating;

    /*
     * Populate form when editing
     */
    useEffect(() => {
        if (!role || !isEditMode) {
            return;
        }

        setFormData({
            name: role.name || "",
            slug: role.slug || "",
            description: role.description || "",
            status: role.status || "active",
        });
    }, [role, isEditMode]);

    /*
     * Convert name into a slug
     */
    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-_]/g, "")
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-");
    };

    /*
     * Handle input changes
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

        setSubmitError("");
        setSuccessMessage("");
    };

    /*
     * Handle role name
     *
     * Automatically generates slug only while creating.
     */
    const handleNameChange = (e) => {
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            name: value,

            ...(isEditMode
                ? {}
                : {
                      slug: generateSlug(value),
                  }),
        }));

        setErrors((prev) => ({
            ...prev,
            name: "",
        }));

        setSubmitError("");
    };

    /*
     * Validation
     */
    const validate = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const slug = formData.slug.trim();

        if (!name) {
            newErrors.name =
                "Role name is required.";
        } else if (name.length < 2) {
            newErrors.name =
                "Role name must be at least 2 characters.";
        } else if (name.length > 100) {
            newErrors.name =
                "Role name cannot exceed 100 characters.";
        }

        if (!slug) {
            newErrors.slug =
                "Role slug is required.";
        } else if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
            newErrors.slug =
                "Slug may contain lowercase letters, numbers, hyphens, and underscores only.";
        } else if (slug.length > 100) {
            newErrors.slug =
                "Role slug cannot exceed 100 characters.";
        }

        if (
            formData.description &&
            formData.description.length > 500
        ) {
            newErrors.description =
                "Description cannot exceed 500 characters.";
        }

        if (
            !["active", "inactive"].includes(
                formData.status
            )
        ) {
            newErrors.status =
                "Please select a valid status.";
        }

        /*
         * System role restrictions
         */
        if (isSystemRole) {
            if (
                role?.slug &&
                formData.slug !== role.slug
            ) {
                newErrors.slug =
                    "System role slug cannot be changed.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /*
     * Submit
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitError("");
        setSuccessMessage("");

        if (!validate()) {
            return;
        }

        const payload = {
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            description:
                formData.description.trim(),
            status: formData.status,
        };

        try {
            if (isEditMode) {
                await updateRole({
                    id,
                    ...payload,
                }).unwrap();

                setSuccessMessage(
                    "Role updated successfully."
                );

                setTimeout(() => {
                    navigate("/roles");
                }, 700);
            } else {
                await createRole(payload).unwrap();

                setSuccessMessage(
                    "Role created successfully."
                );

                setTimeout(() => {
                    navigate("/roles");
                }, 700);
            }
        } catch (error) {
            console.error(
                "Role save error:",
                error
            );

            setSubmitError(
                error?.data?.message ||
                    `Failed to ${
                        isEditMode
                            ? "update"
                            : "create"
                    } role.`
            );
        }
    };

    /*
     * Loading edit role
     */
    if (isEditMode && isRoleLoading) {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">
                                Edit Role
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <div className="mt-2">
                            Loading role...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Role loading error
     */
    if (isEditMode && isRoleError) {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">
                                Edit Role
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="alert alert-danger">
                    {roleError?.data?.message ||
                        "Failed to load role."}
                </div>

                <Link
                    to="/roles"
                    className="btn btn-secondary"
                >
                    Back to Roles
                </Link>
            </div>
        );
    }

    return (
        <div className="container-fluid">

            {/* Page Header */}
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <div className="page-title-right">
                            <Link
                                to="/roles"
                                className="btn btn-secondary"
                            >
                                <i className="ri-arrow-left-line me-1" />
                                Back
                            </Link>
                        </div>

                        <h4 className="page-title">
                            {isEditMode
                                ? "Edit Role"
                                : "Create Role"}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="row">
                <div className="col-lg-8">

                    <div className="card">
                        <div className="card-body">

                            <h4 className="header-title mb-3">
                                Role Information
                            </h4>

                            {/* System Role Notice */}
                            {isSystemRole && (
                                <div className="alert alert-info">
                                    <i className="ri-information-line me-1" />

                                    This is a system role.
                                    Its slug cannot be
                                    changed or deleted.
                                </div>
                            )}

                            {/* Submit Error */}
                            {submitError && (
                                <div className="alert alert-danger">
                                    <i className="ri-error-warning-line me-1" />
                                    {submitError}
                                </div>
                            )}

                            {/* Success */}
                            {successMessage && (
                                <div className="alert alert-success">
                                    <i className="ri-check-line me-1" />
                                    {successMessage}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {/* Role Name */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="name"
                                        className="form-label"
                                    >
                                        Role Name
                                        <span className="text-danger">
                                            {" "}
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className={`form-control ${
                                            errors.name
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="e.g. School Admin"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleNameChange
                                        }
                                        maxLength={100}
                                        disabled={
                                            isSubmitting
                                        }
                                    />

                                    {errors.name && (
                                        <div className="invalid-feedback">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                {/* Slug */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="slug"
                                        className="form-label"
                                    >
                                        Role Slug
                                        <span className="text-danger">
                                            {" "}
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        className={`form-control ${
                                            errors.slug
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="e.g. school-admin"
                                        value={
                                            formData.slug
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={100}
                                        disabled={
                                            isSubmitting ||
                                            isSystemRole
                                        }
                                    />

                                    {errors.slug ? (
                                        <div className="invalid-feedback">
                                            {errors.slug}
                                        </div>
                                    ) : (
                                        <small className="text-muted">
                                            Use lowercase
                                            letters,
                                            numbers,
                                            hyphens or
                                            underscores.
                                        </small>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="description"
                                        className="form-label"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className={`form-control ${
                                            errors.description
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="Enter role description..."
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={500}
                                        disabled={
                                            isSubmitting
                                        }
                                    />

                                    {errors.description && (
                                        <div className="invalid-feedback">
                                            {
                                                errors.description
                                            }
                                        </div>
                                    )}

                                    <small className="text-muted">
                                        {
                                            formData
                                                .description
                                                .length
                                        }
                                        /500
                                    </small>
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <label
                                        htmlFor="status"
                                        className="form-label"
                                    >
                                        Status
                                        <span className="text-danger">
                                            {" "}
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        className={`form-select ${
                                            errors.status
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    {errors.status && (
                                        <div className="invalid-feedback">
                                            {errors.status}
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            isSubmitting
                                        }
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-1"
                                                    role="status"
                                                />

                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-save-line me-1" />

                                                {isEditMode
                                                    ? "Update Role"
                                                    : "Create Role"}
                                            </>
                                        )}
                                    </button>

                                    <Link
                                        to="/roles"
                                        className="btn btn-light"
                                    >
                                        Cancel
                                    </Link>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Information */}
                <div className="col-lg-4">

                    <div className="card">
                        <div className="card-body">

                            <h4 className="header-title">
                                Role Information
                            </h4>

                            <p className="text-muted">
                                Roles determine which
                                permissions can be assigned
                                to users in the school
                                management system.
                            </p>

                            <hr />

                            <div className="mb-3">
                                <strong>
                                    Role Name
                                </strong>

                                <p className="text-muted mb-0">
                                    Human-readable name of
                                    the role.
                                </p>
                            </div>

                            <div className="mb-3">
                                <strong>
                                    Role Slug
                                </strong>

                                <p className="text-muted mb-0">
                                    Unique identifier used
                                    internally by the system.
                                </p>
                            </div>

                            <div className="mb-3">
                                <strong>
                                    Status
                                </strong>

                                <p className="text-muted mb-0">
                                    Inactive roles should not
                                    be assigned to new users.
                                </p>
                            </div>

                            {isSystemRole && (
                                <div className="alert alert-warning mb-0">
                                    <strong>
                                        System Role
                                    </strong>

                                    <p className="mb-0 mt-1">
                                        System roles are
                                        protected and cannot
                                        be deleted.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RoleForm;