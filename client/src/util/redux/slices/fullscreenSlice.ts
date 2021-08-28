import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface IFullscreenState {
    lockedBy: null | string;
}
const initialState: IFullscreenState = {
    /** null if fullscreen is available, id if locked */
    lockedBy: null,
};

const fullscreenSlice = createSlice({
    name: "fullscreen",
    initialState,
    reducers: {
        /** payload is an id to identify the caller */
        lock: (state, action: PayloadAction<string>) => {
            if (state.lockedBy) throw new Error("FULLSCREEN_ALREADY_IN_USE");

            state.lockedBy = action.payload;
        },
        /** payload is an id to identify the caller */
        release: (state, action: PayloadAction<string>) => {
            if (!state.lockedBy) throw new Error("FULLSCREEN_NOT_IN_USE");
            if (!(state.lockedBy === action.payload))
                throw new Error("FULLSCREEN_WRONG_CALLER_ID");

            state.lockedBy = null;
        },
    },
});

export const { lock, release } = fullscreenSlice.actions;

export default fullscreenSlice.reducer;

// selectors
export const selectFullscreenInUse = (state: RootState): boolean =>
    !!state.fullscreen.lockedBy;
