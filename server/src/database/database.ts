import { identity, get } from "lodash/fp";
import _knex, { Knex as _Knex } from "knex";
import config from "Config";
import { resolveRoot } from "Util/misc";

import * as initSchemaMigration from "./migrations/init-schema";

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

const createKnex = async (filename: string): Promise<Knex> => {
    const knex = _knex({
        client: "sqlite3",
        connection: {
            filename,
        },
        useNullAsDefault: true,
        migrations: {
            migrationSource: new MigrationSource(),
        },
    });
    await knex.raw("PRAGMA foreign_keys = ON");
    return knex;
};

export const loadKnex = async (): Promise<Knex> => {
    const file = resolveRoot(config.database.file);
    return createKnex(file);
};

export const emptyKnex = async (): Promise<Knex> => {
    const knex = await createKnex(":memory:");
    await knex.migrate.up({ name: "init-schema" });
    return knex;
};
