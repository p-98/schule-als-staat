import { GraphQLError, GraphQLErrorExtensions } from "graphql";
import { inOperator } from "Types";
import { UserType } from "./graphql/graphql";

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

const userTypeStrings = {
    CITIZEN: "Bürger",
    COMPANY: "Unternehmen",
    GUEST: "Gast",
};
export const userTypeStr = (userType: UserType): string =>
    userTypeStrings[userType];
export const userStr = (_user: { type: UserType; id: string }): string =>
    `${userTypeStrings[_user.type]} mit id '${_user.id}'`;
