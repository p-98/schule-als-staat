import { formatDistanceStrict } from "date-fns";
import { ceil, filter, floor, map } from "lodash/fp";
import config from "../config";
import { createKnex, Knex } from "../server/src/database/database";
import { getTimeInState } from "../server/src/modules/borderControl";
import { IAppContext } from "../server/src/server";
import { ICitizenUserModel } from "../server/src/types/models";

const withKnex = async <T>(f: (knex: Knex) => Promise<T>): Promise<T> => {
    const [, knex] = await createKnex(config.database.file, {
        client: "sqlite3",
    });
    const result = await f(knex);
    await knex.destroy();
    return result;
};
const mapAsync = async <T, U>(
    f: (_: T) => Promise<U>,
    arr: T[]
): Promise<U[]> => {
    const result: U[] = [];
    for (const el of arr) {
        result.push(await f(el));
    }
    return result;
};
const hours = (_: number) => _ * 3600;

const formatDuration = (seconds: number) => {
    const minutes = ceil(seconds / 60);
    return `${floor(minutes / 60)} Stunden ${minutes % 60} Minuten`;
};

await withKnex(async (knex) => {
    const citizens = await knex("citizens");
    const withTime = await mapAsync(async (c) => {
        const raw = await getTimeInState(
            { knex } as IAppContext,
            { id: c.id } as ICitizenUserModel
        );
        return {
            id: c.id,
            time: raw,
        };
    }, citizens);
    const withLessTime = filter((_) => _.time < hours(6), withTime);
    const withFormatTime = map(
        (_) => ({ ..._, time: formatDuration(_.time) }),
        withLessTime
    );
    process.stdout.write(JSON.stringify(withFormatTime));
});
