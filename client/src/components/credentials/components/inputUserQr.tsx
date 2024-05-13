import {
    type ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    ComponentPropsWithoutRef,
} from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    CardInner,
} from "Components/material/card";
import { Typography } from "Components/material/typography";
import { dispatch } from "Utility/misc";
import { notify } from "Utility/notifications";

import styles from "../credentials.module.css";

/* Qr scanner component
 */

/** Stabilize onSuccess calls
 *
 * Function is only called when argument changes accomodating for occasional read fails
 *
 * @f the callback function
 * @tolerance amount of failures inbetween successful read to treat as consecutive
 * @returns Tuple with function that indicates successful read
 *          and a function that indicates non-successful read
 */
export function stabilize<T>(
    f: (_: T) => void,
    tolerance: number
): [(_: T) => void, () => void] {
    let lastArg: T | undefined;
    let failsSinceLastCall = 0;
    return [
        (_: T) => {
            failsSinceLastCall = 0;
            if (_ !== lastArg) f(_);
            lastArg = _;
        },
        () => {
            failsSinceLastCall += 1;
            if (failsSinceLastCall > tolerance) lastArg = undefined;
        },
    ];
}

interface IQrProps extends React.HTMLAttributes<HTMLDivElement> {
    onSuccess: (text: string) => void;
    onFailure: (err: Error) => void;
    scan?: boolean;
}
const Qr: React.FC<IQrProps> = ({
    onSuccess,
    onFailure,
    scan = true,
    id = "qr__video",
    ...restProps
}) => {
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;
    const onFailureRef = useRef(onFailure);
    onFailureRef.current = onFailure;

    const [callOnSuccess, resetOnSuccess] = useMemo(
        () => stabilize((_: string) => onSuccessRef.current(_), 1),
        [onSuccessRef]
    );

    useEffect(() => {
        if (!scan) return;

        const lib = new Html5Qrcode(id, { verbose: false });
        lib.start(
            { facingMode: "environment" },
            { fps: 2, aspectRatio: 1.0 },
            callOnSuccess,
            resetOnSuccess
        ).catch((_: Error) => onFailureRef.current(_));

        return () => {
            lib.stop().catch((_: Error) => onFailureRef.current(_));
        };
    }, [scan, id, onFailureRef, callOnSuccess, resetOnSuccess]);

    return <div {...restProps} id={id} />;
};

/* Qr card reader component
 */

/** Exactly one of resulting fields must be set. */
export type TAction<TData> = (id: string) => Promise<{
    data?: TData;
    idError?: Error;
    emptyError?: boolean;
    unexpectedError?: Error;
}>;

export interface IInputUserQrProps<TData>
    extends ComponentPropsWithoutRef<"div"> {
    action: TAction<TData>;
    cancelButton?: { label: string };
    onCancel?: () => void;
    onUseKeyboard: () => void;
    onSuccess: (data: TData) => void;
    title: string;
}
export const InputUserQr = <TData,>({
    action,
    cancelButton,
    onCancel,
    onUseKeyboard,
    onSuccess,
    title,
    ...restProps
}: IInputUserQrProps<TData>): ReactElement => {
    if (!onCancel && cancelButton) throw Error("onCancel undefined");
    const [fetching, setFetching] = useState(false);

    const handleResult = useCallback(
        async (id: string) => {
            if (fetching) return;
            setFetching(true);
            const { data, ...errors } = await action(id);
            if (errors.idError) notify({ body: errors.idError.message });
            if (errors.emptyError) {
                notify({ body: `Card with id ${id} is empty.` });
            }
            setFetching(false);
            if (data) onSuccess(data);
        },
        [fetching, action, onSuccess]
    );
    const handleError = useCallback(
        (err: Error) => {
            notify({ body: "QR-Scanner nicht verfügbar." });
            // eslint-disable-next-line no-console
            console.error(err);
            onUseKeyboard();
        },
        [onUseKeyboard]
    );

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardMedia square>
                <Qr
                    onSuccess={(_) => dispatch(handleResult(_))}
                    onFailure={handleError}
                    className={styles["input-user-qr__video"]}
                />
            </CardMedia>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <Typography use="body1" theme="textSecondaryOnBackground">
                    {/* Kurzer Text */}
                    Halte den QR-Code auf deinem Ausweis vor die Kamera.
                </Typography>
            </CardContent>
            <CardActions dialogLayout>
                {cancelButton && (
                    <CardActionButton onClick={onCancel}>
                        {cancelButton?.label}
                    </CardActionButton>
                )}
                <CardActionButton onClick={onUseKeyboard}>
                    Manuelle Eingabe
                </CardActionButton>
            </CardActions>
        </CardInner>
    );
};
