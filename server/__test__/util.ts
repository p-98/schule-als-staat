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

import { emptyKnex, type Knex } from "Database";
import {
    type IDynamicConfig,
    type TYogaServerInstance,
    yogaFactory,
} from "Server";
import type { IUserSignature } from "Types/models";

import { assert, AssertionError } from "chai";
import { pipe, map, join, pick } from "lodash/fp";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse as parseSetCookie } from "set-cookie-parser";
import { serialize as serializeCookie } from "cookie";
import { ValueOrPromise } from "value-or-promise";
import bcrypt from "bcrypt";

import { formatDateTimeZ } from "Util/date";
import { type UnPromise, type TNullable } from "Util/misc";
import { assertIsNotNil, config } from "Util/test";
import { graphql } from "./graphql";

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

export { buildHTTPExecutor };

export type TYogaExecutor = AsyncExecutor<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    HTTPExecutorOptions,
    ExecutionResultAdditions
>;
export function buildHTTPAnonymousExecutor(
    yoga: TYogaServerInstance
): TYogaExecutor {
    return buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
        endpoint: "http://test.url/graphql",
    });
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
    const [, knex] = await emptyKnex();
    const dconfig: IDynamicConfig = {
        async get() {
            return config;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        async reload() {},
    };
    const yoga = yogaFactory(knex, dconfig);
    return [knex, yoga];
}
