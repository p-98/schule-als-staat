import { formatDurationWithOptions, intervalToDuration } from "date-fns/fp";
import { de } from "date-fns/locale";
import config from "Config";
import { FragmentType, graphql, useFragment as getFragment } from "./graphql";

export class InvalidInput {}
export class NoInput {}

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

/** Duration in hours */
export const hours = (seconds: number): string =>
    formatDurationWithOptions(
        { format: ["hours", "minutes"], zero: true, locale: de },
        intervalToDuration({ start: 0, end: seconds * 1000 })
    );

interface ICurrencyOptions {
    currency: keyof typeof config.currencies;
    unit:
        | keyof (typeof config.currencies)[keyof typeof config.currencies]
        | "none";
    omitDecimals: boolean;
}
const defaultCurrencyOptions: ICurrencyOptions = {
    currency: "virtual",
    unit: "symbol",
    omitDecimals: false,
};
/** A currency value */
export function currency(
    value: number,
    options?: Partial<ICurrencyOptions>
): string {
    const {
        currency: _currency,
        unit,
        omitDecimals,
    } = {
        ...defaultCurrencyOptions,
        ...options,
    };

    const decimals = (() => {
        if (omitDecimals) return 0;
        return _currency === "real" ? 2 : 0;
    })();
    // const valueStr = value.toLocaleString(undefined, {
    //     minimumFractionDigits: decimals,
    // });
    const valueStr = value.toFixed(decimals);

    /** Whether to insert space between value and unit */
    const space = (() => {
        if (unit === "symbol") return false;
        if (unit === "none") return false;
        return true;
    })();

    // eslint-disable-next-line no-underscore-dangle
    const unitStr = unit === "none" ? "" : config.currencies[_currency][unit];

    return `${valueStr}${space ? " " : ""}${unitStr}`;
}

/** Parse a currency value */
export function parseCurrency(string: string): number | InvalidInput {
    if (string === "") return 0;

    const value = parseInt(string, 10);
    if (Number.isNaN(value)) return new InvalidInput();
    return value;
}

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
