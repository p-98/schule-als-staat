import React from "react";
import { Button } from "@rmwc/button";
import { SimpleMenu, MenuItem, SimpleMenuProps } from "@rmwc/menu";

// button imports
import "@material/button/dist/mdc.button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// menu imports
import "@material/menu/dist/mdc.menu.css";
import "@material/menu-surface/dist/mdc.menu-surface.css";
// import '@material/ripple/dist/mdc.ripple.css';
import "@material/list/dist/mdc.list.css";
// import '@rmwc/icon/icon.css';

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
