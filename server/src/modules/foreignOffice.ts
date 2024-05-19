import type { IGuestUserModel } from "Types/models";
import type { IBankAccount, IGuest } from "Types/knex";
import type { IAppContext } from "Server";
import type { TGuestUserInput } from "Types/schema";

import { v4 as uuidv4 } from "uuid";
import { assert } from "Util/error";
import { formatDateTimeZ } from "Util/date";
import { createBankAccount } from "Modules/bank";
import { assertRole } from "Util/auth";
import { isNil, isNull } from "lodash/fp";

export async function getGuest(
    { knex }: IAppContext,
    id: string
): Promise<IGuestUserModel> {
    const [raw]: (IGuest & IBankAccount)[] = await knex("guests")
        // select order important, because both tables contain id field
        .select("bankAccounts.*", "guests.*")
        .where("guests.id", id)
        .innerJoin("bankAccounts", "guests.bankAccountId", "bankAccounts.id");
    assert(!!raw, `Guest with id ${id} not found`, "GUEST_NOT_FOUND");

    return {
        type: "GUEST",
        ...raw,
        leftAt: raw.leftAt ? new Date(raw.leftAt) : null,
    };
}

export async function createGuest(
    ctx: IAppContext,
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

    assertRole(ctx, session.userSignature, "BORDER_CONTROL", {
        allowAdmin: true,
    });

    return knex.transaction(async (trx) => {
        const bankAccount = await createBankAccount(
            { ...ctx, knex: trx },
            guest.balance ?? config.guestInitialBalance
        );
        const inserted = await trx("guests")
            .insert({
                id: uuidv4(),
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

export async function leaveGuest(
    ctx: IAppContext,
    id: string
): Promise<IGuestUserModel> {
    const { knex, session } = ctx;
    const date = formatDateTimeZ(new Date());

    assertRole(ctx, session.userSignature, "BORDER_CONTROL", {
        allowAdmin: true,
    });

    return knex.transaction(async (trx) => {
        const [guest] = await trx("guests").select("leftAt").where({ id });
        assert(!!guest, `Guest with id ${id} not found`, "GUEST_NOT_FOUND");
        assert(
            isNull(guest.leftAt),
            "Guest has already left.",
            "GUEST_ALREADY_LEFT"
        );

        await trx("guests").update({ leftAt: date }).where({ id });
        return getGuest({ ...ctx, knex: trx }, id);
    });
}
