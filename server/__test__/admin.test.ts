import { mocks } from "./mock";

import { test, beforeEach, afterEach, jest } from "@jest/globals";
import { type Mock } from "jest-mock";
import { assert } from "chai";
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
    assert.deepStrictEqual(mocks._backup.mock.calls.map(get(1)), [
        "backup-dir/backup-file-0.sqlite3",
    ]);
}

async function testExecDatabase() {
    const data = [
        {
            id: 1,
            companyId: company.id,
            citizenId: citizen.id,
            employer: 0,
            minWorktime: 12,
            salary: 34,
            cancelled: 0,
        },
        {
            id: 2,
            companyId: company.id,
            citizenId: admin.id,
            employer: 0,
            minWorktime: 56,
            salary: 78,
            cancelled: 0,
        },
    ] as unknown as IEmployment[];
    await knex("employments").insert(data);
    const sql = "select * from employments";

    // invalid requests
    await forEachUserType(async (user) => {
        const noAdmin = await user({
            document: execDatabaseMutation,
            variables: { sql },
        });
        assertInvalid(noAdmin, "PERMISSION_DENIED");
    });
    config.database.allowRawSql = false;
    const restricted = await admin({
        document: execDatabaseMutation,
        variables: { sql },
    });
    assertInvalid(restricted, "RESTRICTION_ALLOW_RAW_SQL");
    config.database.allowRawSql = true;

    // valid failing request
    const fail = await admin({
        document: execDatabaseMutation,
        variables: { sql: "select * from missing_table" },
    });
    assertSingleValue(fail);
    assertSingleError(fail);
    const [err] = fail.errors;
    assert(err.message.endsWith("no such table: missing_table"));
    assert.strictEqual(err.extensions.code, "SQLITE_ERROR");

    // valid successfull request
    const exec = await admin({
        document: execDatabaseMutation,
        variables: { sql },
    });
    assertSingleValue(exec);
    assertNoErrors(exec);
    assert.deepStrictEqual(exec.data.execDatabase, data);

    assertTimesCalled(mocks._backup, 2);
    assert.deepStrictEqual(mocks._backup.mock.calls.map(get(1)), [
        "backup-dir/backup-file-1.sqlite3",
        "backup-dir/backup-file-2.sqlite3",
    ]);
}

async function testReloadConfig() {
    // invalid requests
    await forEachUserType(async (user) => {
        const noAdmin = await user({ document: reloadConfigMutation });
        assertInvalid(noAdmin, "PERMISSION_DENIED");
    });

    // valid request
    const reload = await admin({ document: reloadConfigMutation });
    assertSingleValue(reload);
    assertNoErrors(reload);
    assert.isNull(reload.data.reloadConfig);

    assertTimesCalled(mocks._backup, 1);
    assert.deepStrictEqual(mocks._backup.mock.calls.map(get(1)), [
        "backup-dir/backup-file-3.sqlite3",
    ]);
    assertTimesCalled(dconfig.reload, 1);
}

async function testResetPassword() {
    const password = "newPassword";

    // invalid requests
    await forEachUserType(async (user) => {
        const noAdmin = await user({ document: reloadConfigMutation });
        assertInvalid(noAdmin, "PERMISSION_DENIED");
    });
    const guestUserType = await admin({
        document: resetPasswordMutation,
        variables: { ...guest.signature, password },
    });
    assertInvalid(guestUserType, "USER_IS_GUEST");
    const invalidUserId = await admin({
        document: resetPasswordMutation,
        variables: { type: "CITIZEN", id: "invalidCitizenId", password },
    });
    assertInvalid(invalidUserId, "USER_NOT_FOUND");

    // valid request
    const reset = await admin({
        document: resetPasswordMutation,
        variables: { ...citizen.signature, password },
    });
    assertSingleValue(reset);
    assertNoErrors(reset);
    assert.deepStrictEqual(reset.data.resetPassword, citizen.signature);

    const newCitizen = buildHTTPAnonymousExecutor(yoga);
    const relogin = await newCitizen({
        document: loginMutation,
        variables: { ...citizen.signature, password },
    });
    assertSingleValue(relogin);
    assertNoErrors(relogin);
    assert.deepStrictEqual(relogin.data.login.user, citizen.signature);

    const reloggedIn = await newCitizen({
        document: userQuery,
    });
    assertSingleValue(reloggedIn);
    assertNoErrors(reloggedIn);
    assert.deepStrictEqual(reloggedIn.data.me, citizen.signature);

    // invalid after reset
    const loggedOut = await citizen({ document: userQuery });
    assertInvalid(loggedOut, "PERMISSION_DENIED");
    const oldPassword = await buildHTTPAnonymousExecutor(yoga)({
        document: loginMutation,
        variables: citizen.credentials,
    });
    assertInvalid(oldPassword, "PASSWORD_WRONG");
}

test("backup database", () => testBackupDatabase());
test("exec database", () => testExecDatabase());
test("reload config", () => testReloadConfig());
test("reset password", () => testResetPassword());
