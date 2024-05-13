import {
    ComponentPropsWithoutRef,
    ReactElement,
    ReactNode,
    useCallback,
    useState,
} from "react";
import {
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardInner,
    CardDivider,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";
import { Theme } from "Components/material/theme";

// local
import { ChangeEvent } from "Utility/types";
import { graphql } from "Utility/graphql";

export const InputPassword_UserFragment = graphql(/* GraphQL */ `
    fragment InputPassword_UserFragment on User {
        type
        id
        ...UserBanner_UserFragment
    }
`);

/** Exactly one of resulting fields must be set. */
export type TAction<TData> = (password: string | undefined) => Promise<{
    data?: TData;
    passwordError?: Error;
    unexpectedError?: Error;
}>;

export interface IInputPasswordProps<TData>
    extends ComponentPropsWithoutRef<"div"> {
    action: TAction<TData>;
    cancelButton: { label: string };
    onCancel: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (data: TData) => void;
    title: string;
    actionSummary: ReactNode;
    noPassword?: boolean;
    id: string;
}
export const InputPassword = <TData,>({
    action,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    actionSummary,
    noPassword = false,
    id,
    ...restProps
}: IInputPasswordProps<TData>): ReactElement => {
    const [password, setPassword] = useState("");
    const [fetching, setFetching] = useState(false);
    const [passwordError, setPasswordError] = useState<Error>();
    const [unexpectedError, setUnexpectedError] = useState<Error>();

    const handleConfirm = useCallback(
        async (_password: string) => {
            if (fetching) return;
            setFetching(true);
            setPasswordError(undefined);
            setUnexpectedError(undefined);
            const { data, ...errors } = await action(
                noPassword ? undefined : _password
            );
            setPasswordError(errors.passwordError);
            setUnexpectedError(errors.unexpectedError);
            setFetching(false);

            if (data) onSuccess(data);
        },
        [fetching, action, noPassword, onSuccess]
    );
    const handleCancel = useCallback(() => {
        setPassword("");
        onCancel();
    }, [onCancel]);

    const helpMsg = passwordError?.message ?? unexpectedError?.message ?? "";
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardHeader>{title}</CardHeader>
            {actionSummary && (
                <>
                    <CardContent>{actionSummary}</CardContent>
                    <CardDivider />
                </>
            )}
            <CardContent>
                <TextField
                    type="password"
                    id={id}
                    label="Passwort"
                    value={password}
                    onChange={(e: ChangeEvent) =>
                        setPassword(e.currentTarget.value)
                    }
                    invalid={!!passwordError}
                    helpText={{
                        validationMsg: true,
                        persistent: true,
                        // Themee for when crossFailed is set
                        children: <Theme use="error">{helpMsg}</Theme>,
                    }}
                    disabled={noPassword}
                />
            </CardContent>
            <CardActions dialogLayout>
                <CardActionButton
                    label={cancelButton.label}
                    onClick={handleCancel}
                />
                <CardActionButton
                    label={confirmButton.label}
                    raised
                    disabled={!password}
                    // eslint-disable-next-line no-void
                    onClick={() => void handleConfirm(password)}
                    danger={confirmButton.danger}
                />
            </CardActions>
        </CardInner>
    );
};
