import { test } from "@jest/globals";
import assert, { AssertionError } from "node:assert";

test("manual assertion error", () => {
    const genErr = () =>
        new AssertionError({
            expected: [1, 2],
            actual: [1, 3],
            operator: "strictEqual",
            stackStartFn: genErr,
        });
    const err = genErr();
    console.log(err);
    throw err;
});

test("node assertion error", () => {
    try {
        assert.deepStrictEqual([1, 2], [1, 3]);
    } catch (err) {
        console.log(err);
        throw err;
    }
});
