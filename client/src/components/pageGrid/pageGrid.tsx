import { Grid } from "@rmwc/grid";
import cn from "classnames";
import { forwardRef } from "react";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import styles from "./pageGrid.module.css";

export type IPageGridProps = React.HTMLAttributes<HTMLDivElement>;
export const PageGrid = forwardRef<HTMLDivElement, IPageGridProps>(
    ({ children, ...restProps }, ref) => (
        <Grid
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(restProps.className, styles["page-grid"])}
            ref={ref}
        >
            {children}
        </Grid>
    )
);
