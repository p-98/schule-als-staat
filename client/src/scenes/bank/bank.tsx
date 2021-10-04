import { GridCell } from "@rmwc/grid";
import { useState } from "react";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// local
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { Page } from "Components/page/page";
import { FullscreenAppBar } from "Components/appBar/fullscreenAppBar";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { GetUser } from "Components/login/getUser";
import { onAfterCloneHandle } from "Utility/adapters/GetUser-FullscreenContainerTransform";
import type { TUser } from "Utility/types";

import { cardClassNames } from "Components/card/card";

import { UserDashboard } from "./components/userDashboard";
import { ChangeCurrencies } from "./components/changeCurrencies";
import { BankUserContext } from "./util/context";

import styles from "./bank.module.css";

export const Bank: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [
        expectCloseInteraction,
        predictionListeners,
    ] = usePredictionObserver();

    return (
        <BankUserContext.Provider value={user}>
            <PageGrid>
                <GridCell desktop={4} tablet={2} phone={0} />
                <GridCell span={4}>
                    <FullscreenContainerTransform
                        open={!!user}
                        className={cardClassNames}
                        openClassName={styles["bank__fullscreen-wrapper--open"]}
                        onAfterCloneHandle={onAfterCloneHandle}
                        expectTransformation={expectCloseInteraction || !user}
                    >
                        <FullscreenContainerTransformHandle>
                            <GetUser
                                header="Konto wählen"
                                confirmButtonLabel="Bestätigen"
                                qrInfoText="Scanne den QR-Code auf dem Ausweis, um Informationen über das Konto zu erhalten."
                                onGetUser={(_user) => setUser(_user)}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...predictionListeners}
                            />
                        </FullscreenContainerTransformHandle>
                        <FullscreenContainerTransformElement>
                            <Page
                                topAppBar={
                                    <FullscreenAppBar
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...predictionListeners}
                                        onNav={() => setUser(null)}
                                    />
                                }
                            >
                                <PageGrid>
                                    <UserDashboard />
                                    <ChangeCurrencies />
                                </PageGrid>
                            </Page>
                        </FullscreenContainerTransformElement>
                    </FullscreenContainerTransform>
                </GridCell>
            </PageGrid>
        </BankUserContext.Provider>
    );
};
