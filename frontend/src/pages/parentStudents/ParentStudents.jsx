import React from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useGetParentStudentsQuery,
    useDeleteParentStudentMutation,
} from "../../features/parentStudents/parentStudentsApi";

const ParentStudents = () => {
    const navigate =
        useNavigate();

    const {
        data,
        isLoading,
        isError,
    } = useGetParentStudentsQuery({});

    const [
        deleteParentStudent,
        {
            isLoading:
                isDeleting,
        },
    ] =
        useDeleteParentStudentMutation();

    const relationships =
        data?.parentStudents ||
        [];

    const handleDelete = async (
        id
    ) => {
        if (
            !window.confirm(
                "Remove this student from the parent?"
            )
        ) {
            return;
        }

        try {
            await deleteParentStudent(
                id
            ).unwrap();
        } catch (error) {
            alert(
                error?.data?.message ||
                    "Unable to remove relationship."
            );
        }
    };

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <Link
                        to="/parent-students/create"
                        className="btn btn-primary"
                    >
                        <i className="ri-add-line me-1" />
                        Link Student
                    </Link>
                </div>

                <h4 className="page-title">
                    Parent Students
                </h4>
            </div>

            <div className="card">
                <div className="card-body">
                    {isLoading && (
                        <div className="text-center p-4">
                            Loading...
                        </div>
                    )}

                    {isError && (
                        <div className="alert alert-danger">
                            Unable to load
                            relationships.
                        </div>
                    )}

                    {!isLoading &&
                        !isError &&
                        relationships.length ===
                            0 && (
                            <div className="text-center p-4">
                                No parent-student
                                relationships
                                found.
                            </div>
                        )}

                    {!isLoading &&
                        !isError &&
                        relationships.length >
                            0 && (
                            <div className="table-responsive">
                                <table className="table table-centered table-nowrap">
                                    <thead>
                                        <tr>
                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Parent
                                            </th>

                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Admission No.
                                            </th>

                                            <th>
                                                Class
                                            </th>

                                            <th>
                                                Relationship
                                            </th>

                                            <th>
                                                Primary
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {relationships.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        item._id
                                                    }
                                                >
                                                    <td>
                                                        {index +
                                                            1}
                                                    </td>

                                                    <td>
                                                        {
                                                            item
                                                                .parentId
                                                                ?.firstName
                                                        }{" "}
                                                        {
                                                            item
                                                                .parentId
                                                                ?.lastName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item
                                                                .studentId
                                                                ?.firstName
                                                        }{" "}
                                                        {
                                                            item
                                                                .studentId
                                                                ?.lastName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item
                                                                .studentId
                                                                ?.admissionNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item
                                                                .studentId
                                                                ?.className
                                                        }{" "}
                                                        {
                                                            item
                                                                .studentId
                                                                ?.section
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.relationship
                                                        }
                                                    </td>

                                                    <td>
                                                        {item.isPrimary ? (
                                                            <span className="badge bg-primary">
                                                                Yes
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-light text-dark">
                                                                No
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.status ===
                                                                "active"
                                                                    ? "bg-success"
                                                                    : "bg-danger"
                                                            }`}
                                                        >
                                                            {
                                                                item.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/parent-students/${item._id}/edit`
                                                                    )
                                                                }
                                                            >
                                                                <i className="ri-edit-line" />
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                disabled={
                                                                    isDeleting
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item._id
                                                                    )
                                                                }
                                                            >
                                                                <i className="ri-delete-bin-line" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>
            </div>
        </>
    );
};

export default ParentStudents;