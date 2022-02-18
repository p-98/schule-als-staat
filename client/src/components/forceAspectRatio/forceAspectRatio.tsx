import { CSSProperties, HTMLAttributes } from "react";
import cn from "classnames";

// local
import styles from "./forceAspectRatio.module.css";

interface IForceAspectRatioProps extends HTMLAttributes<HTMLDivElement> {
    ratio: number;
}
export const ForceAspectRatio: React.FC<IForceAspectRatioProps> = ({
    ratio,
    children,
    ...restProps
}) => (
    <div
        {...restProps}
        className={cn(restProps.className, styles["force-aspect-ratio"])}
        style={{ "--ratio": ratio } as CSSProperties}
    >
        <div className={styles["force-aspect-ratio__inner"]}>{children}</div>
    </div>
);
