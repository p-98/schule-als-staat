import { GridCell } from "@rmwc/grid";
import { useState } from "react";
import { Card } from "Components/card/card";
import cn from "classnames";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import {
    Modes,
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import FullscreenContainerTransform, {
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import PageGrid from "Components/pageGrid/pageGrid";
import Login from "Components/login/login";
import Page from "Components/page/page";
import FullscreenAppBar from "Components/appBar/fullscreenAppBar";

import cardStyles from "Components/card/card.module.css";
import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

import type { TUser } from "./types";
import UserDashboard from "./components/userDashboard";
import ChangeCurrencies from "./components/changeCurrencies";

function getActiveElement(user: TUser | null, exchange: number | null) {
    if (exchange !== null) return 2;
    if (user) return 1;
    return 0;
}

// const Bank: React.FC = () => {
//     const [user, setUser] = useState<TUser | null>(null);
//     const [exchange, setExchange] = useState<number | null>(null);

//     return (
//         <SiblingTransitionBase
//             mode={Modes.zAxis}
//             activeElement={getActiveElement(user, exchange)}
//             style={{ minHeight: "100%" }}
//         >
//             <SiblingTransitionBaseElement index={0}>
//                 <PageGrid>
//                     <GridCell desktop={4} tablet={2} phone={0} />
//                     <GridCell span={4}>
//                         <Card>
//                             <Login
//                                 mode="get_user"
//                                 cardHeader="Konto wählen"
//                                 confirmButtonLabel="Bestätigen"
//                                 qrInfoText="Scanne den QR-Code auf dem Ausweis, um Informationen über das Konto zu erhalten."
//                                 onGetUser={(_user) => setUser(_user)}
//                             />
//                         </Card>
//                     </GridCell>
//                 </PageGrid>
//             </SiblingTransitionBaseElement>
//             <SiblingTransitionBaseElement index={1}>
//                 <PageGrid>
//                     <UserDashboard />
//                     <ChangeCurrencies />
//                 </PageGrid>
//             </SiblingTransitionBaseElement>
//             <SiblingTransitionBaseElement index={2}>
//                 <PageGrid>
//                     <GridCell desktop={4} tablet={2} phone={0} />
//                     <GridCell span={4}>
//                         <Card>
//                             <Login
//                                 mode="authenticate_user"
//                                 cardHeader="Identität bestätigen"
//                                 confirmButtonLabel="bestätigen"
//                                 user={user as string}
//                                 userBannerLabel="Bestätigen als"
//                                 onAuthenticate={() => {
//                                     setExchange(null);
//                                     setUser(null);
//                                 }}
//                             />
//                         </Card>
//                     </GridCell>
//                 </PageGrid>
//             </SiblingTransitionBaseElement>
//         </SiblingTransitionBase>
//     );
// };
const Bank: React.FC = () => {
    const [user, setUser] = useState<TUser | null>(null);
    const [exchange, setExchange] = useState<number | null>(null);

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
                    style={{ backgroundColor: "green" }}
                    elementSwitcherMode="display"
                >
                    <FullscreenContainerTransformHandle>
                        <Login
                            mode="get_user"
                            cardHeader="Konto wählen"
                            confirmButtonLabel="Bestätigen"
                            qrInfoText="Scanne den QR-Code auf dem Ausweis, um Informationen über das Konto zu erhalten."
                            onGetUser={(_user) => setUser(_user)}
                        />
                    </FullscreenContainerTransformHandle>
                    <FullscreenContainerTransformElement>
                        <Page
                            topAppBar={
                                <FullscreenAppBar onNav={() => setUser(null)} />
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
    );

    return (
        <SiblingTransitionBase
            mode={Modes.zAxis}
            activeElement={getActiveElement(user, exchange)}
            style={{ minHeight: "100%" }}
        >
            <SiblingTransitionBaseElement index={0}>
                <PageGrid>
                    <GridCell desktop={4} tablet={2} phone={0} />
                    <GridCell span={4}>
                        <Card>
                            <Login
                                mode="get_user"
                                cardHeader="Konto wählen"
                                confirmButtonLabel="Bestätigen"
                                qrInfoText="Scanne den QR-Code auf dem Ausweis, um Informationen über das Konto zu erhalten."
                                onGetUser={(_user) => setUser(_user)}
                            />
                        </Card>
                    </GridCell>
                </PageGrid>
            </SiblingTransitionBaseElement>
            <SiblingTransitionBaseElement index={1}>
                <PageGrid>
                    <UserDashboard />
                    <ChangeCurrencies />
                </PageGrid>
            </SiblingTransitionBaseElement>
            <SiblingTransitionBaseElement index={2}>
                <PageGrid>
                    <GridCell desktop={4} tablet={2} phone={0} />
                    <GridCell span={4}>
                        <Card>
                            <Login
                                mode="authenticate_user"
                                cardHeader="Identität bestätigen"
                                confirmButtonLabel="bestätigen"
                                user={user as string}
                                userBannerLabel="Bestätigen als"
                                onAuthenticate={() => {
                                    setExchange(null);
                                    setUser(null);
                                }}
                            />
                        </Card>
                    </GridCell>
                </PageGrid>
            </SiblingTransitionBaseElement>
        </SiblingTransitionBase>
    );
};
export default Bank;
