import { test, beforeEach, afterEach, jest } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
    createTestServer,
    config,
} from "Util/test";

import { type Unarray } from "@envelop/types";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { multiply, pick, pipe } from "lodash/fp";
import { addHours, subHours } from "date-fns/fp";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { formatDateTimeZ } from "Util/date";
import { mapValues, moveKeys } from "Util/misc";
import { graphql } from "./graphql";

/* General helpers
 */
/** Hours to seconds */
const hours = multiply(3600);

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
const leaveAllCitizensMutation = graphql(/* GraphQL */ `
    mutation LeaveAllCitizensMutation {
        leaveAllCitizens {
            citizen {
                id
            }
            enteredAt
            leftAt
        }
    }
`);
const inStateQuery = graphql(/* GraphQL */ `
    query InStateQuery {
        meCitizen {
            isInState
            timeInState
        }
    }
`);

type TBorderCrossing = ResultOf<
    typeof registerCrossingMutation
>["registerBorderCrossing"];
type TStay = Unarray<
    ResultOf<typeof leaveAllCitizensMutation>["leaveAllCitizens"]
>;
type TInStateState = ResultOf<typeof inStateQuery>["meCitizen"];

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let otherCitizen: TUserExecutor;
let company: TUserExecutor;
let borderControl: TUserExecutor;
let admin: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    otherCitizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.borderControlCompanyId,
    });
    admin = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.roles.adminCitizenIds[0],
    });
});
afterEach(async () => {
    jest.useRealTimers();
    await knex.destroy();
});

const assertInState = (user: TUserExecutor) => async (state: TInStateState) => {
    const result = await user({ document: inStateQuery });
    assertSingleValue(result);
    assertNoErrors(result);
    assert.deepStrictEqual(result.data.meCitizen, state);
};

async function testRegisterCrossing(
    citizenId: string
): Promise<TBorderCrossing> {
    // invalid requests
    const noBorderControl = await company({
        document: registerCrossingMutation,
        variables: { citizenId },
    });
    assertInvalid(noBorderControl, "PERMISSION_DENIED");
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
async function tsetLeaveAllCitizens(): Promise<TStay[]> {
    // invalid requests
    const noAdmin = await borderControl({ document: leaveAllCitizensMutation });
    assertInvalid(noAdmin, "PERMISSION_DENIED");

    // valid request
    const leaveAll = await admin({ document: leaveAllCitizensMutation });
    assertSingleValue(leaveAll);
    assertNoErrors(leaveAll);
    return leaveAll.data.leaveAllCitizens;
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
    jest.setSystemTime(new Date(beforeSecond));
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
    jest.setSystemTime(new Date(time2));
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

test("leave all citizens", async () => {
    const citizen3 = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
    });
    const enteredAt = "2024-03-10T09:00:00.000Z";
    const callAt = "2024-03-10T16:00:00.000Z";
    const stays = [
        {
            // no completed stays
            citizenId: citizen.id,
            enteredAt,
            leftAt: null,
        },
        {
            // completed stays
            citizenId: otherCitizen.id,
            enteredAt,
            leftAt: formatDateTimeZ(addHours(1, new Date(enteredAt))),
        },
        {
            citizenId: otherCitizen.id,
            enteredAt: formatDateTimeZ(addHours(2, new Date(enteredAt))),
            leftAt: null,
        },
        {
            // no uncompleted stays
            citizenId: citizen3.id,
            enteredAt,
            leftAt: formatDateTimeZ(addHours(1, new Date(enteredAt))),
        },
        {
            citizenId: citizen3.id,
            enteredAt: formatDateTimeZ(addHours(2, new Date(enteredAt))),
            leftAt: formatDateTimeZ(addHours(3, new Date(enteredAt))),
        },
    ];
    await knex("stays").insert(stays);

    jest.useFakeTimers({
        advanceTimers: false,
        now: new Date(callAt),
    });
    const response = await tsetLeaveAllCitizens();
    const updatedStays = await knex("stays").select(
        "citizenId",
        "enteredAt",
        "leftAt"
    );
    assert.deepStrictEqual(
        updatedStays,
        stays.map(mapValues({ leftAt: (_: string | null) => _ ?? callAt }))
    );
    assert.deepStrictEqual(
        response,
        [updatedStays[0]!, updatedStays[2]!].map(
            pipe(
                moveKeys({ citizen: "citizenId" } as const),
                mapValues({ citizen: (_) => ({ id: _ }) })
            )
        )
    );
});

test("isInState, timeInState", async () => {
    const citizen2 = otherCitizen;
    const citizen3 = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
    });
    const citizen4 = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
    });
    const enteredAt = "2024-03-10T09:00:00.000Z";
    const callAt = "2024-03-10T15:00:00.000Z";
    const stays = [
        {
            // no completed stays
            citizenId: citizen.id,
            enteredAt,
            leftAt: null,
        },
        {
            // completed stays
            citizenId: citizen2.id,
            enteredAt,
            leftAt: formatDateTimeZ(addHours(1, new Date(enteredAt))),
        },
        {
            citizenId: citizen2.id,
            enteredAt: formatDateTimeZ(addHours(2, new Date(enteredAt))),
            leftAt: null,
        },
        {
            // no uncompleted stays
            citizenId: citizen3.id,
            enteredAt,
            leftAt: formatDateTimeZ(addHours(1, new Date(enteredAt))),
        },
        {
            citizenId: citizen3.id,
            enteredAt: formatDateTimeZ(addHours(2, new Date(enteredAt))),
            leftAt: formatDateTimeZ(addHours(3, new Date(enteredAt))),
        },
        {
            // stays in past day, one not even ended
            citizenId: citizen4.id,
            enteredAt: formatDateTimeZ(subHours(24, new Date(enteredAt))),
            leftAt: formatDateTimeZ(subHours(23, new Date(enteredAt))),
        },
        {
            citizenId: citizen4.id,
            enteredAt: formatDateTimeZ(subHours(22, new Date(enteredAt))),
            leftAt: null,
        },
    ];
    await knex("stays").insert(stays);

    jest.useFakeTimers({
        advanceTimers: false,
        now: new Date(callAt),
    });
    await assertInState(citizen)({ isInState: true, timeInState: hours(6) });
    await assertInState(citizen2)({ isInState: true, timeInState: hours(5) });
    await assertInState(citizen3)({ isInState: false, timeInState: hours(2) });
    await assertInState(citizen4)({ isInState: false, timeInState: hours(0) });
});
