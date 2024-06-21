import { mapValues, pick } from "lodash/fp";
import cn from "classnames";
import { PortalChild } from "@rmwc/base";
import { type ReactNode, type FC, useRef, useMemo } from "react";

import { useDelayFall, useStableEdge } from "Utility/hooks/hooks";
import {
    animationFrame,
    componentFactory,
    event,
    mutableAssign,
    pipe1,
    time,
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

/* eslint-disable no-param-reassign */
const px = (_: number) => `${_}px`;
const setDim = (rect: Rect, el: HTMLElement) =>
    pipe1(
        rect,
        pick(["width", "height"]),
        mapValues(px),
        mutableAssign(el.style)
    );
const setPos = (rect: Rect, el: HTMLElement) =>
    (el.style.transform = `translate(${px(rect.left)}, ${px(rect.top)})`);
const setRect = (rect: Rect, el: HTMLElement) => {
    setDim(rect, el);
    setPos(rect, el);
};

const _unsetRect = { height: "", width: "", transform: "" };
const unsetRect = (el: HTMLElement) =>
    pipe1(_unsetRect, mutableAssign(el.style));

const disableTransition = (el: HTMLElement) => (el.style.transition = "none");
const enableTransition = (el: HTMLElement) => (el.style.transition = "");
/* eslint-enable no-param-reassign */

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
    openWillChange?: boolean;
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
    const { open, openWillChange = false } = props;
    const { handle, fullscreen, className } = props;
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
        disableTransition(unref(surfaceRef));
        setRect(rect, unref(surfaceRef));
        const handleCopy = unref(handleRef).cloneNode(true) as HTMLDivElement;
        unref(surfaceRef).prepend(handleCopy);
        setDim(rect, handleCopy);
        cacheRef.current = { rect, handleCopy };
        props.onOpen?.(unref(handleRef), unref(surfaceRef));

        await animationFrame();
        await animationFrame();
        enableTransition(unref(surfaceRef));
        unsetRect(unref(surfaceRef));
        unref(fctRef).classList.add(css["fct--open"]!, "fct--open");

        await event("animationend", handleCopy);
        props.onOpened?.(unref(handleRef), unref(surfaceRef));
    };
    const onClose = async () => {
        const { rect, handleCopy } = cacheRef.current!;
        props.onClose?.(unref(handleRef), unref(surfaceRef));

        setRect(rect, unref(surfaceRef));
        unref(fctRef).classList.remove(css["fct--open"]!, "fct--open");

        await event("animationend", handleCopy);
        handleCopy.remove();
        unsetRect(unref(surfaceRef));
        props.onClosed?.(unref(handleRef));
    };

    const stableOpen = useStableEdge(open, onOpen, onClose);
    const optimize = useDelayFall(openWillChange, () => time(300));

    const openCN = cn(stableOpen && cn(css["fct--open"], "fct--open"));
    const optimizeCN = cn(optimize && css["fct--optimize"]);
    return useMemo(
        () => (
            <>
                <FCTSurface className={className}>
                    <FCTHandle ref={handleRef}>{handle}</FCTHandle>
                </FCTSurface>
                <PortalChild renderTo="#fullscreen">
                    <FCTRoot ref={fctRef} className={cn(openCN, optimizeCN)}>
                        <FCTScrim />
                        <FCTSurface ref={surfaceRef} className={className}>
                            {/* <FCTHandle>{handle}</FCTHandle> copied here while open */}
                            <FCTFullscreen>{fullscreen}</FCTFullscreen>
                        </FCTSurface>
                    </FCTRoot>
                </PortalChild>
            </>
        ),
        [handle, fullscreen, openCN, optimizeCN, className]
    );
};
