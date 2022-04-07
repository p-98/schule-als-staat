import { useState } from "react";
import { triggerWindowResize } from "Components/material/base";
import { SimpleListItem, ListItemText } from "Components/material/list";
import { Theme } from "Components/material/theme";
import { Typography } from "Components/material/typography";

// local
import { TWithVoteProp } from "Utility/types";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
    TOnAfterCloneHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { GridPage } from "Components/page/page";
import { FullscreenAppBarHandle } from "Components/dynamicAppBar/presets";
import usePredictionObserver from "Utility/hooks/predictionObserver/predictionObserver";
import { DetailPage } from "./detailPage";

import styles from "../vote.module.css";

const onAfterCloneHandle: TOnAfterCloneHandle = (
    handleDOM,
    portalHandleDOM,
    action,
    msToTransformEnd
) => {
    if (action === "opening") {
        const timeSinceClick =
            performance.now() -
            parseFloat(handleDOM.dataset.clickTime as string);

        portalHandleDOM.style.setProperty(
            "--delay",
            `${75 - timeSinceClick}ms`
        );

        // TODO: add handlers for more events on FullscreenContainerTransform
        // fix sliders not working
        setTimeout(triggerWindowResize, msToTransformEnd);
    }
};

export const VoteListItem: React.FC<TWithVoteProp> = ({ vote }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [expectOpen, openListeners] = usePredictionObserver();
    const [expectClose, closeListeners] = usePredictionObserver();

    return (
        <Theme use="surface" wrap>
            <FullscreenContainerTransform
                open={showDetails}
                expectTransformation={expectOpen || expectClose}
                onAfterCloneHandle={onAfterCloneHandle}
            >
                <FullscreenContainerTransformHandle>
                    <SimpleListItem
                        graphic={vote.icon}
                        text={
                            <ListItemText>
                                <Typography use="subtitle1">
                                    {vote.title}
                                </Typography>
                            </ListItemText>
                        }
                        meta={
                            vote.end.getDate() === new Date().getDate()
                                ? // today
                                  vote.end.toLocaleTimeString(undefined, {
                                      timeStyle: "short",
                                  })
                                : // other day
                                  vote.end.toLocaleDateString(undefined, {
                                      month: "2-digit",
                                      day: "2-digit",
                                  })
                        }
                        onMouseDown={(e) => {
                            // eslint-disable-next-line no-param-reassign
                            e.currentTarget.dataset.clickTime = performance
                                .now()
                                .toString();
                        }}
                        onClick={() => setShowDetails(true)}
                        className={styles["vote__list-item"]}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...openListeners}
                    />
                </FullscreenContainerTransformHandle>
                <FullscreenContainerTransformElement>
                    <GridPage>
                        <FullscreenAppBarHandle
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...closeListeners}
                            onClose={() => setShowDetails(false)}
                            render={showDetails}
                        />
                        <DetailPage vote={vote} />
                    </GridPage>
                </FullscreenContainerTransformElement>
            </FullscreenContainerTransform>
        </Theme>
    );
};
