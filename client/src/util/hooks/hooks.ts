import { useEffect, useState } from "react";
import { dispatch } from "Utility/misc";

type AsyncCallback = () => Promise<void>;
/** Keep a flag constant while a handler is executed
 *
 * Callbacks need not use `useCallback`.
 */
export const useStableEdge = (
    flag: boolean,
    onTrue: AsyncCallback,
    onFalse: AsyncCallback
): boolean => {
    const [stable, setStable] = useState(flag);
    const [callbackRunning, setCallbackRunning] = useState(false);
    /** Function only outlined for formatting reasons
     *
     * The effect is so cheap that it is easier to execute it on every render
     * than to wrap it in `useCallback`.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const effect = async () => {
        if (callbackRunning || stable === flag) return;
        setCallbackRunning(true);
        setStable(flag);
        await (flag ? onTrue : onFalse)();
        setCallbackRunning(false);
    };
    useEffect(() => dispatch(effect()), [effect]);
    return stable;
};
