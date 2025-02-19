import { ResultOf } from "@graphql-typed-document-node/core";
import { endsWith } from "lodash/fp";
import cn from "classnames";
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
import { type FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { useCache } from "Utility/hooks/useCache";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { UserType } from "Utility/graphql/graphql";
import { event, getByClass, syncifyF } from "Utility/misc";
import { InputQr, TAction as TQrAction } from "Components/qr/qr";
import { InputUserKb, TAction as TKbAction } from "./inputUserKb";
import { InputPassword } from "./inputPassword";

import css from "./credentials.module.css";

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
    categorizeError(error, []);
    return {
        data: data?.readCard ?? undefined, // prevent null
        unspecificError: error,
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
    /** Whether the qr scanner is active */
    scanQr: boolean;
    cancelButton?: { label: string };
    onCancel?: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (data: Data) => void;
    title: string;
    actionSummary:
        | ReactNode
        | ((user: ResultOf<typeof Login_UserFragment>) => ReactNode);
    /** Adapter flag whether inside a dialog */
    dialog?: boolean;
}
export const InputCredentials = <Data,>({
    action,
    scanQr,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    actionSummary,
    dialog,
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
            className={cn(
                restProps.className,
                dialog && css["credentials--dialog"]
            )}
            activeElement={_user ? "PASSWORD" : input}
        >
            <ContainerTransformElement elementKey={Input.Qr}>
                {/* Qr input */}
                <InputQr
                    action={qrAction}
                    scan={input === Input.Qr && !user && scanQr}
                    onUnavailable={() => setInput(Input.Keyboard)}
                    cancelButton={cancelButton}
                    onCancel={onCancel}
                    mainButton={{ label: "Manuelle Eingabe" }}
                    onMain={() => setInput(Input.Keyboard)}
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

/** Adapter for <FCT> when <InputCredentials> is used as handle
 *
 * Expects <InputCredentials> to be remounted between open and close.
 */
type AdapterFCT = Pick<
    ComponentPropsWithoutRef<typeof FCT>,
    "onClose" | "onClosed"
>;
export const adapterFCT: AdapterFCT = {
    onClose: (ancestor, portalAncestor) => {
        const portalQr = getByClass("input-qr__qr", portalAncestor);
        portalQr.remove();
    },
    onClosed: syncifyF(async (ancestor) => {
        const qr = getByClass("input-qr__qr", ancestor);
        qr.classList.add(css["input-credentials__qr--fade-back"]!);
        await event("animationend", qr);
        qr.classList.remove(css["input-credentials__qr--fade-back"]!);
    }),
};
