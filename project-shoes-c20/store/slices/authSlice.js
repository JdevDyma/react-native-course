import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { idToken: null, userId: null, generation: 0,
    expiresAt: null, refreshAt: null, profileReady: false },
  reducers: {
    installSession(state, { payload }) {
      state.generation += 1;
      state.idToken = payload.idToken;
      state.userId = payload.localId;
      state.expiresAt = payload.expiresAt;
      state.refreshAt = payload.refreshAt;
      state.profileReady = false;
    },
    confirmProfile(state, { payload }) {
      if (state.idToken && state.generation === payload.generation && state.userId === payload.userId) {
        state.profileReady = true;
      }
    },
    renewSession(state, { payload }) {
      if (state.idToken && state.userId === payload.userId &&
          state.generation === payload.generation) {
        state.idToken = payload.idToken;
        state.expiresAt = payload.expiresAt;
        state.refreshAt = payload.refreshAt;
      }
    },
    clearSession(state) {
      state.generation += 1;
      state.idToken = null;
      state.userId = null;
      state.expiresAt = null;
      state.refreshAt = null;
      state.profileReady = false;
    },
  },
});
export const { installSession, clearSession, confirmProfile, renewSession } = authSlice.actions;
export default authSlice.reducer;
