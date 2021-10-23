import React from "react";
import cn from "classnames";

// local
import styles from "./highlightStates.module.css";

export const activatedClassName = cn(
    styles["highlighted-states"],
    styles["highlighted-states--activated"]
);
export const selectedClassName = cn(
    styles["highlighted-states"],
    styles["highlighted-states--selected"]
);
export const nonInteractiveClassName =
    styles["highlighted-states--non-interactive"];

interface IHighlightStatesPrps {
    /** use secondary instead of primary theme color */
    secondary?: boolean;
    activated?: boolean;
    selected?: boolean;
    children?: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const HightlightStates = React.memo<IHighlightStatesPrps>(
    ({ activated, selected, secondary, children }: IHighlightStatesPrps) => {
        if (!React.isValidElement(children))
            throw new TypeError("children is not a valid react element!");

        return React.cloneElement(children, {
            className: cn(
                children.props.className,
                styles["highlighted-states"],
                secondary && styles["highlighted-states--secondary"],
                activated && styles["highlighted-states--activated"],
                selected && styles["highlighted-states--selected"]
            ),
        });
    }
);
