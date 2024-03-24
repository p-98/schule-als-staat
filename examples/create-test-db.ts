import config from "../config";
import { createKnex } from "../server/src/database/database";
import { seedUser } from "../server/src/util/test";

const knex = await createKnex(config.database.file);
await knex.migrate.up({ name: "init-schema" });
await seedUser(knex, { type: "citizen", id: "j.keller" });
await knex.destroy();
