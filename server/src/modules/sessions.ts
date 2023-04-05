import { GraphQLYogaError } from "@graphql-yoga/node";
import type { IUserSignature, TUserModel } from "Types/models";
import { knex } from "Database";
import bcrypt from "bcrypt";
import { getUser } from "Modules/users";
import { TNullable } from "Types";
import { stringifyUserSignature } from "Util/parse";

export async function checkPassword(
    userModel: TUserModel,
    password: TNullable<string>
): Promise<boolean> {
    if (userModel.type === "GUEST") return true;
    if (password === null) return false;

    return bcrypt.compare(password, userModel.password);
}

export async function login(
    id: string,
    userSignature: IUserSignature,
    password: TNullable<string>
): Promise<TUserModel> {
    const userModel = await getUser(userSignature);

    if (!(await checkPassword(userModel, password)))
        throw new GraphQLYogaError("Invalid password", {
            code: "INVALID_PASSWORD",
        });

    const success = await knex("sessions")
        .update({
            userSignature: stringifyUserSignature(userSignature),
        })
        .where({ id });
    if (!success)
        throw new GraphQLYogaError(`Session with id ${id} not found`, {
            code: "SESSION_NOT_FOUND",
        });

    return userModel;
}

export async function logout(id: string): Promise<void> {
    const success = await knex("sessions")
        .update({ userSignature: null })
        .where({ id });
    if (!success)
        throw new GraphQLYogaError(`Session with id ${id} not found`, {
            code: "SESSION_NOT_FOUND",
        });
}
