import React, {
    useEffect,
    useState,
} from "react";

import {
    useGetParentsQuery,
} from "../../features/parents/parentsApi";

import {
    useGetStudentsQuery,
} from "../../features/students/studentsApi";

const ParentStudentForm = ({
    relationshipData = null,
    onSubmit,
    loading = false,
    submitText = "Link Student",
}) => {
    const [formData, setFormData] =
        useState({
            parentId: "",
            studentId: "",
            relationship: "father",
            isPrimary: false,
            status: "active",
        });

    /*
    |--------------------------------------------------------------------------
    | Load Existing Relationship
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (relationshipData) {
            setFormData({
                parentId:
                    relationshipData.parentId
                        ?._id ||
                    relationshipData.parentId ||
                    "",

                studentId:
                    relationshipData.studentId
                        ?._id ||
                    relationshipData.studentId ||
                    "",

                relationship:
                    relationshipData.relationship ||
                    "father",

                isPrimary:
                    relationshipData.isPrimary ||
                    false,

                status:
                    relationshipData.status ||
                    "active",
            });
        }
    }, [relationshipData]);

    /*
    |--------------------------------------------------------------------------
    | Parents
    |--------------------------------------------------------------------------
    */

    const {
        data: parentsData,
        isLoading: parentsLoading,
    } = useGetParentsQuery({
        page: 1,
        limit: 100,
        status: "active",
    });

    /*
    |--------------------------------------------------------------------------
    | Students
    |--------------------------------------------------------------------------
    */

    const {
        data: studentsData,
        isLoading: studentsLoading,
    } = useGetStudentsQuery({
        page: 1,
        limit: 100,
    });

    const parents =
        parentsData?.parents || [];

    const students =
        studentsData?.students || [];

    /*
    |--------------------------------------------------------------------------
    | Change
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData(
            (previous) => ({
                ...previous,

                [name]:
                    type ===
                    "checkbox"
                        ? checked
                        : value,
            })
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (
            typeof onSubmit !==
            "function"
        ) {
            console.error(
                "ParentStudentForm: onSubmit is missing."
            );

            return;
        }

        await onSubmit(formData);
    };

    return (
        <form
            onSubmit={
                handleSubmit
            }
        >
            <div className="row">

                {/* Parent */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Parent{" "}
                        <span className="text-danger">
                            *
                        </span>
                    </label>

                    <select
                        name="parentId"
                        value={
                            formData.parentId
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                        required
                        disabled={
                            parentsLoading ||
                            loading
                        }
                    >
                        <option value="">
                            {parentsLoading
                                ? "Loading parents..."
                                : "Select Parent"}
                        </option>

                        {parents.map(
                            (
                                parent
                            ) => (
                                <option
                                    key={
                                        parent._id
                                    }
                                    value={
                                        parent._id
                                    }
                                >
                                    {
                                        parent.firstName
                                    }{" "}
                                    {
                                        parent.lastName
                                    }{" "}
                                    -{" "}
                                    {
                                        parent.phone
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Student */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Student{" "}
                        <span className="text-danger">
                            *
                        </span>
                    </label>

                    <select
                        name="studentId"
                        value={
                            formData.studentId
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                        required
                        disabled={
                            studentsLoading ||
                            loading
                        }
                    >
                        <option value="">
                            {studentsLoading
                                ? "Loading students..."
                                : "Select Student"}
                        </option>

                        {students.map(
                            (
                                student
                            ) => (
                                <option
                                    key={
                                        student._id
                                    }
                                    value={
                                        student._id
                                    }
                                >
                                    {
                                        student.firstName
                                    }{" "}
                                    {
                                        student.lastName
                                    }{" "}
                                    -{" "}
                                    {
                                        student.admissionNumber
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Relationship */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Relationship *
                    </label>

                    <select
                        name="relationship"
                        value={
                            formData.relationship
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                        required
                    >
                        <option value="father">
                            Father
                        </option>

                        <option value="mother">
                            Mother
                        </option>

                        <option value="guardian">
                            Guardian
                        </option>
                    </select>
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Status
                    </label>

                    <select
                        name="status"
                        value={
                            formData.status
                        }
                        onChange={
                            handleChange
                        }
                        className="form-select"
                    >
                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>
                </div>

                {/* Primary */}
                <div className="col-md-12 mb-3">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="isPrimary"
                            checked={
                                formData.isPrimary
                            }
                            onChange={
                                handleChange
                            }
                            className="form-check-input"
                            id="isPrimary"
                        />

                        <label
                            htmlFor="isPrimary"
                            className="form-check-label"
                        >
                            Primary Parent
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="col-md-12">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                            loading ||
                            parentsLoading ||
                            studentsLoading
                        }
                    >
                        {loading
                            ? "Saving..."
                            : submitText}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ParentStudentForm;