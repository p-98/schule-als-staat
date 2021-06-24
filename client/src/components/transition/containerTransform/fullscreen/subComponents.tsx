import React, { forwardRef, CSSProperties } from "react";
import cn from "classnames";

import styles from "../*containerTransform.module.css";

interface FullscreenContainerTransformWrapperProps
    extends React.HTMLAttributes<HTMLDivElement> {
    portal?: boolean;
    transitionTime: number;
}
export const FullscreenContainerTransformWrapper = forwardRef<
    HTMLDivElement,
    FullscreenContainerTransformWrapperProps
>(
    (
        { children, className, portal = false, transitionTime, ...restProps },
        ref
    ) => (
        <div
            ref={ref}
            {...restProps}
            className={cn(className, styles["container-transform"], {
                [styles["container-transform--portal"] as string]: portal,
            })}
            style={
                {
                    ...restProps.style,
                    "--transition-time": `${transitionTime}ms`,
                } as CSSProperties
            }
        >
            {children}
        </div>
    )
);

export interface FullscreenContainerTransformElementProps {
    children: React.ReactElement<HTMLElement>;
}
export const FullscreenContainerTransformElement: React.FC<FullscreenContainerTransformElementProps> = ({
    children,
}: FullscreenContainerTransformElementProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-element"]
        ),
    });

export interface FullscreenContainerTransformHandleProps {
    children: React.ReactElement<HTMLElement>;
}
export const FullscreenContainerTransformHandle: React.FC<FullscreenContainerTransformHandleProps> = ({
    children,
}: FullscreenContainerTransformHandleProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-handle"]
        ),
    });

interface FullscreenContainerTransformScrimProps {
    transitionTime: number;
}
export const FullscreenContainerTransformScrim = forwardRef<
    HTMLDivElement,
    FullscreenContainerTransformScrimProps
>(({ transitionTime }, ref) => (
    <div
        ref={ref}
        className={styles["container-transform__scrim"]}
        style={
            {
                "--transition-time": `${transitionTime}ms`,
            } as CSSProperties
        }
    />
));
