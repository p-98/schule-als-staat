import { GraphQLError, type GraphQLErrorExtensions } from "graphql";
import { is, string, type Is } from "Util/misc";

/** Conveniently represents flow's "Maybe" type https://flow.org/en/docs/types/maybe/ */
type Maybe<T> = null | undefined | T;

export class GraphQLYogaError extends GraphQLError {
    constructor(message: string, extensions: Maybe<GraphQLErrorExtensions>) {
        super(message, { extensions });
    }
}

export function assert(
    condition: boolean,
    message: string,
    code: string
): asserts condition {
    if (!condition) throw new GraphQLError(message, { extensions: { code } });
}
export function fail(message: string, code: string): never {
    assert(false, message, code);
}

export type SqliteErrorLike = { message: string; code: string };
export const isSqliteErrorLike: Is<SqliteErrorLike> = is({
    message: string,
    code: string,
} as const);

export const isSqliteForeignKeyError = (_: unknown): boolean =>
    isSqliteErrorLike(_) &&
    _.message.endsWith("SQLITE_CONSTRAINT: FOREIGN KEY constraint failed");

export const isSqlitePrimaryKeyError = (_: unknown): boolean =>
    isSqliteErrorLike(_) &&
    _.message.includes("SQLITE_CONSTRAINT: UNIQUE constraint failed");
