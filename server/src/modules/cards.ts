import type { IAppContext } from "Server";
import type { TNullable } from "Types";
import type { ICardModel, TUserModel } from "Types/models";
import type { Tables } from "knex/types/tables";
import type { TUserSignatureInput } from "Types/schema";

import { assert, fail, hasCode } from "Util/error";
import { parseUserSignature, stringifyUserSignature } from "Util/parse";
import { getUser } from "Modules/users";
import { ICard } from "Types/knex";
import { curry, get, isUndefined } from "lodash/fp";
import { assertRole } from "Util/auth";
import { mapNullableC, pipe1 } from "Util/misc";

/* * Helper functions * */

function assertCardFound(
    id: string,
    card: ICard | undefined
): asserts card is ICard {
    assert(
        !isUndefined(card),
        `Card with id ${id} not found.`,
        "CARD_NOT_FOUND"
    );
}
function assertCardUnblocked(
    card: ICard
): asserts card is ICard & { blocked: false } {
    assert(!card.blocked, "An unexpected error occured.", "CARD_BLOCKED");
}

const cardDbToModel = (card: ICard): ICardModel => ({
    ...card,
    userSignature: card.userSignature
        ? parseUserSignature(card.userSignature)
        : null,
});

/* * Query functions * */

export async function getCard(
    { knex, session }: IAppContext,
    id: string
): Promise<ICardModel> {
    assertRole(session.userSignature, "BORDER_CONTROL", { allowAdmin: true });

    const card = await knex("cards").where({ id }).first();
    assertCardFound(id, card);
    return cardDbToModel(card);
}

export async function readCard(
    ctx: IAppContext,
    id: string
): Promise<TNullable<TUserModel>> {
    const { knex } = ctx;

    const card = await knex("cards").where({ id }).first();
    assertCardFound(id, card);
    return pipe1(
        card,
        cardDbToModel,
        get("userSignature"),
        mapNullableC(curry(getUser)(ctx))
    );
}

/* * Mutation functions * */

export async function registerCard(
    { knex, session }: IAppContext,
    id: string
): Promise<ICardModel> {
    assertRole(session.userSignature, "ADMIN");

    try {
        const [card] = await knex("cards")
            .insert({ id, blocked: false })
            .returning("*");
        return cardDbToModel(card!);
    } catch (err) {
        if (hasCode(err) && err.code === "SQLITE_CONSTRAINT_PRIMARYKEY")
            fail("Card id already exists.", "CARD_ALREADY_REGISTERED");

        throw err;
    }
}

/** Internal function to update a card
 *
 * Checks the card exists.
 * Does NOT check permissions.
 */
async function updateCard(
    ctx: IAppContext,
    id: string,
    f: (card: ICard) => Tables["cards"]["update"]
): Promise<ICardModel> {
    const { knex } = ctx;
    return knex.transaction(async (trx) => {
        const card = await trx("cards").where({ id }).first();
        assertCardFound(id, card);

        const [newcard] = await trx("cards")
            .update(f(card))
            .where({ id })
            .returning("*");
        return cardDbToModel(newcard!);
    });
}

export async function assignCard(
    ctx: IAppContext,
    id: string,
    userSignature: TUserSignatureInput
): Promise<ICardModel> {
    const { session } = ctx;
    assertRole(session.userSignature, "BORDER_CONTROL", { allowAdmin: true });
    await getUser(ctx, userSignature); // check user exists

    return updateCard(ctx, id, (card) => {
        assertCardUnblocked(card);
        assert(
            !card.userSignature,
            `Card with id ${id} is already assigned.`,
            "CARD_ALREADY_ASSIGNED"
        );
        return { userSignature: stringifyUserSignature(userSignature) };
    });
}

export async function unassignCard(
    ctx: IAppContext,
    id: string
): Promise<ICardModel> {
    const { session } = ctx;
    assertRole(session.userSignature, "BORDER_CONTROL", { allowAdmin: true });

    return updateCard(ctx, id, (card) => {
        assertCardUnblocked(card);
        assert(
            !!card.userSignature,
            `Card with id ${id} is already unassigned.`,
            "CARD_ALREADY_UNASSIGNED"
        );
        return { userSignature: null };
    });
}

export async function blockCard(
    ctx: IAppContext,
    id: string
): Promise<ICardModel> {
    const { session } = ctx;
    assertRole(session.userSignature, "ADMIN");

    return updateCard(ctx, id, (card) => {
        assert(
            !card.blocked,
            `Card with id ${id} is already blocked.`,
            "CARD_ALREADY_BLOCKED"
        );
        return { blocked: true };
    });
}

export async function unblockCard(
    ctx: IAppContext,
    id: string
): Promise<ICardModel> {
    const { session } = ctx;
    assertRole(session.userSignature, "ADMIN");

    return updateCard(ctx, id, (card) => {
        assert(
            card.blocked,
            `Card with id ${id} is already unblocked.`,
            "CARD_ALREADY_UNBLOCKED"
        );
        return { blocked: false };
    });
}
