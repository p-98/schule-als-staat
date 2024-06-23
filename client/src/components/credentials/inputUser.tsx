import {
    type ComponentPropsWithoutRef,
    type ReactElement,
    useState,
} from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";

import { InputUserQr, TAction as TQrAction } from "./components/inputUserQr";
import { InputUserKb, TAction as TKbAction } from "./components/inputUserKb";

export { type TQrAction, type TKbAction };

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface IInputUserProps<Data> extends ComponentPropsWithoutRef<"div"> {
    qrAction: TQrAction<Data>;
    kbAction: TKbAction<Data>;
    /** Whether the qr scanner is active */
    scanQr: boolean;
    cancelButton?: { label: string };
    onCancel?: () => void;
    confirmButton: { label: string };
    onSuccess: (data: Data) => void;
    title: string;
}
export const InputUser = <Data,>({
    qrAction,
    kbAction,
    scanQr,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    ...restProps
}: IInputUserProps<Data>): ReactElement => {
    const [input, setInput] = useState(Input.Qr);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <ContainerTransform {...restProps} activeElement={input}>
            <ContainerTransformElement elementKey={Input.Qr}>
                {/* Qr input */}
                <InputUserQr
                    action={qrAction}
                    scan={input === Input.Qr && scanQr}
                    onUseKeyboard={() => setInput(Input.Keyboard)}
                    cancelButton={cancelButton}
                    onCancel={onCancel}
                    onSuccess={onSuccess}
                    title={title}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                {/* Keyboard input */}
                <InputUserKb
                    action={kbAction}
                    cancelButton={{ label: "QR-Scanner" }}
                    onCancel={() => setInput(Input.Qr)}
                    confirmButton={confirmButton}
                    onSuccess={onSuccess}
                    title={title}
                />
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
