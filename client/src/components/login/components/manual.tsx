import { forwardRef } from "react";
import { CardActions, CardActionButton, CardActionButtons } from "@rmwc/card";
import { TextField } from "@rmwc/textfield";
import { Select } from "@rmwc/select";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

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
import type { TUser } from "../types";

import styles from "../login.module.css";

interface IManualProps extends React.HTMLAttributes<HTMLDivElement> {
    toQR: () => void;
    onGetUser: (user: TUser) => void;
    confirmButtonLabel: string;
}
const Manual = forwardRef<HTMLDivElement, IManualProps>(
    ({ toQR, onGetUser, confirmButtonLabel, ...restProps }, ref) => (
        <div {...restProps} ref={ref}>
            <div className={styles["login__card-content"]}>
                <Select
                    options={["Unternehmen", "Bürger", "Gast"]}
                    label="Benutzerklasse"
                />
                <TextField label="Benutzername" />
            </div>
            <CardActions>
                <CardActionButtons
                    className={styles["login__card-action-buttons"]}
                >
                    <CardActionButton onClick={toQR}>
                        QR-Scanner
                    </CardActionButton>
                    <CardActionButton
                        raised
                        onClick={() => onGetUser("Max Mustermann")}
                    >
                        {confirmButtonLabel}
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </div>
    )
);
export default Manual;
