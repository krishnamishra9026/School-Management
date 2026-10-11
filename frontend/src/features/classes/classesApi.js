
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const classesApi = createApi({
  reducerPath: "classesApi",

  baseQuery: fetchBaseQuery({
      baseUrl: "http://localhost:5000/api",

      prepareHeaders: (headers, { getState }) => {
          const token =
              getState().auth?.token ||
              localStorage.getItem("token");

          if (token) {
              headers.set(
                  "Authorization",
                  `Bearer ${token}`
              );
          }

          return headers;
      },
  }),

  tagTypes: ["Classes"],

  endpoints: (builder) => ({
      getClasses: builder.query({
          query: (params = {}) => ({
              url: "/classes",
              params,
          }),
          providesTags: (result) => [
              { type: "Classes", id: "LIST" },
              ...(result?.classes || []).map((item) => ({
                  type: "Classes",
                  id: item._id,
              })),
          ],
      }),

      getClassById: builder.query({
          query: (id) => `/classes/${id}`,
          providesTags: (result, error, id) => [
              { type: "Classes", id },
          ],
      }),

      createClass: builder.mutation({
          query: (body) => ({
              url: "/classes",
              method: "POST",
              body,
          }),
          invalidatesTags: [
              { type: "Classes", id: "LIST" },
          ],
      }),

      updateClass: builder.mutation({
          query: ({ id, ...body }) => ({
              url: `/classes/${id}`,
              method: "PUT",
              body,
          }),
          invalidatesTags: (result, error, { id }) => [
              { type: "Classes", id },
              { type: "Classes", id: "LIST" },
          ],
      }),

      deleteClass: builder.mutation({
          query: (id) => ({
              url: `/classes/${id}`,
              method: "DELETE",
          }),
          invalidatesTags: [
              { type: "Classes", id: "LIST" },
          ],
      }),

      assignStudent: builder.mutation({
          query: ({ id, studentId }) => ({
              url: `/classes/${id}/students`,
              method: "POST",
              body: { studentId },
          }),
          invalidatesTags: (result, error, { id }) => [
              { type: "Classes", id },
              { type: "Classes", id: "LIST" },
          ],
      }),

      removeStudent: builder.mutation({
          query: ({ id, studentId }) => ({
              url: `/classes/${id}/students/${studentId}`,
              method: "DELETE",
          }),
          invalidatesTags: (result, error, { id }) => [
              { type: "Classes", id },
              { type: "Classes", id: "LIST" },
          ],
      }),

      assignClassTeacher: builder.mutation({
          query: ({ id, teacherId }) => ({
              url: `/classes/${id}/class-teacher`,
              method: "PUT",
              body: { teacherId },
          }),
          invalidatesTags: (result, error, { id }) => [
              { type: "Classes", id },
              { type: "Classes", id: "LIST" },
          ],
      }),

      assignSubjectTeacher: builder.mutation({
          query: ({ id, teacherId, subject }) => ({
              url: `/classes/${id}/subject-teachers`,
              method: "POST",
              body: { teacherId, subject },
          }),
          invalidatesTags: (result, error, { id }) => [
              { type: "Classes", id },
              { type: "Classes", id: "LIST" },
          ],
      }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignStudentMutation,
  useRemoveStudentMutation,
  useAssignClassTeacherMutation,
  useAssignSubjectTeacherMutation,
} = classesApi;