import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
} from "Util/test";

import { isNil, omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import config from "Config";
import { TNullable } from "Types";
import { TOmit } from "Types/knex";
import { graphql } from "./graphql";

const guestUserFragment = graphql(/* GraphQL */ `
    fragment All_GuestUserFragment on GuestUser {
        type
        id
        balance
        redemptionBalance
        transactions {
            id
        }
        name
        enteredAt
        leftAt
    }
`);

const guestStateQuery = graphql(/* GraphQL */ `
    query GuestState {
        meGuest {
            ...All_GuestUserFragment
        }
    }
`);
const createGuestMutation = graphql(/* GraphQL */ `
    mutation CreateGuest($cardId: ID!, $balance: Float, $name: String) {
        createGuest(
            cardId: $cardId
            guest: { balance: $balance, name: $name }
        ) {
            ...All_GuestUserFragment
        }
    }
`);
const removeGuestMutation = graphql(/* GraphQL */ `
    mutation RemoveGuest($cardId: ID!) {
        removeGuest(cardId: $cardId)
    }
`);

type TGuest = ResultOf<typeof guestUserFragment>;
type TGuestState = ResultOf<typeof guestUserFragment>;

let knex: Knex;
let yoga: TYogaServerInstance;
let borderControl: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);

    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.server.borderControlCompanyId,
    });
});
afterEach(async () => {
    await knex.destroy();
});

function assertGuestState(_guest: TUserExecutor) {
    return async (
        expected: TOmit<TGuestState, "leftAt">,
        leftAt?: [Date, Date],
        message?: string
    ) => {
        const result = await _guest({ document: guestStateQuery });
        assertSingleValue(result);
        assertNoErrors(result);
        const guest = result.data.meGuest;
        assert.deepStrictEqual(
            omit("leftAt", guest),
            omit("leftAt", expected),
            message
        );
        if (isNil(leftAt)) {
            assert.isNull(result.data.meGuest.leftAt);
        } else {
            assert.isAtLeast(
                new Date(guest.leftAt as unknown as number).getTime(),
                leftAt[0].getTime()
            );
            assert.isAtMost(
                new Date(guest.leftAt as unknown as number).getTime(),
                leftAt[1].getTime()
            );
        }
    };
}

async function testCreateGuest(
    cardId: string,
    balance: TNullable<number>,
    name: TNullable<string>
): Promise<TGuest> {
    // invalid requests
    const negativeBalance = await borderControl({
        document: createGuestMutation,
        variables: { cardId, balance: -1, name },
    });
    assertInvalid(negativeBalance, "BAD_USER_INPUT");

    // valid request
    const before = new Date();
    const create = await borderControl({
        document: createGuestMutation,
        variables: { cardId, balance, name },
    });
    const after = new Date();
    assertSingleValue(create);
    assertNoErrors(create);
    const guest = create.data.createGuest;
    assert.deepStrictEqual(omit(["id", "enteredAt"], guest), {
        type: "GUEST",
        balance: balance ?? config.guestInitialBalance,
        redemptionBalance: 0,
        transactions: [],
        name,
        leftAt: null,
    });
    assert.isAtLeast(new Date(guest.enteredAt).getTime(), before.getTime());
    assert.isAtMost(new Date(guest.enteredAt).getTime(), after.getTime());

    const guestClient = await buildHTTPUserExecutor(knex, yoga, guest, {
        noSeed: true,
    });
    await assertGuestState(guestClient)(guest);

    return guest;
}

async function testRemoveGuest(cardId: string, guest: TGuest): Promise<void> {
    // invalid requests
    const invalidCardId = await borderControl({
        document: removeGuestMutation,
        variables: { cardId: "invalidCardId" },
    });
    assertInvalid(invalidCardId, "CARD_NOT_OCCUPIED");

    // valid request
    const before = new Date();
    const remove = await borderControl({
        document: removeGuestMutation,
        variables: { cardId },
    });
    const after = new Date();
    assertSingleValue(remove);
    assertNoErrors(remove);
    assert.isNull(remove.data.removeGuest);

    const guestClient = await buildHTTPUserExecutor(knex, yoga, guest, {
        noSeed: true,
    });
    await assertGuestState(guestClient)(guest, [before, after]);
}

test("create, remove default args", async () => {
    const guest = await testCreateGuest("123", null, null);
    await testRemoveGuest("123", guest);
});

test("create, remove explicit args", async () => {
    const guest = await testCreateGuest("123", 12, "Max Mustermann");
    await testRemoveGuest("123", guest);
});

test.todo("create same card");
