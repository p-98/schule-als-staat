import type { Knex } from "knex";
import type { IAppContext } from "Server";

import { afterEach, beforeEach, test } from "@jest/globals";
import { assert } from "chai";
import { addHours, addDays } from "date-fns/fp";
import { curry, curryN, __, map, pipe } from "lodash/fp";

import { emptyKnex } from "Database";
import { seedSourceFactory, withSpecific, mockAppContext } from "Util/test";
import { parseDateAndTime, formatDateZ, formatDateTimeZ } from "Util/date";

import { getWorktimeForDay } from "Modules/tradeRegistry";

const now = new Date("2023-10-20T15:00:00.000+02:00");
const today = formatDateZ(now);

const employmentId = 420;

const worktimeFactory = (startTime: string, endFn: (date: Date) => Date) => {
    const start = parseDateAndTime(today, startTime);
    return {
        employmentId,
        start: formatDateTimeZ(start),
        end: formatDateTimeZ(endFn(start)),
    };
};

const seedSource = seedSourceFactory({
    "not-or-partially-open": async (knex) =>
        knex("worktimes").insert([
            worktimeFactory("07:30:00.000+02:00", addHours(1)),
            worktimeFactory("08:30:00.000+02:00", addHours(1)),
        ]),
    "cross-day": async (knex) =>
        knex("worktimes").insert(
            worktimeFactory("12:00:00.000+02:00", addDays(2))
        ),
});

let knex: Knex;
let ctx: IAppContext;
beforeEach(async () => {
    [, knex] = await emptyKnex();
    ctx = mockAppContext(knex);
    // prevent inserting users and bankAccounts, because function never deals with them
    await knex.raw("PRAGMA foreign_keys = OFF");
});
afterEach(async () => {
    await knex.destroy();
});

test("empty db", async () => {
    const worktime = await getWorktimeForDay(ctx, employmentId, today);
    assert.strictEqual(worktime, 0);
});

test("outside of opening hours", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "not-or-partially-open"));
    const worktime = await getWorktimeForDay(ctx, employmentId, today);
    assert.strictEqual(worktime, 2 * 60 * 60);
});

test("ignore other employmentIds", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "not-or-partially-open"));
    const worktime = await getWorktimeForDay(ctx, employmentId + 1, today);
    assert.strictEqual(worktime, 0);
});

test("across multiple days", async () => {
    await knex.seed.run(withSpecific({ seedSource }, "cross-day"));
    const days = [0, 1, 2].map(pipe(curryN(2, addDays)(__, now), formatDateZ));
    const worktimes = await Promise.all(
        map(curry(getWorktimeForDay)(ctx, employmentId))(days)
    );
    assert.deepStrictEqual(worktimes, [12 * 3600, 24 * 3600, 12 * 3600]);
});
