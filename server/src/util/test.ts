import type { Knex as _Knex } from "knex";
import type { Knex } from "Database";
import type { IAppContext } from "Server";

import {
    mapValues,
    set,
    __,
    isArray,
    intersection,
    isEmpty,
    isString,
} from "lodash/fp";

import config from "Config";

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

const setNotImplemented = <
    K extends PropertyKey,
    O extends Record<PropertyKey, unknown>
>(
    keys: K[],
    obj: O
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<K, any> & O => {
    const newObj = { ...obj };
    keys.forEach((key) =>
        Object.defineProperty(newObj, key, {
            configurable: true,
            enumerable: true,
            get: () => {
                throw new Error("Not implemented");
            },
            set: () => {
                throw new Error("Not implemented");
            },
        })
    );
    return newObj;
};

export const mockAppContext = (knex: Knex): IAppContext =>
    setNotImplemented(["session", "pubsub"], {
        config,
        knex,
    });
