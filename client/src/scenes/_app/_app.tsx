/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Provider as UrqlProvider } from "urql";
import { ThemeProvider } from "Components/material/theme";
import { Drawer, DrawerContent } from "Components/material/drawer";
import { ListDivider } from "Components/material/list";
import { SnackbarQueue } from "Components/material/snackbar";

// local
import { store } from "Utility/redux/store";
import { DrawerToggle } from "Components/drawerToggle/drawerToggle";
import {
    useSelector,
    selectDrawerOpen,
    useDispatch,
    close,
} from "Utility/hooks/redux/drawer";
import { client } from "Utility/urql";
import { DynamicAppBarDisplay } from "Components/dynamicAppBar/dynamicAppBar";
import { messages as notifications } from "Utility/notifications";
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
                    <ListDivider className={styles["app__drawer-divider"]} />
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
                            >
                                <SnackbarQueue messages={notifications} />
                            </div>
                        </div>
                    </div>
                ),
                [Component, pageProps]
            )}
        </DrawerToggle>
    );
};

const Provider: React.FC<AppProps> = (appProps) => (
    <UrqlProvider value={client}>
        <ReduxProvider store={store}>
            <ThemeProvider options={theme}>
                <App {...appProps} />
            </ThemeProvider>
        </ReduxProvider>
    </UrqlProvider>
);

export { Provider as App };
