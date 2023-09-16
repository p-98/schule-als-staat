import type { IAppContext } from "Server";
import type { ICitizen, IBankAccount } from "Types/knex";

import { GraphQLYogaError } from "Util/error";
import { ICitizenUserModel } from "Types/models";

export async function getCitizen(
    { knex }: IAppContext,
    id: string
): Promise<ICitizenUserModel> {
    const raw = (await knex("citizens")
        // select order important, because both tables contain id field
        .select("bankAccounts.*", "citizens.*")
        .where("citizens.id", id)
        .innerJoin("bankAccounts", "citizens.bankAccountId", "bankAccounts.id")
        .first()) as (ICitizen & IBankAccount) | undefined;

    if (!raw)
        throw new GraphQLYogaError(`Citizen with id ${id} not found`, {
            code: "CITIZEN_NOT_FOUND",
        });

    return {
        type: "CITIZEN",
        ...raw,
    };
}
