import cn from "classnames";
import {
    type FC,
    type ReactNode,
    type PropsWithRef,
    type RefAttributes,
    type RefObject,
    forwardRef,
    isValidElement,
    memo,
} from "react";
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

export type Predicate<T> = (v: T) => boolean;

/** Or operator over predicates */
export const orP =
    <T,>(...ps: Predicate<T>[]): Predicate<T> =>
    (v) =>
        any((p) => p(v), ps);
/** And operator over predicates */
export const andP =
    <T,>(...ps: Predicate<T>[]): Predicate<T> =>
    (v) =>
        all((p) => p(v), ps);

/** Map over the first element of a tuple */
export const mapFst =
    <T, U, Ts extends unknown[]>(f: (fst: T) => U) =>
    ([fst, ...rest]: [T, ...Ts]): [U, ...Ts] =>
        [f(fst), ...rest];

export const mutableAssign =
    <T extends object>(target: T) =>
    (source: Partial<T>): void => {
        Object.assign(target, source);
    };

type CompareFn<T> = (a: T, b: T) => number;
/** Sort by using gt/lt after applying function  */
export const compareBy =
    <T, S>(f: (_: T) => S): CompareFn<T> =>
    (a, b) => {
        const fa = f(a);
        const fb = f(b);
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return 0;
    };

/* React utilities
 */

/* eslint-disable react/no-unused-prop-types */
interface FactoryProps {
    children?: ReactNode;
    className?: string;
}
type MemoFowardComponent<T, P> = FC<PropsWithRef<P & RefAttributes<T>>>;
export const componentFactory = (args?: {
    className?: string;
}): MemoFowardComponent<HTMLDivElement, FactoryProps> =>
    memo(
        forwardRef<HTMLDivElement, FactoryProps>(
            ({ children, className }, ref) => (
                <div ref={ref} className={cn(args?.className, className)}>
                    {children}
                </div>
            )
        )
    );
/* eslint-enable react/no-unused-prop-types */

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

/** Extract the value of a ref object
 *
 * Partial function! Fails if ref is null.
 */
export const unref = <T,>({ current }: RefObject<T>): Exclude<T, null> => {
    if (current === null) throw Error(`ref is null`);
    return current as Exclude<T, null>;
};

/* DOM utilities
 */

/** getElementsByClassName specialized to HTMLElements and unambiguous results  */
export const getByClass = (
    clas: string,
    element?: HTMLElement
): HTMLElement => {
    const [found0, found1] = (element ?? document).getElementsByClassName(clas);
    if (!found0) throw Error(`Element with class ${clas} not found`);
    if (found1) throw Error(`Element with class ${clas} not unique`);
    if (!(found0 instanceof HTMLElement))
        throw Error(`Element with class ${clas} not HTMLElement`);
    return found0;
};
/** getElementsByTagName specialized to HTMLElements and unambiguous results  */
export const getByTag = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    element?: HTMLElement
): HTMLElementTagNameMap[K] => {
    const [found0, found1] = (element ?? document).getElementsByTagName(tag);
    if (!found0) throw Error(`Element with tag ${tag} not found`);
    if (found1) throw Error(`Element with tag ${tag} not unique`);
    return found0;
};

/* Async utilities
 */

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

/** Wait for animation frame
 *
 * @example
 * // before
 * requestAnimationFrame(() => {
 *   // your code here
 * })
 *
 * // after
 * await animationFrame()
 * // your code here
 */
export const animationFrame = (): Promise<DOMHighResTimeStamp> =>
    new Promise(requestAnimationFrame);

/** Wait for given time */
export const time = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/** Wait until dom event is emitted */
export const event = <K extends keyof HTMLElementEventMap>(
    type: K,
    el: HTMLElement
): Promise<HTMLElementEventMap[K]> =>
    new Promise((resolve) => {
        const callback = (e: HTMLElementEventMap[K]) => {
            // cleanup after ourselves
            el.removeEventListener(type, callback);
            resolve(e);
        };
        el.addEventListener(type, callback);
    });

/* Logging utilities
 */

/** Log a value and return it */
export function logId<T>(arg: T): T {
    // eslint-disable-next-line no-console
    console.log(arg);
    return arg;
}

/** Log a value with a message and return it */
export const logWith =
    (msg: string) =>
    <T,>(arg: T): T => {
        // eslint-disable-next-line no-console
        console.log(msg, arg);
        return arg;
    };

/* DOM utilities
 */

/** Create a video look-alike based on the current frame
 *
 * Transfers the className.
 */
export function videoToCanvas(video: HTMLVideoElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.className = video.className;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return canvas;
}
