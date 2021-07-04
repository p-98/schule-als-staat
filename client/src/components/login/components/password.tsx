import { forwardRef } from "react";
import { CardActionButtons, CardActionButton, CardActions } from "@rmwc/card";
import { TextField } from "@rmwc/textfield";

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

// local
import UserBanner from "./userBanner";
import type { TUser } from "../types";

import styles from "../login.module.css";

interface IPasswordProps {
    goBack: () => void;
    onAuthenticate: (user: TUser) => void;
    hideBackButton?: boolean;
    confirmButtonLabel: string;
    user: TUser | null;
    userBannerLabel: string;
}
const Password = forwardRef<HTMLDivElement, IPasswordProps>(
    (
        {
            goBack,
            hideBackButton = false,
            confirmButtonLabel,
            userBannerLabel,
            onAuthenticate,
            user,
            ...restProps
        },
        ref
    ) => (
        <div ref={ref} {...restProps}>
            <div className={styles["login__card-content"]}>
                <UserBanner label={userBannerLabel} />
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
                    <CardActionButton
                        raised
                        onClick={() => onAuthenticate(user as TUser)}
                    >
                        {confirmButtonLabel}
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </div>
    )
);
export default Password;
