import { configureStore } from "@reduxjs/toolkit";
import agendaReducer from "./slices/agendaSlice";

export const store = configureStore({
  reducer: {
    agenda: agendaReducer,
  },
});
