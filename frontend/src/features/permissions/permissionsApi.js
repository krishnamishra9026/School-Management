import {
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const permissionsApi =
    createApi({
        reducerPath:
            "permissionsApi",

        baseQuery:
            fetchBaseQuery({
                baseUrl:
                    "http://localhost:5000/api",

                prepareHeaders: (
                    headers
                ) => {
                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    if (token) {
                        headers.set(
                            "Authorization",
                            `Bearer ${token}`
                        );
                    }

                    headers.set(
                        "Content-Type",
                        "application/json"
                    );

                    return headers;
                },
            }),

        tagTypes: ["Permissions"],

        endpoints: (builder) => ({
            getPermissions:
                builder.query({
                    query: ({
                        page = 1,
                        limit = 200,
                        search = "",
                        module = "",
                        status = "active",
                    } = {}) => ({
                        url: "/permissions",
                        params: {
                            page,
                            limit,
                            search,
                            module,
                            status,
                        },
                    }),

                    providesTags: [
                        "Permissions",
                    ],
                }),

            getPermission:
                builder.query({
                    query: (id) =>
                        `/permissions/${id}`,

                    providesTags: (
                        result,
                        error,
                        id
                    ) => [
                        {
                            type: "Permissions",
                            id,
                        },
                    ],
                }),

            createPermission:
                builder.mutation({
                    query: (data) => ({
                        url: "/permissions",
                        method: "POST",
                        body: data,
                    }),

                    invalidatesTags: [
                        "Permissions",
                    ],
                }),

            updatePermission:
                builder.mutation({
                    query: ({
                        id,
                        ...data
                    }) => ({
                        url: `/permissions/${id}`,
                        method: "PUT",
                        body: data,
                    }),

                    invalidatesTags: [
                        "Permissions",
                    ],
                }),

            deletePermission:
                builder.mutation({
                    query: (id) => ({
                        url: `/permissions/${id}`,
                        method: "DELETE",
                    }),

                    invalidatesTags: [
                        "Permissions",
                    ],
                }),
        }),
    });

export const {
    useGetPermissionsQuery,
    useGetPermissionQuery,
    useCreatePermissionMutation,
    useUpdatePermissionMutation,
    useDeletePermissionMutation,
} = permissionsApi;