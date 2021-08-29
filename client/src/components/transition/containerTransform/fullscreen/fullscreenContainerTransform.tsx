import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { PortalChild, PortalPropT } from "@rmwc/base";

// local
import { useFullscreen } from "Utility/hooks/redux/fullscreen";
import {
    FullscreenContainerTransformScrim,
    FullscreenContainerTransformWrapper,
} from "./subComponents";
import useChildren from "./children";
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

const transitionTimeOpening = 3000;
const transitionTimeClosing = 2500;

function getHandleDOM(wrapperDOM: HTMLElement) {
    const handleDOM = wrapperDOM.getElementsByClassName(handleCN)[0];

    if (!handleDOM) throw Error("no handle found");

    return handleDOM as HTMLElement;
}

/** clones the handle to the location inside the portal */
function updatePortalHandle(
    wrapperDOM: HTMLElement,
    portalWrapperDOM: HTMLElement
) {
    // delete old handle
    try {
        const portalHandleDOM = getHandleDOM(portalWrapperDOM);
        portalHandleDOM.remove();
    } catch {
        // initial call, so portalHandle does not exist yet
    }

    // clone new handle
    const handleDOM = getHandleDOM(wrapperDOM);
    portalWrapperDOM.append(handleDOM.cloneNode(true));
}

// TODO: return memo
// TODO: check function memo
// TODO: eliminate border-radius when expanding
// TODO: wrap transition into different div element so shadows dont fade out and in again

/*
usage:
    <FullscreenContainerTransform>
        <FullscreenContainerTransformHandle/>
        <FullscreenContainerTransformElement/>
    </FullscreenContainerTransform>
*/

export interface IFullscreenContainerTransformProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: TChildren;
    renderTo?: PortalPropT;
    open: boolean;
}
const FullscreenContainerTransform: React.FC<IFullscreenContainerTransformProps> = ({
    children,
    renderTo = "#fullscreen",
    open: openTarget,
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

    // transition logic
    const expand = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!portalWrapperRef.current) return;
        if (!elementSwitcher) return;

        fullscreen.lock();

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;

        updatePortalHandle(wrapperDOM, portalWrapperDOM);
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
            portalWrapperDOM.style.animationName = styles[
                "container-transform__fade"
            ] as string;

            // fade in scrim
            scrimRef.current.classList.add(
                styles["container-transform__scrim--open"] as string
            );
        });

        // switch elements
        setTimeout(() => {
            elementSwitcher.switchTo("Element");
        }, 0.3 * transitionTimeOpening);

        // finish and cleanup
        setTimeout(() => {
            portalWrapperDOM.style.animationName = "";

            // clear container inline styles
            clearOffset(portalWrapperDOM);
            clearDimensions(portalWrapperDOM);

            // clear handle inline styles
            clearDimensions(portalHandleDOM);

            setOpen(true);
            setInTransition(false);
        }, transitionTimeOpening);
    }, [elementSwitcher, fullscreen]);

    const collapse = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!portalWrapperRef.current) return;
        if (!elementSwitcher) return;

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;

        updatePortalHandle(wrapperDOM, portalWrapperDOM);
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
            portalWrapperDOM.style.animationName = styles[
                "container-transform__fade"
            ] as string;

            // fade out scrim
            scrimRef.current.classList.remove(
                styles["container-transform__scrim--open"] as string
            );
        });

        setTimeout(() => {
            elementSwitcher.switchTo("Handle");
        }, 0.3 * transitionTimeClosing);

        // finish and cleanup
        setTimeout(() => {
            portalWrapperDOM.style.animationName = "";

            // clear container inline styles
            clearOffset(portalWrapperDOM);
            clearDimensions(portalWrapperDOM);

            // clear handle inline styles
            clearDimensions(portalHandleDOM);

            // switch visible wrapper
            wrapperDOM.style.opacity = "";
            portalWrapperDOM.style.display = "";

            fullscreen.release();

            setOpen(false);
            setInTransition(false);
        }, transitionTimeClosing);
    }, [elementSwitcher, fullscreen]);

    // init
    useEffect(() => {
        requestAnimationFrame(() => {
            if (!wrapperRef.current) return;
            if (!portalWrapperRef.current) return;

            const wrapperDOM = wrapperRef.current;
            const portalWrapperDOM = portalWrapperRef.current;

            // set initial portal handle
            updatePortalHandle(wrapperDOM, portalWrapperDOM);

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

    return useMemo(
        () => (
            <>
                <FullscreenContainerTransformWrapper
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...restProps}
                    ref={wrapperRef}
                    transitionTime={transitionTime}
                >
                    {Handle}
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
                    >
                        {Element}
                    </FullscreenContainerTransformWrapper>
                </PortalChild>
            </>
        ),
        [restProps, transitionTime, Handle, renderTo, Element]
    );
};
export default FullscreenContainerTransform;
