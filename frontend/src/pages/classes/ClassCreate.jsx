import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    useCreateTeacherMutation,
} from "../../features/teachers/teachersApi";

import TeacherForm from "./TeacherForm";

const TeacherCreate = () => {
    const navigate = useNavigate();

    const [
        createTeacher,
        { isLoading },
    ] = useCreateTeacherMutation();

    const handleSubmit = async (formData) => {
        try {
            const result =
                await createTeacher(formData).unwrap();

            const teacher =
                result?.teacher ||
                result?.data ||
                result;

            navigate(
                `/teachers/${teacher?._id}`
            );
        } catch (error) {
            console.error(
                "Create teacher error:",
                error
            );

            alert(
                error?.data?.message ||
                    "Unable to create teacher."
            );
        }
    };

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

                        <li className="breadcrumb-item active">
                            Add Teacher
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Add Teacher
                </h4>
            </div>

            <TeacherForm
                onSubmit={handleSubmit}
                loading={isLoading}
                submitText="Save Teacher"
            />
        </>
    );
};

export default TeacherCreate;