import { add } from "lodash/fp";
import { ComponentProps, useEffect, useReducer, useState } from "react";
import { animationFrame, syncify, syncifyF } from "Utility/misc";

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
    // The effect is so cheap that it is easiest to execute it on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
        syncifyF(async () => {
            if (callbackRunning || stable === flag) return;
            setCallbackRunning(true);
            setStable(flag);
            await (flag ? onTrue : onFalse)();
            setCallbackRunning(false);
        })
    );
    return stable;
};

/** Delay setting a boolean to `false`
 *
 * @param flag the boolean to delay
 * @param delay the async callback by which to delay. Need not be cached.
 */
export const useDelayFall = (flag: boolean, delay: AsyncCallback): boolean => {
    const [delayed, setDelayed] = useState(flag);
    useEffect(() => {
        if (flag === true) return setDelayed(flag);

        let cancelled = false;
        syncify(delay().then(() => !cancelled && setDelayed(flag)));
        return () => {
            cancelled = true;
        };
        // the delay is only called when the flag changes anyways
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flag]);
    return delayed;
};

type Callback = () => void;
export const useRerender = (): Callback => useReducer(() => [], [])[1];
export const useRemount = (): [number, Callback] => useReducer(add(1), 0);

type WillClickListeners = Pick<
    ComponentProps<"div">,
    "onMouseEnter" | "onMouseLeave" | "onTouchStart" | "onTouchEnd"
>;
// TODO: check touch functionality (hover might be triggered after touch is released)
/** Detects whether an element is expected to be interacted with
 *
 * Successor of `usePredictionObserver`
 */
export const useWillClick = (): [boolean, WillClickListeners] => {
    const [hover, setHover] = useState(false);
    const [touch, setTouch] = useState(false);
    const expectInteraction = hover || touch;
    return [
        expectInteraction,
        {
            // `!touch` prevents default browser behaviour to simulate mouse
            onMouseEnter: () => !touch && setHover(true),
            onMouseLeave: () => setHover(false),

            onTouchStart: () => setTouch(true),
            onTouchEnd: syncifyF(async () => {
                await animationFrame();
                await animationFrame();
                setTouch(false);
            }),
        },
    ];
};
