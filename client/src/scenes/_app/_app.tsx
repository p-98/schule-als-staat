/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@rmwc/theme";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

// drawer imports
import "@material/drawer/dist/mdc.drawer.css";

// local
import { Page } from "Components/page/page";
import { store } from "Utility/redux/store";
import { MainAppBar } from "Components/appBar/mainAppBar";
import { DrawerToggle } from "Components/drawerToggle/drawerToggle";
import { useSelector, selectDrawerOpen } from "Utility/hooks/redux/drawer";
import { Navigation } from "./components/navigation";
import theme from "../../util/theme";

import styles from "./_app.module.scss";

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const drawerOpen = useSelector(selectDrawerOpen);

    return (
        <DrawerToggle
            className={styles["app"]}
            open={drawerOpen}
            drawer={
                <Drawer>
                    <DrawerHeader>
                        <DrawerTitle>Schule als Staat</DrawerTitle>
                    </DrawerHeader>
                    <DrawerContent>
                        <Navigation />
                    </DrawerContent>
                </Drawer>
            }
        >
            <Page topAppBar={<MainAppBar />}>
                <Component {...pageProps} />
                <div id="fullscreen" className={styles["app__fullscreen"]} />
            </Page>
        </DrawerToggle>
    );
};

const Provider = (appProps: AppProps): JSX.Element => (
    <ReduxProvider store={store}>
        <ThemeProvider options={theme}>
            <App {...appProps} />
        </ThemeProvider>
    </ReduxProvider>
);

export { Provider as App };
