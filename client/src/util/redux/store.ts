import { configureStore } from "@reduxjs/toolkit";

// local
import drawerReducer from "./slices/drawerSlice";
import companyAdminReducer from "./slices/companyAdminSlice";

export const store = configureStore({
    reducer: {
        drawer: drawerReducer,
        companyAdmin: companyAdminReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type CustomDispatch = typeof store.dispatch;
