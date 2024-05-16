import type { Knex } from "knex";
import { afterEach, beforeEach, describe, test } from "@jest/globals";
import { assert } from "chai";

import { emptyKnex } from "Database";
import { seedSourceFactory, withSpecific } from "Util/test";

const singleData = { id: "accountId", balance: 0, redemptionBalance: 0 };
const batchData = [
    { id: "accountId2", balance: 0, redemptionBalance: 0 },
    { id: "accountId3", balance: 0, redemptionBalance: 0 },
];

const seedSource = seedSourceFactory({
    "single-insert": (knex) => knex("bankAccounts").insert(singleData),
    "batch-insert": (knex) => knex("bankAccounts").insert(batchData),
});

describe("database functionality", () => {
    let knex: Knex;

    beforeEach(async () => {
        [, knex] = await emptyKnex();
    });
    afterEach(async () => {
        await knex.destroy();
    });

    test("db insert & read", async () => {
        await knex("bankAccounts").insert(singleData);

        const [result] = await knex("bankAccounts").select("*");
        assert.deepStrictEqual(result, singleData);
    });

    test("db seed & read", async () => {
        await knex.seed.run({ seedSource });

        const result = await knex("bankAccounts").select("*");
        assert.deepStrictEqual(result, [singleData, ...batchData]);
    });
    test("db seed specific & read", async () => {
        await knex.seed.run(withSpecific({ seedSource }, "single-insert"));

        const [result] = await knex("bankAccounts").select("*");
        assert.deepStrictEqual(result, singleData);
    });
});
