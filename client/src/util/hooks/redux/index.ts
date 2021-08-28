import {
    useDispatch as useUntypedDispatch,
    useSelector as useUntypedSelector,
    TypedUseSelectorHook,
} from "react-redux";

// local
import type { CustomDispatch, RootState } from "Utility/redux/store";

export const useDispatch = (): CustomDispatch =>
    useUntypedDispatch<CustomDispatch>();

export const useSelector: TypedUseSelectorHook<RootState> = useUntypedSelector;
