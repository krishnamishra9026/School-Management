import React from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useGetTeacherQuery,
    useUpdateTeacherMutation,
} from "../../features/teachers/teachersApi";

import TeacherForm from "./TeacherForm";

const TeacherEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data,
        isLoading: isLoadingTeacher,
        isError,
        error,
    } = useGetTeacherQuery(id);

    const [
        updateTeacher,
        { isLoading: isUpdating },
    ] = useUpdateTeacherMutation();

    const teacher =
        data?.teacher ||
        data?.data ||
        data;

    const handleSubmit = async (formData) => {
        try {
            const result =
                await updateTeacher({
                    id,
                    ...formData,
                }).unwrap();

            const updatedTeacher =
                result?.teacher ||
                result?.data ||
                result;

            navigate(
                `/teachers/${updatedTeacher?._id || id}`
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

    if (isLoadingTeacher) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <h5 className="mt-3">
                        Loading Teacher...
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
                            "Teacher not found."}
                    </div>

                    <Link
                        to="/teachers"
                        className="btn btn-secondary"
                    >
                        <i className="mdi mdi-arrow-left me-1"></i>
                        Back to Teachers
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
                            <Link to="/teachers">
                                Teachers
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to={`/teachers/${id}`}>
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
                    Edit Teacher
                </h4>
            </div>

            <TeacherForm
                teacher={teacher}
                onSubmit={handleSubmit}
                loading={isUpdating}
                submitText="Update Teacher"
            />
        </>
    );
};

export default TeacherEdit;