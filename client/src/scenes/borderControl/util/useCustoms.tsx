import { ReactElement, useState } from "react";
import { TextField } from "Components/material/textfield";

export const useCustoms = (
    user: string
): [ReactElement, () => void, number] => {
    const [customs, setCustoms] = useState(0);

    const inputElement = (
        <TextField
            id="customs-citizen"
            label="Zollgebühren"
            value={customs || ""}
            onChange={(e) => setCustoms(parseInt(e.currentTarget.value, 10))}
        />
    );

    const chargeCustoms = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        user;
    };

    return [inputElement, chargeCustoms, customs];
};
