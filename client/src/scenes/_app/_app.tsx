/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { ThemeProvider } from "@rmwc/theme";

// local
import Page from "Components/page/page";
import store from "Utility/redux/store";
import MainAppBar from "Components/appBar/mainAppBar";
import Drawer from "./components/drawer";
import theme from "./theme";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

import styles from "./_app.module.scss";

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
    <Provider store={store}>
        <ThemeProvider options={theme}>
            <div className={styles["app"]}>
                <Drawer />
                <Page
                    className={styles["app__header-page-wrapper"]}
                    topAppBar={<MainAppBar />}
                >
                    <Component {...pageProps} />
                    <div
                        id="fullscreen"
                        className={styles["app__fullscreen"]}
                    />
                </Page>
            </div>
        </ThemeProvider>
    </Provider>
);
export default App;
