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

import { emptyKnex, Knex } from "Database";
import {
    type IAppContext,
    type IDynamicConfig,
    type TYogaServerInstance,
    yogaFactory,
} from "Server";
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
    isNil,
} from "lodash/fp";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse as parseSetCookie } from "set-cookie-parser";
import { serialize as serializeCookie } from "cookie";
import { ValueOrPromise } from "value-or-promise";
import bcrypt from "bcrypt";

import { formatDateTimeZ } from "Util/date";
import { graphql } from "__test__/graphql";
import { UnPromise } from "Util/misc";
import { type Config } from "Root/types/config";
import { type TNullable } from "Types";

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
const notImplementedFn = () => throwFn(new Error("Not implemented"));
const setNotImplemented = <
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

let backupNum = 0;
export const config: Config = {
    school: setNotImplemented(["classes"], {}),
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
    roles: {
        stateBankAccountId: "STATE",

        adminCitizenIds: ["ADMIN"],
        teacherCitizenIds: ["TEACH"],

        warehouseCompanyId: "WAREH",
        bankCompanyId: "SBANK",
        borderControlCompanyId: "BCTRL",
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
    server: setNotImplemented(["url", "host", "port"], {}),
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
};

export const mockAppContext = (knex: Knex): IAppContext =>
    setNotImplemented(["session", "pubsub", "db"], {
        config: { ...config, reload: () => Promise.resolve() },
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
export function buildHTTPAnonymousExecutor(
    yoga: TYogaServerInstance
): TYogaExecutor {
    // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return buildHTTPCookieExecutor({ fetch: yoga.fetch });
}

export interface ICredentials extends IUserSignature {
    password: undefined | string;
}
export type PartialProp<T extends Record<K, unknown>, K extends keyof T> = Omit<
    T,
    K
> &
    Partial<Pick<T, K>>;
let usersCreated = 0;
/** Use same password for all users, because hash is slow */
const userPassword = "userPassword";
const userPasswordHash = bcrypt.hash(userPassword, 1);

type ISeedGuest = {
    type: "GUEST";
    id?: string;
};
type ISeedCompany = {
    type: "COMPANY";
    id?: string;
};
type ISeedCitizen = {
    type: "CITIZEN";
    id?: string;
    class?: TNullable<string>;
};
type TSeed = ISeedCitizen | ISeedCompany | ISeedGuest;
export async function seedUser(knex: Knex, seed: TSeed): Promise<ICredentials> {
    usersCreated += 1;
    const userNum = usersCreated;

    const defaultId = `${seed.type.toLowerCase()}IdOfUser${userNum}`;
    const credentials: ICredentials = {
        id: seed.id ?? defaultId,
        type: seed.type,
        password: seed.type === "GUEST" ? undefined : userPassword,
    };

    const bankAccountId = `bankAccountIdFor${credentials.type}${credentials.id}`;
    await knex("bankAccounts").insert({
        id: bankAccountId,
        balance: 10.0,
        redemptionBalance: 0.0,
    });
    switch (seed.type) {
        case "CITIZEN":
            await knex("citizens").insert({
                id: credentials.id,
                firstName: `firstNameOfCITIZEN${credentials.id}`,
                lastName: `lastNameOfCITIZEN${credentials.id}`,
                bankAccountId,
                image: "",
                password: await userPasswordHash,
                class: seed.class ?? null,
            });
            break;
        case "COMPANY":
            await knex("companies").insert({
                id: credentials.id,
                bankAccountId,
                name: `companyNameOfCOMPANY${credentials.id}`,
                password: await userPasswordHash,
                image: "",
            });
            break;
        case "GUEST":
            await knex("guests").insert({
                id: credentials.id,
                bankAccountId,
                name: `guestNameOfGUEST${credentials.id}`,
                enteredAt: formatDateTimeZ(new Date()),
            });
    }
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
            user {
                ...UserSignature_UserFragment
            }
        }
    }
`);
export async function buildHTTPUserExecutor(
    knex: Knex,
    yoga: TYogaServerInstance,
    user: TSeed | ICredentials,
    options?: {
        // if set, assumes `userSignature` argument to be of type ICredentials
        noSeed?: boolean;
    }
): Promise<
    TYogaExecutor &
        ICredentials & { credentials: ICredentials; signature: IUserSignature }
> {
    const credentials = options?.noSeed
        ? pick(["type", "id", "password"], user as ICredentials)
        : await seedUser(knex, user as TSeed);

    const executor = buildHTTPAnonymousExecutor(yoga);
    const login = await executor({
        document: loginMutation,
        variables: credentials,
    });
    assertSingleValue(login);
    assertNoErrors(login);
    assertIsNotNil(login.data.login.user);

    return Object.assign(executor, credentials, {
        signature: pick(["type", "id"], credentials),
        credentials,
    });
}
export type TUserExecutor = UnPromise<ReturnType<typeof buildHTTPUserExecutor>>;

export async function createTestServer(): Promise<[Knex, TYogaServerInstance]> {
    const [db, knex] = await emptyKnex();
    // disable backups
    db.backup = notImplementedFn;
    const dconfig: IDynamicConfig = {
        async get() {
            return config;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        async reload() {},
    };
    const yoga = yogaFactory(db, knex, dconfig);
    return [knex, yoga];
}
