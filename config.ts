import { Config } from "./types/config";

/** Minutes to milliseconds */
const minutes = (_: number) => _ * 60 * 1000;

export default {
    currencies: {
        real: {
            name: "Euro",
            short: "EUR",
            symbol: "€",
        },
        virtual: {
            name: "πCoin",
            short: "PC",
            symbol: "π",
        },
    },
    currencyExchange: {
        virtualPerReal: 3.141 / 1,
        realPerVirtual: 1 / 3.141,
    },
    roles: {
        stateBankAccountId: "STATE",
        warehouseCompanyId: "WAREH",

        adminCitizenIds: ["ADMIN"],
        bankCompanyId: "SBANK",
        borderControlCompanyId: "BCTRL",
        policeCompanyId: "POLICE",
        policiticsCompanyId: "POLITICS",
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
} satisfies Config;
