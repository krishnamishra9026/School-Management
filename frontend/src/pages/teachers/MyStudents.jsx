import React from "react";

import { useGetMyPanelQuery } from "../../features/teachers/teachersApi";
import TeacherStudentsTable from "./TeacherStudentsTable";

const MyStudents = () => {
    const { data, isLoading, isError, error } = useGetMyPanelQuery();

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-danger mt-3">
                {error?.data?.message || "Unable to load students."}
            </div>
        );
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">My Students</h4>
                    </div>
                </div>
            </div>

            <TeacherStudentsTable
                classes={data?.classes || []}
                title="Students in My Classes"
            />
        </>
    );
};

export default MyStudents;
