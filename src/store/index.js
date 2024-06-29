import { configureStore } from "@reduxjs/toolkit";
import { categoriesApi } from "./apis/categories";
import { storesApi } from "./apis/stores";

export const store = configureStore({
  reducer: {
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [storesApi.reducerPath]: storesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(categoriesApi.middleware)
      .concat(storesApi.middleware),
});
