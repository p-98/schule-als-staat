import { GridCell } from "Components/material/grid";
import { useState } from "react";
import { cardClassNames } from "Components/material/card";

// local
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { GridPage } from "Components/page/page";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { GetUser } from "Components/login/getUser";
import { onAfterCloneHandle } from "Utility/adapters/GetUser-FullscreenContainerTransform";
import type { TUser } from "Utility/types";
import { UserDashboard } from "./components/userDashboard";
import { ChangeCurrencies } from "./components/changeCurrencies";
import { BankUserContext } from "./util/context";

import styles from "./bank.module.css";

export const Bank: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [expectCloseInteraction, predictionListeners] =
        usePredictionObserver();

    return (
        <BankUserContext.Provider value={user}>
            <DrawerAppBarHandle title="Bank" />
            <GridPage>
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
                                <UserDashboard />
                                <ChangeCurrencies />
                            </GridPage>
                        </FullscreenContainerTransformElement>
                    </FullscreenContainerTransform>
                </GridCell>
            </GridPage>
        </BankUserContext.Provider>
    );
};
