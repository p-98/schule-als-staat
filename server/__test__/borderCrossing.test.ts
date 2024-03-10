import { test, beforeEach, afterEach, jest } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
} from "Util/test";

import { pick } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import config from "Config";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment Id_CitizenFragment on CitizenUser {
        id
    }
`);

const registerCrossingMutation = graphql(/* GraphQL */ `
    mutation RegisterBorderCrossingMutation($citizenId: ID!) {
        registerBorderCrossing(citizenId: $citizenId) {
            citizen {
                ...Id_CitizenFragment
            }
            action
            date
        }
    }
`);

type TBorderCrossing = ResultOf<
    typeof registerCrossingMutation
>["registerBorderCrossing"];

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let otherCitizen: TUserExecutor;
let borderControl: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    otherCitizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.server.borderControlCompanyId,
    });
});
afterEach(async () => {
    await knex.destroy();
});

async function testRegisterCrossing(
    citizenId: string
): Promise<TBorderCrossing> {
    // invalid requests
    const invalidCitizenId = await borderControl({
        document: registerCrossingMutation,
        variables: { citizenId: "invalidCitizenId" },
    });
    assertInvalid(invalidCitizenId, "CITIZEN_NOT_FOUND");

    // valid request
    const registerCrossing = await borderControl({
        document: registerCrossingMutation,
        variables: { citizenId },
    });
    assertSingleValue(registerCrossing);
    assertNoErrors(registerCrossing);
    const borderCrossing = registerCrossing.data.registerBorderCrossing;
    return borderCrossing;
}

test("successive enter & leave", async () => {
    const beforeFirst = "2024-03-10T09:30:00.000Z";
    jest.useFakeTimers({ advanceTimers: false, now: new Date(beforeFirst) });
    const enter1 = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(enter1, {
        citizen: pick("id", citizen),
        action: "ENTER",
        date: beforeFirst,
    });

    const afterFirst = "2024-03-10T09:40:00.000Z";
    jest.setSystemTime(new Date(afterFirst));
    const leave1 = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(leave1, {
        citizen: pick("id", citizen),
        action: "LEAVE",
        date: afterFirst,
    });

    const beforeSecond = "2024-03-10T10:30:00.000Z";
    jest.useFakeTimers({ advanceTimers: false, now: new Date(beforeSecond) });
    const enter2 = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(enter2, {
        citizen: pick("id", citizen),
        action: "ENTER",
        date: beforeSecond,
    });

    const afterSecond = "2024-03-10T10:40:00.000Z";
    jest.setSystemTime(new Date(afterSecond));
    const leave2 = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(leave2, {
        citizen: pick("id", citizen),
        action: "LEAVE",
        date: afterSecond,
    });
});

test("parallel enter & leave", async () => {
    const time0 = "2024-03-10T09:30:00.000Z";
    jest.useFakeTimers({ advanceTimers: false, now: new Date(time0) });
    const enter = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(enter, {
        citizen: pick("id", citizen),
        action: "ENTER",
        date: time0,
    });

    const time1 = "2024-03-10T09:40:00.000Z";
    jest.setSystemTime(new Date(time1));
    const enterOther = await testRegisterCrossing(otherCitizen.id);
    assert.deepStrictEqual(enterOther, {
        citizen: pick("id", otherCitizen),
        action: "ENTER",
        date: time1,
    });

    const time2 = "2024-03-10T09:30:00.000Z";
    jest.useFakeTimers({ advanceTimers: false, now: new Date(time2) });
    const leaveOther = await testRegisterCrossing(otherCitizen.id);
    assert.deepStrictEqual(leaveOther, {
        citizen: pick("id", otherCitizen),
        action: "LEAVE",
        date: time2,
    });

    const time3 = "2024-03-10T09:40:00.000Z";
    jest.setSystemTime(new Date(time3));
    const leave = await testRegisterCrossing(citizen.id);
    assert.deepStrictEqual(leave, {
        citizen: pick("id", citizen),
        action: "LEAVE",
        date: time3,
    });
});
