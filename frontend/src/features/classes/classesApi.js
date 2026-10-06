import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classesApi = createApi({
  reducerPath: "classesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",

    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),

  tagTypes: ["Class"],

  endpoints: (builder) => ({
    // Get all classes
    getClasses: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
      } = {}) => ({
        url: "/classes",
        params: {
          page,
          limit,
          search,
        },
      }),

      providesTags: ["Class"],
    }),

    // Get single class
    getClass: builder.query({
      query: (id) => `/classes/${id}`,

      providesTags: (result, error, id) => [
        {
          type: "Class",
          id,
        },
      ],
    }),

    // Create class
    createClass: builder.mutation({
      query: (classe) => ({
        url: "/classes",
        method: "POST",
        body: classe,
      }),

      invalidatesTags: ["Class"],
    }),

    // Update class
    updateClass: builder.mutation({
      query: ({ id, ...classData }) => ({
        url: `/classes/${id}`,
        method: "PUT",
        body: classData,
      }),

      invalidatesTags: ["Class"],
    }),

    // Delete class
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Class"],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classesApi;