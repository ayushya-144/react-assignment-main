import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoriesApi = createApi({
  reducerPath: 'categories.api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001',
  }),

  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: (pagination) => ({
        url: '/categories',
      }),
    }),
  }),
});

export const { useGetAllCategoriesQuery } = categoriesApi;
