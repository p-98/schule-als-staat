import { useEffect } from "react";

export const useLog = (...args: unknown[]): void =>
    // eslint-disable-next-line react-hooks/exhaustive-deps, no-console
    useEffect(() => console.log(...args), [...args]);
