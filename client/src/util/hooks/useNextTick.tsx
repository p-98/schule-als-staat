import { useEffect, useRef } from "react";

type TNextTick = (callback: () => void) => void;
/** A utility for waiting for the next DOM update flush. */
export const useNextTick = (): TNextTick => {
    const scheduled = useRef<(() => void)[]>([]);

    useEffect(() => {
        scheduled.current.forEach((callback) => callback());
        scheduled.current = [];
    });

    return (callback) => scheduled.current.push(callback);
};
