import type { IAppContext } from "Server";

import { assert } from "Util/error";
import { parseUserSignature, stringifyUserSignature } from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import type { IStay } from "Types/knex";
import type {
    IBorderCrossingModel,
    ICustomsTransactionModel,
    IUserSignature,
} from "Types/models";
import { assertRole } from "Util/auth";
import { getUser } from "Modules/users";

export async function chargeCustoms(
    ctx: IAppContext,
    user: IUserSignature,
    customs: number
): Promise<ICustomsTransactionModel> {
    const { knex, config, session } = ctx;
    assertRole(session.userSignature, "BORDER_CONTROL");
    assert(customs > 0, "Customs must be positive", "BAD_USER_INPUT");

    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        const userModel = await getUser({ ...ctx, knex: trx }, user);
        const updatedUser = await trx("bankAccounts")
            .decrement("balance", customs)
            .where("id", userModel.bankAccountId)
            .returning("balance");
        assert(
            updatedUser[0]!.balance >= 0,
            "User has not enough money to complete charge",
            "BALANCE_TOO_LOW"
        );

        await trx.raw(
            `
            update bankAccounts
            set balance = balance + :customs
            from companies
            where companies.bankAccountId = bankAccounts.id
                  and companies.id = :companyId
        `,
            { customs, companyId: config.server.borderControlCompanyId }
        );

        const [raw] = await trx("customsTransactions")
            .insert({
                date,
                userSignature: stringifyUserSignature(user),
                customs,
            })
            .returning("*");
        return {
            type: "CUSTOMS",
            ...raw!,
            userSignature: parseUserSignature(raw!.userSignature),
        };
    });
}

const stay2BorderCrossing = (stay: IStay): IBorderCrossingModel => ({
    action: stay.leftAt ? "LEAVE" : "ENTER",
    citizenId: stay.citizenId,
    date: stay.leftAt ? stay.leftAt : stay.enteredAt,
});
export async function registerBorderCrossing(
    { knex, session }: IAppContext,
    citizenId: string
): Promise<IBorderCrossingModel> {
    assertRole(session.userSignature, "BORDER_CONTROL");

    return knex.transaction(async (trx) => {
        const lastBorderCrossing = await trx("stays")
            .select("id", "leftAt")
            .where({ citizenId })
            .orderBy("id", "desc")
            .first();
        const isEntering = !!lastBorderCrossing?.leftAt;

        const returnQuery: Promise<IStay> = isEntering
            ? trx.raw(
                  `INSERT INTO stays (citizenId, enteredAt)
                  VALUES (?, ?)
                  RETURNING *
                  `,
                  [citizenId, formatDateTimeZ(new Date())]
              )
            : trx.raw(
                  `UPDATE stays
                  SET leftAt = ?
                  WHERE citizenId = ?
                  RETURNING *`,
                  [citizenId, formatDateTimeZ(new Date())]
              );

        return stay2BorderCrossing(await returnQuery);
    });
}
