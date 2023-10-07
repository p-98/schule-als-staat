import { test } from "@jest/globals";
import { assert } from "chai";

import {
    formatDateTimeZ,
    formatDateZ,
    formatTimeZ,
    openingHours,
} from "Util/date";
import type config from "Config";

const date = new Date("2023-04-18T18:24:07.177Z");

test("formatDateTimeZ", () =>
    assert.strictEqual(formatDateTimeZ(date), "2023-04-18T18:24:07.177Z"));

test("formatDateZ", () => assert.strictEqual(formatDateZ(date), "2023-04-18"));

test("formatTimeZ", () =>
    assert.strictEqual(formatTimeZ(date), "18:24:07.177Z"));

test("openingHours full hours", () => {
    const conf = {
        openingHours: {
            open: "12:00:00.000+02:00",
            close: "14:00:00.000+02:00",
        },
    } as typeof config;

    const result = openingHours(conf, "2023-10-07");
    assert.deepStrictEqual(result, [
        ["2023-10-07T10:00:00.000Z", "2023-10-07T10:59:59.999Z"],
        ["2023-10-07T11:00:00.000Z", "2023-10-07T11:59:59.999Z"],
    ]);
});

test("openingHours half hours", () => {
    const conf = {
        openingHours: {
            open: "12:30:00.000+02:00",
            close: "14:30:00.000+02:00",
        },
    } as typeof config;

    const result = openingHours(conf, "2023-10-07");
    assert.deepStrictEqual(result, [
        ["2023-10-07T10:00:00.000Z", "2023-10-07T10:59:59.999Z"],
        ["2023-10-07T11:00:00.000Z", "2023-10-07T11:59:59.999Z"],
        ["2023-10-07T12:00:00.000Z", "2023-10-07T12:59:59.999Z"],
    ]);
});
