import config from "Config";

interface IOptions {
    currency: keyof typeof config.currencies;
    currencySymbol:
        | keyof typeof config.currencies[keyof typeof config.currencies]
        | "none";
    omitDecimals: boolean;
}

const defaultOptions: IOptions = {
    currency: "virtual",
    currencySymbol: "symbol",
    omitDecimals: false,
};

export function parseCurrency(
    value: number,
    options?: Partial<IOptions>
): string {
    const { currency, currencySymbol, omitDecimals } = {
        ...defaultOptions,
        ...options,
    };

    const currencyString =
        currencySymbol === "none"
            ? ""
            : config.currencies[currency][currencySymbol];

    let digits = currency === "real" ? 2 : 3;
    if (omitDecimals) digits = 0;

    let returnString = value.toLocaleString(undefined, {
        minimumFractionDigits: digits,
    });

    if (currencySymbol === "symbol") {
        returnString += currencyString;
    } else {
        returnString = `${currencyString} ${returnString}`;
    }

    return returnString;
}
