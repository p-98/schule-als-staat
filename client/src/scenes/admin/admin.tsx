import { memo } from "react";
import { GridCell } from "Components/material/grid";
import { Typography } from "Components/material/typography";
import { Card, CardContent } from "Components/material/card/card";

import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { graphql } from "Utility/graphql";
import { categorizeError, client, safeData } from "Utility/urql";
import { ActionButton, TAction } from "./components/actionButton";

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

const ActionButtons = memo(() => (
    <Card>
        <CardContent className={styles["action-buttons__inner"]}>
            <Typography use="headline6">Datenbank & Config</Typography>
            <ActionButton action={backupAction} label="Datenbank sichern" />
            <ActionButton action={reloadAction} label="Config neu laden" />
        </CardContent>
    </Card>
));

export const Admin: React.FC = () => (
    <GridPage>
        <DrawerAppBarHandle title="Administration" />
        <GridCell desktop={4} tablet={2} phone={0} />
        <GridCell span={4}>
            <ActionButtons />
        </GridCell>
    </GridPage>
);
