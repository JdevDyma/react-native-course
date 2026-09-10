import userReducer from "./slices/userSlice";
import errorReducer from "./slices/errorSlice";
import { userApi } from "./api/userApi";
import { rtkQueryErrorMiddleware } from "./middlewares/errorMiddleware";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    user: userReducer,
    error: errorReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(userApi.middleware, rtkQueryErrorMiddleware),
  enhancers: (getDefaultEnhancers) => {
    const defaultEnhancers = getDefaultEnhancers();
    if (__DEV__) {
      const reactotron = require("../ReactotronConfig").default;
      return defaultEnhancers.concat(reactotron.createEnhancer());
    }
    return defaultEnhancers;
  },
});

export default store;
