import userReducer from "./slices/userSlice";
import { userApi } from "./api/userApi";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware),
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
