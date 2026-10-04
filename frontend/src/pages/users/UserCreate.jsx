import React from "react";
import { Link, useNavigate } from "react-router-dom";

import UserForm from "./UserForm";
import { useCreateUserMutation } from "../../features/users/usersApi";

const UserCreate = () => {
    const navigate = useNavigate();

    const [createUser, { isLoading }] =
        useCreateUserMutation();

    const handleSubmit = async (formData) => {
        try {
            await createUser(formData).unwrap();

            navigate("/users");
        } catch (error) {
            console.error("Create user error:", error);

            alert(
                error?.data?.message ||
                    "Unable to create user."
            );
        }
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-12">
                    <div className="page-title-box">
                        <div className="page-title-right">
                            <Link
                                to="/users"
                                className="btn btn-secondary"
                            >
                                <i className="ri-arrow-left-line me-1" />
                                Back
                            </Link>
                        </div>

                        <h4 className="page-title">
                            Add User
                        </h4>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h4 className="header-title mb-3">
                        User Information
                    </h4>

                    <UserForm
                        onSubmit={handleSubmit}
                        loading={isLoading}
                        submitText="Create User"
                    />
                </div>
            </div>
        </>
    );
};

export default UserCreate;