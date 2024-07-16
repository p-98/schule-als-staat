import exitHook from "async-exit-hook";
import fs from "fs";
import { constant, keys, min, repeat, round, times } from "lodash/fp";
import { binary, command, run } from "cmd-ts";
import config from "../config";
import { createKnex, Knex } from "../server/src/database/database";
import { formatDateTimeZ } from "../server/src/util/date";
import { stringifyUserSignature } from "../server/src/util/parse";

/* Argument parsing
 */

const description = `Execute a lot of transactions at the same time.

Accepts a JSON array of Transactions vis stdin.
type Transaction = {
    sender: User
    receiver: User
    message: string
    value: number
}
type User = {
    type: "CITIZEN" | "COMPANY"
    id: string
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

interface Transaction {
    sender: User;
    receiver: User;
    purpose: string;
    value: number;
}
interface User {
    type: "CITIZEN" | "COMPANY";
    id: string;
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

const checkUser = (user: unknown): User => {
    assertObj(user);
    const type = safeGetStr("type", user);
    if (!keys(tables).includes(type)) throw Error(`Unknown type: ${type}`);
    return {
        type: type as keyof typeof tables,
        id: safeGetStr("id", user),
    };
};
const checkTransaction = (trx: unknown): Transaction => {
    assertObj(trx);
    return {
        sender: checkUser(trx.sender),
        receiver: checkUser(trx.receiver),
        purpose: safeGetStr("purpose", trx),
        value: safeGetNum("value", trx),
    };
};

const transactOne = async (knex: Knex, trx: Transaction) => {
    // update sender
    const sndTable = tables[trx.sender.type];
    await knex("bankAccounts")
        .decrement("balance", trx.value)
        .where(
            "id",
            knex(sndTable).select("bankAccountId").where({ id: trx.sender.id })
        );
    // update receiver
    const recTable = tables[trx.receiver.type];
    await knex("bankAccounts")
        .increment("balance", trx.value)
        .where(
            "id",
            knex(recTable)
                .select("bankAccountId")
                .where({ id: trx.receiver.id })
        );
    // insert transaction
    await knex("transferTransactions").insert({
        date: formatDateTimeZ(new Date()),
        senderUserSignature: stringifyUserSignature(trx.sender),
        receiverUserSignature: stringifyUserSignature(trx.receiver),
        value: trx.value,
        purpose: trx.purpose,
    });
};
const transactAll = async (transactions: Transaction[]) => {
    const [, knex] = await createKnex(config.database.file, {
        client: "sqlite3",
    });
    const logger = createLogger("", transactions.length, 5);
    for (const [i, trx] of transactions.entries()) {
        logger.log(`Transfer from '${trx.sender.id}' to '${trx.receiver.id}'`);
        await transactOne(knex, trx);
        logger.progress(i + 1);
    }
    logger.finish();
    await knex.destroy();
};

const raw = JSON.parse(fs.readFileSync(0, { encoding: "utf-8" }));
assertArr(raw);
const transactions = raw.map(checkTransaction);
await transactAll(transactions);
