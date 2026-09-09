import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  picturesIds: [],
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      if (!state.picturesIds.includes(action.payload)) {
        state.picturesIds = [...state.picturesIds, action.payload];
      }
    },
    removeFavorite: (state, action) => {
      state.picturesIds = state.picturesIds.filter(
        (currentId) => currentId !== action.payload
      );
    },
  },
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;

export default favoritesSlice.reducer;
