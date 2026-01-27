import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import AssertionError from "assertion-error";
import { assert } from "chai";

let awaited: () => true;

beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    assert.isUndefined(true);
    awaited = true;
});

test("async function should be awaited", () => {
    expect(awaited()).toBe(true);
});
