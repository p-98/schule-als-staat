import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
    createTestServer,
} from "Util/test";

import { omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { EUserTypes } from "Types/models";
import config from "Config";
import { graphql } from "./graphql";

const purchaseFragment = graphql(/* GraphQL */ `
    fragment All_ProductOnlyRevision_PurchaseTransactionFragment on PurchaseTransaction {
        id
        date
        customer {
            __typename
            id
        }
        company {
            __typename
            id
        }
        grossPrice
        netPrice
        tax
        items {
            amount
            product {
                id
                revision
            }
        }
        discount
    }
`);
const purchaseMutation = graphql(/* GraphQL */ `
    mutation WarehousePurchase($items: [PurchaseItemInput!]!) {
        warehousePurchase(purchase: { items: $items }) {
            ...All_ProductOnlyRevision_PurchaseTransactionFragment
        }
    }
`);
const warehousePurchaseStateQuery = graphql(/* GraphQL */ `
    query WarehousePurchaseState {
        me {
            balance
            transactions {
                ... on PurchaseTransaction {
                    ...All_ProductOnlyRevision_PurchaseTransactionFragment
                }
            }
            ... on CompanyUser {
                drafts {
                    id
                }
            }
        }
    }
`);

type IPurchase = ResultOf<typeof purchaseFragment>;
type TWarenousePurchaseState = ResultOf<
    typeof warehousePurchaseStateQuery
>["me"];

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let company: TUserExecutor;
let otherCompany: TUserExecutor;
let warehouse: TUserExecutor;
const products = {
    product: { id: "product", revision: "orig" },
    edited: { id: "editedProduct", revision: "orig" },
    removed: { id: "deletedProduct", revision: "orig" },
    otherCompany: { id: "otherCompanyProduct", revision: "orig" },
};
beforeEach(async () => {
    [knex, yoga] = await createTestServer();

    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    company = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
    });
    otherCompany = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    warehouse = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.warehouseCompanyId,
    });

    await knex("products").insert([
        {
            ...products.product,
            companyId: warehouse.id,
            name: "name1.1",
            price: 2.0,
            deleted: false,
        },
        {
            ...products.edited,
            companyId: warehouse.id,
            name: "name1.1",
            price: 3.0,
            deleted: true,
        },
        {
            ...products.edited,
            revision: "edited",
            companyId: warehouse.id,
            name: "name1.2",
            price: 3.0,
            deleted: false,
        },
        {
            ...products.removed,
            companyId: warehouse.id,
            name: "otherName",
            price: 2.0,
            deleted: true,
        },
        {
            ...products.otherCompany,
            companyId: otherCompany.id,
            name: "otherName",
            price: 2.0,
            deleted: false,
        },
    ]);
});
afterEach(async () => {
    await knex.destroy();
});

function assertWarehousePurchaseState(user: TUserExecutor) {
    return async (expected: TWarenousePurchaseState, message?: string) => {
        const result = await user({ document: warehousePurchaseStateQuery });
        assertSingleValue(result);
        assertNoErrors(result);
        assert.deepStrictEqual(result.data.me, expected, message);
    };
}

async function testWarehousePurchase(): Promise<IPurchase> {
    const amount = 2;
    const { product } = products;

    await assertWarehousePurchaseState(company)(
        { balance: 10, transactions: [], drafts: [] },
        "Initials values"
    );
    await assertWarehousePurchaseState(warehouse)(
        { balance: 10, transactions: [], drafts: [] },
        "Initials values"
    );

    // invalid requests
    const invalidAmount = await company({
        document: purchaseMutation,
        variables: { items: [{ amount: -1, product }] },
    });
    assertInvalid(invalidAmount, "BAD_USER_INPUT");
    const invalidProductId = await company({
        document: purchaseMutation,
        variables: {
            items: [{ amount, product: { ...product, id: "invalid" } }],
        },
    });
    assertInvalid(invalidProductId, "PRODUCT_NOT_FOUND");
    const invalidProductRevision = await company({
        document: purchaseMutation,
        variables: {
            items: [{ amount, product: { ...product, revision: "invalid" } }],
        },
    });
    assertInvalid(invalidProductRevision, "PRODUCT_NOT_FOUND");
    const oldProductRevision = await company({
        document: purchaseMutation,
        variables: { items: [{ amount, product: products.edited }] },
    });
    assertInvalid(oldProductRevision, "PRODUCT_NOT_FOUND");
    const removedProduct = await company({
        document: purchaseMutation,
        variables: { items: [{ amount, product: products.removed }] },
    });
    assertInvalid(removedProduct, "PRODUCT_NOT_FOUND");
    const wrongProductOwner = await company({
        document: purchaseMutation,
        variables: { items: [{ amount, product: products.otherCompany }] },
    });
    assertInvalid(wrongProductOwner, "PERMISSION_DENIED");
    const wrongUserType = await citizen({
        document: purchaseMutation,
        variables: { items: [{ amount, product }] },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const before = new Date();
    const purchase = await company({
        document: purchaseMutation,
        variables: { items: [{ amount, product }] },
    });
    const after = new Date();
    assertSingleValue(purchase);
    assertNoErrors(purchase);
    const transaction = purchase.data.warehousePurchase;
    assert.deepStrictEqual(omit(["id", "date"], transaction), {
        customer: {
            __typename: EUserTypes.COMPANY,
            id: company.id,
        },
        company: {
            __typename: EUserTypes.COMPANY,
            id: warehouse.id,
        },
        grossPrice: 4.0,
        netPrice: 4.0,
        tax: 0.0,
        items: [{ amount, product }],
        discount: null,
    });
    assert.isAtLeast(new Date(transaction.date).getTime(), before.getTime());
    assert.isAtMost(new Date(transaction.date).getTime(), after.getTime());

    await assertWarehousePurchaseState(company)(
        { balance: 6.0, transactions: [transaction], drafts: [] },
        "Initials values"
    );
    await assertWarehousePurchaseState(warehouse)(
        { balance: 14.0, transactions: [transaction], drafts: [] },
        "Initials values"
    );

    return transaction;
}
// eslint-disable-next-line jest/expect-expect
test("warhousePurchase", testWarehousePurchase);
