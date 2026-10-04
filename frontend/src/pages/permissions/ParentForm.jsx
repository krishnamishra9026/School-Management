import React, {
    useEffect,
    useState,
} from "react";

import { useGetUsersQuery } from "../../features/users/usersApi";

const ParentForm = ({
    parent = null,
    onSubmit,
    loading = false,
    submitText = "Save Parent",
}) => {
    const [formData, setFormData] = useState({
        userId: "",
        firstName: "",
        lastName: "",
        phone: "",
        alternatePhone: "",
        relationship: "father",
        occupation: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        status: "active",
    });

    /*
    |--------------------------------------------------------------------------
    | Load Parent
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (parent) {
            setFormData({
                userId:
                    parent.userId?._id ||
                    parent.userId ||
                    "",

                firstName:
                    parent.firstName || "",

                lastName:
                    parent.lastName || "",

                phone:
                    parent.phone || "",

                alternatePhone:
                    parent.alternatePhone || "",

                relationship:
                    parent.relationship ||
                    "father",

                occupation:
                    parent.occupation || "",

                address:
                    parent.address || "",

                city:
                    parent.city || "",

                state:
                    parent.state || "",

                pincode:
                    parent.pincode || "",

                status:
                    parent.status || "active",
            });
        }
    }, [parent]);

    /*
    |--------------------------------------------------------------------------
    | Parent Users
    |--------------------------------------------------------------------------
    */

    const {
        data: usersData,
        isLoading: usersLoading,
    } = useGetUsersQuery({
        page: 1,
        limit: 100,
        role: "parent",
        status: "active",
    });

    const users = usersData?.users || [];

    /*
    |--------------------------------------------------------------------------
    | Handle Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            typeof onSubmit !==
            "function"
        ) {
            console.error(
                "ParentForm: onSubmit prop is missing."
            );

            return;
        }

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">

                {/* User */}
                <div className="col-md-12 mb-3">
                    <label className="form-label">
                        User{" "}
                        <span className="text-danger">
                            *
                        </span>
                    </label>

                    <select
                        name="userId"
                        value={
                            formData.userId
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                        required
                        disabled={
                            usersLoading ||
                            loading
                        }
                    >
                        <option value="">
                            {usersLoading
                                ? "Loading users..."
                                : "Select Parent User"}
                        </option>

                        {users.map(
                            (user) => (
                                <option
                                    key={
                                        user._id
                                    }
                                    value={
                                        user._id
                                    }
                                >
                                    {user.name} —{" "}
                                    {user.email}
                                </option>
                            )
                        )}
                    </select>

                    {!usersLoading &&
                        users.length ===
                            0 && (
                            <small className="text-danger">
                                No active users
                                with parent role
                                found. Create a
                                Parent user
                                first.
                            </small>
                        )}
                </div>

                {/* First Name */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        First Name *
                    </label>

                    <input
                        type="text"
                        name="firstName"
                        value={
                            formData.firstName
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                        required
                    />
                </div>

                {/* Last Name */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Last Name
                    </label>

                    <input
                        type="text"
                        name="lastName"
                        value={
                            formData.lastName
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Phone *
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={
                            formData.phone
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                        required
                    />
                </div>

                {/* Alternate Phone */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Alternate Phone
                    </label>

                    <input
                        type="text"
                        name="alternatePhone"
                        value={
                            formData.alternatePhone
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* Relationship */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Relationship *
                    </label>

                    <select
                        name="relationship"
                        value={
                            formData.relationship
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                        required
                    >
                        <option value="father">
                            Father
                        </option>

                        <option value="mother">
                            Mother
                        </option>

                        <option value="guardian">
                            Guardian
                        </option>
                    </select>
                </div>

                {/* Occupation */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Occupation
                    </label>

                    <input
                        type="text"
                        name="occupation"
                        value={
                            formData.occupation
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* Address */}
                <div className="col-md-12 mb-3">
                    <label className="form-label">
                        Address
                    </label>

                    <textarea
                        name="address"
                        value={
                            formData.address
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                        rows="3"
                    />
                </div>

                {/* City */}
                <div className="col-md-4 mb-3">
                    <label className="form-label">
                        City
                    </label>

                    <input
                        type="text"
                        name="city"
                        value={
                            formData.city
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* State */}
                <div className="col-md-4 mb-3">
                    <label className="form-label">
                        State
                    </label>

                    <input
                        type="text"
                        name="state"
                        value={
                            formData.state
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* Pincode */}
                <div className="col-md-4 mb-3">
                    <label className="form-label">
                        Pincode
                    </label>

                    <input
                        type="text"
                        name="pincode"
                        value={
                            formData.pincode
                        }
                        onChange={
                            handleChange
                        }
                        className="form-control"
                    />
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Status
                    </label>

                    <select
                        name="status"
                        value={
                            formData.status
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                    >
                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>
                </div>

                {/* Submit */}
                <div className="col-md-12">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                            loading ||
                            usersLoading ||
                            !formData.userId
                        }
                    >
                        {loading
                            ? "Saving..."
                            : submitText}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ParentForm;