import { useState } from "react";
import { GridCell } from "Components/material/grid";
import { cardClassNames } from "Components/material/card";

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
import { Dashboard } from "./components/dashboard";

import styles from "./accountInfo.module.css";

export const AccountInfo: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [expectCloseInteraction, predictionListeners] =
        usePredictionObserver();

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
                            title="Konto wählen"
                            confirmButton={{ label: "Bestätigen" }}
                            onSuccess={() => setUser("Max Mustermann")}
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
