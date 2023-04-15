import _knex, { Knex as _Knex } from "knex";
import { identity, get } from "lodash/fp";

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

export const createKnex = (): Knex =>
    _knex({
        client: "sqlite3",
        connection: {
            filename: ":memory:",
        },
        useNullAsDefault: true,
        migrations: {
            migrationSource: new MigrationSource(),
        },
    });
