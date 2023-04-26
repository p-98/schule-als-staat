import { test } from "@jest/globals";
import { assert } from "chai";

import { formatDateTimeZ, formatDateZ, formatTimeZ } from "Util/date";

const date = new Date("2023-04-18T18:24:07.177Z");

test("formatDateTimeZ", () =>
    assert.strictEqual(formatDateTimeZ(date), "2023-04-18T18:24:07.177Z"));

test("formatDateZ", () => assert.strictEqual(formatDateZ(date), "2023-04-18"));

test("formatTimeZ", () =>
    assert.strictEqual(formatTimeZ(date), "18:24:07.177Z"));
