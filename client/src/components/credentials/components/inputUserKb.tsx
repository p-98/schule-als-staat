import {
    ComponentPropsWithoutRef,
    FormEvent,
    useCallback,
    useState,
} from "react";
import {
    CardActions,
    CardActionButton,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";
import { Select } from "Components/material/select";
import { type UserType } from "Utility/graphql/graphql";
import { dispatch } from "Utility/misc";
import { ChangeEvent } from "Utility/types";
import { Theme } from "Components/material/theme";

/** Exactly one of resulting fields must be set. */
export type TAction<TData> = (
    type: UserType,
    id: string
) => Promise<{
    data?: TData;
    idError?: Error;
    unspecificError?: Error;
}>;

interface IInputUserKbProps<TData> extends ComponentPropsWithoutRef<"div"> {
    action: TAction<TData>;
    cancelButton: { label: string };
    onCancel: () => void;
    confirmButton: { label: string };
    onSuccess: (data: TData) => void;
    title: string;
}
export const InputUserKb = <TData,>({
    action,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    ...restProps
}: IInputUserKbProps<TData>) => {
    const [type, setType] = useState<UserType>("CITIZEN");
    const [id, setId] = useState("");
    const [fetching, setFetching] = useState(false);
    const [idError, setIdError] = useState<Error>();
    const [unspecificError, setUnspecificError] = useState<Error>();

    const handleConfirm = useCallback(
        async (_type: UserType, _id: string) => {
            if (fetching) return;
            setFetching(true);
            setIdError(undefined);
            setUnspecificError(undefined);
            const { data, ...errors } = await action(_type, _id);
            setIdError(errors.idError);
            setUnspecificError(errors.unspecificError);
            setFetching(false);

            if (data) onSuccess(data);
        },
        [fetching, action, onSuccess]
    );

    const handleCancel = useCallback(() => {
        setType("CITIZEN");
        setId("");
        onCancel();
    }, [onCancel]);

    const helpMsg = idError?.message ?? unspecificError?.message ?? "";
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <Select
                    id="input-user-kb__user-type"
                    options={[
                        { label: "Unternehmen", value: "COMPANY" },
                        { label: "Bürger", value: "CITIZEN" },
                        { label: "Gast", value: "GUEST" },
                    ]}
                    label="Benutzerklasse"
                    value={type}
                    onChange={(e: FormEvent<HTMLSelectElement>) =>
                        setType(e.currentTarget.value as UserType)
                    }
                />
                <TextField
                    id="input-user-kb__user-id"
                    label="Benutzername"
                    value={id}
                    onChange={(e: ChangeEvent) => setId(e.currentTarget.value)}
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
                    onClick={() => dispatch(handleConfirm(type, id))}
                >
                    {confirmButton.label}
                </CardActionButton>
            </CardActions>
        </CardInner>
    );
};
