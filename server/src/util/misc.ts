import type { CookieStore } from "@whatwg-node/cookie-store";

import path from "node:path";
// eslint-disable-next-line lodash-fp/use-fp
import lodash from "lodash";
import { curry, isNull, keys, omit, pipe, sum, values } from "lodash/fp";
import { TNullable } from "Types";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };

export type UnPromise<P> = P extends Promise<infer T> ? T : never;

/** Function resolving paths relative project root */
export const resolveRoot = (...pathSegments: string[]): string =>
    path.resolve(__dirname, "../../", ...pathSegments);

/** Transpose a nxm matrix to a mxn matrix
 *
 *  matrix must be well-formed
 *  n and m must be greater than 0
 *
 * @param matrix a matrix to transpose
 */
export const transpose = <T>(matrix: T[][]): T[][] => {
    if (matrix.length === 0) throw new Error("Matrix must not be empty");

    return matrix[0]!.map((_, choice) => matrix.map((vote) => vote[choice]!));
};

/** Average of an array of numbers
 *
 * arr length must be greater than 0
 *
 * @param arr the array of which to calculate the average
 */
export const average = (arr: number[]): number => {
    if (arr.length === 0) throw new Error("Arr must not be empty");

    return sum(arr) / arr.length;
};

export function pipe1<A, R1>(a: A, f1: (a: A) => R1): R1;
export function pipe1<A, R1, R2>(a: A, f1: (a: A) => R1, f2: (a: R1) => R2): R2;
export function pipe1<A, R1, R2, R3>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3
): R3;
export function pipe1<A, R1, R2, R3, R4>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: R2) => R2,
    f3: (a: R3) => R3,
    f4: (a: R4) => R4
): R4;
export function pipe1<A, R1, R2, R3, R4, R5>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5
): R5;
export function pipe1<A, R1, R2, R3, R4, R5, R6>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6
): R6;
export function pipe1<A, R1, R2, R3, R4, R5, R6, R7>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7
): R7;
export function pipe1(
    arg: unknown,
    ...fs: ((_: unknown) => unknown)[]
): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pipe(...fs)(arg);
}

type MapFn<From, To> = (oldValue: From) => To;
interface MapValues {
    <
        O extends Record<PropertyKey, unknown>,
        FO extends { [_K in keyof Partial<O>]: MapFn<O[_K], unknown> }
    >(
        fs: FO,
        o: O
    ): { [_K in Exclude<keyof O, keyof FO>]: O[_K] } & {
        // conveniently remove readonly, since often `as const` is used for type inference
        -readonly [_K in keyof FO]: ReturnType<FO[_K]>;
    };
    <
        O extends Record<PropertyKey, unknown>,
        FO extends { [_K in keyof Partial<O>]: MapFn<O[_K], unknown> }
    >(
        fs: FO
    ): (o: O) => { [_K in Exclude<keyof O, keyof FO>]: O[_K] } & {
        // conveniently remove readonly, since often `as const` is used for type inference
        -readonly [_K in keyof FO]: ReturnType<FO[_K]>;
    };
}
/** Map over values of an object by key
 *
 * Curried usage possible.
 *
 * @example
 * // o has inferred type `{key: string}`
 * const o = mapValues(
 *    // val has inferred type `number`
 *   { key: (val) => val.toString() },
 *   { key: 1}
 * )
 */
export const mapValues: MapValues = curry((fs: object, o: object): object => ({
    ...omit(keys(fs), o),
    // @ts-expect-error This is too much for ts
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    ...lodash.mapValues(fs, (f, k) => f(o[k])),
}));

interface MoveKeys {
    <
        O extends Record<PropertyKey, unknown>,
        KO extends Partial<Record<PropertyKey, keyof O>>
    >(
        ks: KO,
        o: O
    ): { [_K in Exclude<keyof O, KO[keyof KO]>]: O[_K] } & {
        // @ts-expect-error type `KO[_K]` can be used to index type `O`, because the values of KO are `keyof O`
        // conveniently remove readonly, since often `as const` is used for type inference
        -readonly [_K in keyof KO]: O[KO[_K]];
    };
    <
        O extends Record<PropertyKey, unknown>,
        KO extends Partial<Record<PropertyKey, keyof O>>
    >(
        ks: KO
    ): (o: O) => { [_K in Exclude<keyof O, KO[keyof KO]>]: O[_K] } & {
        // @ts-expect-error type `KO[_K]` can be used to index type `O`, because the values of KO are `keyof O`
        -readonly [_K in keyof KO]: O[KO[_K]];
    };
}
/** Rename keys of an object.
 *
 * Curried usage possible.
 *
 * @example
 * // o has inferred type {neww: string}
 * const o = moveKeys({neww: "old"}, {old: string})
 */
export const moveKeys: MoveKeys = curry((ks: object, o: object) => ({
    ...omit(values(ks), o),
    ...lodash.mapValues(ks, (k) => o[k]),
}));

export const forEachAsync = async <T, R>(
    arr: T[],
    callback: (val: T) => Promise<R>
): Promise<void> => {
    // eslint-disable-next-line no-restricted-syntax
    for (const val of arr) {
        // explicit sequential, non-parallel behaviour is wanted
        // eslint-disable-next-line no-await-in-loop
        await callback(val);
    }
};

/** Use function to compute value
 *
 * Simplifies pattern `let x = (() => {...})()`
 *                 to `let x = compute(() => {...})`
 */
export const compute = <T>(f: () => T): T => f();

/** Apply a function if value is not null */
export const mapNullableC =
    <T, U>(f: (_x: T) => U) =>
    (x: TNullable<T>): TNullable<U> =>
        isNull(x) ? null : f(x);

/* * Haskell-style logging functions * */

/** Log a value and return another  */
export function log<T>(msg: unknown, x: T): T {
    // eslint-disable-next-line no-console
    console.log(msg);
    return x;
}

/** Log a value and return it */
export function logId<T>(x: T): T {
    return log(x, x);
}

/** Make Promise sync
 *
 * PROMISE EXECUTION STILL HAPPENS ASYNCRONOUSELY!
 * But potential errors are catched.
 */
export const syncify = (promise: Promise<unknown>): void => {
    promise.catch((err) => {
        throw err;
    });
};

/** "Make async funciton sync"
 *
 * FUNCTION CALL STILL HAPPENS ASYNCRONOUSELY!
 * But potential errors are catched.
 */
export const syncifyF =
    <Args extends unknown[]>(
        f: (...args: Args) => Promise<void>
    ): ((...args: Args) => void) =>
    (...args) =>
        syncify(f(...args));

export class CustomEvent<T> extends Event {
    detail: T;

    constructor(type: string, options: { detail: T } & EventInit) {
        super(type, options);
        this.detail = options.detail;
    }
}
