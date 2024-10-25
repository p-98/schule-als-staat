import type { Knex as _Knex } from "knex";

import { type Knex } from "Database";
import { type IAppContext } from "Server";

import { assert } from "chai";
import {
    mapValues,
    set,
    __,
    isArray,
    intersection,
    isEmpty,
    isString,
    isNil,
    multiply,
} from "lodash/fp";

import { type Config } from "Root/types/config";

/* Assertion functions
 */

export function assertIsNotNil<T>(
    actual: T,
    message?: string
): asserts actual is Exclude<T, null | undefined> {
    assert(!isNil(actual), message);
}

/* Seeding helper functions for unit testing
 */

type TSeedFn = (knex: Knex) => Promise<unknown>;
/** Builds SeedSource from record of functions.
 *
 * Seeds will be run in order of elements in seedFns.
 */
export function seedSourceFactory<SeedName extends string>(
    seedFns: Record<SeedName, TSeedFn>
): _Knex.SeedSource<SeedName> {
    type TSeeds = Record<SeedName, { seed: TSeedFn }>;
    const seeds = mapValues(set("seed", __, {}))(seedFns) as TSeeds;

    return {
        getSeeds: async (seederConfig) => {
            const specifics = ({ specific }: _Knex.SeederConfig) => {
                if (isArray(specific)) return specific;
                if (isString(specific)) return [specific];
                return Object.keys(seedFns); // allow all seedNames if no specifics are specified
            };
            return intersection(
                Object.keys(seedFns),
                specifics(seederConfig)
            ) as SeedName[];
        },
        getSeed: async (seedName: SeedName) => seeds[seedName] as _Knex.Seed,
    };
}

export const withSpecific = <SeedName extends string>(
    seedConfig: _Knex.SeederConfig & { seedSource: _Knex.SeedSource<SeedName> },
    ...seeds: SeedName[]
): _Knex.SeederConfig => ({
    ...seedConfig,
    specific: isEmpty(seeds) ? undefined : (seeds as unknown as string),
});

const throwFn = (e: unknown) => {
    throw e;
};
export const notImplementedFn = (): never =>
    throwFn(new Error("Not implemented"));
export const setNotImplemented = <
    K extends PropertyKey,
    O extends Record<PropertyKey, unknown>
>(
    keys: K[],
    original: O
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<K, any> & O =>
    keys.reduce(
        (obj, key) =>
            Object.defineProperty(obj, key, {
                configurable: true,
                enumerable: true,
                get: notImplementedFn,
                set: notImplementedFn,
            }),
        { ...original }
    );

/* Config used in tests
 */

let backupNum = 0;
export const config: Config<"plancko-digital" | "plancko-analog"> = {
    school: setNotImplemented(["classes"], {}),
    currencies: {
        "plancko-digital": {
            name: "Plancko Digital",
            short: "PLDig",
            symbol: "p̶",
            decimals: 0,
            conversion: {
                "plancko-analog": multiply(2),
            },
        },
        "plancko-analog": {
            name: "Plancko Papier",
            short: "PLPap",
            symbol: "p̶",
            decimals: 0,
            conversion: {
                "plancko-digital": multiply(1 / 2),
            },
        },
    },
    mainCurrency: "plancko-digital",
    roles: {
        stateBankAccountId: "STATE",

        adminCitizenIds: ["ADMIN"],
        teacherCitizenIds: ["TEACH"],

        warehouseCompanyId: "WAREH",
        bankCompanyId: "SBANK",
        borderControlCompanyId: "BCTRL",
        taxOfficeCompanyId: "TAX",
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
    server: setNotImplemented(["url", "host", "port"], {
        trustedOperations: ["TRUSTED"],
    }),
    database: {
        file: "nonExistend.sqlite3",
        backup: {
            dir: "backup-dir",
            // eslint-disable-next-line no-plusplus
            file: () => `backup-file-${backupNum++}.sqlite3`,
            interval: Number.MAX_SAFE_INTEGER,
        },
        allowRawSql: true,
    },
    flags: {
        changeTransactionClerk: true,
    },
};

export const mockAppContext = (knex: Knex): IAppContext =>
    setNotImplemented(["session", "pubsub", "db"], {
        config: { ...config, reload: () => Promise.resolve() },
        knex,
    });
