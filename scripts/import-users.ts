import fs from "fs";
import { extname } from "path";
import * as csv from "csv/sync";
import niceware from "niceware";
import {
    pick,
    toLower,
    keys,
    pipe,
    flatten,
    range,
    replace,
    times,
    random,
    assign,
} from "lodash/fp";
import {
    array,
    binary,
    boolean,
    command,
    flag,
    multioption,
    oneOf,
    option,
    optional,
    restPositionals,
    run,
    string,
} from "cmd-ts";
import { File } from "cmd-ts/batteries/fs";

import { createKnex, type Knex } from "../server/src/database/database";
import { type IAppContext } from "../server/src/server";
import { createBankAccount } from "../server/src/modules/bank";
import { encryptPassword } from "../server/src/util/auth";
import config from "../config";

const INITIAL_BANLANCE = 50;

/* Parse arguments
 */

type IdTransform = (id: string) => string;
const idTransformFns = {
    "to-lower": toLower,
} satisfies Record<string, IdTransform>;

const description = `Import user data from csv/json files into the database.

A user record must have one of field combinations:
- type='CITIZEN', id, firstName, lastName, class, password (optional)
- type='COMPANY', id, name, password (optional)

The password sources are:
- 'gen-words' generates a password of 3 human-readable words
- 'gen-random' generates a password of 8 alphanumerical characters
- 'import' uses the password field of the input records
- 'id' uses the id field of the input records (including the transformations made)`;
const cmd = command({
    name: "import-users",
    description,
    args: {
        idTransforms: multioption({
            type: array(
                oneOf(keys(idTransformFns) as (keyof typeof idTransformFns)[])
            ),
            long: "id-transform",
            description: "Transformations applied to the id.",
        }),
        pwFrom: option({
            type: oneOf(["gen-words", "gen-random", "import", "id"] as const),
            long: "password",
            short: "p",
            description: "A password source the passwords are taken from.",
        }),
        dryRun: flag({
            type: boolean,
            long: "dry-run",
            short: "d",
            description: "Check the data but do not import to the database.",
            defaultValue: () => false,
            defaultValueIsSerializable: true,
        }),
        out: option({
            type: optional(string),
            long: "output",
            short: "o",
            description:
                "Optional path to json file, where the imported records including all modifications to the dataset made by the script are exported to.",
        }),
        ins: restPositionals({
            type: File,
            displayName: "inputs",
            description: "Path to csv/json files containing the users.",
        }),
    },
    handler: (_) => _,
});
const { idTransforms, pwFrom, dryRun, out, ins } = await run(
    binary(cmd),
    Bun.argv
);

/* Type definitions
 */

type Citizen = {
    type: "CITIZEN";
    id: string;
    firstName: string;
    lastName: string;
    class: string;
    password: string;
};
type Company = {
    type: "COMPANY";
    id: string;
    name: string;
    password: string;
};
type User = Citizen | Company;

type FileType = "csv" | "json";

/* Define processing steps
 */

const fromCodePoint = (codePoint: number) => String.fromCodePoint(codePoint);
/** Range of characters
 * @start Start of range. Must contain exactly one character.
 * @end End of range. Must contain exactly one character.
 * @returns The range from start to including end.
 */
const charRange = (start: string, end: string): string[] =>
    range(start.codePointAt(0)!, end.codePointAt(0)! + 1).map(fromCodePoint);
const alphaNum = [
    ...charRange("a", "z"),
    ...charRange("A", "Z"),
    ...charRange("0", "9"),
];
const chooseRandom = <T>(arr: T[]): T => arr[random(arr.length, false)]!;
const stripBom = replace(/^\uFEFF/g, "");

const isIn = <O>(k: PropertyKey, o: O): k is keyof O =>
    typeof o === "object" && o !== null && k in o;

const fileType = (path: string): FileType => {
    const ext = extname(path);
    if (ext === ".csv") return "csv";
    if (ext === ".json") return "json";
    throw Error(`Unknown filetype: ${ext}`);
};
const load = (path: string): Promise<unknown> => {
    const type = fileType(path);
    const str = stripBom(fs.readFileSync(path, { encoding: "utf-8" }));
    return type === "csv" ? csv.parse(str, { columns: true }) : JSON.parse(str);
};

const applyIdTransforms = (id: string): string =>
    pipe(idTransforms.map((t) => idTransformFns[t]))(id);
const safeGet = (p: string, o: Record<string, unknown>): string => {
    if (!(p in o) || typeof o[p] !== "string") {
        const oStr = JSON.stringify(o);
        throw Error(`Property is no string.\nProperty: ${p}\nObject: ${oStr}`);
    }
    return o[p] as string;
};
type PasswordFn = (user: { id: string; password?: string }) => string;
const passwords: Record<typeof pwFrom, PasswordFn> = {
    "gen-random": (user) => times(() => chooseRandom(alphaNum), 8).join(""),
    "gen-words": (user) => niceware.generatePassphrase(6).join("-"),
    id: (user) => user.id,
    import: (user) => safeGet("password", user),
};

type CheckFn<T extends User> = (user: Pick<T, "type">) => T;
const checkFns: { [K in User["type"]]: CheckFn<User & { type: K }> } = {
    CITIZEN: (citizen): Citizen => {
        const withoutPw = {
            type: citizen.type,
            id: applyIdTransforms(safeGet("id", citizen)),
            firstName: safeGet("firstName", citizen),
            lastName: safeGet("lastName", citizen),
            class: safeGet("class", citizen),
        };
        const password = passwords[pwFrom](assign(citizen, withoutPw));
        return { ...withoutPw, password };
    },
    COMPANY: (company): Company => {
        const withoutPw = {
            type: company.type,
            id: applyIdTransforms(safeGet("id", company)),
            name: safeGet("name", company),
        };
        const password = passwords[pwFrom](assign(company, withoutPw));
        return { ...withoutPw, password };
    },
};
const checkUser = (user: unknown): User => {
    if (typeof user !== "object" || user === null)
        throw Error("User is no object");
    const type: User["type"] = (() => {
        const _type = safeGet("type", user as Record<string, unknown>);
        if (!["CITIZEN", "COMPANY"].includes(_type))
            throw Error('User.type not "CITIZEN" or "COMPANY"');
        return _type as User["type"];
    })();
    const checkFn = checkFns[type] as CheckFn<User>;
    return checkFn({ ...user, type });
};
const checkUsers = (users: unknown): User[] => {
    if (!Array.isArray(users)) throw Error("Data is not an array");
    return users.map(checkUser);
};

type ImportFn<T> = (knex: Knex) => (user: T) => Promise<void>;
const importFns: { [K in User["type"]]: ImportFn<User & { type: K }> } = {
    CITIZEN: (knex) => async (citizen) => {
        const ctx = { knex } as IAppContext;
        const bankAccount = await createBankAccount(ctx, INITIAL_BANLANCE);
        await knex("citizens").insert({
            ...pick(["id", "firstName", "lastName", "class"], citizen),
            bankAccountId: bankAccount.id,
            password: await encryptPassword(citizen.password),
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        });
    },
    COMPANY: (knex) => async (company) => {
        const ctx = { knex } as IAppContext;
        const bankAccount = await createBankAccount(ctx, INITIAL_BANLANCE);
        await knex("companies").insert({
            ...pick(["id", "name"], company),
            bankAccountId: bankAccount.id,
            password: await encryptPassword(company.password),
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        });
    },
};
const importUsers = async (users: User[]) => {
    const [, knex] = await createKnex(config.database.file, {
        client: "sqlite3",
    });
    for (const user of users) {
        await importFns[user.type](knex)(user as never);
    }
    await knex.destroy();
};

type ExportFileType = ".json";
type StringifyFn = (users: User[]) => string;
const stringifyFns: Record<ExportFileType, StringifyFn> = {
    ".json": (users) => JSON.stringify(users, null, 2),
};
const exqort = (path: string, users: User[]) => {
    const ext = extname(path);
    if (!isIn(ext, stringifyFns)) throw Error(`Unknown out filetype: ${ext}`);
    fs.writeFileSync(path, stringifyFns[ext](users));
};

/* Use processing steps
 */

// load data

const users = flatten(ins.map(pipe(load, checkUsers)));

if (!dryRun) await importUsers(users);

if (out) exqort(out, users);
