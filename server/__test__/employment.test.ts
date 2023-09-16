import { test } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    seedSourceFactory,
    withSpecific,
    buildHTTPCookieExecutor,
} from "Util/test";

import bcrypt from "bcrypt";
import { yogaFactory } from "Server";
import { emptyKnex } from "Database";
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

const loginMutation = graphql(/* GraphQL */ `
    mutation Login($type: UserType!, $id: String!, $password: String) {
        login(user: { type: $type, id: $id }, password: $password) {
            id
        }
    }
`);

test("create and accept", async () => {
    const knex = await emptyKnex();
    await knex.seed.run(withSpecific({ seedSource }, "citizen-company"));
    const yoga = yogaFactory(knex);

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
                $salary: Float! = 1.0
                $minWorktime: Int! = 3600
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
        variables: { citizenId: citizenCredentials.id },
    });
    assertSingleValue(create);
    assertNoErrors(create);
    const offer = create.data.createEmploymentOffer;
    assert.deepStrictEqual(offer, {
        id: 1,
        company: { id: companyCredentials.id },
        citizen: { id: citizenCredentials.id },
        state: "PENDING",
        salary: 1.0,
        minWorktime: 3600,
    });

    const accepted = await execCitizen({
        document: graphql(/* GraphQL */ `
            mutation AcceptOffer($id: Int!) {
                acceptEmploymentOffer(id: $id) {
                    ...All_EmploymentOfferFragment
                }
            }
        `),
        variables: offer,
    });
    assertSingleValue(accepted);
    assertNoErrors(accepted);
    assert.deepStrictEqual(accepted.data.acceptEmploymentOffer, {
        ...offer,
        state: "ACCEPTED",
    });

    await knex.destroy();
});
