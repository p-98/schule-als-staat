import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { PortalChild, PortalPropT } from "@rmwc/base";
import cn from "classnames";

// local
import { useFullscreen } from "Utility/hooks/redux/fullscreen";
import {
    FullscreenContainerTransformScrim,
    FullscreenContainerTransformWrapper,
    FullscreenContainerTransformFadingWrapper,
} from "./subComponents";
import { useChildren } from "./children";
import ElementSwitcher from "../../util/elementSwitcher";
import { TChildren } from "./types";
import {
    clearDimensions,
    clearOffset,
    getDimensions,
    getOffset,
    setDimensions,
    setOffset,
} from "../../util/domUtil";

import styles from "../*containerTransform.module.css";

export * from "./subComponents";

const handleCN = styles[
    "container-transform__element--fullscreen-handle"
] as string;
const elementCN = styles[
    "container-transform__element--fullscreen-element"
] as string;

const transitionTimeOpening = 300;
const transitionTimeClosing = 250;

function getHandleDOM(wrapperDOM: HTMLElement) {
    const handleDOM = wrapperDOM.getElementsByClassName(handleCN)[0];

    if (!handleDOM) throw Error("no handle found");

    return handleDOM as HTMLElement;
}

// TODO: return memo
// TODO: check function memo

/*
usage:
    <FullscreenContainerTransform>
        <FullscreenContainerTransformHandle/>
        <FullscreenContainerTransformElement/>
    </FullscreenContainerTransform>
*/

export type TOnAfterCloneHandle = (
    handleDOM: HTMLElement,
    portalHandleDOM: HTMLElement,
    action: "opening" | "closing",
    /** use setTimeout(callback, msToTransformEnd) to execute callback after the transformation is finished */
    msToTransformEnd: number
) => void;

export interface IFullscreenContainerTransformProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: TChildren;
    renderTo?: PortalPropT;
    open: boolean;
    /**
     * class names to be applied ADDITIONALLY to the className prop when starting to transition to open; don't pass in classes already applied via className (might cause bugs).
     * Used to smoothly transition the wrapper (e.g. border-radius).
     */
    openClassName?: string;
    /**
     * Called after handle is cloned to portal.
     * Used to smooth out transition of elements that cannot be cloned correctly (e.g. replace video element with img showing the last frame)
     */
    onAfterCloneHandle?: TOnAfterCloneHandle;
    /**
     * If true, optimizations will be applied.
     * Don't leave this true permanently or on several elements! (https://developer.mozilla.org/en-US/docs/Web/CSS/will-change).
     * Prop only needs to be active *before* the transformation occures, because it is held active whilst transforming internally
     */
    expectTransformation: boolean;
}
export const FullscreenContainerTransform: React.FC<IFullscreenContainerTransformProps> = ({
    children,
    renderTo = "#fullscreen",
    open: openTarget,
    openClassName,
    onAfterCloneHandle,
    expectTransformation,
    ...restProps
}: IFullscreenContainerTransformProps) => {
    const portalWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);

    const [inTransition, setInTransition] = useState(false);
    const fullscreen = useFullscreen();
    const [open, setOpen] = useState(openTarget);
    const [elementSwitcher, setElementSwitcher] = useState<
        undefined | ElementSwitcher
    >(undefined);

    const { Handle, Element } = useChildren(children);
    const transitionTime = open ? transitionTimeClosing : transitionTimeOpening;

    /** clones the handle to the location inside the portal */
    const updatePortalHandle = useCallback(
        (wrapperDOM: HTMLElement, fadingWrapperDOM: HTMLElement) => {
            // delete old handle
            try {
                const portalHandleDOM = getHandleDOM(fadingWrapperDOM);
                portalHandleDOM.remove();
            } catch {
                // initial call, so portalHandle does not exist yet
            }

            // clone new handle
            const handleDOM = getHandleDOM(wrapperDOM);
            fadingWrapperDOM.append(handleDOM.cloneNode(true));
            const portalHandleDOM = fadingWrapperDOM.lastChild as HTMLElement;

            // call onAfterHandle for custom smooth transitions
            onAfterCloneHandle?.(
                handleDOM,
                portalHandleDOM,
                open ? "closing" : "opening",
                transitionTime
            );
        },
        [onAfterCloneHandle, open, transitionTime]
    );
    const clearPortalHandle = useCallback((fadingWrapperDOM: HTMLElement) => {
        const handleDOM = getHandleDOM(fadingWrapperDOM);
        handleDOM.remove();
    }, []);

    // transition logic
    const expand = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!portalWrapperRef.current) return;
        if (!elementSwitcher) return;

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;
        const fadingWrapperDOM = portalWrapperDOM.firstChild as HTMLElement;

        updatePortalHandle(wrapperDOM, fadingWrapperDOM);
        elementSwitcher.setAllStyles();

        const handleDOM = getHandleDOM(wrapperDOM);
        const portalHandleDOM = getHandleDOM(portalWrapperDOM);

        // fix container appearance
        setOffset(portalWrapperDOM, getOffset(wrapperDOM));
        setDimensions(portalWrapperDOM, getDimensions(wrapperDOM));

        // fix portal handle dimensions
        setDimensions(portalHandleDOM, getDimensions(handleDOM));

        // switch visible wrapper
        wrapperDOM.style.opacity = "0";
        portalWrapperDOM.style.display = "block";

        // set new appearance (start transition)
        requestAnimationFrame(() => {
            if (!scrimRef.current) return;

            setDimensions(
                portalWrapperDOM,
                getDimensions(portalWrapperDOM.parentElement as HTMLElement)
            );
            setOffset(portalWrapperDOM, { left: 0, top: 0 });

            // start fading
            fadingWrapperDOM.style.animationName = styles[
                "container-transform__fade"
            ] as string;

            // fade in scrim
            scrimRef.current.classList.add(
                styles["container-transform__scrim--open"] as string
            );

            // start wrapper transitions
            // must be added this way, because the wrapper needs a frame without display:none to apply transitions
            const openClassNameArr = openClassName?.split(" ") ?? [];
            portalWrapperDOM.classList.add(
                ...openClassNameArr,
                "mdc-elevation--z8",
                styles["container-transform--open"] as string
            );

            fullscreen.lock();
        });

        // switch elements
        setTimeout(() => {
            elementSwitcher.switchTo("Element");
        }, 0.3 * transitionTimeOpening);

        // finish and cleanup
        const cleanup = (e: TransitionEvent) => {
            if (e.propertyName !== "width") return;
            portalWrapperDOM.removeEventListener("transitionend", cleanup);

            fadingWrapperDOM.style.animationName = "";

            // clear container inline styles
            clearOffset(portalWrapperDOM);
            clearDimensions(portalWrapperDOM);

            clearPortalHandle(fadingWrapperDOM);

            setOpen(true);
            setInTransition(false);
        };
        portalWrapperDOM.addEventListener("transitionend", cleanup);
    }, [
        clearPortalHandle,
        elementSwitcher,
        fullscreen,
        openClassName,
        updatePortalHandle,
    ]);

    const collapse = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!portalWrapperRef.current) return;
        if (!elementSwitcher) return;

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;
        const fadingWrapperDOM = portalWrapperDOM.firstChild as HTMLElement;

        updatePortalHandle(wrapperDOM, fadingWrapperDOM);
        elementSwitcher.setAllStyles();

        const handleDOM = getHandleDOM(wrapperDOM);
        const portalHandleDOM = getHandleDOM(portalWrapperDOM);

        // fix container appearance
        setOffset(portalWrapperDOM, getOffset(portalWrapperDOM));
        setDimensions(portalWrapperDOM, getDimensions(portalWrapperDOM));

        // fix handle dimensions in final state
        setDimensions(portalHandleDOM, getDimensions(handleDOM));

        requestAnimationFrame(() => {
            if (!scrimRef.current) return;

            // set new appearance (start transition)
            setOffset(portalWrapperDOM, getOffset(wrapperDOM));
            setDimensions(portalWrapperDOM, getDimensions(wrapperDOM));

            // start fading
            fadingWrapperDOM.style.animationName = styles[
                "container-transform__fade"
            ] as string;

            // fade out scrim
            scrimRef.current.classList.remove(
                styles["container-transform__scrim--open"] as string
            );
            fullscreen.release();
        });

        setTimeout(() => {
            elementSwitcher.switchTo("Handle");
        }, 0.3 * transitionTimeClosing);

        // finish and cleanup
        const cleanup = (e: TransitionEvent) => {
            if (e.propertyName !== "width") return;
            portalWrapperDOM.removeEventListener("transitionend", cleanup);

            fadingWrapperDOM.style.animationName = "";

            // clear container inline styles
            clearOffset(portalWrapperDOM);
            clearDimensions(portalWrapperDOM);

            clearPortalHandle(fadingWrapperDOM);

            // switch visible wrapper
            wrapperDOM.style.opacity = "";
            portalWrapperDOM.style.display = "";

            setOpen(false);
            setInTransition(false);
        };
        portalWrapperDOM.addEventListener("transitionend", cleanup);
    }, [clearPortalHandle, elementSwitcher, fullscreen, updatePortalHandle]);

    // init
    useEffect(() => {
        requestAnimationFrame(() => {
            if (!wrapperRef.current) return;
            if (!portalWrapperRef.current) return;

            const wrapperDOM = wrapperRef.current;
            const portalWrapperDOM = portalWrapperRef.current;
            const fadingWrapperDOM = portalWrapperDOM.firstChild as HTMLElement;

            // set initial portal handle
            updatePortalHandle(wrapperDOM, fadingWrapperDOM);

            const elementMap = {
                Handle: () =>
                    portalWrapperDOM.querySelector(
                        `.${handleCN}`
                    ) as HTMLElement,
                Element: () =>
                    portalWrapperDOM.querySelector(
                        `.${elementCN}`
                    ) as HTMLElement,
            };

            setElementSwitcher(new ElementSwitcher(elementMap, "Handle"));
        });

        return () => setElementSwitcher(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // kickoff transitions
    useEffect(() => {
        if (inTransition) return;
        if (open === openTarget) return;

        setInTransition(true);

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        open ? collapse() : expand();
    }, [collapse, expand, inTransition, open, openTarget]);

    const expectOrInTransformation = expectTransformation || inTransition;

    return useMemo(
        () => (
            <>
                <FullscreenContainerTransformWrapper
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...restProps}
                    ref={wrapperRef}
                    transitionTime={transitionTime}
                    optimize={false}
                >
                    {React.cloneElement(Handle, {
                        optimize: expectOrInTransformation,
                    })}
                </FullscreenContainerTransformWrapper>

                <PortalChild renderTo={renderTo}>
                    <FullscreenContainerTransformScrim
                        ref={scrimRef}
                        transitionTime={transitionTime}
                    />
                    <FullscreenContainerTransformWrapper
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...restProps}
                        ref={portalWrapperRef}
                        portal
                        transitionTime={transitionTime}
                        className={cn(
                            restProps.className,
                            // openClassNames, are manually applied for the time of the transition
                            open &&
                                !inTransition &&
                                cn(
                                    openClassName,
                                    "mdc-elevation--z8",
                                    styles["container-transform--open"]
                                )
                        )}
                        optimize={expectOrInTransformation}
                    >
                        <FullscreenContainerTransformFadingWrapper
                            optimize={expectOrInTransformation}
                        >
                            {React.cloneElement(Element, {
                                optimize: expectOrInTransformation,
                            })}
                        </FullscreenContainerTransformFadingWrapper>
                    </FullscreenContainerTransformWrapper>
                </PortalChild>
            </>
        ),
        [
            restProps,
            transitionTime,
            Handle,
            expectOrInTransformation,
            renderTo,
            open,
            inTransition,
            openClassName,
            Element,
        ]
    );
};
