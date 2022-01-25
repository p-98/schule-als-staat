import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ListDivider } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import { Button } from "@rmwc/button";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// button imports
import "@material/button/dist/mdc.button.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import { SimpleDialog } from "Components/dialog/dialog";
import { AuthUser } from "Components/login/authUser";
import { useDispatch } from "Utility/hooks/redux";
import {
    login,
    logout,
    selectLoggedIn,
} from "Utility/redux/slices/companyAdminSlice";

import styles from "./routing.module.css";

export const Top: React.FC = () => (
    <>
        <Typography
            use="caption"
            theme="textSecondaryOnBackground"
            className={styles["company-administration__top"]}
        >
            Unternehmensverwaltung
        </Typography>
    </>
);

interface IBottomProps {
    forceNavUpdate: () => void;
}
export const Bottom: React.FC<IBottomProps> = ({ forceNavUpdate }) => {
    const [showDialog, setShowDialog] = useState(false);
    const dispatch = useDispatch();
    const loggedIn = useSelector(selectLoggedIn);

    return (
        <>
            <Button
                label={loggedIn ? "Sperren" : "Entsperren"}
                raised
                theme={loggedIn ? ["secondaryBg", "onSecondary"] : []}
                className={styles["company-administration__bottom"]}
                onClick={() => {
                    if (!loggedIn) return setShowDialog(true);

                    dispatch(logout());
                    forceNavUpdate();
                }}
            />
            <ListDivider />
            <SimpleDialog
                open={showDialog}
                renderToPortal
                onClose={() => setShowDialog(false)}
            >
                <AuthUser
                    confirmButton={{ label: "Entsperren" }}
                    cancelButton={{
                        label: "Abbrechen",
                        onClick: () => setShowDialog(false),
                    }}
                    onAuthUser={() => {
                        setShowDialog(false);
                        dispatch(login());
                        forceNavUpdate();
                    }}
                    user="Max Mustermann"
                    header="Passwort eingeben"
                    userBannerLabel="Für Unternehmer"
                />
            </SimpleDialog>
        </>
    );
};
