import { CSSProperties, HTMLAttributes } from "react";
import cn from "classnames";

// local
import styles from "./dot.module.css";

interface IDotProps extends HTMLAttributes<HTMLDivElement> {
    /** Diameter of the dot in px. */
    size: number;
}
export const Dot: React.FC<IDotProps> = ({ size, ...restProps }) => (
    <div
        {...restProps}
        className={cn(restProps.className, styles["dot"])}
        style={{ "--dot-size": `${size}px` } as CSSProperties}
    />
);
