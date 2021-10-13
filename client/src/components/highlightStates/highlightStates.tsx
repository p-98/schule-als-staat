import React from "react";
import cn from "classnames";

// local
import styles from "./highlightStates.module.css";

interface IHighlightStatesPrps {
    activated?: boolean;
    selected?: boolean;
    children?: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const HightlightStates = React.memo<IHighlightStatesPrps>(
    ({ activated, selected, children }: IHighlightStatesPrps) => {
        if (!React.isValidElement(children))
            throw new TypeError("children is not a valid react element!");

        return React.cloneElement(children, {
            className: cn(
                children.props.className,
                styles["highlighted-states"],
                activated && styles["highlighted-states--activated"],
                selected && styles["highlighted-states--selected"]
            ),
        });
    }
);
