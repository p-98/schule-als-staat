/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Provider as ReduxProvider } from "react-redux";
import { type FC } from "react";
import { Provider as UrqlProvider, useQuery } from "urql";
import { ThemeProvider } from "Components/material/theme";
import { SnackbarQueue } from "Components/material/snackbar";
import { SimpleDialog } from "Components/material/dialog/dialog";

// local
import { store } from "Utility/redux/store";
import { DrawerToggle } from "Components/drawerToggle/drawerToggle";
import {
    useSelector,
    selectDrawerOpen,
    useDispatch,
    close,
} from "Utility/hooks/redux/drawer";
import { client, useSafeData, useStable } from "Utility/urql";
import { graphql } from "Utility/graphql";
import { DynamicAppBarDisplay } from "Components/dynamicAppBar/dynamicAppBar";
import { messages as notifications } from "Utility/notifications";
import theme from "../../util/theme";
import { Drawer } from "./components/drawer";
import { AppFallback } from "./components/fallback";
import { useCheckRouteAndAuth } from "./util/routing";
import { SessionUserProvider } from "./contexts";

import styles from "./_app.module.scss";

const query = graphql(/* GraphQL */ `
    query AppQuery {
        session {
            id
            ...Session_SessionFragment
            ...Drawer_SessionFragment
            ...Routing_SessionFragment
        }
    }
`);

const Error: FC = () => {
    const router = useRouter();
    return (
        <SimpleDialog
            open
            preventOutsideDismiss
            renderToPortal={false}
            title="Nope."
            content="Leider kann im Moment keine Verbindung hergestellt werdern. Bitte versuche es später erneut."
            accept={{
                label: "Erneut versuchen",
                onAccept: () => router.reload(),
            }}
        />
    );
};

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
    const drawerOpen = useSelector(selectDrawerOpen);
    const drawerDispatch = useDispatch();

    const [result] = useQuery({ query });
    const { data, fetching, error, stale } = useSafeData(result);
    const authorized = useCheckRouteAndAuth(
        fetching || stale ? undefined : data?.session
    );
    if (useStable(fetching)) return <AppFallback />;
    if (error) return <Error />;
    if (!data || !authorized) return <></>;

    return (
        <SessionUserProvider value={data.session}>
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
                        <div
                            id="fullscreen"
                            className={styles["app__fullscreen"]}
                        >
                            <SnackbarQueue messages={notifications} />
                        </div>
                    </div>
                </div>
            </DrawerToggle>
        </SessionUserProvider>
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
