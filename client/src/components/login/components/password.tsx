import { forwardRef } from "react";
import {
    Card,
    CardActionButtons,
    CardActionButton,
    CardActions,
} from "@rmwc/card";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import UserBanner from "./userBanner";

import styles from "../login.module.css";

interface IPasswordProps {
    goBack: () => void;
    onLogin: () => void;
    hideBackButton?: boolean;
}
const Password = forwardRef<HTMLDivElement, IPasswordProps>(
    ({ goBack, hideBackButton = false, ...restProps }, ref) => (
        <div ref={ref} {...restProps}>
            <div className={styles["login__card-content"]}>
                <UserBanner />
                <TextField label="Passwort" />
            </div>
            <CardActions>
                <CardActionButtons
                    className={styles["login__card-action-buttons"]}
                >
                    <CardActionButton
                        onClick={() => goBack()}
                        style={{
                            opacity: hideBackButton ? 0 : 1,
                        }}
                    >
                        Zurück
                    </CardActionButton>
                    <CardActionButton raised>Anmelden</CardActionButton>
                </CardActionButtons>
            </CardActions>
        </div>
    )
);
export default Password;

interface IPasswordCardProps {
    user?: string;
    onLogin: () => void;
    goBack: () => void;

    // display props
    header: string;
}
export const PasswordCard: React.FC<IPasswordCardProps> = ({
    header,
    user,
    onLogin,
    goBack,
}) => (
    <Card className={styles["login__card"]}>
        <Typography use="headline6" className={styles["login__card-header"]}>
            {header}
        </Typography>
        <Password hideBackButton={!!user} goBack={goBack} onLogin={onLogin} />
    </Card>
);
