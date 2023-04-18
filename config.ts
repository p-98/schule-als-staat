import { addDays, subDays } from "date-fns";

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
    openingHours: {
        dates: [subDays(new Date(), 1), new Date(), addDays(new Date(), 1)].map(
            (date) => date.toISOString().slice(0, 10)
        ),
        open: "09:00:00+02:00",
        close: "16:00:00+02:00",
    },
    guestInitialBalance: 50,
};
