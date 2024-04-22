import { type ReactElement, useState } from "react";
import { ResultOf } from "@graphql-typed-document-node/core";
import cn from "classnames";

// local
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { graphql } from "Utility/graphql";
import { InputQr, defaultQuery as defaultQrQuery } from "./components/inputQr";
import {
    InputUser,
    defaultQuery as defaultUserQuery,
} from "./components/inputUser";

import styles from "./login.module.css";

export const Signature_UserFragment = graphql(/* GraphQL */ `
    fragment Signature_UserFragment on User {
        type
        id
    }
`);

const keyboardQuery = graphql(/* GraphQL */ `
    query Keyboard__GetUserQuery($type: UserType!, $id: String!) {
        user(user: { type: $type, id: $id }) {
            ...Signature_UserFragment
        }
    }
`);
const qrQuery = graphql(/* GraphQL */ `
    query Qr__GetUserQuery($id: ID!) {
        readCard(id: $id) {
            ...Signature_UserFragment
        }
    }
`);
export const defaultQueries = {
    qr: defaultQrQuery,
    keyboard: defaultUserQuery,
};

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface IGetUserProps<
    TQrQuery extends typeof defaultQueries.qr,
    TUserQuery extends typeof defaultQueries.keyboard,
    TAllowEmpty extends boolean = false
> extends React.HTMLAttributes<HTMLDivElement> {
    queries: { qr: TQrQuery; keyboard: TUserQuery };
    allowEmpty?: TAllowEmpty;
    confirmButton: { label: string };
    onSuccess: (
        user:
            | (TAllowEmpty extends true
                  ? ResultOf<TQrQuery>["readCard"]
                  : NonNullable<ResultOf<TQrQuery>["readCard"]>)
            | ResultOf<TUserQuery>["user"],
        cardId?: string
    ) => void;
    title: string;
}
export const GetUser = <
    TQrQuery extends typeof defaultQueries.qr,
    TUserQuery extends typeof defaultQueries.keyboard,
    TAllowEmpty extends boolean = false
>({
    queries,
    allowEmpty = false as TAllowEmpty,
    confirmButton,
    onSuccess,
    title,
    ...restProps
}: IGetUserProps<TQrQuery, TUserQuery, TAllowEmpty>): ReactElement => {
    const [input, setInput] = useState(Input.Qr);

    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(
                restProps.className,
                styles["login__transform-container"]
            )}
            activeElement={input}
        >
            <ContainerTransformElement elementKey={Input.Qr}>
                <InputQr
                    query={queries.qr}
                    allowEmpty={allowEmpty}
                    title={title}
                    onUseKeyboard={() => setInput(Input.Keyboard)}
                    onSuccess={onSuccess}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                <InputUser
                    query={queries.keyboard}
                    title={title}
                    cancelButton={{ label: "QR-Scanner" }}
                    onCancel={() => setInput(Input.Qr)}
                    confirmButton={confirmButton}
                    onSuccess={onSuccess}
                />
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
