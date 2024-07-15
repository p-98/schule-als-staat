import type { IAppContext } from "Server";

import { isUndefined } from "lodash/fp";
import * as dateFns from "date-fns";
import { assert } from "Util/error";
import { parseUserSignature, stringifyUserSignature } from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import type { IStay } from "Types/knex";
import type {
    IBorderCrossingModel,
    ICitizenUserModel,
    ICustomsTransactionModel,
    IStayModel,
    IUserSignature,
} from "Types/models";
import { assertRole } from "Util/auth";
import { getUser } from "Modules/users";
import { getCitizen } from "./registryOffice";

/** Whether the citizen is currently in the state
 *
 * Only respects todays' stays.
 * 'Today' means only stays where enteredAt is in today are respected.
 *
 * @precondition The citizen exists.
 */
export async function getIsInState(
    ctx: IAppContext,
    citizen: ICitizenUserModel
): Promise<boolean> {
    const { knex } = ctx;
    const startOfToday = formatDateTimeZ(dateFns.startOfToday());
    const lastStay = await knex("stays")
        .select("leftAt")
        .where({ citizenId: citizen.id })
        .andWhere("enteredAt", ">=", startOfToday)
        .orderBy("id", "desc")
        .first();

    if (isUndefined(lastStay)) return false; // citizen not entered today
    return !lastStay.leftAt;
}

/** The amount of time a citizen spent in the state today up until now
 *
 * 'Today' means only stays where enteredAt is in today are respected.
 *
 * @precondition The citizen exists.
 */
export async function getTimeInState(
    ctx: IAppContext,
    citizen: ICitizenUserModel
): Promise<number> {
    const { knex } = ctx;
    const now = formatDateTimeZ(new Date());
    const startOfToday = formatDateTimeZ(dateFns.startOfToday());
    const [{ timeInState }] = (await knex.raw(
        `select total(
            unixepoch(coalesce(stays.leftAt, :now)) - unixepoch(stays.enteredAt)
        ) as timeInState
        from stays
        where stays.citizenId = :citizenId
          and stays.enteredAt >= :startOfToday`,
        { now, startOfToday, citizenId: citizen.id }
    )) as [{ timeInState: number }];
    return timeInState;
}

export async function chargeCustoms(
    ctx: IAppContext,
    user: IUserSignature,
    customs: number
): Promise<ICustomsTransactionModel> {
    const { knex, config, session } = ctx;
    assertRole(ctx, session.userSignature, "BORDER_CONTROL");
    assert(customs > 0, "Zoll muss positiv sein.", "BAD_USER_INPUT");

    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        const userModel = await getUser({ ...ctx, knex: trx }, user);
        const updatedUser = await trx("bankAccounts")
            .decrement("balance", customs)
            .where("id", userModel.bankAccountId)
            .returning("balance");
        assert(
            updatedUser[0]!.balance >= 0,
            "Benutzer hat nicht genug Geld.",
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
            { customs, companyId: config.roles.borderControlCompanyId }
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
    ctx: IAppContext,
    citizenId: string
): Promise<IBorderCrossingModel> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "BORDER_CONTROL");

    return knex.transaction(async (trx) => {
        // check citizen exists
        const citizen = await getCitizen({ ...ctx, knex: trx }, citizenId);
        const isLeaving = await getIsInState({ ...ctx, knex: trx }, citizen);

        const returnQuery: Promise<IStay[]> = isLeaving
            ? trx.raw(
                  `UPDATE stays
                  SET leftAt = ?
                  WHERE citizenId = ?
                  RETURNING *`,
                  [formatDateTimeZ(new Date()), citizenId]
              )
            : trx.raw(
                  `INSERT INTO stays (citizenId, enteredAt)
                  VALUES (?, ?)
                  RETURNING *
                  `,
                  [citizenId, formatDateTimeZ(new Date())]
              );
        const stay = (await returnQuery)[0]!;

        return stay2BorderCrossing(stay);
    });
}

export function leaveAllCitizens(ctx: IAppContext): Promise<IStayModel[]> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "ADMIN");

    const now = formatDateTimeZ(new Date());
    return knex("stays")
        .update({ leftAt: now })
        .whereNull("leftAt")
        .returning("*");
}
