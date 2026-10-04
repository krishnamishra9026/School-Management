import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const parentsApi = createApi({
  reducerPath: "parentsApi",

  baseQuery: fetchBaseQuery({
      baseUrl: "http://localhost:5000/api",

      prepareHeaders: (headers) => {
          const token =
              localStorage.getItem("token");

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

  tagTypes: ["Parents"],

  endpoints: (builder) => ({
      getParents: builder.query({
          query: ({
              page = 1,
              limit = 10,
              search = "",
              status = "",
          } = {}) => ({
              url: "/parents",
              params: {
                  page,
                  limit,
                  search,
                  status,
              },
          }),

          providesTags: (result) =>
              result?.parents
                  ? [
                        ...result.parents.map(
                            ({ _id }) => ({
                                type: "Parents",
                                id: _id,
                            })
                        ),

                        {
                            type: "Parents",
                            id: "LIST",
                        },
                    ]
                  : [
                        {
                            type: "Parents",
                            id: "LIST",
                        },
                    ],
      }),

      getParent: builder.query({
          query: (id) =>
              `/parents/${id}`,

          providesTags: (
              result,
              error,
              id
          ) => [
              {
                  type: "Parents",
                  id,
              },
          ],
      }),

      createParent: builder.mutation({
          query: (parent) => ({
              url: "/parents",
              method: "POST",
              body: parent,
          }),

          invalidatesTags: [
              {
                  type: "Parents",
                  id: "LIST",
              },
          ],
      }),

      updateParent: builder.mutation({
          query: ({
              id,
              ...parent
          }) => ({
              url: `/parents/${id}`,
              method: "PUT",
              body: parent,
          }),

          invalidatesTags: (
              result,
              error,
              { id }
          ) => [
              {
                  type: "Parents",
                  id,
              },
              {
                  type: "Parents",
                  id: "LIST",
              },
          ],
      }),

      deleteParent: builder.mutation({
          query: (id) => ({
              url: `/parents/${id}`,
              method: "DELETE",
          }),

          invalidatesTags: [
              {
                  type: "Parents",
                  id: "LIST",
              },
          ],
      }),
  }),
});

export const {
  useGetParentsQuery,
  useGetParentQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
} = parentsApi;