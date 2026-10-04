import React from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ParentStudentForm from "./ParentStudentForm";

import {
    useGetParentStudentQuery,
    useUpdateParentStudentMutation,
} from "../../features/parentStudents/parentStudentsApi";

const ParentStudentEdit =
    () => {
        const { id } =
            useParams();

        const navigate =
            useNavigate();

        const {
            data,
            isLoading:
                isFetching,
        } =
            useGetParentStudentQuery(
                id
            );

        const [
            updateParentStudent,
            {
                isLoading:
                    isUpdating,
            },
        ] =
            useUpdateParentStudentMutation();

        const relationshipData =
            data?.parentStudent;

        const handleSubmit =
            async (formData) => {
                try {
                    await updateParentStudent(
                        {
                            id,
                            ...formData,
                        }
                    ).unwrap();

                    navigate(
                        "/parent-students"
                    );
                } catch (error) {
                    alert(
                        error?.data
                            ?.message ||
                            "Unable to update relationship."
                    );
                }
            };

        if (isFetching) {
            return (
                <div className="text-center p-4">
                    Loading...
                </div>
            );
        }

        if (
            !relationshipData
        ) {
            return (
                <div className="alert alert-danger">
                    Relationship not
                    found.
                </div>
            );
        }

        return (
            <>
                <div className="page-title-box">
                    <h4 className="page-title">
                        Edit Parent
                        Student
                        Relationship
                    </h4>
                </div>

                <div className="card">
                    <div className="card-body">
                        <ParentStudentForm
                            relationshipData={
                                relationshipData
                            }
                            onSubmit={
                                handleSubmit
                            }
                            loading={
                                isUpdating
                            }
                            submitText="Update Relationship"
                        />
                    </div>
                </div>
            </>
        );
    };

export default ParentStudentEdit;