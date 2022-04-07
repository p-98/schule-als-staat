import React from "react";
import { Button } from "Components/material/button";
import {
    SimpleMenu,
    MenuItem,
    SimpleMenuProps,
} from "Components/material/menu";

// local
import styles from "./dropdown.module.css";

interface IDropdownProps extends Omit<SimpleMenuProps, "handle"> {
    options: string[];
    className?: string;
}
export const Dropdown = React.memo<IDropdownProps>(
    ({ options, children, ...restProps }) => (
        <SimpleMenu
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            handle={
                <Button
                    className={styles["dropdown__handle"]}
                    trailingIcon="arrow_drop_down"
                    theme="textSecondaryOnBackground"
                >
                    {children}
                </Button>
            }
        >
            {options.map((option) => (
                <MenuItem key={option}>{option}</MenuItem>
            ))}
        </SimpleMenu>
    )
);
