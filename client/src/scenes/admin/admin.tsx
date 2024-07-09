import { FC, memo, useState } from "react";
import { GridCell } from "Components/material/grid";
import { Typography } from "Components/material/typography";
import { Card, CardContent } from "Components/material/card/card";
import { ListDivider } from "Components/material/list";
import { Button } from "Components/material/button";
import { Dialog } from "Components/material/dialog";

import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { InputCard, TAction as TCardAction } from "Components/card/inputCard";
import { graphql } from "Utility/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { useRemount } from "Utility/hooks/hooks";
import { ActionButton, TAction } from "./components/actionButton";
import { ResetPassword } from "./components/resetPassword";

import styles from "./admin.module.css";

const backupDatabaseQuery = graphql(/* GraphQL */ `
    mutation BackupDatabaseQuery {
        backupDatabase
    }
`);
const backupAction: TAction = async () => {
    const result = await client.mutation(backupDatabaseQuery, {});
    const { data, error } = safeData(result);
    categorizeError(error, []);
    return { data: data ? true : undefined };
};
const reloadConfigQuery = graphql(/* GraphQL */ `
    mutation ReloadConfigQuery {
        reloadConfig
    }
`);
const reloadAction: TAction = async () => {
    const result = await client.mutation(reloadConfigQuery, {});
    const { data, error } = safeData(result);
    categorizeError(error, []);
    return { data: data ? true : undefined };
};
const blockCardMutation = graphql(/* GraphQL */ `
    mutation BlockCardMutation($id: ID!) {
        blockCard(id: $id) {
            id
            blocked
        }
    }
`);
const blockAction: TCardAction<[]> = async (id) => {
    const result = await client.mutation(blockCardMutation, { id });
    const { data, error } = safeData(result);
    const [cardNotFound, cardAlreadyBlocked] = categorizeError(error, [
        byCode("CARD_NOT_FOUND"),
        byCode("CARD_ALREADY_BLOCKED"),
    ]);
    return {
        data: data ? [] : undefined,
        idError: cardNotFound,
        unspecificError: cardAlreadyBlocked,
    };
};
const unblockCardMutation = graphql(/* GraphQL */ `
    mutation UnblockCardMutation($id: ID!) {
        unblockCard(id: $id) {
            id
            blocked
        }
    }
`);
const unblockAction: TCardAction<[]> = async (id) => {
    const result = await client.mutation(unblockCardMutation, { id });
    const { data, error } = safeData(result);
    const [cardNotFound, cardAlreadyUnblocked] = categorizeError(error, [
        byCode("CARD_NOT_FOUND"),
        byCode("CARD_ALREADY_UNBLOCKED"),
    ]);
    return {
        data: data ? [] : undefined,
        idError: cardNotFound,
        unspecificError: cardAlreadyUnblocked,
    };
};
const leaveAllCitizensMutation = graphql(/* GraphQL */ `
    mutation LeavelAllCitizensMutation {
        leaveAllCitizens {
            id
        }
    }
`);
const leaveAllAction: TAction = async () => {
    const result = await client.mutation(leaveAllCitizensMutation, {});
    const { data, error } = safeData(result);
    categorizeError(error, []);
    return { data: data ? true : undefined };
};

interface CardActionProps {
    action: TCardAction<[]>;
    confirmButton: { label: string; danger?: boolean };
    title: string;
}
const CardAction: FC<CardActionProps> = ({ action, confirmButton, title }) => {
    const [open, setOpen] = useState(false);
    const [inputCardKey, remountInputCard] = useRemount();
    return (
        <>
            <Button label={title} onClick={() => setOpen(true)} />
            <Dialog
                open={open}
                preventOutsideDismiss
                onClosed={remountInputCard}
            >
                <InputCard
                    key={inputCardKey}
                    action={action}
                    scanQr={open}
                    cancelButton={{ label: "Abbrechen" }}
                    onCancel={() => setOpen(false)}
                    confirmButton={confirmButton}
                    onSuccess={() => setOpen(false)}
                    title={title}
                    dialog
                />
            </Dialog>
        </>
    );
};

const ActionButtons = memo(() => (
    <Card>
        <CardContent className={styles["action-buttons__inner"]}>
            <Typography use="headline6">Datenbank & Config</Typography>
            <ActionButton action={backupAction} label="Datenbank sichern" />
            <ActionButton action={reloadAction} label="Config neu laden" />
        </CardContent>
        <ListDivider />
        <CardContent>
            <Typography use="headline6">Karten</Typography>
            <CardAction
                action={blockAction}
                confirmButton={{ label: "Sperren", danger: true }}
                title="Karte sperren"
            />
            <CardAction
                action={unblockAction}
                confirmButton={{ label: "Entsperren", danger: true }}
                title="Karte entsperren"
            />
        </CardContent>
        <ListDivider />
        <CardContent>
            <Typography use="headline6">Sonstiges</Typography>
            <ActionButton
                action={leaveAllAction}
                label="Alle Bürger ausweisen"
                confirmDialog={{
                    title: "Ausweisen Bestätigen",
                    content:
                        "Möchtest Du registrieren, dass alle Bürger den Staat verlassen? Dies kann nicht rückgängig gemacht werden, alle Bürger müssen dann wieder durch den Zoll in den Staat kommen.",
                    danger: true,
                }}
            />
        </CardContent>
    </Card>
));

export const Admin: React.FC = () => (
    <GridPage>
        <DrawerAppBarHandle title="Administration" />
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <ActionButtons />
        </GridCell>
        <GridCell span={4}>
            <ResetPassword />
        </GridCell>
    </GridPage>
);
