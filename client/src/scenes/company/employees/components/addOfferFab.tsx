import React, { useState, useEffect, useRef } from "react";
import { TextField } from "@rmwc/textfield";
import { MenuSurfaceAnchor, MenuSurface } from "@rmwc/menu";
import { List, ListItem } from "@rmwc/list";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// menu imports
import "@material/menu/dist/mdc.menu.css";
import "@material/menu-surface/dist/mdc.menu-surface.css";
// import "@material/ripple/dist/mdc.ripple.css";
import "@material/list/dist/mdc.list.css";
// import "@rmwc/icon/icon.css";

// list imports
// import "@material/list/dist/mdc.list.css";
// import "@material/ripple/dist/mdc.ripple.css";
// import "@rmwc/icon/icon.css";

// local
import { CardContent } from "Components/card/card";
import { useForceRemount } from "Utility/hooks/forceRemount";
import { SimpleDialog } from "Components/dialog/dialog";
import { Fab } from "Components/fab/fab";
import config from "Config";

import styles from "../employees.module.scss";

const users = ["Max Mustermann", "Alex Binnix", "Lea Links"];

const EmployeeInput: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const textFieldRef = useRef<HTMLInputElement>(null);

    const [value, setValue] = useState("");
    const [hasFocus, setHasFocus] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<string[]>([]);

    // prevent all items from being flashed when input is cleared
    useEffect(() => {
        if (!value.length) return;
        setFilteredUsers(users.filter((name) => name.startsWith(value)));
    }, [value]);

    return (
        <MenuSurfaceAnchor
            ref={ref}
            onFocus={() => setHasFocus(true)}
            onBlur={() =>
                requestAnimationFrame(() => {
                    if (ref.current?.contains(document.activeElement)) return;
                    setHasFocus(false);
                })
            }
            className={styles["employee-input"]}
        >
            <MenuSurface
                open={!!value.length && hasFocus}
                anchorCorner="bottomStart"
            >
                <List>
                    {filteredUsers.map((name) => (
                        <ListItem
                            tabIndex={0}
                            key={name}
                            onClick={() => {
                                setValue(name);
                                textFieldRef.current?.focus();
                            }}
                        >
                            {name}
                        </ListItem>
                    ))}
                </List>
            </MenuSurface>
            <TextField
                label="Arbeitnehmer"
                type="text"
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                ref={textFieldRef}
            />
        </MenuSurfaceAnchor>
    );
};

interface IAddOfferFabProps {
    exited: boolean;
}
export const AddOfferFab: React.FC<IAddOfferFabProps> = ({ exited }) => {
    const [showDialog, setShowDialog] = useState(false);
    /** used to clear inputs when reopened */
    const [formKey, remountForm] = useForceRemount();

    return (
        <>
            <Fab
                icon="add"
                onClick={() => setShowDialog(true)}
                exited={exited}
            />
            <SimpleDialog
                title="Arbeitsvertrag anbieten"
                open={showDialog}
                onClosed={remountForm}
                cancel={{
                    label: "Abbrechen",
                    onCancel: () => setShowDialog(false),
                }}
                accept={{
                    label: "Bestätigen",
                    danger: true,
                    raised: true,
                    onAccept: () => setShowDialog(false),
                }}
                preventOutsideDismiss
            >
                <React.Fragment key={formKey}>
                    <CardContent>
                        <EmployeeInput />
                    </CardContent>
                    <CardContent>
                        <TextField
                            label="Arbeitszeit in Stunden"
                            type="number"
                        />
                        <TextField
                            label={`Stundenlohn in ${config.currencies.virtual.short}`}
                            type="number"
                        />
                    </CardContent>
                </React.Fragment>
            </SimpleDialog>
        </>
    );
};
