import type { CookieStore } from "@whatwg-node/cookie-store";

import path from "node:path";
// eslint-disable-next-line lodash-fp/use-fp
import lodash from "lodash";
import { curry, isNull, keys, omit, sum, values } from "lodash/fp";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };

export type TNullable<T> = T | null;
/* Like Omit, but with typed keys */
export type TOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Valueof<T> = T[keyof T];
export type UnPromise<P> = P extends Promise<infer T> ? T : never;
export type Fn0<R> = () => R;
export type Fn1<A1, R> = (a1: A1) => R;

export function inOperator<K extends PropertyKey, O>(
    key: K,
    obj: O
): obj is O & Record<K, unknown> {
    return typeof obj === "object" && obj !== null && key in obj;
}

function isObjectLiteral(val: unknown): val is { [_ in PropertyKey]: unknown } {
    return (
        typeof val === "object" &&
        val !== null &&
        Object.getPrototypeOf(val) === Object.prototype
    );
}

export const boolean = Symbol("boolean");
export const number = Symbol("number");
export const bigint = Symbol("bigint");
export const string = Symbol("string");
export const symbol = Symbol("symbol");
export const object = Symbol("object");
type Template =
    | boolean
    | typeof boolean
    | number
    | typeof number
    | bigint
    | typeof bigint
    | string
    | typeof string
    | symbol
    | typeof symbol
    | null
    | { [_ in PropertyKey]: Template }
    | typeof object
    | undefined;

// prettier-ignore
type TemplateType<T extends Template> =
    T extends boolean ? T :
    T extends typeof boolean ? boolean :
    T extends number ? T :
    T extends typeof number ? number :
    T extends bigint ? T :
    T extends typeof bigint ? bigint :
    T extends string ? T :
    T extends typeof string ? string :
    T extends symbol ? T :
    T extends typeof symbol ? symbol :
    T extends null ? null :
    T extends { [_ in PropertyKey]: Template } ? { [K in keyof T]: TemplateType<T[K]>} :
    T extends typeof object ? object :
    T extends undefined ? undefined :
    never

interface IsFn {
    <T extends Template>(template: T, val: unknown): val is TemplateType<T>;
    <T extends Template>(template: T): (val: unknown) => val is TemplateType<T>;
}
/** Test whether a value is a specific type.
 *
 * `template` only supports object literals and not class instances as object types.
 *
 * `template` must be cast `as const` when one of the primitive symbols
 * `boolean`, `number` etc. is used.
 *
 * @example <caption>Basic Usage</caption>
 * const value: unknown = undefined;
 * if ((is({ message: string }), value)) {
 *     // value has inferred type { message: string }
 * }
 *
 * @example <caption>Usage with `Is`</caption>
 * // error.ts
 * export const isErrorLike = is({ message: string } as const);
 * // or with stricter eslint config
 * export const isErrorLike: Is<{ message: string }> = is({ message: string } as const);
 *
 * // main.ts
 * import { isErrorLike } from "./error"
 * const value: unknown = undefined;
 * if (isErrorLike(value)) {
 *     // value has inferred type { message: string }
 * }
 */
// @ts-expect-error can't infer return type as type predicate
export const is: IsFn = curry(
    <T extends Template>(template: T, val: unknown): val is TemplateType<T> => {
        if (typeof template === "boolean") return val === template;
        if (template === boolean) return typeof val === "boolean";
        if (typeof template === "number") return val === template;
        if (template === number) return typeof val === "number";
        if (typeof template === "bigint") return val === template;
        if (template === bigint) return typeof val === "bigint";
        if (typeof template === "string") return val === template;
        if (template === string) return typeof val === "string";
        if (template === symbol) return typeof val === "symbol";
        if (template === null) return val === null;
        if (isObjectLiteral(template))
            return (
                typeof val === "object" &&
                val !== null &&
                Object.getOwnPropertyNames(template).every(
                    // @ts-expect-error val has p as property
                    (p) => p in val && is(template[p], val[p])
                ) &&
                Object.getOwnPropertySymbols(template).every(
                    // @ts-expect-error val has p as property
                    (p) => p in val && is(template[p], val[p])
                )
            );
        if (typeof template === "object")
            throw new Error("Invalid template: non-literal object");
        if (template === object) return typeof val === "object";
        if (template === undefined) return val === undefined;
        throw Error("Invalid template");
    }
);

/** Shorthand for type predicate functions
 *
 * @example <caption>Usage</caption>
 * // ok
 * const isString: Is<string> = is(string)
 * // type error
 * const isString: Is<string> = is(number)
 */
export type Is<T> = (_: unknown) => _ is T;

/** Function resolving paths relative project root */
export const resolveRoot = (...pathSegments: string[]): string =>
    path.resolve(__dirname, "../../", ...pathSegments);

/** Transpose a nxm matrix to a mxn matrix.
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

/** Average of an array of numbers.
 *
 * `arr` must not be empty.
 *
 * @param arr the array of which to calculate the average
 */
export const average = (arr: number[]): number => {
    if (arr.length === 0) throw new Error("Arr must not be empty");

    return sum(arr) / arr.length;
};

interface Pipe {
    <A, R1, R2>(f1: (_: A) => R1, f2: (_: R1) => R2): (v: A) => R2;
    <A, R1, R2, R3>(f1: (_: A) => R1, f2: (_: R1) => R2, f3: (_: R2) => R3): (
        v: A
    ) => R3;
    <A, R1, R2, R3, R4>(
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4
    ): (v: A) => R4;
    <A, R1, R2, R3, R4, R5>(
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5
    ): (v: A) => R5;
    <A, R1, R2, R3, R4, R5, R6>(
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5,
        f6: (_: R5) => R6
    ): (v: A) => R6;
    <A, R1, R2, R3, R4, R5, R6, R7>(
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5,
        f6: (_: R5) => R6,
        f7: (_: R6) => R7
    ): (v: A) => R7;
    (...fs: ((_: unknown) => unknown)[]): (v: unknown) => unknown;
}
export const pipe: Pipe =
    (...fs: ((_: unknown) => unknown)[]) =>
    (v: unknown) =>
        fs.reduce((res, f) => f(res), v);

interface Pipe1 {
    <A, R1, R2>(a: A, f1: (_: A) => R1, f2: (_: R1) => R2): R2;
    <A, R1, R2, R3>(
        a: A,
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3
    ): R3;
    <A, R1, R2, R3, R4>(
        a: A,
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4
    ): R4;
    <A, R1, R2, R3, R4, R5>(
        a: A,
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5
    ): R5;
    <A, R1, R2, R3, R4, R5, R6>(
        a: A,
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5,
        f6: (_: R5) => R6
    ): R6;
    <A, R1, R2, R3, R4, R5, R6, R7>(
        a: A,
        f1: (_: A) => R1,
        f2: (_: R1) => R2,
        f3: (_: R2) => R3,
        f4: (_: R3) => R4,
        f5: (_: R4) => R5,
        f6: (_: R5) => R6,
        f7: (_: R6) => R7
    ): R7;
    (a: unknown, ...fs: ((_: unknown) => unknown)[]): unknown;
}
export const pipe1: Pipe1 = (
    arg: unknown,
    ...fs: ((_: unknown) => unknown)[]
): unknown => fs.reduce((res, f) => f(res), arg);

type MapFn<From, To> = (oldValue: From) => To;
interface MapValues {
    <
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FO extends Record<PropertyKey, MapFn<any, unknown>>,
        O extends { [_K in keyof FO]: Parameters<FO[_K]>[0] }
    >(
        fs: FO,
        o: O
    ): { [_K in Exclude<keyof O, keyof FO>]: O[_K] } & {
        // conveniently remove readonly, since often `as const` is used for type inference
        -readonly [_K in keyof FO]: ReturnType<FO[_K]>;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FO extends Record<PropertyKey, MapFn<any, unknown>>>(fs: FO): <
        O extends { [_K in keyof FO]: Parameters<FO[_K]>[0] }
    >(
        o: O
    ) => { [_K in Exclude<keyof O, keyof FO>]: O[_K] } & {
        // conveniently remove readonly, since often `as const` is used for type inference
        -readonly [_K in keyof FO]: ReturnType<FO[_K]>;
    };
}
/** Map over values of an object by key.
 *
 * Curried usage possible.
 *
 * @example
 * // o has inferred type `{key: number}`
 * const o = mapValues(
 *    // setting val to `string` would throw an error
 *   { key: (val: number) => val + 1 },
 *   { key: 1 }
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

interface Get {
    <K extends PropertyKey, O extends Record<K, unknown>>(key: K, obj: O): O[K];
    <K extends PropertyKey>(key: K): <O extends Record<K, unknown>>(
        obj: O & Record<K, unknown>
    ) => O[K];
}
/** Gets the value at `key` of `obj`. */
// @ts-expect-error Typesafety given by interface
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const get: Get = curry((key: PropertyKey, obj: object) => obj[key]);

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

/** Throw an error */
export const throv = (error: unknown): never => {
    throw error;
};

/** Apply a function if value is not null. */
export const mapNullableC =
    <T, U>(f: (_x: T) => U) =>
    (x: TNullable<T>): TNullable<U> =>
        isNull(x) ? null : f(x);

/* * Haskell-style logging functions * */

/** Log a value and return another.  */
export function log<T>(msg: unknown, x: T): T {
    // eslint-disable-next-line no-console
    console.log(msg);
    return x;
}

/** Log a value and return it */
export function logId<T>(x: T): T {
    return log(x, x);
}

/** "Make Promise sync".
 *
 * PROMISE EXECUTION STILL HAPPENS ASYNCRONOUSELY, but catches potential errors!
 *
 * @example <caption> The following two statements are equivalent </caption>
 * syncify(p);
 * p.catch((err) => { throw err; });
 */
export const syncify = (promise: Promise<unknown>): void => {
    promise.catch((err) => {
        throw err;
    });
};

/** "Make async funciton sync".
 *
 * Potential errors are catched, but FUNCTION CALL STILL HAPPENS ASYNCRONOUSELY!
 *
 * @example <caption> The following two expressions are equivalent </caption>
 * syncifyF(f)
 * (...args) => { f(...args).catch((err) => {throw err;}); }
 *
 * @example <caption> Example usage </caption>
 * async function handleClick() {...}
 * const button = <button onClick={syncifyF(handleClick)} />
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
