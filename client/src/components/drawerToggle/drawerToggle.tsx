import {
    HTMLAttributes,
    ReactElement,
    cloneElement,
    isValidElement,
} from "react";
import cn from "classnames";

// local
import { useDispatch, close } from "Utility/hooks/redux/drawer";
import { useFullscreen } from "Utility/hooks/redux/fullscreen";

import styles from "./drawerToggle.module.scss";

interface IDrawerToggleProps extends HTMLAttributes<HTMLDivElement> {
    drawer: ReactElement<HTMLAttributes<HTMLElement>>;
    children: ReactElement<HTMLAttributes<HTMLElement>>;
    rightDrawer?: boolean;
    open: boolean;
}
export const DrawerToggle: React.FC<IDrawerToggleProps> = ({
    children,
    drawer,
    rightDrawer,
    open,
    ...restProps
}) => {
    if (!isValidElement<HTMLAttributes<HTMLElement>>(children))
        throw TypeError("children is not a valid react element");
    if (!isValidElement(drawer))
        throw TypeError("drawer is not a valid react element");

    const drawerDispatch = useDispatch();
    const { locked: fullscreenLocked } = useFullscreen();

    return (
        <div
            {...restProps}
            className={cn(
                restProps.className,
                styles["drawer-toggle"],
                open && styles["drawer-toggle--open"],
                fullscreenLocked && styles["drawer-toggle--fullscreen-enabled"]
            )}
        >
            {cloneElement(drawer, {
                className: cn(
                    drawer.props.className,
                    styles["drawer-toggle__drawer"],
                    rightDrawer && styles["drawer-toggle__drawer--right"]
                ),
            })}
            <button
                type="button"
                aria-label="close drawer"
                className={styles["drawer-toggle__scrim"]}
                onClick={() => drawerDispatch(close())}
            />
            {cloneElement(children, {
                className: cn(
                    children.props.className,
                    styles["drawer-toggle__children"]
                ),
            })}
        </div>
    );
};
