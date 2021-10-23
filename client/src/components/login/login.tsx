import { ReactNode, useRef, useState } from "react";

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
import { useFocusTrap } from "Utility/hooks/focusTrap";
import { QR } from "./components/qr";
import { TOnAuthUser } from "./types";
import { Password } from "./components/password";
import { Manual } from "./components/manual";

function getActiveElement(useQR: boolean, user: TUser | null) {
    if (!useQR) {
        return user ? "manual-password" : "manual-input";
    }

    return user ? "qr-password" : "qr-scanner";
}
function getActiveContainerTransformElement(
    useQR: boolean,
    user: TUser | null
) {
    const activeElement = getActiveElement(useQR, user);

    return activeElement.startsWith("manual")
        ? "manual"
        : (activeElement as "qr-password" | "qr-scanner");
}

export interface ILoginProps extends React.HTMLAttributes<HTMLDivElement> {
    header: string;
    qrInfoText: string;
    confirmButton: { label: string; danger?: boolean };
    cancelButton?: { label: string; handler: () => void };
    userBannerLabel: string;
    onLogin: TOnAuthUser;
    actionSummary?: ReactNode;
}
export const Login: React.FC<ILoginProps> = ({
    header,
    qrInfoText,
    confirmButton,
    cancelButton,
    userBannerLabel,
    onLogin,
    actionSummary,
    ...restProps
}) => {
    const [useQR, setUseQR] = useState(true);
    const [user, setUser] = useState<TUser | null>(null);
    const loginRef = useRef<HTMLDivElement>(null);

    // focusTrap init
    const activeElement = getActiveElement(useQR, user);
    let trapFocus = useFocusTrap(loginRef, undefined, [activeElement]);

    // focus should not be trapped in initial state
    if (activeElement === "qr-scanner") trapFocus = () => undefined;

    const createPasswordElement = (ref?: React.Ref<HTMLDivElement>) => (
        <Password
            ref={ref}
            confirmButton={confirmButton}
            user={user}
            userBannerLabel={userBannerLabel}
            header={header}
            onAuthUser={onLogin}
            cancelButton={{ label: "Zurück", onClick: () => setUser(null) }}
            actionSummary={actionSummary}
        />
    );

    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            activeElement={getActiveContainerTransformElement(useQR, user)}
            onTransformFinish={trapFocus}
            ref={loginRef}
        >
            <ContainerTransformElement elementKey="qr-scanner">
                <QR
                    header={header}
                    infoText={qrInfoText}
                    toManual={() => setUseQR(false)}
                    onGetUser={(_user) => setUser(_user)}
                    cancel={cancelButton}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="qr-password">
                {createPasswordElement()}
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="manual">
                <div>
                    <SiblingTransitionBase
                        activeElement={user === null ? 0 : 1}
                        mode={Modes.xAxis}
                        onTransitionFinish={trapFocus}
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
                            {createPasswordElement()}
                        </SiblingTransitionBaseElement>
                    </SiblingTransitionBase>
                </div>
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
