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
const companiesQuery = graphql(/* GrahQL */ `
    query CompaniesQuery {
        companies {
            type
            id
        }
    }
`);

type IdCitizen = Unarray<
    ResultOf<typeof citizensByClassQuery>["citizensByClass"]
>;
type SignatureCompany = Unarray<
    ResultOf<typeof citizensByClassQuery>["citizensByClass"]
>;

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let teacher: TUserExecutor;
let company: TUserExecutor;
let taxOffice: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    teacher = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.roles.teacherCitizenIds[0],
    });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    taxOffice = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.taxOfficeCompanyId,
    });
});
afterEach(async () => {
    await knex.destroy();
});

async function testCitizensByClass(classs: string): Promise<IdCitizen[]> {
    // invalid requests
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
async function testCompanies(): Promise<SignatureCompany[]> {
    // invalid requests
    const noTaxOffice = await company({ document: companiesQuery });
    assertInvalid(noTaxOffice, "PERMISSION_DENIED");

    // valid request
    const result = await taxOffice({ document: companiesQuery });
    assertSingleValue(result);
    assertNoErrors(result);
    return result.data.companies;
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
    assert.deepStrictEqual(class5a, expected5a);
});
test("companies", async () => {
    const companies = await testCompanies();
    assert.deepStrictEqual(companies, [company.signature, taxOffice.signature]);
});
