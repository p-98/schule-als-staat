import { useCallback, useState } from "react";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { Chip, ChipSet } from "@rmwc/chip";
import { ListDivider } from "@rmwc/list";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// chip
import "@material/chips/dist/mdc.chips.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// list imports
import "@material/list/dist/mdc.list.css";
// import "@material/ripple/dist/mdc.ripple.css";
// import "@rmwc/icon/icon.css";

// local
import {
    Card,
    CardActions,
    CardHeader,
    CardActionButton,
    CardContent,
} from "Components/card/card";
import config from "Config";
import { reassignIDs, repeatArr } from "Utility/dataMockup";
import { SimpleDialog } from "Components/dialog/dialog";
import { parseCurrency } from "Utility/parseCurrency";

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
        (employee) => {
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
                <ChipSet>
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
                <ListDivider />
            </CardContent>
            <CardContent>
                <TextField
                    label={`Betrag in ${config.currencies.virtual.short}`}
                    value={value || ""}
                    type="number"
                    onChange={(e) =>
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
                    <ChipSet choice>
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
                            Eine Auszahlung von {parseCurrency(value)} an{" "}
                            {selectedEmployees.length} Mitarbeiter kostet das
                            Unternehmen{" "}
                            <Typography theme="primary" use="body1">
                                {parseCurrency(
                                    selectedEmployees.length * value
                                )}
                            </Typography>
                            . Soll sie jetzt abgebucht werden?
                        </>
                    }
                />
            </SimpleDialog>
        </Card>
    );
};
