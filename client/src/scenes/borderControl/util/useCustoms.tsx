import { ReactElement, useState } from "react";
import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

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
