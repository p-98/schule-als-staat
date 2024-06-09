import { mapValues, pick } from "lodash/fp";
import cn from "classnames";
import { PortalChild } from "@rmwc/base";
import { type ReactNode, type FC, useRef, useMemo } from "react";

import { useStableEdge } from "Utility/hooks/hooks";
import {
    animationFrame,
    componentFactory,
    event,
    mutableAssign,
    pipe1,
    unref,
} from "Utility/misc";

import css from "./fullscreenContainerTransform.module.css";

/* Rect type and functions
 * Utilities for getting and setting the dimension and position of HTMLElements
 */

type RectKeys = "width" | "height" | "top" | "left";
type Rect = Record<RectKeys, number>;

const rectKeys: RectKeys[] = ["width", "height", "top", "left"];
const getRect = (el: HTMLElement): Rect =>
    pipe1(el.getBoundingClientRect(), pick(rectKeys));

const px = (_: number) => `${_}px`;
const setRect = (dim: Rect, el: HTMLElement) =>
    pipe1(dim, mapValues(px), mutableAssign(el.style));

const _unsetRect = { height: "", width: "", top: "", left: "" };
const unsetRect = (el: HTMLElement) =>
    pipe1(_unsetRect, mutableAssign(el.style));

/* Auxiliary components
 */
const FCTRoot = componentFactory({ className: cn(css["fct"], "fct") });
const FCTScrim = componentFactory({ className: css["fct__scrim"]! });
const FCTHandle = componentFactory({ className: css["fct__handle"]! });
const FCTFullscreen = componentFactory({ className: css["fct__fullscreen"]! });
const FCTSurface = componentFactory({ className: css["fct__surface"]! });

/* Main component
 */

interface FCTProps {
    /** Must be false at first */
    open: boolean;
    handle: ReactNode;
    fullscreen: ReactNode;
    /** non-portal-side and portal-side ancestor of handle */
    onOpen?: (ancestor: HTMLElement, portalAncestor: HTMLElement) => void;
    onOpened?: (ancestor: HTMLElement, portalAncestor: HTMLElement) => void;
    /** non-portal-side and portal-side ancestor of handle */
    onClose?: (ancestor: HTMLElement, portalAncestor: HTMLElement) => void;
    /** non-portal-side of handle */
    onClosed?: (ancestor: HTMLElement) => void;

    /** forwarded to surface element, which contains handle/fullscreen */
    className?: string;
}
/** Fullscreen container transform
 * Implements the material spec at https://m2.material.io/design/motion/the-motion-system.html#container-transform.
 *
 * Successor of <FullscreenContainerTransform> component.
 *
 * Applies class "fct" to an acestor of portal-side handle
 * If open, applies class "fct--open" to an acestor of portal-side handle
 */
export const FCT: FC<FCTProps> = (props) => {
    const { open, handle, fullscreen, className } = props;
    const handleRef = useRef<HTMLDivElement>(null);
    const fctRef = useRef<HTMLDivElement>(null);
    const surfaceRef = useRef<HTMLDivElement>(null);

    /** Store state between open and close call */
    const cacheRef = useRef<{
        rect: Rect;
        handleCopy: HTMLDivElement;
    }>();

    const onOpen = async () => {
        const rect = getRect(unref(handleRef));
        setRect(rect, unref(surfaceRef));
        const handleCopy = unref(handleRef).cloneNode(true) as HTMLDivElement;
        unref(surfaceRef).prepend(handleCopy);
        // does not have "position: absolute", so only dimensions apply
        setRect(rect, handleCopy);
        cacheRef.current = { rect, handleCopy };
        props.onOpen?.(unref(handleRef), unref(surfaceRef));

        await animationFrame();
        await animationFrame();
        unsetRect(unref(surfaceRef));
        unref(fctRef).classList.add(css["fct--open"]!, "fct--open");

        await event("animationend", handleCopy);
        props.onOpened?.(unref(handleRef), unref(surfaceRef));
    };
    const onClose = async () => {
        const { rect, handleCopy } = cacheRef.current!;
        setRect(rect, unref(surfaceRef));

        unref(fctRef).classList.remove(css["fct--open"]!, "fct--open");
        props.onClose?.(unref(handleRef), unref(surfaceRef));

        await event("animationend", handleCopy);
        handleCopy.remove();
        unsetRect(unref(surfaceRef));
        props.onClosed?.(unref(handleRef));
    };
    useStableEdge(open, onOpen, onClose);

    /* Using a constant value prevents updates to the dom
     * which prevents added classes from being dropped by hydration
     */
    return useMemo(
        () => (
            <>
                <FCTSurface className={className}>
                    <FCTHandle ref={handleRef}>{handle}</FCTHandle>
                </FCTSurface>
                <PortalChild renderTo="#fullscreen">
                    <FCTRoot ref={fctRef}>
                        <FCTScrim />
                        <FCTSurface ref={surfaceRef} className={className}>
                            {/* <FCTHandle>{handle}</FCTHandle> copied here while open */}
                            <FCTFullscreen>{fullscreen}</FCTFullscreen>
                        </FCTSurface>
                    </FCTRoot>
                </PortalChild>
            </>
        ),
        [className, fullscreen, handle]
    );
};
