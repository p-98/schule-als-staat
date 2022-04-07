import { forwardRef } from "react";
import {
    CardActions,
    CardActionButton,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";
import { Select } from "Components/material/select";

// local
import type { TUser } from "Utility/types";

export interface IManualProps extends React.HTMLAttributes<HTMLDivElement> {
    toQR: () => void;
    onGetUser: (user: TUser) => void;
    confirmButtonLabel: string;
    header: string;
}
export const Manual = forwardRef<HTMLDivElement, IManualProps>(
    ({ toQR, onGetUser, confirmButtonLabel, header, ...restProps }, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps} ref={ref}>
            <CardHeader>{header}</CardHeader>
            <CardContent>
                <Select
                    options={["Unternehmen", "Bürger", "Gast"]}
                    label="Benutzerklasse"
                />
                <TextField id="login__manual" label="Benutzername" />
            </CardContent>
            <CardActions dialogLayout>
                <CardActionButton onClick={toQR}>QR-Scanner</CardActionButton>
                <CardActionButton
                    raised
                    onClick={() => onGetUser("Max Mustermann")}
                >
                    {confirmButtonLabel}
                </CardActionButton>
            </CardActions>
        </CardInner>
    )
);
