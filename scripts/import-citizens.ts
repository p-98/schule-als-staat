import fs from "fs";
import { basename, dirname, extname, join } from "path";
import { parse, stringify } from "csv/sync";
import niceware from "niceware";
import { pick } from "lodash/fp";
import { binary, command, positional, run, string } from "cmd-ts";
import { File } from "cmd-ts/batteries/fs";

import { createKnex, type Knex } from "../server/src/database/database";
import { type IAppContext } from "../server/src/server";
import { createBankAccount } from "../server/src/modules/bank";
import { encryptPassword } from "../server/src/util/auth";
import config from "../config";

const INITIAL_BANLANCE = 50;

/* Parse arguments
 */

const cmd = command({
    name: "import-citizens",
    args: {
        csvPath: positional({
            type: File,
            displayName: "csv path",
            description: "Path to csv file containing the citizens.",
        }),
    },
    handler: (_) => _,
});
const { csvPath } = await run(binary(cmd), Bun.argv);

/* Type definitions
 */

type Citizen = {
    id: string;
    firstName: string;
    lastName: string;
    course: string;
};
type WithPassword<T> = T & { password: string };

/* Define processing steps
 */

const genPassword = () => niceware.generatePassphrase(6).join("-");
const mapFilename = (f: (name: string) => string, path: string) => {
    const ext = extname(path);
    const name = basename(path, ext);
    const dir = dirname(path);
    return join(dir, `${f(name)}${ext}`);
};

const parseCitizens = (string: string): Citizen[] =>
    parse(string, {
        columns: ["course", "firstName", "lastName", "id"],
    });
const stringifyCitizens = (citizens: WithPassword<Citizen>[]): string =>
    stringify(citizens);

const addPassword = (citizen: Citizen): WithPassword<Citizen> => ({
    ...citizen,
    password: genPassword(),
});
const importCitizen =
    (knex: Knex) => async (citizen: WithPassword<Citizen>) => {
        const ctx = { knex } as IAppContext;
        const bankAccount = await createBankAccount(ctx, INITIAL_BANLANCE);
        await knex("citizens").insert({
            ...pick(["id", "firstName", "lastName"], citizen),
            password: await encryptPassword(citizen.password),
            bankAccountId: bankAccount.id,
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
        });
    };

/* Use processing steps
 */

// load data
const csvString = fs.readFileSync(csvPath, { encoding: "utf-8" });
const withoutPw = parseCitizens(csvString);

// process data
const withPw = withoutPw.map(addPassword);
const [, knex] = await createKnex(config.database.file, { client: "sqlite3" });
await Promise.all(withPw.map(importCitizen(knex)));
await knex.destroy();

// export data
const exportCsvString = stringifyCitizens(withPw);
const exportCsvPath = mapFilename((_) => `${_}-with-passwords`, csvPath);
fs.writeFileSync(exportCsvPath, exportCsvString);
