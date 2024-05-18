import "./admin.mock";

import { test, beforeEach, afterEach, jest } from "@jest/globals";
import { type Mock } from "jest-mock";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
    config as _config,
    assertSingleError,
} from "Util/test";

import { constant } from "lodash/fp";
import { type Config } from "Root/types/config";
import { type IEmployment } from "Types/knex";
import { yogaFactory, type TYogaServerInstance } from "Server";
import { emptyKnex, type Db, type Knex } from "Database";
import { graphql } from "./graphql";

type TSet<T, K extends keyof T, KT> = Omit<T, K> & Record<K, KT>;

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

let config: Config;
const dconfig = {
    get: jest.fn(() => Promise.resolve(config)),
    reload: jest.fn(constant(Promise.resolve())),
};
let db: TSet<Db, "backup", Mock<Db["backup"]>>;
let knex: Knex;
let yoga: TYogaServerInstance;
let admin: TUserExecutor;
let citizen: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    config = _config;
    const [_db, _knex] = await emptyKnex();
    db = Object.defineProperty(_db, "backup", {
        value: jest.fn(() =>
            Promise.resolve({ totalPages: 10, remainingPages: 0 })
        ),
    }) as TSet<Db, "backup", jest.Mock<Db["backup"]>>;
    knex = _knex;
    yoga = yogaFactory(db, knex, dconfig);
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

    assertTimesCalled(db.backup, 1);
    assert.deepStrictEqual(db.backup.mock.calls, [
        ["backup-dir/backup-file-0.sqlite3"],
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

    assertTimesCalled(db.backup, 2);
    assert.deepStrictEqual(db.backup.mock.calls, [
        ["backup-dir/backup-file-1.sqlite3"],
        ["backup-dir/backup-file-2.sqlite3"],
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

    assertTimesCalled(db.backup, 1);
    assert.deepStrictEqual(db.backup.mock.calls, [
        ["backup-dir/backup-file-3.sqlite3"],
    ]);
    assertTimesCalled(dconfig.reload, 1);
}

test("backup database", () => testBackupDatabase());
test("exec database", () => testExecDatabase());
test("reload config", () => testReloadConfig());
