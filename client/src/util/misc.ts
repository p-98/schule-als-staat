import { isValidElement } from "react";
import {
    all,
    any,
    isArray,
    isBoolean,
    isNull,
    isNumber,
    isObject,
    isString,
    isUndefined,
    pipe,
} from "lodash/fp";

export function pipe1<A, R1>(a: A, f1: (a: A) => R1): R1;
export function pipe1<A, R1, R2>(a: A, f1: (a: A) => R1, f2: (a: A) => R2): R2;
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

export type Predicate<T> = (v: T) => boolean;

/** Or operator over predicates */
export const orP =
    <T>(...ps: Predicate<T>[]): Predicate<T> =>
    (v) =>
        any((p) => p(v), ps);
/** And operator over predicates */
export const andP =
    <T>(...ps: Predicate<T>[]): Predicate<T> =>
    (v) =>
        all((p) => p(v), ps);

/** Returns whether a value is a valid react node
 *
 * A react node is defined here: https://reactnative.dev/docs/react-node
 */
// eslint-disable-next-line lodash-fp/no-extraneous-function-wrapping
export function isValidNode(v: unknown): v is React.ReactNode {
    return orP<unknown>(
        isBoolean,
        isNull,
        isUndefined,
        isString,
        isNumber,
        // TS fails to check using andP, hence arrow functions
        (_v) => isObject(_v) && isValidElement(_v),
        (_v) => isArray(_v) && all(isValidNode, _v)
    )(v);
}

/** Handle Promise by catching potential error */
export const dispatch = (promise: Promise<unknown>): void => {
    promise.catch((err) => {
        throw err;
    });
};

/** Log a value and return it */
export function logId<T>(arg: T): T {
    // eslint-disable-next-line no-console
    console.log(arg);
    return arg;
}

/** Log a value with a message and return it */
export const logWith =
    (msg: string) =>
    <T>(arg: T): T => {
        // eslint-disable-next-line no-console
        console.log(msg, arg);
        return arg;
    };
