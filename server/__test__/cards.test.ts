import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    type TUserExecutor,
    assertInvalid,
} from "Util/test";

import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance, yogaFactory } from "Server";
import { type Knex, emptyKnex } from "Database";
import { IUserSignature } from "Types/models";
import config from "Config";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment UserSignatureAlt_UserFragment on User {
        type
        id
    }
`);
const cardFragment = graphql(/* GraphQL */ `
    fragment All_CardFragment on Card {
        id
        user {
            ...UserSignatureAlt_UserFragment
        }
        blocked
    }
`);

const readCardQuery = graphql(/* GraphQL */ `
    query ReadCard($id: ID!) {
        readCard(id: $id) {
            ...UserSignatureAlt_UserFragment
        }
    }
`);
const cardQuery = graphql(/* GraphQL */ `
    query Card($id: ID!) {
        card(id: $id) {
            ...All_CardFragment
        }
    }
`);

const registerCardMutation = graphql(/* GraphQL */ `
    mutation RegisterCard($id: ID!) {
        registerCard(id: $id) {
            ...All_CardFragment
        }
    }
`);
const assignCardMutation = graphql(/* GraphQL */ `
    mutation AssignCard($id: ID!, $user: UserSignatureInput!) {
        assignCard(id: $id, user: $user) {
            ...All_CardFragment
        }
    }
`);
const unassignCardMutation = graphql(/* GraphQL */ `
    mutation UnassignCard($id: ID!) {
        unassignCard(id: $id) {
            ...All_CardFragment
        }
    }
`);
const blockCardMutation = graphql(/* GraphQL */ `
    mutation BlockCard($id: ID!) {
        blockCard(id: $id) {
            ...All_CardFragment
        }
    }
`);
const unblockCardMutation = graphql(/* GraphQL */ `
    mutation UnblockCard($id: ID!) {
        unblockCard(id: $id) {
            ...All_CardFragment
        }
    }
`);

type TCard = ResultOf<typeof cardFragment>;

let knex: Knex;
let yoga: TYogaServerInstance;
let company: TUserExecutor;
let borderControl: TUserExecutor;
let admin: TUserExecutor;
beforeEach(async () => {
    knex = await emptyKnex();
    yoga = yogaFactory(knex);

    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.server.borderControlCompanyId,
    });
    admin = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.server.adminCitizenIds[0],
    });
});
afterEach(async () => {
    await knex.destroy();
});

async function cardState(id: string): Promise<TCard> {
    const result = await admin({ document: cardQuery, variables: { id } });
    assertSingleValue(result);
    assertNoErrors(result);
    return result.data.card;
}

/** Compare readCard result to expected state */
async function testReadCard(card: TCard): Promise<void> {
    const { id } = card;

    // invalid requests
    const invalidId = await company({
        document: readCardQuery,
        variables: { id: "invalidCardId" },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");

    // valid request
    const valid = await company({ document: readCardQuery, variables: { id } });
    assertSingleValue(valid);
    assertNoErrors(valid);
    assert.deepStrictEqual(valid.data.readCard, card.user);
}

/** Compare card result to expected state */
async function testCard(card: TCard): Promise<void> {
    const { id } = card;

    // invalid requests
    const noBorderControl = await company({
        document: cardQuery,
        variables: { id },
    });
    assertInvalid(noBorderControl, "PERMISSION_DENIED");
    const invalidId = await borderControl({
        document: cardQuery,
        variables: { id: "invalidCardId" },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");

    // valid request
    const valid = await borderControl({
        document: cardQuery,
        variables: { id },
    });
    assertSingleValue(valid);
    assertNoErrors(valid);
    assert.deepStrictEqual(valid.data.card, card);
}

const testQueries = (card: TCard) =>
    Promise.all([testReadCard(card), testCard(card)]);

async function testRegisterCard(id: string): Promise<TCard> {
    // invalid requests
    const noAdmin = await borderControl({
        document: registerCardMutation,
        variables: { id },
    });
    assertInvalid(noAdmin, "PERMISSION_DENIED");

    // valid request
    const register = await admin({
        document: registerCardMutation,
        variables: { id },
    });
    assertSingleValue(register);
    assertNoErrors(register);
    const card = register.data.registerCard;
    assert.deepStrictEqual(card, {
        id,
        user: null,
        blocked: false,
    });

    // invalid when registered
    const registerAgain = await admin({
        document: registerCardMutation,
        variables: { id },
    });
    assertInvalid(registerAgain, "CARD_ALREADY_REGISTERED");

    return card;
}

async function testAssignCard(
    id: string,
    user: IUserSignature
): Promise<TCard> {
    const card = await cardState(id);

    // invalid requests
    const noBorderControl = await company({
        document: assignCardMutation,
        variables: { id, user },
    });
    assertInvalid(noBorderControl, "PERMISSION_DENIED");
    const invalidId = await borderControl({
        document: assignCardMutation,
        variables: { id: "invalidCardId", user },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");
    const invalidUser = await borderControl({
        document: assignCardMutation,
        variables: { id, user: { ...user, id: "invalidUserId" } },
    });
    assertInvalid(invalidUser, `${user.type.toUpperCase()}_NOT_FOUND`);

    // valid request
    const assign = await borderControl({
        document: assignCardMutation,
        variables: { id, user },
    });
    assertSingleValue(assign);
    assertNoErrors(assign);
    const newcard = assign.data.assignCard;
    assert.deepStrictEqual(newcard, { ...card, user });
    assert.deepStrictEqual(await cardState(id), newcard);

    // invalid when assigned
    const assignAgain = await borderControl({
        document: assignCardMutation,
        variables: { id, user },
    });
    assertInvalid(assignAgain, "CARD_ALREADY_ASSIGNED");

    return newcard;
}

async function testUnassignCard(id: string): Promise<TCard> {
    const card = await cardState(id);

    // invalid requests
    const noBorderControl = await company({
        document: unassignCardMutation,
        variables: { id },
    });
    assertInvalid(noBorderControl, "PERMISSION_DENIED");
    const invalidId = await borderControl({
        document: unassignCardMutation,
        variables: { id: "invalidCardId" },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");

    // valid request
    const unassign = await borderControl({
        document: unassignCardMutation,
        variables: { id },
    });
    assertSingleValue(unassign);
    assertNoErrors(unassign);
    const newcard = unassign.data.unassignCard;
    assert.deepStrictEqual(newcard, { ...card, user: null });
    assert.deepStrictEqual(await cardState(id), newcard);

    // invalid when unassigned
    const unassignAgain = await borderControl({
        document: unassignCardMutation,
        variables: { id },
    });
    assertInvalid(unassignAgain, "CARD_ALREADY_UNASSIGNED");

    return newcard;
}

async function testBlockCard(id: string): Promise<TCard> {
    const card = await cardState(id);

    // invalid requests
    const noAdmin = await borderControl({
        document: blockCardMutation,
        variables: { id },
    });
    assertInvalid(noAdmin, "PERMISSION_DENIED");
    const invalidId = await admin({
        document: blockCardMutation,
        variables: { id: "invalidCardId" },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");

    // valid request
    const block = await admin({
        document: blockCardMutation,
        variables: { id },
    });
    assertSingleValue(block);
    assertNoErrors(block);
    const newcard = block.data.blockCard;
    assert.deepStrictEqual(newcard, { ...card, blocked: true });
    assert.deepStrictEqual(await cardState(id), newcard);

    // ivalid when blocked
    const blockAgain = await admin({
        document: blockCardMutation,
        variables: { id },
    });
    assertInvalid(blockAgain, "CARD_ALREADY_BLOCKED");
    if (card.user) {
        const unassignCard = await admin({
            document: unassignCardMutation,
            variables: { id },
        });
        assertInvalid(unassignCard, "CARD_BLOCKED");
    } else {
        const assignCard = await admin({
            document: assignCardMutation,
            variables: { id, user: company.signature },
        });
        assertInvalid(assignCard, "CARD_BLOCKED");
    }

    return newcard;
}

async function testUnblockCard(id: string): Promise<TCard> {
    const card = await cardState(id);

    // invalid requests
    const noAdmin = await borderControl({
        document: unblockCardMutation,
        variables: { id },
    });
    assertInvalid(noAdmin, "PERMISSION_DENIED");
    const invalidId = await admin({
        document: unblockCardMutation,
        variables: { id: "invalidCardId" },
    });
    assertInvalid(invalidId, "CARD_NOT_FOUND");

    // valid request
    const unblock = await admin({
        document: unblockCardMutation,
        variables: { id },
    });
    assertSingleValue(unblock);
    assertNoErrors(unblock);
    const newcard = unblock.data.unblockCard;
    assert.deepStrictEqual(newcard, { ...card, blocked: false });
    assert.deepStrictEqual(await cardState(id), newcard);

    // invalid when unassigned
    const unblockAgain = await admin({
        document: unblockCardMutation,
        variables: { id },
    });
    assertInvalid(unblockAgain, "CARD_ALREADY_UNBLOCKED");

    return newcard;
}

test("register, assign, block, unblock, unassign", async () => {
    const cardId = "cardId";
    await testRegisterCard(cardId);
    await testAssignCard(cardId, company.signature);
    await testBlockCard(cardId);
    await testUnblockCard(cardId);
    await testUnassignCard(cardId);
});
test("register, assign, unassign, block, unblock", async () => {
    const cardId = "cardId";
    await testRegisterCard(cardId);
    await testAssignCard(cardId, company.signature);
    await testUnassignCard(cardId);
    await testBlockCard(cardId);
    await testUnblockCard(cardId);
});
test("reassign", async () => {
    const cardId = "cardId";
    await testRegisterCard(cardId);
    await testAssignCard(cardId, company.signature);
    await testUnassignCard(cardId);
    await testAssignCard(cardId, admin.signature);
});
test("multiple cards", async () => {
    const cardId1 = "cardId1";
    const cardId2 = "cardId2";
    await testRegisterCard(cardId1);
    await testRegisterCard(cardId2);
    await testAssignCard(cardId1, company.signature);
    await testAssignCard(cardId2, borderControl.signature);
});
test("queries", async () => {
    const cardId = "cardId";
    const unassigned = await testRegisterCard(cardId);
    await testQueries(unassigned);
    const assigned = await testAssignCard(cardId, company.signature);
    await testQueries(assigned);
});
