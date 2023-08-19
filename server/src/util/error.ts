import { GraphQLError, GraphQLErrorExtensions } from "graphql";

/** Conveniently represents flow's "Maybe" type https://flow.org/en/docs/types/maybe/ */
type Maybe<T> = null | undefined | T;

export class GraphQLYogaError extends GraphQLError {
    constructor(message: string, extensions: Maybe<GraphQLErrorExtensions>) {
        super(message, { extensions });
    }
}
