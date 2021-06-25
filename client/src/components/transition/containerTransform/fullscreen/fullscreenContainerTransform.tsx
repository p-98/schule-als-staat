import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { PortalChild, PortalPropT } from "@rmwc/base";
import {
    FullscreenContainerTransformScrim,
    FullscreenContainerTransformWrapper,
} from "./subComponents";
import useChildren from "./children";
import ElementSwitcher from "../../util/elementSwitcher";
import { TChildren } from "./types";
import {
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

// TODO return memo
// TODO check function memo

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
    renderTo: PortalPropT;
    open: boolean;
}
const FullscreenContainerTransform: React.FC<IFullscreenContainerTransformProps> = ({
    children,
    renderTo,
    open: openTarget,
    ...restProps
}: IFullscreenContainerTransformProps) => {
    const portalWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);

    const [inTransition, setInTransition] = useState(false);
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

        console.log("TODO: does not resize when expanded");

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;

        // switch visible wrapper
        wrapperDOM.style.visibility = "hidden";
        portalWrapperDOM.style.display = "block";

        // fix container appearance
        setOffset(portalWrapperDOM, getOffset(wrapperDOM));
        setDimensions(portalWrapperDOM, getDimensions(wrapperDOM));

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

            setOpen(true);
            setInTransition(false);
        }, transitionTimeOpening);
    }, [elementSwitcher]);

    const collapse = useCallback(() => {
        if (!wrapperRef.current) return;
        if (!portalWrapperRef.current) return;
        if (!scrimRef.current) return;
        if (!elementSwitcher) return;

        const wrapperDOM = wrapperRef.current;
        const portalWrapperDOM = portalWrapperRef.current;

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

        setTimeout(() => {
            elementSwitcher.switchTo("Handle");
        }, 0.3 * transitionTimeClosing);

        // finish and cleanup
        setTimeout(() => {
            portalWrapperDOM.style.animationName = "";

            // switch visible wrapper
            wrapperDOM.style.visibility = "";
            portalWrapperDOM.style.display = "";

            setOpen(false);
            setInTransition(false);
        }, transitionTimeClosing);
    }, [elementSwitcher]);

    // init
    useEffect(() => {
        requestAnimationFrame(() => {
            const portalWrapperDOM = portalWrapperRef.current;
            if (!portalWrapperDOM) return;

            const elementMap = {
                Handle: portalWrapperDOM.querySelector(
                    `.${handleCN}`
                ) as HTMLElement,
                Element: portalWrapperDOM.querySelector(
                    `.${elementCN}`
                ) as HTMLElement,
            };

            setElementSwitcher(new ElementSwitcher(elementMap, "Handle"));
        });

        return () => setElementSwitcher(undefined);
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
                        {Handle}
                        {Element}
                    </FullscreenContainerTransformWrapper>
                </PortalChild>
            </>
        ),
        [restProps, transitionTime, Handle, renderTo, Element]
    );
};
export default FullscreenContainerTransform;
