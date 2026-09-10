import errorReducer from "./slices/errorSlice";
import { rtkQueryErrorMiddleware } from "./middlewares/errorMiddleware";
import authReducer from "./slices/authSlice";
import { userApi } from "./api/userApi";
import { authApi } from "./api/authApi";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    auth: authReducer,
    error: errorReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware, authApi.middleware, rtkQueryErrorMiddleware),
  devTools: false,
});

export default store;
