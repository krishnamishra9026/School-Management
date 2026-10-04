import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import UserForm from "./UserForm";

import {
    useGetUserQuery,
    useUpdateUserMutation,
} from "../../features/users/usersApi";

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading: isUserLoading,
        isError,
    } = useGetUserQuery(id);

    const [updateUser, { isLoading: isUpdating }] =
        useUpdateUserMutation();

    const user = data?.user || data;

    const handleSubmit = async (formData) => {
        try {
            await updateUser({
                id,
                ...formData,
            }).unwrap();

            navigate(`/users/${id}`);
        } catch (error) {
            console.error("Update user error:", error);

            alert(
                error?.data?.message ||
                    "Unable to update user."
            );
        }
    };

    if (isUserLoading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border text-primary"
                    role="status"
                />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="alert alert-danger">
                User not found.
            </div>
        );
    }

    return (
        <>
            <div className="row mb-3">
                <div className="col-12">
                    <div className="page-title-box">
                        <div className="page-title-right">
                            <Link
                                to={`/users/${id}`}
                                className="btn btn-secondary"
                            >
                                <i className="ri-arrow-left-line me-1" />
                                Back
                            </Link>
                        </div>

                        <h4 className="page-title">
                            Edit User
                        </h4>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h4 className="header-title mb-3">
                        Edit User Information
                    </h4>

                    <UserForm
                        user={user}
                        onSubmit={handleSubmit}
                        loading={isUpdating}
                        submitText="Update User"
                    />
                </div>
            </div>
        </>
    );
};

export default UserEdit;