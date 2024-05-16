export type Config = {
    currencies: Record<
        "real" | "virtual",
        {
            name: string;
            short: string;
            symbol: string;
        }
    >;
    currencyExchange: {
        virtualPerReal: number;
        realPerVirtual: number;
    };
    roles: {
        stateBankAccountId: string;
        warehouseCompanyId: string;

        adminCitizenIds: string[];
        bankCompanyId: string;
        borderControlCompanyId: string;
        policeCompanyId: string;
        policiticsCompanyId: string;
    };
    openingHours: {
        /** e.g. ["2020-07-23", "2020-07-24", "2020-07-27", "2020-07-28"] */
        dates: string[];
        /** e.g. "09:00:00+02:00" */
        open: string;
        /** e.g. "16:00:00+02:00" */
        close: string;
        /** e.g. "+02:00"; */
        timezone: string;
    };
    guestInitialBalance: number;
    server: {
        url: string;
        host: string;
        port: number;
    };
    database: {
        file: string;
        backup: {
            dir: string;
            file: () => string;
            interval: number;
        };
    };
};
