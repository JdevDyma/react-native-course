import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";
import notificationsReducer from "./slices/notificationsSlice";
import cartReducer from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    cart: cartReducer,
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
