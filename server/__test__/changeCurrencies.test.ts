import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
    createTestServer,
    config,
} from "Util/test";

import { omit, without } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { EUserTypes } from "Types/models";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment All_ChangeDraftFragment on ChangeDraft {
        id
        date
        fromCurrency
        fromValue
        toCurrency
        toValue
        clerk {
            id
        }
    }
`);
graphql(/* GraphQL */ `
    fragment All_ChangeTransactionFragment on ChangeTransaction {
        id
        date
        user {
            __typename
            id
        }
        fromCurrency
        fromValue
        toCurrency
        toValue
        clerk {
            id
        }
    }
`);

const balanceAndChangeTransactionsQuery = graphql(/* GraphQL */ `
    query BalanceAndChangeTransactions {
        me {
            balance
            transactions {
                ... on ChangeTransaction {
                    ...All_ChangeTransactionFragment
                }
            }
            ... on CompanyUser {
                drafts {
                    ... on ChangeDraft {
                        ...All_ChangeDraftFragment
                    }
                }
            }
        }
    }
`);
const changeCurrenciesMutation = graphql(/* GraphQL */ `
    mutation ChangeCurrencies(
        $fromCurrency: String!
        $fromValue: Float!
        $toCurrency: String!
        $clerk: ID
    ) {
        changeCurrencies(
            change: {
                fromCurrency: $fromCurrency
                fromValue: $fromValue
                toCurrency: $toCurrency
                clerk: $clerk
            }
        ) {
            ...All_ChangeDraftFragment
        }
    }
`);
const deleteDraftMutation = graphql(/* GraphQL */ `
    mutation DeleteChangeDraft($id: Int!) {
        deleteChangeDraft(id: $id)
    }
`);
const payDraftBankMutation = graphql(/* GraphQL */ `
    mutation PayChangeDraftBank($id: Int!, $credentials: CredentialsInput!) {
        payChangeDraft(id: $id, credentials: $credentials) {
            ...All_ChangeTransactionFragment
        }
    }
`);
const payDraftUserMutation = graphql(/* GraphQL */ `
    mutation PayChangeDraftUser($id: Int!) {
        payChangeDraft(id: $id) {
            ...All_ChangeTransactionFragment
        }
    }
`);

let knex: Knex;
let yoga: TYogaServerInstance;
let bank: TUserExecutor;
let citizenWithIdOfBank: TUserExecutor;
let citizen: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    bank = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.bankCompanyId,
    });
    citizenWithIdOfBank = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: bank.id,
    });
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
});
afterEach(async () => {
    await knex.destroy();
});

type IChangeDraft = ResultOf<
    typeof changeCurrenciesMutation
>["changeCurrencies"];
type IChangeTransaction = ResultOf<
    typeof payDraftBankMutation
>["payChangeDraft"];
type IState = ResultOf<typeof balanceAndChangeTransactionsQuery>["me"];

function forEachUserType<T>(
    fn: (user: TUserExecutor) => Promise<T>
): Promise<T[]> {
    return Promise.all([citizen, company, guest].map(fn));
}

const assertState =
    (user: TUserExecutor) => async (expected: IState, message?: string) => {
        const result = await user({
            document: balanceAndChangeTransactionsQuery,
        });
        assertSingleValue(result);
        assertNoErrors(result);
        assert.deepStrictEqual(result.data.me, expected, message);
    };
const assertUntouched = (user: TUserExecutor) =>
    assertState(user)(
        {
            balance: 10.0,
            transactions: [],
            ...(user.type === "COMPANY" && { drafts: [] }),
        },
        "Unused user should have untouched state"
    );

const testChangeCurrencies = async (
    fromCurrency: "plancko-digital" | "plancko-analog",
    fromValue: number
): Promise<IChangeDraft> => {
    const input = {
        fromCurrency,
        fromValue,
        toCurrency:
            fromCurrency === "plancko-digital"
                ? "plancko-analog"
                : "plancko-digital",
        clerk: citizen.id,
    };

    // invalid requests
    const wrongUserId = await company({
        document: changeCurrenciesMutation,
        variables: input,
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfBank({
        document: changeCurrenciesMutation,
        variables: input,
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");
    const unknownFromCurrency = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, fromCurrency: "unknown-currency" },
    });
    assertInvalid(unknownFromCurrency, "FROM_CURRENCY_UNKNOWN");
    const negativeFromValue = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, fromValue: -1 },
    });
    assertInvalid(negativeFromValue, "FROM_VALUE_NOT_POSITIVE");
    const zeroFromValue = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, fromValue: -0 },
    });
    assertInvalid(zeroFromValue, "FROM_VALUE_NOT_POSITIVE");
    const unknownToCurrency = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, toCurrency: "unknown-currency" },
    });
    assertInvalid(unknownToCurrency, "TO_CURRENCY_UNKNOWN");
    const unknownClerk = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, clerk: "unknownCitizenId" },
    });
    assertInvalid(unknownClerk, "CLERK_UNKNOWN");
    const missingClerk = await bank({
        document: changeCurrenciesMutation,
        variables: { ...input, clerk: null },
    });
    assertInvalid(missingClerk, "CLERK_MISSING");
    // TODO: test for CLERK_SET error when config.flags.changeTransactionClerk is unset

    // valid request
    const before = new Date();
    const changeCurrencies = await bank({
        document: changeCurrenciesMutation,
        variables: input,
    });
    const after = new Date();
    assertSingleValue(changeCurrencies);
    assertNoErrors(changeCurrencies);
    const draft = changeCurrencies.data.changeCurrencies;
    assert.deepStrictEqual(omit(["date", "id"], draft), {
        ...input,
        toValue:
            fromCurrency === "plancko-digital"
                ? 2 * fromValue
                : 0.5 * fromValue,
        clerk: { id: input.clerk },
    });
    assert.isAtLeast(new Date(draft.date).getTime(), before.getTime());
    assert.isAtMost(new Date(draft.date).getTime(), after.getTime());

    return draft;
};

const testPayDraft = async (
    draft: IChangeDraft,
    user: TUserExecutor,
    useBank: boolean
): Promise<IChangeTransaction> => {
    // invalid requests
    const invalidIdBank = await bank({
        document: payDraftBankMutation,
        variables: { id: 404, credentials: user.credentials },
    });
    assertInvalid(invalidIdBank, "CHANGE_TRANSACTION_NOT_FOUND");
    const missingCredentials = await bank({
        document: payDraftUserMutation,
        variables: { id: draft.id },
    });
    assertInvalid(missingCredentials, "CREDENTIALS_MISSING");
    // validation of credentials is tested in login tests
    await forEachUserType(async (_user) => {
        const invalidIdUser = await _user({
            document: payDraftUserMutation,
            variables: { id: 404 },
        });
        assertInvalid(invalidIdUser, "CHANGE_TRANSACTION_NOT_FOUND");
        const addedCredentials = await _user({
            document: payDraftBankMutation,
            variables: { id: draft.id, credentials: user.credentials },
        });
        assertInvalid(addedCredentials, "CREDENTIALS_SET");
    });

    // valid request
    const payDraft = useBank
        ? await bank({
              document: payDraftBankMutation,
              variables: { id: draft.id, credentials: user.credentials },
          })
        : await user({
              document: payDraftUserMutation,
              variables: { id: draft.id },
          });
    assertSingleValue(payDraft);
    assertNoErrors(payDraft);
    const transaction = payDraft.data.payChangeDraft;
    assert.deepStrictEqual(transaction, {
        ...draft,
        user: { __typename: EUserTypes[user.type], id: user.id },
    });

    // invalid when paid
    const deleteDraft = await bank({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(deleteDraft, "CHANGE_TRANSACTION_ALREADY_PAID");
    await forEachUserType(async (_user) => {
        const payDraftBank = await bank({
            document: payDraftBankMutation,
            variables: { id: draft.id, credentials: user.credentials },
        });
        assertInvalid(payDraftBank, "CHANGE_TRANSACTION_ALREADY_PAID");
        const payDraftUser = await _user({
            document: payDraftUserMutation,
            variables: { id: draft.id },
        });
        assertInvalid(payDraftUser, "CHANGE_TRANSACTION_ALREADY_PAID");
    });

    return transaction;
};

const testDeleteDraft = async (draft: IChangeDraft) => {
    // invlaid requests
    const invalidId = await bank({
        document: deleteDraftMutation,
        variables: { id: 404 },
    });
    assertInvalid(invalidId, "CHANGE_TRANSACTION_NOT_FOUND");
    const wrongUserId = await company({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfBank({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const deleteDraft = await bank({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertSingleValue(deleteDraft);
    assertNoErrors(deleteDraft);
    assert.strictEqual(deleteDraft.data.deleteChangeDraft, null);

    // invalid when deleted
    const deleteAgain = await bank({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(deleteAgain, "CHANGE_TRANSACTION_NOT_FOUND");
    await forEachUserType(async (_user) => {
        const payDraftBank = await bank({
            document: payDraftBankMutation,
            variables: { id: draft.id, credentials: _user.credentials },
        });
        assertInvalid(payDraftBank, "CHANGE_TRANSACTION_NOT_FOUND");
        const payDraftUser = await _user({
            document: payDraftUserMutation,
            variables: { id: draft.id },
        });
        assertInvalid(payDraftUser, "CHANGE_TRANSACTION_NOT_FOUND");
    });
};

async function testCreateAndDelete(
    fromCurrency: "plancko-digital" | "plancko-analog"
) {
    const draft = await testChangeCurrencies(fromCurrency, 2.0);
    await assertState(bank)({ balance: 10, transactions: [], drafts: [draft] });
    await testDeleteDraft(draft);
    await assertUntouched(bank);

    await Promise.all([guest, company, citizen].map(assertUntouched));
}
async function testCreateAndPay(
    fromCurrency: "plancko-digital" | "plancko-analog",
    user: TUserExecutor,
    mode: "PAY_BY_BANK" | "PAY_BY_USER"
) {
    const draft = await testChangeCurrencies(fromCurrency, 2.0);
    await assertState(bank)({ balance: 10, transactions: [], drafts: [draft] });
    const transaction = await testPayDraft(draft, user, mode === "PAY_BY_BANK");
    await assertState(bank)({
        balance: fromCurrency === "plancko-digital" ? 12.0 : 9.0,
        transactions: [transaction],
        drafts: [],
    });
    await assertState(user)({
        balance: fromCurrency === "plancko-digital" ? 8.0 : 11.0,
        transactions: [transaction],
        ...(user.type === "COMPANY" && { drafts: [] }),
    });

    const otherUsers = without([user], [citizen, company, guest]);
    await Promise.all(otherUsers.map(assertUntouched));
}

test("high fromValue", async () => {
    const draft = await testChangeCurrencies("plancko-digital", 11);
    const highFromValue = await citizen({
        document: payDraftUserMutation,
        variables: { id: draft.id },
    });
    assertInvalid(highFromValue, "BALANCE_TOO_LOW");
});

test("create main->other, delete", () =>
    testCreateAndDelete("plancko-digital"));
test("create other->main, delete", () => testCreateAndDelete("plancko-analog"));

(["plancko-digital", "plancko-analog"] as const).forEach((fromCurrency) => {
    (["citizen", "company", "guest"] as const).forEach((_user) => {
        (["PAY_BY_BANK", "PAY_BY_USER"] as const).forEach((mode) => {
            const dir =
                fromCurrency === "plancko-digital"
                    ? "main->other"
                    : "other->main";
            const paymentMethod = mode.toLowerCase().replace("_", " ");
            test(`create ${dir}, ${paymentMethod} for ${_user}`, async () => {
                const user = { citizen, company, guest }[_user];
                await testCreateAndPay(fromCurrency, user, mode);
            });
        });
    });
});
