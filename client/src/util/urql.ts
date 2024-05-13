import { Client, cacheExchange, fetchExchange, CombinedError } from "urql";
import { type GraphQLError } from "graphql";
import { constant, identity, map } from "lodash/fp";
import { useEffect, useMemo, useState } from "react";

import { inOperator } from "Utility/types";
import config from "Config";
import { notifyUnexpectedError } from "Utility/notifications";

export const client = new Client({
    url: config.server.url,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
        credentials: "include",
    },
});

/** Make data and error mutually exclusive */
export const safeData = <T extends { data?: unknown; error?: unknown }>(
    result: T
): T => {
    if (result.error) return { ...result, data: undefined };
    return result;
};
/** Make data and error mutually exclusive */
export const useSafeData = <T extends { data?: unknown; error?: unknown }>(
    result: T
): T => useMemo(() => safeData(result), [result]);

/** Stabilize fetching state
 *
 * Only returns true when fetching has been set for a noticable amount of time.
 * Prevents flashing of loading ui.
 *
 * @example
 * if (useStable(fetching)) return <Loading />
 */
export const useStable = (fetching: boolean) => {
    const [stable, setStable] = useState(false);
    useEffect(() => {
        if (fetching !== true) {
            setStable(false);
            return;
        }
        const timer = setTimeout(() => setStable(true), 200);
        return () => clearTimeout(timer);
    }, [fetching]);
    return stable;
};

export type TGraphQLError<Ext> = GraphQLError & { extensions: Ext };
export type TCustomGraphQLError = TGraphQLError<{ code: string }>;

/** Determine whether an urql error is an graphql error with specific code
 *
 * Mainly for use with categorizeError
 *
 * @example
 * const [{ data, fetching, error }, ...] = useMutation(...)
 * // has type TGraphQLError<{code: string}> | undefined
 * const wrongPassword = byCode("WRONG_PASSWORD")(error)
 *
 * @param error the error obtained by urql
 * @param code the code by which to filter, can also be a function
 * @returns
 */
export const byCode =
    (code: string | ((_: string) => boolean)): TCategory<TCustomGraphQLError> =>
    (error: CombinedError): TGraphQLError<{ code: string }> | undefined => {
        const gqlError = error.graphQLErrors[0];
        if (!gqlError) return undefined;
        const { extensions } = gqlError;
        if (
            !inOperator("code", extensions) ||
            typeof extensions.code !== "string"
        )
            return undefined;

        if (typeof code === "function") {
            if (code(extensions.code) === false) return undefined;
        } else if (extensions.code !== code) return undefined;

        return gqlError as TGraphQLError<{ code: string }>;
    };
/** Match any graphql error
 *
 * Mainly for use with categorizeError.
 * Note that passing this category prevents the user being notified of an unexpected error!
 */
export const any: TCategory<CombinedError> = identity;

type TCategory<T> = (error: CombinedError) => T | undefined;
type TCategorised<Categories> = Categories extends [
    TCategory<infer T>,
    ...infer Tail
]
    ? readonly [T | undefined, ...TCategorised<Tail>]
    : [CombinedError | undefined];
/** Categorize an unknown error and notify user if none is matched
 *
 * Only the first match is respected, resulting in a 1-hot array
 *
 * @param error the error to categorize
 * @param categories the functions matched against.
 * @return array where the first matched category is set to the result. If none matched the error is passed as last element.
 */
export const categorizeError = <Categories extends TCategory<unknown>[]>(
    error: CombinedError | undefined,
    categories: [...Categories]
): TCategorised<Categories> => {
    if (!error)
        return map(constant(undefined), categories) as TCategorised<Categories>;

    const [categorized, found] = categories.reduce<[unknown[], boolean]>(
        ([cum, _found], f) => [
            [_found ? undefined : f(error), ...cum],
            _found || !!f(error),
        ],
        [[], false]
    );
    if (!found) {
        // eslint-disable-next-line no-console
        console.error("Unexpected error: ", error);
        notifyUnexpectedError();
    }
    return [
        ...categorized,
        found ? undefined : error,
    ] as TCategorised<Categories>;
};

// /** Categorize an unknown error and notify user if unexpected
//  *
//  * @param error the error to categorize
//  * @param categories the functions matched against.
//  */
// export const categorizeError = (
//     error: CombinedError | undefined,
//     categories: TErrorFilter[]
// )

/** Categorize an unknown error and notify user if unexpected
 *
 * @param error the error to categorize
 * @param categories the functions matched against. Must not change, since it doesn't rerender the compoenent!
 */
export const useCategorizeError = <Categories extends TCategory<unknown>[]>(
    error: CombinedError | undefined,
    categories: [...Categories]
): TCategorised<Categories> =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => categorizeError(error, categories), [error]);
