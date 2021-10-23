import { forwardRef } from "react";
import {
    CardActions,
    CardActionButton,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/card/card";
import { TextField } from "@rmwc/textfield";
import { Select } from "@rmwc/select";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
// import "@material/floating-label/dist/mdc.floating-label.css";
// import "@material/notched-outline/dist/mdc.notched-outline.css";
// import "@material/line-ripple/dist/mdc.line-ripple.css";
// import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// select imports
import "@rmwc/select/select.css";
import "@material/select/dist/mdc.select.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/list/dist/mdc.list.css";
import "@material/menu/dist/mdc.menu.css";
import "@material/menu-surface/dist/mdc.menu-surface.css";
import "@material/ripple/dist/mdc.ripple.css";

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
