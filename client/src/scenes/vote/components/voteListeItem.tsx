import { useState } from "react";
import { triggerWindowResize } from "@rmwc/base";
import { SimpleListItem, ListItemText } from "@rmwc/list";
import { Theme } from "@rmwc/theme";
import { Typography } from "@rmwc/typography";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// elevation imports
import "@material/elevation/dist/mdc.elevation.css";

// local
import { TWithVoteProp } from "Utility/types";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
    TOnAfterCloneHandle,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { Page } from "Components/page/page";
import { FullscreenAppBar } from "Components/appBar/fullscreenAppBar";
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
                    <Page
                        topAppBar={
                            <FullscreenAppBar
                                onNav={() => setShowDetails(false)}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...closeListeners}
                            />
                        }
                    >
                        <DetailPage vote={vote} />
                    </Page>
                </FullscreenContainerTransformElement>
            </FullscreenContainerTransform>
        </Theme>
    );
};
