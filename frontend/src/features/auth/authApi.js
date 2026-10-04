import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
      baseUrl:
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000/api",

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

  endpoints: (builder) => ({
      login: builder.mutation({
          query: (credentials) => ({
              url: "/auth/login",
              method: "POST",
              body: credentials,
          }),
      }),

      register: builder.mutation({
          query: (userData) => ({
              url: "/auth/register",
              method: "POST",
              body: userData,
          }),
      }),

      getMe: builder.query({
          query: () => "/users/me",
      }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
} = authApi;