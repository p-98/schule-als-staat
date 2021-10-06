import cn from "classnames";
import React, { cloneElement, HTMLAttributes } from "react";
import { Theme } from "@rmwc/theme";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

// local
import styles from "./page.module.css";

export interface IPageProps extends React.HTMLAttributes<HTMLDivElement> {
    topAppBar: React.ReactElement<HTMLAttributes<HTMLElement>>;
}
export const Page: React.FC<IPageProps> = ({
    topAppBar,
    children,
    ...restProps
}) => (
    <Theme
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(styles["page"], restProps.className)}
        use="surface"
    >
        {cloneElement(topAppBar, {
            className: cn(styles["page__header"], topAppBar.props.className),
        })}
        <div className={styles["page__scroll-container"]}>
            <div className={styles["page__inner"]}>{children}</div>
        </div>
    </Theme>
);
