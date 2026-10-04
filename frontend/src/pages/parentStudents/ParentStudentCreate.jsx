import React from "react";

import {
    useNavigate,
} from "react-router-dom";

import ParentStudentForm from "./ParentStudentForm";

import {
    useCreateParentStudentMutation,
} from "../../features/parentStudents/parentStudentsApi";

const ParentStudentCreate =
    () => {
        const navigate =
            useNavigate();

        const [
            createParentStudent,
            {
                isLoading,
            },
        ] =
            useCreateParentStudentMutation();

        const handleSubmit =
            async (formData) => {
                try {
                    await createParentStudent(
                        formData
                    ).unwrap();

                    navigate(
                        "/parent-students"
                    );
                } catch (error) {
                    alert(
                        error?.data
                            ?.message ||
                            "Unable to link student."
                    );
                }
            };

        return (
            <>
                <div className="page-title-box">
                    <h4 className="page-title">
                        Link Student to Parent
                    </h4>
                </div>

                <div className="card">
                    <div className="card-body">
                        <ParentStudentForm
                            onSubmit={
                                handleSubmit
                            }
                            loading={
                                isLoading
                            }
                            submitText="Link Student"
                        />
                    </div>
                </div>
            </>
        );
    };

export default ParentStudentCreate;