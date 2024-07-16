import fs from "fs";
import { exit } from "process";
import config from "../config";
import { createKnex } from "../server/src/database/database";

const citizens = JSON.parse(fs.readFileSync(0, { encoding: "utf-8" }));

const [, knex] = await createKnex(config.database.file, {
    client: "sqlite3",
});
for (const citizen of citizens) {
    const found = await knex("citizens")
        .select()
        .where({ id: citizen })
        .first();
    if (found === undefined) {
        console.error(`Citizen with id '${citizen}' not found.`);
        exit();
    }
}
await knex.destroy();
console.log("All citizens found.");
