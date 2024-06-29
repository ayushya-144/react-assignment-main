import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryId: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    selectCategory: (state, action) => {
      state.categoryId = action.payload;
    },
  },
});

export const { selectCategory } = categorySlice.actions;
export const categorySelector = (state) => state.category.categoryId;
export default categorySlice.reducer;
