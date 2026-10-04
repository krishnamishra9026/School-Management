import {
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const rolesApi = createApi({
    reducerPath: "rolesApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api",

        prepareHeaders: (headers) => {
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

    tagTypes: [
        "Roles",
        "RolePermissions",
    ],

    endpoints: (builder) => ({

        getAllRoles: builder.query({
            query: () => "/roles/all",
            providesTags: ["Roles"],
        }), 

        getRoles: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                status = "",
            } = {}) => ({
                url: "/roles",
                params: {
                    page,
                    limit,
                    search,
                    status,
                },
            }),

            providesTags: ["Roles"],
        }),

        getRole: builder.query({
            query: (id) =>
                `/roles/${id}`,

            providesTags: (
                result,
                error,
                id
            ) => [
                {
                    type: "Roles",
                    id,
                },
            ],
        }),

        createRole: builder.mutation({
            query: (data) => ({
                url: "/roles",
                method: "POST",
                body: data,
            }),

            invalidatesTags: ["Roles"],
        }),

        updateRole: builder.mutation({
            query: ({
                id,
                ...data
            }) => ({
                url: `/roles/${id}`,
                method: "PUT",
                body: data,
            }),

            invalidatesTags: [
                "Roles",
            ],
        }),

        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: [
                "Roles",
            ],
        }),

        getRolePermissions:
            builder.query({
                query: (roleId) =>
                    `/roles/${roleId}/permissions`,

                providesTags: (
                    result,
                    error,
                    roleId
                ) => [
                    {
                        type: "RolePermissions",
                        id: roleId,
                    },
                ],
            }),

        updateRolePermissions:
            builder.mutation({
                query: ({
                    roleId,
                    permissions,
                }) => ({
                    url: `/roles/${roleId}/permissions`,
                    method: "PUT",
                    body: {
                        permissions,
                    },
                }),

                invalidatesTags: (
                    result,
                    error,
                    { roleId }
                ) => [
                    {
                        type: "RolePermissions",
                        id: roleId,
                    },
                ],
            }),
    }),
});

export const {
    useGetAllRolesQuery,
    useGetRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetRolePermissionsQuery,
    useUpdateRolePermissionsMutation,
} = rolesApi;