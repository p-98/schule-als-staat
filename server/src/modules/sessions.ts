import type { IAppContext } from "Server";

import { GraphQLYogaError } from "Util/error";
import type { IUserSignature, TUserModel } from "Types/models";
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
    ctx: IAppContext,
    id: string,
    userSignature: IUserSignature,
    password: TNullable<string>
): Promise<TUserModel> {
    const { knex } = ctx;
    const userModel = await getUser(ctx, userSignature);

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

export async function logout({ knex }: IAppContext, id: string): Promise<void> {
    const success = await knex("sessions")
        .update({ userSignature: null })
        .where({ id });
    if (!success)
        throw new GraphQLYogaError(`Session with id ${id} not found`, {
            code: "SESSION_NOT_FOUND",
        });
}
