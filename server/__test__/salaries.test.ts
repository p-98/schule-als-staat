import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    assertInvalid,
    type TUserExecutor,
} from "Util/test";

import { keyBy, map, omit, pipe } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import { type IEmployment as IKnexEmployment } from "Types/knex";
import { graphql } from "./graphql";

const idsEmploymentFragment = graphql(/* GraphQL */ `
    fragment Ids_EmploymentFragment on Employment {
        id
        company {
            id
        }
        citizen {
            id
        }
    }
`);
graphql(/* GraphQL */ `
    fragment All_WorktimeFragment on Worktime {
        id
        employment {
            ...All_EmploymentFragment
        }
        start
        end
    }
`);
graphql(/* GraphQL */ `
    fragment All_SalaryTransactionFragment on SalaryTransaction {
        id
        date
        employment {
            ...Ids_EmploymentFragment
        }
        grossValue
        netValue
        tax
        worktime {
            ...All_WorktimeFragment
        }
        isBonus
    }
`);

const BalanceAndTransactionsQuery = graphql(/* GraphQL */ `
    query BalanceAndTransactions {
        me {
            balance
            transactions {
                ... on SalaryTransaction {
                    ...All_SalaryTransactionFragment
                }
            }
        }
    }
`);
const payBonusMutation = graphql(/* GraphQL */ `
    mutation PayBonus($value: Float!, $employmentIds: [Int!]!) {
        payBonus(value: $value, employmentIds: $employmentIds) {
            ...All_SalaryTransactionFragment
        }
    }
`);

type ISalaryTransaction = ResultOf<typeof payBonusMutation>["payBonus"][0];
type ISalaryState = ResultOf<typeof BalanceAndTransactionsQuery>["me"];
type IEmployment = ResultOf<typeof idsEmploymentFragment>;

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen1: TUserExecutor & { employment: IEmployment };
let citizen2: TUserExecutor & { employment: IEmployment };
let company: TUserExecutor;
let differentCompany: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);
    const _citizen1 = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
    });
    const _citizen2 = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
    });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    differentCompany = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
    });

    // seed employments
    const employments = await knex("employments")
        .insert([
            {
                companyId: company.id,
                citizenId: _citizen1.id,
                salary: 2.0,
                minWorktime: 3600,
                employer: false,
                cancelled: false,
            },
            {
                companyId: company.id,
                citizenId: _citizen2.id,
                salary: 3.0,
                minWorktime: 3600,
                employer: false,
                cancelled: false,
            },
        ])
        .returning("*");
    const employmentsMap = pipe(
        map((_: IKnexEmployment) => ({
            id: _.id,
            company: { id: _.companyId },
            citizen: { id: _.citizenId },
        })),
        keyBy((_) => _.citizen.id)
    )(employments);

    citizen1 = Object.assign(_citizen1, {
        employment: employmentsMap[_citizen1.id]!,
    });
    citizen2 = Object.assign(_citizen2, {
        employment: employmentsMap[_citizen2.id]!,
    });
});
afterEach(async () => {
    await knex.destroy();
});

const assertSalaryStates = (
    companyExpected: ISalaryState,
    companyMessage: string,
    employee1Expected: ISalaryState,
    employee1Message: string,
    employee2Expected: ISalaryState,
    employee2Message: string
) => {
    const checks = [
        [company, companyExpected, companyMessage],
        [citizen1, employee1Expected, employee1Message],
        [citizen2, employee2Expected, employee2Message],
    ] as const;
    return Promise.all(
        checks.map(async ([user, expected, message]) => {
            const result = await user({
                document: BalanceAndTransactionsQuery,
            });
            assertSingleValue(result);
            assertNoErrors(result);
            assert.deepStrictEqual(result.data.me, expected, message);
        })
    );
};

async function testPayBonus(
    employment1: IEmployment,
    employment2: IEmployment
): Promise<ISalaryTransaction[]> {
    const value = 2.0;
    const employmentIds = [employment1.id, employment2.id];

    await assertSalaryStates(
        { balance: 10.0, transactions: [] },
        "Values should be initial before pay",
        { balance: 10.0, transactions: [] },
        "Values should be initial before pay",
        { balance: 10.0, transactions: [] },
        "Values should be initial before pay"
    );

    // invalid request
    const negativeValue = await company({
        document: payBonusMutation,
        variables: { value: -1.0, employmentIds },
    });
    assertInvalid(negativeValue, "BAD_USER_INPUT");
    const zeroValue = await company({
        document: payBonusMutation,
        variables: { value: 0, employmentIds },
    });
    assertInvalid(zeroValue, "BAD_USER_INPUT");
    const tooHighValue = await company({
        document: payBonusMutation,
        variables: { value: 20.0, employmentIds },
    });
    assertInvalid(tooHighValue, "BALANCE_TOO_LOW");
    const invalidEmployment = await company({
        document: payBonusMutation,
        variables: { value, employmentIds: [...employmentIds, 404] },
    });
    assertInvalid(invalidEmployment, "EMPLOYMENT_NOT_FOUND");
    const noEmployments = await company({
        document: payBonusMutation,
        variables: { value, employmentIds: [] },
    });
    assertInvalid(noEmployments, "BAD_USER_INPUT");
    const wrongCompany = await differentCompany({
        document: payBonusMutation,
        variables: { value, employmentIds },
    });
    assertInvalid(wrongCompany, "PERMISSION_DENIED");

    // valid request
    const before = new Date();
    const payBonus = await company({
        document: payBonusMutation,
        variables: { value, employmentIds },
    });
    const after = new Date();
    assertSingleValue(payBonus);
    assertNoErrors(payBonus);
    const transactions = payBonus.data.payBonus;
    assert.deepStrictEqual(transactions.map(omit(["id", "date"])), [
        {
            employment: employment1,
            grossValue: 2.0,
            netValue: 2.0,
            tax: 0.0,
            worktime: null,
            isBonus: true,
        },
        {
            employment: employment2,
            grossValue: 2.0,
            netValue: 2.0,
            tax: 0.0,
            worktime: null,
            isBonus: true,
        },
    ]);
    transactions.forEach((_) => {
        assert.isAtLeast(new Date(_.date).getTime(), before.getTime());
        assert.isAtMost(new Date(_.date).getTime(), after.getTime());
    });

    await assertSalaryStates(
        { balance: 6.0, transactions },
        "Both transaction should be present after pay",
        { balance: 12.0, transactions: [transactions[0]!] },
        "Transaction should be present after pay",
        { balance: 12.0, transactions: [transactions[1]!] },
        "Transaction should be present after pay"
    );

    return transactions;
}

test("payBonus", () => testPayBonus(citizen1.employment, citizen2.employment));
