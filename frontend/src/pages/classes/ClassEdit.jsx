import React from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useGetClassQuery,
    useUpdateClassMutation,
} from "../../features/classes/classesApi";

import ClassForm from "./ClassForm";

const ClassEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading: isLoadingClass,
        isError,
        error,
    } = useGetClassQuery(id);

    const [
        updateClass,
        { isLoading: isUpdating },
    ] = useUpdateClassMutation();

    const teacher =
        data?.teacher ||
        data?.data ||
        data;

    const handleSubmit = async (formData) => {
        try {
            const result =
                await updateClass({
                    id,
                    ...formData,
                }).unwrap();

            const updatedClass =
                result?.teacher ||
                result?.data ||
                result;

            navigate(
                `/classes/${updatedClass?._id || id}`
            );
        } catch (error) {
            console.error(
                "Update teacher error:",
                error
            );

            alert(
                error?.data?.message ||
                    "Unable to update teacher."
            );
        }
    };

    if (isLoadingClass) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <h5 className="mt-3">
                        Loading Class...
                    </h5>
                </div>
            </div>
        );
    }

    if (isError || !teacher) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="alert alert-danger">
                        {error?.data?.message ||
                            "Class not found."}
                    </div>

                    <Link
                        to="/classes"
                        className="btn btn-secondary"
                    >
                        <i className="mdi mdi-arrow-left me-1"></i>
                        Back to Classs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to="/classes">
                                Classs
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to={`/classes/${id}`}>
                                {teacher.firstName}{" "}
                                {teacher.lastName}
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            Edit
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Edit Class
                </h4>
            </div>

            <ClassForm
                teacher={teacher}
                onSubmit={handleSubmit}
                loading={isUpdating}
                submitText="Update Class"
            />
        </>
    );
};

export default ClassEdit;