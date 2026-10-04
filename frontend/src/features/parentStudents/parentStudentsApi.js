import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const parentStudentsApi =
  createApi({
      reducerPath:
          "parentStudentsApi",

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

      tagTypes: [
          "ParentStudents",
      ],

      endpoints: (builder) => ({
          getParentStudents:
              builder.query({
                  query: ({
                      parentId = "",
                      studentId = "",
                      status = "",
                  } = {}) => ({
                      url: "/parent-students",
                      params: {
                          parentId,
                          studentId,
                          status,
                      },
                  }),

                  providesTags: [
                      "ParentStudents",
                  ],
              }),

          getParentStudent:
              builder.query({
                  query: (id) =>
                      `/parent-students/${id}`,

                  providesTags: (
                      result,
                      error,
                      id
                  ) => [
                      {
                          type: "ParentStudents",
                          id,
                      },
                  ],
              }),

          createParentStudent:
              builder.mutation({
                  query: (
                      data
                  ) => ({
                      url: "/parent-students",
                      method: "POST",
                      body: data,
                  }),

                  invalidatesTags: [
                      "ParentStudents",
                  ],
              }),

          updateParentStudent:
              builder.mutation({
                  query: ({
                      id,
                      ...data
                  }) => ({
                      url: `/parent-students/${id}`,
                      method: "PUT",
                      body: data,
                  }),

                  invalidatesTags: [
                      "ParentStudents",
                  ],
              }),

          deleteParentStudent:
              builder.mutation({
                  query: (id) => ({
                      url: `/parent-students/${id}`,
                      method: "DELETE",
                  }),

                  invalidatesTags: [
                      "ParentStudents",
                  ],
              }),
      }),
  });

export const {
  useGetParentStudentsQuery,
  useGetParentStudentQuery,
  useCreateParentStudentMutation,
  useUpdateParentStudentMutation,
  useDeleteParentStudentMutation,
} = parentStudentsApi;