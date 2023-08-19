import type { IAppContext } from "Server";

import { GraphQLYogaError } from "Util/error";
import {
    EUserTypeTableMap,
    parseUserSignature,
    stringifyUserSignature,
} from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import type { IStay, ICustomsTransaction } from "Types/knex";
import type {
    IBorderCrossingModel,
    ICustomsTransactionModel,
    IUserSignature,
} from "Types/models";

export async function chargeCustoms(
    { knex, config }: IAppContext,
    user: IUserSignature,
    customs: number
): Promise<ICustomsTransactionModel> {
    if (customs <= 0)
        throw new GraphQLYogaError("Value must be greater than 0.", {
            code: "BAD_USER_INPUT",
        });

    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        // use knex.raw because knex doesn't support returning on sqlite
        const customerTable = EUserTypeTableMap[user.type];
        const [userResult] = (await trx.raw(
            `UPDATE bankAccounts
            SET balance = balance - :customs
            WHERE (
                SELECT bankAccountId FROM ${customerTable} WHERE id = :customerId
            )
            RETURNING balance`,
            { customs, customerId: user.id }
        )) as { balance: number }[];
        if (!userResult)
            throw new GraphQLYogaError(
                `User with signature ${stringifyUserSignature(user)} not found`,
                { code: "USER_NOT_FOUND" }
            );
        if (userResult.balance < 0)
            throw new GraphQLYogaError(
                `Not enough money to complete bonus payment`,
                { code: "BALANCE_TOO_LOW" }
            );

        await trx("bankAccounts")
            .increment("balance", customs)
            .where("id", config.server.stateBankAccountId);

        await trx("customsTransactions").insert({
            date,
            userSignature: stringifyUserSignature(user),
            customs,
        });
        const raw = (await trx("customsTransactions")
            .select("*")
            .where("id", knex.raw("last_insert_rowid()"))
            .first()) as ICustomsTransaction;
        return {
            type: "CUSTOMS",
            ...raw,
            userSignature: parseUserSignature(raw.userSignature),
        };
    });
}

const stay2BorderCrossing = (stay: IStay): IBorderCrossingModel => ({
    action: stay.leftAt ? "LEAVE" : "ENTER",
    citizenId: stay.citizenId,
    date: stay.leftAt ? stay.leftAt : stay.enteredAt,
});
export async function registerBorderCrossing(
    { knex }: IAppContext,
    citizenId: string
): Promise<IBorderCrossingModel> {
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
