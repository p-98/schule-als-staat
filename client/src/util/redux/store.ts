import { configureStore } from "@reduxjs/toolkit";

// local
import fullscreenReducer from "./slices/fullscreenSlice";
import drawerReducer from "./slices/drawerSlice";

const store = configureStore({
    reducer: {
        fullscreen: fullscreenReducer,
        drawer: drawerReducer,
    },
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type CustomDispatch = typeof store.dispatch;
