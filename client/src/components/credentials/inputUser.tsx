import {
    type ComponentPropsWithoutRef,
    type ReactElement,
    useState,
} from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { type FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import { InputQr, TAction as TQrAction } from "Components/qr/qr";
import { getByClass, videoToCanvas, syncifyF, event } from "Utility/misc";
import { InputUserKb, TAction as TKbAction } from "./inputUserKb";

import css from "./credentials.module.css";

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

/** Adapter for <FCT> when <InputUser> is used as handle
 *
 * Expects <InputUser> to be remounted between open and close.
 */
type AdapterFCT = Pick<
    ComponentPropsWithoutRef<typeof FCT>,
    "onOpen" | "onClose" | "onClosed"
>;
export const adapterFCT: AdapterFCT = {
    onOpen: (ancestor, portalAncestor) => {
        const video = portalAncestor.getElementsByTagName("video")[0];
        video?.replaceWith(videoToCanvas(video));
    },
    onClosed: syncifyF(async (ancestor) => {
        const qr = getByClass("input-qr__qr", ancestor);
        qr.classList.add(css["input-user__qr--fade-back"]!);
        await event("animationend", qr);
        qr.classList.remove(css["input-user__qr--fade-back"]!);
    }),
};
