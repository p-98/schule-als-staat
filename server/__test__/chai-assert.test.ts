import { test } from "@jest/globals";
import { AssertionError, assert } from "chai";
test("manual assertion error", () => {
    const genErr = () =>
        new AssertionError(
            "Nope.",
            {
                expected: [1, 2],
                actual: [1, 3],
                // operator: "strictEqual",
                // showDiff: true,
            },
            genErr
        );
    const err = genErr();
    console.log(err);
    throw err;
});

// test("node assertion error", () => {
//     try {
//         assert.deepStrictEqual([1, 2], [1, 3]);
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// });

const test = [1, 2, 3];
