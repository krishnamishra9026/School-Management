import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const examsApi = createApi({
  reducerPath: 'examsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getExams: builder.query({
      query: () => '/exams',
    }),
    createExam: builder.mutation({
      query: (newExam) => ({
        url: '/exams',
        method: 'POST',
        body: newExam,
      }),
    }),
    updateExam: builder.mutation({
      query: ({ id, ...updatedExam }) => ({
        url: `/exams/${id}`,
        method: 'PUT',
        body: updatedExam,
      }),
    }),
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/exams/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} = examsApi;