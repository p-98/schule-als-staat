import { GraphQLError, GraphQLErrorExtensions } from "graphql";
import { inOperator } from "Types";

/** Conveniently represents flow's "Maybe" type https://flow.org/en/docs/types/maybe/ */
type Maybe<T> = null | undefined | T;

export class GraphQLYogaError extends GraphQLError {
    constructor(message: string, extensions: Maybe<GraphQLErrorExtensions>) {
        super(message, { extensions });
    }
}

export const hasCode = (obj: unknown): obj is { code: string } =>
    typeof obj === "object" &&
    obj !== null &&
    inOperator("code", obj) &&
    typeof obj.code === "string";
