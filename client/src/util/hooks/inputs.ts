import { FormEvent, useCallback } from "react";
import { useUpdateState } from "./forceUpdate";

/** Handle logic for controlled number component
 *
 * @argument initialValue the initially state
 * @returns tuple consisting of 1) the current state and 2) props for the input component
 */
export const useNumberInput = (
    initialValue: number | undefined
): [
    number | undefined,
    {
        value: string | number;
        onChange: (e: FormEvent<HTMLInputElement>) => void;
    }
] => {
    const [value, setUpdateValue] = useUpdateState(initialValue);
    const onChange = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            const inputValue = e.currentTarget.value;
            if (inputValue === "") return setUpdateValue(undefined);

            const newValue = parseFloat(inputValue);
            if (Number.isNaN(newValue)) return;
            setUpdateValue(newValue);
        },
        [setUpdateValue]
    );
    return [value, { value: value ?? "", onChange }];
};
