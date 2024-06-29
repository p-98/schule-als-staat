type NeverTo<T, Fallback> = [T] extends [never] ? Fallback : T;
export type ConversionFn = (fromValue: number) => number;
export type Config<Currencies extends string> = {
    school: {
        classes: string[];
    };
    currencies: {
        [Currency in Currencies]: {
            name: string;
            short: string;
            symbol: string;
            decimals: number;
            conversion: {
                // NeverTo prevents no conversion function allowed when Currencies is uknown (instanciated with string)
                [OtherCurrency in NeverTo<
                    Exclude<Currencies, Currency>,
                    string
                >]: ConversionFn;
            };
        };
    };
    mainCurrency: Currencies;
    roles: {
        stateBankAccountId: string;

        adminCitizenIds: string[];
        teacherCitizenIds: string[];

        bankCompanyId: string;
        warehouseCompanyId: string;
        borderControlCompanyId: string;
        taxOfficeCompanyId: string;
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
        allowRawSql: boolean;
    };
};
