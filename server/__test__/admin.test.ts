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
    config,
} from "Util/test";

import { constant } from "lodash/fp";
import { yogaFactory, type TYogaServerInstance } from "Server";
import { emptyKnex, type Db, type Knex } from "Database";
import { graphql } from "./graphql";

type TSet<T, K extends keyof T, KT> = Omit<T, K> & Record<K, KT>;

const backupDatabaseMutation = graphql(/* GraphQL */ `
    mutation BackupDatabaseMutation {
        backupDatabase
    }
`);
const reloadConfigMutation = graphql(/* GraphQL */ `
    mutation ReloadConfigMutation {
        reloadConfig
    }
`);

const dconfig = {
    get: jest.fn(constant(Promise.resolve(config))),
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
        ["backup-dir/backup-file-1.sqlite3"],
    ]);
    assertTimesCalled(dconfig.reload, 1);
}

test("backup database", () => testBackupDatabase());
test("reload config", () => testReloadConfig());
