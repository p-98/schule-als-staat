import { curry } from "lodash/fp";

import { GraphQLYogaError } from "Util/error";
import { throv } from "Util/misc";

interface Assert {
    <T, C extends T>(
        condition: ((_: T) => _ is C) | ((_: T) => boolean),
        message: string,
        code: string
    ): <U extends T>(value: U) => U & C;
}
export const assert: Assert = curry(
    (cond: (_: unknown) => boolean, msg: string, code: string, val: unknown) =>
        cond(val)
            ? val
            : throv(new GraphQLYogaError(msg, { extensions: { code } }))
);
