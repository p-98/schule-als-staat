import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { useState } from "react";
import { Card } from "@rmwc/card";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// local
import {
    Modes,
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import QR from "./components/qr";
import Manual from "./components/manual";
import Password from "./components/password";
import Header from "./components/header";
import type { TUser } from "./types";

import styles from "./login.module.css";

type TInput = "qr" | "manual";

function getActiveElement(input: TInput, user: TUser | null) {
    if (input === "manual") return "manual";
    if (user) return "qr-password";
    return "qr-scanner";
}

interface ILoginPropsCommon {
    cardHeader: string;
    confirmButtonLabel: string;
}
interface ILoginPropsLogin extends ILoginPropsCommon {
    mode: "login";
    onLogin: (user: TUser) => void;
    qrInfoText: string;
    userBannerLabel: string;
}
interface ILoginPropsAuthUser extends ILoginPropsCommon {
    mode: "authenticate_user";
    user: TUser;
    onAuthenticate: (user: TUser) => void;
    userBannerLabel: string;
}
interface ILoginPropsGetUser extends ILoginPropsCommon {
    mode: "get_user";
    onGetUser: (user: TUser) => void;
    qrInfoText: string;
}
type ILoginProps = ILoginPropsLogin | ILoginPropsAuthUser | ILoginPropsGetUser;
/**
 * default login is with QR code
 * Manual login component includes its own password component
 */
// const Login: React.FC<ILoginProps__Login>
const Login: React.FC<ILoginProps> = ({
    cardHeader,
    confirmButtonLabel,
    ...props
}) => {
    const [user, setUser] = useState<TUser | null>(
        props.mode === "authenticate_user" ? props.user : null
    );
    const [input, setInput] = useState<TInput>("qr");

    const userBannerLabel =
        props.mode === "get_user" ? "" : props.userBannerLabel;
    const qrInfoText =
        props.mode === "authenticate_user" ? "" : props.qrInfoText;
    const onGetUser =
        props.mode === "get_user"
            ? props.onGetUser
            : (_user: TUser) => setUser(_user);

    const onAuthenticate =
        (props.mode === "authenticate_user" && props.onAuthenticate) ||
        (props.mode === "login" && props.onLogin) ||
        (() => null);

    const PasswordElement = (
        <Password
            goBack={() => setUser(null)}
            onAuthenticate={onAuthenticate}
            confirmButtonLabel={confirmButtonLabel}
            userBannerLabel={userBannerLabel}
            user={user}
        />
    );

    return (
        <Card className={styles["login__card"]}>
            <ContainerTransform
                activeElement={getActiveElement(input, user)}
                className={styles["login__transform-container"]}
            >
                <ContainerTransformElement elementKey="qr-scanner">
                    <QR
                        toManual={() => setInput("manual")}
                        onGetUser={onGetUser}
                        header={cardHeader}
                        infoText={qrInfoText}
                    />
                </ContainerTransformElement>
                <ContainerTransformElement elementKey="qr-password">
                    <div>
                        <Header header={cardHeader} />
                        {PasswordElement}
                    </div>
                </ContainerTransformElement>
                <ContainerTransformElement elementKey="manual">
                    <div>
                        <Header header={cardHeader} />
                        <SiblingTransitionBase
                            mode={Modes.xAxis}
                            activeElement={user ? 1 : 0}
                        >
                            <SiblingTransitionBaseElement index={0}>
                                <Manual
                                    toQR={() => setInput("qr")}
                                    onGetUser={onGetUser}
                                    confirmButtonLabel={
                                        props.mode === "get_user"
                                            ? confirmButtonLabel
                                            : "Weiter"
                                    }
                                />
                            </SiblingTransitionBaseElement>
                            <SiblingTransitionBaseElement index={1}>
                                {PasswordElement}
                            </SiblingTransitionBaseElement>
                        </SiblingTransitionBase>
                    </div>
                </ContainerTransformElement>
            </ContainerTransform>
        </Card>
    );
};
export default Login;
