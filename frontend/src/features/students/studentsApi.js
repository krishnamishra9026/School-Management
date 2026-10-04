import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentsApi = createApi({
    reducerPath: "studentsApi",

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

    tagTypes: ["Students"],

    endpoints: (builder) => ({

        getStudents: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
            } = {}) => ({
                url: "/students",
                params: {
                    page,
                    limit,
                    search,
                },
            }),

            providesTags: ["Students"],
        }),

        getStudent: builder.query({
            query: (id) => `/students/${id}`,

            providesTags: (result, error, id) => [
                {
                    type: "Students",
                    id,
                },
            ],
        }),

        createStudent: builder.mutation({
            query: (student) => ({
                url: "/students",
                method: "POST",
                body: student,
            }),

            invalidatesTags: ["Students"],
        }),

        updateStudent: builder.mutation({
            query: ({ id, ...student }) => ({
                url: `/students/${id}`,
                method: "PUT",
                body: student,
            }),

            invalidatesTags: ["Students"],
        }),

        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/students/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: ["Students"],
        }),
    }),
});

export const {
    useGetStudentsQuery,
    useGetStudentQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApi;