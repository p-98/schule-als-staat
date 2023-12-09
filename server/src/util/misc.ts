import type { CookieStore } from "@whatwg-node/cookie-store";

import path from "node:path";
import { root } from "Config";
import { pipe, sum } from "lodash/fp";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };

export type UnPromise<P> = P extends Promise<infer T> ? T : never;

/** Function resolving paths relative to global config file */
export const resolveRoot = (...pathSegments: string[]): string =>
    path.resolve(root, ...pathSegments);

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

export function pipe1<A, R1, R2>(a: A, f1: (a: A) => R1, f2: (a: A) => R2): R2;
export function pipe1<A, R1, R2, R3>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: A) => R2,
    f3: (a: A) => R3
): R3;
export function pipe1<A, R1, R2, R3, R4>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: A) => R2,
    f3: (a: A) => R3,
    f4: (a: A) => R4
): R4;
export function pipe1<A, R1, R2, R3, R4, R5>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: A) => R2,
    f3: (a: A) => R3,
    f4: (a: A) => R4,
    f5: (a: A) => R5
): R5;
export function pipe1<A, R1, R2, R3, R4, R5, R6>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: A) => R2,
    f3: (a: A) => R3,
    f4: (a: A) => R4,
    f5: (a: A) => R5,
    f6: (a: A) => R6
): R6;
export function pipe1<A, R1, R2, R3, R4, R5, R6, R7>(
    a: A,
    f1: (a: A) => R1,
    f2: (a: A) => R2,
    f3: (a: A) => R3,
    f4: (a: A) => R4,
    f5: (a: A) => R5,
    f6: (a: A) => R6,
    f7: (a: A) => R7
): R7;
export function pipe1(
    arg: unknown,
    ...fs: ((_: unknown) => unknown)[]
): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pipe(...fs)(arg);
}

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
