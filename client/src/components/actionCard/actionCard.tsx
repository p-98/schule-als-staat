import { constant } from "lodash/fp";
import { type FormEvent, useState, type ReactElement } from "react";
import {
    Card,
    CardActionButton,
    CardActions,
    CardContent,
    CardHeader,
} from "Components/material/card";
import { Theme } from "Components/material/theme";
import { Select } from "Components/material/select";
import { TextField } from "Components/material/textfield";

import { ChangeEvent } from "Utility/types";
import { syncifyF } from "Utility/misc";
import { useStable } from "Utility/urql";
import { InvalidInput } from "Utility/data";

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
    toInput: (_: T) => string;
    fromInput: (_: string) => T | InvalidInput;
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
export type TAction<TInputs extends unknown[]> = (inputs: TInputs) => Promise<{
    data?: true;
    inputErrors: MapInputErrors<TInputs>;
    unspecificError?: Error;
}>;

const initInputErrors = (inputs: InputProp<unknown>[]): (Error | undefined)[] =>
    inputs.map(constant(undefined));
const initInputValues = (inputs: InputProp<unknown>[]): unknown[] =>
    inputs.map((_) => _.init);

interface IActionCardProps<TInputs extends unknown[]> {
    inputs: MapInputProps<TInputs>;
    action: TAction<TInputs>;
    title: string;
    confirmButton: {
        label: string;
        danger?: boolean;
    };
}
/** Card with inputs executing an async action
 *
 * inputs prop MUST NOT change.
 */
export const ActionCard = <TInputs extends unknown[]>({
    inputs,
    action,
    title,
    confirmButton,
}: IActionCardProps<TInputs>): ReactElement => {
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

    const handleConfirm = async () => {
        if (fetching) return;
        setFetching(true);
        setInputErrors(initInputErrors(inputs));
        setUnspecificError(undefined);
        const { data, ...errors } = await action(inputValues as TInputs);
        setInputErrors(errors.inputErrors);
        if (errors.unspecificError) setUnspecificError(errors.unspecificError);
        if (data) setInputValues(initInputValues(inputs));
        setFetching(false);
    };

    const renderFetching = useStable(fetching);
    return (
        <Card>
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
            <CardActions fullBleed>
                <CardActionButton
                    label={confirmButton.label}
                    onClick={syncifyF(handleConfirm)}
                    disabled={renderFetching}
                    danger={confirmButton.danger}
                />
            </CardActions>
        </Card>
    );
};
