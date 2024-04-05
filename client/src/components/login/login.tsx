import { useCallback, useState } from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import {
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
    Modes,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import { FragmentType, graphql } from "Utility/graphql";
import { useCache } from "Utility/hooks/useCache";
import { InputQr } from "./components/inputQr";
import {
    InputPassword,
    type InputPassword_UserFragment,
} from "./components/inputPassword";
import { InputUser } from "./components/inputUser";

const Signature_UserFragment = graphql(/* GraphQL */ `
    fragment Signature_UserFragment on User {
        type
        id
    }
`);

const qrQuery = graphql(/* GraphQL */ `
    query Qr_LoginQuery($id: ID!) {
        readCard(id: $id) {
            ...InputPassword_UserFragment
        }
    }
`);
const keyboardQuery = graphql(/* GraphQL */ `
    query Keyboard_LoginQuery($type: UserType!, $id: String!) {
        user(user: { type: $type, id: $id }) {
            ...InputPassword_UserFragment
        }
    }
`);
const passwordMutation = graphql(/* GraphQL */ `
    mutation LoginMutation($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            ...Signature_UserFragment
        }
    }
`);

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface ILoginProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    userBanner: { label: string };
    cancelButton?: { label: string };
    onCancel?: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (user: FragmentType<typeof Signature_UserFragment>) => void;
}
export const Login: React.FC<ILoginProps> = ({
    title,
    userBanner,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
}) => {
    const [input, setInput] = useState(Input.Qr);
    const [user, setUser] =
        useState<FragmentType<typeof InputPassword_UserFragment>>();
    const cachedUser = useCache(user);

    const renderInputPassword = (modifier: string) =>
        cachedUser && (
            <InputPassword
                mutation={passwordMutation}
                cancelButton={{ label: "Zurück" }}
                onCancel={() => setUser(undefined)}
                confirmButton={confirmButton}
                onSuccess={onSuccess}
                user={cachedUser}
                userBanner={userBanner}
                title={title}
                id={`login__password--${modifier}`}
            />
        );

    const handleUseKeyboard = useCallback(
        () => setInput(Input.Keyboard),
        [setInput]
    );
    const handleUseQr = useCallback(() => setInput(Input.Qr), [setInput]);

    return (
        <ContainerTransform activeElement={input}>
            <ContainerTransformElement elementKey={Input.Qr}>
                {/* Qr input */}
                <ContainerTransform activeElement={user ? "PASSWORD" : "USER"}>
                    <ContainerTransformElement elementKey="USER">
                        <InputQr
                            query={qrQuery}
                            onUseKeyboard={handleUseKeyboard}
                            cancelButton={cancelButton}
                            onCancel={onCancel}
                            onSuccess={setUser}
                            title={title}
                        />
                    </ContainerTransformElement>
                    <ContainerTransformElement elementKey="PASSWORD">
                        <div>{renderInputPassword("qr")}</div>
                    </ContainerTransformElement>
                </ContainerTransform>
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                {/* Keyboard input */}
                <SiblingTransitionBase
                    mode={Modes.xAxis}
                    activeElement={user ? 1 : 0}
                >
                    <SiblingTransitionBaseElement index={0}>
                        <InputUser
                            query={keyboardQuery}
                            cancelButton={{ label: "QR-Scanner" }}
                            onCancel={handleUseQr}
                            confirmButton={{ label: "Weiter" }}
                            onSuccess={setUser}
                            title={title}
                        />
                    </SiblingTransitionBaseElement>
                    <SiblingTransitionBaseElement index={1}>
                        <div>{renderInputPassword("keyboard")}</div>
                    </SiblingTransitionBaseElement>
                </SiblingTransitionBase>
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
