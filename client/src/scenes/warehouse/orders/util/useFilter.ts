import { useReducer } from "react";

const initFilter = {
    company: "",
    date: "NO_FILTER",
};

interface IAction {
    filter: keyof typeof initFilter;
    value: string;
}

// react provides correct types
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useFilter = () =>
    useReducer(
        (state: typeof initFilter, { filter, value }: IAction) => ({
            ...state,
            [filter]: value,
        }),
        initFilter
    );
export type TFilter = ReturnType<typeof useFilter>[0];
export type TDispatchFilter = ReturnType<typeof useFilter>[1];
