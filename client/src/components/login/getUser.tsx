import { useState } from "react";
import cn from "classnames";

// local
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { type FragmentType, graphql } from "Utility/graphql";
import { InputQr } from "./components/inputQr";
import { InputUser } from "./components/inputUser";

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

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface IGetUserProps extends React.HTMLAttributes<HTMLDivElement> {
    confirmButton: { label: string };
    onSuccess: (user: FragmentType<typeof Signature_UserFragment>) => void;
    title: string;
}
export const GetUser: React.FC<IGetUserProps> = ({
    confirmButton,
    onSuccess,
    title,
    ...restProps
}) => {
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
                    query={qrQuery}
                    title={title}
                    onUseKeyboard={() => setInput(Input.Keyboard)}
                    onSuccess={onSuccess}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                <InputUser
                    query={keyboardQuery}
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
