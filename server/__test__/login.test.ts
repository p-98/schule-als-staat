import { afterEach, beforeEach, test } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    seedSourceFactory,
    withSpecific,
    buildHTTPCookieExecutor,
    assertSingleError,
} from "Util/test";

import bcrypt from "bcrypt";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { emptyKnex, type Knex } from "Database";
import { graphql } from "./graphql";

const credentials = {
    type: "CITIZEN" as const,
    id: "citizenId1",
    password: "password",
};
const seedSource = seedSourceFactory({
    "citizen-max-mustermann": async (knex) => {
        await knex("bankAccounts").insert({
            id: "bankAccountId1",
            balance: 1.0,
            redemptionBalance: 0.0,
        });
        await knex("citizens").insert({
            id: credentials.id,
            firstName: "Max",
            lastName: "Mustermann",
            bankAccountId: "bankAccountId1",
            image: "",
            password: await bcrypt.hash(credentials.password, 10),
        });
    },
});

const sessionQuery = graphql(/* GraphQL */ `
    query Session {
        session {
            id
            user {
                id
            }
        }
    }
`);
const loginMutation = graphql(/* GraphQL */ `
    mutation Login($type: UserType!, $id: String!, $password: String) {
        login(user: { type: $type, id: $id }, password: $password) {
            id
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
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
});
afterEach(async () => {
    await knex.destroy();
});

test("obtain session id, login, logout", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "citizen-max-mustermann"));
    const exec = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
    });

    const before = await exec({ document: sessionQuery });
    assertSingleValue(before);
    assertNoErrors(before);
    assert.isNull(
        before.data.session.user,
        "User must not be logged in initially"
    );

    const login = await exec({
        document: loginMutation,
        variables: credentials,
    });
    assertSingleValue(login);
    assertNoErrors(login);

    const after = await exec({ document: sessionQuery });
    assertSingleValue(after);
    assertNoErrors(after);

    assert.strictEqual(
        after.data.session.id,
        before.data.session.id,
        "Session id changed mid session"
    );
    assert.strictEqual(
        after.data.session.user?.id,
        login.data.login.id,
        "Logged in user changed"
    );

    const logout = await exec({ document: logoutMutation });
    assertSingleValue(logout);
    assertNoErrors(logout);

    const end = await exec({ document: sessionQuery });
    assertSingleValue(end);
    assertNoErrors(end);

    assert.strictEqual(
        end.data.session.id,
        before.data.session.id,
        "Session id changed mid session"
    );
    assert.isNull(
        end.data.session.user,
        "Must be logged out after logout mutation"
    );
});

test("invalid username", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "citizen-max-mustermann"));
    const exec = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
        outputHeaders: true,
    });

    const result = await exec({
        document: loginMutation,
        variables: { ...credentials, id: "citizenId2" },
    });
    assertSingleValue(result);
    assertSingleError(result);
    assert.strictEqual(result.errors[0]?.extensions.code, "CITIZEN_NOT_FOUND");
});

test("invalid password", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "citizen-max-mustermann"));
    const exec = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
        outputHeaders: true,
    });

    const result = await exec({
        document: loginMutation,
        variables: { ...credentials, password: "invalid-password" },
    });
    assertSingleValue(result);
    assertSingleError(result);
    assert.strictEqual(result.errors[0].extensions.code, "INVALID_PASSWORD");
});
