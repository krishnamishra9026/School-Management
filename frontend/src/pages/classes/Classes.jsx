import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
    useGetClassesQuery,
    useCreateClassMutation,
    useDeleteClassMutation,
} from "../../features/classes/classesApi";

const initialForm = {
    name: "",
    grade: "",
    section: "",
    academicYear: "2026-2027",
    room: "",
    capacity: 40,
    status: "active",
};

const Classes = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetClassesQuery({
        search,
        status,
    });

    const [createClass, { isLoading: isCreating }] =
        useCreateClassMutation();

    const [deleteClass] = useDeleteClassMutation();

    const classes = data?.classes || [];

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const payload = {
                ...form,
                capacity: Number(form.capacity),
            };

            if (editingId) {
                // Add useUpdateClassMutation if you
                // enable editing in this form.
                return;
            }

            await createClass(payload).unwrap();

            setMessage("Class created successfully.");
            resetForm();
        } catch (err) {
            setMessage(
                err?.data?.message ||
                "Unable to save class."
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(
            "Are you sure you want to delete this class?"
        )) {
            return;
        }

        setMessage("");

        try {
            await deleteClass(id).unwrap();
            setMessage("Class deleted successfully.");
        } catch (err) {
            setMessage(
                err?.data?.message ||
                "Unable to delete class."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="container-fluid p-4">
                <p>Loading classes...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    {error?.data?.message ||
                        "Failed to load classes."}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between
                align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Classes</h4>
                    <p className="text-muted mb-0">
                        Manage classes, students and teachers.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        setForm(initialForm);
                        setShowForm((value) => !value);
                    }}
                >
                    <i className="uil uil-plus me-1" />
                    Add Class
                </button>
            </div>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">
                            Create Class
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Class Name
                                    </label>
                                    <input
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Class 10 - A"
                                        required
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">
                                        Grade
                                    </label>
                                    <input
                                        name="grade"
                                        className="form-control"
                                        value={form.grade}
                                        onChange={handleChange}
                                        placeholder="10"
                                        required
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">
                                        Section
                                    </label>
                                    <input
                                        name="section"
                                        className="form-control"
                                        value={form.section}
                                        onChange={handleChange}
                                        placeholder="A"
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Academic Year
                                    </label>
                                    <input
                                        name="academicYear"
                                        className="form-control"
                                        value={form.academicYear}
                                        onChange={handleChange}
                                        placeholder="2026-2027"
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Room
                                    </label>
                                    <input
                                        name="room"
                                        className="form-control"
                                        value={form.room}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Capacity
                                    </label>
                                    <input
                                        name="capacity"
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={form.capacity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={form.status}
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

                            <div className="mt-3 d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isCreating}
                                >
                                    {isCreating
                                        ? "Saving..."
                                        : "Save Class"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className="row g-2 mb-3">
                        <div className="col-md-6">
                            <input
                                className="form-control"
                                placeholder="Search class, grade, section..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">
                                    All statuses
                                </option>
                                <option value="active">
                                    Active
                                </option>
                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-centered
                            table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Academic Year</th>
                                    <th>Room</th>
                                    <th>Students</th>
                                    <th>Class Teacher</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {classes.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <strong>
                                                {item.name}
                                            </strong>
                                            <div className="text-muted">
                                                Grade {item.grade}
                                                {" - "}
                                                Section {item.section}
                                            </div>
                                        </td>

                                        <td>{item.academicYear}</td>
                                        <td>{item.room || "-"}</td>

                                        <td>
                                            {item.students?.length || 0}
                                            {" / "}
                                            {item.capacity}
                                        </td>

                                        <td>
                                            {item.classTeacher?.name ||
                                                item.classTeacher?.userId?.name ||
                                                "Not assigned"}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${
                                                    item.status === "active"
                                                        ? "bg-success"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>
                                            <Link
                                                to={`/classes/${item._id}`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                            >
                                                View / Assign
                                            </Link>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(item._id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {classes.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-4"
                                        >
                                            No classes found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-muted mt-3">
                        Total classes: {data?.pagination?.total ?? classes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Classes;