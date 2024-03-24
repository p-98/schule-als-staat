import React, { forwardRef, CSSProperties, ReactNode } from "react";
import cn from "classnames";

import styles from "../*containerTransform.module.css";

interface FullscreenContainerTransformWrapperProps
    extends React.HTMLAttributes<HTMLDivElement> {
    portal?: boolean;
    transitionTime: number;
    optimize: boolean;
}
export const FullscreenContainerTransformWrapper = forwardRef<
    HTMLDivElement,
    FullscreenContainerTransformWrapperProps
>(
    (
        {
            children,
            className,
            portal = false,
            transitionTime,
            optimize,
            ...restProps
        },
        ref
    ) => (
        <div
            ref={ref}
            {...restProps}
            className={cn(
                className,
                styles["container-transform"],
                portal && styles["container-transform--portal"],
                portal && optimize && styles["container-transform--optimize"]
            )}
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

export interface IFullscreenContainerTransformElementProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    /** Automatically injected by FullscreenContainerTransform */
    optimize?: boolean;
}
export const FullscreenContainerTransformElement: React.FC<
    IFullscreenContainerTransformElementProps
> = ({ children, optimize }: IFullscreenContainerTransformElementProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-element"],
            optimize ? styles["container-transform__element--optimize"] : ""
        ),
    });

export interface IFullscreenContainerTransformHandleProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    /** Automatically injected by FullscreenContainerTransform */
    optimize?: boolean;
}
export const FullscreenContainerTransformHandle: React.FC<
    IFullscreenContainerTransformHandleProps
> = ({ children, optimize }: IFullscreenContainerTransformHandleProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-handle"],
            optimize ? styles["container-transform__element--optimize"] : ""
        ),
    });

export interface IFullscreenContainerTransformScrimProps {
    transitionTime: number;
}
export const FullscreenContainerTransformScrim = forwardRef<
    HTMLDivElement,
    IFullscreenContainerTransformScrimProps
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

interface IFullscreenContainerTransformFadingWrapperProps {
    children: ReactNode;
    optimize: boolean;
}
export const FullscreenContainerTransformFadingWrapper: React.FC<
    IFullscreenContainerTransformFadingWrapperProps
> = ({ optimize, children }) => (
    <div
        className={cn(
            styles["container-transform__fading-wrapper"],
            optimize
                ? styles["container-transform__fading-wrapper--optimize"]
                : ""
        )}
    >
        {children}
    </div>
);
