import React, {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useGetParentsQuery,
    useDeleteParentMutation,
} from "../../features/parents/parentsApi";

const Parents = () => {
    const navigate = useNavigate();

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [limit, setLimit] =
        useState(10);

    const [
        deleteParent,
        {
            isLoading:
                isDeleting,
        },
    ] = useDeleteParentMutation();

    const {
        data,
        isLoading,
        isError,
    } = useGetParentsQuery({
        page,
        limit,
        search,
        status,
    });

    const parents =
        data?.parents || [];

    const pagination =
        data?.pagination || {};

    const handleDelete = async (
        id
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this parent profile?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteParent(
                id
            ).unwrap();
        } catch (error) {
            alert(
                error?.data?.message ||
                    "Unable to delete parent."
            );
        }
    };

    return (
        <>
            <div className="page-title-box">
                <div className="page-title-right">
                    <Link
                        to="/parents/create"
                        className="btn btn-primary"
                    >
                        <i className="ri-add-line me-1" />
                        Add Parent
                    </Link>
                </div>

                <h4 className="page-title">
                    Parents
                </h4>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search parent..."
                                value={
                                    search
                                }
                                onChange={(
                                    e
                                ) => {
                                    setSearch(
                                        e.target
                                            .value
                                    );
                                    setPage(
                                        1
                                    );
                                }}
                            />
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={
                                    status
                                }
                                onChange={(
                                    e
                                ) => {
                                    setStatus(
                                        e.target
                                            .value
                                    );
                                    setPage(
                                        1
                                    );
                                }}
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={
                                    limit
                                }
                                onChange={(
                                    e
                                ) => {
                                    setLimit(
                                        Number(
                                            e.target
                                                .value
                                        )
                                    );
                                    setPage(
                                        1
                                    );
                                }}
                            >
                                <option value="10">
                                    10
                                </option>

                                <option value="25">
                                    25
                                </option>

                                <option value="50">
                                    50
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-body">
                    {isLoading && (
                        <div className="text-center p-4">
                            Loading parents...
                        </div>
                    )}

                    {isError && (
                        <div className="alert alert-danger">
                            Unable to load
                            parents.
                        </div>
                    )}

                    {!isLoading &&
                        !isError &&
                        parents.length ===
                            0 && (
                            <div className="text-center p-4">
                                No parents
                                found.
                            </div>
                        )}

                    {!isLoading &&
                        !isError &&
                        parents.length >
                            0 && (
                            <div className="table-responsive">
                                <table className="table table-centered table-nowrap mb-0">
                                    <thead>
                                        <tr>
                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Parent
                                            </th>

                                            <th>
                                                User
                                            </th>

                                            <th>
                                                Phone
                                            </th>

                                            <th>
                                                Relationship
                                            </th>

                                            <th>
                                                Occupation
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
                                        {parents.map(
                                            (
                                                parent,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        parent._id
                                                    }
                                                >
                                                    <td>
                                                        {(page -
                                                            1) *
                                                            limit +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                parent.firstName
                                                            }{" "}
                                                            {
                                                                parent.lastName
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            parent
                                                                .userId
                                                                ?.email
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            parent.phone
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            parent.relationship
                                                        }
                                                    </td>

                                                    <td>
                                                        {parent.occupation ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                parent.status ===
                                                                "active"
                                                                    ? "bg-success"
                                                                    : "bg-danger"
                                                            }`}
                                                        >
                                                            {
                                                                parent.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <button
                                                                className="btn btn-sm btn-info"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/parents/${parent._id}`
                                                                    )
                                                                }
                                                            >
                                                                <i className="ri-eye-line" />
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/parents/${parent._id}/edit`
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
                                                                        parent._id
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

                    {/* Pagination */}
                    {pagination.totalPages >
                        1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                Showing page{" "}
                                {
                                    pagination.page
                                }{" "}
                                of{" "}
                                {
                                    pagination.totalPages
                                }
                            </div>

                            <div className="btn-group">
                                <button
                                    className="btn btn-light"
                                    disabled={
                                        page <=
                                        1
                                    }
                                    onClick={() =>
                                        setPage(
                                            page -
                                                1
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                <button
                                    className="btn btn-light"
                                    disabled={
                                        page >=
                                        pagination.totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            page +
                                                1
                                        )
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Parents;