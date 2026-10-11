import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",

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

    tagTypes: ["Dashboard"],

    endpoints: (builder) => ({
        // Role-specific dashboard for the logged-in user
        getDashboard: builder.query({
            // userId is only a cache key, so switching accounts
            // never shows the previous user's dashboard
            query: (userId) => "/dashboard",

            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetDashboardQuery } = dashboardApi;
