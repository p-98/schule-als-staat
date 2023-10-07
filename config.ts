import { addDays, subDays } from "date-fns";
import path from "node:path";
import { formatDateZ } from "./server/src/util/date";

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
    server: {
        stateBankAccountId: "STATE",
        bankCompanyId: "SBANK",
        borderControlCompanyId: "BCTRL",
        warehouseCompanyId: "WAREH",
    },
    database: {
        file: "database.sqlite3",
    },
    openingHours: {
        dates: [subDays(new Date(), 1), new Date(), addDays(new Date(), 1)].map(
            formatDateZ
        ),
        open: "09:00:00+02:00",
        close: "16:00:00+02:00",
        timezone: "+02:00",
    },
    guestInitialBalance: 50,
};

export const resolve = (...pathSegments: string[]): string =>
    path.resolve(__dirname, ...pathSegments);
