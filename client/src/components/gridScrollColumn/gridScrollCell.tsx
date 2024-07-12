import cn from "classnames";
import { ReactNode } from "react";

// local
import styles from "./gridScrollColumn.module.scss";

interface IGridScrollColumnProps {
    children: ReactNode;
    desktop?: boolean;
    tablet?: boolean;
    phone?: boolean;

    /** is overwritten by desktop, tablet and phone */
    all?: boolean;
}
/** A component to enable individually scrolling column in grids */
export const GridScrollColumn: React.FC<IGridScrollColumnProps> = ({
    children,
    all,
    ...sizeProps
}) => {
    const sizes = {
        desktop: sizeProps.desktop ?? all ?? false,
        tablet: sizeProps.tablet ?? all ?? false,
        phone: sizeProps.phone ?? all ?? false,
    };

    const sizeClassNames = Object.entries(sizes).reduce(
        (classNames, [size, active]) =>
            cn(
                classNames,
                active && styles[`grid-scroll-column--scroll-${size}`]
            ),
        ""
    );

    return (
        <div className={cn(styles["grid-scroll-column"], sizeClassNames)}>
            <div className={styles["grid-scroll-column__inner"]}>
                {children}
            </div>
        </div>
    );
};
