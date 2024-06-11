import fs from "fs";
import { basename, dirname, extname, join } from "path";
import { parse, stringify } from "csv/sync";
import niceware from "niceware";
import { pick } from "lodash/fp";
import {
    binary,
    boolean,
    command,
    flag,
    positional,
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
const CSV_OPTIONS = {
    columns: ["firstName", "lastName", "id", "course"],
    delimiter: ";",
};

/* Parse arguments
 */

const cmd = command({
    name: "import-citizens",
    args: {
        withPasswords: flag({
            type: boolean,
            long: "import-passwords",
            short: "p",
            description:
                "Whether the passwords are included as the last column of the provided dataset.",
        }),
        csvPath: positional({
            type: File,
            displayName: "csv path",
            description: "Path to csv file containing the citizens.",
        }),
    },
    handler: (_) => _,
});
const { withPasswords, csvPath } = await run(binary(cmd), Bun.argv);

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

const parseCitizens = (string: string): Citizen[] => parse(string, CSV_OPTIONS);
const parseCitizensWithPw = (string: string): WithPassword<Citizen>[] =>
    parse(string, {
        ...CSV_OPTIONS,
        columns: [...CSV_OPTIONS.columns, "password"],
    });
const stringifyCitizens = (citizens: WithPassword<Citizen>[]): string =>
    stringify(citizens, {
        ...CSV_OPTIONS,
        columns: [...CSV_OPTIONS.columns, "password"],
    });

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
const citizens = withPasswords
    ? parseCitizensWithPw(csvString)
    : parseCitizens(csvString).map(addPassword);

// process data
const [, knex] = await createKnex(config.database.file, { client: "sqlite3" });
for (const citizen of citizens) {
    await importCitizen(knex)(citizen);
}
await knex.destroy();

// export data
if (!withPasswords) {
    const exportCsvString = stringifyCitizens(citizens);
    const exportCsvPath = mapFilename((_) => `${_}-with-passwords`, csvPath);
    fs.writeFileSync(exportCsvPath, exportCsvString);
}
