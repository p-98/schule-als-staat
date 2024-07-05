import cn from "classnames";
import {
    type ComponentPropsWithoutRef,
    type ReactElement,
    useState,
    useCallback,
} from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { InputQr, TAction as TQrAction } from "Components/qr/qr";
import { InputCardKb, TAction as TKbAction } from "./inputCardKb";

import css from "./card.module.css";

export type TAction<Data> = (id: string) => Promise<{
    data?: Data;
    idError?: Error;
    unspecificError?: Error;
}>;

enum Input {
    Qr = "QR",
    Keyboard = "KEYBOARD",
}
interface InputCardProps<Data> extends ComponentPropsWithoutRef<"div"> {
    action: TAction<Data>;
    /** Whether the qr scanner is active */
    scanQr: boolean;
    cancelButton?: { label: string };
    onCancel?: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (data: Data) => void;
    title: string;
    /** Adapter flag whether inside a dialog */
    dialog?: boolean;
}
export const InputCard = <Data,>({
    action,
    scanQr,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    dialog,
    ...restProps
}: InputCardProps<Data>): ReactElement => {
    const [input, setInput] = useState(Input.Qr);

    const qrAction: TQrAction<Data> = useCallback(
        async (id) => {
            const { data, idError, unspecificError } = await action(id);
            return { data, unspecificError: idError ?? unspecificError };
        },
        [action]
    );
    const kbAction: TKbAction<Data> = action;
    return (
        <ContainerTransform
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(
                restProps.className,
                dialog && css["input-card--dialog"]
            )}
            activeElement={input}
        >
            <ContainerTransformElement elementKey={Input.Qr}>
                {/* Qr input */}
                <InputQr
                    action={qrAction}
                    scan={input === Input.Qr && scanQr}
                    onUnavailable={() => setInput(Input.Keyboard)}
                    cancelButton={cancelButton}
                    onCancel={onCancel}
                    mainButton={{ label: "Manuelle Eingabe" }}
                    onMain={() => setInput(Input.Keyboard)}
                    onSuccess={onSuccess}
                    title={title}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey={Input.Keyboard}>
                {/* Keyboard input */}
                <InputCardKb
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
