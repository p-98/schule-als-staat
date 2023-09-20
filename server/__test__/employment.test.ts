/* eslint-disable jest/expect-expect */
import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    assertSingleError,
} from "Util/test";

import { omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import { type UnPromise } from "Util/misc";
import { graphql } from "./graphql";

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
    query EmploymentAndOffersCitizen {
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
const EmploymentsAndOffersCompanyQuery = graphql(/* GraphQL */ `
    query EmploymentsAndOffersCompany {
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

const createOfferMutation = graphql(/* GraphQL */ `
    mutation CreateOffer($citizenId: ID!, $salary: Float!, $minWorktime: Int!) {
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
`);
const acceptOfferMutation = graphql(/* GraphQL */ `
    mutation AcceptOffer($id: Int!) {
        acceptEmploymentOffer(id: $id) {
            ...All_EmploymentFragment
        }
    }
`);
const rejectOfferMutation = graphql(/* GraphQL */ `
    mutation RejectOffer($id: Int!, $reason: String) {
        rejectEmploymentOffer(id: $id, reason: $reason) {
            ...All_EmploymentOfferFragment
        }
    }
`);
const deleteOfferMutation = graphql(/* GraphQL */ `
    mutation DeleteOffer($id: Int!) {
        deleteEmploymentOffer(id: $id)
    }
`);
const cancelEmploymentMutation = graphql(/* GraphQL */ `
    mutation CancelEmployment($id: Int!) {
        cancelEmployment(id: $id)
    }
`);

type IEmploymentOffer = ResultOf<
    typeof createOfferMutation
>["createEmploymentOffer"];
type IEmployment = ResultOf<
    typeof acceptOfferMutation
>["acceptEmploymentOffer"];
type ICitizenState = ResultOf<
    typeof EmploymentAndOffersCitizenQuery
>["meCitizen"];
type ICompanyState = ResultOf<
    typeof EmploymentsAndOffersCompanyQuery
>["meCompany"];

const minWorktime = 3600;
const salary = 1.0;
let knex: Knex;
let yoga: TYogaServerInstance;
type TUserExecutor = UnPromise<ReturnType<typeof buildHTTPUserExecutor>>;
let citizen: TUserExecutor;
let company: TUserExecutor;
let citizenWithIdOfCompany: TUserExecutor;
let companyWithIdOfCitizen: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    citizenWithIdOfCompany = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: company.id,
    });
    companyWithIdOfCitizen = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: citizen.id,
    });
});
afterEach(async () => {
    await knex.destroy();
});

const assertCitizenAndCompanyStates =
    (citizenExpected: ICitizenState, citizenMessage?: string) =>
    async (companyExpected: ICompanyState, companyMessage?: string) => {
        const citizenResult = await citizen({
            document: EmploymentAndOffersCitizenQuery,
        });
        assertSingleValue(citizenResult);
        assertNoErrors(citizenResult);
        assert.deepStrictEqual(
            citizenResult.data.meCitizen,
            citizenExpected,
            citizenMessage
        );

        const companyResult = await company({
            document: EmploymentsAndOffersCompanyQuery,
        });
        assertSingleValue(companyResult);
        assertNoErrors(companyResult);
        assert.deepStrictEqual(
            companyResult.data.meCompany,
            companyExpected,
            companyMessage
        );
    };
const assertInvalid = (
    actual: UnPromise<ReturnType<TUserExecutor>>,
    code: string
) => {
    assertSingleValue(actual);
    assertSingleError(actual);
    assert.strictEqual(actual.errors[0].extensions.code, code);
};

const testCreateOffer = async (): Promise<IEmploymentOffer> => {
    await assertCitizenAndCompanyStates(
        { employmentOffers: [], employment: null },
        "Employment and pending offers must be empty at beginning"
    )(
        { pendingOffers: [], rejectedOffers: [], employees: [] },
        "Employments and offers must be empty at beginning"
    );

    // invalid requests
    const invalidCitizenId = await company({
        document: createOfferMutation,
        variables: { citizenId: "invalidCitizenId", minWorktime, salary },
    });
    assertInvalid(invalidCitizenId, "CITIZEN_NOT_FOUND");
    const invalidMinWorktime = await company({
        document: createOfferMutation,
        variables: { citizenId: citizen.id, minWorktime: -1, salary },
    });
    assertInvalid(invalidMinWorktime, "BAD_USER_INPUT");
    const invalidSalary = await company({
        document: createOfferMutation,
        variables: { citizenId: citizen.id, minWorktime, salary: -1.0 },
    });
    assertInvalid(invalidSalary, "BAD_USER_INPUT");
    const wrongUserType = await citizen({
        document: createOfferMutation,
        variables: { citizenId: citizen.id, minWorktime, salary },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const createOffer = await company({
        document: createOfferMutation,
        variables: { citizenId: citizen.id, salary, minWorktime },
    });
    assertSingleValue(createOffer);
    assertNoErrors(createOffer);
    const offer = createOffer.data.createEmploymentOffer;
    assert.deepStrictEqual(omit("id", offer), {
        company: { id: company.id },
        citizen: { id: citizen.id },
        state: "PENDING",
        salary,
        minWorktime,
    });

    await assertCitizenAndCompanyStates(
        { employmentOffers: [offer], employment: null },
        "Pending EmploymentOffers must only be the created one"
    )(
        { pendingOffers: [offer], rejectedOffers: [], employees: [] },
        "Pending EmploymentOffers must only be the created one"
    );

    return offer;
};

const testAcceptOffer = async (): Promise<IEmployment> => {
    const offer = await testCreateOffer();

    // invalid requests
    const invalidId = await citizen({
        document: acceptOfferMutation,
        variables: { id: 404 },
    });
    assertInvalid(invalidId, "EMPLOYMENT_OFFER_NOT_FOUND");
    const wrongUserId = await citizenWithIdOfCompany({
        document: acceptOfferMutation,
        variables: { id: offer.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await companyWithIdOfCitizen({
        document: acceptOfferMutation,
        variables: { id: offer.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const acceptOffer = await citizen({
        document: acceptOfferMutation,
        variables: { id: offer.id },
    });
    assertSingleValue(acceptOffer);
    assertNoErrors(acceptOffer);
    const employment = acceptOffer.data.acceptEmploymentOffer;
    assert.deepStrictEqual(omit("id", employment), {
        company: { id: company.id },
        citizen: { id: citizen.id },
        worktimeToday: 0,
        worktimeYesterday: 0,
        salary,
        minWorktime,
    });

    await assertCitizenAndCompanyStates(
        { employmentOffers: [], employment },
        "Pending EmploymentOffers must be empty after accepting"
    )(
        { pendingOffers: [], rejectedOffers: [], employees: [employment] },
        "Pending EmploymentOffers must be empty and employment must be present after accepting"
    );

    return employment;
};

const testCancelEmployment = async (citizenOrCompany: TUserExecutor) => {
    const employment = await testAcceptOffer();

    // invalid requests
    const invalidId = await citizenOrCompany({
        document: cancelEmploymentMutation,
        variables: { id: 404 },
    });
    assertInvalid(invalidId, "EMPLOYMENT_NOT_FOUND");
    const wrongCitizenId = await citizenWithIdOfCompany({
        document: cancelEmploymentMutation,
        variables: { id: employment.id },
    });
    assertInvalid(wrongCitizenId, "PERMISSION_DENIED");
    const wrongCompanyId = await companyWithIdOfCitizen({
        document: cancelEmploymentMutation,
        variables: { id: employment.id },
    });
    assertInvalid(wrongCompanyId, "PERMISSION_DENIED");
    const guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
    const wrongUserType = await guest({
        document: cancelEmploymentMutation,
        variables: { id: employment.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const cancelEmployment = await citizenOrCompany({
        document: cancelEmploymentMutation,
        variables: { id: employment.id },
    });
    assertSingleValue(cancelEmployment);
    assertNoErrors(cancelEmployment);
    const cancelled = cancelEmployment.data.cancelEmployment;
    assert.strictEqual(cancelled, null);

    await assertCitizenAndCompanyStates(
        { employmentOffers: [], employment: null },
        "Employment and offers must be empty after cancelling"
    )(
        { pendingOffers: [], rejectedOffers: [], employees: [] },
        "Employments and offers must be empty after cancelling"
    );
};
test("create, accept, cancel by citizen", () => testCancelEmployment(citizen));
test("create, accept, cancel by company", () => testCancelEmployment(company));

const testRejectOffer = async (): Promise<IEmploymentOffer> => {
    const offer = await testCreateOffer();
    const reason = "reason for rejection";

    // invalid requests
    const invalidId = await citizen({
        document: rejectOfferMutation,
        variables: { id: 404, reason },
    });
    assertInvalid(invalidId, "EMPLOYMENT_OFFER_NOT_FOUND");
    const wrongUserId = await citizenWithIdOfCompany({
        document: rejectOfferMutation,
        variables: { id: offer.id, reason },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await companyWithIdOfCitizen({
        document: rejectOfferMutation,
        variables: { id: offer.id, reason },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const rejectOffer = await citizen({
        document: rejectOfferMutation,
        variables: { id: offer.id, reason },
    });
    assertSingleValue(rejectOffer);
    assertNoErrors(rejectOffer);
    const rejected = rejectOffer.data.rejectEmploymentOffer;
    assert.deepStrictEqual(rejected, { ...offer, state: "REJECTED" });

    await assertCitizenAndCompanyStates(
        { employmentOffers: [], employment: null },
        "Pending EmploymentOffers must be empty after rejecting"
    )(
        { pendingOffers: [], rejectedOffers: [rejected], employees: [] },
        "Pending EmploymentOffers must only be empty and rejected must be present after rejecting"
    );

    return offer;
};

const testDeleteOffer = async () => {
    const offer = await testRejectOffer();

    // invalid requests
    const invalidId = await company({
        document: deleteOfferMutation,
        variables: { id: 404 },
    });
    assertInvalid(invalidId, "EMPLOYMENT_OFFER_NOT_FOUND");
    const wrongUserId = await companyWithIdOfCitizen({
        document: deleteOfferMutation,
        variables: { id: offer.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfCompany({
        document: deleteOfferMutation,
        variables: { id: offer.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const deleteOffer = await company({
        document: deleteOfferMutation,
        variables: { id: offer.id },
    });
    assertSingleValue(deleteOffer);
    assertNoErrors(deleteOffer);
    const deleted = deleteOffer.data.deleteEmploymentOffer;
    assert.strictEqual(deleted, null);

    await assertCitizenAndCompanyStates(
        { employmentOffers: [], employment: null },
        "Employment and offers must be empty after deleting"
    )(
        { pendingOffers: [], rejectedOffers: [], employees: [] },
        "Employments and offers must be empty after deleting"
    );
};
test("create, reject, delete", testDeleteOffer);
