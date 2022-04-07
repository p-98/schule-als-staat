import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ListDivider } from "Components/material/list";
import { Typography } from "Components/material/typography";
import { Button } from "Components/material/button";
import { SimpleDialog } from "Components/material/dialog";

// local
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
