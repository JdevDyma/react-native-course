import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";

const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
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
