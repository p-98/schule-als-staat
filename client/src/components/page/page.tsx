import cn from "classnames";
import React, { forwardRef, HTMLAttributes } from "react";
import { Theme } from "Components/material/theme";
import { Grid } from "Components/material/grid";

// local
import styles from "./page.module.css";

type IPageProps = HTMLAttributes<HTMLDivElement>;
export const Page = forwardRef<HTMLDivElement, IPageProps>(
    ({ children, ...restProps }, ref) => (
        <Theme
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(styles["page"], restProps.className)}
            use="surface"
            tag="div"
            ref={ref}
        >
            <div className={styles["page__inner"]}>{children}</div>
        </Theme>
    )
);

type IGridPageProps = HTMLAttributes<HTMLDivElement>;
export const GridPage = forwardRef<HTMLDivElement, IGridPageProps>(
    ({ children, ...restProps }, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Page {...restProps} ref={ref}>
            <Grid className={styles["page__grid"]}>{children}</Grid>
        </Page>
    )
);
