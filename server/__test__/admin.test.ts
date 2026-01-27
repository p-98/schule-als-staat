import { mocks } from "./mock";

import { test, beforeEach, afterEach, jest } from "bun:test";
import { type Mock } from "jest-mock";
import chai, { assert } from "chai";
import { config as _config } from "Util/test";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPAnonymousExecutor,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
    assertSingleError,
} from "./util";

import { constant, get } from "lodash/fp";
import { type Config } from "Types/config";
import { type IEmployment } from "Types/knex";
import { yogaFactory, type TYogaServerInstance } from "Server";
import { emptyKnex, type Knex } from "Database";
import { graphql } from "./graphql";

chai.config.includeStack = true;

graphql(/* GraphQL */ `
    fragment Signature_UserFragment on User {
        type
        id
    }
`);

const backupDatabaseMutation = graphql(/* GraphQL */ `
    mutation BackupDatabaseMutation {
        backupDatabase
    }
`);
const execDatabaseMutation = graphql(/* GraphQL */ `
    mutation ExecDatabaseMutation($sql: String!) {
        execDatabase(sql: $sql)
    }
`);
const reloadConfigMutation = graphql(/* GraphQL */ `
    mutation ReloadConfigMutation {
        reloadConfig
    }
`);
const resetPasswordMutation = graphql(/* GraphQL */ `
    mutation ResetPasswordMutation(
        $type: UserType!
        $id: String!
        $password: String!
    ) {
        resetPassword(user: { type: $type, id: $id }, password: $password) {
            ...Signature_UserFragment
        }
    }
`);
const loginMutation = graphql(/* GraphQL */ `
    mutation LoginMutation($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            user {
                ...Signature_UserFragment
            }
        }
    }
`);
const userQuery = graphql(/* GraphQL */ `
    query UserQuery {
        me {
            ...Signature_UserFragment
        }
    }
`);

let config: Config;
const dconfig = {
    get: jest.fn(() => Promise.resolve(config)),
    reload: jest.fn(constant(Promise.resolve())),
};
let knex: Knex;
let yoga: TYogaServerInstance;
let admin: TUserExecutor;
let citizen: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    config = _config;
    const [, _knex] = await emptyKnex();
    knex = _knex;
    yoga = yogaFactory(knex, dconfig);
    admin = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.roles.adminCitizenIds[0],
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
const assertTimesCalled = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f: Mock<(...args: any[]) => any>,
    times: number,
    message?: string
): void =>
    assert.lengthOf(
        f.mock.calls,
        times,
        message ??
            `Function was called ${f.mock.calls.length} instead of expected ${times} times.`
    );

async function testBackupDatabase() {
    // invalid requests
    await forEachUserType(async (user) => {
        const noAdmin = await user({ document: backupDatabaseMutation });
        assertInvalid(noAdmin, "PERMISSION_DENIED");
    });

    // valid request
    const backup = await admin({ document: backupDatabaseMutation });
    assertSingleValue(backup);
    assertNoErrors(backup);
    assert.isNull(backup.data.backupDatabase);

    assertTimesCalled(mocks._backup, 1);
    console.log(mocks._backup.mock.calls);
    assert.deepStrictEqual(mocks._backup.mock.calls, [
        [knex, "backup-dir/backup-file-0.sqlite3"],
    ]);
}

test("backup database", () => testBackupDatabase());
