import React from "react";
import { useNavigate } from "react-router-dom";

import ParentForm from "./ParentForm";

import {
    useCreateParentMutation,
} from "../../features/parents/parentsApi";

const ParentCreate = () => {
    const navigate = useNavigate();

    const [
        createParent,
        { isLoading },
    ] = useCreateParentMutation();

    const handleSubmit = async (
        formData
    ) => {
        try {
            await createParent(
                formData
            ).unwrap();

            navigate("/parents");
        } catch (error) {
            console.error(error);

            alert(
                error?.data?.message ||
                    "Unable to create parent."
            );
        }
    };

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <button
                        className="btn btn-light"
                        onClick={() =>
                            navigate(
                                "/parents"
                            )
                        }
                    >
                        Back
                    </button>
                </div>

                <h4 className="page-title">
                    Add Parent
                </h4>
            </div>

            <div className="card">
                <div className="card-body">
                    <ParentForm
                        onSubmit={
                            handleSubmit
                        }
                        loading={
                            isLoading
                        }
                        submitText="Save Parent"
                    />
                </div>
            </div>
        </>
    );
};

export default ParentCreate;