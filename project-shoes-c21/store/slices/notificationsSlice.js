import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  seenNotificationsIds: [],
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addSeenNotification: (state, action) => {
      if (!state.seenNotificationsIds.includes(action.payload)) {
        state.seenNotificationsIds.push(action.payload);
      }
    },
  },
});

export const { addSeenNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
