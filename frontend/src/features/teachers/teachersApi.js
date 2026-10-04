import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teachersApi = createApi({
    reducerPath: "teachersApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api",

        prepareHeaders: (headers, { getState }) => {
          const token = getState().auth.token;

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

    tagTypes: ["Teachers"],

    endpoints: (builder) => ({

        getTeachers: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
            } = {}) => ({
                url: "/teachers",
                params: {
                    page,
                    limit,
                    search,
                },
            }),

            providesTags: ["Teachers"],
        }),

        getTeacher: builder.query({
            query: (id) => `/teachers/${id}`,

            providesTags: (result, error, id) => [
                {
                    type: "Teachers",
                    id,
                },
            ],
        }),

        createTeacher: builder.mutation({
            query: (teacher) => ({
                url: "/teachers",
                method: "POST",
                body: teacher,
            }),

            invalidatesTags: ["Teachers"],
        }),

        updateTeacher: builder.mutation({
            query: ({ id, ...teacher }) => ({
                url: `/teachers/${id}`,
                method: "PUT",
                body: teacher,
            }),

            invalidatesTags: ["Teachers"],
        }),

        deleteTeacher: builder.mutation({
            query: (id) => ({
                url: `/teachers/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: ["Teachers"],
        }),
    }),
});

export const {
    useGetTeachersQuery,
    useGetTeacherQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
} = teachersApi;