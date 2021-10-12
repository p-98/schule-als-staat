import config from "Config";

export function parseCurrency(
    value: number,
    currency: keyof typeof config.currencies = "virtual",
    currencySymbol:
        | keyof typeof config.currencies[keyof typeof config.currencies]
        | "none" = "symbol"
): string {
    const currencyString =
        currencySymbol === "none"
            ? ""
            : config.currencies[currency][currencySymbol];

    let returnString = value.toLocaleString(undefined, {
        minimumFractionDigits: currency === "real" ? 2 : 3,
    });

    if (currencySymbol === "symbol") {
        returnString += currencyString;
    } else {
        returnString = `${currencyString} ${returnString}`;
    }

    return returnString;
}
