import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { dashboardApi } from "../dashboard/dashboardApi";

// Drop empty filter values so they are not sent as "?status="
const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

// Attendance changes also change dashboard figures
const refreshDashboard = async (_, { dispatch, queryFulfilled }) => {
    try {
        await queryFulfilled;
        dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
    } catch {
        // error is surfaced by the mutation hook
    }
};

export const attendanceApi = createApi({
    reducerPath: "attendanceApi",

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

    tagTypes: ["Attendance"],

    endpoints: (builder) => ({
        // Classes the user can take attendance for
        getAttendanceClasses: builder.query({
            query: () => "/attendance/classes",

            providesTags: [{ type: "Attendance", id: "CLASSES" }],
        }),

        // Class roster with statuses for one day
        getAttendanceSheet: builder.query({
            query: ({ classId, date }) => ({
                url: "/attendance/sheet",
                params: { classId, date },
            }),

            providesTags: [{ type: "Attendance", id: "SHEET" }],
        }),

        saveAttendanceSheet: builder.mutation({
            query: (body) => ({
                url: "/attendance/sheet",
                method: "POST",
                body,
            }),

            invalidatesTags: ["Attendance"],
            onQueryStarted: refreshDashboard,
        }),

        // Paginated records: { classId, studentId, status, from, to, page, limit }
        getAttendanceRecords: builder.query({
            query: (params) => ({
                url: "/attendance",
                params: cleanParams(params),
            }),

            providesTags: [{ type: "Attendance", id: "LIST" }],
        }),

        // Student-wise totals: { classId, studentId, from, to }
        getAttendanceSummary: builder.query({
            query: (params) => ({
                url: "/attendance/summary",
                params: cleanParams(params),
            }),

            providesTags: [{ type: "Attendance", id: "SUMMARY" }],
        }),

        updateAttendance: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/attendance/${id}`,
                method: "PUT",
                body,
            }),

            invalidatesTags: ["Attendance"],
            onQueryStarted: refreshDashboard,
        }),

        deleteAttendance: builder.mutation({
            query: (id) => ({
                url: `/attendance/${id}`,
                method: "DELETE",
            }),

            invalidatesTags: ["Attendance"],
            onQueryStarted: refreshDashboard,
        }),
    }),
});

export const {
    useGetAttendanceClassesQuery,
    useGetAttendanceSheetQuery,
    useSaveAttendanceSheetMutation,
    useGetAttendanceRecordsQuery,
    useGetAttendanceSummaryQuery,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation,
} = attendanceApi;
