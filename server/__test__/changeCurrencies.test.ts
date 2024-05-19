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

import { omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import type { TChangeTransactionAction } from "Types/schema";
import { EUserTypes } from "Types/models";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment All_ChangeDraftFragment on ChangeDraft {
        id
        date
        action
        valueVirtual
        valueReal
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
        action
        valueVirtual
        valueReal
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
        $action: ChangeTransactionAction!
        $value: Float!
    ) {
        changeCurrencies(change: { action: $action, value: $value }) {
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
type IState = ResultOf<typeof balanceAndChangeTransactionsQuery>["me"];

function forEachUserType<T>(
    fn: (user: TUserExecutor) => Promise<T>
): Promise<T[]> {
    return Promise.all([citizen, company, guest].map(fn));
}

const assertBankAndUserStates =
    (bankExpected: IState, bankMessage?: string) =>
    async (
        activeUser?: TUserExecutor,
        userExpected?: IState,
        userMessage?: string
    ) => {
        const bankResult = await bank({
            document: balanceAndChangeTransactionsQuery,
        });
        assertSingleValue(bankResult);
        assertNoErrors(bankResult);
        assert.deepStrictEqual(bankResult.data.me, bankExpected, bankMessage);

        if (activeUser && userExpected) {
            const activeResult = await activeUser({
                document: balanceAndChangeTransactionsQuery,
            });
            assertSingleValue(activeResult);
            assertNoErrors(activeResult);
            assert.deepStrictEqual(
                activeResult.data.me,
                userExpected,
                userMessage
            );
        }

        await forEachUserType(async (inactiveUser) => {
            if (inactiveUser === activeUser) return;

            const inactiveResult = await inactiveUser({
                document: balanceAndChangeTransactionsQuery,
            });
            assertSingleValue(inactiveResult);
            assertNoErrors(inactiveResult);
            assert.deepStrictEqual(
                inactiveResult.data.me,
                {
                    balance: 10.0,
                    transactions: [],
                    ...(inactiveUser.type === "COMPANY" && { drafts: [] }),
                },
                "Unused user should have untouched state"
            );
        });
    };

const testChangeCurrencies = async (
    action: TChangeTransactionAction
): Promise<IChangeDraft> => {
    const value = 2.0;
    const input = { action, value };

    await assertBankAndUserStates(
        { balance: 10.0, transactions: [], drafts: [] },
        "Initially nothing should be changed"
    )(undefined);

    // invalid requests
    const invalidValue = await bank({
        document: changeCurrenciesMutation,
        variables: { action, value: -1.0 },
    });
    assertInvalid(invalidValue, "BAD_USER_INPUT");
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
        action,
        valueVirtual:
            action === "VIRTUAL_TO_REAL"
                ? value
                : config.currencyExchange.virtualPerReal * value,
        valueReal:
            action === "REAL_TO_VIRTUAL"
                ? value
                : config.currencyExchange.realPerVirtual * value,
    });
    assert.isAtLeast(new Date(draft.date).getTime(), before.getTime());
    assert.isAtMost(new Date(draft.date).getTime(), after.getTime());

    await assertBankAndUserStates(
        { balance: 10.0, transactions: [], drafts: [draft] },
        "After draft creation draft should be present"
    )(undefined);

    return draft;
};

const testPayDraft = async (
    draft: IChangeDraft,
    user: TUserExecutor,
    useBank: boolean
) => {
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
    assertInvalid(missingCredentials, "BAD_USER_INPUT");
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
        assertInvalid(addedCredentials, "BAD_USER_INPUT");
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

    await assertBankAndUserStates(
        {
            balance:
                draft.action === "REAL_TO_VIRTUAL"
                    ? 10.0 - 2 * config.currencyExchange.virtualPerReal
                    : 10.0 + 2,
            transactions: [transaction],
            drafts: [],
        },
        "After payment transaction should be registered"
    )(
        user,
        {
            balance:
                draft.action === "REAL_TO_VIRTUAL"
                    ? 10.0 + 2 * config.currencyExchange.virtualPerReal
                    : 10.0 - 2,
            transactions: [transaction],
            ...(user.type === "COMPANY" && { drafts: [] }),
        },
        "After payment transaction should be registered"
    );

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

    await assertBankAndUserStates(
        { balance: 10.0, transactions: [], drafts: [] },
        "After draft deletion nothing should be changed"
    )(undefined);

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

test("create virtual->real, delete", async () => {
    const draft = await testChangeCurrencies("VIRTUAL_TO_REAL");
    await testDeleteDraft(draft);
});
test("create real->virtual, delete", async () => {
    const draft = await testChangeCurrencies("REAL_TO_VIRTUAL");
    await testDeleteDraft(draft);
});

test("create virtual->real, pay by bank for citizen", async () => {
    const draft = await testChangeCurrencies("VIRTUAL_TO_REAL");
    await testPayDraft(draft, citizen, true);
});
test("create real->virtual, pay by bank for company", async () => {
    const draft = await testChangeCurrencies("REAL_TO_VIRTUAL");
    await testPayDraft(draft, company, true);
});
test("create virtual->real, pay by bank for guest", async () => {
    const draft = await testChangeCurrencies("VIRTUAL_TO_REAL");
    await testPayDraft(draft, guest, true);
});

test("create real->virtual, pay by citizen", async () => {
    const draft = await testChangeCurrencies("REAL_TO_VIRTUAL");
    await testPayDraft(draft, citizen, false);
});
test("create virtual->real, pay by company", async () => {
    const draft = await testChangeCurrencies("VIRTUAL_TO_REAL");
    await testPayDraft(draft, company, false);
});
test("create real->virtual, pay by guest", async () => {
    const draft = await testChangeCurrencies("REAL_TO_VIRTUAL");
    await testPayDraft(draft, guest, false);
});
