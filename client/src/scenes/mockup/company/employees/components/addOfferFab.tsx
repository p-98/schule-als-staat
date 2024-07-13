import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { TextField } from "Components/material/textfield";
import { MenuSurfaceAnchor, MenuSurface } from "Components/material/menu";
import { List, ListItem } from "Components/material/list";
import { CardContent } from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";
import { Fab } from "Components/material/fab";

// local
import { useForceRemount } from "Utility/hooks/forceRemount";
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setValue(e.currentTarget.value)
                }
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
                        <TextField label="Stundenlohn in πCoin" type="number" />
                    </CardContent>
                </React.Fragment>
            </SimpleDialog>
        </>
    );
};
