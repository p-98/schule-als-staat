import { Knex } from "knex";
import { knex } from "Database";

/*  Collection of UNSAFE helper functions for sql queries.

    Since they operate on strings only and don't escape inputs
    DON'T INPUT UNSAFE USER DATA
 */

export const startOfHour = (col: string): string =>
    `strftime('%Y-%m-%dT%H:00:00.000Z', ${col})`;

export const clamp = (x: string, min: string, max: string): string =>
    `min(max(${min}, ${x}), ${max})`;

export const unixepochDiff = (x: string, y: string): string =>
    `(unixepoch(${x}) - unixepoch(${y}))`;

/*  Collection of SAFE helper functions for sql queries.

    Use knex.raw to safely escape inputs, so it safe to use with user inputs.
    Must be passed as part of second argument to knex.raw.
 */

export const values = (rows: Knex.RawBinding[][]): Knex.Raw => {
    const sql = rows
        .map((row) => `(${row.map(() => "?").join(",")})`)
        .join(",");
    return knex.raw(`values ${sql}`, rows.flat());
};
