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

import { isNil, omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
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
    mutation CreateGuest($balance: Float, $name: String) {
        createGuest(guest: { balance: $balance, name: $name }) {
            ...All_GuestUserFragment
        }
    }
`);
const leaveGuestMutation = graphql(/* GraphQL */ `
    mutation LeaveGuest($id: ID!) {
        leaveGuest(id: $id) {
            ...All_GuestUserFragment
        }
    }
`);

type TGuest = ResultOf<typeof guestUserFragment>;
type TGuestState = ResultOf<typeof guestUserFragment>;

let knex: Knex;
let yoga: TYogaServerInstance;
let borderControl: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();

    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.borderControlCompanyId,
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
            assert(!isNil(guest.leftAt));
            assert.isAtLeast(
                new Date(guest.leftAt).getTime(),
                leftAt[0].getTime()
            );
            assert.isAtMost(
                new Date(guest.leftAt).getTime(),
                leftAt[1].getTime()
            );
        }
    };
}

async function testCreateGuest(
    balance: TNullable<number>,
    name: TNullable<string>
): Promise<TGuest> {
    // invalid requests
    const negativeBalance = await borderControl({
        document: createGuestMutation,
        variables: { balance: -1, name },
    });
    assertInvalid(negativeBalance, "BAD_USER_INPUT");

    // valid request
    const before = new Date();
    const create = await borderControl({
        document: createGuestMutation,
        variables: { balance, name },
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

    const guestClient = await buildHTTPUserExecutor(
        knex,
        yoga,
        { ...guest, password: undefined },
        { noSeed: true }
    );
    await assertGuestState(guestClient)(guest);

    return guest;
}

async function testLeaveGuest(guest: TGuest): Promise<void> {
    const { id } = guest;

    // invalid requests
    const invalidId = await borderControl({
        document: leaveGuestMutation,
        variables: { id: "invalidGuestId" },
    });
    assertInvalid(invalidId, "GUEST_NOT_FOUND");

    // valid request
    const before = new Date();
    const leave = await borderControl({
        document: leaveGuestMutation,
        variables: { id },
    });
    const after = new Date();
    assertSingleValue(leave);
    assertNoErrors(leave);
    const left = leave.data.leaveGuest;
    assert.deepStrictEqual(omit("leftAt", left), omit("leftAt", guest));
    assert.isAtLeast(new Date(left.leftAt!).getTime(), before.getTime());
    assert.isAtMost(new Date(left.leftAt!).getTime(), after.getTime());

    const guestClient = await buildHTTPUserExecutor(
        knex,
        yoga,
        { ...guest, password: undefined },
        { noSeed: true }
    );
    await assertGuestState(guestClient)(guest, [before, after]);
}

test("create, remove default args", async () => {
    const guest = await testCreateGuest(null, null);
    await testLeaveGuest(guest);
});

test("create, remove explicit args", async () => {
    const guest = await testCreateGuest(12, "Max Mustermann");
    await testLeaveGuest(guest);
});

test.todo("create same card");
