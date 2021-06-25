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

export interface IFullscreenContainerTransformElementProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const FullscreenContainerTransformElement: React.FC<IFullscreenContainerTransformElementProps> = ({
    children,
}: IFullscreenContainerTransformElementProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-element"]
        ),
    });

export interface IFullscreenContainerTransformHandleProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const FullscreenContainerTransformHandle: React.FC<IFullscreenContainerTransformHandleProps> = ({
    children,
}: IFullscreenContainerTransformHandleProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"],
            styles["container-transform__element--fullscreen-handle"]
        ),
    });

interface IFullscreenContainerTransformScrimProps {
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
