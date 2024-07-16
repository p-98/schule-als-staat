import config from "../config";
import { createKnex } from "../server/src/database/database";

const [, knex] = await createKnex(config.database.file, {
    client: "sqlite3",
});
const citizens = await knex("citizens");
await knex.destroy();
process.stdout.write(JSON.stringify(citizens));
