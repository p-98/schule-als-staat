import React, { HTMLAttributes, useMemo } from "react";
import cn from "classnames";

import styles from "./siblingTransitionBase.module.css";

export type TChildren = React.ReactElement<ISiblingTransitionBaseElementProps>[];

export interface ISiblingTransitionBaseElementProps {
    index: number;
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const SiblingTransitionBaseElement: React.FC<ISiblingTransitionBaseElementProps> = ({
    index,
    children,
}: ISiblingTransitionBaseElementProps) =>
    React.cloneElement(children, {
        className: cn(
            styles["sibling-transition-base__element"],
            children.props.className
        ),
        "data-element-index": index,
    } as Partial<HTMLAttributes<HTMLElement>> & React.Attributes);

export function useChildren(children: TChildren): TChildren {
    return useMemo(() => {
        children.forEach((child) => {
            if (child.type !== SiblingTransitionBaseElement)
                throw new Error(
                    "All children must of type SiblingTransitionBaseElement"
                );
        });

        return children;
    }, [children]);
}
