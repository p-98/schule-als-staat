import { afterEach, beforeEach, test } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPCookieExecutor,
    assertInvalid,
    seedUser,
    TYogaExecutor,
} from "Util/test";

import { type TYogaServerInstance, yogaFactory } from "Server";
import { emptyKnex, type Knex } from "Database";
import type { TCredentialsInput } from "Types/schema";
import { omit } from "lodash/fp";
import { EUserTypes } from "Types/models";
import { forEachAsync } from "Util/misc";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment UserSignature_UserFragment on User {
        __typename
        id
    }
`);

const sessionQuery = graphql(/* GraphQL */ `
    query Session {
        session {
            id
            user {
                ...UserSignature_UserFragment
            }
        }
    }
`);
const loginMutation = graphql(/* GraphQL */ `
    mutation Login($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            ...UserSignature_UserFragment
        }
    }
`);
const logoutMutation = graphql(/* GraphQL */ `
    mutation Logout {
        logout
    }
`);

let knex: Knex;
let yoga: TYogaServerInstance;
let client: TYogaExecutor;
let otherClient: TYogaExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
    /* eslint-disable @typescript-eslint/unbound-method */
    client = buildHTTPCookieExecutor({ fetch: yoga.fetch });
    otherClient = buildHTTPCookieExecutor({ fetch: yoga.fetch });
    /* eslint-enable @typescript-eslint/unbound-method */
});
afterEach(async () => {
    await knex.destroy();
});

async function assertLoggedInState(
    _client: TYogaExecutor,
    { id, type }: TCredentialsInput
) {
    const state = await _client({ document: sessionQuery });
    assertSingleValue(state);
    assertNoErrors(state);
    assert.deepStrictEqual(
        { id, __typename: EUserTypes[type] },
        state.data.session.user
    );
}
async function assertLoggedOutState(_client: TYogaExecutor) {
    const state = await _client({ document: sessionQuery });
    assertSingleValue(state);
    assertNoErrors(state);
    assert.isNull(state.data.session.user);
}

/** Tests the login mutation for a user type
 *
 * Does only test for one user type, so NEEDS TO BE CALLED FOR EVERY USER TYPE
 */
async function testLogin(
    _client: TYogaExecutor,
    credentials: TCredentialsInput
) {
    // invalid requests
    const invalidUserId = await _client({
        document: loginMutation,
        variables: { ...credentials, id: "invalidUserId" },
    });
    assertInvalid(invalidUserId, `${credentials.type}_NOT_FOUND`);
    if (credentials.type === "GUEST") {
        const unexpectedPassword = await _client({
            document: loginMutation,
            variables: { ...credentials, password: "password" },
        });
        assertInvalid(unexpectedPassword, "BAD_USER_INPUT");
    } else {
        const missingPassword = await _client({
            document: loginMutation,
            variables: omit("password", credentials),
        });
        assertInvalid(missingPassword, "BAD_USER_INPUT");
        const wrongPassword = await _client({
            document: loginMutation,
            variables: { ...credentials, password: "wrongPassword" },
        });
        assertInvalid(wrongPassword, "WRONG_PASSWORD");
    }

    // valid request
    const login = await _client({
        document: loginMutation,
        variables: credentials,
    });
    assertSingleValue(login);
    assertNoErrors(login);
    const userSignature = login.data.login;
    assert.deepStrictEqual(userSignature, {
        id: credentials.id,
        __typename: EUserTypes[credentials.type],
    });

    // no invalid requests after login possible
}
async function testLogout(_client: TYogaExecutor) {
    // no invalid requests possible

    // valid request
    const logout = await _client({
        document: logoutMutation,
    });
    assertSingleValue(logout);
    assertNoErrors(logout);
    assert.isNull(logout.data.logout);

    // no invalid requests after logout possible
}

test("login, logout", async () => {
    await forEachAsync(
        ["CITIZEN" as const, "COMPANY" as const, "GUEST" as const],
        async (type) => {
            await assertLoggedOutState(client);

            const credentials = await seedUser(knex, { type });
            await testLogin(client, credentials);
            await assertLoggedInState(client, credentials);
            await assertLoggedOutState(otherClient);

            await testLogout(client);
            await assertLoggedOutState(client);
        }
    );
});

test("parallel logins", async () => {
    await assertLoggedOutState(client);
    await assertLoggedOutState(otherClient);

    const credentials1 = await seedUser(knex, { type: "CITIZEN" });
    const credentials2 = await seedUser(knex, { type: "CITIZEN" });

    await testLogin(client, credentials1);
    await assertLoggedInState(client, credentials1);
    await assertLoggedOutState(otherClient);

    await testLogin(otherClient, credentials2);
    await assertLoggedInState(client, credentials1);
    await assertLoggedInState(otherClient, credentials2);

    await testLogout(otherClient);
    await assertLoggedInState(client, credentials1);
    await assertLoggedOutState(otherClient);

    await testLogout(client);
    await assertLoggedOutState(client);
    await assertLoggedOutState(otherClient);
});
