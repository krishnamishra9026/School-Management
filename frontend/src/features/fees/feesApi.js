import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Drop empty filter values so they are not sent as "?status="
const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

export const feesApi = createApi({
    reducerPath: "feesApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api",

        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            return headers;
        },
    }),

    tagTypes: ["Fees"],

    endpoints: (builder) => ({
        // Paginated list + summary:
        // { page, limit, search, classId, studentId, status, feeType, academicYear }
        getFees: builder.query({
            query: (params) => ({
                url: "/fees",
                params: cleanParams(params),
            }),

            providesTags: (result) => [
                { type: "Fees", id: "LIST" },
                ...(result?.fees || []).map((fee) => ({ type: "Fees", id: fee._id })),
            ],
        }),

        getFee: builder.query({
            query: (id) => `/fees/${id}`,

            providesTags: (result, error, id) => [{ type: "Fees", id }],
        }),

        // { studentId } for one student, or { classId, applyToClass: true }
        createFee: builder.mutation({
            query: (body) => ({
                url: "/fees",
                method: "POST",
                body,
            }),

            invalidatesTags: [{ type: "Fees", id: "LIST" }],
        }),

        updateFee: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/fees/${id}`,
                method: "PUT",
                body,
            }),

            invalidatesTags: (result, error, { id }) => [
                { type: "Fees", id },
                { type: "Fees", id: "LIST" },
            ],
        }),

        deleteFee: builder.mutation({
            query: (id) => ({
                url: `/fees/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: [{ type: "Fees", id: "LIST" }],
        }),

        // { id, amount, method, reference, paidOn, remarks }
        addFeePayment: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/fees/${id}/payments`,
                method: "POST",
                body,
            }),

            invalidatesTags: (result, error, { id }) => [
                { type: "Fees", id },
                { type: "Fees", id: "LIST" },
            ],
        }),

        deleteFeePayment: builder.mutation({
            query: ({ id, paymentId }) => ({
                url: `/fees/${id}/payments/${paymentId}`,
                method: "DELETE",
            }),

            invalidatesTags: (result, error, { id }) => [
                { type: "Fees", id },
                { type: "Fees", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetFeesQuery,
    useGetFeeQuery,
    useCreateFeeMutation,
    useUpdateFeeMutation,
    useDeleteFeeMutation,
    useAddFeePaymentMutation,
    useDeleteFeePaymentMutation,
} = feesApi;
