import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
    reducerPath: "usersApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api",

        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            headers.set("Content-Type", "application/json");

            return headers;
        },
    }),

    tagTypes: ["Users"],

    endpoints: (builder) => ({
        // GET USERS
        getUsers: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                role = "",
                status = "",
            } = {}) => ({
                url: "/users",
                params: {
                    page,
                    limit,
                    search,
                    role,
                    status,
                },
            }),

            providesTags: (result) =>
                result?.users
                    ? [
                          ...result.users.map(({ _id }) => ({
                              type: "Users",
                              id: _id,
                          })),
                          { type: "Users", id: "LIST" },
                      ]
                    : [{ type: "Users", id: "LIST" }],
        }),

        // GET SINGLE USER
        getUser: builder.query({
            query: (id) => `/users/${id}`,

            providesTags: (result, error, id) => [
                {
                    type: "Users",
                    id,
                },
            ],
        }),

        // CREATE USER
        createUser: builder.mutation({
            query: (user) => ({
                url: "/users",
                method: "POST",
                body: user,
            }),

            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        // UPDATE USER
        updateUser: builder.mutation({
            query: ({ id, ...user }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: user,
            }),

            invalidatesTags: (result, error, { id }) => [
                { type: "Users", id },
                { type: "Users", id: "LIST" },
            ],
        }),

        // DELETE USER
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApi;