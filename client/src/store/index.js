import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import locationReducer from "./locationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
  },
});

export default store;
