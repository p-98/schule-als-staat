import { map, pick } from "lodash/fp";
import { stringify } from "csv-stringify/sync";
import { binary, command, run } from "cmd-ts";

import { type IAppContext } from "../server/src/server";
import { type ICitizenUserModel } from "../server/src/types/models";
import { type ICitizen } from "../server/src/types/knex";
import { createKnex, type Knex } from "../server/src/database/database";
import { getTimeInState } from "../server/src/modules/borderControl";
import { pipe1Async } from "../server/src/util/misc";
import config from "../config";

/* Argument parsing
 */

const description = `Get the attendance times in seconds of all citizens as csv.`;
const cmd = command({
    name: "get-time-in-state",
    description,
    args: {},
    handler: (_) => _,
});
await run(binary(cmd), Bun.argv);

const withKnex = async <T>(f: (knex: Knex) => Promise<T>): Promise<T> => {
    const [, knex] = await createKnex(config.database.file, {
        client: "sqlite3",
    });
    const result = await f(knex);
    await knex.destroy();
    return result;
};
const mapAsync =
    <T, U>(f: (_: T) => Promise<U>) =>
    async (arr: T[]): Promise<U[]> => {
        const result: U[] = [];
        for (const el of arr) {
            result.push(await f(el));
        }
        return result;
    };

const fakeCtx = (knex: Knex) => ({ knex } as IAppContext);
const fakeUser = pick("id") as (_: ICitizen) => ICitizenUserModel;

await withKnex((knex) =>
    pipe1Async(
        knex("citizens"),
        mapAsync(async (_) => ({
            ..._,
            time: await getTimeInState(fakeCtx(knex), fakeUser(_)),
        })),
        map(pick(["id", "firstName", "lastName", "time"])),
        (_) => stringify(_, { header: true, delimiter: "," }),
        (_) => process.stdout.write(_)
    )
);
