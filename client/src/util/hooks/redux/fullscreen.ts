import { useRef } from "react";
import { v4 as uuid } from "uuid";

// local
import {
    lock,
    release,
    selectFullscreenInUse,
} from "Utility/redux/slices/fullscreenSlice";
import { useDispatch, useSelector } from ".";

export * from ".";

export interface IFullscreen {
    lock: () => void;
    release: () => void;
    locked: boolean;
}
export const useFullscreen = (): IFullscreen => {
    const idRef = useRef(uuid());

    const dispatch = useDispatch();

    return {
        lock: () => dispatch(lock(idRef.current)),
        release: () => dispatch(release(idRef.current)),
        locked: useSelector(selectFullscreenInUse),
    };
};
