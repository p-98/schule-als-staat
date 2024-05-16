/* eslint-disable jest/expect-expect */
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

import { omit, negate, set, pick } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { EUserTypes } from "Types/models";
import { graphql } from "./graphql";
import { ProductRevisionInput } from "./graphql/graphql";

graphql(/* GraphQL */ `
    fragment NoStats_ProductFragment on Product {
        id
        revision
        company {
            __typename
            id
        }
        name
        price
        deleted
    }
`);
graphql(/* GraphQL */ `
    fragment All_PurchaseDraftFragment on PurchaseDraft {
        id
        date
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
                ...NoStats_ProductFragment
            }
        }
        discount
    }
`);
graphql(/* GraphQL */ `
    fragment All_PurchaseTransactionFragment on PurchaseTransaction {
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
                ...NoStats_ProductFragment
            }
        }
        discount
    }
`);

const productStateQuery = graphql(/* GraphQL */ `
    query ProductState {
        meCompany {
            products {
                ...NoStats_ProductFragment
            }
        }
    }
`);
const purchaseStateQuery = graphql(/* GraphQL */ `
    query PurchaseState {
        me {
            balance
            transactions {
                ... on PurchaseTransaction {
                    ...All_PurchaseTransactionFragment
                }
            }
            ... on CompanyUser {
                drafts {
                    ... on PurchaseDraft {
                        ...All_PurchaseDraftFragment
                    }
                }
            }
        }
    }
`);
const addProductMutation = graphql(/* GraphQL */ `
    mutation AddProduct($name: String!, $price: Float!) {
        addProduct(product: { name: $name, price: $price }) {
            ...NoStats_ProductFragment
        }
    }
`);
const editProductMutation = graphql(/* GraphQL */ `
    mutation EditProduct($id: ID!, $name: String!, $price: Float!) {
        editProduct(id: $id, product: { name: $name, price: $price }) {
            ...NoStats_ProductFragment
        }
    }
`);
const removeProductMutation = graphql(/* GraphQL */ `
    mutation RemoveProduct($id: ID!) {
        removeProduct(id: $id)
    }
`);
const sellMutation = graphql(/* GraphQL */ `
    mutation Sell($discount: Float!, $items: [PurchaseItemInput!]!) {
        sell(purchase: { discount: $discount, items: $items }) {
            ...All_PurchaseDraftFragment
        }
    }
`);
const payDraftSellerMutation = graphql(/* GraphQL */ `
    mutation PayPurchaseDraftSeller(
        $id: Int!
        $credentials: CredentialsInput!
    ) {
        payPurchaseDraft(id: $id, credentials: $credentials) {
            ...All_PurchaseTransactionFragment
        }
    }
`);
const payDraftUserMutation = graphql(/* GraphQL */ `
    mutation PayPurchaseDraftUser($id: Int!) {
        payPurchaseDraft(id: $id, credentials: null) {
            ...All_PurchaseTransactionFragment
        }
    }
`);
const deleteDraftMutation = graphql(/* GraphQL */ `
    mutation DeletePurchaseDraft($id: Int!) {
        deletePurchaseDraft(id: $id)
    }
`);

type IProduct = ResultOf<typeof addProductMutation>["addProduct"];
type IPurchaseDraft = ResultOf<typeof sellMutation>["sell"];
type IPurchaseTransaction = ResultOf<
    typeof payDraftSellerMutation
>["payPurchaseDraft"];
type IProductState = ResultOf<typeof productStateQuery>["meCompany"];
type IPurchaseState = ResultOf<typeof purchaseStateQuery>["me"];

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen: TUserExecutor;
let seller: TUserExecutor;
let citizenWithIdOfSeller: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    citizen = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    seller = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    citizenWithIdOfSeller = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: seller.id,
    });
    company = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
    });
    guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
});
afterEach(async () => {
    await knex.destroy();
});

const rev: (p: IProduct) => ProductRevisionInput = pick(["id", "revision"]);

async function forEachUserType(
    fn: (user: TUserExecutor) => Promise<void>
): Promise<void> {
    await Promise.all([citizen, company, guest].map(fn));
}
const productEq = (p1: IProduct) => (p2: IProduct) =>
    p1.id === p2.id && p1.revision === p2.revision;
const draftEq =
    (d1: IPurchaseDraft) => (d2: IPurchaseDraft | Record<never, never>) =>
        "id" in d2 && d1.id === d2.id;

const getProductState = async (_company: TUserExecutor) => {
    const result = await _company({
        document: productStateQuery,
    });
    assertSingleValue(result);
    assertNoErrors(result);
    return result.data.meCompany;
};
const assertProductState = async (
    _company: TUserExecutor,
    expected: IProductState,
    message?: string
) => {
    const state = await getProductState(_company);
    assert.deepStrictEqual(state, expected, message);
};
const getSellerState = async () => {
    const sellerResult = await seller({ document: purchaseStateQuery });
    assertSingleValue(sellerResult);
    assertNoErrors(sellerResult);
    return sellerResult.data.me;
};
const getSellerAndUserStates = async (
    activeUser: TUserExecutor
): Promise<[IPurchaseState, IPurchaseState]> => {
    const sellerState = await getSellerState();

    const activeUserResult = await activeUser({
        document: purchaseStateQuery,
    });
    assertSingleValue(activeUserResult);
    assertNoErrors(activeUserResult);

    return [sellerState, activeUserResult.data.me];
};
const assertSellerAndUserStates =
    (sellerExpected: IPurchaseState, sellerMessage?: string) =>
    async (
        activeUser?: TUserExecutor,
        userExpected?: IPurchaseState,
        userMessage?: string
    ) => {
        const sellerResult = await seller({ document: purchaseStateQuery });
        assertSingleValue(sellerResult);
        assertNoErrors(sellerResult);
        assert.deepStrictEqual(
            sellerResult.data.me,
            sellerExpected,
            sellerMessage
        );

        if (activeUser && userExpected) {
            const activeUserResult = await activeUser({
                document: purchaseStateQuery,
            });
            assertSingleValue(activeUserResult);
            assertNoErrors(activeUserResult);
            assert.deepStrictEqual(
                activeUserResult.data.me,
                userExpected,
                userMessage
            );
        }
        await forEachUserType(async (inactiveUser) => {
            if (inactiveUser === activeUser) return;

            const inactiveUserResult = await inactiveUser({
                document: purchaseStateQuery,
            });
            assertSingleValue(inactiveUserResult);
            assertNoErrors(inactiveUserResult);
            assert.deepStrictEqual(
                inactiveUserResult.data.me,
                {
                    balance: 10.0,
                    transactions: [],
                    ...(inactiveUser.type === "COMPANY" && { drafts: [] }),
                },
                "Inactive users must be untouched"
            );
        });
    };

async function testAddProduct(
    _company: TUserExecutor = seller
): Promise<IProduct> {
    const name = "Cola";
    const price = 2.0;

    const state = await getProductState(_company);

    // invalid requests
    const invalidName = await _company({
        document: addProductMutation,
        variables: { name: "  ", price },
    });
    assertInvalid(invalidName, "BAD_USER_INPUT");
    const invalidPrice = await _company({
        document: addProductMutation,
        variables: { name, price: -1.0 },
    });
    assertInvalid(invalidPrice, "BAD_USER_INPUT");
    const wrongUserType = await citizen({
        document: addProductMutation,
        variables: { name, price },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const addProduct = await _company({
        document: addProductMutation,
        variables: { name, price },
    });
    assertSingleValue(addProduct);
    assertNoErrors(addProduct);
    const product = addProduct.data.addProduct;
    assert.deepStrictEqual(omit(["id", "revision"], product), {
        company: {
            __typename: "CompanyUser",
            id: _company.id,
        },
        name,
        price,
        deleted: false,
    });

    await assertProductState(
        _company,
        { products: [...state.products, product] },
        "Added product must be present after add"
    );

    return product;
}
async function testEditProduct(product: IProduct): Promise<IProduct> {
    const name = "Fanta";
    const price = 3.0;

    const state = await getProductState(seller);

    // invalid requests
    const invalidId = await seller({
        document: editProductMutation,
        variables: { id: "invalidProductId", name, price },
    });
    assertInvalid(invalidId, "PRODUCT_NOT_FOUND");
    const invalidName = await seller({
        document: editProductMutation,
        variables: { id: product.id, name: "  ", price },
    });
    assertInvalid(invalidName, "BAD_USER_INPUT");
    const invalidPrice = await seller({
        document: editProductMutation,
        variables: { id: product.id, name, price: -1.0 },
    });
    assertInvalid(invalidPrice, "BAD_USER_INPUT");
    const wrongUserId = await company({
        document: editProductMutation,
        variables: { id: product.id, name, price },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfSeller({
        document: editProductMutation,
        variables: { id: product.id, name, price },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const editProduct = await seller({
        document: editProductMutation,
        variables: { id: product.id, name, price },
    });
    assertSingleValue(editProduct);
    assertNoErrors(editProduct);
    const newProduct = editProduct.data.editProduct;
    assert.deepStrictEqual(omit("revision", newProduct), {
        ...omit("revision", product),
        name,
        price,
    });
    assert.notStrictEqual(newProduct.revision, product.revision);

    await assertProductState(
        seller,
        {
            products: [
                ...state.products.filter(negate(productEq(product))),
                newProduct,
            ],
        },
        "New product must be present after edit"
    );

    return newProduct;
}
async function testRemoveProduct(product: IProduct) {
    const state = await getProductState(seller);

    // invalid requests
    const invalidId = await seller({
        document: removeProductMutation,
        variables: { id: "invalidProductId" },
    });
    assertInvalid(invalidId, "PRODUCT_NOT_FOUND");
    const wrongUserId = await company({
        document: removeProductMutation,
        variables: { id: product.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfSeller({
        document: removeProductMutation,
        variables: { id: product.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const removeProduct = await seller({
        document: removeProductMutation,
        variables: { id: product.id },
    });
    assertSingleValue(removeProduct);
    assertNoErrors(removeProduct);
    assert.strictEqual(removeProduct.data.removeProduct, null);

    await assertProductState(
        seller,
        { products: state.products.filter(negate(productEq(product))) },
        "Product must have disappeared after remove"
    );

    // invalid after remove
    const editProduct = await seller({
        document: editProductMutation,
        variables: { id: product.id, name: "Spezi", price: 4.0 },
    });
    assertInvalid(editProduct, "PRODUCT_NOT_FOUND");
    const removeAgain = await seller({
        document: removeProductMutation,
        variables: { id: product.id },
    });
    assertInvalid(removeAgain, "PRODUCT_NOT_FOUND");
}

async function testSell(_product: IProduct): Promise<IPurchaseDraft> {
    const discount = 1.0;
    const amount = 2;
    const product = rev(_product);

    const sellerState = await getSellerState();
    assert("drafts" in sellerState);

    // invalid requests
    const invalidDiscount = await seller({
        document: sellMutation,
        variables: { discount: -1.0, items: [{ amount, product }] },
    });
    assertInvalid(invalidDiscount, "BAD_USER_INPUT");
    const invalidAmount = await seller({
        document: sellMutation,
        variables: { discount, items: [{ amount: -1, product }] },
    });
    assertInvalid(invalidAmount, "BAD_USER_INPUT");
    const invalidProductId = await seller({
        document: sellMutation,
        variables: {
            discount,
            items: [{ amount, product: { ...product, id: "invalid" } }],
        },
    });
    assertInvalid(invalidProductId, "PRODUCT_NOT_FOUND");
    const invalidProductRevision = await seller({
        document: sellMutation,
        variables: {
            discount,
            items: [{ amount, product: { ...product, revision: "invalid" } }],
        },
    });
    assertInvalid(invalidProductRevision, "PRODUCT_NOT_FOUND");
    const product1Old = await testAddProduct(seller);
    const product1New = await testEditProduct(product1Old);
    const oldProductRevision = await seller({
        document: sellMutation,
        variables: { discount, items: [{ amount, product: rev(product1Old) }] },
    });
    assertInvalid(oldProductRevision, "PRODUCT_NOT_FOUND");
    await testRemoveProduct(product1New);
    const removedProduct = await seller({
        document: sellMutation,
        variables: { discount, items: [{ amount, product: rev(product1New) }] },
    });
    assertInvalid(removedProduct, "PRODUCT_NOT_FOUND");
    const companyProduct = await testAddProduct(company);
    const wrongProductOwner = await seller({
        document: sellMutation,
        variables: {
            discount,
            items: [{ amount, product: rev(companyProduct) }],
        },
    });
    assertInvalid(wrongProductOwner, "PERMISSION_DENIED");

    // valid request
    const before = new Date();
    const sell = await seller({
        document: sellMutation,
        variables: { discount, items: [{ amount, product }] },
    });
    const after = new Date();
    assertSingleValue(sell);
    assertNoErrors(sell);
    const draft = sell.data.sell;
    assert.deepStrictEqual(omit(["id", "date"], draft), {
        company: {
            __typename: "CompanyUser",
            id: seller.id,
        },
        grossPrice: amount * _product.price - discount,
        netPrice: amount * _product.price - discount,
        tax: 0.0,
        items: [{ amount, product: _product }],
        discount,
    });
    assert.isAtLeast(new Date(draft.date).getTime(), before.getTime());
    assert.isAtMost(new Date(draft.date).getTime(), after.getTime());

    await assertSellerAndUserStates({
        ...sellerState,
        drafts: [...sellerState.drafts, draft],
    })(undefined);

    return draft;
}
async function testPayPurchaseDraft(
    draft: IPurchaseDraft,
    user: TUserExecutor,
    useSeller: boolean
): Promise<IPurchaseTransaction> {
    const [stateSeller, stateUser] = await getSellerAndUserStates(user);
    assert("drafts" in stateSeller);

    // invalid requests
    const invalidIdSeller = await seller({
        document: payDraftSellerMutation,
        variables: { id: 404, credentials: user.credentials },
    });
    assertInvalid(invalidIdSeller, "PURCHASE_TRANSACTION_NOT_FOUND");
    const missingCredentials = await seller({
        document: payDraftUserMutation,
        variables: { id: draft.id },
    });
    assertInvalid(missingCredentials, "BAD_USER_INPUT");
    // validation of credentials is tested in login tests
    await forEachUserType(async (_user) => {
        const invalidIdUser = await _user({
            document: payDraftUserMutation,
            variables: { id: 404 },
        });
        assertInvalid(invalidIdUser, "PURCHASE_TRANSACTION_NOT_FOUND");
        const addedCredentials = await _user({
            document: payDraftSellerMutation,
            variables: { id: draft.id, credentials: user.credentials },
        });
        assertInvalid(addedCredentials, "BAD_USER_INPUT");
    });

    // valid request
    const payDraft = useSeller
        ? await seller({
              document: payDraftSellerMutation,
              variables: { id: draft.id, credentials: user.credentials },
          })
        : await user({
              document: payDraftUserMutation,
              variables: { id: draft.id },
          });
    assertSingleValue(payDraft);
    assertNoErrors(payDraft);
    const transaction = payDraft.data.payPurchaseDraft;
    assert.deepStrictEqual(transaction, {
        ...draft,
        customer: {
            __typename: EUserTypes[user.type],
            id: user.id,
        },
    });

    await assertSellerAndUserStates(
        {
            balance: stateSeller.balance + draft.netPrice,
            transactions: [transaction, ...stateSeller.transactions],
            drafts: stateSeller.drafts.filter(negate(draftEq(draft))),
        },
        "Transaction should be present, draft not present, balance updated"
    )(
        user,
        {
            balance: stateUser.balance - draft.grossPrice,
            transactions: [transaction, ...stateUser.transactions],
            ...("drafts" in stateUser && {
                drafts: stateUser.drafts,
            }),
        },
        "Transaction should be present, balance updated"
    );

    // invalid after pay
    const deleteDraft = await seller({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(deleteDraft, "PURCHASE_TRANSACTION_ALREADY_PAID");
    await forEachUserType(async (_user) => {
        const payAgainSeller = await seller({
            document: payDraftSellerMutation,
            variables: { id: draft.id, credentials: _user.credentials },
        });
        assertInvalid(payAgainSeller, "PURCHASE_TRANSACTION_ALREADY_PAID");
        const payAgainUser = await _user({
            document: payDraftUserMutation,
            variables: { id: draft.id },
        });
        assertInvalid(payAgainUser, "PURCHASE_TRANSACTION_ALREADY_PAID");
    });

    return transaction;
}
async function testDeletePurchaseDraft(draft: IPurchaseDraft): Promise<void> {
    const sellerState = await getSellerState();
    assert("drafts" in sellerState);

    // invalid requests
    const invalidId = await seller({
        document: deleteDraftMutation,
        variables: { id: 404 },
    });
    assertInvalid(invalidId, "PURCHASE_TRANSACTION_NOT_FOUND");
    const wrongUserType = await citizenWithIdOfSeller({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");
    const wrongUserId = await company({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");

    // valid request
    const deleteDraft = await seller({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertSingleValue(deleteDraft);
    assertNoErrors(deleteDraft);
    assert.strictEqual(deleteDraft.data.deletePurchaseDraft, null);

    await assertSellerAndUserStates({
        ...sellerState,
        drafts: sellerState.drafts.filter(negate(draftEq(draft))),
    })(undefined);

    // invalid after delete
    const deleteAgain = await seller({
        document: deleteDraftMutation,
        variables: { id: draft.id },
    });
    assertInvalid(deleteAgain, "PURCHASE_TRANSACTION_NOT_FOUND");
    await forEachUserType(async (_user) => {
        const payDraftSeller = await seller({
            document: payDraftSellerMutation,
            variables: { id: draft.id, credentials: _user.credentials },
        });
        assertInvalid(payDraftSeller, "PURCHASE_TRANSACTION_NOT_FOUND");
        const payDraftUser = await _user({
            document: payDraftUserMutation,
            variables: { id: draft.id },
        });
        assertInvalid(payDraftUser, "PURCHASE_TRANSACTION_NOT_FOUND");
    });
}

test("sell, delete", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testDeletePurchaseDraft(draft);
});

test("sell, pay by seller for citizen", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, citizen, true);
});
test("sell, pay by seller for company", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, company, true);
});
test("sell, pay by seller for guest", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, guest, true);
});

test("sell, pay by citizen", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, citizen, false);
});
test("sell, pay by company", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, company, false);
});
test("sell, pay by guest", async () => {
    const product = await testAddProduct();
    const draft = await testSell(product);
    await testPayPurchaseDraft(draft, guest, false);
});

test("edit and delete product between purchases", async () => {
    const oldProduct = await testAddProduct();

    const draft1 = await testSell(oldProduct);
    const newProduct = await testEditProduct(oldProduct);

    const draft2 = await testSell(newProduct);
    await testRemoveProduct(newProduct);

    await testPayPurchaseDraft(
        set("items.0.product.deleted", true, draft2),
        guest,
        true
    );
    await testPayPurchaseDraft(
        set("items.0.product.deleted", true, draft1),
        guest,
        true
    );
});
