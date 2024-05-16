import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    createTestServer,
    type TUserExecutor,
} from "Util/test";

import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import config from "Config";
import { graphql } from "./graphql";

const rolesQuery = graphql(/* GraphQL */ `
    query rolesQuery {
        me {
            roles
        }
    }
`);

type TRolesState = ResultOf<typeof rolesQuery>["me"]["roles"];

let knex: Knex;
let yoga: TYogaServerInstance;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
});
afterEach(async () => {
    await knex.destroy();
});

const assertRoles =
    (user: TUserExecutor) =>
    async (expected: TRolesState, message?: string) => {
        const result = await user({ document: rolesQuery });
        assertSingleValue(result);
        assertNoErrors(result);
        assert.deepStrictEqual(
            result.data.me.roles.sort(),
            expected.sort(),
            message
        );
    };

// eslint-disable-next-line jest/expect-expect
test("user roles", async () => {
    const users: Record<string, [TUserExecutor, TRolesState]> = {
        admin: [
            await buildHTTPUserExecutor(knex, yoga, {
                type: "CITIZEN",
                id: config.roles.adminCitizenIds[0],
            }),
            ["USER", "CITIZEN", "ADMIN"],
        ],
        guest: [
            await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" }),
            ["USER", "GUEST"],
        ],
        citizen: [
            await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" }),
            ["USER", "CITIZEN"],
        ],
        company: [
            await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" }),
            ["USER", "COMPANY"],
        ],
        police: [
            await buildHTTPUserExecutor(knex, yoga, {
                type: "COMPANY",
                id: config.roles.policeCompanyId,
            }),
            ["USER", "COMPANY", "POLICE"],
        ],
        bank: [
            await buildHTTPUserExecutor(knex, yoga, {
                type: "COMPANY",
                id: config.roles.bankCompanyId,
            }),
            ["USER", "COMPANY", "BANK"],
        ],
        "border control": [
            await buildHTTPUserExecutor(knex, yoga, {
                type: "COMPANY",
                id: config.roles.borderControlCompanyId,
            }),
            ["USER", "COMPANY", "BORDER_CONTROL"],
        ],
        politics: [
            await buildHTTPUserExecutor(knex, yoga, {
                type: "COMPANY",
                id: config.roles.policiticsCompanyId,
            }),
            ["USER", "COMPANY", "POLITICS"],
        ],
    };

    await Promise.all(
        Object.entries(users).map(([name, [user, roles]]) =>
            assertRoles(user)(roles, `Wrong roles for ${name}`)
        )
    );
});
