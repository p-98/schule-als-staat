import { useState } from "react";
import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// local
import { TUser } from "Utility/types";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { GridPage } from "Components/page/page";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { onAfterCloneHandle } from "Utility/adapters/GetUser-FullscreenContainerTransform";
import { GetUser } from "Components/login/getUser";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";

import { cardClassNames } from "Components/card/card";

import { Dashboard } from "./components/dashboard";

import styles from "./accountInfo.module.css";

export const AccountInfo: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [
        expectCloseInteraction,
        predictionListeners,
    ] = usePredictionObserver();

    return (
        <GridPage>
            <DrawerAppBarHandle title="Kontoinformationen" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <FullscreenContainerTransform
                    open={!!user}
                    className={cardClassNames}
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
                        <GridPage>
                            <FullscreenAppBarHandle
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...predictionListeners}
                                onClose={() => setUser(null)}
                                render={!!user}
                            />
                            <Dashboard />
                        </GridPage>
                    </FullscreenContainerTransformElement>
                </FullscreenContainerTransform>
            </GridCell>
        </GridPage>
    );
};
