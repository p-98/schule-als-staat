import {
    type ComponentPropsWithoutRef,
    type ReactElement,
    useState,
} from "react";

import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import { event, getByClass, getByTag, syncifyF } from "Utility/misc";

import { InputUserQr, TAction as TQrAction } from "./components/inputUserQr";
import { InputUserKb, TAction as TKbAction } from "./components/inputUserKb";

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

type AdapterFCT = Pick<
    ComponentPropsWithoutRef<typeof FCT>,
    "onOpen" | "onClose" | "onClosed"
>;
/** Adapter for <FCT> when <InputUser> is used as handle */
export const adapterFCT: AdapterFCT = {
    onOpen: (ancestor, portalAncestor) => {
        const video = getByTag("video", ancestor);
        const portalQr = getByClass("input-user-qr__qr", portalAncestor);

        // replace qr with image displaying current the current video frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.className = portalQr.className;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
        portalQr.replaceWith(canvas);
    },
    onClose: (ancestor, portalAncestor) => {
        const canvas = getByClass(
            "input-user-qr__qr",
            portalAncestor
        ) as HTMLCanvasElement;
        canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    },
    onClosed: syncifyF(async (ancestor) => {
        const qr = getByClass("input-user-qr__qr", ancestor);
        qr.classList.add(css["input-user__qr--fade-back"]!);
        await event("animationend", qr);
        qr.classList.remove(css["input-user__qr--fade-back"]!);
    }),
};
