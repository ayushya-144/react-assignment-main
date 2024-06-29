import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { queryParamsBuilder } from "../../utils/commonFunctions";

export const storesApi = createApi({
  reducerPath: "stores.api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
  }),

  endpoints: (builder) => ({
    getAllStores: builder.query({
      query: (filters) => {
        console.log(queryParamsBuilder(filters));
        return {
          // url: `/stores?_page=${pagination?.page}&_limit=${pagination?.limit}`,
          url: `/stores${queryParamsBuilder(filters)}`,
        };
      },
    }),
  }),
});

export const { useGetAllStoresQuery } = storesApi;
