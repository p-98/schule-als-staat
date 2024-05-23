import { mkdir } from "fs/promises";
import { identity, get } from "lodash/fp";
import _knex, { Knex as _Knex } from "knex";
import { type Database } from "better-sqlite3";
import { resolveRoot } from "Util/misc";
import { type Config } from "Root/types/config";

import * as initSchemaMigration from "./migrations/init-schema";

/** Create a promise and extract its resolve function */
const externalPromsie = <T>(): [
    Promise<T>,
    (value: T | PromiseLike<T>) => void
] => {
    let resolve: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((r) => {
        resolve = r;
    });
    // @ts-expect-error promise callback is immediately executed
    return [promise, resolve];
};

interface INamedMigration extends _Knex.Migration {
    name: string;
}
const migrations: INamedMigration[] = [initSchemaMigration];

/* eslint-disable @typescript-eslint/lines-between-class-members */
class MigrationSource implements _Knex.MigrationSource<INamedMigration> {
    getMigrations = () => Promise.resolve(migrations);
    getMigrationName = get("name");
    getMigration = identity;
}
/* eslint-enable @typescript-eslint/lines-between-class-members */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Knex = _Knex<any, unknown[]>;
export type Db = Database;

export const createKnex = async (
    filename: string,
    opts?: { client?: "sqlite3" | "better-sqlite3" }
): Promise<[Db, Knex]> => {
    const [db, resolveDb] = externalPromsie<Db>();
    const knex = _knex({
        client: opts?.client ?? "better-sqlite3",
        connection: {
            filename,
        },
        useNullAsDefault: true,
        migrations: {
            migrationSource: new MigrationSource(),
        },
        pool: {
            afterCreate: async (_db: Db, done: () => void) => {
                // use exec to support sqlite3 adapter used by create-xxx-db.ts scripts
                _db.exec("PRAGMA foreign_keys = ON;");
                _db.exec("PRAGMA journal_mode = WAL;");
                resolveDb(_db);
                done();
            },
        },
    });
    // trigger pool.afterCreate
    await knex.raw("SELECT 0 WHERE 0;");
    return [await db, knex];
};

export const loadKnex = async (config: Config): Promise<[Db, Knex]> => {
    const file = resolveRoot(config.database.file);
    return createKnex(file);
};

export const emptyKnex = async (): Promise<[Db, Knex]> => {
    const [db, knex] = await createKnex(":memory:");
    await knex.migrate.up({ name: "init-schema" });
    return [db, knex];
};

export async function backup(db: Db, config: Config): Promise<void> {
    const { dir, file } = config.database.backup;
    // create directory if not exists
    await mkdir(resolveRoot(dir), { recursive: true });
    await db.backup(resolveRoot(dir, file()));
}
