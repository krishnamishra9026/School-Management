import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const feesApi = createApi({
  reducerPath: 'feesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getFees: builder.query({
      query: () => '/fees',
    }),
    createFee: builder.mutation({
      query: (newFee) => ({
        url: '/fees',
        method: 'POST',
        body: newFee,
      }),
    }),
    updateFee: builder.mutation({
      query: ({ id, ...updatedFee }) => ({
        url: `/fees/${id}`,
        method: 'PUT',
        body: updatedFee,
      }),
    }),
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `/fees/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feesApi;