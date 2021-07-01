import { forwardRef, useMemo } from "react";
import PreventSSR from "Components/preventSSR/preventSSR";
import QRReader from "react-qr-scanner";
import {
    CardActions,
    CardActionButton,
    CardActionButtons,
    CardMedia,
} from "@rmwc/card";
import { Typography } from "@rmwc/typography";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
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
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        ),
        []
    );

interface IQRProps extends React.HTMLAttributes<HTMLDivElement> {
    // onScan: (result: string) => void;
    // onError: (error: unknown) => void;
    toManual: () => void;
    toPassword: () => void;

    // display props
    header: string;
    infoText: string;
}
const QR = forwardRef<HTMLDivElement, IQRProps>(
    ({ toManual, toPassword, header, infoText, ...restProps }, ref) => (
        <div {...restProps} ref={ref}>
            <CardMedia square onClick={toPassword}>
                <PreventSSR>
                    <QRRenderSuspense />
                </PreventSSR>
            </CardMedia>
            <Typography
                use="headline6"
                className={styles["login__card-header"]}
            >
                Anmelden
            </Typography>
            <div className={styles["login__card-content"]}>
                <Typography use="body1" theme="textSecondaryOnBackground">
                    Scanne den QR-Code auf dem Ausweis um dich anzumelden.
                </Typography>
            </div>
            <CardActions>
                <CardActionButtons
                    className={styles["login__card-action-buttons"]}
                >
                    <CardActionButton onClick={toManual}>
                        Manuelle Eingabe
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </div>
    )
);
export default QR;
