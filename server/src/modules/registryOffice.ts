import type { IAppContext } from "Server";

import { GraphQLYogaError } from "Util/error";
import { ICitizenUserModel } from "Types/models";

export async function getCitizen(
    { knex }: IAppContext,
    id: string
): Promise<ICitizenUserModel> {
    const raw = await knex("citizens")
        .first()
        .where("citizens.id", id)
        .innerJoin("bankAccounts", "citizens.bankAccountId", "bankAccounts.id");

    if (!raw)
        throw new GraphQLYogaError(`Citizen with id ${id} not found`, {
            code: "CITIZEN_NOT_FOUND",
        });

    return {
        type: "CITIZEN",
        ...raw,
    };
}
