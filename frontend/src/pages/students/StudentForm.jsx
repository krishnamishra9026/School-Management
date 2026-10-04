import React, { useEffect, useState } from "react";

const defaultForm = {
    admissionNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    className: "",
    section: "",
    rollNumber: "",
    fatherName: "",
    motherName: "",
    address: "",
};

const StudentForm = ({
    student = null,
    onSubmit,
    loading = false,
    submitText = "Save Student",
}) => {
    const [form, setForm] = useState(defaultForm);

    useEffect(() => {
        if (student) {
            setForm({
                admissionNumber:
                    student.admissionNumber || "",

                firstName:
                    student.firstName || "",

                lastName:
                    student.lastName || "",

                gender:
                    student.gender || "",

                dateOfBirth:
                    student.dateOfBirth
                        ? student.dateOfBirth.substring(0, 10)
                        : "",

                email:
                    student.email || "",

                phone:
                    student.phone || "",

                className:
                    student.className || "",

                section:
                    student.section || "",

                rollNumber:
                    student.rollNumber || "",

                fatherName:
                    student.fatherName || "",

                motherName:
                    student.motherName || "",

                address:
                    student.address || "",
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit}>

            {/* Student Information */}
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        Student Information
                    </h5>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Admission Number
                                <span className="text-danger">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="admissionNumber"
                                className="form-control"
                                value={
                                    form.admissionNumber
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                First Name
                                <span className="text-danger">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                className="form-control"
                                value={
                                    form.firstName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                className="form-control"
                                value={
                                    form.lastName
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Gender
                            </label>

                            <select
                                name="gender"
                                className="form-select"
                                value={form.gender}
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Select Gender
                                </option>

                                <option value="male">
                                    Male
                                </option>

                                <option value="female">
                                    Female
                                </option>

                                <option value="other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dateOfBirth"
                                className="form-control"
                                value={
                                    form.dateOfBirth
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                value={form.phone}
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={form.email}
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Academic Information */}
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        Academic Information
                    </h5>
                </div>

                <div className="card-body">

                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Class
                            </label>

                            <select
                                name="className"
                                className="form-select"
                                value={
                                    form.className
                                }
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Select Class
                                </option>

                                <option value="Nursery">
                                    Nursery
                                </option>

                                <option value="LKG">
                                    LKG
                                </option>

                                <option value="UKG">
                                    UKG
                                </option>

                                <option value="Class 1">
                                    Class 1
                                </option>

                                <option value="Class 2">
                                    Class 2
                                </option>

                                <option value="Class 3">
                                    Class 3
                                </option>

                                <option value="Class 4">
                                    Class 4
                                </option>

                                <option value="Class 5">
                                    Class 5
                                </option>

                                <option value="Class 6">
                                    Class 6
                                </option>

                                <option value="Class 7">
                                    Class 7
                                </option>

                                <option value="Class 8">
                                    Class 8
                                </option>

                                <option value="Class 9">
                                    Class 9
                                </option>

                                <option value="Class 10">
                                    Class 10
                                </option>

                                <option value="Class 11">
                                    Class 11
                                </option>

                                <option value="Class 12">
                                    Class 12
                                </option>
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Section
                            </label>

                            <select
                                name="section"
                                className="form-select"
                                value={form.section}
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Select Section
                                </option>

                                <option value="A">
                                    A
                                </option>

                                <option value="B">
                                    B
                                </option>

                                <option value="C">
                                    C
                                </option>

                                <option value="D">
                                    D
                                </option>
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Roll Number
                            </label>

                            <input
                                type="text"
                                name="rollNumber"
                                className="form-control"
                                value={
                                    form.rollNumber
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                    </div>

                </div>
            </div>

            {/* Parent Information */}
            <div className="card mb-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        Parent Information
                    </h5>
                </div>

                <div className="card-body">

                    <div className="row">

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Father's Name
                            </label>

                            <input
                                type="text"
                                name="fatherName"
                                className="form-control"
                                value={
                                    form.fatherName
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Mother's Name
                            </label>

                            <input
                                type="text"
                                name="motherName"
                                className="form-control"
                                value={
                                    form.motherName
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="form-label">
                                Address
                            </label>

                            <textarea
                                name="address"
                                rows="3"
                                className="form-control"
                                value={
                                    form.address
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                    </div>

                </div>
            </div>

            {/* Buttons */}
            <div className="card">
                <div className="card-body">

                    <div className="d-flex justify-content-end gap-2">

                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() =>
                                window.history.back()
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm me-1" />
                            )}

                            {submitText}
                        </button>

                    </div>

                </div>
            </div>

        </form>
    );
};

export default StudentForm;