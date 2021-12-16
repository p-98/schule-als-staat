import {
    HTMLAttributes,
    ReactElement,
    cloneElement,
    isValidElement,
} from "react";
import cn from "classnames";

// local
import styles from "./drawerToggle.module.scss";

interface IDrawerToggleProps extends HTMLAttributes<HTMLDivElement> {
    drawer: ReactElement<HTMLAttributes<HTMLElement>>;
    children: ReactElement<HTMLAttributes<HTMLElement>>;
    rightDrawer?: boolean;
    open: boolean;
    onClose: () => void;
}
export const DrawerToggle: React.FC<IDrawerToggleProps> = ({
    children,
    drawer,
    rightDrawer,
    open,
    onClose,
    ...restProps
}) => {
    if (!isValidElement<HTMLAttributes<HTMLElement>>(children))
        throw TypeError("children is not a valid react element");
    if (!isValidElement(drawer))
        throw TypeError("drawer is not a valid react element");

    return (
        <div
            {...restProps}
            className={cn(
                restProps.className,
                styles["drawer-toggle"],
                open
                    ? styles["drawer-toggle--open"]
                    : styles["drawer-toggle--closed"],
                rightDrawer
                    ? styles["drawer-toggle--right"]
                    : styles["drawer-toggle--left"]
            )}
        >
            <button
                type="button"
                aria-label="close drawer"
                className={styles["drawer-toggle__scrim"]}
                onClick={onClose}
            />
            {cloneElement(drawer, {
                className: cn(
                    drawer.props.className,
                    styles["drawer-toggle__drawer"]
                ),
            })}
            {cloneElement(children, {
                className: cn(
                    children.props.className,
                    styles["drawer-toggle__children"]
                ),
            })}
        </div>
    );
};
