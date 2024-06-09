import cn from "classnames";
import { GridCell } from "Components/material/grid";
import { useState } from "react";
import { cardClassNames } from "Components/material/card";

// local
import { FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import { GridPage } from "Components/page/page";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { InputUser, adapterFCT } from "Components/credentials/inputUser";
import { UserDashboard } from "./components/userDashboard";
import { ChangeCurrencies } from "./components/changeCurrencies";
import { BankUserContext, fragmentData } from "./util/context";

import styles from "./bank.module.css";

const { onOpen, onClose, onClosed } = adapterFCT;

export const Bank: React.FC = () => {
    const [user, setUser] = useState<object>();
    const [expectCloseInteraction, predictionListeners] =
        usePredictionObserver();

    return (
        <BankUserContext.Provider value={fragmentData}>
            <DrawerAppBarHandle title="Bank" />
            <GridPage>
                <GridCell desktop={4} tablet={2} phone={0} />
                <GridCell span={4}>
                    <FCT
                        open={!!user}
                        openWillChange={!user || expectCloseInteraction}
                        className={cn(cardClassNames, styles["bank__fct"])}
                        handle={
                            <InputUser
                                qrAction={() => Promise.resolve({ data: [] })}
                                kbAction={() => Promise.resolve({ data: [] })}
                                title="Konto wählen"
                                confirmButton={{ label: "Bestätigen" }}
                                onSuccess={(_user) => setUser(_user)}
                            />
                        }
                        fullscreen={
                            <GridPage>
                                <FullscreenAppBarHandle
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...predictionListeners}
                                    onClose={() => setUser(undefined)}
                                    render={!!user}
                                />
                                <UserDashboard />
                                <ChangeCurrencies />
                            </GridPage>
                        }
                        onOpen={onOpen}
                        onClose={onClose}
                        onClosed={onClosed}
                    />
                </GridCell>
            </GridPage>
        </BankUserContext.Provider>
    );
};
