import { forwardRef } from "react";
import {
    CardActionButtons,
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/card/card";
import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import UserBanner from "./userBanner";
import type { TOnAuthUser, TUser } from "../types";

import styles from "../login.module.css";

interface IPasswordProps extends React.HTMLAttributes<HTMLDivElement> {
    cancelButton?: {
        onClick: () => void;
        label: string;
    };
    onAuthUser: TOnAuthUser;
    confirmButtonLabel: string;
    user: TUser | null;
    userBannerLabel: string;
    header: string;
}
const Password = forwardRef<HTMLDivElement, IPasswordProps>(
    (
        {
            cancelButton,
            confirmButtonLabel,
            userBannerLabel,
            onAuthUser,
            user,
            header,
            ...restProps
        },
        ref
    ) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner ref={ref} {...restProps}>
            <CardHeader>{header}</CardHeader>
            <CardContent>
                <UserBanner label={userBannerLabel} />
                <TextField label="Passwort" />
            </CardContent>
            <CardActions>
                <CardActionButtons
                    className={styles["login__card-action-buttons"]}
                >
                    <CardActionButton
                        onClick={() => cancelButton?.onClick()}
                        style={{
                            opacity: cancelButton ? 1 : 0,
                        }}
                    >
                        {cancelButton?.label}
                    </CardActionButton>
                    <CardActionButton
                        raised
                        onClick={() => onAuthUser(user as TUser)}
                    >
                        {confirmButtonLabel}
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </CardInner>
    )
);
export default Password;
