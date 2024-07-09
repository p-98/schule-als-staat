import { identity } from "lodash/fp";
import { memo } from "react";

import { ActionCard, TAction } from "Components/actionCard/actionCard";
import { graphql } from "Utility/graphql";
import { UserType } from "Utility/graphql/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { parseUserId } from "Utility/data";

const resetMutation = graphql(/* GraphQL */ `
    mutation ResetPasswordMutation(
        $type: UserType!
        $id: String!
        $password: String!
    ) {
        resetPassword(user: { type: $type, id: $id }, password: $password) {
            id
        }
    }
`);

type Input = [UserType, string, string];

const action: TAction<[], Input> = async ([type, id, password]) => {
    const result = await client.mutation(resetMutation, { type, id, password });
    const { data, error } = safeData(result);
    const [userNotFoundError, userIsGuestError] = categorizeError(error, [
        byCode("USER_NOT_FOUND"),
        byCode("USER_IS_GUEST"),
    ]);
    return {
        data: data ? [] : undefined,
        inputErrors: [userIsGuestError, userNotFoundError, undefined],
        unspecificError: undefined,
    };
};

export const ResetPassword = memo(() => (
    <ActionCard<[], Input>
        inputs={[
            {
                label: "Benutzerklasse",
                type: "select",
                init: "CITIZEN",
                options: {
                    CITIZEN: "Bürger",
                    COMPANY: "Unternehmen",
                    GUEST: "Gast",
                },
            },
            {
                label: "Benutzername",
                type: "text",
                init: "",
                toInput: identity,
                fromInput: parseUserId,
            },
            {
                label: "Neues Passwort",
                type: "text",
                init: "",
                toInput: identity,
                fromInput: identity,
            },
        ]}
        action={action}
        title="Passwort zurücksetzen"
        confirmButton={{ label: "Zurücksetzen" }}
        dangerDialog={{
            title: "Zurücksetzen bestätigen",
            content:
                "Möchtest Du wirklich das Passwort zurücksetzen? Dies kann nicht rückgängig gemacht werden.",
        }}
    />
));
