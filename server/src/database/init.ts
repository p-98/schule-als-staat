import config from "Root/config";
import { createKnex } from "Database";

const knex = await createKnex(config.database.file);
await knex.migrate.up({ name: "init-schema" });
await knex.destroy();
