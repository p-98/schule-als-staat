/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@rmwc/theme";
import { Drawer, DrawerContent } from "@rmwc/drawer";
import { ListDivider } from "@rmwc/list";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

// drawer imports
import "@material/drawer/dist/mdc.drawer.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { store } from "Utility/redux/store";
import { DrawerToggle } from "Components/drawerToggle/drawerToggle";
import {
    useSelector,
    selectDrawerOpen,
    useDispatch,
    close,
} from "Utility/hooks/redux/drawer";
import { DynamicAppBarDisplay } from "Components/dynamicAppBar/dynamicAppBar";
import { Navigation } from "./components/navigation";
import { DrawerHeader } from "./components/drawerHeader";
import theme from "../../util/theme";

import styles from "./_app.module.scss";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
    const drawerOpen = useSelector(selectDrawerOpen);
    const drawerDispatch = useDispatch();

    return (
        <DrawerToggle
            className={styles["app"]}
            id="rmwcPortal"
            open={drawerOpen}
            onClose={() => drawerDispatch(close())}
            drawer={
                <Drawer>
                    <DrawerHeader />
                    <ListDivider />
                    <DrawerContent>
                        <Navigation />
                    </DrawerContent>
                </Drawer>
            }
        >
            {useMemo(
                () => (
                    <div className={styles["app__bar-wrapper"]}>
                        <DynamicAppBarDisplay />
                        <div className={styles["app__fullscreen-wrapper"]}>
                            <Component {...pageProps} />
                            <div
                                id="fullscreen"
                                className={styles["app__fullscreen"]}
                            />
                        </div>
                    </div>
                ),
                [Component, pageProps]
            )}
        </DrawerToggle>
    );
};

const Provider: React.FC<AppProps> = (appProps) => (
    <ReduxProvider store={store}>
        <ThemeProvider options={theme}>
            <App {...appProps} />
        </ThemeProvider>
    </ReduxProvider>
);

export { Provider as App };
