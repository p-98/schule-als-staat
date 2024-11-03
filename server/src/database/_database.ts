import type { Knex } from "Database";
import { mkdir } from "fs/promises";
import { dirname } from "path";

/* Isolated fs interactions of module `database`
 *
 * This module only exists because it simplifies mocking.
 */

/** Isolated fs interactions of function `backup`.
 *
 * DO NOT USE THIS FUNCTION DIRECTLY. Use `backup` instead.
 *
 * This function only exists and is exported because it simplifies mocking.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export async function _backup(knex: Knex, path: string): Promise<void> {
    // create directory if not exists
    await mkdir(dirname(path), { recursive: true });
    await knex.raw(`vacuum into ?`, path);
}
