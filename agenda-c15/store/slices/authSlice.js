import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { idToken: null, generation: 0, userId: null, expiresAt: null, refreshAt: null, storageError: false },
  reducers: {
    setToken(state, action) {
      const token = action.payload;
      state.generation += 1;
      state.idToken = typeof token === "string" && token.trim() ? token : null;
      state.storageError = false;
      state.userId = null;
      state.expiresAt = null;
      state.refreshAt = null;
    },
    installSession(state, { payload }) {
      state.generation += 1;
      state.storageError = false;
      state.idToken = payload.idToken;
      state.userId = payload.localId;
      state.expiresAt = payload.expiresAt;
      state.refreshAt = payload.refreshAt;
    },
    setStorageError(state, { payload }) {
      if (state.generation === payload.generation) state.storageError = payload.failed;
    },
    renewSession(state, { payload }) {
      if (state.generation !== payload.generation || state.userId !== payload.localId || !state.idToken) return;
      state.storageError = false;
      state.idToken = payload.idToken;
      state.expiresAt = payload.expiresAt;
      state.refreshAt = payload.refreshAt;
    },
  },
});
export const { setToken, installSession, renewSession, setStorageError } = authSlice.actions;
export default authSlice.reducer;
