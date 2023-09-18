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
    fragment All_EmploymentFragment on Employment {
        id
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

const EmploymentAndOffersCitizenQuery = graphql(/* GraphQL */ `
    query EmploymentOffersCitizen {
        meCitizen {
            employmentOffers {
                ...All_EmploymentOfferFragment
            }
            employment {
                ...All_EmploymentFragment
            }
        }
    }
`);
const EmploymentAndOffersCompanyQuery = graphql(/* GraphQL */ `
    query EmploymentOffersCompany {
        meCompany {
            pendingOffers: employmentOffers(state: PENDING) {
                ...All_EmploymentOfferFragment
            }
            rejectedOffers: employmentOffers(state: REJECTED) {
                ...All_EmploymentOfferFragment
            }
            employees {
                ...All_EmploymentFragment
            }
        }
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

    const emptyCitizen = await execCitizen({
        document: EmploymentAndOffersCitizenQuery,
    });
    assertSingleValue(emptyCitizen);
    assertNoErrors(emptyCitizen);
    assert.deepStrictEqual(
        emptyCitizen.data.meCitizen,
        { employmentOffers: [], employment: null },
        "Employment and pending offers must be empty at beginning"
    );
    const emptyCompany = await execCompany({
        document: EmploymentAndOffersCompanyQuery,
    });
    assertSingleValue(emptyCompany);
    assertNoErrors(emptyCompany);
    assert.deepStrictEqual(
        emptyCompany.data.meCompany,
        { pendingOffers: [], rejectedOffers: [], employees: [] },
        "Employments and pending offers must be empty at beginning"
    );

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

    const pendingCitizen = await execCitizen({
        document: EmploymentAndOffersCitizenQuery,
    });
    assertSingleValue(pendingCitizen);
    assertNoErrors(pendingCitizen);
    assert.deepStrictEqual(
        pendingCitizen.data.meCitizen,
        { employmentOffers: [offer], employment: null },
        "Pending EmploymentOffers must only be the created one"
    );
    const pendingCompany = await execCompany({
        document: EmploymentAndOffersCompanyQuery,
    });
    assertSingleValue(pendingCompany);
    assertNoErrors(pendingCompany);
    assert.deepStrictEqual(
        pendingCompany.data.meCompany,
        { pendingOffers: [offer], rejectedOffers: [], employees: [] },
        "Pending EmploymentOffers must only be the created one"
    );

    const accept = await execCitizen({
        document: graphql(/* GraphQL */ `
            mutation AcceptOffer($id: Int!) {
                acceptEmploymentOffer(id: $id) {
                    ...All_EmploymentFragment
                }
            }
        `),
        variables: { id: offer.id },
    });
    assertSingleValue(accept);
    assertNoErrors(accept);
    const employment = accept.data.acceptEmploymentOffer;
    assert.deepStrictEqual(omit("id", employment), {
        company: { id: companyCredentials.id },
        citizen: { id: citizenCredentials.id },
        worktimeToday: 0,
        worktimeYesterday: 0,
        salary,
        minWorktime,
    });

    const acceptedCitizen = await execCitizen({
        document: EmploymentAndOffersCitizenQuery,
    });
    assertSingleValue(acceptedCitizen);
    assertNoErrors(acceptedCitizen);
    assert.deepStrictEqual(
        acceptedCitizen.data.meCitizen,
        { employmentOffers: [], employment },
        "Pending EmploymentOffers must be empty after accepting"
    );
    const acceptedCompany = await execCompany({
        document: EmploymentAndOffersCompanyQuery,
    });
    assertSingleValue(acceptedCompany);
    assertNoErrors(acceptedCompany);
    assert.deepStrictEqual(
        acceptedCompany.data.meCompany,
        { pendingOffers: [], rejectedOffers: [], employees: [employment] },
        "Pending EmploymentOffers must be empty after accepting"
    );
});
