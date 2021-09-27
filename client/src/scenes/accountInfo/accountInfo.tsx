import { useState } from "react";
import { GridCell } from "@rmwc/grid";
import cn from "classnames";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { TUser } from "Utility/types";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { Page } from "Components/page/page";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { onAfterCloneHandle } from "Utility/adapters/GetUser-FullscreenContainerTransform";
import { GetUser } from "Components/login/getUser";
import { FullscreenAppBar } from "Components/appBar/fullscreenAppBar";

import cardStyles from "Components/card/card.module.css";
import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

import { Dashboard } from "./components/dashboard";

import styles from "./accountInfo.module.css";

export const AccountInfo: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [
        expectCloseInteraction,
        predictionListeners,
    ] = usePredictionObserver();

    return (
        <PageGrid>
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <FullscreenContainerTransform
                    open={!!user}
                    className={cn(
                        "mdc-card",
                        cardStyles["card"],
                        pageGridStyles["page-grid__cell-child"]
                    )}
                    openClassName={
                        styles["account-info__fullscreen-wrapper--open"]
                    }
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
                                <Dashboard />
                            </PageGrid>
                        </Page>
                    </FullscreenContainerTransformElement>
                </FullscreenContainerTransform>
            </GridCell>
        </PageGrid>
    );
};
