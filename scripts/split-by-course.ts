import fs from "fs";
import { basename, dirname, extname, join } from "path";
import { parse, stringify } from "csv/sync";
import { get, groupBy } from "lodash/fp";
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

const CSV_OPTIONS = {
    columns: ["firstName", "lastName", "id", "course", "password"],
    delimiter: ";",
};

/* Parse arguments
 */

const cmd = command({
    name: "import-citizens",
    args: {
        // withPasswords: flag({
        //     type: boolean,
        //     long: "import-passwords",
        //     short: "p",
        //     description:
        //         "Whether the passwords are included as the last column of the provided dataset.",
        // }),
        csvPath: positional({
            type: File,
            displayName: "csv path",
            description: "Path to csv file containing the citizens.",
        }),
    },
    handler: (_) => _,
});
const { /* withPasswords, */ csvPath } = await run(binary(cmd), Bun.argv);

/* Type definitions
 */

type Citizen = {
    id: string;
    firstName: string;
    lastName: string;
    course: string;
    password: string;
};
type WithPassword<T> = T & { password: string };

/* Define processing steps
 */

const parseCitizens = (string: string): Citizen[] =>
    parse(string, { ...CSV_OPTIONS });
const stringifyCitizens = (citizens: WithPassword<Citizen>[]): string =>
    stringify(citizens, { ...CSV_OPTIONS });

/* Use processing steps
 */

// load data
const csvString = fs.readFileSync(csvPath, { encoding: "utf-8" });
const citizens = parseCitizens(csvString);

// group by course
const byCourse = groupBy(get("course"), citizens);
console.log(byCourse);

// export data
fs.mkdirSync(join(dirname(csvPath), basename(csvPath, extname(csvPath))), {
    recursive: true,
});
for (const [course, courseCitizens] of Object.entries(byCourse)) {
    const exportCsvString = stringifyCitizens(courseCitizens);
    const exportCsvPath = join(
        dirname(csvPath),
        basename(csvPath, extname(csvPath)),
        `${course}.csv`
    );
    console.log(exportCsvPath);
    fs.writeFileSync(exportCsvPath, exportCsvString);
}
