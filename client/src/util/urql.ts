import { Client, cacheExchange, fetchExchange, type CombinedError } from "urql";
import { type GraphQLError } from "graphql";
import { all, constant, curry, isUndefined, map } from "lodash/fp";
import { useMemo } from "react";

import { inOperator } from "Utility/types";
import config from "Config";
import { notifyUnexpectedError } from "Utility/notifications";

export const client = new Client({
    url: config.server.url,
    exchanges: [cacheExchange, fetchExchange],
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

export type TGraphQLError<Ext> = GraphQLError & { extensions: Ext };

/** Determine whether an urql error is an graphql error with specific code
 *
 * @example
 * const [{ data, fetching, error }, ...] = useMutation(...)
 * // has type TGraphQLError<{code: string}> | undefined
 * const wrongPassword = byCode("WRONG_PASSWORD", error)
 *
 * @param error the error obtained by urql
 * @param code the code by which to filter, can also be a function
 * @returns
 */
export const byCode = curry(
    (
        code: string | ((_: string) => boolean),
        error: CombinedError | undefined
    ): TGraphQLError<{ code: string }> | undefined => {
        if (!error) return undefined;
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
    }
);

export type TErrorFilter = (
    error: CombinedError | undefined
) => TGraphQLError<{ code: string }> | undefined;
/** Categorize an unknown error and notify user if unexpected
 *
 * @param error the error to categorize
 * @param categories the functions matched against.
 */
export const categorizeError = (
    error: CombinedError | undefined,
    categories: TErrorFilter[]
): (TGraphQLError<{ code: string }> | undefined)[] => {
    if (!error) return map(constant(undefined), categories);

    const categorized = map((f) => f(error), categories);
    if (all(isUndefined, categorized)) {
        // eslint-disable-next-line no-console
        console.error("Unexpected error: ", error);
        notifyUnexpectedError();
    }
    return categorized;
};
/** Categorize an unknown error and notify user if unexpected
 *
 * @param error the error to categorize
 * @param categories the functions matched against. Must not change, since it doesn't rerender the compoenent!
 */
export const useCategorizeError = (
    error: CombinedError | undefined,
    categories: TErrorFilter[]
): (TGraphQLError<{ code: string }> | undefined)[] =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => categorizeError(error, categories), [error]);
