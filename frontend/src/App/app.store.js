import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/Auth/auth.slice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
    }
})