import { configureStore } from "@reduxjs/toolkit";
import { agendaApi } from "./api/agendaApi";

export const store = configureStore({
  reducer: { [agendaApi.reducerPath]: agendaApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(agendaApi.middleware),
});
