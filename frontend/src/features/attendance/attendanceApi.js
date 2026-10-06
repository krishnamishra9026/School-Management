import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getAttendance: builder.query({
      query: () => '/attendance',
    }),
    createAttendance: builder.mutation({
      query: (newRecord) => ({
        url: '/attendance',
        method: 'POST',
        body: newRecord,
      }),
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...updatedRecord }) => ({
        url: `/attendance/${id}`,
        method: 'PUT',
        body: updatedRecord,
      }),
    }),
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/attendance/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;