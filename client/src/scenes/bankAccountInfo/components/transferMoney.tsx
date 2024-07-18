import { memo, useContext } from "react";
import { ActionCard, TAction } from "Components/actionCard/actionCard";
import { graphql } from "Utility/graphql";
import { UserType } from "Utility/graphql/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { identity } from "lodash/fp";
import { currency, parseCurrency, parseUserId } from "Utility/data";
import { sessionUserCtx } from "Scenes/_app/contexts";

type TCompanyInputs = [UserType, string, number, string, string];
type TInputs = [UserType, string, number, string];

const checkPwQuery = graphql(/* GraphQL */ `
    query CheckPasswordQuery($id: ID!, $password: String!) {
        checkCredentials(
            credentials: { type: COMPANY, id: $id, password: $password }
        ) {
            __typename
        }
    }
`);
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
            id
        }
    }
`);
const companyAction =
    (companyId: string): TAction<[], TCompanyInputs> =>
    async ([type, id, value, purpose, companyPw]) => {
        const pwVariables = { id: companyId, password: companyPw };
        const pwResult = await client.query(checkPwQuery, pwVariables);
        const { data: pwData, error: pwError } = safeData(pwResult);
        const [passwordWrongError] = categorizeError(pwError, [
            byCode("PASSWORD_WRONG"),
        ]);
        if (!pwData)
            return {
                inputErrors: [
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    passwordWrongError,
                ],
            };

        const variables = { type, id, value, purpose: purpose || undefined };
        const result = await client.mutation(transferMoneyMutation, variables);
        const { data, error } = safeData(result);
        const [userNotFoundError, valueNotPositiveError, balanceTooLowError] =
            categorizeError(error, [
                byCode("USER_NOT_FOUND"),
                byCode("VALUE_NOT_POSITIVE"),
                byCode("BALANCE_TOO_LOW"),
            ]);
        return {
            data: data ? [] : undefined,
            inputErrors: [
                undefined,
                userNotFoundError,
                valueNotPositiveError ?? balanceTooLowError,
                undefined,
                undefined,
            ],
            unspecificError: undefined,
        };
    };
const action: TAction<[], TInputs> = async ([type, id, value, purpose]) => {
    const variables = { type, id, value, purpose: purpose || undefined };
    const result = await client.mutation(transferMoneyMutation, variables);
    const { data, error } = safeData(result);
    const [userNotFoundError, valueNotPositiveError, balanceTooLowError] =
        categorizeError(error, [
            byCode("USER_NOT_FOUND"),
            byCode("VALUE_NOT_POSITIVE"),
            byCode("BALANCE_TOO_LOW"),
        ]);
    return {
        data: data ? [] : undefined,
        inputErrors: [
            undefined,
            userNotFoundError,
            valueNotPositiveError ?? balanceTooLowError,
            undefined,
        ],
        unspecificError: undefined,
    };
};

export const TransferMoney = memo(() => {
    const sessionUser = useContext(sessionUserCtx)!;

    if (sessionUser.type === "COMPANY")
        return (
            <ActionCard<[], TCompanyInputs>
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
                        fromInput: parseUserId,
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
                    {
                        type: "text",
                        protect: true,
                        label: "Passwort Unternehmen",
                        init: "",
                        toInput: identity,
                        fromInput: identity,
                    },
                ]}
                action={companyAction(sessionUser.id)}
                title="Überweisung"
                confirmButton={{ label: "Geld überweisen" }}
                dangerDialog={{
                    title: "Überweisen bestätigen",
                    content:
                        "Bist Du sicher, dass du die Überweisung tätigen möchtest? Dies kann nicht rückgängig gemacht werden.",
                }}
            />
        );
    return (
        <ActionCard<[], TInputs>
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
                    fromInput: parseUserId,
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
            confirmButton={{ label: "Geld überweisen" }}
            dangerDialog={{
                title: "Überweisen bestätigen",
                content:
                    "Bist Du sicher, dass du die Überweisung tätigen möchtest? Dies kann nicht rückgängig gemacht werden.",
            }}
        />
    );
});
