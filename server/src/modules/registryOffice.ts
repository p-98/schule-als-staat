import { GraphQLYogaError } from "@graphql-yoga/node";
import { knex } from "Database";
import { ICitizenUserModel } from "Types/models";

export async function getCitizen(id: string): Promise<ICitizenUserModel> {
    const raw = await knex("citizens")
        .first()
        .where({ id })
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
