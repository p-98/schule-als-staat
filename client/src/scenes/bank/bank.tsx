import { GridCell } from "@rmwc/grid";
import { useState } from "react";
import cn from "classnames";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// local
import FullscreenContainerTransform, {
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
    TOnAfterCloneHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import PageGrid from "Components/pageGrid/pageGrid";
import Login from "Components/login/login";
import Page from "Components/page/page";
import FullscreenAppBar from "Components/appBar/fullscreenAppBar";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";

import cardStyles from "Components/card/card.module.css";
import pageGridStyles from "Components/pageGrid/pageGrid.module.css";
import loginStyles from "Components/login/login.module.css";

import type { TUser } from "./types";
import UserDashboard from "./components/userDashboard";
import ChangeCurrencies from "./components/changeCurrencies";

import styles from "./bank.module.css";

const onAfterCloneHandle: TOnAfterCloneHandle = (
    handleDOM,
    portalHandleDOM,
    action,
    msToTransformEnd
) => {
    const videoDOM = handleDOM.getElementsByTagName(
        "video"
    )[0] as HTMLVideoElement;
    const portalVideo = portalHandleDOM.getElementsByTagName(
        "video"
    )[0] as HTMLVideoElement;

    if (action === "opening") {
        // replace video with image displaying current the current video frame
        const imgCanvas = document.createElement("canvas");
        imgCanvas.classList.add(loginStyles["login__qr-video"] as string);
        imgCanvas.width = videoDOM.videoWidth;
        imgCanvas.height = videoDOM.videoHeight;

        const imgContext = imgCanvas.getContext("2d");
        imgContext?.drawImage(videoDOM, 0, 0);

        portalVideo.replaceWith(imgCanvas);
    }

    if (action === "closing") {
        // fade in video after transform has finished
        videoDOM.style.opacity = "0";
        const transitionTime = msToTransformEnd;
        // 200ms decelerated easing
        videoDOM.style.transition = `opacity 250ms cubic-bezier(0.0, 0.0, 0.2, 1)`;

        setTimeout(() => {
            videoDOM.style.opacity = "1";
        }, msToTransformEnd);

        setTimeout(() => {
            videoDOM.style.opacity = "";
            videoDOM.style.transition = "";
        }, msToTransformEnd + transitionTime);
    }
};

const Bank: React.FC = () => {
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
                    openClassName={styles["bank__fullscreen-wrapper--open"]}
                    onAfterCloneHandle={onAfterCloneHandle}
                    expectTransformation={expectCloseInteraction || !user}
                    // DEBUG
                    // style={{ backgroundColor: "green" }}
                >
                    <FullscreenContainerTransformHandle>
                        <Login
                            mode="get_user"
                            cardHeader="Konto wählen"
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
    );
};
export default Bank;
