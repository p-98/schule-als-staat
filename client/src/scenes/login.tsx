import { useRouter } from "next/router";
import { GridCell } from "Components/material/grid";
import { Card } from "Components/material/card";

// local
import { GridPage } from "Components/page/page";
import {
    InputCredentials,
    TAction as TCredentialsAction,
} from "Components/credentials/inputCredentials";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { dispatch } from "Utility/misc";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { graphql } from "Utility/graphql";
import { UserBanner } from "Components/userBanner/userBanner";

const passwordMutation = graphql(/* GraphQL */ `
    mutation LoginMutation($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            id
            user {
                id
            }
        }
    }
`);

const loginAction: TCredentialsAction<[]> = async (type, id, password) => {
    const result = await client.mutation(passwordMutation, {
        type,
        id,
        password,
    });
    const { data, error } = safeData(result);
    const [passwordError] = categorizeError(error, [byCode("WRONG_PASSWORD")]);
    return { data: data ? [] : undefined, passwordError };
};

export const Login: React.FC = () => {
    const router = useRouter();
    return (
        <GridPage>
            <DrawerAppBarHandle title="Login" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <Card>
                    <InputCredentials
                        action={loginAction}
                        confirmButton={{ label: "Anmelden" }}
                        onSuccess={() =>
                            dispatch(router.push("/bankAccountInfo"))
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
