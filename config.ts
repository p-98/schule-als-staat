import { Config } from "./types/config";

/** Minutes to milliseconds */
const minutes = (_: number) => _ * 60 * 1000;

const multiply = (factor: number) => (_: number) => factor * _;

export default {
    school: {
        classes: ["5a"],
    },
    currencies: {
        "plancko-digital": {
            name: "Plancko Digital",
            short: "PLDig",
            symbol: "p̶",
            decimals: 0,
            conversion: {
                "plancko-analog": multiply(2),
            },
        },
        "plancko-analog": {
            name: "Plancko Papier",
            short: "PLPap",
            symbol: "p̶",
            decimals: 0,
            conversion: {
                "plancko-digital": multiply(0.5),
            },
        },
    },
    mainCurrency: "plancko-digital",
    roles: {
        stateBankAccountId: "STATE",

        adminCitizenIds: ["admin", "j.keller"],
        teacherCitizenIds: ["teach", "m.koch"],

        warehouseCompanyId: "warehouse",
        bankCompanyId: "bank",
        borderControlCompanyId: "border",
        taxOfficeCompanyId: "tax",
        policeCompanyId: "police",
        policiticsCompanyId: "politics",
    },
    openingHours: {
        dates: ["2020-07-23", "2020-07-24", "2020-07-27", "2020-07-28"],
        open: "09:00:00+02:00",
        close: "16:00:00+02:00",
        timezone: "+02:00",
    },
    guestInitialBalance: 50,
    server: {
        url: "http://127.0.0.1:4000/graphql",
        host: "127.0.0.1",
        port: 4000,
        trustedOperations: ["19f360e9", "TRUSTED"],
    },
    database: {
        file: "database.sqlite3",
        backup: {
            dir: "database",
            file: () => `database-backup-${new Date().toISOString()}.sqlite3`,
            interval: minutes(1),
        },
        allowRawSql: false,
    },
} satisfies Config<"plancko-digital" | "plancko-analog"> as Config<string>;
