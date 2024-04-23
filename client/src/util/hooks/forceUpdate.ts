import { pipe } from "lodash/fp";
import { type Dispatch, type SetStateAction, useState, useMemo } from "react";

export const useForceUpdate = (): (() => void) => {
    const [, setCounter] = useState(0);
    return () => setCounter((_counter) => _counter + 1);
};

/** Wrap type in 1-Tuple */
type TWrap<T> = [T];
/** Wrap every element type in 1-Tuple */
type TWrapArray<T> = T extends [infer E, ...infer Es]
    ? [TWrap<E>, ...TWrapArray<Es>]
    : T extends []
    ? []
    : never;
/** Wrap value in 1-Tuple */
const wrap = <T>(_: T): TWrap<T> => [_];
// /** Wrap every element in 1-Tuple */
// const wrapArray = <T extends unknown[]>(_: T): TWrapArray<T> =>
//     _.map(wrap) as TWrapArray<T>;
/** Unwrap elememnt from 1-Tuple */
const unwrap = <T>(_: TWrap<T>) => _[0];
/** Unwrap every elememnt from 1-Tuple */
const unwrapArray = <T extends unknown[]>(_: TWrapArray<T>): T =>
    _.map(unwrap) as T;
/** Lift function to work with 1-Tuples.
 *
 * Every arguement and the return value are wrapped in 1-tuples
 */
const lift =
    <As extends unknown[], R>(f: (...args: As) => R) =>
    (...args: TWrapArray<As>): TWrap<R> =>
        wrap(f(...unwrapArray(args)));
/** Lift if vOrF is a function or wrap otherwise. */
const wrapOrLift = <As extends unknown[], T>(
    vOrF: T | ((...args: As) => T)
): TWrap<T> | ((...args: TWrapArray<As>) => TWrap<T>) => {
    if (typeof vOrF === "function") return lift(vOrF as (...args: As) => T);
    return wrap(vOrF);
};
/** Like useState, but forces update on every set call
 *
 * Works by wrapping value in an array.
 */
export function useUpdateState<S>(
    initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];
export function useUpdateState<S = undefined>(): [
    S | undefined,
    Dispatch<SetStateAction<S | undefined>>
];
export function useUpdateState<S>(
    initialState?: (() => S) | S
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
    const [state, setState] = useState(wrapOrLift(initialState));
    return [unwrap(state), useMemo(() => pipe(wrapOrLift, setState), [])];
}
// // alternative definition 1
// function useUpdateState<S>(
//     initialState?: (() => S) | S
// ): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
//     type TState = S | undefined;
//     const [state, setState] = useState<[TState]>(
//         typeof initialState === "function"
//             ? () => [(initialState as () => TState)()]
//             : [initialState]
//     );
//     return [
//         state[0],
//         (nextState) =>
//             setState(
//                 typeof nextState === "function"
//                     ? (_) => [(nextState as (_: TState) => TState)(_[0])]
//                     : [nextState]
//             ),
//     ];
// }
// // alternative definition 2
// const useUpdateState: typeof useState = (initialState) => {
//     const [state, setState] = useState(initialState);
//     const forceUpdate = useForceUpdate();
//     return [
//         state,
//         (_) => {
//             setState(_);
//             forceUpdate();
//         },
//     ];
// };
