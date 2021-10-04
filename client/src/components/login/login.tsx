import { useState } from "react";

// local
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import {
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
    Modes,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import type { TUser } from "Utility/types";
import { QR } from "./components/qr";
import { TOnAuthUser } from "./types";
import { Password } from "./components/password";
import { Manual } from "./components/manual";

function getActiveElement(useQR: boolean, user: TUser | null) {
    if (!useQR) return "manual";
    if (user !== null) return "qr-password";
    return "qr-scanner";
}

export interface ILoginProps extends React.HTMLAttributes<HTMLDivElement> {
    header: string;
    qrInfoText: string;
    confirmButtonLabel: string;
    userBannerLabel: string;
    onLogin: TOnAuthUser;
}
export const Login: React.FC<ILoginProps> = ({
    header,
    qrInfoText,
    confirmButtonLabel,
    userBannerLabel,
    onLogin,
    ...restProps
}) => {
    const [useQR, setUseQR] = useState(true);
    const [user, setUser] = useState<TUser | null>(null);

    const PasswordElement = (
        <Password
            confirmButton={{ label: confirmButtonLabel }}
            user={user}
            userBannerLabel={userBannerLabel}
            header={header}
            onAuthUser={onLogin}
            cancelButton={{ label: "Zurück", onClick: () => setUser(null) }}
        />
    );

    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            activeElement={getActiveElement(useQR, user)}
        >
            <ContainerTransformElement elementKey="qr-scanner">
                <QR
                    header={header}
                    infoText={qrInfoText}
                    toManual={() => setUseQR(false)}
                    onGetUser={(_user) => setUser(_user)}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="qr-password">
                {PasswordElement}
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="manual">
                <div>
                    <SiblingTransitionBase
                        activeElement={user === null ? 0 : 1}
                        mode={Modes.xAxis}
                    >
                        <SiblingTransitionBaseElement index={0}>
                            <Manual
                                toQR={() => setUseQR(true)}
                                onGetUser={(_user) => setUser(_user)}
                                confirmButtonLabel="Weiter"
                                header={header}
                            />
                        </SiblingTransitionBaseElement>
                        <SiblingTransitionBaseElement index={1}>
                            {PasswordElement}
                        </SiblingTransitionBaseElement>
                    </SiblingTransitionBase>
                </div>
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
