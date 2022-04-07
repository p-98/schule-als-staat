import { Fab as RMWCFab, FabProps } from "@rmwc/fab";
import RMWC from "@rmwc/types";
import cn from "classnames";

// fab imports
import "@material/fab/dist/mdc.fab.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// local
import styles from "./fab.module.css";

export const fabClassName = cn("mdc-fab", styles["fab"]);

export const Fab: React.FC<
    RMWC.ComponentProps<FabProps, React.HTMLProps<HTMLElement>, "div">
> = ({ className, ...restProps }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RMWCFab {...restProps} className={cn(className, styles["fab"])} />
);
