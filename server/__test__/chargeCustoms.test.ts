import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
} from "Util/test";

import { omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import { EUserTypes } from "Types/models";
import config from "Config";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment All_CustomsTransactionFragment on CustomsTransaction {
        id
        date
        user {
            __typename
            id
        }
        customs
    }
`);

const chargeCustomsMutation = graphql(/* GraphQL */ `
    mutation ChargeCustomsMutation(
        $user: UserSignatureInput!
        $customs: Float!
    ) {
        chargeCustoms(customs: { user: $user, customs: $customs }) {
            ...All_CustomsTransactionFragment
        }
    }
`);
const balanceAndCustomsQuery = graphql(/* GraphQL */ `
    query BalanceAndCustoms {
        me {
            balance
            transactions {
                ... on CustomsTransaction {
                    ...All_CustomsTransactionFragment
                }
            }
        }
    }
`);

type IState = ResultOf<typeof balanceAndCustomsQuery>["me"];

let knex: Knex;
let yoga: TYogaServerInstance;
let borderControl: TUserExecutor;
let citizen: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.server.borderControlCompanyId,
    });
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
});
afterEach(async () => {
    await knex.destroy();
});

function forEachUserType<T>(
    fn: (user: TUserExecutor) => Promise<T>
): Promise<T[]> {
    return Promise.all([citizen, company, guest].map(fn));
}

const assertBorderControlAndUserStates =
    (borderControlExpected: IState, borderControlMessage: string) =>
    async (
        activeUser?: TUserExecutor,
        userExpected?: IState,
        userMessage?: string
    ) => {
        const borderControlResult = await borderControl({
            document: balanceAndCustomsQuery,
        });
        assertSingleValue(borderControlResult);
        assertNoErrors(borderControlResult);
        assert.deepStrictEqual(
            borderControlResult.data.me,
            borderControlExpected,
            borderControlMessage
        );

        if (activeUser && userExpected) {
            const activeUserResult = await activeUser({
                document: balanceAndCustomsQuery,
            });
            assertSingleValue(activeUserResult);
            assertNoErrors(activeUserResult);
            assert.deepStrictEqual(
                activeUserResult.data.me,
                userExpected,
                userMessage
            );
        }

        await forEachUserType(async (inactiveUser) => {
            if (activeUser === inactiveUser) return;

            const inactiveUserResult = await inactiveUser({
                document: balanceAndCustomsQuery,
            });
            assertSingleValue(inactiveUserResult);
            assertNoErrors(inactiveUserResult);
            assert.deepStrictEqual(
                inactiveUserResult.data.me,
                { balance: 10.0, transactions: [] },
                "Inactive user must be left untouched."
            );
        });
    };

async function testChargeCustoms(user: TUserExecutor) {
    const customs = 2.0;

    await assertBorderControlAndUserStates(
        { balance: 10.0, transactions: [] },
        "Everything should be initial at beginning"
    )(undefined);

    // invalid requests
    const invalidCustoms = await borderControl({
        document: chargeCustomsMutation,
        variables: { customs: -1.0, user: user.signature },
    });
    assertInvalid(invalidCustoms, "BAD_USER_INPUT");
    const tooHighCustoms = await borderControl({
        document: chargeCustomsMutation,
        variables: { customs: 20.0, user: user.signature },
    });
    assertInvalid(tooHighCustoms, "BALANCE_TOO_LOW");
    const invalidUser = await borderControl({
        document: chargeCustomsMutation,
        variables: { customs, user: { type: user.type, id: "invalidUserId" } },
    });
    assertInvalid(invalidUser, `${user.type}_NOT_FOUND`);
    const wrongUserId = await company({
        document: chargeCustomsMutation,
        variables: { customs, user: user.signature },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const citizenWithIdOfBorderControl = await buildHTTPUserExecutor(
        knex,
        yoga,
        { type: "CITIZEN", id: borderControl.id }
    );
    const wrongUserType = await citizenWithIdOfBorderControl({
        document: chargeCustomsMutation,
        variables: { customs, user: user.signature },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const before = new Date();
    const chargeCustoms = await borderControl({
        document: chargeCustomsMutation,
        variables: { customs, user: user.signature },
    });
    const after = new Date();
    assertSingleValue(chargeCustoms);
    assertNoErrors(chargeCustoms);
    const transaction = chargeCustoms.data.chargeCustoms;
    assert.deepStrictEqual(omit(["id", "date"], transaction), {
        customs,
        user: {
            __typename: EUserTypes[user.type],
            id: user.id,
        },
    });
    assert.isAtLeast(new Date(transaction.date).getTime(), before.getTime());
    assert.isAtMost(new Date(transaction.date).getTime(), after.getTime());

    await assertBorderControlAndUserStates(
        { balance: 10 + customs, transactions: [transaction] },
        "Transaction should be present after call"
    )(
        user,
        { balance: 10 - customs, transactions: [transaction] },
        "Transaction should be present after call"
    );
}

test("charge citizen", () => testChargeCustoms(citizen));
test("charge company", () => testChargeCustoms(company));
test("charge guest", () => testChargeCustoms(guest));
