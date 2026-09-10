import { createSlice } from "@reduxjs/toolkit";
const errorSlice = createSlice({
  name: "error",
  initialState: { httpError: false, httpErrorMessage: null },
  reducers: {
    showHttpError(state, { payload }) {
      state.httpError = true;
      state.httpErrorMessage = typeof payload === "string" ? payload : "L’opération n’a pas abouti.";
    },
    clearHttpError(state) { state.httpError = false; state.httpErrorMessage = null; },
  },
});
export const { showHttpError, clearHttpError } = errorSlice.actions;
export default errorSlice.reducer;
