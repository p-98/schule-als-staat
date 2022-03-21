import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface ICompanyAdminState {
    loggedIn: boolean;
}
const initialState: ICompanyAdminState = {
    loggedIn: false,
};

const companyAdminSlice = createSlice({
    name: "companyAdmin",
    initialState,
    reducers: {
        login: (state) => {
            state.loggedIn = true;
        },
        logout: (state) => {
            state.loggedIn = false;
        },
    },
});

export const { login, logout } = companyAdminSlice.actions;

export default companyAdminSlice.reducer;

// selectors
export const selectLoggedIn = (state: RootState): boolean =>
    state.companyAdmin.loggedIn;
