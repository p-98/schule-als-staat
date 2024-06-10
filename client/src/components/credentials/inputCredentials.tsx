import { ResultOf } from "@graphql-typed-document-node/core";
import { endsWith } from "lodash/fp";
import {
    ComponentPropsWithoutRef,
    ReactElement,
    ReactNode,
    useState,
} from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { useCache } from "Utility/hooks/useCache";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { UserType } from "Utility/graphql/graphql";
import { InputUserQr, TAction as TQrAction } from "./components/inputUserQr";
import { InputUserKb, TAction as TKbAction } from "./components/inputUserKb";
import { InputPassword } from "./inputPassword";

export const Login_UserFragment = graphql(/* GraohQL */ `
    fragment Login_UserFragment on User {
        type
        id
        ...InputPassword_UserFragment
        ...UserBanner_UserFragment
    }
`);
const qrQuery = graphql(/* GraphQL */ `
    query Qr_LoginQuery($id: ID!) {
        readCard(id: $id) {
            id
            ...Login_UserFragment
        }
    }
`);
const keyboardQuery = graphql(/* GraphQL */ `
    query Keyboard_LoginQuery($type: UserType!, $id: String!) {
        user(user: { type: $type, id: $id }) {
            id
            ...Login_UserFragment
        }
    }
`);
const qrAction: TQrAction<FragmentType<typeof Login_UserFragment>> = async (
    id
) => {
    const result = await client.query(
        qrQuery,
        { id },
        { requestPolicy: "network-only" }
    );
    const { data, error } = safeData(result);
    const [idError] = categorizeError(error, [byCode(endsWith("NOT_FOUND"))]);
    return {
        data: data?.readCard ?? undefined, // prevent null
        emptyError: !error && !data?.readCard,
        idError,
    };
};
const kbAction: TKbAction<FragmentType<typeof Login_UserFragment>> = async (
    type,
    id
) => {
    const result = await client.query(
        keyboardQuery,
        { id, type },
        { requestPolicy: "network-only" }
    );
    const { data, error } = safeData(result);
    const [idError] = categorizeError(error, [byCode(endsWith("NOT_FOUND"))]);
    return { data: data?.user, idError };
};

/** Exactly one of resulting fields must be set. */
export type TAction<Data> = (
    type: UserType,
    id: string,
    password: string | undefined
) => Promise<{
    data?: Data;
    passwordError?: Error;
    unspecificError?: Error;
}>;

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface IInputCredentialsProps<Data> extends ComponentPropsWithoutRef<"div"> {
    action: TAction<Data>;
    cancelButton?: { label: string };
    onCancel?: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (data: Data) => void;
    title: string;
    actionSummary:
        | ReactNode
        | ((user: ResultOf<typeof Login_UserFragment>) => ReactNode);
}
export const InputCredentials = <Data,>({
    action,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    actionSummary,
    ...restProps
}: IInputCredentialsProps<Data>): ReactElement => {
    const [input, setInput] = useState(Input.Qr);
    const [_user, _setUser] =
        useState<FragmentType<typeof Login_UserFragment>>();
    const user = useFragment(Login_UserFragment, _user);
    const cachedUser = useCache(user);

    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            activeElement={_user ? "PASSWORD" : input}
        >
            <ContainerTransformElement elementKey={Input.Qr}>
                {/* Qr input */}
                <InputUserQr
                    action={qrAction}
                    onUseKeyboard={() => setInput(Input.Keyboard)}
                    cancelButton={cancelButton}
                    onCancel={onCancel}
                    onSuccess={_setUser}
                    title={title}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                {/* Keyboard input */}
                <InputUserKb
                    action={kbAction}
                    cancelButton={{ label: "QR-Scanner" }}
                    onCancel={() => setInput(Input.Qr)}
                    confirmButton={{ label: "Weiter" }}
                    onSuccess={_setUser}
                    title={title}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="PASSWORD">
                <div>
                    {cachedUser && (
                        <InputPassword
                            action={(pw) => action(user!.type, user!.id, pw)}
                            cancelButton={{ label: "Zurück" }}
                            onCancel={() => _setUser(undefined)}
                            confirmButton={confirmButton}
                            onSuccess={onSuccess}
                            title={title}
                            actionSummary={
                                typeof actionSummary === "function"
                                    ? actionSummary(cachedUser)
                                    : actionSummary
                            }
                            id="login__password"
                        />
                    )}
                </div>
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
