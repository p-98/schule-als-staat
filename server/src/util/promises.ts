type MaybePromise<T> = T | Promise<T>;

/**
 * Creates a Promise that is resolved with an array of results when all of the provided Promises
 * resolve, or rejected when any Promise is rejected.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export const all: (typeof Promise)["all"] = (values: unknown[]) =>
    Promise.all(values);

/**
 * Creates a Promise that is resolved with an array of results when all
 * of the provided Promises resolve or reject.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export const allSettled: (typeof Promise)["allSettled"] = (values: unknown[]) =>
    Promise.allSettled(values);

/**
 * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
 * @param values An array or iterable of Promises.
 * @returns A new Promise.
 */
export const any: (typeof Promise)["any"] = (values: unknown[]) =>
    Promise.any(values);

/**
 * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
 * or rejected.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export const race: (typeof Promise)["race"] = (values: unknown[]) =>
    Promise.race(values);

/**
 * Creates a new rejected promise for the provided reason.
 * @param reason The reason the promise was rejected.
 * @returns A new rejected Promise.
 */
export const reject: (typeof Promise)["reject"] = (reason: unknown) =>
    Promise.reject(reason);

/**
 * Creates a new resolved promise for the provided value.
 * @param value A promise.
 * @returns A promise whose internal state matches the provided promise.
 */
export const resolve: (typeof Promise)["resolve"] = <T>(reason?: T) =>
    Promise.resolve(reason);

/**
 * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
 * @returns An object with the properties `promise`, `resolve`, and `reject`.
 *
 * ```ts
 * const { promise, resolve, reject } = Promise.withResolvers<T>();
 * ```
 */
export const withResolvers: (typeof Promise)["withResolvers"] = () =>
    Promise.withResolvers();

interface Pipe1 {
    <A, R1>(a: MaybePromise<A>, f1: (a: A) => MaybePromise<R1>): Promise<R1>;
    <A, R1, R2>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>
    ): Promise<R2>;
    <A, R1, R2, R3>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>,
        f3: (a: R2) => MaybePromise<R3>
    ): Promise<R3>;
    <A, R1, R2, R3, R4>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>,
        f3: (a: R2) => MaybePromise<R3>,
        f4: (a: R3) => MaybePromise<R4>
    ): Promise<R4>;
    <A, R1, R2, R3, R4, R5>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>,
        f3: (a: R2) => MaybePromise<R3>,
        f4: (a: R3) => MaybePromise<R4>,
        f5: (a: R4) => MaybePromise<R5>
    ): Promise<R5>;
    <A, R1, R2, R3, R4, R5, R6>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>,
        f3: (a: R2) => MaybePromise<R3>,
        f4: (a: R3) => MaybePromise<R4>,
        f5: (a: R4) => MaybePromise<R5>,
        f6: (a: R5) => MaybePromise<R6>
    ): Promise<R6>;
    <A, R1, R2, R3, R4, R5, R6, R7>(
        a: MaybePromise<A>,
        f1: (a: A) => MaybePromise<R1>,
        f2: (a: R1) => MaybePromise<R2>,
        f3: (a: R2) => MaybePromise<R3>,
        f4: (a: R3) => MaybePromise<R4>,
        f5: (a: R4) => MaybePromise<R5>,
        f6: (a: R5) => MaybePromise<R6>,
        f7: (a: R6) => MaybePromise<R7>
    ): Promise<R7>;
    (arg: unknown, ...fs: ((_: unknown) => unknown)[]): Promise<unknown>;
}
export const pipe1: Pipe1 = (
    arg: unknown,
    ...fs: ((_: unknown) => unknown)[]
): Promise<unknown> => fs.reduce((res, f) => res.then(f), Promise.resolve(arg));
