import { toLower } from "lodash/fp";
import { formatDurationWithOptions, intervalToDuration } from "date-fns/fp";
import { de } from "date-fns/locale";
import config from "Config";
import { FragmentType, graphql, useFragment as getFragment } from "./graphql";
import { type UserType } from "./graphql/graphql";

export class InvalidInput {}
export type Parser<T> = (string: string) => T | InvalidInput;

const userTypes = { CITIZEN: "Bürger", COMPANY: "Unternehmen", GUEST: "Gst" };
/** Type of a user */
export const tyqe = (_: UserType): string => userTypes[_];
export const parseUserId: Parser<string> = toLower;
export const Name_UserFragment = graphql(/* GraphQL */ `
    fragment Name_UserFragment on User {
        ... on CitizenUser {
            firstName
            lastName
        }
        ... on CompanyUser {
            name
        }
        ... on GuestUser {
            guestName: name
        }
    }
`);
interface INameOpt {
    /** Fallback when guests provide no name */
    fallback: string;
}
const defaultNameOpt: INameOpt = {
    fallback: "Anonym",
};
/** Name of a user */
export const name = (
    _user: FragmentType<typeof Name_UserFragment>,
    _options?: INameOpt
): string => {
    const user = getFragment(Name_UserFragment, _user);
    const options = { ...defaultNameOpt, ..._options };
    switch (user.__typename) {
        case "CitizenUser":
            return `${user.firstName} ${user.lastName}`;
        case "CompanyUser":
            return user.name;
        case "GuestUser":
            return user.guestName ?? options.fallback;
    }
};

/** Boolean value */
export const bool = (_: boolean): string => (_ ? "Ja" : "Nein");

/** Duration in hours and minutes */
export const timeInState = (seconds: number): string =>
    formatDurationWithOptions(
        { format: ["hours", "minutes"], zero: true, locale: de },
        intervalToDuration({ start: 0, end: seconds * 1000 })
    );

interface ICurrencyOptions {
    currency: string;
    unit: "symbol" | "name" | "short" | "none";
    omitDecimals: boolean;
}
const defaultCurrencyOptions: ICurrencyOptions = {
    currency: config.mainCurrency,
    unit: "symbol",
    omitDecimals: false,
};
/** A currency value */
export function currency(
    value: number,
    options?: Partial<ICurrencyOptions>
): string {
    const opts = {
        ...defaultCurrencyOptions,
        ...options,
    };
    const currencyConf = config.currencies[opts.currency];
    if (!currencyConf) return "(Währung unbekannt)";

    const decimals = opts.omitDecimals ? 0 : currencyConf.decimals;
    const valueStr = value.toFixed(decimals);
    /** Whether to insert space between value and unit */
    const space = (() => {
        if (opts.unit === "symbol") return false;
        if (opts.unit === "none") return false;
        return true;
    })();
    const unitStr =
        opts.unit === "none" ? "" : currencyConf[opts.unit] ?? "Unbekannt";

    return `${valueStr}${space ? " " : ""}${unitStr}`;
}

export function currencyName(_currency: string): string {
    const currencyConf = config.currencies[_currency];
    if (!currencyConf) return "(Währung unbekannt)";

    return currencyConf.name;
}

/** Parse a currency value */
export const parseCurrency: Parser<number> = (string) => {
    if (string === "") return 0;

    const value = parseInt(string, 10);
    if (Number.isNaN(value)) return new InvalidInput();
    return value;
};

export const Eq_UserFragment = graphql(/* GraohQL */ `
    fragment Eq_UserFragment on User {
        type
        id
    }
`);
/** Are two users equal? */
export const userEq = (
    _user1: FragmentType<typeof Eq_UserFragment>,
    _user2: FragmentType<typeof Eq_UserFragment>
): boolean => {
    const user1 = getFragment(Eq_UserFragment, _user1);
    const user2 = getFragment(Eq_UserFragment, _user2);
    return user1.type === user2.type && user1.id === user2.id;
};
