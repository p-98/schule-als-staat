import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    seedSourceFactory,
    withSpecific,
    buildHTTPCookieExecutor,
} from "Util/test";

import bcrypt from "bcrypt";
import { omit } from "lodash/fp";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import { graphql } from "./graphql";

const citizenCredentials = {
    type: "CITIZEN" as const,
    id: "citizenId1",
    password: "citizenPassword",
};
const companyCredentials = {
    type: "COMPANY" as const,
    id: "companyId1",
    password: "companyPassword",
};

const seedSource = seedSourceFactory({
    "citizen-company": async (knex) => {
        await knex("bankAccounts").insert([
            {
                id: "bankAccountId1",
                balance: 1.0,
                redemptionBalance: 0.0,
            },
            {
                id: "bankAccountId2",
                balance: 1.0,
                redemptionBalance: 0.0,
            },
        ]);
        await knex("citizens").insert({
            id: citizenCredentials.id,
            firstName: "Max",
            lastName: "Mustermann",
            bankAccountId: "bankAccountId1",
            image: "",
            password: await bcrypt.hash(citizenCredentials.password, 10),
        });
        await knex("companies").insert({
            id: companyCredentials.id,
            bankAccountId: "bankAccountId2",
            name: "Donuts Ltd.",
            password: await bcrypt.hash(companyCredentials.password, 10),
            image: "",
        });
    },
});

graphql(/* GraphQL */ `
    fragment All_EmploymentOfferFragment on EmploymentOffer {
        id
        company {
            id
        }
        citizen {
            id
        }
        state
        salary
        minWorktime
    }
`);
graphql(/* GraphQL */ `
    fragment NoId_EmploymentFragment on Employment {
        company {
            id
        }
        citizen {
            id
        }
        worktimeToday
        worktimeYesterday
        salary
        minWorktime
    }
`);

const loginMutation = graphql(/* GraphQL */ `
    mutation Login($type: UserType!, $id: String!, $password: String) {
        login(user: { type: $type, id: $id }, password: $password) {
            id
        }
    }
`);

let knex: Knex;
let yoga: TYogaServerInstance;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
});
afterEach(async () => {
    await knex.destroy();
});

test("create and accept", async () => {
    const salary = 1.0;
    const minWorktime = 3600;

    await knex.seed.run(withSpecific({ seedSource }, "citizen-company"));

    const execCitizen = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
    });
    const loginCitizen = await execCitizen({
        document: loginMutation,
        variables: citizenCredentials,
    });
    assertSingleValue(loginCitizen);
    assertNoErrors(loginCitizen);

    const execCompany = buildHTTPCookieExecutor({
        // below usage according to documentation (https://the-guild.dev/graphql/yoga-server/docs/features/testing#test-utility)
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fetch: yoga.fetch,
    });
    const loginCompany = await execCompany({
        document: loginMutation,
        variables: companyCredentials,
    });
    assertSingleValue(loginCompany);
    assertNoErrors(loginCompany);

    const create = await execCompany({
        document: graphql(/* GraphQL */ `
            mutation CreateOffer(
                $citizenId: ID!
                $salary: Float!
                $minWorktime: Int!
            ) {
                createEmploymentOffer(
                    offer: {
                        citizenId: $citizenId
                        salary: $salary
                        minWorktime: $minWorktime
                    }
                ) {
                    ...All_EmploymentOfferFragment
                }
            }
        `),
        variables: { citizenId: citizenCredentials.id, salary, minWorktime },
    });
    assertSingleValue(create);
    assertNoErrors(create);
    const offer = create.data.createEmploymentOffer;
    assert.deepStrictEqual(omit("id", offer), {
        company: { id: companyCredentials.id },
        citizen: { id: citizenCredentials.id },
        state: "PENDING",
        salary,
        minWorktime,
    });

    const accepted = await execCitizen({
        document: graphql(/* GraphQL */ `
            mutation AcceptOffer($id: Int!) {
                acceptEmploymentOffer(id: $id) {
                    ...NoId_EmploymentFragment
                }
            }
        `),
        variables: { id: offer.id },
    });
    assertSingleValue(accepted);
    assertNoErrors(accepted);
    assert.deepStrictEqual(accepted.data.acceptEmploymentOffer, {
        company: { id: companyCredentials.id },
        citizen: { id: citizenCredentials.id },
        worktimeToday: 0,
        worktimeYesterday: 0,
        salary,
        minWorktime,
    });
});
