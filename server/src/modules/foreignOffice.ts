import type { TNullable } from "Types";
import type { IGuestUserModel } from "Types/models";
import type { IBankAccount, IGuest } from "Types/knex";
import type { IAppContext } from "Server";

import { GraphQLYogaError } from "Util/error";
import { v4 as uuidv4 } from "uuid";
import { formatDateTimeZ } from "Util/date";
import { createBankAccount } from "Modules/bank";

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
    name: TNullable<string>,
    cardId: string
): Promise<IGuestUserModel> {
    const { knex, config } = ctx;
    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        const lastGuestOnCard = await trx("guests")
            .select("leftAt")
            .where({ cardId })
            .orderBy("enteredAt", "desc")
            .first();
        const isCardOccupied = lastGuestOnCard && !lastGuestOnCard.leftAt;
        if (isCardOccupied)
            throw new GraphQLYogaError(
                "There is already a guest account assigned to this card.",
                { code: "CARD_OCCUPIED" }
            );

        const bankAccount = await createBankAccount(
            ctx,
            config.guestInitialBalance
        );
        const inserted = await trx("guests")
            .insert({
                id: uuidv4(),
                cardId,
                bankAccountId: bankAccount.id,
                name,
                enteredAt: date,
            })
            .returning("*");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const guest = inserted[0]!;
        return {
            type: "GUEST",
            // spread order important, because both tables contain id field
            ...bankAccount,
            ...guest,
            leftAt: null,
        };
    });
}

export async function removeGuest(
    { knex }: IAppContext,
    cardId: string
): Promise<void> {
    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        const lastGuestOnCard = await trx("guests")
            .select("leftAt")
            .where({ cardId })
            .orderBy("enteredAt", "desc")
            .first();
        const isCardOccupied = lastGuestOnCard && !lastGuestOnCard.leftAt;
        if (!isCardOccupied)
            throw new GraphQLYogaError(
                "There is currenently no guest account assigned to this card.",
                { code: "CARD_NOT_OCCUPIED" }
            );

        await trx("guests").update({ leftAt: date }).where({ cardId });
    });
}
