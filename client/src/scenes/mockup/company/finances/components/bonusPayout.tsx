import { type ChangeEvent, useCallback, useState } from "react";
import { TextField } from "Components/material/textfield";
import { Typography } from "Components/material/typography";
import { Chip, ChipSet } from "Components/material/chip";
import {
    Card,
    CardActions,
    CardHeader,
    CardActionButton,
    CardContent,
    CardDivider,
} from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { reassignIDs, repeatArr } from "Utility/dataMockup";
import { currency } from "Utility/data";

import styles from "../finances.module.scss";

type TUser = {
    id: string;
    name: string;
};
const employees = reassignIDs<TUser>(
    repeatArr(
        [
            { id: "", name: "Timon Martins" },
            { id: "", name: "Florian Bahnmüller" },
            { id: "", name: "Jan Keller" },
        ],
        3
    )
);

export const BonusPayout: React.FC = () => {
    // value of the bonus payment
    const [value, setValue] = useState(0);
    const [selectedEmployees, setSelectedEmployees] = useState<TUser[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const toggleEmployee = useCallback(
        (employee: TUser) => {
            const selectedIndex = selectedEmployees.indexOf(employee);

            // not selected: add to selected
            if (selectedIndex === -1)
                return setSelectedEmployees([...selectedEmployees, employee]);

            // already selected: removee from selected
            const newSelectedEmployees = [...selectedEmployees];
            newSelectedEmployees.splice(selectedIndex, 1);
            return setSelectedEmployees(newSelectedEmployees);
        },
        [selectedEmployees]
    );

    return (
        <Card>
            <CardHeader>Bonusauszahlung</CardHeader>
            <CardContent>
                <Typography use="caption">Mitarbeiter</Typography>
                <ChipSet input>
                    {selectedEmployees.map((employee) => (
                        <Chip
                            trailingIcon="close"
                            label={employee.name}
                            key={employee.id}
                            id={employee.id}
                            onRemove={() => toggleEmployee(employee)}
                        />
                    ))}
                    <Chip
                        key="add"
                        label="Hinzufügen"
                        icon="add_circle_outline"
                        className={styles["bonus-payout__add-user"]}
                        onClick={() => setShowAddDialog(true)}
                    />
                </ChipSet>
            </CardContent>
            <CardDivider />
            <CardContent>
                <TextField
                    label="Betrag in πCoin"
                    value={value || ""}
                    type="number"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setValue(parseInt(e.currentTarget.value, 10))
                    }
                />
            </CardContent>
            <CardActions fullBleed>
                <CardActionButton
                    trailingIcon="card_giftcard"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!(selectedEmployees.length && value)}
                >
                    Auszahlen
                </CardActionButton>
            </CardActions>
            <SimpleDialog
                title="Mitarbeiter auswählen"
                cancel={{
                    onCancel: () => setShowAddDialog(false),
                    label: "Schließen",
                }}
                open={showAddDialog}
            >
                <CardContent>
                    <ChipSet filter>
                        {employees.map((employee) => (
                            <Chip
                                label={employee.name}
                                onInteraction={() => toggleEmployee(employee)}
                                selected={selectedEmployees.includes(employee)}
                                key={employee.id}
                            />
                        ))}
                    </ChipSet>
                </CardContent>
            </SimpleDialog>
            <SimpleDialog
                title="Bonus auszahlen?"
                cancel={{
                    label: "Abbrechen",
                    onCancel: () => setShowConfirmDialog(false),
                }}
                accept={{
                    label: "Bestätigen",
                    danger: true,
                    raised: true,
                    isDefaultAction: true,
                    onAccept: () => setShowConfirmDialog(false),
                }}
                open={showConfirmDialog}
            >
                <CardContent
                    text={
                        <>
                            Eine Auszahlung von {currency(value)} an{" "}
                            {selectedEmployees.length} Mitarbeiter kostet das
                            Unternehmen{" "}
                            <Typography theme="primary" use="body1">
                                {currency(selectedEmployees.length * value)}
                            </Typography>
                            . Soll sie jetzt abgebucht werden?
                        </>
                    }
                />
            </SimpleDialog>
        </Card>
    );
};
