import { forwardRef, ReactNode } from "react";
import {
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardInner,
    CardDivider,
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
import type { TUser } from "Utility/types";
import { UserBanner } from "./userBanner";
import type { TOnAuthUser } from "../types";

export interface IPasswordProps extends React.HTMLAttributes<HTMLDivElement> {
    cancelButton?: {
        onClick: () => void;
        label: string;
    };
    confirmButton: {
        label: string;
        danger?: boolean;
    };
    onAuthUser: TOnAuthUser;
    user: TUser | null;
    userBannerLabel: string;
    header: string;
    actionSummary?: ReactNode;
    id?: string;
}
export const Password = forwardRef<HTMLDivElement, IPasswordProps>(
    (
        {
            cancelButton,
            confirmButton,
            userBannerLabel,
            onAuthUser,
            user,
            header,
            actionSummary,
            id,
            ...restProps
        },
        ref
    ) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner ref={ref} {...restProps}>
            <CardHeader>{header}</CardHeader>
            {actionSummary && (
                <>
                    {actionSummary}
                    <CardDivider />
                </>
            )}
            <CardContent>
                <UserBanner label={userBannerLabel} />
                <TextField
                    type="password"
                    id={`login_password#${id ?? user ?? ""}`}
                    label="Passwort"
                />
            </CardContent>
            <CardActions dialogLayout>
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
                    danger={confirmButton.danger}
                >
                    {confirmButton.label}
                </CardActionButton>
            </CardActions>
        </CardInner>
    )
);
