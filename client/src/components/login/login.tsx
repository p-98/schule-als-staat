import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { useState } from "react";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import QR from "./components/qr";
import Manual from "./components/manual";
import Password from "./components/password";

import styles from "./login.module.css";

type TUser = string;

interface ILoginPropsText {
    // display props
    header: string;
    infoText: string;
}
interface ILoginPropsLogin extends ILoginPropsText {
    mode: "login";
    onLogin: (user: TUser) => void;
}
interface ILoginPropsAuthUser extends ILoginPropsText {
    mode: "authenticate_user";
    user: TUser;
}
interface ILoginPropsGetUser extends ILoginPropsText {
    mode: "get_user";
    onGetUser: (user: TUser) => void;
}
/**
 * default login is with QR code
 * Manual login component includes its own password component
 */
// const Login: React.FC<ILoginProps__Login>
const Login: React.FC<
    ILoginPropsLogin | ILoginPropsAuthUser | ILoginPropsGetUser
> = ({ mode, header, infoText }) => {
    const [cardContent, setCardContent] = useState("qr-scanner");

    return (
        <Card className={styles["login__card"]}>
            <ContainerTransform
                activeElement={cardContent}
                className={styles["login__transform-container"]}
            >
                <ContainerTransformElement elementKey="qr-scanner">
                    <QR
                        toManual={() => setCardContent("manual")}
                        toPassword={() => setCardContent("qr-password")}
                        header={header}
                        infoText={infoText}
                    />
                </ContainerTransformElement>
                <ContainerTransformElement elementKey="manual">
                    <Manual
                        onLogin={onLogin}
                        toQR={() => setCardContent("qr-scanner")}
                        header={header}
                    />
                </ContainerTransformElement>
                <ContainerTransformElement elementKey="qr-password">
                    <div>
                        <Typography
                            use="headline6"
                            className={styles["login__card-header"]}
                        >
                            {header}
                        </Typography>
                        <Password
                            goBack={() => setCardContent("qr-scanner")}
                            onLogin={onLogin}
                        />
                    </div>
                </ContainerTransformElement>
            </ContainerTransform>
        </Card>
    );
};
export default Login;

export const test = (
    <Login header="" infoText="" mode="get_user" onGetUser={() => null} />
);
