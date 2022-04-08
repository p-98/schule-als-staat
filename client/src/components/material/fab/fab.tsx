import { Fab as RMWCFab, FabProps as RMWCFabProps } from "@rmwc/fab";
import RMWC from "@rmwc/types";
import cn from "classnames";

// fab imports
import "@material/fab/dist/mdc.fab.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// local
import styles from "./fab.module.css";

export const fabClassName = cn("mdc-fab", styles["fab"]);

export type FabProps = React.ComponentProps<typeof Fab>;
export const Fab: React.FC<
    RMWC.ComponentProps<RMWCFabProps, React.HTMLProps<HTMLElement>, "div">
> = ({ className, ...restProps }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RMWCFab {...restProps} className={cn(className, styles["fab"])} />
);
