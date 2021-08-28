import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface IDrawerState {
    open: boolean;
}
const initialState: IDrawerState = {
    open: false,
};

const drawerSlice = createSlice({
    name: "drawer",
    initialState,
    reducers: {
        open: (state) => {
            state.open = true;
        },
        close: (state) => {
            state.open = false;
        },
        toggle: (state) => {
            state.open = !state.open;
        },
    },
});

export const { close, open, toggle } = drawerSlice.actions;

export default drawerSlice.reducer;

// selectors
export const selectDrawerOpen = (state: RootState): boolean =>
    state.drawer.open;
