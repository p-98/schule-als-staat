import type { Knex as _Knex } from "knex";
import type { ExecutionResult, GraphQLError } from "graphql";
import type { CookieMap } from "set-cookie-parser";
import type {
    HeadersConfig,
    HTTPExecutorOptions,
    SyncFetchFn,
    AsyncFetchFn,
    RegularFetchFn,
    ExecutionResultAdditions,
} from "@graphql-tools/executor-http";
import type {
    Executor,
    SyncExecutor,
    AsyncExecutor,
    ExecutionRequest,
} from "@graphql-tools/utils";

import type { Knex } from "Database";
import type { IAppContext, TYogaServerInstance } from "Server";
import type { IUserSignature } from "Types/models";

import { assert, AssertionError } from "chai";
import {
    mapValues,
    set,
    __,
    isArray,
    intersection,
    isEmpty,
    isString,
    pipe,
    map,
    join,
    pick,
} from "lodash/fp";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse as parseSetCookie } from "set-cookie-parser";
import { serialize as serializeCookie } from "cookie";
import { ValueOrPromise } from "value-or-promise";
import bcrypt from "bcrypt";

import config from "Config";
import { formatDateTimeZ } from "Util/date";
import { graphql } from "__test__/graphql";
import { UnPromise } from "Util/misc";

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

/**
 * Function according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing)
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function assertSingleValue<TValue extends object>(
    value: TValue | AsyncIterable<TValue>
): asserts value is TValue {
    assert.notProperty(
        value,
        Symbol.asyncIterator as unknown as string,
        "Expected single value"
    );
}

export function assertNoErrors<TExtensions, TData>(
    value: ExecutionResult<TData, TExtensions>
): asserts value is ExecutionResult<TData, TExtensions> & {
    data: TData;
} {
    assert.isUndefined(value.errors);
}

export function assertSingleError<TExtensions, TData>(
    value: ExecutionResult<TData, TExtensions>
): asserts value is ExecutionResult<TData, TExtensions> & {
    errors: ReadonlyArray<GraphQLError> & [GraphQLError];
} {
    try {
        assert.isArray(value.errors, "Result needs to have errors");
        assert.lengthOf(
            value.errors as ReadonlyArray<GraphQLError>,
            1,
            "Result needs to have exactly one error"
        );
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(value.errors);
        throw err;
    }
}

export const assertInvalid = (
    actual: UnPromise<ReturnType<TUserExecutor>>,
    code: string
): void => {
    assertSingleValue(actual);
    assertSingleError(actual);
    try {
        assert.property(actual.errors[0], "extensions");
        assert.strictEqual(actual.errors[0].extensions.code, code);
    } catch (err) {
        if (!(err instanceof AssertionError)) throw err;
        // eslint-disable-next-line no-console
        console.error(actual.errors[0]);
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw err;
    }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildHTTPCookieExecutor(
    buildOptions?: Omit<HTTPExecutorOptions, "fetch"> & {
        fetch: SyncFetchFn;
    }
): SyncExecutor<any, HTTPExecutorOptions, ExecutionResultAdditions>;
export function buildHTTPCookieExecutor(
    buildOptions?: Omit<HTTPExecutorOptions, "fetch"> & {
        fetch: AsyncFetchFn;
    }
): AsyncExecutor<any, HTTPExecutorOptions, ExecutionResultAdditions>;
export function buildHTTPCookieExecutor(
    buildOptions?: Omit<HTTPExecutorOptions, "fetch"> & {
        fetch: RegularFetchFn;
    }
): AsyncExecutor<any, HTTPExecutorOptions, ExecutionResultAdditions>;
export function buildHTTPCookieExecutor(
    buildOptions?: Omit<HTTPExecutorOptions, "fetch">
): AsyncExecutor<any, HTTPExecutorOptions, ExecutionResultAdditions>;
export function buildHTTPCookieExecutor(
    buildOptions?: HTTPExecutorOptions
): Executor<any, HTTPExecutorOptions, ExecutionResultAdditions> {
    let cookies: CookieMap = {};

    const executor = buildHTTPExecutor({
        ...buildOptions,
        outputHeaders: true,
        headers: (executorRequest) => {
            let headers: HeadersConfig = {};
            if (typeof buildOptions?.headers === "object")
                headers = buildOptions.headers;
            if (typeof buildOptions?.headers === "function")
                headers = buildOptions.headers(executorRequest);

            const cookiesStr = pipe(
                (_: CookieMap) => Object.values(_),
                map(({ name, value }) => serializeCookie(name, value)),
                join(";")
            )(cookies);
            if (headers.Cookie) headers.Cookie += `;${cookiesStr}`;
            else headers.Cookie = cookiesStr;
            return headers;
        },
    });
    const cookieExecutor = (
        request: ExecutionRequest<any, any, any, HTTPExecutorOptions>
    ) =>
        new ValueOrPromise(() => executor(request))
            .then((result) => {
                const setCookie = result?.headers?.getSetCookie?.();
                if (setCookie)
                    cookies = {
                        ...cookies,
                        ...parseSetCookie(setCookie, { map: true }),
                    };
                return result;
            })
            .then((result) => {
                const cleanResult = { ...result };
                if (buildOptions?.outputHeaders !== true)
                    delete cleanResult.headers;
                return result;
            })
            .resolve();
    return cookieExecutor;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type TYogaExecutor = AsyncExecutor<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    HTTPExecutorOptions,
    ExecutionResultAdditions
>;
export interface ICredentials extends IUserSignature {
    password: undefined | string;
}
type PartialProp<T extends Record<K, unknown>, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;
let usersCreated = 0;
/** Use same password for all users, because hash is slow */
const userPassword = "userPassword";
const userPasswordHash = bcrypt.hash(userPassword, 1);

export async function seedUser(
    knex: Knex,
    { type, id }: PartialProp<IUserSignature, "id">
): Promise<ICredentials> {
    usersCreated += 1;
    const userNum = usersCreated;

    const defaultId = `${type.toLowerCase()}IdOfUser${userNum}`;
    const credentials: ICredentials = {
        id: id ?? defaultId,
        type,
        password: type === "GUEST" ? undefined : userPassword,
    };
    const bankAccountId = `bankAccountIdFor${credentials.type}${credentials.id}`;

    const seedSource = seedSourceFactory({
        bankAccount: async (seedKnex) => {
            await seedKnex("bankAccounts").insert({
                id: bankAccountId,
                balance: 10.0,
                redemptionBalance: 0.0,
            });
        },
        GUEST: async (seedKnex) =>
            seedKnex("guests").insert({
                id: credentials.id,
                cardId: `cardIdOfGUEST${id}`,
                bankAccountId,
                name: `guestNameOfGUEST${id}`,
                enteredAt: formatDateTimeZ(new Date()),
            }),
        CITIZEN: async (seedKnex) =>
            seedKnex("citizens").insert({
                id: credentials.id,
                firstName: `firstNameOfCITIZEN${id}`,
                lastName: `lastNameOfCITIZEN${id}`,
                bankAccountId,
                image: "",
                password: await userPasswordHash,
            }),
        COMPANY: async (seedKnex) =>
            seedKnex("companies").insert({
                id: credentials.id,
                bankAccountId,
                name: `companyNameOfCOMPANY${id}`,
                password: await userPasswordHash,
                image: "",
            }),
    });
    await knex.seed.run(withSpecific({ seedSource }, "bankAccount", type));
    return credentials;
}

graphql(/* GraphQL */ `
    fragment UserSignature_UserFragment on User {
        __typename
        id
    }
`);
const loginMutation = graphql(/* GraphQL */ `
    mutation Login($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            ...UserSignature_UserFragment
        }
    }
`);
export async function buildHTTPUserExecutor(
    knex: Knex,
    yoga: TYogaServerInstance,
    userSignature: PartialProp<IUserSignature, "id">
): Promise<
    TYogaExecutor &
        ICredentials & { credentials: ICredentials; signature: IUserSignature }
> {
    const credentials = await seedUser(knex, userSignature);

    const executor = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
    });
    const login = await executor({
        document: loginMutation,
        variables: credentials,
    });

    assertSingleValue(login);
    assertNoErrors(login);

    return Object.assign(executor, credentials, {
        signature: pick(["type", "id"], credentials),
        credentials,
    });
}
export type TUserExecutor = UnPromise<ReturnType<typeof buildHTTPUserExecutor>>;
