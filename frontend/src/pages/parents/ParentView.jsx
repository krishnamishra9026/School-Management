import React from "react";
import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useGetParentQuery,
} from "../../features/parents/parentsApi";

const ParentView = () => {
    const { id } = useParams();

    const {
        data,
        isLoading,
        isError,
    } = useGetParentQuery(id);

    if (isLoading) {
        return (
            <div className="text-center p-4">
                Loading parent...
            </div>
        );
    }

    if (isError || !data?.parent) {
        return (
            <div className="alert alert-danger">
                Parent not found.
            </div>
        );
    }

    const parent = data.parent;

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <Link
                        to="/parents"
                        className="btn btn-light"
                    >
                        Back
                    </Link>
                </div>

                <h4 className="page-title">
                    Parent Details
                </h4>
            </div>

            <div className="card">
                <div className="card-body">
                    <h4>
                        {parent.firstName}{" "}
                        {parent.lastName}
                    </h4>

                    <hr />

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <strong>
                                User:
                            </strong>

                            <div>
                                {parent.userId
                                    ?.name ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <strong>
                                Email:
                            </strong>

                            <div>
                                {parent.userId
                                    ?.email ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <strong>
                                Phone:
                            </strong>

                            <div>
                                {parent.phone ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <strong>
                                Relationship:
                            </strong>

                            <div>
                                {parent.relationship ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <strong>
                                Occupation:
                            </strong>

                            <div>
                                {parent.occupation ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <strong>
                                Status:
                            </strong>

                            <div>
                                {parent.status ||
                                    "-"}
                            </div>
                        </div>

                        <div className="col-md-12 mb-3">
                            <strong>
                                Address:
                            </strong>

                            <div>
                                {parent.address ||
                                    "-"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ParentView;