import { forwardRef, useMemo } from "react";
import PreventSSR from "Components/preventSSR/preventSSR";
import QRReader from "react-qr-scanner";
import {
    CardActionButton,
    CardActionButtons,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    CardInner,
} from "Components/card/card";
import { Typography } from "@rmwc/typography";

// typography imports
import "@material/typography/dist/mdc.typography.css";

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

interface IQRProps extends React.HTMLAttributes<HTMLDivElement> {
    // onScan: (result: string) => void;
    // onError: (error: unknown) => void;
    toManual: () => void;
    onGetUser: (user: TUser) => void;

    // display props
    header: string;
    infoText: string;
}
const QR = forwardRef<HTMLDivElement, IQRProps>(
    ({ toManual, onGetUser, header, infoText, ...restProps }, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps} ref={ref}>
            <CardMedia square onClick={() => onGetUser("Max Mustermann")}>
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
            <CardActions>
                <CardActionButtons
                    className={styles["login__card-action-buttons"]}
                >
                    <CardActionButton onClick={toManual}>
                        Manuelle Eingabe
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </CardInner>
    )
);
export default QR;
