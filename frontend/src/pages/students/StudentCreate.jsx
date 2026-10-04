import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    useCreateStudentMutation,
} from "../../features/students/studentsApi";

import StudentForm from "./StudentForm";

const StudentCreate = () => {
    const navigate = useNavigate();

    const [
        createStudent,
        { isLoading },
    ] = useCreateStudentMutation();

    const handleSubmit = async (formData) => {
        try {
            const result = await createStudent(formData).unwrap();

            const student =
                result?.student ||
                result?.data ||
                result;

            navigate(
                `/students/${student?._id}`
            );
        } catch (error) {
            console.error(
                "Create student error:",
                error
            );

            alert(
                error?.data?.message ||
                    "Unable to create student."
            );
        }
    };

    return (
        <>
            {/* Page Title */}
            <div className="page-title-box">
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li className="breadcrumb-item">
                            <Link to="/students">
                                Students
                            </Link>
                        </li>

                        <li className="breadcrumb-item active">
                            Add Student
                        </li>
                    </ol>
                </div>

                <h4 className="page-title">
                    Add Student
                </h4>
            </div>

            {/* Student Form */}
            <div className="row">
                <div className="col-12">
                    <StudentForm
                        student={null}
                        onSubmit={handleSubmit}
                        loading={isLoading}
                        submitText="Save Student"
                    />
                </div>
            </div>
        </>
    );
};

export default StudentCreate;