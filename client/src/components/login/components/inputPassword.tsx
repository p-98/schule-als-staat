import { type ResultOf } from "@graphql-typed-document-node/core";
import {
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react";
import { useMutation } from "urql";
import { pick } from "lodash/fp";
import {
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardInner,
    CardDivider,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";

// local
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { byCode, safeData, useCategorizeError } from "Utility/urql";
import { UserBanner } from "./userBanner";

export const InputPassword_UserFragment = graphql(/* GraphQL */ `
    fragment InputPassword_UserFragment on User {
        type
        id
        ...UserBanner_UserFragment
    }
`);

const m = graphql(/* GraphQL */ `
    mutation InputPasswordMutation(
        $type: UserType!
        $id: ID!
        $password: String
    ) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            __typename
        }
    }
`);

export interface IInputPasswordProps<TMutation extends typeof m>
    extends React.HTMLAttributes<HTMLDivElement> {
    mutation: TMutation;
    cancelButton: { label: string };
    onCancel: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (user: ResultOf<TMutation>["login"]) => void;
    user: FragmentType<typeof InputPassword_UserFragment>;
    userBanner: { label: string };
    title: string;
    actionSummary?: ReactNode;
    id: string;
}
export const InputPassword = <TMutation extends typeof m>({
    mutation,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    user: _user,
    userBanner,
    title,
    actionSummary,
    id,
    ...restProps
}: IInputPasswordProps<TMutation>): ReactElement => {
    const user = useFragment(InputPassword_UserFragment, _user);
    const [password, setPassword] = useState("");
    const [result, login] = useMutation(mutation);

    const { data, fetching, error } = safeData(result);
    useEffect(() => data && onSuccess(data.login), [data, onSuccess]);
    const [wrongPassword] = useCategorizeError(error, [
        byCode("WRONG_PASSWORD"),
    ]);

    const handleConfirm = useCallback(
        async (_pw: string) => {
            if (data) return onSuccess(data.login);
            // first prevents refetching
            if (fetching) return;
            await login({
                ...pick(["type", "id"], user),
                password: _pw,
            });
        },
        [data, onSuccess, fetching, login, user]
    );
    const handleCancel = useCallback(() => {
        setPassword("");
        onCancel();
    }, [onCancel]);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardHeader>{title}</CardHeader>
            {actionSummary && (
                <>
                    {actionSummary}
                    <CardDivider />
                </>
            )}
            <CardContent>
                <UserBanner label={userBanner.label} user={user} />
                <TextField
                    type="password"
                    id={id}
                    label="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    invalid={!!wrongPassword}
                    helpText={{
                        validationMsg: true,
                        children: wrongPassword?.message ?? "",
                    }}
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
