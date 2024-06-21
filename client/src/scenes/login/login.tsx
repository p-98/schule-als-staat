import { useRouter } from "next/router";
import { startsWith } from "lodash/fp";
import { GridCell } from "Components/material/grid";
import { Card } from "Components/material/card";

// local
import { GridPage } from "Components/page/page";
import {
    InputCredentials,
    TAction as TCredentialsAction,
} from "Components/credentials/inputCredentials";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { syncify } from "Utility/misc";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { graphql } from "Utility/graphql";
import { UserBanner } from "Components/userBanner/userBanner";

import styles from "./login.module.css";

const passwordMutation = graphql(/* GraphQL */ `
    mutation LoginMutation($credentials: CredentialsInput!) {
        login(credentials: $credentials) {
            id
            user {
                id
            }
        }
    }
`);

const loginAction: TCredentialsAction<[]> = async (type, id, password) => {
    const credentials = { type, id, password };
    const result = await client.mutation(passwordMutation, { credentials });
    const { data, error } = safeData(result);
    const [passwordError] = categorizeError(error, [
        byCode(startsWith("PASSWORD")),
    ]);
    return { data: data ? [] : undefined, passwordError };
};

export const Login: React.FC = () => {
    const router = useRouter();
    return (
        <GridPage>
            <DrawerAppBarHandle title="Login" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <Card className={styles["login__card"]}>
                    <InputCredentials
                        action={loginAction}
                        scanQr
                        confirmButton={{ label: "Anmelden" }}
                        onSuccess={() =>
                            syncify(router.push("/bankAccountInfo"))
                        }
                        title="Anmelden"
                        actionSummary={(user) => (
                            <UserBanner label="Anmelden als" user={user} />
                        )}
                    />
                </Card>
            </GridCell>
        </GridPage>
    );
};
