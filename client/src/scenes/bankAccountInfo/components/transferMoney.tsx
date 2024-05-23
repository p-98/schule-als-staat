import { memo } from "react";
import { ActionCard, TAction } from "Components/actionCard/actionCard";
import { graphql } from "Utility/graphql";
import { UserType } from "Utility/graphql/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { identity } from "lodash/fp";
import { currency, parseCurrency } from "Utility/data";

type TInputs = [UserType, string, number, string];

const transferMoneyMutation = graphql(/* GraphQL */ `
    mutation TransferMoneyMutation(
        $type: UserType!
        $id: String!
        $value: Float!
        $purpose: String
    ) {
        transferMoney(
            transfer: {
                receiver: { type: $type, id: $id }
                value: $value
                purpose: $purpose
            }
        ) {
            __typename
        }
    }
`);
const action: TAction<TInputs> = async ([type, id, value, purpose]) => {
    const variables = { type, id, value, purpose };
    const result = await client.mutation(transferMoneyMutation, variables);
    const { data, error } = safeData(result);
    const [userNotFoundError, valueNotPositiveError, balanceTooLowError] =
        categorizeError(error, [
            byCode("USER_NOT_FOUND"),
            byCode("VALUE_NOT_POSITIVE"),
            byCode("BALANCE_TOO_LOW"),
        ]);
    return {
        data: data ? true : undefined,
        inputErrors: [
            undefined,
            userNotFoundError,
            valueNotPositiveError ?? balanceTooLowError,
            undefined,
        ],
        unspecificError: undefined,
    };
};

export const TransferMoney = memo(() => (
    <ActionCard<TInputs>
        inputs={[
            {
                type: "select",
                label: "Empfänger Benutzerklasse",
                init: "CITIZEN",
                options: {
                    CITIZEN: "Bürger",
                    COMPANY: "Unternehmen",
                    GUEST: "Gast",
                },
            },
            {
                type: "text",
                label: "Empfänger Benutzername",
                init: "",
                toInput: identity,
                fromInput: identity,
            },
            {
                type: "text",
                label: "Betrag",
                init: 0,
                toInput: (_) => currency(_, { unit: "none" }),
                fromInput: parseCurrency,
            },
            {
                type: "text",
                label: "Betreff",
                init: "",
                toInput: identity,
                fromInput: identity,
            },
        ]}
        action={action}
        title="Überweisung"
        confirmButton={{ label: "Geld überweisen", danger: true }}
    />
));
