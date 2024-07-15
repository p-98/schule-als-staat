import exitHook from "async-exit-hook";
import fs from "fs";
import { constant, keys, min, repeat, round, times } from "lodash/fp";
import { binary, command, run } from "cmd-ts";
import config from "../config";
import { createKnex, Knex } from "../server/src/database/database";

/* Argument parsing
 */

const description = `Add a value to the bankAccounts of specific accounts.

Accepts a JSON array of Topups vis stdin.
type Topup = {
    type: "CITIZEN" | "COMPANY",
    id: string,
    value: number
}`;
const cmd = command({
    name: "import-users",
    description,
    args: {},
    handler: (_) => _,
});
await run(binary(cmd), Bun.argv);

/* Logging
 */

const createLogger = (message: string, max: number, height: number) => {
    const logs: string[] = times(constant(""), height);
    let progress: number = 0;
    const w = process.stdout.write.bind(process.stdout);
    const render = (opts?: { before?: () => void }) => {
        opts?.before?.();
        const logs5 = logs.slice(-height);
        const width = min([process.stdout.columns, 40])! - 2;
        const barlen = round((progress / max) * width);
        const bar = `[${repeat(barlen, "=")}${repeat(width - barlen, " ")}]`;
        const pre = message ? `${message} ` : "";
        const suff = ` ${progress}/${max}`;
        w(`\u001b[${height}F\u001b[J${logs5.join("\n")}\n${pre}${bar}${suff}`);
    };

    exitHook(() => w(`\u001b[?25h`)); // show cursor again
    w(`\u001b[?25l${repeat(height, "\n")}`); // rmeove cursor, to bar line
    render();
    return {
        log: (log: string) => render({ before: () => logs.push(log) }),
        progress: (current: number) =>
            render({ before: () => (progress = current) }),
        finish: () => w(`\u001b[${height}F\u001b[J\u001b[?25h`),
    };
};

/* Type Definitions
 */

interface Topup {
    type: "CITIZEN" | "COMPANY";
    id: string;
    value: number;
}

const tables = {
    CITIZEN: "citizens",
    COMPANY: "companies",
} as const;

/* Define processing steps
 */

const safeGetStr = (p: string, o: Record<string, unknown>): string => {
    if (!(p in o) || typeof o[p] !== "string") {
        const oStr = JSON.stringify(o);
        throw Error(`Property is no string.\nProperty: ${p}\nObject: ${oStr}`);
    }
    return o[p] as string;
};
const safeGetNum = (p: string, o: Record<string, unknown>): number => {
    if (!(p in o) || typeof o[p] !== "number") {
        const oStr = JSON.stringify(o);
        throw Error(`Property is no number.\nProperty: ${p}\nObject: ${oStr}`);
    }
    return o[p] as number;
};
function assertObj(_: unknown): asserts _ is Record<string, unknown> {
    if (typeof _ !== "object" || _ === null)
        throw Error("Value is not an object");
}
function assertArr(_: unknown): asserts _ is unknown[] {
    if (!Array.isArray(_)) throw Error("Value is not an array");
}

const types = ["CITIZEN"];
const checkTopup = (topup: unknown): Topup => {
    assertObj(topup);
    const type = safeGetStr("type", topup);
    if (!keys(tables).includes(type)) throw Error(`Unknown type: ${type}`);
    return {
        type: type as keyof typeof tables,
        id: safeGetStr("id", topup),
        value: safeGetNum("value", topup),
    };
};

const topupOne = async (knex: Knex, topup: Topup) => {
    const table = tables[topup.type];
    await knex("bankAccounts")
        .increment("balance", topup.value)
        .where(
            "id",
            knex(table).select("bankAccountId").where({ id: topup.id })
        );
};
const topupAll = async (topups: Topup[]) => {
    const [, knex] = await createKnex(config.database.file, {
        client: "sqlite3",
    });
    const logger = createLogger("", topups.length, 5);
    for (const [i, topup] of topups.entries()) {
        logger.log(`Topup user '${topup.id}'`);
        await topupOne(knex, topup);
        logger.progress(i + 1);
    }
    logger.finish();
    await knex.destroy();
};

const raw = JSON.parse(fs.readFileSync(0, { encoding: "utf-8" }));
assertArr(raw);
const topups = raw.map(checkTopup);
await topupAll(topups);
