import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const emptyForm = {
    employeeId: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    alternatePhone: "",
    qualification: "",
    specialization: "",
    experience: "",
    joiningDate: "",
    department: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    status: "active",
};

const TeacherForm = ({
    teacher = null,
    onSubmit,
    loading = false,
    submitText = "Save Teacher",
}) => {
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (teacher) {
            setFormData({
                ...emptyForm,
                ...teacher,

                dateOfBirth: teacher.dateOfBirth
                    ? teacher.dateOfBirth.substring(0, 10)
                    : "",

                joiningDate: teacher.joiningDate
                    ? teacher.joiningDate.substring(0, 10)
                    : "",
            });
        } else {
            setFormData(emptyForm);
        }
    }, [teacher]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (typeof onSubmit !== "function") {
            console.error(
                "TeacherForm: onSubmit prop is missing."
            );
            return;
        }

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>

            {/* Teacher Information */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Teacher Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Employee ID
                                <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                name="employeeId"
                                className="form-control"
                                value={formData.employeeId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                First Name
                                <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                className="form-control"
                                value={formData.firstName}
                                onChange={handleChange}
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
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Gender
                            </label>

                            <select
                                name="gender"
                                className="form-select"
                                value={formData.gender}
                                onChange={handleChange}
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
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Joining Date
                                <span className="text-danger">*</span>
                            </label>

                            <input
                                type="date"
                                name="joiningDate"
                                className="form-control"
                                value={formData.joiningDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Contact Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Phone
                                <span className="text-danger">*</span>
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Alternate Phone
                            </label>

                            <input
                                type="tel"
                                name="alternatePhone"
                                className="form-control"
                                value={formData.alternatePhone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="form-label">
                                Address
                            </label>

                            <textarea
                                name="address"
                                className="form-control"
                                rows="3"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                className="form-control"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                State
                            </label>

                            <input
                                type="text"
                                name="state"
                                className="form-control"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Pincode
                            </label>

                            <input
                                type="text"
                                name="pincode"
                                className="form-control"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Professional Information */}
            <div className="card">
                <div className="card-header">
                    <h4 className="header-title mb-0">
                        Professional Information
                    </h4>
                </div>

                <div className="card-body">
                    <div className="row">

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Qualification
                            </label>

                            <input
                                type="text"
                                name="qualification"
                                className="form-control"
                                placeholder="B.Ed, M.Ed, M.Sc..."
                                value={formData.qualification}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Specialization
                            </label>

                            <input
                                type="text"
                                name="specialization"
                                className="form-control"
                                placeholder="Mathematics, Science..."
                                value={formData.specialization}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Experience
                            </label>

                            <input
                                type="number"
                                name="experience"
                                className="form-control"
                                min="0"
                                value={formData.experience}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                className="form-control"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                Designation
                            </label>

                            <input
                                type="text"
                                name="designation"
                                className="form-control"
                                placeholder="Teacher / Senior Teacher"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
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
                </div>
            </div>

            {/* Buttons */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-end gap-2">

                        <Link
                            to="/teachers"
                            className="btn btn-light"
                        >
                            <i className="mdi mdi-close me-1"></i>
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="mdi mdi-content-save me-1"></i>
                                    {submitText}
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>

        </form>
    );
};

export default TeacherForm;