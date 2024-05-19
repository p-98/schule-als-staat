import config from "../config";
import { createKnex } from "../server/src/database/database";

const [, knex] = await createKnex(config.database.file, { client: "sqlite3" });
await knex.migrate.up({ name: "init-schema" });
await knex.destroy();
