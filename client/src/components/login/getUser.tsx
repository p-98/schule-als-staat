import { useState } from "react";
import cn from "classnames";

// local
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import type { TUser } from "Utility/types";
import QR from "./components/qr";
import Manual from "./components/manual";

import styles from "./login.module.css";

interface IGetUserProps extends React.HTMLAttributes<HTMLDivElement> {
    confirmButtonLabel?: string;
    onGetUser: (user: TUser) => void;
    header: string;
    qrInfoText: string;
}
const GetUser: React.FC<IGetUserProps> = ({
    confirmButtonLabel,
    onGetUser,
    header,
    qrInfoText,
    ...restProps
}) => {
    const [useQR, setUseQR] = useState(true);

    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(
                restProps.className,
                styles["login__transform-container"]
            )}
            activeElement={useQR ? "qr" : "manual"}
        >
            <ContainerTransformElement elementKey="qr">
                <QR
                    header={header}
                    infoText={qrInfoText}
                    onGetUser={onGetUser}
                    toManual={() => setUseQR(false)}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="manual">
                <Manual
                    header={header}
                    confirmButtonLabel={confirmButtonLabel ?? "Bestätigen"}
                    onGetUser={onGetUser}
                    toQR={() => setUseQR(true)}
                />
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
export default GetUser;
