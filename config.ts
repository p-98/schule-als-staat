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
        warehouseCompanyId: "WAREH",

        adminCitizenIds: ["ADMIN"],
        bankCompanyId: "SBANK",
        borderControlCompanyId: "BCTRL",
        policeCompanyId: "POLICE",
        policiticsCompanyId: "POLITICS",
    },
    database: {
        file: "database.sqlite3",
    },
    openingHours: {
        dates: ["2020-07-23", "2020-07-24", "2020-07-27", "2020-07-28"],
        open: "09:00:00+02:00",
        close: "16:00:00+02:00",
        timezone: "+02:00",
    },
    guestInitialBalance: 50,
};
