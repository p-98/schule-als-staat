/* eslint-disable react/jsx-props-no-spreading */

import type { AppProps } from "next/app";
import {
    TopAppBar,
    TopAppBarRow,
    TopAppBarSection,
    TopAppBarNavigationIcon,
} from "@rmwc/top-app-bar";
import { useState } from "react";

// top app bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import Drawer from "./_app/components/drawer";

import styles from "./_app/_app.module.scss";

const App = ({ Component: Page, pageProps }: AppProps): JSX.Element => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    console.log(drawerOpen);

    return (
        <div className={styles["app"]}>
            <Drawer open={drawerOpen} setOpen={setDrawerOpen} />
            <div className={styles["app__header-page-wrapper"]}>
                <TopAppBar className={styles["app__header"]}>
                    <TopAppBarRow>
                        <TopAppBarSection>
                            <TopAppBarNavigationIcon
                                icon="menu"
                                onClick={() => setDrawerOpen(!drawerOpen)}
                            />
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
                <div className={styles["app__page"]}>
                    <Page {...pageProps} />
                </div>
            </div>
        </div>
    );
};
export default App;
