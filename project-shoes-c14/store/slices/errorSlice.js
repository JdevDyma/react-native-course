import { createSlice } from "@reduxjs/toolkit";
import { setUserId } from "./userSlice";

const initialState = { errorHttp: false };

export const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setErrorHttp: (state, action) => {
      if (typeof action.payload === "boolean") state.errorHttp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setUserId, (state) => {
      state.errorHttp = false;
    });
  },
});

export const { setErrorHttp } = errorSlice.actions;
export default errorSlice.reducer;
