import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from "./fadeTransition.module.css";

export interface IFadeTransitionProps
    extends React.HTMLAttributes<HTMLDivElement> {
    open: boolean;
    anchor:
        | "top"
        | "top-right"
        | "right"
        | "bottom-right"
        | "bottom"
        | "bottom-left"
        | "left"
        | "top-left"
        | "fullscreen";
}
/**
 * A Component to perform fade transitions.
 * Children should have dimensions that are independent of the container
 */
const FadeTransition: React.FC<IFadeTransitionProps> = ({
    open: openTarget,
    children,
    anchor,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(openTarget);
    const [inTransition, setInTransition] = useState(false);

    const onOpen = useCallback(() => {
        const containerDOM = containerRef.current as HTMLDivElement;

        const targetWidth = containerDOM.scrollWidth;
        const targetHeight = containerDOM.scrollHeight;

        containerDOM.style.width = `${targetWidth * 0.8}px`;
        containerDOM.style.height = `${targetHeight * 0.8}px`;

        // start transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                containerDOM.style.opacity = "1";

                // fade in scrim
                if (anchor === "fullscreen")
                    (containerDOM.parentElement as HTMLDivElement).style.backgroundColor =
                        "rgba(0, 0, 0, 0.32)";

                containerDOM.style.width = `${targetWidth}px`;
                containerDOM.style.height = `${targetHeight}px`;
            });
        });

        const onTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== "height") return;

            containerDOM.style.width = "";
            containerDOM.style.height = "";

            containerDOM.removeEventListener("transitionend", onTransitionEnd);
            setOpen(true);
            setInTransition(false);
        };
        containerDOM.addEventListener("transitionend", onTransitionEnd);
    }, [anchor]);

    const onClose = useCallback(() => {
        const containerDOM = containerRef.current as HTMLDivElement;

        containerDOM.style.opacity = "";

        // fade out scrim
        if (anchor === "fullscreen")
            (containerDOM.parentElement as HTMLDivElement).style.backgroundColor =
                "";

        const onTransitionEnd = () => {
            containerDOM.removeEventListener("transitionend", onTransitionEnd);
            setOpen(false);
            setInTransition(false);
        };
        containerDOM.addEventListener("transitionend", onTransitionEnd);
    }, [anchor]);

    useEffect(() => {
        if (inTransition) return;
        if (openTarget === open) return;

        setInTransition(true);

        if (open) onClose();
        else onOpen();
    }, [inTransition, onClose, onOpen, open, openTarget]);

    // open if initialized with open
    // useEffect(() => {
    //     if (open) onOpen();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return useMemo(
        () => (
            <div
                {...props}
                className={[
                    styles["fade-transition"],
                    anchor === "fullscreen"
                        ? styles["fade-transition--fullscreen"]
                        : "",
                    open ? styles["fade-transition--open"] : "",
                    props.className,
                ].join(" ")}
            >
                <div
                    ref={containerRef}
                    className={[
                        styles["fadeTransition__container"],
                        styles[`fadeTransition__container--anchor-${anchor}`],
                    ].join(" ")}
                >
                    {children}
                </div>
            </div>
        ),
        [anchor, children, open, props]
    );
};
export default FadeTransition;
