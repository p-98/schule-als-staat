import {
    type ComponentPropsWithoutRef,
    type FormEvent,
    type ReactElement,
    useState,
    useCallback,
} from "react";
import {
    CardActions,
    CardActionButton,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";
import { Theme } from "Components/material/theme";

import { syncify } from "Utility/misc";

/** Exactly one of resulting fields must be set. */
export type TAction<TData> = (id: string) => Promise<{
    data?: TData;
    idError?: Error;
    unspecificError?: Error;
}>;

interface InputCardKbProps<TData> extends ComponentPropsWithoutRef<"div"> {
    action: TAction<TData>;
    cancelButton: { label: string };
    onCancel: () => void;
    confirmButton: { label: string; danger?: boolean };
    onSuccess: (data: TData) => void;
    title: string;
}
export const InputCardKb = <TData,>({
    action,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    ...restProps
}: InputCardKbProps<TData>): ReactElement => {
    const [id, setId] = useState("");
    const [fetching, setFetching] = useState(false);
    const [idError, setIdError] = useState<Error>();
    const [unspecificError, setUnspecificError] = useState<Error>();

    const handleConfirm = useCallback(
        async (_id: string) => {
            if (fetching) return;
            setFetching(true);
            setIdError(undefined);
            setUnspecificError(undefined);
            const { data, ...errors } = await action(_id);
            setIdError(errors.idError);
            setUnspecificError(errors.unspecificError);
            setFetching(false);

            if (data) onSuccess(data);
        },
        [fetching, action, onSuccess]
    );

    const handleCancel = useCallback(() => {
        setId("");
        onCancel();
    }, [onCancel]);

    const helpMsg = idError?.message ?? unspecificError?.message ?? "";
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <TextField
                    id="input-card-kb__user-id"
                    label="Karten-ID"
                    value={id}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                        const { value } = e.currentTarget;
                        setId(value);
                    }}
                    invalid={!!idError}
                    helpText={{
                        validationMsg: true,
                        persistent: true,
                        // Themee for when crossFailed is set
                        children: <Theme use="error">{helpMsg}</Theme>,
                    }}
                />
            </CardContent>
            <CardActions dialogLayout>
                <CardActionButton onClick={handleCancel}>
                    {cancelButton.label}
                </CardActionButton>
                <CardActionButton
                    raised
                    disabled={!id}
                    onClick={() => syncify(handleConfirm(id))}
                    danger={confirmButton.danger}
                >
                    {confirmButton.label}
                </CardActionButton>
            </CardActions>
        </CardInner>
    );
};
