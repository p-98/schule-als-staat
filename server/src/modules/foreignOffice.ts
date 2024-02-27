import type { IGuestUserModel } from "Types/models";
import type { IBankAccount, IGuest } from "Types/knex";
import type { IAppContext } from "Server";
import type { TGuestUserInput } from "Types/schema";

import { v4 as uuidv4 } from "uuid";
import { assert, GraphQLYogaError } from "Util/error";
import { formatDateTimeZ } from "Util/date";
import { createBankAccount } from "Modules/bank";
import { assertRole } from "Util/auth";
import { isNil } from "lodash/fp";

export async function getGuest(
    { knex }: IAppContext,
    id: string
): Promise<IGuestUserModel> {
    const raw = (await knex("guests")
        // select order important, because both tables contain id field
        .select("bankAccounts.*", "guests.*")
        .where("guests.id", id)
        .innerJoin("bankAccounts", "guests.bankAccountId", "bankAccounts.id")
        .first()) as (IGuest & IBankAccount) | undefined;

    if (!raw)
        throw new GraphQLYogaError(`Guest with id ${id} not found`, {
            code: "GUEST_NOT_FOUND",
        });

    return {
        type: "GUEST",
        ...raw,
        leftAt: raw.leftAt ? new Date(raw.leftAt) : null,
    };
}

export async function createGuest(
    ctx: IAppContext,
    cardId: string,
    guest: TGuestUserInput
): Promise<IGuestUserModel> {
    const { knex, config, session } = ctx;
    const date = formatDateTimeZ(new Date());

    if (!isNil(guest.balance))
        assert(
            guest.balance >= 0,
            "Balance must not be negative",
            "BAD_USER_INPUT"
        );

    assertRole(session.userSignature, "BORDER_CONTROL");

    return knex.transaction(async (trx) => {
        const lastGuestOnCard = await trx("guests")
            .select("leftAt")
            .where({ cardId })
            .orderBy("enteredAt", "desc")
            .first();
        const isCardOccupied = lastGuestOnCard && !lastGuestOnCard.leftAt;
        assert(
            !isCardOccupied,
            "There is already a guest account assigned to this card.",
            "CARD_OCCUPIED"
        );
        const bankAccount = await createBankAccount(
            { ...ctx, knex: trx },
            guest.balance ?? config.guestInitialBalance
        );
        const inserted = await trx("guests")
            .insert({
                id: uuidv4(),
                cardId,
                bankAccountId: bankAccount.id,
                name: guest.name,
                enteredAt: date,
            })
            .returning("*");
        const raw = inserted[0]!;
        return {
            type: "GUEST",
            // spread order important, because both tables contain id field
            ...bankAccount,
            ...raw,
            leftAt: null,
        };
    });
}

export async function removeGuest(
    { knex, session }: IAppContext,
    cardId: string
): Promise<void> {
    const date = formatDateTimeZ(new Date());

    assertRole(session.userSignature, "BORDER_CONTROL");

    return knex.transaction(async (trx) => {
        const lastGuestOnCard = await trx("guests")
            .select("leftAt")
            .where({ cardId })
            .orderBy("enteredAt", "desc")
            .first();
        const isCardOccupied = !!lastGuestOnCard && !lastGuestOnCard.leftAt;
        assert(
            isCardOccupied,
            "There is currenently no guest account assigned to this card.",
            "CARD_NOT_OCCUPIED"
        );

        await trx("guests").update({ leftAt: date }).where({ cardId });
    });
}
