import fs from "fs";
import { exit } from "process";
import config from "../config";
import { createKnex } from "../server/src/database/database";

const tables = {
    CITIZEN: "citizens",
    COMPANY: "companies",
    GUEST: "guests",
};
const throwNotFound = (_: unknown) => {
    console.log(`User ${JSON.stringify(_)} not found.`);
    exit();
};

const users = JSON.parse(fs.readFileSync(0, { encoding: "utf-8" }));

const [, knex] = await createKnex(config.database.file, {
    client: "sqlite3",
});
for (const user of users) {
    if (!(user.type in tables)) throwNotFound(user);
    // @ts-expect-error catched above
    const found = await knex(tables[user.type])
        .select()
        .where({ id: user.id })
        .first();
    if (found === undefined) throwNotFound(user);
}
await knex.destroy();
console.log("All users found.");
