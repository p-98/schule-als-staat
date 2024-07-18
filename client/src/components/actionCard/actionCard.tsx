import { v4 as uuid } from "uuid";
import { constant, over } from "lodash/fp";
import {
    type FormEvent,
    type ReactElement,
    useState,
    ReactNode,
    useMemo,
} from "react";
import {
    Card,
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/material/card";
import { Theme } from "Components/material/theme";
import { Select } from "Components/material/select";
import { TextField } from "Components/material/textfield";
import { SimpleDialog } from "Components/material/dialog/dialog";

import { ChangeEvent } from "Utility/types";
import { syncifyF } from "Utility/misc";
import { useStable } from "Utility/urql";
import { InvalidInput, type Parser } from "Utility/data";

interface IActionCardInput<T> {
    input: InputProp<T>;
    inputValue: T;
    setInputValue: (_: T) => void;
    inputError: Error | undefined;
    unspecificError: Error | undefined;
    lastInput: boolean;
    disabled: boolean;
}
const ActionCardInput = <T,>({
    input,
    inputValue,
    setInputValue,
    inputError,
    unspecificError,
    lastInput,
    disabled,
}: IActionCardInput<T>) => {
    const id = useMemo(uuid, []);
    const helpText = lastInput
        ? {
              validationMsg: true,
              persistent: true,
              // Theme for when unspecificError is set
              children: (
                  <Theme use="error">
                      {inputError?.message ?? unspecificError?.message ?? ""}
                  </Theme>
              ),
          }
        : {
              validationMsg: true,
              children: inputError?.message ?? "",
          };

    switch (input.type) {
        case "text":
            return (
                <TextField
                    type={input.protect ? "password" : "text"}
                    id={id}
                    label={input.label}
                    value={input.toInput(inputValue)}
                    onChange={(e: ChangeEvent) => {
                        const value = input.fromInput(e.currentTarget.value);
                        if (value instanceof InvalidInput) return;
                        setInputValue(value);
                    }}
                    disabled={disabled}
                    invalid={!!inputError}
                    helpText={helpText}
                />
            );
        case "select":
            return (
                <Select
                    label={input.label}
                    options={input.options}
                    value={inputValue as string}
                    onChange={(e: FormEvent<HTMLSelectElement>) =>
                        setInputValue(e.currentTarget.value as T)
                    }
                    disabled={disabled}
                    invalid={!!inputError}
                    helpText={helpText}
                />
            );
    }
};

type MapInputErrors<TInputs extends unknown[]> = TInputs extends [
    unknown,
    ...infer R
]
    ? [Error | undefined, ...MapInputErrors<R>]
    : [];
type InputTextProp<T> = {
    type: "text";
    protect?: boolean;
    toInput: (_: T) => string;
    fromInput: Parser<T>;
};
type InputSelectProp<T> = T extends string
    ? {
          type: "select";
          options: { [K in T]: string };
      }
    : never;
type InputProp<T> = { label: string; init: T } & (
    | InputTextProp<T>
    | InputSelectProp<T>
);
type MapInputProps<TInputs extends unknown[]> = TInputs extends [
    infer T,
    ...infer R
]
    ? [InputProp<T>, ...MapInputProps<R>]
    : [];

/** Exactly most 1 property might be set */
export type TAction<TData, TInputs extends unknown[]> = (
    inputs: TInputs
) => Promise<{
    data?: TData;
    inputErrors: MapInputErrors<TInputs>;
    unspecificError?: Error;
}>;

const initInputErrors = (inputs: InputProp<unknown>[]): (Error | undefined)[] =>
    inputs.map(constant(undefined));
const initInputValues = (inputs: InputProp<unknown>[]): unknown[] =>
    inputs.map((_) => _.init);

interface IActionCardProps<TData, TInputs extends unknown[]> {
    /** MUST NOT change */
    inputs: MapInputProps<TInputs>;
    action: TAction<TData, TInputs>;
    title: string;
    confirmButton: {
        label: string;
        raised?: boolean;
        danger?: boolean;
    };
    onSuccess?: (data: TData) => void;
    cancelButton?: {
        label: string;
    };
    onCancel?: () => void;
    dangerDialog?: { title?: string; content?: ReactNode };
    /** Adapter flag when used as <Card>-like child */
    inner?: boolean;
}
/** Card with inputs executing an async action
 *
 * inputs prop MUST NOT change.
 */
export const ActionCard = <TData, TInputs extends unknown[]>({
    inputs,
    action,
    title,
    confirmButton,
    onSuccess,
    cancelButton,
    onCancel,
    dangerDialog,
    inner = false,
}: IActionCardProps<TData, TInputs>): ReactElement => {
    if (!!cancelButton !== !!onCancel)
        throw Error("cancelButton, onCancel must be set together");
    const [fetching, setFetching] = useState(false);
    const [inputValues, setInputValues] = useState(() =>
        initInputValues(inputs)
    );
    const setInputValue = (index: number, value: unknown) =>
        setInputValues((prevState) => {
            const state = [...prevState];
            state[index] = value;
            return state;
        });
    const [inputErrors, setInputErrors] = useState(() =>
        initInputErrors(inputs)
    );
    const [unspecificError, setUnspecificError] = useState<Error>();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleConfirm = async () => {
        if (fetching) return;
        setFetching(true);
        setInputErrors(initInputErrors(inputs));
        setUnspecificError(undefined);
        const { data, ...errors } = await action(inputValues as TInputs);
        setInputErrors(errors.inputErrors);
        if (errors.unspecificError) setUnspecificError(errors.unspecificError);
        if (data) {
            setInputValues(initInputValues(inputs));
            onSuccess?.(data);
        }
        setFetching(false);
    };

    const renderFetching = useStable(fetching);
    const Tag = inner ? CardInner : Card;
    return (
        <Tag>
            {dangerDialog && (
                <SimpleDialog
                    open={dialogOpen}
                    title={dangerDialog.title ?? `${title} Bestätigen`}
                    content={
                        dangerDialog.content ??
                        `Möchtest Du ${confirmButton.label}? Dies kann nicht rückgängig gemacht werden.`
                    }
                    accept={{
                        label: "Bestätigen",
                        onAccept: over([
                            () => setDialogOpen(false),
                            syncifyF(handleConfirm),
                        ]),
                        danger: true,
                    }}
                    cancel={{
                        label: "Abbrechen",
                        onCancel: () => setDialogOpen(false),
                    }}
                    onClose={() => setDialogOpen(false)}
                />
            )}
            <CardHeader>{title}</CardHeader>
            <CardContent>
                {inputs.map((input: InputProp<unknown>, index: number) => (
                    <ActionCardInput
                        key={input.label}
                        input={input}
                        inputValue={inputValues[index]}
                        setInputValue={(value) => setInputValue(index, value)}
                        inputError={inputErrors[index]}
                        unspecificError={unspecificError}
                        lastInput={index === inputs.length - 1}
                        disabled={renderFetching}
                    />
                ))}
            </CardContent>
            <CardActions dialogLayout>
                {cancelButton && (
                    <CardActionButton
                        label={cancelButton.label}
                        onClick={onCancel}
                    />
                )}
                <CardActionButton
                    label={confirmButton.label}
                    onClick={
                        dangerDialog
                            ? () => setDialogOpen(true)
                            : syncifyF(handleConfirm)
                    }
                    disabled={renderFetching}
                    raised={confirmButton.raised}
                    danger={confirmButton.danger}
                />
            </CardActions>
        </Tag>
    );
};
