import { forwardRef, useState } from "react";
import { CardActions, CardActionButton, CardActionButtons } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { TextField } from "@rmwc/textfield";
import { Select } from "@rmwc/select";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

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
import {
    Modes,
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import Password from "./password";

import styles from "../login.module.css";

interface IManualLoginProps extends React.HTMLAttributes<HTMLDivElement> {
    toQR: () => void;
    toPassword: () => void;
}
const ManualLogin = forwardRef<HTMLDivElement, IManualLoginProps>(
    ({ toQR, toPassword, ...restProps }, ref) => (
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
                    <CardActionButton raised onClick={toPassword}>
                        Weiter
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </div>
    )
);

enum EStages {
    login,
    password,
}
interface IManualProps extends React.HTMLAttributes<HTMLDivElement> {
    toQR: () => void;
    onLogin: () => void;

    // display props
    header: string;
}
const Manual = forwardRef<HTMLDivElement, IManualProps>(
    ({ toQR, onLogin, header, ...restProps }, ref) => {
        const [stage, setStage] = useState(EStages.login);

        return (
            <div {...restProps} ref={ref}>
                <Typography
                    use="headline6"
                    className={styles["login__card-header"]}
                >
                    {header}
                </Typography>
                <SiblingTransitionBase mode={Modes.xAxis} activeElement={stage}>
                    <SiblingTransitionBaseElement index={EStages.login}>
                        <ManualLogin
                            toQR={toQR}
                            toPassword={() => setStage(EStages.password)}
                        />
                    </SiblingTransitionBaseElement>
                    <SiblingTransitionBaseElement index={EStages.password}>
                        <Password
                            onLogin={onLogin}
                            goBack={() => setStage(EStages.login)}
                        />
                    </SiblingTransitionBaseElement>
                </SiblingTransitionBase>
            </div>
        );
    }
);
export default Manual;
