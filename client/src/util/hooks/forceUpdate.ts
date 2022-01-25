import { useState } from "react";

export const useForceUpdate = (): (() => void) => {
    const [, setCounter] = useState(0);
    return () => setCounter((_counter) => _counter + 1);
};
