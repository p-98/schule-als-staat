import { v4 as uuid } from "uuid";
import { noop } from "lodash/fp";
import cn from "classnames";
import {
    type ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    ComponentPropsWithoutRef,
    useMemo,
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
import { syncifyF } from "Utility/misc";
import { notify } from "Utility/notifications";

import css from "./qr.module.css";

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
    scan: boolean;
    onSuccess: (text: string) => void;
    onFailure: (err: Error) => void;
}
/** Qr reader
 *
 * Applies id `id` or `"qr"` to the container element
 */
const Qr: React.FC<IQrProps> = ({
    scan,
    onSuccess,
    onFailure,
    ...restProps
}) => {
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;
    const onFailureRef = useRef(onFailure);
    onFailureRef.current = onFailure;
    const id = useMemo(() => `qr#${uuid()}`, []);

    const ref = useRef<HTMLDivElement>(null);
    const createDummy = () => {
        const video = ref.current?.getElementsByTagName("video")[0];
        if (!video) return;
        // create a video look-alike
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.className = css["qr__dummy"]!;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
        ref.current.prepend(canvas);
    };
    const removeDummy = () => {
        const canvas = ref.current?.getElementsByTagName("canvas")[0];
        if (!canvas) return;
        canvas.remove();
    };

    useEffect(() => {
        if (!scan) return;
        removeDummy();

        const callOnSuccess = (_: string) => onSuccessRef.current(_);
        const [onRead, onNoRead] = stabilize(callOnSuccess, 1);
        const lib = new Html5Qrcode(id, { verbose: false });
        const startPromise = new Promise((resolve, reject) => {
            lib.start(
                { facingMode: "environment" },
                { fps: 2, aspectRatio: 1.0 },
                onRead,
                onNoRead
            )
                .then(() => resolve(lib))
                .catch((e: Error) => {
                    onFailureRef.current(e);
                    reject(e);
                });
        });

        return () => {
            createDummy();
            startPromise
                .then(() =>
                    lib.stop().catch((e: Error) => onFailureRef.current(e))
                )
                // startPromise already catched above
                .catch(noop);
        };
    }, [scan, id]);

    return (
        <div
            {...restProps}
            className={cn(restProps.className, css["qr"])}
            id={id}
            ref={ref}
        />
    );
};

/* Qr card reader component
 */

/** Exactly one of resulting fields must be set. */
export type TAction<TData> = (id: string) => Promise<{
    data?: TData;
    unspecificError?: Error;
}>;

export interface InputQrProps<TData> extends ComponentPropsWithoutRef<"div"> {
    action: TAction<TData>;
    /** Whether the qr scanner is active */
    scan: boolean;
    onUnavailable: () => void;
    cancelButton?: { label: string };
    onCancel?: () => void;
    /** The button right of the cancel button */
    mainButton?: { label: string };
    onMain: () => void;
    onSuccess: (data: TData) => void;
    title: string;
}
/** Read qr codes and perform an action
 *
 * Applies "input-qr__qr" to the qr reader
 */
export const InputQr = <TData,>({
    action,
    scan,
    onUnavailable,
    cancelButton,
    onCancel,
    mainButton,
    onMain,
    onSuccess,
    title,
    ...restProps
}: InputQrProps<TData>): ReactElement => {
    if (!!onCancel !== !!cancelButton)
        throw Error("cancelButton, onCancel must be set together");
    if (!!onMain !== !!mainButton)
        throw Error("mainButton, onMain must be set together");
    const [fetching, setFetching] = useState(false);

    const handleScan = useCallback(
        async (id: string) => {
            if (fetching) return;
            setFetching(true);
            const { data, ...errors } = await action(id);
            if (errors.unspecificError)
                notify({ body: errors.unspecificError.message });
            setFetching(false);
            if (data) onSuccess(data);
        },
        [fetching, action, onSuccess]
    );
    const handleUnavailable = useCallback(
        (err: Error) => {
            notify({ body: "QR-Scanner nicht verfügbar." });
            // eslint-disable-next-line no-console
            console.error("Qr scanner not available: ", err);
            onMain();
        },
        [onMain]
    );

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardMedia square>
                <Qr
                    scan={scan}
                    onSuccess={syncifyF(handleScan)}
                    onFailure={handleUnavailable}
                    className={cn(css["input-qr__qr"], "input-qr__qr")}
                />
            </CardMedia>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <Typography use="body1" theme="textSecondaryOnBackground">
                    Halte den QR-Code auf deinem Ausweis vor die Kamera.
                </Typography>
            </CardContent>
            <CardActions dialogLayout>
                {cancelButton && (
                    <CardActionButton onClick={onCancel}>
                        {cancelButton.label}
                    </CardActionButton>
                )}
                {mainButton && (
                    <CardActionButton onClick={onMain}>
                        {mainButton.label}
                    </CardActionButton>
                )}
            </CardActions>
        </CardInner>
    );
};
