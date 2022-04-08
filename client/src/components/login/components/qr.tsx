import { forwardRef, useMemo } from "react";
import { PreventSSR } from "Components/preventSSR/preventSSR";
import QRReader from "react-qr-scanner";
import {
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    CardInner,
} from "Components/material/card";
import { Typography } from "Components/material/typography";
import { MDCDialogFoundation } from "@material/dialog";

// local
import type { TUser } from "Utility/types";

import styles from "../login.module.css";

/**
 * Prevents react from rerendering the reader every time.
 * Neccessary to prevent image flickering
 */
const QRRenderSuspense: React.FC = () =>
    useMemo(
        () => (
            <QRReader
                onScan={() => null}
                onError={() => null}
                className={styles["login__qr-video"]}
            />
        ),
        []
    );
const QRFocusCatch: React.FC = () => (
    <div aria-hidden="true" className={styles["login__qr-focus-catch"]}>
        <input type="text" />
    </div>
);

interface IQRProps extends React.HTMLAttributes<HTMLDivElement> {
    // onScan: (result: string) => void;
    // onError: (error: unknown) => void;
    cancel?: {
        label: string;
        handler: () => void;
    };
    toManual: () => void;
    onGetUser: (user: TUser) => void;

    // display props
    header: string;
    infoText: string;
}
export const QR = forwardRef<HTMLDivElement, IQRProps>(
    ({ toManual, cancel, onGetUser, header, infoText, ...restProps }, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps} ref={ref}>
            <CardMedia
                square
                onClick={() => onGetUser("Max Mustermann")}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...{
                    [MDCDialogFoundation.strings.INITIAL_FOCUS_ATTRIBUTE]: true,
                }}
            >
                <QRFocusCatch />
                <PreventSSR>
                    <QRRenderSuspense />
                </PreventSSR>
            </CardMedia>
            <CardHeader>{header}</CardHeader>
            <CardContent>
                <Typography use="body1" theme="textSecondaryOnBackground">
                    {infoText}
                </Typography>
            </CardContent>
            <CardActions dialogLayout>
                {cancel && (
                    <CardActionButton onClick={cancel.handler}>
                        {cancel.label}
                    </CardActionButton>
                )}
                <CardActionButton onClick={toManual}>
                    Manuelle Eingabe
                </CardActionButton>
            </CardActions>
        </CardInner>
    )
);
