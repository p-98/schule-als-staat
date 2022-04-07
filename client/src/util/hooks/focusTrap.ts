import {
    focusTrapFactory,
    FocusOptions,
    FocusTrap,
} from "Components/material/base";
import { RefObject, useEffect, useRef } from "react";

export const useFocusTrapOld = (
    element: RefObject<HTMLElement>["current"] | false,
    options?: FocusOptions & {
        /** used to delay the initialization of the new focusTrap; returns a cleanup function (like useEffect) */
        initTrigger: (init: () => void, element: HTMLElement) => () => void;
    }
): void => {
    const { initTrigger, ...focusOptions } = options ?? {
        initTrigger: (init) => init(),
    };
    useEffect(() => {
        if (!element) return;

        let focusTrap: FocusTrap | undefined;
        let unmountedBeforeInit = false;

        initTrigger(() => {
            if (unmountedBeforeInit) return;

            focusTrap = focusTrapFactory(element, focusOptions);
            focusTrap.trapFocus();
        }, element);

        return () => {
            if (focusTrap) focusTrap.releaseFocus();
            else unmountedBeforeInit = true;
        };
    }, [element, focusOptions, initTrigger]);
};

type FTrapFocus = () => void;
export const useFocusTrap = (
    element: RefObject<HTMLElement>,
    focusOptions?: FocusOptions,
    dependencies?: unknown[]
): FTrapFocus => {
    const focusTrapRef = useRef<FocusTrap>();

    useEffect(() => {
        if (!element.current) return;

        focusTrapRef.current = focusTrapFactory(element.current, focusOptions);

        return () => {
            focusTrapRef.current?.releaseFocus();
            focusTrapRef.current = undefined;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return () => focusTrapRef.current?.trapFocus();
};
