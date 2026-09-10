import authReducer from "./slices/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import { agendaApi } from "./api/agendaApi";
import { authApi } from "./api/authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [agendaApi.reducerPath]: agendaApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(agendaApi.middleware, authApi.middleware),
  devTools: false,
});
