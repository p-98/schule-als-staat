import React, {
    Children,
    HTMLAttributes,
    ReactElement,
    useCallback,
    useEffect,
    useRef,
} from "react";
import cn from "classnames";
import { IconPropT } from "@rmwc/types";

// local
import { Fab, fabClassName } from "Components/fab/fab";
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";

import styles from "./fabContainerTransform.module.css";

interface IFabContainerTransformProps {
    icon: IconPropT;
    expanded: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    preventOutsideDismiss?: boolean;
    children: ReactElement<HTMLAttributes<HTMLElement>>;
}
/**
 * Note: child element must support prop forwarding
 */
export const FabContainerTransform: React.FC<IFabContainerTransformProps> = ({
    icon,
    children,
    expanded,
    onExpand,
    onCollapse,
    preventOutsideDismiss = false,
}: IFabContainerTransformProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleOutsideClick = useCallback(
        (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as HTMLElement)) {
                onCollapse();
            }
        },
        [onCollapse]
    );

    // dismiss on outside click
    useEffect(() => {
        if (preventOutsideDismiss || !expanded) return;

        window.addEventListener("click", handleOutsideClick);

        return () => window.removeEventListener("click", handleOutsideClick);
    }, [expanded, handleOutsideClick, preventOutsideDismiss]);

    return (
        <ContainerTransform
            activeElement={expanded ? "card" : "fab"}
            className={cn(
                fabClassName,
                styles["fab-container-transform"],
                expanded && styles["fab-container-transform--expanded"]
            )}
            transitionTime={expanded ? 250 : 200}
            ref={ref}
        >
            <ContainerTransformElement elementKey="fab">
                <Fab
                    icon={icon}
                    className={styles["fab-container-transform__fab"]}
                    onClick={onExpand}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="card">
                {React.cloneElement(Children.only(children), {
                    className: cn(
                        children.props.className as string,
                        styles["fab-container-transform__card"]
                    ),
                })}
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
