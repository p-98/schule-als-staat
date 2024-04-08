/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { Provider as ReduxProvider } from "react-redux";
import { Provider as UrqlProvider, useQuery } from "urql";
import { useEffect, useState } from "react";
import { ThemeProvider } from "Components/material/theme";
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
import { categorizeError, client, useSafeData } from "Utility/urql";
import { graphql } from "Utility/graphql";
import { DynamicAppBarDisplay } from "Components/dynamicAppBar/dynamicAppBar";
import { messages as notifications } from "Utility/notifications";
import theme from "../../util/theme";
import { Drawer } from "./components/drawer";
import { AppFallback } from "./components/fallback";

import styles from "./_app.module.scss";

const query = graphql(/* GraphQL */ `
    query AppQuery {
        session {
            ...Drawer_SessionFragment
        }
    }
`);

/** Prevent short flashing of fallback. */
export const useNoFlash = (b: boolean) => {
    const [noFlash, setNoFlash] = useState(false);
    useEffect(() => {
        if (b !== true) {
            setNoFlash(false);
            return;
        }
        const timer = setTimeout(() => setNoFlash(true), 200);
        return () => clearTimeout(timer);
    }, [b]);
    return noFlash;
};

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
    const drawerOpen = useSelector(selectDrawerOpen);
    const drawerDispatch = useDispatch();

    const [result] = useQuery({ query });
    const { data, fetching, error } = useSafeData(result);
    categorizeError(error, []);
    if (useNoFlash(fetching)) return <AppFallback />;
    if (!data) return <></>;

    return (
        <DrawerToggle
            className={styles["app"]}
            id="rmwcPortal"
            open={drawerOpen}
            onClose={() => drawerDispatch(close())}
            drawer={<Drawer session={data.session} />}
        >
            <div className={styles["app__bar-wrapper"]}>
                <DynamicAppBarDisplay />
                <div className={styles["app__fullscreen-wrapper"]}>
                    <Component {...pageProps} />
                    <div id="fullscreen" className={styles["app__fullscreen"]}>
                        <SnackbarQueue messages={notifications} />
                    </div>
                </div>
            </div>
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
