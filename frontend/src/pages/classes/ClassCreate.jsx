import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    useCreateClassMutation,
} from "../../features/classes/classesApi";

import ClassForm from "./ClassForm";

const ClassCreate = () => {
    const navigate = useNavigate();

    const [
        createClass,
        { isLoading },
    ] = useCreateClassMutation();

    const handleSubmit = async (formData) => {
        try {
            const result =
                await createClass(formData).unwrap();

            const teacher =
                result?.teacher ||
                result?.data ||
                result;

            navigate(
                `/classes/${teacher?._id}`
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
                            <Link to="/classes">
                                Classs
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            Add Class
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Add Class
                </h4>
            </div>

            <ClassForm
                onSubmit={handleSubmit}
                loading={isLoading}
                submitText="Save Class"
            />
        </>
    );
};

export default ClassCreate;