import type { IAppContext } from "Server";
import type { ICitizen, IBankAccount } from "Types/knex";

import { assert } from "Util/error";
import { ICitizenUserModel } from "Types/models";
import { assertRole } from "Util/auth";
import { assign } from "lodash/fp";

/* Helper function
 */
const addType: (citizen: Omit<ICitizenUserModel, "type">) => ICitizenUserModel =
    assign({ type: "CITIZEN" } as const);

/* Query functions
 */

export async function getCitizen(
    { knex }: IAppContext,
    id: string
): Promise<ICitizenUserModel> {
    const raw = await knex("citizens")
        // select order important, because both tables contain id field
        .select<ICitizen & IBankAccount>("bankAccounts.*", "citizens.*")
        .where("citizens.id", id)
        .innerJoin("bankAccounts", "citizens.bankAccountId", "bankAccounts.id")
        .first();
    assert(!!raw, `Citizen with id ${id} not found`, "CITIZEN_NOT_FOUND");
    return addType(raw);
}

export async function getCitizensByClass(
    ctx: IAppContext,
    classs: string
): Promise<ICitizenUserModel[]> {
    const { session, knex } = ctx;
    assertRole(ctx, session.userSignature, "TEACHER", { allowAdmin: true });

    const raw = await knex("citizens")
        // select order important, because both tables contain id field
        .select<(ICitizen & IBankAccount)[]>("bankAccounts.*", "citizens.*")
        .where("citizens.class", classs)
        .innerJoin("bankAccounts", "citizens.bankAccountId", "bankAccounts.id");
    return raw.map(addType);
}
