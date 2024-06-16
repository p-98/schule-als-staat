import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    assertInvalid,
    type TUserExecutor,
    createTestServer,
    config,
} from "Util/test";

import { type ResultOf } from "@graphql-typed-document-node/core";
import { type Unarray } from "@envelop/types";
import { pick } from "lodash/fp";
import { type TNullable } from "Types";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { graphql } from "./graphql";

const citizensByClassQuery = graphql(/* GraphQL */ `
    query CitizensByClassQuery($class: String!) {
        citizensByClass(class: $class) {
            id
        }
    }
`);

type IdCitizen = Unarray<
    ResultOf<typeof citizensByClassQuery>["citizensByClass"]
>;

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let teacher: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    teacher = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.roles.teacherCitizenIds[0],
    });
});
afterEach(async () => {
    await knex.destroy();
});

async function testCitizensByClass(classs: string): Promise<IdCitizen[]> {
    // invalid request
    const noTeacher = await citizen({
        document: citizensByClassQuery,
        variables: { class: classs },
    });
    assertInvalid(noTeacher, "PERMISSION_DENIED");

    // valid request
    const result = await teacher({
        document: citizensByClassQuery,
        variables: { class: classs },
    });
    assertSingleValue(result);
    assertNoErrors(result);
    return result.data.citizensByClass;
}

test("citizensByClass", async () => {
    const seedCitizen = (classs?: TNullable<string>) =>
        buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN", class: classs });

    /* const citizen1 = */ await seedCitizen();
    const citizen2 = await seedCitizen("5a");
    const citizen3 = await seedCitizen("5a");
    /* const citizen4 = */ await seedCitizen("5b");

    const class5a = await testCitizensByClass("5a");
    const expected5a = [citizen2, citizen3].map(pick("id"));
    assert.deepEqual(class5a, expected5a);
});
