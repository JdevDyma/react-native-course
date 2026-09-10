import errorReducer from "./slices/errorSlice";
import { rtkQueryErrorMiddleware } from "./middlewares/errorMiddleware";
import authReducer from "./slices/authSlice";
import { userApi } from "./api/userApi";
import { stripeApi } from "./api/stripeApi";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    auth: authReducer,
    error: errorReducer,
    [userApi.reducerPath]: userApi.reducer,
    [stripeApi.reducerPath]: stripeApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware, stripeApi.middleware, rtkQueryErrorMiddleware),
  devTools: false,
});

export default store;
