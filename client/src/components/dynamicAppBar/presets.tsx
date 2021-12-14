import { ComponentProps } from "react";
import { TopAppBarNavigationIcon } from "@rmwc/top-app-bar";

// top-app-bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { toggle, useDispatch } from "Utility/hooks/redux/drawer";
import { DynamicAppBarHandle } from "./dynamicAppBar";

import styles from "./dynamicAppBar.module.scss";

type TDrawerAppBarHandleProps = Omit<
    ComponentProps<typeof DynamicAppBarHandle>,
    "navIcon"
>;
export const DrawerAppBarHandle: React.FC<TDrawerAppBarHandleProps> = (
    props
) => {
    const drawerDispatch = useDispatch();

    return (
        <DynamicAppBarHandle
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            navIcon={
                <TopAppBarNavigationIcon
                    className={styles["app-bar__drawer-toggle"]}
                    icon="menu"
                    onClick={() => drawerDispatch(toggle())}
                />
            }
        />
    );
};

type TFullscreenAppBarHandleProps = Omit<
    ComponentProps<typeof DynamicAppBarHandle>,
    "navIcon"
> & { onClose: () => void };
export const FullscreenAppBarHandle: React.FC<TFullscreenAppBarHandleProps> = ({
    onClose,
    ...restProps
}) => (
    <DynamicAppBarHandle
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        navIcon={{ icon: "arrow_back", onNav: onClose }}
    />
);
