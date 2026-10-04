import React from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ParentForm from "./ParentForm";

import {
    useGetParentQuery,
    useUpdateParentMutation,
} from "../../features/parents/parentsApi";

const ParentEdit = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const {
        data,
        isLoading: isFetching,
        isError,
    } = useGetParentQuery(id);

    const [
        updateParent,
        { isLoading: isUpdating },
    ] = useUpdateParentMutation();

    const parent = data?.parent;

    const handleSubmit = async (
        formData
    ) => {
        try {
            await updateParent({
                id,
                ...formData,
            }).unwrap();

            navigate("/parents");
        } catch (error) {
            console.error(error);

            alert(
                error?.data?.message ||
                    "Unable to update parent."
            );
        }
    };

    if (isFetching) {
        return (
            <div className="text-center p-4">
                Loading parent...
            </div>
        );
    }

    if (isError || !parent) {
        return (
            <div className="alert alert-danger">
                Parent not found.
            </div>
        );
    }

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
                    Edit Parent
                </h4>
            </div>

            <div className="card">
                <div className="card-body">
                    <ParentForm
                        parent={parent}
                        onSubmit={
                            handleSubmit
                        }
                        loading={
                            isUpdating
                        }
                        submitText="Update Parent"
                    />
                </div>
            </div>
        </>
    );
};

export default ParentEdit;